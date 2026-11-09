import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SceneCanvas } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { HostSprite, Pose as HostPose } from '../components/Host';
import { Stars } from '../three/parts';
import { ease } from '../lib/anim';
import type { Pose } from '../three/camera';
import { theme } from '../theme';

/** Night hill silhouette + sitting host (back view). Shared by scenes 15 and 16. */
export const NightHill: React.FC<{ push: number; drop?: number; pose?: HostPose; poseAt?: number }> = ({ push, drop = 0, pose = 'back', poseAt = -999 }) => {
  const { width, height, isV } = useScene();
  const crestY = isV ? 1020 : 880;
  const hx = isV ? 520 : width * 0.85;
  const hostH = isV ? 440 : 380;
  return (
    <AbsoluteFill style={{ transform: `translateY(${drop}px) scale(${1 + push * 0.06})`, transformOrigin: `${(hx / width) * 100}% ${(crestY / height) * 100}%` }}>
      {/* she sits on the crest: the hill hides her from the waist down */}
      <HostSprite x={hx} y={crestY + hostH * 0.42} height={hostH} pose={pose} poseAt={poseAt} />
      <svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d1830" />
            <stop offset="1" stopColor="#02040b" />
          </linearGradient>
        </defs>
        <path
          d={`M 0 ${crestY + 120} Q ${width * 0.25} ${crestY + 40} ${hx - 160} ${crestY + 8} Q ${hx} ${crestY - 18} ${hx + 180} ${crestY + 10} Q ${width * 0.85} ${crestY + 60} ${width} ${crestY + 30} L ${width} ${height} L 0 ${height} Z`}
          fill="url(#hill)"
          stroke="rgba(150,180,255,0.35)"
          strokeWidth={3}
        />
        {/* grass tufts along the crest */}
        {Array.from({ length: 70 }, (_, i) => {
          const x = (i / 69) * width;
          const d = Math.abs(x - hx) / width;
          const y = crestY - 6 + d * d * 260 + (x < hx ? 8 : 4);
          return <path key={i} d={`M ${x} ${y + 14} q 3 -12 ${(i % 3) - 1 + 4} -20`} stroke="#0d1830" strokeWidth={3} fill="none" />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** 15 · Emotional ending: a quiet night hill under a sky full of stars, slow push in. No bubbles. */
export const ThingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, length } = useScene();
  const t = frame / fps;
  const push = ease(frame, [0, length], [0, 1], theme.ease.inOut);
  const pose: Pose = { pos: [0, 0, 10 - push * 2], target: [0, 4, -40], fov: fovFor0(isV), shift: 0 };
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #050a1e 0%, #0c1636 60%, #1a1f3c 100%)' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(115deg, rgba(0,0,0,0) 30%, rgba(180,170,255,0.10) 45%, rgba(255,220,200,0.08) 52%, rgba(0,0,0,0) 66%)' }} />
      <SceneCanvas pose={pose}>
        <Stars count={5000} radius={300} depth={0.4} seed={151} size={isV ? 4.5 : 4} />
        <Stars count={600} radius={300} depth={0.4} seed={152} size={isV ? 8 : 7} opacity={0.8} />
      </SceneCanvas>
      <NightHill push={push} />
    </AbsoluteFill>
  );
};
const fovFor0 = (isV: boolean) => (isV ? 70 : 50);
