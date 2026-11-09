// Re-time whisper words against the real pauses in the narration.
// whisper.cpp word timestamps can drift by ~1 s. We detect the pauses in the audio,
// match each one (in order) to the most likely gap between two words (sentence/comma
// breaks preferred), then stretch whisper's timing between matched pauses so every
// stretch of speech lines up with the voice. Safe to re-run (uses rawStart/rawEnd).
//   node scripts/refine-timings.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'src', 'data', 'transcript.json');
const data = JSON.parse(readFileSync(file, 'utf8'));
const input = ['narration.mp3', 'narration.wav', 'narration.m4a'].map((f) => path.join(root, 'public', f)).find(existsSync);
const SR = 16000;
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const raw = execFileSync(npx, ['remotion', 'ffmpeg', '-v', 'error', '-i', input, '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', '-f', 'wav', '-'], {
  maxBuffer: 1 << 30,
  shell: process.platform === 'win32',
});
// skip the WAV header: samples start after the 'data' chunk id + size
const dataAt = raw.indexOf(Buffer.from('data')) + 8;
const body = raw.subarray(dataAt, dataAt + ((raw.length - dataAt) & ~1));
const pcm = new Int16Array(body.buffer.slice(body.byteOffset, body.byteOffset + body.length));
const duration = pcm.length / SR;

// silences: 10 ms windows whose peak is below -35 dBFS, lasting ≥ 0.2 s
const thr = Math.pow(10, -35 / 20) * 32768;
const win = SR / 100;
const quiet = [];
for (let i = 0; i + win <= pcm.length; i += win) {
  let p = 0;
  for (let j = i; j < i + win; j++) p = Math.max(p, Math.abs(pcm[j]));
  quiet.push(p < thr);
}
const gaps = [];
for (let w = 0; w < quiet.length; ) {
  if (!quiet[w]) { w++; continue; }
  let e = w;
  while (e < quiet.length && quiet[e]) e++;
  if ((e - w) / 100 >= 0.2) gaps.push([w / 100, e / 100]);
  w = e;
}
// ---- 1. candidate word boundaries (between word b and b+1), from whisper's raw times
const W = data.words;
for (const w of W) {
  w.rawStart ??= w.start;
  w.rawEnd ??= w.end;
}
const bounds = [];
for (let b = 0; b < W.length - 1; b++) {
  const t = (W[b].rawEnd + W[b + 1].rawStart) / 2;
  const punct = /[.?!]$/.test(W[b].text) ? 0.9 : /[,;:]$/.test(W[b].text) ? 0.45 : 0;
  bounds.push({ b, t, punct });
}
// usable pauses: inside the speech (not leading/trailing silence)
const speechStart = W[0].rawStart;
const pauses = gaps.filter(([a, e]) => a > 0.05 && e < duration - 0.05);

// ---- 2. monotonic matching pauses ↔ boundaries (DP). Unmatched pauses cost a little.
const P = pauses.length;
const B = bounds.length;
const MAXOFF = 2.0;
const SKIP = 0.7;
const INF = 1e9;
const dp = Array.from({ length: P + 1 }, () => new Float64Array(B + 1).fill(INF));
const bk = Array.from({ length: P + 1 }, () => new Int32Array(B + 1).fill(-1));
for (let j = 0; j <= B; j++) dp[0][j] = 0;
for (let i = 1; i <= P; i++) {
  const mid = (pauses[i - 1][0] + pauses[i - 1][1]) / 2;
  let best = INF;
  let bestJ = -1;
  for (let j = 0; j <= B; j++) {
    // option A: skip this pause
    if (dp[i - 1][j] + SKIP < dp[i][j]) {
      dp[i][j] = dp[i - 1][j] + SKIP;
      bk[i][j] = -2;
    }
    // option B: match pause i to boundary j (1-based); previous match must use a boundary < j
    if (j >= 1) {
      const d = Math.abs(bounds[j - 1].t - mid);
      if (d <= MAXOFF && best < INF) {
        const c = best + d - bounds[j - 1].punct;
        if (c < dp[i][j]) {
          dp[i][j] = c;
          bk[i][j] = bestJ;
        }
      }
    }
    // running min over dp[i-1][0..j] for the next j
    if (dp[i - 1][j] < best) {
      best = dp[i - 1][j];
      bestJ = j;
    }
  }
}
// backtrack
let j = 0;
for (let q = 1; q <= B; q++) if (dp[P][q] < dp[P][j]) j = q;
const matches = []; // [pauseIndex, boundaryIndex]
for (let i = P; i > 0; i--) {
  const k = bk[i][j];
  if (k === -2) continue; // pause skipped, same j
  matches.push([i - 1, j - 1]);
  j = k;
}
matches.reverse();

// ---- 3. piecewise-linear warp of whisper time between matched anchors
// anchor k: whisper boundary time tb ↔ real pause [gs, ge]
const anchors = matches.map(([pi, bi]) => ({ b: bounds[bi].b, tb: bounds[bi].t, gs: pauses[pi][0], ge: pauses[pi][1] }));
const firstReal = (gaps[0] && gaps[0][0] <= 0.05 ? gaps[0][1] : 0) || speechStart;
const lastGap = gaps[gaps.length - 1];
const lastReal = lastGap && lastGap[1] >= duration - 0.05 ? lastGap[0] : duration;
const pieces = [];
let prev = { b: -1, tb: W[0].rawStart, realStart: Math.max(0, firstReal) };
for (const a of anchors) {
  pieces.push({ from: prev.b + 1, to: a.b, w0: prev.tb, w1: a.tb, r0: prev.realStart, r1: a.gs });
  prev = { b: a.b, tb: a.tb, realStart: a.ge };
}
pieces.push({ from: prev.b + 1, to: W.length - 1, w0: prev.tb, w1: W[W.length - 1].rawEnd, r0: prev.realStart, r1: lastReal });
for (const p of pieces) {
  const map = (t) => p.r0 + ((t - p.w0) / Math.max(1e-3, p.w1 - p.w0)) * (p.r1 - p.r0);
  for (let k = p.from; k <= p.to; k++) {
    W[k].start = +Math.max(p.r0, map(W[k].rawStart)).toFixed(3);
    W[k].end = +Math.min(p.r1, Math.max(map(W[k].rawEnd), W[k].start + 0.05)).toFixed(3);
  }
}
let moved = 0;
for (const w of W) if (Math.abs(w.start - w.rawStart) > 0.15) moved++;
data.duration = +duration.toFixed(3);
data.refined = { pauses: pauses.length, anchored: anchors.length, moved };
writeFileSync(file, JSON.stringify(data, null, 1));
console.log(`Refined timings: ${anchors.length}/${pauses.length} pauses anchored, ${moved} words moved >0.15s. Audio ${duration.toFixed(2)}s`);
