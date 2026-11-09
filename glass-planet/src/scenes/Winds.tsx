import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Tag } from '../components/Text';
import { Host } from '../components/Host';
import { Glow, PlanetBody, Stars } from '../three/parts';
import { WindStreams } from '../three/Effects3D';
import { ease, lerp } from '../lib/anim';
import type { Pose } from '../three/camera';
import { theme } from '../theme';
import { fovFor } from './layout';

/** 10 · Monstrous winds race from the dayside to the nightside; the host is blown across. */
export const WindsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, at, length, width, height } = useScene();
  const t = frame / fps;
  const aWinds = at('creates monstrous winds', 1.6);
  const aSound = at('faster than the speed of sound', 5);
  const amount = ease(frame, [4, aWinds + 10], [0.25, 1], theme.ease.out);
  const pose: Pose = { pos: [Math.sin(t * 0.3) * 0.5, 2.4, isV ? 12 : 8.4], target: [0, 0, 0], fov: fovFor(isV, 40) };
  // blown across the frame, spinning (day side → night side = left → right)
  const blow = ease(frame, [aWinds, length], [0, 1], theme.ease.in);
  const hx = lerp(-200, width + 200, blow);
  const hy = isV ? 900 + Math.sin(t * 3) * 60 : 760 + Math.sin(t * 3) * 50;
  return (
    <AbsoluteFill>
      <SpaceBackdrop warm={0.3} />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.03} />
        <Stars count={2000} radius={500} seed={101} />
        <Glow position={[-40, 2, -10]} scale={40} color={theme.color.star} opacity={0.6} />
        <PlanetBody kind="hd" radius={2.2} t={t * 4} sunDir={[-1, 0, 0.15]} heat={1.4} ambient={0.015} />
        <WindStreams t={t} radius={2.2} amount={amount} speed={1 + amount * 1.5} />
      </SceneCanvas>
      <Tag text="Thousands of km per hour" from={aWinds + 6} to={aSound} x={isV ? 490 : width / 2} y={isV ? 330 : 140} color={theme.color.sky} />
      <Tag text="Faster than sound" from={aSound} x={isV ? 490 : width / 2} y={isV ? 330 : 140} color={theme.color.glass} size={isV ? 48 : 46} />
      {frame >= aWinds - 4 ? (
        <Host
          x={hx}
          y={hy}
          height={isV ? 300 : 300}
          pose="astronaut"
          poseAt={aWinds}
          rotate={blow * 720 + Math.sin(t * 8) * 10}
          bubbles={[{ expr: 'dizzy', from: aWinds + 6, hold: (length - aWinds) / fps }]}
          fx={[{ type: 'sweat', from: aWinds, to: length }]}
          bubbleSide="left"
        />
      ) : null}
    </AbsoluteFill>
  );
};
