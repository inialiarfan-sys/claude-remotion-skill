// Synthesizes the cute SFX kit + bouncy 120 BPM loop for ClaudeTutorial.
// 16-bit mono WAVs into public/sfx/tutorial/ — deterministic, no downloads.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "sfx",
  "tutorial",
);
mkdirSync(OUT, { recursive: true });

function wav(samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buf;
}

const secs = (s) => Math.round(s * SR);
// deterministic noise
let seed = 7;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed / 2147483647) * 2 - 1;
};
const write = (name, out) => writeFileSync(join(OUT, name), wav(out));

// pop — cute bubble pop: fast pitch drop with a soft click attack
{
  const N = secs(0.09);
  const out = new Float32Array(N);
  let phase = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const f = 1250 * Math.pow(0.4, t); // 1250 -> 500 Hz
    phase += (2 * Math.PI * f) / SR;
    const attack = Math.min(1, i / secs(0.003));
    out[i] = Math.sin(phase) * attack * Math.exp(-t * 5) * 0.75;
  }
  write("pop.wav", out);
}

// boop — soft rounded click for buttons, slight upward glide
{
  const N = secs(0.13);
  const out = new Float32Array(N);
  let phase = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const f = 620 + 240 * Math.sqrt(t);
    phase += (2 * Math.PI * f) / SR;
    const env = Math.min(1, i / secs(0.006)) * Math.exp(-t * 6);
    out[i] = (Math.sin(phase) + 0.2 * Math.sin(phase * 2)) * env * 0.6;
  }
  write("boop.wav", out);
}

// type — tiny keyboard tick: filtered noise burst + high blip
{
  const N = secs(0.03);
  const out = new Float32Array(N);
  let phase = 0;
  let hp = 0;
  let prev = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const n = rnd();
    hp = 0.7 * (hp + n - prev); // crude highpass
    prev = n;
    phase += (2 * Math.PI * 2600) / SR;
    out[i] = (hp * 0.5 + Math.sin(phase) * 0.35) * Math.exp(-t * 12) * 0.5;
  }
  write("type.wav", out);
}

// sparkle — rising bell arpeggio C6 E6 G6 C7
{
  const N = secs(1.0);
  const out = new Float32Array(N);
  const notes = [1046.5, 1318.5, 1568, 2093];
  notes.forEach((f, k) => {
    const s0 = secs(k * 0.06);
    for (let i = 0; s0 + i < N; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.002) * Math.exp(-t * 5.5);
      const v =
        Math.sin(2 * Math.PI * f * t) +
        0.35 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 9);
      out[s0 + i] += v * env * 0.22;
    }
  });
  write("sparkle.wav", out);
}

// whoosh — soft lowpassed noise swell for scene changes
{
  const N = secs(0.35);
  const out = new Float32Array(N);
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const env = Math.sin(Math.PI * Math.pow(t, 0.7)) ** 2;
    const cutoff = 0.03 + 0.18 * Math.sin(Math.PI * t);
    lp += cutoff * (rnd() - lp);
    out[i] = lp * env * 0.8;
  }
  write("whoosh.wav", out);
}

// blips — babble voice for speech-bubble words, three pitches
for (const [name, f0] of [
  ["blip1.wav", 560],
  ["blip2.wav", 660],
  ["blip3.wav", 780],
]) {
  const N = secs(0.075);
  const out = new Float32Array(N);
  let phase = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const f = f0 * (1 + 0.12 * Math.sin(Math.PI * t)); // little "mew" bend
    phase += (2 * Math.PI * f) / SR;
    const env = Math.min(1, i / secs(0.004)) * Math.exp(-t * 4);
    out[i] =
      (Math.sin(phase) + 0.35 * Math.sin(phase * 2) + 0.12 * Math.sin(phase * 3)) *
      env *
      0.5;
  }
  write(name, out);
}

// boing — springy wobble for hops
{
  const N = secs(0.45);
  const out = new Float32Array(N);
  let phase = 0;
  for (let i = 0; i < N; i++) {
    const ts = i / SR;
    const f = 260 + 140 * Math.sin(2 * Math.PI * 11 * ts) * Math.exp(-ts * 5) + 160 * ts;
    phase += (2 * Math.PI * f) / SR;
    const env = Math.min(1, ts / 0.005) * Math.exp(-ts * 7);
    out[i] = Math.sin(phase) * env * 0.6;
  }
  write("boing.wav", out);
}

// thump — punchy bass hit for cuts and impacts
{
  const N = secs(0.45);
  const out = new Float32Array(N);
  let phase = 0;
  for (let i = 0; i < N; i++) {
    const ts = i / SR;
    const f = 48 + 110 * Math.exp(-ts * 30);
    phase += (2 * Math.PI * f) / SR;
    const click = ts < 0.004 ? rnd() * 0.5 : 0;
    out[i] = (Math.tanh(Math.sin(phase) * 1.6) * Math.exp(-ts * 7) + click) * 0.85;
  }
  write("thump.wav", out);
}

