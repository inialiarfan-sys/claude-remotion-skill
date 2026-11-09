import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';

/** Punchy on-screen line (hook cuts): slams in, shakes, holds. */
export const Punch: React.FC<{ text: string; from: number; to: number; color?: string; size?: number; y?: number; tilt?: number }> = ({
  text, from, to, color = theme.color.text, size, y, tilt = -3,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isV = height > width;
  if (frame < from || frame > to) return null;
  const k = frame - from;
  const p = spring({ frame: k, fps, config: { damping: 11, stiffness: 260, mass: 0.6 }, durationInFrames: 14 });
  const shake = k < 8 ? Math.sin(k * 3.3) * (8 - k) * 1.4 : 0;
  const out = interpolate(frame, [to - 4, to], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fs = size ?? (isV ? 104 : 120);
  return (
    <div
      style={{
        position: 'absolute',
        left: isV ? 60 : 120,
        right: isV ? 170 : 120,
        top: y ?? (isV ? 300 : 120),
        textAlign: 'center',
        fontFamily: theme.font.body,
        fontWeight: 800,
        fontSize: fs,
        lineHeight: 1.02,
        letterSpacing: -1,
        textTransform: 'uppercase',
        color,
        opacity: out,
        transform: `translateX(${shake}px) scale(${1.6 - 0.6 * p}) rotate(${tilt * p}deg)`,
        textShadow: `0 0 34px ${color}88, 0 8px 26px rgba(0,0,0,0.9)`,
      }}
    >
      {text}
    </div>
  );
};

/** Small pill tag ("Scientific prediction", "H₂S" …). */
export const Tag: React.FC<{ text: React.ReactNode; from: number; to?: number; x: number; y: number; color?: string; size?: number }> = ({
  text, from, to = Infinity, x, y, color = theme.color.cyan, size = 34,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from || frame > to + 8) return null;
  const p = spring({ frame: frame - from, fps, config: theme.spring.smooth, durationInFrames: 18 });
  const out = Number.isFinite(to) ? interpolate(frame, [to, to + 8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${(1 - p) * 18}px) scale(${0.92 + 0.08 * p})`,
        opacity: p * out,
        padding: `${size * 0.32}px ${size * 0.7}px`,
        borderRadius: 999,
        border: `2px solid ${color}`,
        background: 'rgba(3,8,26,0.62)',
        color,
        fontFamily: theme.font.body,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: 2,
        whiteSpace: 'nowrap',
        textShadow: `0 0 14px ${color}`,
        boxShadow: `0 0 24px ${color}44`,
      }}
    >
      {text}
    </div>
  );
};

/** Cinematic title. */
export const Title: React.FC<{ lines: string[]; from: number; to?: number; y?: number; size?: number; font?: string }> = ({ lines, from, to = Infinity, y, size, font }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isV = height > width;
  if (frame < from) return null;
  const out = Number.isFinite(to) ? interpolate(frame, [to - 10, to], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  const fs = size ?? (isV ? 92 : 104);
  return (
    <div style={{ position: 'absolute', left: isV ? 60 : 0, right: isV ? 170 : 0, top: y ?? (isV ? 270 : 110), textAlign: 'center', opacity: out }}>
      {lines.map((l, i) => {
        const p = spring({ frame: frame - from - i * 8, fps, config: theme.spring.soft, durationInFrames: 40 });
        return (
          <div
            key={i}
            style={{
              fontFamily: font ?? theme.font.display,
              fontWeight: font ? 800 : 700,
              fontSize: i === 0 ? fs : fs * 0.62,
              lineHeight: 1.08,
              color: i === 0 ? theme.color.text : theme.color.cyan,
              letterSpacing: i === 0 ? 2 : 6,
              opacity: p,
              filter: `blur(${(1 - p) * 8}px)`,
              transform: `translateY(${(1 - p) * 30}px)`,
              textShadow: '0 0 40px rgba(79,134,255,0.6), 0 6px 22px rgba(0,0,0,0.9)',
            }}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
};
