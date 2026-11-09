import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FIGURE_H, Pose, spriteName, SPRITES, useLife } from '../components/Host';
import type { Vec3 } from './camera';

// ------------------------------------------------------------ texture preloading
const cache = new Map<string, THREE.Texture>();
const parts = new Map<string, { lower: THREE.Texture; upper: THREE.Texture }>();

/**
 * Load every sprite into a THREE texture once. Returns `ready`; the scenes must not
 * mount before that, otherwise a 3D canvas can draw its first frame without the host
 * (nothing would redraw it). The render is held with delayRender until then.
 */
export const usePreloadSprites = () => {
  const names = Object.keys(SPRITES).filter((n) => SPRITES[n].kind !== 'head');
  const [ready, setReady] = useState(() => names.every((n) => cache.has(n)));
  const [handle] = useState(() => (ready ? null : delayRender('Loading host sprite textures')));
  useLayoutEffect(() => {
    if (handle === null) return;
    let left = names.filter((n) => !cache.has(n)).length;
    const done = () => {
      setReady(true);
      // let React commit the scenes before releasing the frame
      requestAnimationFrame(() => continueRender(handle));
    };
    if (!left) {
      done();
      return;
    }
    for (const n of names) {
      if (cache.has(n)) continue;
      const img = new Image();
      img.onload = () => {
        const t = new THREE.Texture(img);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        t.needsUpdate = true;
        cache.set(n, t);
        if (--left === 0) done();
      };
      img.onerror = () => {
        if (--left === 0) done();
      };
      img.src = staticFile(`character/${n}.png`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);
  return ready;
};

const CAT_LINE = (n: string) => (n.startsWith('walk') ? 0.27 : n === 'astronaut_sit' ? 0 : 0.25);

const split = (n: string) => {
  if (!parts.has(n)) {
    const base = cache.get(n)!;
    const c = CAT_LINE(n);
    const lower = base.clone();
    lower.repeat.set(1, 1 - c);
    lower.offset.set(0, 0);
    lower.needsUpdate = true;
    const upper = base.clone();
    upper.repeat.set(1, c);
    upper.offset.set(0, 1 - c);
    upper.needsUpdate = true;
    parts.set(n, { lower, upper });
  }
  return parts.get(n)!;
};

/**
 * The host as a billboard plane inside the 3D world (always faces the camera).
 * `position` = her feet; `height` = figure height in world units.
 */
export const Host3D: React.FC<{
  position: Vec3;
  height: number;
  pose?: Pose;
  poseAt?: number;
  walking?: boolean;
  flip?: boolean;
  opacity?: number;
  roll?: number;
  shiver?: number;
}> = ({ position, height, pose = 'astronaut', poseAt = -999, walking = false, flip = false, opacity = 1, roll = 0, shiver = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const camera = useThree((s) => s.camera);
  const ref = useRef<THREE.Group>(null);
  const name = spriteName(frame, fps, pose, walking);
  const m = SPRITES[name];
  const life = useLife(poseAt, walking);
  const u = height / FIGURE_H; // world units per sprite pixel
  const W = m.w * u;
  const H = m.h * u;
  const below = (m.h - (m.baseline ?? m.h)) * u;
  const c = CAT_LINE(name);
  useLayoutEffect(() => {
    if (ref.current) ref.current.quaternion.copy(camera.quaternion);
  });
  const mats = useMemo(
    () => [0, 1].map(() => new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.03, toneMapped: false, side: THREE.DoubleSide })),
    [],
  );
  if (!cache.has(name)) return null;
  const tex = split(name);
  const full = cache.get(name)!;
  mats[0].map = c > 0 ? tex.lower : full;
  mats[1].map = tex.upper;
  for (const mm of mats) {
    mm.opacity = opacity;
    mm.needsUpdate = true;
  }
  const jitter = shiver ? Math.sin(frame * 2.7) * 0.012 * height * shiver : 0;
  const lowerH = H * (1 - c);
  const upperH = H * c;
  return (
    <group position={position}>
      <group ref={ref}>
        <group rotation={[0, 0, roll]} position={[jitter, life.lift * height, 0]} scale={[(flip ? -1 : 1) * life.sx, life.sy, 1]}>
          {/* origin = feet */}
          <mesh position={[0, -below + lowerH / 2, 0]} material={mats[0]}>
            <planeGeometry args={[W, c > 0 ? lowerH : H]} />
          </mesh>
          {c > 0 ? (
            <group position={[0, -below + lowerH, 0.001]} rotation={[0, 0, (life.catTilt * Math.PI) / 180]}>
              <mesh position={[0, upperH / 2, 0]} material={mats[1]}>
                <planeGeometry args={[W, upperH]} />
              </mesh>
            </group>
          ) : null}
        </group>
      </group>
    </group>
  );
};
