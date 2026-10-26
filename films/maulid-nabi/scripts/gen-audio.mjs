// Synthesizes the film's restrained ambient sound kit as 16-bit mono WAVs.
// No speech, no music, no downloads: wind, night insects, paper, stone, flame.
// Seeded, so every run produces identical files.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "audio");
mkdirSync(OUT, { recursive: true });

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(570);
const white = () => rand() * 2 - 1;
const secs = (s) => Math.round(s * SR);

function wav(name, samples, peak = 0.8) {
  let max = 1e-9;
  for (const s of samples) max = Math.max(max, Math.abs(s));
  const g = peak / max;
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
    const s = Math.max(-1, Math.min(1, samples[i] * g));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  writeFileSync(join(OUT, name), buf);
  console.log("wrote audio/" + name);
}

// RBJ biquad; coefficients can be updated per sample for sweeps
function biquad() {
  let b0 = 1, b1 = 0, b2 = 0, a1 = 0, a2 = 0, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const f = (x) => {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
  f.set = (type, freq, q) => {
    const w = (2 * Math.PI * Math.min(freq, SR * 0.45)) / SR;
    const al = Math.sin(w) / (2 * q);
    const c = Math.cos(w);
    let n0, n1, n2;
    if (type === "lp") { n0 = (1 - c) / 2; n1 = 1 - c; n2 = (1 - c) / 2; }
    else if (type === "hp") { n0 = (1 + c) / 2; n1 = -(1 + c); n2 = (1 + c) / 2; }
    else { n0 = al; n1 = 0; n2 = -al; } // band-pass, constant peak gain
    const d0 = 1 + al;
    b0 = n0 / d0; b1 = n1 / d0; b2 = n2 / d0; a1 = (-2 * c) / d0; a2 = (1 - al) / d0;
    return f;
  };
  return f;
}

// make a buffer loop seamlessly by crossfading its tail into its head
function loopify(buf, fadeS = 1.2) {
  const F = secs(fadeS);
  const out = buf.slice(0, buf.length - F);
  for (let i = 0; i < F; i++) {
    const t = i / F;
    out[i] = buf[i] * Math.sqrt(t) + buf[buf.length - F + i] * Math.sqrt(1 - t);
  }
  return out;
}

// slow smooth random modulator (0..1)
function lfo(rate) {
  let cur = rand(), next = rand(), phase = 0;
  return () => {
    phase += rate / SR;
    if (phase >= 1) { phase -= 1; cur = next; next = rand(); }
    const t = phase * phase * (3 - 2 * phase);
    return cur + (next - cur) * t;
  };
}

// ---------- beds (loops) ----------

// desert wind: band-limited noise with slow gusts and a moving resonance
{
  const N = secs(21.2);
  const out = new Float32Array(N);
  const lp = biquad(), bp = biquad();
  const gust = lfo(0.18), tone = lfo(0.11);
  for (let i = 0; i < N; i++) {
    const g = gust();
    if (i % 64 === 0) {
      lp.set("lp", 380 + 900 * g, 0.7);
      bp.set("bp", 500 + 1100 * tone(), 3.5);
    }
    const n = white();
    out[i] = lp(n) * (0.35 + 0.65 * g) + bp(n) * 0.18 * g * g;
  }
  wav("wind_loop.wav", loopify(out), 0.7);
}

// night insects: sparse soft chirp trains, two voices
{
  const N = secs(13.2);
  const out = new Float32Array(N);
  const voices = [
    { f: 4300, period: 0.9, jitter: 0.5, amp: 0.5 },
    { f: 5100, period: 1.4, jitter: 0.8, amp: 0.3 },
  ];
  for (const v of voices) {
    let t = rand() * v.period;
    while (t < 13.2 - 0.3) {
      const pulses = 2 + Math.floor(rand() * 3);
      for (let p = 0; p < pulses; p++) {
        const start = secs(t + p * 0.045);
        const len = secs(0.028);
        for (let i = 0; i < len && start + i < N; i++) {
          const e = Math.sin((Math.PI * i) / len) ** 2;
          out[start + i] += Math.sin((2 * Math.PI * v.f * i) / SR) * e * v.amp;
        }
      }
      t += v.period + rand() * v.jitter;
    }
  }
  wav("insects_loop.wav", loopify(out, 0.6), 0.5);
}

// sacred flame: a low breathy roar plus irregular soft crackles
{
  const N = secs(11.2);
  const out = new Float32Array(N);
  const lp = biquad().set("lp", 420, 0.7);
  const flick = lfo(2.5);
  for (let i = 0; i < N; i++) out[i] = lp(white()) * (0.5 + 0.5 * flick()) * 0.9;
  const hp = biquad().set("hp", 1800, 0.7);
  let t = 0;
  while (t < 11) {
    const start = secs(t);
    const len = secs(0.004 + rand() * 0.012);
    const a = 0.2 + rand() * 0.6;
    for (let i = 0; i < len; i++) out[start + i] += hp(white()) * a * (1 - i / len);
    t += 0.03 + rand() * 0.25;
  }
  wav("fire_loop.wav", loopify(out, 0.8), 0.6);
}

// ---------- one-shots ----------

// paper crinkle core: noise through a resonant band with fluttering amplitude
function crinkle(N, centre, flutterHz, env) {
  const out = new Float32Array(N);
  const bp = biquad(), bp2 = biquad();
  let flutter = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    if (i % 32 === 0) {
      bp.set("bp", centre * (0.7 + 0.6 * t), 1.2);
      bp2.set("bp", centre * 2.6, 2.5);
    }
    if (rand() < flutterHz / SR) flutter = 0.4 + rand() * 0.6;
    flutter *= 0.9994;
    const n = white();
    out[i] = (bp(n) + bp2(n) * 0.5 * flutter) * env(t) * (0.55 + flutter * 0.6);
  }
  return out;
}

