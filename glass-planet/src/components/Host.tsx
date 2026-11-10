import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import sprites from '../data/sprites.json';
import { theme } from '../theme';

export type Expr =
  | 'happy' | 'excited' | 'angry' | 'sad' | 'surprised' | 'embarrassed' | 'crying' | 'sleepy' | 'confused' | 'dizzy' | 'thinking_head';
export type Pose =
  | 'astronaut' | 'astronaut_sit' | 'waving' | 'thinking' | 'reading' | 'clipboard' | 'holding_sign';

type Meta = { kind: string; w: number; h: number; baseline?: number; anchorX?: number; head?: [number, number, number] };
export const SPRITES = sprites as unknown as Record<string, Meta>;
/**
 * Every sprite is cut at the same pixel scale (scripts/make_sprites.py), so one constant
 * converts "figure height" to sprite pixels for all poses: she never changes size
 * between poses. 612 px = cat-top → feet of the standing walk frames.
 */
export const FIGURE_H = 612;

/** Fraction from the top of a sprite where the cat ends (for the cat wobble). */
export const catLine = (m: Meta) => (m.head ? Math.max(0, (m.head[1] - 0.93 * m.head[2]) / m.h) : 0);

/** Head (helmet) centre and size for a figure whose feet are at (x, y), in px. */
export const headPoint = (x: number, y: number, height: number, pose: Pose = 'astronaut') => {
  const m = SPRITES[pose] ?? SPRITES.astronaut;
  const k = height / FIGURE_H;
  const [hx, hy, r] = m.head ?? [m.w / 2, m.h * 0.4, m.w * 0.4];
  return { x: x + (hx - (m.anchorX ?? m.w / 2)) * k, y: y - ((m.baseline ?? m.h) - hy) * k, size: r * 2 * k * 0.64 };
};

/** Walk cycle: 11 fps, 8 frames. */
export const walkFrame = (frame: number, fps: number) => `walk_${(Math.floor((frame * 11) / fps) % 8) + 1}`;

/** Which sprite to show this frame. */
export const spriteName = (frame: number, fps: number, pose: Pose, walking: boolean) => (walking ? walkFrame(frame, fps) : pose);

/** Life: breathing squash & stretch, walk bob, bounce when the pose changes. */
export const useLife = (poseAt: number, walking: boolean, seed = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const breathe = Math.sin(t * 2.4 + seed);
  const k = frame - poseAt;
  const b = k >= 0 ? spring({ frame: k, fps, config: theme.spring.bouncy, durationInFrames: 24 }) : 1;
  const hop = k >= 0 && k < 14 ? Math.sin((k / 14) * Math.PI) : 0;
  const bob = walking ? Math.abs(Math.sin((frame * 11 * Math.PI) / fps / 2)) : 0;
  return {
    sx: (1 - 0.012 * breathe) * (1.1 - 0.1 * b),
    sy: (1 + 0.016 * breathe) * (0.86 + 0.14 * b),
    lift: hop * 0.05 + bob * 0.006, // fraction of figure height
    catTilt: Math.sin(t * 2.1 + seed) * 3 + (k >= 0 && k < 20 ? Math.sin(k * 0.9) * 6 * (1 - k / 20) : 0),
  };
};

export type HostProps = {
  /** feet position in px (bottom-centre of the figure) */
  x: number;
  y: number;
  /** figure height in px (cat-top → feet) */
  height: number;
  pose?: Pose;
  /** frame at which the current pose started (drives the bounce) */
  poseAt?: number;
  walking?: boolean;
  flip?: boolean;
  rotate?: number;
  opacity?: number;
  shiver?: number;
  seed?: number;
};

