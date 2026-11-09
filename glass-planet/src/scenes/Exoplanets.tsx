import React, { useMemo } from 'react';
import { AbsoluteFill, spring, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Host } from '../components/Host';
import { Glow, Inst, Stars } from '../three/parts';
import { ease, mulberry32 } from '../lib/anim';
import type { Pose } from '../three/camera';
import { theme } from '../theme';
import { fovFor, hostSpot } from './layout';

/** 4 · Hundreds of tiny planets pop in around stars; counter to 6,000+. */
export const ExoplanetsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, at, length } = useScene();
  const t = frame / fps;
  const aSix = at('more than 6000', 2);
  const aFew = at('but few are as terrifying', 3.2);
  const N = 700;
  const stars = 70;
  const data = useMemo(() => {
    const r = mulberry32(64);
    const centers = Array.from({ length: stars }, () => [(r() - 0.5) * 60, (r() - 0.5) * (isV ? 70 : 34), (r() - 0.5) * 30 - 10]);
    return {
      centers,
      planets: Array.from({ length: N }, (_, i) => ({
        c: i % stars,
        r: 0.8 + r() * 2.2,
        a: r() * 6.28,
        w: 0.3 + r(),
        s: 0.08 + r() ** 2 * 0.25,
        delay: r() ** 0.8,
        col: ['#7fb2ff', '#d9b38c', '#9fd3c7', '#f0a37a', '#c4b5ff', '#5f8dff'][Math.floor(r() * 6)],
      })),
    };
  }, [isV]);
  const sph = useMemo(() => new THREE.SphereGeometry(1, 12, 8), []);
  const mats = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.7, vertexColors: false }), []);
  const popEnd = Math.max(aSix + 10, 40);
  const pose: Pose = { pos: [Math.sin(t * 0.1) * 3, 2, 46 - t * 1.2], target: [0, 0, -8], fov: fovFor(isV, 40) };
  // counter
  const n = Math.round(ease(frame, [4, aSix + 4], [0, 6000], theme.ease.out) / 10) * 10;
  const done = frame >= aSix + 4;
  const bump = spring({ frame: frame - aSix - 4, fps, config: theme.spring.bouncy, durationInFrames: 20 });
  const host = hostSpot(isV, 'right');
  const colors = useMemo(() => data.planets.map((p) => new THREE.Color(p.col)), [data]);
  return (
    <AbsoluteFill>
      <SpaceBackdrop drift={t / 25} />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.35} />
        <pointLight position={[0, 0, 20]} intensity={600} />
        <Stars count={2000} radius={500} seed={41} />
        {data.centers.map((c, i) => (
          <Glow key={i} position={c as [number, number, number]} scale={1.6 + (i % 4) * 0.5} color={i % 3 ? theme.color.star : '#cfe0ff'} opacity={0.9} />
        ))}
        <Inst
          count={N}
          geometry={sph}
          material={mats}
          write={(i, o) => {
            const p = data.planets[i];
            const c = data.centers[p.c];
            const appear = spring({ frame: frame - 4 - p.delay * (popEnd - 4), fps, config: theme.spring.bouncy, durationInFrames: 16 });
            const a = p.a + t * p.w;
            o.position.set(c[0] + Math.cos(a) * p.r, c[1] + Math.sin(a) * p.r * 0.35, c[2] + Math.sin(a) * p.r);
            o.scale.setScalar(Math.max(1e-4, p.s * appear));
          }}
          colors={colors}
        />
      </SceneCanvas>
      {/* counter */}
      <div
        style={{
          position: 'absolute',
          left: isV ? 70 : 0,
          right: isV ? 170 : 0,
          top: isV ? 300 : 110,
          textAlign: 'center',
          fontFamily: theme.font.body,
          fontWeight: 800,
          fontSize: isV ? 170 : 190,
          lineHeight: 1,
          color: done ? theme.color.butter : theme.color.text,
          transform: `scale(${done ? 0.9 + 0.1 * bump : 1})`,
          textShadow: '0 0 40px rgba(255,233,166,0.5), 0 8px 26px rgba(0,0,0,0.9)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {n.toLocaleString('en-US')}
        {done ? '+' : ''}
        <div style={{ fontSize: isV ? 40 : 40, letterSpacing: 5, color: theme.color.textDim, marginTop: 10 }}>EXOPLANETS FOUND</div>
      </div>
      <Host
        x={host.x}
        y={host.y + Math.sin(t * 1.5) * 12}
        height={host.height}
        pose="astronaut"
        poseAt={aSix}
        rotate={Math.sin(t) * 5}
        bubbles={[{ expr: 'excited', from: aSix, hold: 2.2 }]}
        fx={[{ type: 'sparkle', from: aSix, to: aFew }]}
        bubbleSide="left"
      />
    </AbsoluteFill>
  );
};
