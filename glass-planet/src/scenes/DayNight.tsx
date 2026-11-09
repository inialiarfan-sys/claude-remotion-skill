import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Tag } from '../components/Text';
import { Host3DOverlay } from '../components/Host3DFx';
import { Glow, PlanetBody, Stars } from '../three/parts';
import { Host3D } from '../three/Host3D';
import { ease, lerp } from '../lib/anim';
import type { Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';
import { fovFor } from './layout';

/** 9 · Split view: glowing dayside, dark nightside. Host walks from day (sweaty) to night (frosty). */
export const DayNightScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, at, length, width } = useScene();
  const t = frame / fps;
  const aNight = at('the other side is always night', 3.9);
  const R = 2.2;
  const pose: Pose = { pos: [0, 0.8, isV ? 10.5 : 8.6], target: [0, isV ? 0.3 : 0.9, 0], fov: fovFor(isV, 40) };
  // she walks over the top from the day side (left) to the night side (right)
  const s = ease(frame, [8, length - 6], [0, 1], theme.ease.inOut);
  const a = lerp(0.55, -0.55, s); // angle from the top (+ = left)
  const feet: Vec3 = [-Math.sin(a) * R, Math.cos(a) * R, 0];
  const onNight = feet[0] > 0.15;
  const jitter = onNight ? Math.sin(frame * 2.7) * 0.03 : 0; // shivering
  const cross = Math.round(lerp(8, length - 6, 0.5));
  return (
    <AbsoluteFill>
      <SpaceBackdrop warm={0.35} />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.02} />
        <Stars count={2000} radius={500} seed={91} />
        {/* star off to the left: the left half is permanent day */}
        <Glow position={[-40, 2, -10]} scale={40} color={theme.color.star} opacity={0.7} />
        <PlanetBody kind="hd" radius={R} t={t} sunDir={[-1, 0, 0.08]} heat={1.8} ambient={0.015} />
        <group position={feet} rotation={[0, 0, a]}>
          <Host3D position={[jitter, 0, 0]} height={1.3} pose="astronaut" walking />
        </group>
      </SceneCanvas>
      <Tag text="DAY  ≈ 1,000°C" from={6} x={isV ? 270 : 300} y={isV ? 985 : 800} color="#ffb36b" size={isV ? 38 : 40} />
      <Tag text="NIGHT  much colder" from={aNight} x={isV ? 650 : width - 320} y={isV ? 1060 : 800} color={theme.color.sky} size={isV ? 38 : 40} />
      <Host3DOverlay
        pose={pose}
        feet={feet}
        height={1.3}
        bubbles={[
          { expr: 'sad', from: 14, hold: 1.2 },
          { expr: 'crying', from: cross + 8, hold: 1.4 },
        ]}
        fx={[
          { type: 'sweat', from: 0, to: cross },
          { type: 'frost', from: cross, to: length },
        ]}
        side={isV ? 'left' : 'right'}
        up={[-Math.sin(a), Math.cos(a), 0]}
      />
    </AbsoluteFill>
  );
};
