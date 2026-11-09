import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { theme } from '../theme';
import type { Timeline } from '../timing';

/**
 * Safe areas.
 * - Vertical (TikTok/Reels/Shorts): the top ~12% (tabs), the bottom ~27%
 *   (caption, username, music) and a ~150px column on the right (like/share
 *   buttons) are covered by the app UI. Captions sit above the bottom block and
 *   are shifted left of the button column.
 * - Wide: classic title-safe lower third.
 */
export const captionBox = (width: number, height: number) =>
  height > width
    ? { left: 70, right: 170, bottom: Math.round(height * 0.285), fontSize: 60, maxLines: 3 }
    : { left: 260, right: 260, bottom: Math.round(height * 0.085), fontSize: 54, maxLines: 2 };

export const Captions: React.FC<{ timeline: Timeline }> = ({ timeline }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const lines = timeline.scenes.flatMap((s) => s.lines);
  const idx = lines.findIndex((l, i) => {
    const next = lines[i + 1];
    const hold = Math.round(0.35 * fps);
    const until = next ? Math.min(l.end + hold, next.start - 1) : l.end + hold;
    return frame >= l.start - 2 && frame <= until;
  });
  if (idx < 0) return null;
  const line = lines[idx];
  if (line.onScreen) return null;
  const next = lines[idx + 1];
  const until = next ? Math.min(line.end + Math.round(0.35 * fps), next.start - 1) : line.end + Math.round(0.35 * fps);
  const box = captionBox(width, height);
  const out = interpolate(frame, [until - 6, until], [1, 0], {
    easing: theme.ease.in,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const words = line.text.split(' ');
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: box.left,
          right: box.right,
          bottom: box.bottom,
          display: 'flex',
          justifyContent: 'center',
          opacity: out,
        }}
      >
        <div
          style={{
            fontFamily: theme.font.body,
            fontWeight: 800,
            fontSize: box.fontSize,
            lineHeight: 1.18,
            color: theme.color.text,
            textAlign: 'center',
            textWrap: 'balance' as React.CSSProperties['textWrap'],
            padding: '14px 26px',
            borderRadius: 22,
            background: 'linear-gradient(180deg, rgba(2,8,22,0.42), rgba(2,8,22,0.62))',
            boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(2px)',
          }}
        >
          {words.map((w, i) => {
            const p = spring({ frame: frame - line.start - i * 2, fps, config: theme.spring.smooth });
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  opacity: p,
                  transform: `translateY(${(1 - p) * 18}px) scale(${0.94 + 0.06 * p})`,
                  marginRight: i < words.length - 1 ? '0.26em' : 0,
                  textShadow: '0 3px 14px rgba(0,0,0,0.85)',
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