/** The host as a flat screen-space sprite (2D scenes / overlays). */
export const HostSprite: React.FC<HostProps> = ({
  x, y, height, pose = 'astronaut', poseAt = -999, walking = false, flip = false, rotate = 0, opacity = 1, shiver = 0, seed = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const name = spriteName(frame, fps, pose, walking);
  const m = SPRITES[name];
  const life = useLife(poseAt, walking, seed);
  const scale = height / FIGURE_H;
  const w = m.w * scale;
  const h = m.h * scale;
  const below = (m.h - (m.baseline ?? m.h)) * scale; // transparent space under the feet
  const ax = (m.anchorX ?? m.w / 2) * scale; // helmet centre, so poses don't shift sideways
  const catY = catLine(m);
  const jitter = shiver ? Math.sin(frame * 2.7) * 3 * shiver : 0;
  const src = staticFile(`character/${name}.png`);
  const layer = (clip: string, extra: React.CSSProperties = {}) => (
    <Img
      src={src}
      style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, clipPath: clip, ...extra }}
    />
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: x - ax + jitter,
        top: y - h + below - life.lift * height,
        width: w,
        height: h,
        opacity,
        transformOrigin: `${(ax / w) * 100}% ${((h - below) / h) * 100}%`,
        transform: `rotate(${rotate}deg) scale(${(flip ? -1 : 1) * life.sx}, ${life.sy})`,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))',
      }}
    >
      {catY > 0 ? (
        <>
          {layer(`inset(${catY * 100 - 0.4}% 0 0 0)`)}
          {layer(`inset(0 0 ${100 - catY * 100}% 0)`, {
            transformOrigin: `50% ${catY * 100}%`,
            transform: `rotate(${life.catTilt}deg)`,
          })}
        </>
      ) : (
        layer('none')
      )}
    </div>
  );
};

// ----------------------------------------------------------------- reaction bubble
export type Bubble = { expr: Expr; from: number; hold?: number };

/** Round comic pop-up with an expression head; springs in, holds, pops out. */
export const ReactionBubble: React.FC<{ x: number; y: number; size: number; bubbles: Bubble[]; side?: 'left' | 'right' }> = ({
  x, y, size, bubbles, side = 'right',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = [...bubbles].reverse().find((q) => frame >= q.from && frame <= q.from + Math.round((q.hold ?? 1.8) * fps) + 7);
  if (!b) return null;
  const k = frame - b.from;
  const end = Math.round((b.hold ?? 1.8) * fps);
  const p = spring({ frame: k, fps, config: theme.spring.bouncy, durationInFrames: 20 });
  const pop = interpolate(k, [end, end + 7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const wob = Math.sin(frame * 0.25) * 2;
  const dir = side === 'right' ? 1 : -1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        transform: `scale(${p * (1 + pop * 0.25)}) rotate(${wob}deg)`,
        opacity: 1 - pop,
        pointerEvents: 'none',
      }}
    >
      {/* tail pointing to the helmet */}
      <svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <path
          d={`M ${size / 2 - dir * size * 0.18} ${size * 0.82} L ${size / 2 - dir * size * 0.5} ${size * 1.02} L ${size / 2 - dir * size * 0.02} ${size * 0.9} Z`}
          fill="#fffaf6"
          stroke={theme.color.pinkDeep}
          strokeWidth={size * 0.035}
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #ffffff, #fff4f2 70%)',
          border: `${size * 0.035}px solid ${theme.color.pinkDeep}`,
          boxShadow: `0 6px 18px rgba(0,0,0,0.35), inset 0 -6px 0 rgba(255,184,200,0.35)`,
          overflow: 'hidden',
        }}
      >
        <Img
          src={staticFile(`character/${b.expr}.png`)}
          style={{ position: 'absolute', left: '7%', top: '9%', width: '86%', height: '86%', objectFit: 'contain' }}
        />
      </div>
      <BubbleMark expr={b.expr} size={size} k={k} />
    </div>
  );
};

/**
 * Small hand-drawn mark on the bubble so emotions that share a face on the sheet
 * still read differently: tears, anger vein, spiral, zZ, blush lines, heart, "?", "!".
 */
