import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { CameraRig, Pose } from '../three/camera';
import { Environment } from '../three/parts';
import { useScene } from './SceneContext';

/** Full-frame transparent R3F canvas driven by a deterministic camera pose. */
export const SceneCanvas: React.FC<{
  pose: Pose;
  children: React.ReactNode;
  envIntensity?: number;
  style?: React.CSSProperties;
}> = ({ pose, children, envIntensity = 1, style }) => {
  const { width, height } = useScene();
  return (
    <AbsoluteFill style={style}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: pose.fov, position: pose.pos, near: 0.05, far: 6000 }}
      >
        <CameraRig pose={pose} />
        <Environment intensity={envIntensity} />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** Deep-space backdrop: gradient + nebula haze (never a flat colour). */
export const SpaceBackdrop: React.FC<{ tint?: string; glow?: string; drift?: number }> = ({
  tint = '#03122b',
  glow = 'rgba(31,181,184,0.16)',
  drift = 0,
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 80% at ${30 + drift * 10}% ${25 + drift * 6}%, ${glow} 0%, rgba(0,0,0,0) 55%),
        radial-gradient(90% 70% at ${78 - drift * 8}% ${80 - drift * 5}%, rgba(31,79,209,0.18) 0%, rgba(0,0,0,0) 60%),
        linear-gradient(180deg, ${tint} 0%, #01030a 100%)`,
    }}
  />
);
