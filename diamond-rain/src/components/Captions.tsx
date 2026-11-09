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
  // Karaoke timing: each word lights up when it is spoken (spread by letters across the line).
  const chars = words.map((w) => w.replace(/[^\p{L}\p{N}]/gu, '').length + 1);
  const totalChars = chars.reduce((a, b) => a + b, 0);
  const span = Math.max(1, line.end - line.start);
  let acc = 0;
  const wordAt = chars.map((c) => {
    const at = line.start + (acc / totalChars) * span;
    acc += c;
    return at;
  });
  const boxIn = spring({ frame: frame - line.start + 3, fps, config: theme.spring.smooth, durationInFrames: 14 });
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
          opacity: out * boxIn,
          transform: `translateY(${(1 - boxIn) * 22}px) scale(${0.96 + 0.04 * boxIn})`,
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
          }}
        >
          {words.map((w, i) => {
            const lit = spring({ frame: frame - wordAt[i], fps, config: theme.spring.pop, durationInFrames: 10 });
            const next = i + 1 < words.length ? wordAt[i + 1] : line.end;
            const active = frame >= wordAt[i] - 1 && frame < next + 2;
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  marginRight: i < words.length - 1 ? '0.26em' : 0,
                  opacity: 0.42 + 0.58 * lit,
                  color: active ? theme.color.ice : theme.color.text,
                  transform: `translateY(${(1 - lit) * 6}px) scale(${1 + (active ? 0.05 : 0) * lit})`,
                  textShadow: active
                    ? `0 0 18px rgba(95,244,255,0.8), 0 3px 14px rgba(0,0,0,0.85)`
                    : '0 3px 14px rgba(0,0,0,0.85)',
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
