import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Tag } from '../components/Text';
import { Host3DOverlay } from '../components/Host3DFx';
import { PlanetBody, Stars, Star } from '../three/parts';
import { Host3D } from '../three/Host3D';
import { ease, lerp } from '../lib/anim';
import { project, Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';
import { fovFor } from './layout';

/** Absorption-line spectrum (HTML). */
const Spectrum: React.FC<{ x: number; y: number; w: number; o: number; lines: number }> = ({ x, y, w, o, lines }) => (
  <div style={{ position: 'absolute', left: x - w / 2, top: y, width: w, height: 70, opacity: o, borderRadius: 14, overflow: 'hidden', boxShadow: '0 0 40px rgba(255,255,255,0.25)' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#5b2bd6,#2f6bff,#22c8ff,#3be38a,#f6f05a,#ffa53a,#ff3b3b)' }} />
    {[0.13, 0.27, 0.36, 0.52, 0.61, 0.74, 0.86].map((p, i) => (
      <div key={i} style={{ position: 'absolute', left: `${p * 100}%`, top: 0, bottom: 0, width: 6 + (i % 3) * 3, background: '#05060c', opacity: lines }} />
    ))}
  </div>
);

/** 6 · Transit: the planet crosses its star; starlight through its air → spectrum. Host sits on it. */
export const TransitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, at, length, width, height } = useScene();
  const t = frame / fps;
  const aStudy = at('by studying that light', 4.5);
  const aShock = at('what they found was shocking', 8.5);
  const x = lerp(isV ? -2.4 : -5, isV ? 2.4 : 5, ease(frame, [0, length], [0, 1], theme.ease.inOut));
  const P: Vec3 = [x, isV ? -0.6 : 0.4, 0];
  const R = 1.25;
  const pose: Pose = { pos: [0, 0.6, isV ? 19 : 14], target: [0, 0, -4], fov: fovFor(isV, 40) };
  const spec = ease(frame, [aStudy, aStudy + 20], [0, 1], theme.ease.out);
  const lines = ease(frame, [aShock, aShock + 8], [0.15, 1], theme.ease.out);
  const feet: Vec3 = [P[0], P[1] + R, P[2]];
  const limb = project(pose, width, height, [P[0] + R * 0.7, P[1] - R * 0.7, 0]);
  const barY = isV ? 1010 : 680;
  const barW = isV ? 760 : 900;
  const barX = isV ? 490 : width / 2;
  return (
    <AbsoluteFill>
      <SpaceBackdrop warm={0.3} />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.03} />
        <Stars count={2000} radius={500} seed={61} />
        <Star radius={isV ? 7.5 : 8.5} position={[0, 0, -26]} t={t} />
        <PlanetBody kind="hd" radius={R} position={P} t={t} sunDir={[0, 0.1, -1]} ambient={0.04} atmo="#9fd0ff" atmoIntensity={3} />
        <Host3D position={feet} height={1.7} pose="astronaut_sit" />
      </SceneCanvas>
      {/* light through the atmosphere splits into a rainbow fan */}
      {spec > 0 ? (
        <svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0, opacity: spec * 0.75, mixBlendMode: 'screen' }}>
          {['#5b2bd6', '#2f6bff', '#22c8ff', '#3be38a', '#f6f05a', '#ffa53a', '#ff3b3b'].map((c, i) => (
            <line key={i} x1={limb.x} y1={limb.y} x2={barX - barW / 2 + (i + 0.5) * (barW / 7)} y2={barY} stroke={c} strokeWidth={5} strokeLinecap="round" opacity={0.85} />
          ))}
        </svg>
      ) : null}
      <Spectrum x={barX} y={barY} w={barW} o={spec} lines={lines} />
      <Tag text="Starlight through its air" from={at('star light shines', 2.5)} to={aStudy + 10} x={isV ? 490 : width / 2} y={isV ? 330 : 140} color={theme.color.star} />
      <Tag text="The light reveals what it's made of" from={aStudy + 20} to={length} x={barX} y={barY + (isV ? 120 : 110)} color={theme.color.sky} size={isV ? 30 : 30} />
      <Host3DOverlay
        pose={pose}
        feet={feet}
        height={1.7}
        sitting
        bubbles={[{ expr: 'surprised', from: aShock, hold: 1.4 }]}
        fx={[{ type: 'bang', from: aShock, to: length }]}
      />
    </AbsoluteFill>
  );
};
