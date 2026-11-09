import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';
import { ease, mulberry32 } from '../lib/anim';
import type { SceneLine } from './SceneContext';

/**
 * Keeps every scene alive and in step with the voice:
 * - a slow push-in across the whole scene,
 * - a soft zoom "breath" at the start of every spoken line,
 * - gentle hand-held drift and roll.
 */
export const SceneMotion: React.FC<{ lines: SceneLine[]; length: number; seed: number; children: React.ReactNode }> = ({
  lines,
  length,
  seed,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const push = ease(frame, [0, length], [0, 0.045], theme.ease.inOut);
  let breath = 0;
  for (const l of lines) {
    const k = frame - l.from;
    if (k >= 0 && k < 36) breath = Math.max(breath, Math.sin((k / 36) * Math.PI) * 0.014);
  }
  const s = 1.03 + push + breath;
  const x = Math.sin(t * 0.23 + seed) * 7 + Math.sin(t * 0.61 + seed * 2) * 2;
  const y = Math.cos(t * 0.19 + seed) * 6 + Math.sin(t * 0.53 + seed) * 2;
  const r = Math.sin(t * 0.13 + seed) * 0.3;
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`, willChange: 'transform' }}>
      {children}
    </AbsoluteFill>
  );
};

/** Incoming scene: fade + zoom settle + defocus → focus. */
export const TransitionIn: React.FC<{ frames: number; first: boolean; children: React.ReactNode }> = ({
  frames,
  first,
  children,
}) => {
  const frame = useCurrentFrame();
  if (first) return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = ease(frame, [0, frames], [0, 1], theme.ease.out);
  const o = ease(frame, [0, frames * 0.7], [0, 1], theme.ease.inOut);
  const blur = (1 - p) * 12;
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        transform: `scale(${1.14 - 0.14 * p})`,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Light-leak flash that sweeps across each scene change. */
export const LightLeaks: React.FC<{ cuts: number[] }> = ({ cuts }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const near = cuts.find((c) => Math.abs(frame - c) < 18);
  if (near === undefined) return null;
  const k = frame - near;
  const o = interpolate(k, [-18, 0, 18], [0, 0.42, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.inOut });
  const x = interpolate(k, [-18, 18], [-0.3, 1.3]) * width;
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen', pointerEvents: 'none', opacity: o }}>
      <div
        style={{
          position: 'absolute',
          left: x - width * 0.6,
          top: -height * 0.2,
          width: width * 1.2,
          height: height * 1.4,
          transform: 'rotate(18deg)',
          background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(95,244,255,0.55) 40%, rgba(255,255,255,0.9) 50%, rgba(95,244,255,0.55) 60%, rgba(0,0,0,0) 100%)`,
          filter: 'blur(30px)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Out-of-focus foreground particles drifting past the lens (depth + motion). */
export const Bokeh: React.FC<{ count?: number }> = ({ count = 24 }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;
  const r = mulberry32(2024);
  const dots = Array.from({ length: count }, () => ({
    x: r(),
    y: r(),
    s: 8 + r() ** 2 * 70,
    v: 0.012 + r() * 0.03,
    w: r() * 6,
    a: 0.05 + r() * 0.16,
    cyan: r() > 0.4,
  }));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
      {dots.map((d, i) => {
        const yy = (((d.y - t * d.v) % 1) + 1) % 1;
        const xx = d.x + Math.sin(t * 0.3 + d.w) * 0.02;
        const tw = 0.75 + 0.25 * Math.sin(t * 1.3 + d.w * 3);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: xx * width - d.s / 2,
              top: yy * (height + 160) - 80 - d.s / 2,
              width: d.s,
              height: d.s,
              borderRadius: '50%',
              background: d.cyan
                ? 'radial-gradient(circle, rgba(170,250,255,1) 0%, rgba(95,244,255,0.5) 45%, rgba(95,244,255,0) 70%)'
                : 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(220,235,255,0.45) 45%, rgba(220,235,255,0) 70%)',
              opacity: d.a * tw,
              filter: `blur(${1 + d.s / 14}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** "02 — Two distant worlds" chapter card at the top of a scene. */
export const ChapterTag: React.FC<{ index: number; title: string; from: number }> = ({ index, title, from }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const isV = height > width;
  const k = frame - from;
  const dur = Math.round(3.2 * fps);
  if (k < 0 || k > dur) return null;
  const inP = ease(k, [0, 22], [0, 1], theme.ease.out);
  const out = ease(k, [dur - 12, dur], [1, 0], theme.ease.in);
  const line = ease(k, [4, 30], [0, 1], theme.ease.out);
  return (
    <div
      style={{
        position: 'absolute',
        left: isV ? 70 : 96,
        top: isV ? 210 : 70,
        opacity: inP * out,
        transform: `translateY(${(1 - inP) * -16}px)`,
        fontFamily: theme.font.body,
        color: theme.color.text,
        textShadow: '0 2px 12px rgba(0,0,0,0.9)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontWeight: 800, fontSize: isV ? 30 : 26, color: theme.color.cyan, letterSpacing: 2 }}>
          {String(index).padStart(2, '0')}
        </span>
        <span style={{ width: 70 * line, height: 2, background: theme.color.cyan, boxShadow: `0 0 10px ${theme.color.cyan}` }} />
        <span style={{ fontFamily: theme.font.display, fontWeight: 700, fontSize: isV ? 36 : 32, letterSpacing: 1.5 }}>{title}</span>
      </div>
    </div>
  );
};