// riser — noise + tone sweeping up into a cut
{
  const DUR = 0.75;
  const N = secs(DUR);
  const out = new Float32Array(N);
  let phase = 0;
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const f = 260 * Math.pow(5, t);
    phase += (2 * Math.PI * f) / SR;
    lp += (0.02 + 0.5 * t * t) * (rnd() - lp);
    const env = Math.pow(t, 1.6) * Math.min(1, (1 - t) / 0.04);
    out[i] = (lp * 0.7 + Math.sin(phase) * 0.25) * env * 0.8;
  }
  write("riser.wav", out);
}

// swish — quick airy swipe for cards flying in
{
  const N = secs(0.2);
  const out = new Float32Array(N);
  let lp = 0;
  let prev = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const n = rnd();
    lp += (0.15 + 0.5 * Math.sin(Math.PI * t)) * (n - lp);
    const hp = lp - prev;
    prev = lp;
    out[i] = (hp * 2.2 + lp * 0.3) * Math.sin(Math.PI * t) ** 2 * 0.7;
  }
  write("swish.wav", out);
}

// loop — bouncy 120 BPM: plucked arps, bass, soft kick + clap, C G Am F.
// One bar (2s) per chord; cuts at 4s / 16s / 42s land on downbeats.
{
  const DUR = 50.5;
  const N = secs(DUR);
  const out = new Float32Array(N);
  const beat = 60 / 120;
  const add = (start, dur, fn) => {
    const s0 = Math.floor(start * SR);
    const n = Math.floor(dur * SR);
    for (let i = 0; i < n && s0 + i < N; i++) out[s0 + i] += fn(i / SR);
  };
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const pluck = (t, midi, vel, decay = 8) => {
    const f = mtof(midi);
    add(t, 0.6, (ts) => {
      const env = Math.min(1, ts / 0.003) * Math.exp(-ts * decay);
      return (
        (Math.sin(2 * Math.PI * f * ts) +
          0.3 * Math.sin(2 * Math.PI * f * 4 * ts) * Math.exp(-ts * 25)) *
        env *
        vel
      );
    });
  };
  const bass = (t, midi, vel = 0.34) => {
    const f = mtof(midi);
    add(t, 0.4, (ts) => {
      const env = Math.min(1, ts / 0.008) * Math.exp(-ts * 6);
      return Math.tanh(Math.sin(2 * Math.PI * f * ts) * 1.4) * env * vel;
    });
  };
  const kick = (t) =>
    add(t, 0.22, (ts) => {
      const f = 45 + 90 * Math.exp(-ts * 35);
      return Math.sin(2 * Math.PI * f * ts) * Math.exp(-ts * 14) * 0.55;
    });
  let lpC = 0;
  const clap = (t) =>
    add(t, 0.14, (ts) => {
      lpC += 0.45 * (rnd() - lpC);
      const env = Math.exp(-ts * 28) + 0.6 * Math.exp(-Math.max(0, ts - 0.012) * 40) * (ts > 0.012 ? 1 : 0);
      return lpC * env * 0.22;
    });
  const shaker = (t, v = 0.05) =>
    add(t, 0.04, (ts) => rnd() * Math.exp(-ts * 110) * v);
  const chords = [
    [60, 64, 67, 72], // C
    [55, 59, 62, 67], // G
    [57, 60, 64, 69], // Am
    [53, 57, 60, 65], // F
  ];
  const pattern = [0, 1, 2, 3, 2, 1, 2, 3];
  const motif = [3, -1, 2, -1, 1, -1, 2, 0]; // bell answer, -1 = rest
  const bars = Math.ceil(DUR / (beat * 4));
  for (let b = 0; b < bars; b++) {
    const ch = chords[b % 4];
    const t0 = b * beat * 4;
    const drums = t0 >= 4 - 1e-6; // drums drop in on the first cut
    pattern.forEach((p, k) => {
      const vel = k % 2 === 0 ? 0.26 : 0.17;
      pluck(t0 + k * (beat / 2), ch[p] + 12, vel);
    });
    if (b % 2 === 1 && drums) {
      motif.forEach((m, k) => {
        if (m >= 0) pluck(t0 + k * (beat / 2), ch[m] + 24, 0.1, 5);
      });
    }
    bass(t0, ch[0] - 12);
    bass(t0 + beat * 1.5, ch[0]);
    bass(t0 + beat * 2, ch[0] - 12);
    bass(t0 + beat * 3.5, ch[0]);
    if (drums) {
      for (let k = 0; k < 4; k++) kick(t0 + k * beat);
      clap(t0 + beat);
      clap(t0 + beat * 3);
    }
    for (let k = 0; k < 8; k++) shaker(t0 + k * (beat / 2) + beat / 4, k % 2 ? 0.06 : 0.035);
  }
  // fade in/out + normalize
  let peak = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    out[i] *= Math.min(1, t / 0.6) * Math.min(1, (DUR - t) / 1.8);
    peak = Math.max(peak, Math.abs(out[i]));
  }
  for (let i = 0; i < N; i++) out[i] *= 0.9 / peak;
  write("loop.wav", out);
}

console.log("Tutorial SFX written to", OUT);
