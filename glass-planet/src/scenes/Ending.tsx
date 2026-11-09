import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame } from 'remotion';
import { SceneCanvas } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Stars } from '../three/parts';
import { ease } from '../lib/anim';
import type { Pose } from '../three/camera';
import { theme } from '../theme';
import { NightHill } from './Thing';

/** 16 · Pull back to the stars; "This is only the beginning."; she turns and waves; fade out. */
export const EndingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, at, length, height } = useScene();
  const pull = ease(frame, [0, length], [0, 1], theme.ease.inOut);
  const aBegin = at('this is only the beginning', 2.4);
  const turn = Math.round(at('truly amazing', 0.8));
  const wave = turn + 14;
  const pose: Pose = { pos: [0, 0, 8 + pull * 40], target: [0, 4 + pull * 6, -40], fov: isV ? 70 : 50, shift: 0 };
  const fadeOut = ease(frame, [length - 24, length - 2], [1, 0], theme.ease.in);
  const words = ['This', 'is', 'only', 'the', 'beginning.'];
  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: 'linear-gradient(180deg, #050a1e 0%, #0c1636 60%, #1a1f3c 100%)' }}>
      <SceneCanvas pose={pose}>
        <Stars count={5000} radius={300} depth={0.4} seed={151} size={isV ? 4.5 : 4} />
        <Stars count={600} radius={300} depth={0.4} seed={152} size={isV ? 8 : 7} opacity={0.8} />
        <Stars count={4000} radius={1200} depth={0.9} seed={153} size={3} />
      </SceneCanvas>
      <NightHill push={1 - pull} drop={pull * height * (isV ? 0.05 : 0.03)} pose={frame >= wave ? 'waving' : frame >= turn ? 'side_other' : 'back'} poseAt={frame >= wave ? wave : turn} />
      <div
        style={{
          position: 'absolute',
          left: isV ? 60 : 0,
          right: isV ? 170 : 0,
          top: isV ? 330 : 170,
          textAlign: 'center',
          fontFamily: theme.font.display,
          fontWeight: 700,
          fontSize: isV ? 92 : 100,
          lineHeight: 1.12,
          color: theme.color.text,
          textShadow: '0 0 40px rgba(79,134,255,0.6), 0 6px 22px rgba(0,0,0,0.9)',
        }}
      >
        {words.map((w, i) => {
          const p = spring({ frame: frame - aBegin - i * 5, fps, config: theme.spring.soft, durationInFrames: 36 });
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.26em',
                opacity: p,
                filter: `blur(${(1 - p) * 8}px)`,
                transform: `translateY(${(1 - p) * 30}px)`,
                color: i === 4 ? theme.color.cyan : undefined,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
