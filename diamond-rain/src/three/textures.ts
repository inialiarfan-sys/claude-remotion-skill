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

type PlanetKind = 'neptune' | 'uranus' | 'earth';

/** Procedural banded gas-giant texture (equirectangular). */
export const planetTexture = (kind: PlanetKind) =>
  memo('planet-' + kind, () => {
    const W = 1024;
    const H = 512;
    const [c, g] = canvas(W, H);
    const rnd = mulberry32(kind === 'neptune' ? 11 : kind === 'uranus' ? 23 : 37);
    if (kind === 'earth') {
      g.fillStyle = '#123f8c';
      g.fillRect(0, 0, W, H);
      for (let i = 0; i < 26; i++) {
        const x = rnd() * W;
        const y = H * (0.2 + rnd() * 0.6);
        g.fillStyle = rnd() > 0.4 ? '#2f7d3a' : '#a08a52';
        g.beginPath();
        g.ellipse(x, y, 30 + rnd() * 90, 20 + rnd() * 50, rnd() * 3, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = 'rgba(255,255,255,0.9)';
      g.fillRect(0, 0, W, H * 0.06);
      g.fillRect(0, H * 0.94, W, H * 0.06);
      for (let i = 0; i < 60; i++) {
        g.fillStyle = `rgba(255,255,255,${0.25 + rnd() * 0.4})`;
        g.beginPath();
        g.ellipse(rnd() * W, rnd() * H, 20 + rnd() * 80, 4 + rnd() * 10, 0, 0, Math.PI * 2);
        g.fill();
      }
    } else {
      const base = kind === 'neptune' ? [34, 78, 205] : [128, 206, 214];
      const grad = g.createLinearGradient(0, 0, 0, H);
      const sh = (k: number) => `rgb(${base.map((x) => Math.round(Math.min(255, x * k))).join(',')})`;
      grad.addColorStop(0, sh(0.62));
      grad.addColorStop(0.5, sh(1));
      grad.addColorStop(1, sh(0.62));
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      // bands
      for (let i = 0; i < 70; i++) {
        const y = rnd() * H;
        const h = 2 + rnd() * (kind === 'neptune' ? 18 : 10);
        const k = 0.8 + rnd() * 0.45;
        g.fillStyle = sh(k).replace('rgb', 'rgba').replace(')', `,${0.18 + rnd() * 0.25})`);
        g.fillRect(0, y, W, h);
      }
      if (kind === 'neptune') {
        // Great Dark Spot + bright companion clouds
        g.fillStyle = 'rgba(8,22,80,0.85)';
        g.beginPath();
        g.ellipse(W * 0.32, H * 0.62, 70, 34, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(230,245,255,0.75)';
        for (let i = 0; i < 9; i++) {
          g.beginPath();
          g.ellipse(W * (0.25 + rnd() * 0.5), H * (0.3 + rnd() * 0.45), 30 + rnd() * 50, 3 + rnd() * 4, 0, 0, Math.PI * 2);
          g.fill();
        }
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  });

/** Concentric interior layers for the cut faces of the cutaway planet. */
export const layersTexture = () =>
  memo('layers', () => {
    const S = 1024;
    const [c, g] = canvas(S, S);
    const R = S / 2;
    g.translate(R, R);
    const ring = (r: number, col: string) => {
      g.fillStyle = col;
      g.beginPath();
      g.arc(0, 0, r * R, 0, Math.PI * 2);
      g.fill();
    };
    // atmosphere (H, He, CH4) — cold blue
    const atm = g.createRadialGradient(0, 0, 0.72 * R, 0, 0, R);
    atm.addColorStop(0, '#1b58c9');
    atm.addColorStop(1, '#5fa8ff');
    g.fillStyle = atm;
    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.fill();
    // icy mantle (water, ammonia, methane) — hot, dense fluid, teal → amber
    const man = g.createRadialGradient(0, 0, 0.3 * R, 0, 0, 0.74 * R);
    man.addColorStop(0, '#d9822f');
    man.addColorStop(0.35, '#3a8f9a');
    man.addColorStop(1, '#0f5d86');
    g.fillStyle = man;
    g.beginPath();
    g.arc(0, 0, 0.74 * R, 0, Math.PI * 2);
    g.fill();
    // rocky core — glowing hot
    const core = g.createRadialGradient(0, 0, 0, 0, 0, 0.3 * R);
    core.addColorStop(0, '#fff2d0');
    core.addColorStop(0.5, '#ffb04a');
    core.addColorStop(1, '#c4521c');
    g.fillStyle = core;
    g.beginPath();
    g.arc(0, 0, 0.3 * R, 0, Math.PI * 2);
    g.fill();
    // boundaries
    g.strokeStyle = 'rgba(220,250,255,0.45)';
    g.lineWidth = 3;
    for (const r of [0.3, 0.74, 0.995]) {
      g.beginPath();
      g.arc(0, 0, r * R, 0, Math.PI * 2);
      g.stroke();
    }
    // subtle convection swirls in mantle
    const rnd = mulberry32(5);
    g.globalAlpha = 0.18;
    g.strokeStyle = '#bff6ff';
    g.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
      const r = (0.34 + rnd() * 0.36) * R;
      const a = rnd() * Math.PI * 2;
      g.beginPath();
      g.arc(0, 0, r, a, a + 0.2 + rnd() * 0.5);
      g.stroke();
    }
    g.globalAlpha = 1;
    void ring;
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