// page turn: rising swish then soft settle
wav("page_turn.wav", crinkle(secs(1.0), 1400, 60, (t) => Math.sin(Math.PI * Math.pow(t, 0.6)) ** 2), 0.55);

// paper unfold: drier, more crackly
wav("paper_unfold.wav", crinkle(secs(0.9), 2200, 140, (t) => Math.sin(Math.PI * Math.pow(t, 0.5)) * (1 - t * 0.4)), 0.45);

// paper slide: long soft low swish (world emerging from the page)
{
  const N = secs(1.8);
  const out = new Float32Array(N);
  const bp = biquad();
  for (let i = 0; i < N; i++) {
    const t = i / N;
    if (i % 32 === 0) bp.set("bp", 300 + 1200 * Math.sin(Math.PI * t), 0.9);
    out[i] = bp(white()) * Math.sin(Math.PI * Math.pow(t, 0.7)) ** 2;
  }
  wav("paper_slide.wav", out, 0.5);
}

// cover open: board/leather creak (stick-slip impulses) + page air
{
  const N = secs(1.8);
  const out = crinkle(N, 900, 25, (t) => Math.sin(Math.PI * t) ** 2 * 0.5);
  const r1 = biquad().set("bp", 310, 9), r2 = biquad().set("bp", 760, 7);
  let phase = 0;
  for (let i = 0; i < secs(1.1); i++) {
    const t = i / secs(1.1);
    phase += (28 + 40 * Math.sin(Math.PI * t) + rand() * 6) / SR;
    let imp = 0;
    if (phase >= 1) { phase -= 1; imp = 0.6 + rand() * 0.4; }
    const e = Math.sin(Math.PI * t);
    out[i] += (r1(imp) * 3 + r2(imp) * 2) * e;
  }
  wav("cover_open.wav", out, 0.6);
}

// architectural creak: slower, deeper stick-slip
{
  const N = secs(2.6);
  const out = new Float32Array(N);
  const r1 = biquad().set("bp", 180, 12), r2 = biquad().set("bp", 430, 10), r3 = biquad().set("bp", 950, 8);
  let phase = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    phase += (14 + 30 * Math.sin(Math.PI * t * 1.3) ** 2 + rand() * 4) / SR;
    let imp = 0;
    if (phase >= 1) { phase -= 1; imp = 0.5 + rand() * 0.5; }
    const e = Math.sin(Math.PI * Math.pow(t, 0.8));
    out[i] = (r1(imp) * 3 + r2(imp) * 1.6 + r3(imp) * 0.6) * e;
  }
  wav("creak.wav", out, 0.5);
}

