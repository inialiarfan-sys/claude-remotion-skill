import React, { useMemo } from 'react';
import * as THREE from 'three';
import { mulberry32 } from '../lib/anim';
import { ADD, Inst, Sparkles, useDiamondMaterial } from './parts';
import type { Vec3 } from './camera';

/**
 * Sideways storm of glass shards (instanced). Thin sharp tetrahedral blades with a
 * reflective, iridescent material + streak glows. Pure function of t → deterministic.
 */
export const GlassShards: React.FC<{
  t: number;
  count?: number;
  speed?: number;
  span?: Vec3; // box size the shards wrap within
  center?: Vec3;
  size?: number;
  dir?: number; // 1 = left→right
  fall?: number; // downward slant
  intensity?: number;
  seed?: number;
}> = ({ t, count = 1200, speed = 30, span = [80, 30, 60], center = [0, 0, 0], size = 1, dir = 1, fall = 0.18, intensity = 1, seed = 3 }) => {
  const geo = useMemo(() => {
    const g = new THREE.TetrahedronGeometry(1, 0);
    g.scale(1.0, 0.12, 0.3);
    return g;
  }, []);
  const mat = useDiamondMaterial({ emissive: 0.35 });
  const streakGeo = useMemo(() => new THREE.PlaneGeometry(1, 0.05), []);
  const streakMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#cdefff', transparent: true, opacity: 0.35, depthWrite: false, ...ADD }),
    [],
  );
  streakMat.opacity = 0.35 * intensity;
  const data = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: r(), y: r(), z: r(), v: 0.6 + r() * 0.8, s: (0.25 + r() ** 2 * 1.1) * size, rx: r() * 6, sp: 2 + r() * 6,
    }));
  }, [count, seed, size]);
  const pos = (i: number): Vec3 => {
    const d = data[i];
    const x = ((((d.x * span[0] + dir * d.v * speed * t) % span[0]) + span[0]) % span[0]) - span[0] / 2;
    const y = ((((d.y * span[1] - fall * d.v * speed * t) % span[1]) + span[1]) % span[1]) - span[1] / 2;
    return [center[0] + x, center[1] + y, center[2] + (d.z - 0.5) * span[2]];
  };
  const tilt = Math.atan2(-fall, dir);
  return (
    <>
      <Inst
        count={count}
        geometry={geo}
        material={mat}
        write={(i, o) => {
          o.position.set(...pos(i));
          o.rotation.set(data[i].rx + t * data[i].sp, 0, tilt + Math.sin(t * data[i].sp + i) * 0.25);
          o.scale.setScalar(data[i].s * intensity + 1e-4);
        }}
      />
      <Inst
        count={Math.floor(count / 2)}
        geometry={streakGeo}
        material={streakMat}
        write={(i, o) => {
          const p = pos(i * 2);
          o.position.set(p[0] - dir * data[i * 2].s * 2, p[1], p[2]);
          o.rotation.set(0, 0, tilt);
          o.scale.set(data[i * 2].s * 6 * (speed / 30), data[i * 2].s * 1.2, 1);
        }}
      />
      <Sparkles points={Array.from({ length: Math.min(120, count) }, (_, k) => pos((k * 9) % count))} t={t} size={50} intensity={intensity} rate={3} />
    </>
  );
};

/** Wind streamlines flowing around a planet from the dayside (+x) to the nightside (−x). */
export const WindStreams: React.FC<{ t: number; radius: number; amount: number; count?: number; speed?: number }> = ({ t, radius, amount, count = 160, speed = 1 }) => {
  const geo = useMemo(() => new THREE.TorusGeometry(1, 0.012, 4, 24, 0.55), []);
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#d9f2ff', transparent: true, depthWrite: false, ...ADD }),
    [],
  );
  mat.opacity = 0.75 * amount;
  const data = useMemo(() => {
    const r = mulberry32(17);
    return Array.from({ length: count }, () => ({ lat: (r() * 2 - 1) * 1.2, ph: r(), w: 0.6 + r() * 0.8, rr: 1.03 + r() * 0.12 }));
  }, [count]);
  return (
    <Inst
      count={count}
      geometry={geo}
      material={mat}
      write={(i, o) => {
        const d = data[i];
        // rings around the Y axis, arcs travel from +x (day) over the limb to −x (night)
        const c = Math.cos(d.lat);
        const phase = (d.ph + t * 0.35 * d.w * speed) % 1;
        o.position.set(0, radius * d.rr * Math.sin(d.lat), 0);
        o.rotation.set(Math.PI / 2, 0, phase * Math.PI * 2);
        o.scale.set(radius * d.rr * c, radius * d.rr * c, 1).multiplyScalar(Math.max(1e-4, amount));
      }}
    />
  );
};

/** Thin glowing orbit ring. */
export const OrbitRing: React.FC<{ radius: number; color?: string; opacity?: number; tilt?: number }> = ({ radius, color = '#9fc4ff', opacity = 0.35, tilt = 0 }) => (
  <mesh rotation={[Math.PI / 2 + tilt, 0, 0]}>
    <torusGeometry args={[radius, Math.max(0.004, radius * 0.004), 6, 160]} />
    <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
  </mesh>
);

/** Soft gas puffs (instanced sprites) — the hook's green cloud. */
export const GasCloud: React.FC<{ t: number; color: string; count?: number; spread?: number; amount?: number }> = ({ t, color, count = 140, spread = 12, amount = 1 }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,0.9)');
    grd.addColorStop(0.5, 'rgba(255,255,255,0.35)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  }, []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, color, transparent: true, depthWrite: false, ...ADD }), [tex, color]);
  mat.opacity = 0.28 * amount;
  const data = useMemo(() => {
    const r = mulberry32(77);
    return Array.from({ length: count }, () => ({ p: [r() - 0.5, r() - 0.5, r() - 0.5], s: 2 + r() * 5, w: r() * 6 }));
  }, [count]);
  return (
    <Inst
      count={count}
      geometry={geo}
      material={mat}
      write={(i, o) => {
        const d = data[i];
        const g = 0.4 + 0.6 * amount;
        o.position.set(d.p[0] * spread * g + Math.sin(t * 0.7 + d.w) * 0.8, d.p[1] * spread * 0.6 * g + t * 0.4, d.p[2] * spread * 0.5);
        o.rotation.set(0, 0, t * 0.2 + d.w);
        o.scale.setScalar(d.s * (0.6 + 0.4 * amount));
      }}
    />
  );
};
