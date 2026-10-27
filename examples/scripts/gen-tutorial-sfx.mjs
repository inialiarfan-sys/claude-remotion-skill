// Synthesizes the cute SFX kit + cheerful 100 BPM pluck loop for ClaudeTutorial.
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

// loop — cheerful marimba-ish plucks at 100 BPM, C G Am F, one bar per chord
{
  const DUR = 50.5;
  const N = secs(DUR);
  const out = new Float32Array(N);
  const beat = 60 / 100;
  const add = (start, dur, fn) => {
    const s0 = Math.floor(start * SR);
    const n = Math.floor(dur * SR);
    for (let i = 0; i < n && s0 + i < N; i++) out[s0 + i] += fn(i / SR);
  };
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const pluck = (t, midi, vel) => {
    const f = mtof(midi);
    add(t, 0.7, (ts) => {
      const env = Math.min(1, ts / 0.003) * Math.exp(-ts * 7);
      return (
        (Math.sin(2 * Math.PI * f * ts) +
          0.3 * Math.sin(2 * Math.PI * f * 4 * ts) * Math.exp(-ts * 25)) *
        env *
        vel
      );
    });
  };
  const bass = (t, midi) => {
    const f = mtof(midi);
    add(t, 0.55, (ts) => {
      const env = Math.min(1, ts / 0.01) * Math.exp(-ts * 4.5);
      return Math.sin(2 * Math.PI * f * ts) * env * 0.32;
    });
  };
  const shaker = (t) => add(t, 0.05, (ts) => rnd() * Math.exp(-ts * 90) * 0.05);
  // chord tones (midi), arpeggio pattern in eighths
  const chords = [
    [60, 64, 67, 72], // C
    [55, 59, 62, 67], // G
    [57, 60, 64, 69], // Am
    [53, 57, 60, 65], // F
  ];
  const pattern = [0, 1, 2, 3, 2, 1, 2, 3];
  const bars = Math.ceil(DUR / (beat * 4));
  for (let b = 0; b < bars; b++) {
    const c = chords[b % 4];
    const t0 = b * beat * 4;
    pattern.forEach((p, k) => {
      const vel = k % 2 === 0 ? 0.3 : 0.2;
      pluck(t0 + k * (beat / 2), c[p] + 12, vel);
    });
    bass(t0, c[0] - 12);
    bass(t0 + beat * 2, c[0] - 12);
    for (let k = 0; k < 4; k++) shaker(t0 + k * beat + beat / 2);
  }
  // fade in/out + normalize
  let peak = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    out[i] *= Math.min(1, t / 1.0) * Math.min(1, (DUR - t) / 2.0);
    peak = Math.max(peak, Math.abs(out[i]));
  }
  for (let i = 0; i < N; i++) out[i] *= 0.9 / peak;
  write("loop.wav", out);
}

console.log("Tutorial SFX written to", OUT);
