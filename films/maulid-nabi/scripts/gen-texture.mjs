// Generates a tileable handmade-paper texture (fibres + mottling) as a PNG.
// Deterministic (seeded) and dependency-free: a tiny PNG encoder on node:zlib.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "textures");
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

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const S = 512;
const rand = mulberry32(1447);

// periodic value noise so the tile repeats seamlessly
function makeNoise(cells) {
  const g = Array.from({ length: cells * cells }, () => rand());
  const at = (x, y) => g[((y + cells) % cells) * cells + ((x + cells) % cells)];
  const sm = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const fx = (x / S) * cells;
    const fy = (y / S) * cells;
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = sm(fx - x0);
    const ty = sm(fy - y0);
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx;
    const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
    return a + (b - a) * ty;
  };
}
const octaves = [makeNoise(4), makeNoise(8), makeNoise(16), makeNoise(64), makeNoise(128)];
const weights = [0.35, 0.25, 0.18, 0.12, 0.1];

const lum = new Float32Array(S * S);
for (let y = 0; y < S; y++)
  for (let x = 0; x < S; x++) {
    let v = 0;
    octaves.forEach((n, i) => (v += n(x, y) * weights[i]));
    lum[y * S + x] = 0.88 + (v - 0.5) * 0.22;
  }

// fibres: long thin wandering strokes, wrapped around the tile edges
for (let f = 0; f < 380; f++) {
  let x = rand() * S;
  let y = rand() * S;
  let ang = rand() * Math.PI * 2;
  const len = 20 + rand() * 90;
  const dark = rand() < 0.65;
  const strength = (dark ? -1 : 1) * (0.015 + rand() * 0.035);
  for (let s = 0; s < len; s++) {
    ang += (rand() - 0.5) * 0.25;
    x += Math.cos(ang);
    y += Math.sin(ang);
    const ix = ((Math.round(x) % S) + S) % S;
    const iy = ((Math.round(y) % S) + S) % S;
    lum[iy * S + ix] += strength;
  }
}
// specks of pulp
for (let p = 0; p < 260; p++) {
  const cx = rand() * S;
  const cy = rand() * S;
  const r = 0.6 + rand() * 1.8;
  for (let dy = -3; dy <= 3; dy++)
    for (let dx = -3; dx <= 3; dx++) {
      const d = Math.hypot(dx, dy);
      if (d > r) continue;
      const ix = ((Math.round(cx + dx) % S) + S) % S;
      const iy = ((Math.round(cy + dy) % S) + S) % S;
      lum[iy * S + ix] -= 0.12 * (1 - d / (r + 0.01));
    }
}

const rgba = Buffer.alloc(S * S * 4);
for (let i = 0; i < S * S; i++) {
  const v = Math.max(0, Math.min(1, lum[i]));
  // warm off-white, so a multiply blend tints toward aged paper
  rgba[i * 4] = Math.round(255 * Math.min(1, v * 1.04));
  rgba[i * 4 + 1] = Math.round(255 * v * 0.985);
  rgba[i * 4 + 2] = Math.round(255 * v * 0.92);
  rgba[i * 4 + 3] = 255;
}
writeFileSync(join(OUT, "paper.png"), png(S, S, rgba));
console.log("wrote textures/paper.png");