// distant low rumble: soft, no impact transient
{
  const N = secs(4.0);
  const out = new Float32Array(N);
  const lp = biquad().set("lp", 110, 0.8), lp2 = biquad().set("lp", 110, 0.8);
  const wob = lfo(7);
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const e = Math.sin(Math.PI * Math.pow(t, 0.5)) ** 2;
    out[i] = lp2(lp(white())) * e * (0.6 + 0.4 * wob());
  }
  wav("rumble.wav", out, 0.6);
}

// small stone fragments settling: a handful of soft resonant taps
{
  const N = secs(1.6);
  const out = new Float32Array(N);
  let t = 0.02;
  while (t < 1.3) {
    const start = secs(t);
    const f = 900 + rand() * 1600;
    const len = secs(0.05 + rand() * 0.07);
    const a = 0.3 + rand() * 0.7;
    const bp = biquad().set("bp", f, 6);
    for (let i = 0; i < len; i++) out[start + i] += bp(white()) * a * Math.exp((-i / len) * 6);
    t += 0.05 + rand() * 0.22;
  }
  wav("debris.wav", out, 0.4);
}

// flame going out: a breath of air that narrows and fades
{
  const N = secs(1.8);
  const out = new Float32Array(N);
  const bp = biquad(), lp = biquad();
  for (let i = 0; i < N; i++) {
    const t = i / N;
    if (i % 32 === 0) {
      bp.set("bp", 2600 - 1800 * t, 1.1);
      lp.set("lp", 1600 - 1200 * t, 0.7);
    }
    const n = white();
    const e = Math.min(1, t * 12) * Math.exp(-t * 3.2);
    out[i] = (bp(n) * 0.7 + lp(n) * 0.5) * e;
  }
  wav("extinguish.wav", out, 0.45);
}

// soft footsteps on sand: four muffled crunches
{
  const N = secs(3.0);
  const out = new Float32Array(N);
  [0.15, 0.82, 1.5, 2.16].forEach((t, k) => {
    const start = secs(t);
    const len = secs(0.22);
    const lp = biquad().set("lp", 700 + rand() * 300, 0.7);
    const bp = biquad().set("bp", 2400, 1.5);
    const a = 0.7 + 0.3 * (k % 2);
    for (let i = 0; i < len; i++) {
      const tt = i / len;
      const e = Math.min(1, tt * 20) * Math.exp(-tt * 5);
      const n = white();
      out[start + i] += (lp(n) * 1.2 + bp(n) * 0.25 * (rand() < 0.3 ? 1 : 0.2)) * e * a;
    }
  });
  wav("footsteps.wav", out, 0.35);
}

// dawn birds: a few short, high, gentle chirps
{
  const N = secs(7);
  const out = new Float32Array(N);
  const calls = [0.4, 0.62, 2.1, 2.28, 2.5, 4.3, 5.6, 5.78];
  for (const t of calls) {
    const start = secs(t + rand() * 0.05);
    const len = secs(0.07 + rand() * 0.05);
    const f0 = 3200 + rand() * 900;
    const f1 = f0 + 900 + rand() * 1200;
    let ph = 0;
    for (let i = 0; i < len; i++) {
      const tt = i / len;
      const f = f0 + (f1 - f0) * Math.sin((Math.PI / 2) * tt) + Math.sin(tt * 60) * 120;
      ph += (2 * Math.PI * f) / SR;
      out[start + i] += Math.sin(ph) * Math.sin(Math.PI * tt) ** 2 * 0.5;
    }
  }
  wav("dawn_birds.wav", out, 0.35);
}

