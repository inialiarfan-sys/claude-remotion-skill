import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Title } from '../components/Text';
import { Host3DOverlay } from '../components/Host3DFx';
import { Glow, PlanetBody, Stars } from '../three/parts';
import { Host3D } from '../three/Host3D';
import { ease } from '../lib/anim';
import { theme } from '../theme';
import type { Pose, Vec3 } from '../three/camera';
import { fovFor } from './layout';

/** 2 · The blue planet rises out of darkness; title; host waves from the top. */
export const WelcomeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, length } = useScene();
  const t = frame / fps;
  const reveal = ease(frame, [0, length * 0.8], [0, 1], theme.ease.slow);
  const R = 3;
  const C: Vec3 = [0, -R * 0.55, 0];
  const pose: Pose = {
    pos: [Math.sin(t * 0.2) * 0.6, 1.4 - reveal * 0.6, (isV ? 13.5 : 17) - reveal * 1.5],
    target: [0, C[1] + (isV ? 1.6 : 0.9), 0],
    fov: fovFor(isV, 36),
    shift: isV ? -0.12 : -0.2,
  };
  const feet: Vec3 = [0, C[1] + R, 0];
  return (
    <AbsoluteFill>
      <SpaceBackdrop warm={0.06 * reveal} glow={`rgba(52,96,255,${0.25 * reveal})`} />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.05} />
        <Stars count={2600} radius={700} seed={21} opacity={0.4 + 0.6 * reveal} />
        <PlanetBody kind="hd" radius={R} position={C} rotation={[0.15, 0, 0]} t={t} sunDir={[1, 0.35, 0.45]} heat={0.35 * reveal} ambient={0.01} atmoIntensity={1.6 * reveal} opacity={1} />
        <Glow position={[14, 6, -20]} scale={12} color={theme.color.star} opacity={0.5 * reveal} />
        <Host3D
          position={feet}
          height={1.5}
          pose="astronaut"
          poseAt={Math.round(length * 0.35)}
          roll={frame > length * 0.45 ? Math.sin(t * 9) * 0.12 : 0}
          opacity={ease(frame, [length * 0.25, length * 0.4], [0, 1])}
        />
      </SceneCanvas>
      <AbsoluteFill style={{ background: '#000', opacity: 1 - ease(frame, [0, 24], [0, 1]) }} />
      <Title lines={['The Worst Planet', 'Ever Discovered']} from={Math.round(length * 0.25)} />
      <Host3DOverlay
        pose={pose}
        feet={feet}
        height={1.5}
        bubbles={[{ expr: 'happy', from: Math.round(length * 0.45), hold: 1.6 }]}
        fx={[{ type: 'sparkle', from: Math.round(length * 0.42), to: length }]}
      />
    </AbsoluteFill>
  );
};
