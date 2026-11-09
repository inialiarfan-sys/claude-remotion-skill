import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { theme } from '../theme';

/**
 * Big bold number callout that springs in on the spoken word, holds, pops out.
 * Positioned in the upper safe area (clear of captions, host and TikTok UI).
 */
export const BigNumber: React.FC<{ at: number; hold?: number; value: string; label?: string; color?: string; y?: number }> = ({
  at,
  hold = 2.4,
  value,
  label,
  color = theme.color.text,
  y,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isV = height > width;
  const k = frame - at;
  const end = Math.round(hold * fps);
  if (k < -2 || k > end + 8) return null;
  const p = spring({ frame: k, fps, config: theme.spring.bouncy, durationInFrames: 22 });
  const out = interpolate(k, [end, end + 8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.in });
  const outScale = interpolate(k, [end, end + 8], [1, 1.15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const size = isV ? 150 : 150;
  return (
    <div
      style={{
        position: 'absolute',
        left: isV ? 70 : 0,
        right: isV ? 170 : 0,
        top: y ?? (isV ? 250 : 90),
        textAlign: 'center',
        opacity: Math.min(1, p * 1.5) * out,
        transform: `scale(${(0.6 + 0.4 * p) * outScale}) rotate(${(1 - p) * -4}deg)`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: theme.font.body,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: -2,
          color,
          textShadow: `0 0 40px ${color === theme.color.text ? 'rgba(127,240,255,0.55)' : color}, 0 6px 24px rgba(0,0,0,0.85)`,
          WebkitTextStroke: '2px rgba(0,0,0,0.25)',
        }}
      >
        {value}
      </div>
      {label ? (
        <div
          style={{
            marginTop: 8,
            fontFamily: theme.font.body,
            fontWeight: 700,
            fontSize: isV ? 40 : 38,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: theme.color.textDim,
            textShadow: '0 3px 12px rgba(0,0,0,0.9)',
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};
