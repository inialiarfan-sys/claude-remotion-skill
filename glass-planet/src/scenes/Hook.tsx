import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Host } from '../components/Host';
import { Punch } from '../components/Text';
import { PlanetBody, Stars } from '../three/parts';
import { GasCloud, GlassShards } from '../three/Effects3D';
import { ease } from '../lib/anim';
import { theme } from '../theme';
import type { Pose } from '../three/camera';
import { fovFor, hostSpot } from './layout';

/** 1 · Cold open: hard cuts, one per line. */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, at, length } = useScene();
  const t = frame / fps;
  const cuts = [0, at('glass rain', 3.6), at('winds faster', 4.9), at('1000 degrees', 8), at('smells like rotten', 10.3), length];
  const cut = cuts.findIndex((c, i) => frame >= c && frame < cuts[i + 1]);
  const k = frame - cuts[cut]; // frames into this cut
  const flash = Math.max(0, 1 - k / 5); // white flash on every hard cut
  const shake = k < 10 ? Math.sin(k * 2.9) * (10 - k) * 0.03 : 0;

  // one camera per cut
  const poses: Pose[] = [
    { pos: [0, 0.3, 14 - t * 0.6], target: [0, 0, 0], fov: fovFor(isV, 38) },
    { pos: [shake, shake, 18], target: [0, 0, 0], fov: fovFor(isV, 50) },
    { pos: [shake * 2, 0, 16 - k * 0.04], target: [0, 0, 0], fov: fovFor(isV, 44) },
    { pos: [5.5 + shake, 0.4, 11 - k * 0.015], target: [1.2, 0, 0], fov: fovFor(isV, 40) },
    { pos: [shake, 0, 22 - k * 0.03], target: [0, 0, 0], fov: fovFor(isV, 44) },
  ];
  const pose = poses[Math.max(0, cut)];
  const ring = cut === 2 ? ease(k, [0, 40], [0, 1], theme.ease.out) : 0;
  const host = hostSpot(isV, 'right');
  const floatIn = ease(frame, [cuts[1], cuts[1] + 24], [0, 1], theme.ease.out);
  const shimmer = cut === 3;

  return (
    <AbsoluteFill>
      <SpaceBackdrop warm={cut === 3 ? 0.4 : cut === 4 ? 0 : 0.1} glow={cut === 4 ? 'rgba(120,200,80,0.28)' : undefined} />
      <AbsoluteFill style={{ filter: shimmer ? 'url(#heat)' : undefined }}>
        <SceneCanvas pose={pose}>
          <ambientLight intensity={0.05} />
          <Stars count={2200} radius={600} seed={11} />
          {cut === 0 ? (
            <PlanetBody kind="hd" radius={4.6} t={t} sunDir={[1, 0.3, 0.2]} heat={0.3} ambient={0.01} atmoIntensity={0.6 + t * 0.2} />
          ) : null}
          {cut === 1 ? <GlassShards t={t} count={900} speed={60} span={[70, 40, 40]} size={1.2} /> : null}
          {cut === 2 ? (
            <>
              <PlanetBody kind="hd" radius={3.6} t={t * 3} sunDir={[1, 0.2, 0.4]} heat={0.4} />
              {[0, 1, 2].map((j) => {
                const r = Math.max(0, ring * 1.2 - j * 0.18);
                return (
                  <mesh key={j} rotation={[Math.PI / 2.4, 0, 0]} scale={3.8 + r * 9}>
                    <torusGeometry args={[1, 0.012, 8, 128]} />
                    <meshBasicMaterial color="#cfe8ff" transparent opacity={Math.max(0, 0.8 - r * 0.7)} depthWrite={false} />
                  </mesh>
                );
              })}
              <GlassShards t={t} count={260} speed={70} span={[60, 18, 10]} size={0.5} fall={0.02} />
            </>
          ) : null}
          {cut === 3 ? <PlanetBody kind="hd" radius={4} t={t} sunDir={[0.85, 0.1, -0.35]} heat={1.1} ambient={0.02} atmo="#ff8a3c" atmoIntensity={2.4} /> : null}
          {cut === 4 ? (
            <>
              <PlanetBody kind="hd" radius={3.2} position={[0, -1, -6]} t={t} sunDir={[1, 0.3, 0.4]} heat={0.3} />
              <GasCloud t={t} color={theme.color.green} amount={ease(k, [0, 30], [0.2, 1], theme.ease.out)} spread={16} />
            </>
          ) : null}
        </SceneCanvas>
      </AbsoluteFill>
      {/* heat shimmer distortion for the 1,000° cut */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="heat">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.03" numOctaves="2" seed={frame % 50} />
          <feDisplacementMap in="SourceGraphic" scale="14" />
        </filter>
      </svg>

      <Punch text="The worst planet ever discovered" from={4} to={cuts[1] - 1} size={isV ? 88 : 96} tilt={-2} />
      <Punch text="Glass rain" from={cuts[1]} to={cuts[2] - 1} color={theme.color.glass} />
      <Punch text="Winds faster than sound" from={cuts[2]} to={cuts[3] - 1} color={theme.color.sky} size={isV ? 92 : 104} />
      <Punch text="1,000°C" from={cuts[3]} to={cuts[4] - 1} color="#ffb36b" size={isV ? 150 : 170} />
      <Punch text="Smells like rotten eggs" from={cuts[4]} to={length} color={theme.color.green} size={isV ? 90 : 100} />

      {frame >= cuts[1] ? (
        <Host
          x={host.x + (1 - floatIn) * 500}
          y={host.y + Math.sin(t * 1.6) * 10}
          height={host.height}
          pose="astronaut"
          poseAt={cuts[1]}
          rotate={Math.sin(t * 1.2) * 6 + (cut === 2 ? Math.sin(t * 9) * 8 : 0)}
          bubbles={[
            { expr: 'surprised', from: cuts[1] + 8, hold: (cuts[2] - cuts[1]) / fps + 0.4 },
            { expr: 'dizzy', from: cuts[2] + 6, hold: 2.6 },
            { expr: 'sad', from: cuts[4] + 10, hold: 2 },
          ]}
          fx={[
            { type: 'bang', from: cuts[1] + 4, to: cuts[2] },
            { type: 'sweat', from: cuts[3], to: cuts[4] },
            { type: 'stink', from: cuts[4] + 6, to: length },
          ]}
          bubbleSide="left"
        />
      ) : null}
      <AbsoluteFill style={{ background: '#fff', opacity: cut > 0 ? flash * 0.7 : 0, mixBlendMode: 'screen' }} />
    </AbsoluteFill>
  );
};