// book closing: soft board thump + puff of air
{
  const N = secs(1.4);
  const out = new Float32Array(N);
  let ph = 0;
  const lp = biquad().set("lp", 900, 0.7);
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const f = 85 - 30 * t;
    ph += (2 * Math.PI * f) / SR;
    out[i] = Math.sin(ph) * Math.exp(-t * 9) * 0.9 + lp(white()) * Math.exp(-t * 6) * 0.35;
  }
  wav("book_close.wav", out, 0.55);
}

// ---------- Chapter 1 additions ----------

// struck bell: inharmonic partials with exponential decay
function bell(out, start, f, amp, decay = 2.2) {
  const partials = [
    [1, 1],
    [2.76, 0.45],
    [5.4, 0.22],
    [8.93, 0.1],
  ];
  const len = Math.min(out.length - start, secs(1.6));
  for (const [ratio, a] of partials) {
    let ph = rand() * Math.PI * 2;
    for (let i = 0; i < len; i++) {
      ph += (2 * Math.PI * f * ratio) / SR;
      out[start + i] += Math.sin(ph) * a * amp * Math.exp((-i / SR) * decay * ratio);
    }
  }
}

// camel bells: two loose bells swinging with the walk, loopable
{
  const N = secs(9.2);
  const out = new Float32Array(N);
  let t = 0.1;
  let k = 0;
  while (t < 8.8) {
    bell(out, secs(t), k % 2 ? 690 + rand() * 12 : 520 + rand() * 10, 0.5 + rand() * 0.4);
    if (rand() < 0.35) bell(out, secs(t + 0.11), 690, 0.25);
    t += 0.78 + rand() * 0.22;
    k++;
  }
  wav("bells_loop.wav", loopify(out, 0.6), 0.45);
}

// brass scale-pan clink: two light touches
{
  const N = secs(1.4);
  const out = new Float32Array(N);
  bell(out, 0, 1850, 0.7, 6);
  bell(out, secs(0.32), 2240, 0.4, 7);
  wav("clink.wav", out, 0.4);
}

// ---------- Chapter 1 opening upgrade ----------

// one soft paper snap: a very short band-passed tick with a tiny body
function snap(out, start, amp) {
  const len = secs(0.03);
  const bp = biquad().set("bp", 1900 + rand() * 900, 1.6);
  let ph = 0;
  for (let i = 0; i < len && start + i < out.length; i++) {
    const t = i / len;
    ph += (2 * Math.PI * 210) / SR;
    out[start + i] += (bp(white()) * 1.4 + Math.sin(ph) * 0.25) * amp * Math.exp(-t * 7);
  }
}

// pop-up mountains: 22 snaps, one every 2 frames at 30 fps (matches the scene stagger)
{
  const N = secs(1.7);
  const out = new Float32Array(N);
  for (let i = 0; i < 22; i++) snap(out, secs((i * 2) / 30), 0.55 + rand() * 0.45);
  wav("paper_pop.wav", out, 0.4);
}

// a single snap for a pin landing on the map
{
  const out = new Float32Array(secs(0.2));
  snap(out, 0, 1);
  wav("paper_tick.wav", out, 0.35);
}

// reed pen (qalam) on paper: a few short, scratchy strokes over ~1.5 s
{
  const N = secs(1.6);
  const out = new Float32Array(N);
  const strokes = [[0.02, 0.22], [0.3, 0.16], [0.5, 0.28], [0.84, 0.14], [1.02, 0.24], [1.3, 0.18]];
  for (const [t0, d] of strokes) {
    const start = secs(t0);
    const len = secs(d);
    const bp1 = biquad().set("bp", 3200 + rand() * 600, 2.2);
    const bp2 = biquad().set("bp", 6800, 3);
    let grain = 1;
    for (let i = 0; i < len; i++) {
      const t = i / len;
      if (i % 360 === 0) grain = 0.55 + rand() * 0.45;
      const env = Math.min(1, t * 14) * Math.min(1, (1 - t) * 8);
      const n = white();
      out[start + i] += (bp1(n) + bp2(n) * 0.45) * env * grain;
    }
  }
  wav("qalam_scratch.wav", out, 0.3);
}
