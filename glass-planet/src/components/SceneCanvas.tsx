import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { CameraRig, Pose } from '../three/camera';
import { Environment } from '../three/parts';
import { useScene } from './SceneContext';

/** Full-frame transparent R3F canvas driven by a deterministic camera pose. */
export const SceneCanvas: React.FC<{ pose: Pose; children: React.ReactNode; envIntensity?: number; style?: React.CSSProperties }> = ({
  pose,
  children,
  envIntensity = 0.6,
  style,
}) => {
  const { width, height } = useScene();
  return (
    <AbsoluteFill style={style}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: pose.fov, position: pose.pos, near: 0.05, far: 8000 }}
      >
        <CameraRig pose={pose} />
        <Environment intensity={envIntensity} />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** Deep-space backdrop: gradient + slowly drifting nebula (never a flat colour). */
export const SpaceBackdrop: React.FC<{ tint?: string; glow?: string; warm?: number; drift?: number }> = ({
  tint = '#040b24',
  glow = 'rgba(52,96,255,0.22)',
  warm = 0.12,
  drift = 0,
}) => {
  const a = drift * 6;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${tint} 0%, #01030a 100%)`, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 45% at ${30 + Math.sin(a) * 8}% ${28 + Math.cos(a * 0.8) * 6}%, ${glow} 0%, rgba(0,0,0,0) 70%),
            radial-gradient(55% 40% at ${75 + Math.cos(a * 0.7) * 8}% ${70 + Math.sin(a * 0.9) * 6}%, rgba(255,140,60,${warm}) 0%, rgba(0,0,0,0) 70%),
            radial-gradient(40% 30% at ${62 + Math.sin(a * 1.1) * 10}% ${35 + Math.cos(a) * 8}%, rgba(124,77,200,0.14) 0%, rgba(0,0,0,0) 70%)`,
          transform: `scale(1.2) rotate(${Math.sin(a * 0.3) * 4}deg)`,
        }}
      />
    </AbsoluteFill>
  );
};
