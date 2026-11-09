import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mulberry32 } from '../lib/anim';
import { octaGeometry, Sparkles, useDiamondMaterial, useInstances } from './parts';
import type { Vec3 } from './camera';
import { theme } from '../theme';

/**
 * Thousands of diamonds falling toward the camera (InstancedMesh).
 * Positions are a pure function of `t` (seconds) so every frame is deterministic.
 */
export const DiamondField: React.FC<{
  t: number;
  count?: number;
  near?: number;
  far?: number;
  spread?: number;
  speed?: number;
  opacity?: number;
  seed?: number;
}> = ({ t, count = 1800, near = 18, far = -320, spread = 90, speed = 1, opacity = 1, seed = 7 }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(octaGeometry, []);
  const mat = useDiamondMaterial({ emissive: 0.22, opacity: opacity < 1 ? Math.max(0.001, opacity) : 1 });
  const data = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: (r() * 2 - 1) * spread,
      y: (r() * 2 - 1) * spread * 0.75,
      z: r(),
      v: 10 + r() * 18,
      s: 0.35 + r() ** 2 * 1.2,
      rx: r() * 6,
      ry: r() * 6,
      sp: 0.4 + r() * 1.6,
    }));
  }, [count, seed, spread]);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const r = mulberry32(seed + 1);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const k = r();
      c.set(k > 0.8 ? theme.color.cyan : k > 0.5 ? '#cfe9ff' : '#ffffff');
      m.setColorAt(i, c);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count, seed]);
  const depth = near - far;
  const posOf = (i: number): Vec3 => {
    const d = data[i];
    const z = far + ((((d.z * depth + d.v * speed * t) % depth) + depth) % depth);
    const fall = (z - far) * 0.18;
    return [d.x, d.y - fall + 25, z];
  };
  useInstances(ref, count, (i, o) => {
    const d = data[i];
    o.position.set(...posOf(i));
    o.rotation.set(d.rx + t * d.sp, d.ry + t * d.sp * 0.7, 0);
    o.scale.setScalar(d.s);
  });
  const glints = Array.from({ length: Math.min(160, count) }, (_, i) => posOf(i * 7 % count));
  return (
    <>
      <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} />
      <Sparkles points={glints} t={t} size={46} intensity={opacity} rate={1.3} />
    </>
  );
};
