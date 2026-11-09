import * as THREE from 'three';
import { mulberry32 } from '../lib/anim';

const cache = new Map<string, THREE.Texture>();
const memo = <T extends THREE.Texture>(key: string, make: () => T): T => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key) as T;
};

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d') as CanvasRenderingContext2D] as const;
};

/** Soft radial glow used for bloom-like halos (additive sprites). */
export const glowTexture = () =>
  memo('glow', () => {
    const [c, g] = canvas(256, 256);
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.12, 'rgba(255,255,255,0.75)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.22)');
    grd.addColorStop(0.7, 'rgba(255,255,255,0.05)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });

/** Four-point star sparkle. */
export const sparkleTexture = () =>
  memo('sparkle', () => {
    const [c, g] = canvas(256, 256);
    g.translate(128, 128);
    const ray = (len: number, wid: number) => {
      const grd = g.createLinearGradient(-len, 0, len, 0);
      grd.addColorStop(0, 'rgba(255,255,255,0)');
      grd.addColorStop(0.5, 'rgba(255,255,255,1)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.moveTo(-len, 0);
      g.quadraticCurveTo(0, -wid, len, 0);
      g.quadraticCurveTo(0, wid, -len, 0);
      g.fill();
    };
    ray(128, 9);
    g.rotate(Math.PI / 2);
    ray(128, 9);
    g.rotate(Math.PI / 4);
    ray(60, 4);
    g.rotate(Math.PI / 2);
    ray(60, 4);
    const grd = g.createRadialGradient(0, 0, 0, 0, 0, 40);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(-40, -40, 80, 80);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });

/** Spiral storm (alpha) for Neptune's dark-spot vortex. */
export const stormTexture = () =>
  memo('storm', () => {
    const S = 512;
    const [c, g] = canvas(S, S);
    g.translate(S / 2, S / 2);
    const core = g.createRadialGradient(0, 0, 0, 0, 0, S * 0.32);
    core.addColorStop(0, 'rgba(6,16,60,0.95)');
    core.addColorStop(0.7, 'rgba(10,30,100,0.6)');
    core.addColorStop(1, 'rgba(10,30,100,0)');
    g.fillStyle = core;
    g.beginPath();
    g.ellipse(0, 0, S * 0.32, S * 0.2, 0, 0, Math.PI * 2);
    g.fill();
    g.lineCap = 'round';
    for (let arm = 0; arm < 5; arm++) {
      g.beginPath();
      for (let k = 0; k < 120; k++) {
        const a = arm * ((Math.PI * 2) / 5) + k * 0.06;
        const r = 18 + k * 1.9;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r * 0.62;
        if (k === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.strokeStyle = `rgba(225,242,255,${0.55 - arm * 0.05})`;
      g.lineWidth = 7;
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });

// ------------------------------------------------------------------ planets
const fbm = (rnd: () => number) => {
  // cheap value-noise lookup table for 2D turbulence
  const N = 64;
  const g = Array.from({ length: N * N }, () => rnd());
  const at = (x: number, y: number) => g[(((y % N) + N) % N) * N + (((x % N) + N) % N)];
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = x - xi;
    const fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * sx;
    const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * sx;
    return a + (b - a) * sy;
  };
  return (x: number, y: number) => {
    let v = 0;
    let amp = 0.5;
    let f = 1;
    for (let o = 0; o < 5; o++) {
      v += noise(x * f, y * f) * amp;
      f *= 2;
      amp *= 0.5;
    }
    return v;
  };
};

/** HD 189733 b: deep cobalt, swirling bands and vortices (equirectangular). */
export const cobaltTexture = () =>
  memo('cobalt', () => {
    const W = 1024;
    const H = 512;
    const [c, g] = canvas(W, H);
    const img = g.createImageData(W, H);
    const n = fbm(mulberry32(189733));
    for (let y = 0; y < H; y++) {
      const lat = y / H;
      for (let x = 0; x < W; x++) {
        const u = x / W;
        // domain warp → swirls
        const wx = u * 8 + n(u * 6, lat * 6) * 2.2;
        const wy = lat * 26 + n(u * 10 + 3, lat * 10) * 3.0;
        const band = 0.5 + 0.5 * Math.sin(wy + Math.sin(wx * 1.3) * 0.6);
        const t = n(wx * 1.5, wy * 0.4);
        const k = 0.55 + 0.45 * band * 0.7 + (t - 0.5) * 0.5;
        const pole = Math.pow(Math.abs(lat - 0.5) * 2, 3);
        const r = (18 + 40 * k) * (1 - pole * 0.4);
        const gg = (48 + 90 * k) * (1 - pole * 0.3);
        const b = (150 + 105 * k) * (1 - pole * 0.15);
        const i = (y * W + x) * 4;
        // bright wispy high clouds
        const wisp = Math.max(0, n(wx * 3 + 7, wy * 0.8) - 0.62) * 3;
        img.data[i] = Math.min(255, r + wisp * 120);
        img.data[i + 1] = Math.min(255, gg + wisp * 140);
        img.data[i + 2] = Math.min(255, b + wisp * 80);
        img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  });

export const earthTexture = () =>
  memo('earth', () => {
    const W = 1024;
    const H = 512;
    const [c, g] = canvas(W, H);
    const img = g.createImageData(W, H);
    const n = fbm(mulberry32(3));
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const u = x / W;
        const v = y / H;
        const land = n(u * 5, v * 5) + n(u * 11 + 5, v * 11) * 0.35;
        const pole = Math.abs(v - 0.5) > 0.42;
        const cloud = Math.max(0, n(u * 9 + 20, v * 14) - 0.55) * 2.6;
        let r = 20, gg = 70, b = 170;
        if (land > 0.62) {
          const dry = n(u * 20, v * 20);
          r = dry > 0.55 ? 150 : 50;
          gg = dry > 0.55 ? 140 : 130;
          b = dry > 0.55 ? 90 : 60;
        }
        if (pole) (r = 235), (gg = 240), (b = 248);
        const i = (y * W + x) * 4;
        img.data[i] = r + (255 - r) * Math.min(1, cloud);
        img.data[i + 1] = gg + (255 - gg) * Math.min(1, cloud);
        img.data[i + 2] = b + (255 - b) * Math.min(1, cloud);
        img.data[i + 3] = 255;
      }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    return t;
  });

export const jupiterTexture = () =>
  memo('jupiter', () => {
    const W = 1024;
    const H = 512;
    const [c, g] = canvas(W, H);
    const img = g.createImageData(W, H);
    const n = fbm(mulberry32(5));
    const pal = [
      [214, 190, 160],
      [176, 128, 92],
      [232, 216, 190],
      [150, 104, 78],
      [222, 196, 168],
    ];
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const u = x / W;
        const v = y / H;
        const wy = v * 14 + n(u * 8, v * 8) * 0.9;
        const k = Math.floor(((wy % 5) + 5) % 5);
        const p = pal[k];
        const shade = 0.85 + n(u * 30, v * 4) * 0.3;
        // great red spot
        const dx = (u - 0.65) / 0.06;
        const dy = (v - 0.64) / 0.035;
        const spot = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
        const i = (y * W + x) * 4;
        img.data[i] = Math.min(255, p[0] * shade + spot * 60);
        img.data[i + 1] = p[1] * shade * (1 - spot * 0.4);
        img.data[i + 2] = p[2] * shade * (1 - spot * 0.5);
        img.data[i + 3] = 255;
      }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    return t;
  });

/** Granulated star surface. */
export const starTexture = () =>
  memo('star', () => {
    const W = 512;
    const H = 256;
    const [c, g] = canvas(W, H);
    const img = g.createImageData(W, H);
    const n = fbm(mulberry32(9));
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const k = n((x / W) * 30, (y / H) * 15);
        const i = (y * W + x) * 4;
        img.data[i] = 255;
        img.data[i + 1] = 150 + k * 100;
        img.data[i + 2] = 60 + k * 110;
        img.data[i + 3] = 255;
      }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    return t;
  });

/** Top-down spiral galaxy (for the Milky Way zoom). */
export const galaxyTexture = () =>
  memo('galaxy', () => {
    const S = 1024;
    const [c, g] = canvas(S, S);
    g.translate(S / 2, S / 2);
    const rnd = mulberry32(42);
    const core = g.createRadialGradient(0, 0, 0, 0, 0, S * 0.18);
    core.addColorStop(0, 'rgba(255,240,215,1)');
    core.addColorStop(0.4, 'rgba(255,210,160,0.6)');
    core.addColorStop(1, 'rgba(255,200,150,0)');
    g.fillStyle = core;
    g.fillRect(-S / 2, -S / 2, S, S);
    for (let i = 0; i < 26000; i++) {
      const arm = Math.floor(rnd() * 2);
      const d = Math.pow(rnd(), 0.7) * S * 0.46;
      const a = arm * Math.PI + d * 0.012 + (rnd() - 0.5) * (0.5 + 60 / (d + 20));
      const x = Math.cos(a) * d;
      const y = Math.sin(a) * d;
      const blue = d / (S * 0.46);
      g.fillStyle = `rgba(${Math.round(255 - 90 * blue)},${Math.round(225 - 20 * blue)},${Math.round(200 + 55 * blue)},${0.18 + rnd() * 0.4})`;
      const r = rnd() < 0.05 ? 4 : 2.2;
      g.fillRect(x, y, r, r);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
