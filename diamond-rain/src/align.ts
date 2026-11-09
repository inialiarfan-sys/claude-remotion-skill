/**
 * Align script lines to the real narration.
 *
 * 1. detectSpeech(): find the pauses in the audio (|sample| below a threshold for
 *    at least `minSilence` seconds) and return the speech segments between them.
 * 2. alignLines(): dynamic programming that assigns each line one or more
 *    consecutive speech segments, so that segment lengths match the line's word
 *    count and line breaks fall on the longest pauses.
 *
 * Pure functions (no DOM), so they run in calculateMetadata and in Node tests.
 */
export type Segment = { start: number; end: number };

export const detectSpeech = (
  samples: Float32Array,
  sampleRate: number,
  { thresholdDb = -35, minSilence = 0.15, window = 0.01 } = {},
): Segment[] => {
  const thr = Math.pow(10, thresholdDb / 20);
  const win = Math.max(1, Math.round(window * sampleRate));
  const n = Math.floor(samples.length / win);
  const loud = new Uint8Array(n);
  for (let w = 0; w < n; w++) {
    let peak = 0;
    for (let i = w * win, e = i + win; i < e; i++) {
      const a = Math.abs(samples[i]);
      if (a > peak) peak = a;
    }
    loud[w] = peak > thr ? 1 : 0;
  }
  const minGap = Math.round(minSilence / window);
  const segs: Segment[] = [];
  let s = -1;
  let quiet = 0;
  for (let w = 0; w < n; w++) {
    if (loud[w]) {
      if (s < 0) s = w;
      quiet = 0;
    } else if (s >= 0) {
      quiet++;
      if (quiet >= minGap) {
        segs.push({ start: s * window, end: (w - quiet + 1) * window });
        s = -1;
        quiet = 0;
      }
    }
  }
  if (s >= 0) segs.push({ start: s * window, end: (n - quiet) * window });
  // drop clicks
  return segs.filter((g) => g.end - g.start > 0.06);
};

/** Returns [start, end] seconds per line, or null if the audio can't be matched. */
export const alignLines = (words: number[], segs: Segment[]): [number, number][] | null => {
  const N = words.length;
  const M = segs.length;
  if (M < N) return null;
  const speech = segs.reduce((a, g) => a + g.end - g.start, 0);
  const spw = speech / words.reduce((a, b) => a + b, 0);
  const MAXSPAN = 6;
  const INF = 1e18;
  const dp = Array.from({ length: N + 1 }, () => new Float64Array(M + 1).fill(INF));
  const bk = Array.from({ length: N + 1 }, () => new Int32Array(M + 1).fill(-1));
  dp[0][0] = 0;
  for (let i = 1; i <= N; i++) {
    const pred = words[i - 1] * spw + 0.12;
    for (let j = i; j <= M - (N - i); j++) {
      for (let k = j - 1; k >= Math.max(i - 1, j - MAXSPAN); k--) {
        const prev = dp[i - 1][k];
        if (prev >= INF) continue;
        const dur = segs[j - 1].end - segs[k].start;
        // gap before this line: reward breaking lines on long pauses
        const gap = k > 0 ? segs[k].start - segs[k - 1].end : 0.6;
        // gaps swallowed inside this line: penalise long ones
        let inner = 0;
        for (let q = k + 1; q < j; q++) inner += Math.max(0, segs[q].start - segs[q - 1].end - 0.25);
        const c = prev + ((dur - pred) * (dur - pred)) / Math.max(pred, 0.5) - 1.2 * gap + 2 * inner;
        if (c < dp[i][j]) {
          dp[i][j] = c;
          bk[i][j] = k;
        }
      }
    }
  }
  if (dp[N][M] >= INF) return null;
  const out: [number, number][] = new Array(N);
  let j = M;
  for (let i = N; i > 0; i--) {
    const k = bk[i][j];
    out[i - 1] = [segs[k].start, segs[j - 1].end];
    j = k;
  }
  return out;
};
