// Synthesizes the score and sound effects (deterministic, no downloads):
//   public/audio/score.wav    ~5 min ambient space pad: detuned chords, sub drone,
//                             soft pulse, bell shimmer, cheap reverb
//   public/audio/whoosh.wav   scene transition
//   public/audio/boom.wav     big moments (title, crystallisation, lab flash)
//   public/audio/sparkle.wav  diamonds appearing
//   public/audio/riser.wav    build-up before a hit
//   public/audio/laser.wav    accent
//   public/audio/pop.wav      cute pop (bubbles, numbers)
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio');
mkdirSync(OUT, { recursive: true });
const force = process.argv.includes('--force');
const SR = 32000;
const TAU = Math.PI * 2;

let seed = 7;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const noise = () => rnd() * 2 - 1;

const wav = (name, data, gain = 0.9) => {
  let peak = 1e-9;
  for (const x of data) peak = Math.max(peak, Math.abs(x));
  const g = gain / peak;
  const n = data.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, data[i] * g)) * 32767), 44 + i * 2);
  writeFileSync(join(OUT, name), buf);
  console.log('wrote', name, (n / SR).toFixed(1) + 's');
};

/** Simple Schroeder reverb (4 combs + 2 allpasses). */
const reverb = (x, mix = 0.35, size = 1) => {
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d: Math.round(d * size * (SR / 44100)), buf: null, i: 0 }));
  for (const c of combs) c.buf = new Float32Array(c.d);
  const aps = [225, 556].map((d) => ({ d: Math.round(d * (SR / 44100)), buf: null, i: 0 }));
  for (const a of aps) a.buf = new Float32Array(a.d);
  const y = new Float32Array(x.length);
  for (let n = 0; n < x.length; n++) {
    let s = 0;
    for (const c of combs) {
      const o = c.buf[c.i];
      c.buf[c.i] = x[n] + o * 0.86;
      c.i = (c.i + 1) % c.d;
      s += o;
    }
    s *= 0.25;
    for (const a of aps) {
      const o = a.buf[a.i];
      const v = s + o * 0.5;
      a.buf[a.i] = v;
      a.i = (a.i + 1) % a.d;
      s = o - v * 0.5;
    }
    y[n] = x[n] * (1 - mix) + s * mix;
  }
  return y;
};

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---------------------------------------------------------------- score
if (force || !existsSync(join(OUT, 'score.wav'))) {
  const DUR = 300;
  const N = SR * DUR;
  const pad = new Float32Array(N);
  const bells = new Float32Array(N);
  // Am(add9) – Fmaj7 – Cmaj7/E – Gsus2, 12 s each (MIDI notes)
  const chords = [
    [45, 52, 57, 60, 64, 71],
    [41, 48, 57, 60, 64, 69],
    [40, 48, 55, 59, 64, 67],
    [43, 50, 55, 57, 62, 69],
  ];
  const LEN = 12;
  const XF = 4;
  for (let c = 0; c * LEN < DUR; c++) {
    const notes = chords[c % chords.length];
    const t0 = c * LEN - XF / 2;
    const s0 = Math.max(0, Math.floor(t0 * SR));
    const s1 = Math.min(N, Math.floor((t0 + LEN + XF) * SR));
    for (let i = s0; i < s1; i++) {
      const t = i / SR;
      const lt = t - t0;
      const env = Math.min(1, lt / XF) * Math.min(1, (LEN + XF - lt) / XF);
      let v = 0;
      for (let k = 0; k < notes.length; k++) {
        const f = hz(notes[k]);
        const lfo = 1 + 0.25 * Math.sin(TAU * (0.05 + k * 0.013) * t + k);
        v +=
          (Math.sin(TAU * f * t) + Math.sin(TAU * f * 1.004 * t + 1) * 0.8 + Math.sin(TAU * f * 2.001 * t) * 0.18) *
          lfo *
          (k === 0 ? 0.9 : 0.45);
      }
      pad[i] += v * env * 0.12;
    }
  }
  // sub drone + slow heartbeat pulse
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    pad[i] += Math.sin(TAU * 55 * t) * 0.18 * (0.7 + 0.3 * Math.sin(TAU * 0.03 * t));
    const beat = t % 2.4;
    pad[i] += Math.sin(TAU * (52 - 18 * Math.min(1, beat * 6)) * beat) * Math.exp(-beat * 9) * 0.22;
  }
  // bell shimmer: sparse pentatonic notes from the current chord, high octave
  for (let t = 1; t < DUR - 2; t += 0.6 + rnd() * 1.4) {
    const notes = chords[Math.floor(t / LEN) % chords.length];
    const f = hz(notes[2 + Math.floor(rnd() * 4)] + 24);
    const s0 = Math.floor(t * SR);
    const amp = 0.05 + rnd() * 0.06;
    for (let i = 0; i < SR * 2.5 && s0 + i < N; i++) {
      const lt = i / SR;
      bells[s0 + i] += (Math.sin(TAU * f * lt) + 0.3 * Math.sin(TAU * f * 2.76 * lt)) * Math.exp(-lt * 2.2) * amp;
    }
  }
  const wet = reverb(bells, 0.6, 1.3);
  const padWet = reverb(pad, 0.3, 1.1);
  const mix = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const fade = Math.min(1, t / 3) * Math.min(1, (DUR - t) / 4);
    mix[i] = (padWet[i] + wet[i]) * fade;
  }
  wav('score.wav', mix, 0.8);
}

