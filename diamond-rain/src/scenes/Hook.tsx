import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame } from 'remotion';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { DiamondField } from '../three/DiamondField';
import { Glow, Planet, Stars } from '../three/parts';
import { ease, windowIn } from '../lib/anim';
import { theme } from '../theme';
import type { Pose } from '../three/camera';

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, beat, length, width } = useScene();
  const t = frame / fps;

  // Camera: slow push, then tilt up to "look at the sky", then settle on two distant planets.
  const look = ease(frame, [beat(3), beat(3) + 3 * fps], [0, 1], theme.ease.slow);
  const settle = ease(frame, [beat(5) - 10, length], [0, 1], theme.ease.slow);
  const pose: Pose = {
    pos: [Math.sin(t * 0.15) * 1.5, -4 * look + 2 * settle, 22 - t * 0.35],
    target: [Math.sin(t * 0.1) * 3, 6 + 22 * look - 18 * settle, -100],
    fov: isV ? 62 : 46,
    roll: Math.sin(t * 0.2) * 0.03 + 0.06 * look * (1 - settle),
  };

  const planets = ease(frame, [beat(5), beat(5) + 2 * fps], [0, 1], theme.ease.out);
  const fieldFade = 1 - 0.55 * planets;

  // Title (spoken as line 0)
  const titleIn = (i: number) => spring({ frame: frame - 6 - i * 5, fps, config: theme.spring.soft });
  const titleOut = ease(frame, [beat(2) - 12, beat(2) + 6], [1, 0], theme.ease.in);
  const words = ['The', 'Planet', 'That', 'Rains', 'Diamonds'];
  const titleSize = isV ? 104 : 116;

  return (
    <AbsoluteFill>
      <SpaceBackdrop drift={t / 20} />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[30, 40, 30]} intensity={2.4} color={'#dff6ff'} />
        <pointLight position={[-20, -10, 0]} intensity={600} color={theme.color.teal} />
        <fog attach="fog" args={[theme.color.void, 90, 330]} />
        <Stars count={3000} radius={1200} size={isV ? 3.4 : 3} />
        <DiamondField t={t} opacity={fieldFade} />
        <group position={[0, 10, -260]}>
          <Planet kind="neptune" radius={14 * planets} position={[isV ? 6 : 26, isV ? -10 : -4, 0]} spin={t * 0.05} />
          <Planet kind="uranus" radius={11 * planets} position={[isV ? -6 : -26, isV ? 22 : 4, -10]} tilt={1.7} spin={t * 0.04} rings />
          <Glow scale={90 * planets} color={theme.color.neptune} opacity={0.35 * planets} />
        </group>
      </SceneCanvas>

      {/* Title */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: isV ? 380 : 120,
          opacity: titleOut,
        }}
      >
        <div
          style={{
            fontFamily: theme.font.display,
            fontWeight: 700,
            fontSize: titleSize,
            lineHeight: 1.08,
            color: theme.color.text,
            textAlign: 'center',
            maxWidth: isV ? 900 : width * 0.8,
            textShadow: `0 0 30px rgba(95,244,255,0.65), 0 0 80px rgba(31,181,184,0.45), 0 4px 20px rgba(0,0,0,0.8)`,
          }}
        >
          {words.map((w, i) => {
            const p = titleIn(i);
            const hero = w === 'Diamonds';
            return (
              <span
                key={w}
                style={{
                  display: 'inline-block',
                  margin: `0 ${titleSize * 0.14}px`,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 50}px) scale(${0.9 + 0.1 * p})`,
                  color: hero ? theme.color.ice : undefined,
                  filter: hero ? `drop-shadow(0 0 22px ${theme.color.cyan})` : undefined,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: theme.font.body,
            fontWeight: 600,
            fontSize: isV ? 34 : 30,
            letterSpacing: 10,
            color: theme.color.textDim,
            opacity: windowIn(frame, 30, beat(2) + 6, 20, 12),
            transform: `translateY(${(1 - ease(frame, [30, 55], [0, 1], theme.ease.out)) * 20}px)`,
          }}
        >
          A SHORT SPACE DOCUMENTARY
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
