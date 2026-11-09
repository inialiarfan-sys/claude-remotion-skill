import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Tag } from '../components/Text';
import { Host } from '../components/Host';
import { Host3DOverlay } from '../components/Host3DFx';
import { PlanetBody, Stars, Star } from '../three/parts';
import { OrbitRing } from '../three/Effects3D';
import { Host3D } from '../three/Host3D';
import { ease } from '../lib/anim';
import { project, Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';
import { fovFor, hostSpot } from './layout';

/** 8 · Bigger than Jupiter (host walks on top), then a tight, fast orbit around its star. */
export const GiantScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, at, length, width, height } = useScene();
  const t = frame / fps;
  const aClose = at('sits extremely close', 3.5);
  const aYear = at('one year there lasts', 5.6);
  const aTemp = at('temperature can reach', 9.6);
  const phaseB = ease(frame, [aClose - 12, aClose + 12], [0, 1], theme.ease.inOut);

  // phase A: size comparison
  const HD: Vec3 = isV ? [-1.22, 0.4, 0] : [-1.35, 0, 0];
  const JU: Vec3 = isV ? [1.25, 0.4, 0] : [1.3, 0, 0];
  const RH = 1.13; // HD 189733 b ≈ 1.13 Jupiter radii
  const poseA: Pose = { pos: [Math.sin(t * 0.15) * 0.4, 0.4, isV ? 10.5 : 7.2], target: [0, isV ? 0.4 : 0.05, 0], fov: fovFor(isV, 40) };
  const feet: Vec3 = [HD[0], HD[1] + RH, HD[2]];
  const W = (p: Vec3) => project(poseA, width, height, p);
  const hdL = W([HD[0], HD[1] - RH - 0.25, 0]);
  const juL = W([JU[0], JU[1] - 1.25, 0]);

  // phase B: hugging its star, one orbit ≈ 2 Earth days
  const heat = 0.5 + 1.6 * ease(frame, [aTemp, aTemp + 30], [0, 1], theme.ease.out);
  const ang = (frame - aClose) / fps * 2.4;
  const orbitR = 3.2;
  const P: Vec3 = [Math.cos(ang) * orbitR, 0, Math.sin(ang) * orbitR];
  const poseB: Pose = { pos: [0, isV ? 9 : 5.5, isV ? 15 : 11], target: [0, 0, 0], fov: fovFor(isV, 40) };
  const host = hostSpot(isV, 'right');

  return (
    <AbsoluteFill>
      <SpaceBackdrop drift={t / 25} warm={0.12 + phaseB * 0.25} />
      {phaseB < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - phaseB }}>
          <SceneCanvas pose={poseA}>
            <ambientLight intensity={0.05} />
            <Stars count={2000} radius={500} seed={81} />
            <PlanetBody kind="jupiter" radius={1} position={JU} t={t} sunDir={[-0.8, 0.3, 0.6]} ambient={0.05} />
            <PlanetBody kind="hd" radius={RH} position={HD} rotation={[0, 0, t * 0.35]} t={t} sunDir={[-0.8, 0.3, 0.6]} heat={0.2} ambient={0.04} />
            <Host3D position={feet} height={0.6} pose="astronaut" walking />
          </SceneCanvas>
          <Tag text="HD 189733 b" from={8} to={aClose} x={hdL.x} y={hdL.y} color={theme.color.cobaltGlow} size={30} />
          <Tag text="Jupiter" from={14} to={aClose} x={juL.x} y={juL.y + (isV ? 30 : 30)} color="#e8c9a0" size={30} />
          <Host3DOverlay pose={poseA} feet={feet} height={0.6} bubbles={[{ expr: 'excited', from: 20, hold: 1.6 }]} />
        </AbsoluteFill>
      ) : null}
      {phaseB > 0 ? (
        <AbsoluteFill style={{ opacity: phaseB }}>
          <SceneCanvas pose={poseB}>
            <ambientLight intensity={0.04} />
            <Stars count={2000} radius={500} seed={82} />
            <Star radius={1.5} t={t} intensity={1 + (heat - 0.5) * 0.2} />
            <OrbitRing radius={orbitR} opacity={0.4} color="#ffcf9a" />
            <PlanetBody kind="hd" radius={0.5} position={P} t={t} sunDir={[-P[0], 0, -P[2]]} heat={heat} ambient={0.03} />
          </SceneCanvas>
          <Tag text="Extremely close to its star" from={aClose + 10} to={aYear} x={isV ? 490 : width / 2} y={isV ? 330 : 140} color={theme.color.star} />
          <Host
            x={host.x}
            y={host.y + Math.sin(t * 1.3) * 8}
            height={host.height}
            pose="astronaut"
            poseAt={aTemp}
            bubbles={[{ expr: 'surprised', from: aYear + 6, hold: 1.6 }]}
            fx={[{ type: 'sweat', from: aTemp, to: length }]}
            bubbleSide="left"
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
