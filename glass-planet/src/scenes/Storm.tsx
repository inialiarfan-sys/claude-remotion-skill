import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Punch, Tag } from '../components/Text';
import { Host } from '../components/Host';
import { PlanetBody, Stars } from '../three/parts';
import { GlassShards } from '../three/Effects3D';
import { ease, lerp, mulberry32 } from '../lib/anim';
import type { Pose } from '../three/camera';
import { theme } from '../theme';
import { fovFor, hostSpot } from './layout';

/** 11 · THE shot: dive into the atmosphere, into a sideways storm of glass. */
export const StormScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, at, length, width } = useScene();
  const t = frame / fps;
  const aGlass = at('glass in the clouds', 1.8);
  const aRain = at('rain made of glass', 6.5);
  const aStand = at('standing there would be', 9.4);
  const aBlades = at('millions of tiny blades', 12);
  // 1) dive
  const dive = ease(frame, [0, aGlass + 6], [0, 1], theme.ease.in);
  const inside = ease(frame, [aGlass - 4, aGlass + 8], [0, 1], theme.ease.inOut);
  // 2) storm builds to the peak on "millions of tiny blades"
  const build = ease(frame, [aGlass, aBlades], [0.25, 1], theme.ease.in);
  const peak = ease(frame, [aBlades - 6, aBlades + 4], [0, 1], theme.ease.out);
  const intensity = Math.min(1.25, build + peak * 0.25);
  const shakeAmp = 0.04 + intensity * 0.22;
  const shake = [Math.sin(t * 37) * shakeAmp, Math.cos(t * 41) * shakeAmp * 0.7];
  const outsidePose: Pose = { pos: [0, 0.2, lerp(16, 3.1, dive)], target: [0, 0, 0], fov: fovFor(isV, 40) };
  const stormPose: Pose = { pos: [shake[0], shake[1], 18], target: [shake[0] * 2, 0, 0], fov: fovFor(isV, 55), roll: Math.sin(t * 0.7) * 0.05 + shake[0] * 0.1 };
  // lightning-ish flashes, seeded
  const r = mulberry32(Math.floor(frame / 9) + 7);
  const flash = frame > aGlass && r() < 0.18 * intensity ? r() * 0.45 * intensity : 0;
  // host: appears briefly crying, then is blown out of frame
  const host = hostSpot(isV, 'left');
  const blownOut = ease(frame, [aStand + 40, aStand + 64], [0, 1], theme.ease.in);
  return (
    <AbsoluteFill>
      <SpaceBackdrop />
      {inside < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - inside }}>
          <SceneCanvas pose={outsidePose}>
            <ambientLight intensity={0.03} />
            <Stars count={2000} radius={500} seed={111} />
            <PlanetBody kind="hd" radius={2} t={t * 2} sunDir={[0.7, 0.3, 0.6]} heat={0.5} ambient={0.02} atmoIntensity={2.5} />
          </SceneCanvas>
        </AbsoluteFill>
      ) : null}
      {inside > 0 ? (
        <AbsoluteFill style={{ opacity: inside }}>
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at 40% 45%, #1f56e0 0%, #0b2a90 45%, #030b2c 100%)` }} />
          <SceneCanvas pose={stormPose} envIntensity={1.4}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[-4, 6, 8]} intensity={3} color="#e6f4ff" />
            <fog attach="fog" args={['#0b2a90', 10, 60]} />
            <GlassShards t={t} count={Math.round(1400 + 1200 * intensity)} speed={28 + 70 * intensity} span={[90, 50, 50]} center={[0, 0, -8]} size={0.9} fall={0.12} intensity={Math.min(1, 0.5 + intensity * 0.5)} />
          </SceneCanvas>
          <AbsoluteFill style={{ background: '#dff6ff', opacity: flash + peak * (1 - ease(frame, [aBlades + 4, aBlades + 20], [0, 1])) * 0.5, mixBlendMode: 'screen' }} />
        </AbsoluteFill>
      ) : null}
      <Tag text="Glass in the clouds + supersonic winds" from={aGlass + 6} to={aRain} x={isV ? 490 : width / 2} y={isV ? 330 : 140} color={theme.color.glass} size={isV ? 30 : 38} />
      <Punch text="Glass rain. Sideways." from={aRain + 10} to={aStand - 2} color={theme.color.glass} size={isV ? 96 : 110} />
      <Punch text="Millions of tiny blades" from={aBlades} to={length} color="#ffffff" size={isV ? 92 : 108} />
      {frame >= aStand - 4 && blownOut < 1 ? (
        <Host
          x={host.x + blownOut * (isV ? 1300 : 2200)}
          y={host.y + Math.sin(t * 9) * 8 - blownOut * 160}
          height={host.height}
          pose="astronaut"
          poseAt={aStand}
          rotate={blownOut * 540 + Math.sin(t * 13) * 6}
          bubbles={[{ expr: 'crying', from: aStand + 2, hold: 1.2 }]}
          bubbleSide="right"
        />
      ) : null}
    </AbsoluteFill>
  );
};
