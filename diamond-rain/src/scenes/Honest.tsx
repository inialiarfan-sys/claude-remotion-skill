import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame } from 'remotion';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Planet, Stars } from '../three/parts';
import { ease } from '../lib/anim';
import { Pose } from '../three/camera';
import { theme } from '../theme';

/** A calm, serious beat: slow camera, dim planet, one statement. */
export const HonestScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, beat, length } = useScene();
  const t = frame / fps;

  const pose: Pose = {
    pos: [0, 0, 30 - t * 0.12],
    target: [0, -2 - t * 0.02, 0],
    fov: isV ? 58 : 40,
    shift: 0,
  };
  const words = ['Nobody', 'has', 'actually', 'seen', 'diamond', 'rain.'];
  const statementOut = ease(frame, [length - 12, length], [1, 0.0], theme.ease.in);
  const chips = ['Scientific idea', 'Backed by lab experiments', 'Not yet observed'];
  const fs = isV ? 92 : 96;

  return (
    <AbsoluteFill>
      <SpaceBackdrop tint="#020a1a" glow="rgba(31,79,209,0.10)" drift={t / 40} />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.02} />
        <directionalLight position={[10, 6, -14]} intensity={2.4} color={'#cfe0ff'} />
        <Stars count={2400} radius={900} seed={44} opacity={0.75} />
        <Planet kind="neptune" radius={isV ? 13 : 16} position={[0, isV ? -21 : -21, -6]} spin={t * 0.02} />
      </SceneCanvas>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: isV ? 70 : 200,
          paddingRight: isV ? 150 : 200,
          paddingBottom: isV ? 560 : 160,
          opacity: statementOut,
        }}
      >
        <div
          style={{
            fontFamily: theme.font.display,
            fontWeight: 700,
            fontSize: fs,
            lineHeight: 1.14,
            textAlign: 'center',
            color: theme.color.text,
            textShadow: '0 0 40px rgba(95,244,255,0.25), 0 4px 20px rgba(0,0,0,0.9)',
          }}
        >
          {words.map((w, i) => {
            const p = spring({ frame: frame - beat(1) - i * 6, fps, config: theme.spring.smooth, durationInFrames: 40 });
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  marginRight: i < words.length - 1 ? fs * 0.26 : 0,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 24}px)`,
                  filter: `blur(${(1 - p) * 6}px)`,
                  color: w.startsWith('diamond') || w.startsWith('rain') ? theme.color.ice : undefined,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 44 }}>
          {chips.map((c, i) => {
            const p = spring({ frame: frame - beat(2) - i * 5, fps, config: theme.spring.smooth });
            return (
              <div
                key={c}
                style={{
                  fontFamily: theme.font.body,
                  fontWeight: 700,
                  fontSize: isV ? 30 : 28,
                  letterSpacing: 1,
                  color: i === 2 ? '#ffd2a8' : theme.color.ice,
                  padding: '12px 22px',
                  borderRadius: 999,
                  border: `2px solid ${i === 2 ? 'rgba(255,210,168,0.6)' : 'rgba(191,246,255,0.5)'}`,
                  background: 'rgba(2,10,24,0.55)',
                  opacity: p,
                  transform: `translateY(${(1 - p) * 20}px) scale(${0.94 + 0.06 * p})`,
                }}
              >
                {c}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
