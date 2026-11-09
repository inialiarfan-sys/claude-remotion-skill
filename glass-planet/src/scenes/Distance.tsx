import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Tag } from '../components/Text';
import { Host3DOverlay } from '../components/Host3DFx';
import { ADD, Glow, PlanetBody, Stars, Star } from '../three/parts';
import { Host3D } from '../three/Host3D';
import { ease, lerp } from '../lib/anim';
import { project, Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';
import { fovFor } from './layout';

/** 5 · A beam of light travels from the star to Earth: 64 light-years. Host walks along it. */
export const DistanceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, at, length, width, height } = useScene();
  const t = frame / fps;
  const S: Vec3 = [-7, 0, 0];
  const E: Vec3 = [7, 0, 0];
  const grow = ease(frame, [6, length * 0.75], [0, 1], theme.ease.inOut);
  const head = lerp(S[0] + 1.3, E[0] - 0.6, grow);
  const len = head - (S[0] + 1.3);
  const pose: Pose = {
    pos: [Math.sin(t * 0.2) * 1.2, 3.2, isV ? 27 : 17.5],
    target: [0, isV ? 2.6 : 1.3, 0],
    fov: fovFor(isV, 40),
  };
  const hostX = lerp(-4.2, 2.6, ease(frame, [10, length], [0, 1], theme.ease.inOut));
  const feet: Vec3 = [hostX, 0.07, 0];
  const mid = project(pose, width, height, [0, -0.9, 0]);
  const sL = project(pose, width, height, [S[0], 1.9, 0]);
  const eL = project(pose, width, height, [E[0], 1.1, 0]);
  return (
    <AbsoluteFill>
      <SpaceBackdrop drift={t / 25} warm={0.15} />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.1} />
        <Stars count={2600} radius={600} seed={51} />
        <Star radius={1.3} position={S} t={t} />
        <PlanetBody kind="earth" radius={0.6} position={E} t={t} sunDir={[-1, 0.1, 0.4]} ambient={0.08} />
        {/* the beam */}
        <mesh position={[S[0] + 1.3 + len / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, Math.max(0.001, len), 12]} />
          <meshBasicMaterial color="#fff6e0" toneMapped={false} />
        </mesh>
        <mesh position={[S[0] + 1.3 + len / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.14, 0.14, Math.max(0.001, len), 16]} />
          <meshBasicMaterial color={theme.color.star} transparent opacity={0.25} depthWrite={false} {...ADD} />
        </mesh>
        <Glow position={[head, 0, 0]} scale={1.8} color="#fff1d0" opacity={grow < 1 ? 1 : 0.3} />
        <Host3D position={feet} height={isV ? 4.2 : 3.2} pose="astronaut" walking />
      </SceneCanvas>
      <Tag text="HD 189733" from={8} x={sL.x} y={sL.y - 30} color={theme.color.star} size={30} />
      <Tag text="Earth" from={length * 0.6} x={eL.x} y={eL.y - 30} color={theme.color.sky} size={30} />
      <Tag text="← 64 light-years →" from={at('64 light', 1)} x={mid.x} y={mid.y + (isV ? 40 : 30)} color={theme.color.butter} size={isV ? 40 : 38} />
      <Host3DOverlay
        pose={pose}
        feet={feet}
        height={isV ? 4.2 : 3.2}
        bubbles={[{ expr: 'confused', from: at('how do we know', 3), hold: 1.8 }]}
        fx={[{ type: 'question', from: at('how do we know', 3), to: length }]}
      />
    </AbsoluteFill>
  );
};
