import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Tag } from '../components/Text';
import { Host } from '../components/Host';
import { Host3DOverlay } from '../components/Host3DFx';
import { Glow, PlanetBody, Stars } from '../three/parts';
import { GlassShards } from '../three/Effects3D';
import { Host3D } from '../three/Host3D';
import { ease, lerp } from '../lib/anim';
import type { Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';
import { fovFor, hostSpot } from './layout';

/** 14 · Peaceful blue marble → deadly up close → pull back, cross-fade to Earth; host lands, changes outfit. */
export const MarbleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, at, length, width } = useScene();
  const t = frame / fps;
  const aClose = at('up close it may be', 3.7);
  const aSpecial = at('it makes you realize', 7.9);
  const aRain = at('soft rain fresh air', 11.8);
  const aHome = at('out there among thousands', 15.4);
  const close = ease(frame, [aClose - 6, aClose + 30], [0, 1], theme.ease.inOut) * (1 - ease(frame, [aSpecial - 10, aSpecial + 20], [0, 1], theme.ease.inOut));
  const toEarth = ease(frame, [aSpecial, aSpecial + 40], [0, 1], theme.ease.inOut);
  const poseHD: Pose = { pos: [0, 0.3, lerp(isV ? 26 : 17, 4.4, close)], target: [0, 0, 0], fov: fovFor(isV, 38) };
  // Earth: warm and alive; she lands on top and changes into her dress
  const ER = 2.2;
  const land = ease(frame, [aSpecial + 20, aSpecial + 50], [0, 1], theme.ease.out);
  const changed = aSpecial + 52;
  const earthPose: Pose = { pos: [Math.sin(t * 0.12) * 1.5, 1.6, (isV ? 11 : 8) + (1 - toEarth) * 6], target: [0, isV ? 1.9 : 1.2, 0], fov: fovFor(isV, 40) };
  const feet: Vec3 = [0, ER + (1 - land) * 3, 0];
  const host = hostSpot(isV, 'right');
  return (
    <AbsoluteFill>
      <SpaceBackdrop warm={0.1 + toEarth * 0.25} glow={`rgba(${Math.round(52 + 150 * toEarth)},${Math.round(96 + 60 * toEarth)},255,0.22)`} />
      {toEarth < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - toEarth }}>
          <SceneCanvas pose={poseHD}>
            <ambientLight intensity={0.02} />
            <Stars count={2400} radius={600} seed={141} />
            <PlanetBody kind="hd" radius={2} t={t} sunDir={[0.8, 0.3, 0.5]} heat={0.3 + close * 0.8} ambient={0.02} />
            {close > 0.05 ? <GlassShards t={t} count={600} speed={45} span={[20, 10, 4]} center={[0, 0, 2.6]} size={0.18} intensity={close} /> : null}
          </SceneCanvas>
        </AbsoluteFill>
      ) : null}
      {toEarth > 0 ? (
        <AbsoluteFill style={{ opacity: toEarth }}>
          <SceneCanvas pose={earthPose}>
            <ambientLight intensity={0.08} />
            <Stars count={2400} radius={600} seed={142} />
            <Glow position={[-30, 12, -30]} scale={30} color="#ffe2b0" opacity={0.7} />
            <PlanetBody kind="earth" radius={ER} t={t} rotation={[0.3, t * 0.08, 0]} sunDir={[-0.7, 0.5, 0.5]} ambient={0.12} atmoIntensity={1.8} />
            <Host3D position={feet} height={1.4} pose={frame >= changed ? 'casual' : 'astronaut'} poseAt={frame >= changed ? changed : aSpecial + 50} />
          </SceneCanvas>
          <Host3DOverlay
            pose={earthPose}
            feet={feet}
            height={1.4}
            bubbles={[{ expr: 'happy', from: changed + 6, hold: 2.2 }]}
            fx={[{ type: 'sparkle', from: changed - 8, to: aHome }]}
          />
        </AbsoluteFill>
      ) : null}
      <Tag text="A peaceful blue marble?" from={10} to={aClose} x={isV ? 490 : width / 2} y={isV ? 330 : 140} color={theme.color.cobaltGlow} size={isV ? 36 : 38} />
      <Tag text="One of the deadliest places we know" from={aClose + 8} to={aSpecial} x={isV ? 490 : width / 2} y={isV ? 330 : 140} color={theme.color.pink} size={isV ? 30 : 38} />
      <Tag text="Soft rain · fresh air · life" from={aRain} to={aHome} x={isV ? 490 : width / 2} y={isV ? 330 : 140} color={theme.color.mint} size={isV ? 36 : 38} />
      <Tag text="Home" from={aHome + 10} x={isV ? 490 : width / 2} y={isV ? 330 : 140} color={theme.color.butter} size={isV ? 48 : 48} />
      {/* before landing she floats nearby in her suit */}
      {frame < aSpecial + 22 ? (
        <Host
          x={host.x}
          y={host.y + Math.sin(t * 1.2) * 10}
          height={host.height}
          pose="astronaut"
          rotate={Math.sin(t) * 5}
          opacity={1 - ease(frame, [aSpecial + 8, aSpecial + 22], [0, 1])}
          bubbles={[{ expr: 'sad', from: aClose + 10, hold: 1.6 }]}
          bubbleSide="left"
        />
      ) : null}
    </AbsoluteFill>
  );
};
