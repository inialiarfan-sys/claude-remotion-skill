import React from 'react';
import { spring, useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../theme';
import { useScene } from './SceneContext';

/**
 * Floating HTML label (3-property entrance: fade + rise + scale, faster exit).
 * `x`,`y` are pixel positions of the anchor; align picks which side the text sits.
 */
export const Label: React.FC<{
  x: number;
  y: number;
  from: number;
  to?: number;
  title: string;
  sub?: string;
  align?: 'center' | 'left' | 'right';
  size?: number;
  color?: string;
  dot?: boolean;
  /** where the text block sits relative to (x, y) */
  anchor?: 'center' | 'above' | 'below';
}> = ({ x, y, from, to = Infinity, title, sub, align = 'center', size, color = theme.color.text, dot, anchor = 'center' }) => {
  const frame = useCurrentFrame();
  const { fps, isV, width } = useScene();
  const p = spring({ frame: frame - from, fps, config: theme.spring.smooth });
  const out = interpolate(frame, [to - 10, to], [1, 0], {
    easing: theme.ease.in,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const o = p * out;
  if (o <= 0.001) return null;
  const fs = size ?? (isV ? 46 : 40);
  const breathe = Math.sin((frame / fps) * 1.6) * 3;
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0%';
  // keep the label inside the safe area (estimated text width; vertical avoids the right-hand buttons)
  const est = Math.max(title.length * fs * 0.78, (sub?.length ?? 0) * fs * 0.62 * 0.56) + (dot ? fs : 0);
  const minL = isV ? 60 : 80;
  const maxR = width - (isV ? 170 : 80);
  const leftEdge = align === 'center' ? x - est / 2 : align === 'right' ? x - est : x;
  const cx = x + Math.max(0, minL - leftEdge) - Math.max(0, leftEdge + est - maxR);
  return (
    <div
      style={{
        position: 'absolute',
        left: cx,
        top: y,
        transform: `translate(${tx}, ${anchor === 'above' ? '-100%' : anchor === 'below' ? '0%' : '-50%'}) translateY(${(1 - p) * 26 + breathe}px) scale(${0.92 + 0.08 * p})`,
        opacity: o,
        textAlign: align,
        whiteSpace: 'nowrap',
        fontFamily: theme.font.body,
        color,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontSize: fs,
          fontWeight: 800,
          letterSpacing: fs * 0.06,
          textTransform: 'uppercase',
          textShadow: `0 0 18px rgba(95,244,255,0.55), 0 2px 10px rgba(0,0,0,0.9)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          gap: 14,
        }}
      >
        {dot ? (
          <span
            style={{
              width: fs * 0.32,
              height: fs * 0.32,
              borderRadius: 99,
              background: theme.color.cyan,
              boxShadow: `0 0 16px ${theme.color.cyan}`,
            }}
          />
        ) : null}
        {title}
      </div>
      {sub ? (
        <div
          style={{
            marginTop: 6,
            fontSize: fs * 0.62,
            fontWeight: 500,
            letterSpacing: 1,
            color: theme.color.textDim,
            textShadow: '0 2px 10px rgba(0,0,0,0.95)',
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};