const BubbleMark: React.FC<{ expr: Expr; size: number; k: number }> = ({ expr, size, k }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const s = size * 0.36;
  const pop = Math.min(1, Math.max(0, (k - 4) / 6));
  const wrap = (child: React.ReactNode, x = 0.78, y = 0.02, rot = 0) => (
    <svg
      width={s}
      height={s}
      viewBox="-10 -10 20 20"
      style={{ position: 'absolute', left: size * x - s / 2, top: size * y - s / 2, overflow: 'visible', transform: `scale(${pop}) rotate(${rot}deg)` }}
    >
      {child}
    </svg>
  );
  const stroke = { stroke: '#ffffff', strokeWidth: 1.4, strokeLinejoin: 'round' as const };
  switch (expr) {
    case 'crying':
      return (
        <>
          {[0, 1].map((j) => {
            const cyc = (t * 1.4 + j * 0.5) % 1;
            return wrap(<path d="M0 -8 C0 -8 6 0 6 3 A6 6 0 0 1 -6 3 C-6 0 0 -8 0 -8 Z" fill="#8fd3ff" {...stroke} opacity={1 - cyc} />, j ? 0.2 : 0.8, 0.55 + cyc * 0.3);
          })}
        </>
      );
    case 'angry':
      return wrap(
        <g fill="none" stroke="#ff5a6e" strokeWidth={2.6} strokeLinecap="round">
          <path d="M-7 -2 Q-2 -2 -2 -7 M2 -7 Q2 -2 7 -2 M7 2 Q2 2 2 7 M-2 7 Q-2 2 -7 2" />
        </g>,
        0.82,
        0.04,
        Math.sin(t * 10) * 6,
      );
    case 'dizzy':
      return wrap(
        <path d="M0 0 m0 -1 a1 1 0 1 1 -1 1 a2.5 2.5 0 1 1 3 2.5 a4.5 4.5 0 1 1 -6 -4.5 a7 7 0 1 1 9 7" fill="none" stroke="#b78cff" strokeWidth={2} strokeLinecap="round" />,
        0.8,
        0.0,
        t * 200,
      );
    case 'sleepy':
      return wrap(
        <text x={-6} y={4} fontFamily="Fredoka, sans-serif" fontWeight={700} fontSize={12} fill="#9fc4ff" stroke="#fff" strokeWidth={0.8}>
          zZ
        </text>,
        0.82,
        0.02 - ((t * 0.3) % 0.1),
      );
    case 'embarrassed':
      return wrap(
        <g stroke="#ff8fae" strokeWidth={2.2} strokeLinecap="round">
          <path d="M-7 -3 L-4 3 M-2 -3 L1 3 M3 -3 L6 3" />
        </g>,
        0.8,
        0.06,
      );
    case 'happy':
    case 'excited':
      return wrap(<path d="M0 6 C-9 0 -8 -7 -3 -7 C-1 -7 0 -5 0 -4 C0 -5 1 -7 3 -7 C8 -7 9 0 0 6 Z" fill="#ff9fbd" {...stroke} />, 0.82, 0.04, Math.sin(t * 6) * 10);
    case 'surprised':
      return wrap(<text x={-3} y={6} fontFamily="Fredoka, sans-serif" fontWeight={700} fontSize={16} fill="#ff8fae" stroke="#fff" strokeWidth={0.9}>!</text>, 0.84, 0.02);
    case 'confused':
      return wrap(<text x={-5} y={6} fontFamily="Fredoka, sans-serif" fontWeight={700} fontSize={16} fill="#8fc4ff" stroke="#fff" strokeWidth={0.9}>?</text>, 0.84, 0.02, Math.sin(t * 5) * 12);
    case 'sad':
      return wrap(<path d="M0 -8 C0 -8 5 0 5 3 A5 5 0 0 1 -5 3 C-5 0 0 -8 0 -8 Z" fill="#8fd3ff" {...stroke} />, 0.84, 0.3);
    default:
      return null;
  }
};

