import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

/** Colour grade: lift shadows toward navy, cool highlights. */
export const Grade: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: 'rgba(10,40,90,0.10)', mixBlendMode: 'soft-light', pointerEvents: 'none' }} />
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, rgba(0,20,40,0.18) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,10,25,0.30) 100%)',
        pointerEvents: 'none',
      }}
    />
  </>
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.62 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

/** Procedural film grain; seed changes every frame (deterministic). */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 97} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
