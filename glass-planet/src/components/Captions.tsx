import React, { useMemo } from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { theme } from '../theme';
import { captionPages, captionWords, Timeline } from '../lib/timeline';

/**
 * Safe areas.
 * Vertical (TikTok): top ~11% (tabs), bottom ~28% (caption/username/music) and a
 * ~170 px column on the right (like/comment/share) are covered by the app UI.
 * Wide (YouTube): lower-third, clear of the progress bar.
 */
export const captionBox = (width: number, height: number) =>
  height > width
    ? { left: 70, right: 170, bottom: Math.round(height * 0.285), fontSize: 56, maxChars: 19, maxLines: 3 }
    : { left: 330, right: 330, bottom: Math.round(height * 0.07), fontSize: 50, maxChars: 34, maxLines: 2 };

export const Captions: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const box = captionBox(width, height);
  const pages = useMemo(() => captionPages(captionWords(tl.words), box.maxChars, box.maxLines), [tl, box.maxChars, box.maxLines]);
  const t = frame / fps;
  const page = pages.find((p) => t >= p.start - 0.05 && t <= p.end);
  if (!page) return null;
  const inP = spring({ frame: frame - Math.round(page.start * fps) + 2, fps, config: theme.spring.smooth, durationInFrames: 10 });
  const out = interpolate(t, [page.end - 0.12, page.end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
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
          opacity: inP * out,
          transform: `translateY(${(1 - inP) * 16}px) scale(${0.97 + 0.03 * inP})`,
        }}
      >
        <div
          style={{
            fontFamily: theme.font.body,
            fontWeight: 800,
            fontSize: box.fontSize,
            lineHeight: 1.17,
            textAlign: 'center',
            padding: '12px 24px',
            borderRadius: 22,
            background: 'linear-gradient(180deg, rgba(3,8,26,0.45), rgba(3,8,26,0.68))',
            boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
          }}
        >
          {page.lines.map((line, li) => (
            <div key={li} style={{ whiteSpace: 'nowrap' }}>
              {line.map((w, i) => {
                const active = t >= w.start - 0.03 && t < w.end + 0.08;
                const said = t >= w.start - 0.03;
                const pop = spring({ frame: frame - Math.round(w.start * fps), fps, config: theme.spring.pop, durationInFrames: 10 });
                return (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      marginRight: i < line.length - 1 ? '0.27em' : 0,
                      color: active ? theme.color.butter : theme.color.text,
                      opacity: said ? 1 : 0.55,
                      transform: `translateY(${active ? -3 * pop : 0}px)`,
                      textShadow: active
                        ? '0 0 18px rgba(255,220,140,0.75), 0 3px 12px rgba(0,0,0,0.85)'
                        : '0 3px 12px rgba(0,0,0,0.85)',
                    }}
                  >
                    {w.text}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