// ---------------------------------------------------------------- sfx
const make = (dur, fn) => {
  const n = Math.floor(dur * SR);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = fn(i / SR, i / n);
  return a;
};
const lowpass = (x, cutoff) => {
  // cutoff(t) in Hz
  const y = new Float32Array(x.length);
  let s = 0;
  for (let i = 0; i < x.length; i++) {
    const a = 1 - Math.exp((-TAU * cutoff(i / SR)) / SR);
    s += a * (x[i] - s);
    y[i] = s;
  }
  return y;
};

if (force || !existsSync(join(OUT, 'pop.wav'))) {
  const n = make(1.4, () => noise());
  const f = lowpass(n, (t) => 300 + 5000 * Math.sin(Math.PI * Math.min(1, t / 1.4)) ** 2);
  wav('whoosh.wav', reverb(make(1.4, (t, p) => f[Math.floor(t * SR)] * Math.sin(Math.PI * p) ** 1.5), 0.3), 0.8);

  const boom = make(3.5, (t, p) => {
    const fr = 70 - 40 * Math.min(1, t * 2);
    return Math.sin(TAU * fr * t) * Math.exp(-t * 1.6) + noise() * Math.exp(-t * 10) * 0.4;
  });
  wav('boom.wav', reverb(lowpass(boom, () => 1800), 0.4, 1.4), 0.9);

  const sp = new Float32Array(Math.floor(2.5 * SR));
  for (let k = 0; k < 9; k++) {
    const f = hz([84, 88, 91, 93, 96, 100, 103, 105, 108][k]);
    const s0 = Math.floor(k * 0.06 * SR);
    for (let i = 0; s0 + i < sp.length; i++) {
      const t = i / SR;
      sp[s0 + i] += Math.sin(TAU * f * t) * Math.exp(-t * 3.5) * 0.3;
    }
  }
  wav('sparkle.wav', reverb(sp, 0.55, 1.2), 0.7);

  const riser = make(2.2, (t, p) => noise() * p ** 2.2 + Math.sin(TAU * (200 + 600 * p * p) * t) * p ** 3 * 0.3);
  wav('riser.wav', lowpass(riser, (t) => 400 + 6000 * (t / 2.2) ** 2), 0.7);

  const laser = make(1.6, (t, p) => {
    const f = 900 - 500 * Math.exp(-t * 6);
    return (Math.sin(TAU * f * t) * 0.5 + Math.sin(TAU * f * 1.5 * t) * 0.2) * Math.min(1, t * 30) * Math.exp(-p * 2.5);
  });
  wav('laser.wav', reverb(laser, 0.3), 0.6);

  const pop = make(0.35, (t, p) => Math.sin(TAU * (520 + 900 * Math.exp(-t * 30)) * t) * Math.exp(-t * 18));
  wav('pop.wav', reverb(pop, 0.15), 0.6);
}