// ----------------------------------------------------------------- cute effects
export type Fx = { type: 'sparkle' | 'bang' | 'question' | 'sweat' | 'stink' | 'frost' | 'paw' | 'music'; from: number; to: number };

const Star4: React.FC<{ s: number; color: string }> = ({ s, color }) => (
  <svg width={s} height={s} viewBox="-10 -10 20 20" style={{ overflow: 'visible' }}>
    <path d="M0 -10 Q1.6 -1.6 10 0 Q1.6 1.6 0 10 Q-1.6 1.6 -10 0 Q-1.6 -1.6 0 -10 Z" fill={color} stroke="#fff" strokeWidth={0.8} />
  </svg>
);

/**
 * Soft pastel effects around the host's head (drawn in code, sheet-style):
 * sparkles, "!!", "?", sweat drops, stink cloud, frost, the cat's paw.
 * (hx, hy) = centre of the helmet/head, size = head size in px.
 */
export const HostFx: React.FC<{ hx: number; hy: number; size: number; fx: Fx[]; flip?: boolean }> = ({ hx, hy, size, fx, flip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const on = fx.filter((f) => frame >= f.from && frame <= f.to);
  if (!on.length) return null;
  const d = flip ? -1 : 1;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {on.map((f, i) => {
        const k = frame - f.from;
        const life = Math.min(1, k / 6) * Math.min(1, (f.to - frame) / 6);
        const p = spring({ frame: k, fps, config: theme.spring.bouncy, durationInFrames: 18 });
        const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
          position: 'absolute', left: hx + x, top: hy + y, transform: 'translate(-50%,-50%)', opacity: life, ...extra,
        });
        switch (f.type) {
          case 'sparkle':
            return (
              <React.Fragment key={i}>
                {[[-0.75, -0.55, theme.color.butter], [0.8, -0.35, theme.color.pink], [0.55, -0.85, theme.color.sky], [-0.6, 0.15, theme.color.mint]].map(
                  ([x, y, c], j) => {
                    const tw = 0.6 + 0.4 * Math.sin(t * 6 + j * 1.7);
                    return (
                      <div key={j} style={abs((x as number) * size, (y as number) * size, { transform: `translate(-50%,-50%) scale(${p * tw}) rotate(${t * 40 + j * 20}deg)` })}>
                        <Star4 s={size * 0.28} color={c as string} />
                      </div>
                    );
                  },
                )}
              </React.Fragment>
            );
          case 'bang':
          case 'question':
            return (
              <div
                key={i}
                style={abs(d * size * 0.62, -size * 0.55, {
                  transform: `translate(-50%,-50%) scale(${p}) rotate(${d * 12 + Math.sin(t * 9) * 5}deg)`,
                  fontFamily: theme.font.cute,
                  fontWeight: 700,
                  fontSize: size * 0.55,
                  color: f.type === 'bang' ? theme.color.pinkDeep : theme.color.sky,
                  WebkitTextStroke: `${size * 0.02}px #fff`,
                  textShadow: '0 4px 10px rgba(0,0,0,0.35)',
                })}
              >
                {f.type === 'bang' ? '!!' : '?'}
              </div>
            );
          case 'sweat':
            return (
              <React.Fragment key={i}>
                {[0, 1].map((j) => {
                  const cyc = ((t * 0.9 + j * 0.5) % 1);
                  return (
                    <svg key={j} width={size * 0.16} height={size * 0.24} viewBox="0 0 10 15"
                      style={abs(d * size * (0.5 + j * 0.12), -size * 0.1 + cyc * size * 0.35, { opacity: life * (1 - cyc) })}>
                      <path d="M5 0 C5 0 10 8 10 10 A5 5 0 0 1 0 10 C0 8 5 0 5 0 Z" fill="#bfe8ff" stroke="#fff" strokeWidth={1} />
                    </svg>
                  );
                })}
              </React.Fragment>
            );
          case 'stink':
            return (
              <React.Fragment key={i}>
                {Array.from({ length: 7 }, (_, j) => {
                  const a = (j / 7) * Math.PI * 2 + t * 0.6;
                  const r = size * (0.62 + 0.06 * Math.sin(t * 3 + j));
                  return (
                    <div key={j} style={abs(Math.cos(a) * r, Math.sin(a) * r * 0.8, {
                      width: size * 0.42, height: size * 0.32, borderRadius: '50%',
                      background: 'radial-gradient(circle at 40% 35%, rgba(214,245,150,0.95), rgba(160,210,90,0.75))',
                      border: '2px solid rgba(255,255,255,0.7)',
                      transform: `translate(-50%,-50%) scale(${p * (0.9 + 0.1 * Math.sin(t * 4 + j))})`,
                    })} />
                  );
                })}
                {[-1, 0, 1].map((j) => (
                  <svg key={'w' + j} width={size * 0.2} height={size * 0.45} viewBox="0 0 10 24"
                    style={abs(j * size * 0.3, -size * 0.95 - ((t * 20) % 8), { opacity: life * 0.9 })}>
                    <path d="M5 24 C0 18 10 14 5 8 C0 2 8 0 5 -2" fill="none" stroke={theme.color.stink} strokeWidth={2.4} strokeLinecap="round" />
                  </svg>
                ))}
              </React.Fragment>
            );
          case 'frost':
            return (
              <React.Fragment key={i}>
                <div style={abs(0, 0, {
                  width: size * 1.05, height: size * 1.05, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(220,245,255,0) 52%, rgba(220,245,255,0.55) 68%, rgba(255,255,255,0.0) 74%)',
                  opacity: life * p,
                })} />
                {[[-0.38, -0.3], [0.42, -0.18], [0.1, -0.48], [-0.42, 0.25]].map(([x, y], j) => (
                  <svg key={j} width={size * 0.2} height={size * 0.2} viewBox="-10 -10 20 20"
                    style={abs(x * size, y * size, { transform: `translate(-50%,-50%) scale(${p}) rotate(${j * 25}deg)` })}>
                    {[0, 60, 120].map((r) => (
                      <line key={r} x1={-9} y1={0} x2={9} y2={0} stroke="#e8fbff" strokeWidth={2.2} strokeLinecap="round" transform={`rotate(${r})`} />
                    ))}
                  </svg>
                ))}
              </React.Fragment>
            );
          case 'paw':
            // the cat covers its nose with a little paw
            return (
              <svg key={i} width={size * 0.2} height={size * 0.17} viewBox="0 0 20 17"
                style={abs(0, -size * 0.66, { transform: `translate(-50%,-50%) scale(${p})` })}>
                <ellipse cx="10" cy="10" rx="9" ry="6.5" fill="#fff7f0" stroke={theme.color.outline} strokeWidth="1.4" />
                <circle cx="6" cy="9" r="1.6" fill={theme.color.pink} />
                <circle cx="10" cy="7.5" r="1.6" fill={theme.color.pink} />
                <circle cx="14" cy="9" r="1.6" fill={theme.color.pink} />
              </svg>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

/** Convenience: sprite + bubble + effects together (2D placement). */
export const Host: React.FC<HostProps & { bubbles?: Bubble[]; fx?: Fx[]; bubbleSide?: 'left' | 'right' }> = ({
  bubbles = [], fx = [], bubbleSide = 'right', ...p
}) => {
  const head = headPoint(p.x, p.y, p.height, p.pose);
  const dir = bubbleSide === 'right' ? 1 : -1;
  return (
    <>
      <HostSprite {...p} />
      <HostFx hx={head.x} hy={head.y} size={head.size} fx={fx} flip={p.flip} />
      <ReactionBubble x={head.x + dir * head.size * 0.95} y={head.y - head.size * 0.75} size={head.size * 0.95} bubbles={bubbles} side={bubbleSide} />
    </>
  );
};

