import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Tag } from '../components/Text';
import { Host } from '../components/Host';
import { PlanetBody, Stars } from '../three/parts';
import type { Pose } from '../three/camera';
import { theme } from '../theme';
import { fovFor, hostSpot } from './layout';

/** 13 · Calm: slow drift past the planet. "Scientific prediction". */
export const RememberScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, at, width } = useScene();
  const t = frame / fps;
  const aIdea = at('it is a scientific idea', 4);
  const pose: Pose = { pos: [-4 + t * 0.5, 0.6, isV ? 13 : 9], target: [t * 0.25, 0, 0], fov: fovFor(isV, 40) };
  const host = hostSpot(isV, 'left');
  return (
    <AbsoluteFill>
      <SpaceBackdrop drift={t / 40} warm={0.06} />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.02} />
        <Stars count={2600} radius={600} seed={131} />
        <PlanetBody kind="hd" radius={2.6} t={t * 0.5} sunDir={[0.9, 0.35, 0.3]} heat={0.3} ambient={0.015} />
      </SceneCanvas>
      <Tag text="Scientific prediction" from={aIdea - 6} x={isV ? 490 : width / 2} y={isV ? 330 : 140} color={theme.color.textDim} size={isV ? 34 : 34} />
      <Host
        x={host.x}
        y={host.y + Math.sin(t * 1.1) * 12}
        height={host.height}
        pose="astronaut"
        rotate={Math.sin(t * 0.7) * 6}
        bubbles={[{ expr: 'thinking_head', from: 18, hold: 2.6 }]}
        bubbleSide="right"
      />
    </AbsoluteFill>
  );
};
