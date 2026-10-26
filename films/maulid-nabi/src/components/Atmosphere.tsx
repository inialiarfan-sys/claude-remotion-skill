import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PAPER_TEXTURE } from "../assets";
import { theme } from "../theme";
import { mulberry32, noise1 } from "../random";
import { DepthFill } from "./PaperLayer";
import { starPath } from "./shapes";

// Gradient sky behind every outdoor scene (never a flat fill)
export const Sky: React.FC<{ stops: [string, number][]; glow?: { x: number; y: number; r: number; color: string } }> = ({
  stops,
  glow,
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, ${stops.map(([c, p]) => `${c} ${p}%`).join(", ")})`,
    }}
  >
    {glow ? (
      <div
        style={{
          position: "absolute",
          left: glow.x - glow.r,
          top: glow.y - glow.r,
          width: glow.r * 2,
          height: glow.r * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glow.color}, transparent 68%)`,
        }}
      />
    ) : null}
  </AbsoluteFill>
);

// Star field: tiny points plus a few cut-paper eight-pointed stars.
// The whole field wheels slowly around a pole far below the frame.
export const Stars: React.FC<{
  seed: number;
  count?: number;
  top?: number;
  bottom?: number;
  depth?: number;
  spin?: number;
  opacity?: number;
}> = ({ seed, count = 160, top = -300, bottom = 1100, depth = 0.04, spin = 0.012, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const stars = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, (_, i) => ({
      x: -500 + rand() * 2080,
      y: top + rand() * (bottom - top),
      r: 0.8 + Math.pow(rand(), 3) * 2.6,
      phase: rand() * Math.PI * 2,
      speed: 0.04 + rand() * 0.08,
      big: i % 23 === 0,
    }));
  }, [seed, count, top, bottom]);
  return (
    <DepthFill depth={depth} style={{ opacity }}>
      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          overflow: "visible",
          transform: `rotate(${frame * spin}deg)`,
          transformOrigin: "540px 2600px",
        }}
      >
        <defs>
          <radialGradient id={`sg${seed}`}>
            <stop offset="0%" stopColor={theme.colors.star} stopOpacity={1} />
            <stop offset="100%" stopColor={theme.colors.star} stopOpacity={0} />
          </radialGradient>
        </defs>
        {stars.map((s, i) => {
          const tw = 0.55 + 0.45 * Math.sin(frame * s.speed + s.phase);
          return s.big ? (
            <g key={i} opacity={0.75 + tw * 0.25}>
              <circle cx={s.x} cy={s.y} r={16} fill={`url(#sg${seed})`} opacity={0.35 * tw} />
              <path d={starPath(s.x, s.y, 7 + s.r, 2.4, 4, (frame * 0.002) % 6.28)} fill={theme.colors.star} />
            </g>
          ) : (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={theme.colors.star} opacity={0.35 + tw * 0.6} />
          );
        })}
      </svg>
    </DepthFill>
  );
};

// Floating motes of dust / sand caught in light
export const Dust: React.FC<{
  seed: number;
  count?: number;
  area: { x: number; y: number; w: number; h: number };
  color?: string;
  size?: number;
  rise?: number;
  depth?: number;
  opacity?: number;
}> = ({ seed, count = 40, area, color = theme.colors.goldLight, size = 4, rise = 0.4, depth = 0.9, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const motes = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: rand() * area.w,
      y: rand() * area.h,
      s: size * (0.4 + rand()),
      k: rand() * 100,
      v: 0.5 + rand(),
    }));
  }, [seed, count, area.w, area.h, size]);
  return (
    <DepthFill depth={depth} style={{ opacity, mixBlendMode: "screen" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
        <defs>
          <radialGradient id={`dg${seed}`}>
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="45%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </radialGradient>
        </defs>
        {motes.map((m, i) => {
          const y = (((m.y - frame * rise * m.v) % area.h) + area.h) % area.h;
          const x = m.x + noise1(frame / 60 + m.k, i) * 40;
          const flicker = 0.4 + 0.6 * Math.abs(Math.sin(frame / (14 + m.v * 10) + m.k));
          return (
            <circle key={i} cx={area.x + x} cy={area.y + y} r={m.s * 2.2} fill={`url(#dg${seed})`} opacity={flicker} />
          );
        })}
      </svg>
    </DepthFill>
  );
};

// soft radial light (lamps, sun, flame spill)
export const Glow: React.FC<{
  x: number;
  y: number;
  r: number;
  color: string;
  opacity?: number;
  depth?: number;
  blend?: React.CSSProperties["mixBlendMode"];
}> = ({ x, y, r, color, opacity = 1, depth = 0.5, blend = "screen" }) => (
  <DepthFill depth={depth} style={{ mixBlendMode: blend, opacity }}>
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, ${color}88 22%, ${color}22 50%, transparent 70%)`,
      }}
    />
  </DepthFill>
);

// a shaft of light (volumetric look via a blurred gradient wedge)
export const LightBeam: React.FC<{
  x: number;
  y: number;
  angle: number;
  width: number;
  length: number;
  color: string;
  opacity?: number;
  depth?: number;
}> = ({ x, y, angle, width, length, color, opacity = 0.5, depth = 0.6 }) => (
  <DepthFill depth={depth} style={{ mixBlendMode: "screen", opacity }}>
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y,
        width,
        height: length,
        transformOrigin: "50% 0%",
        transform: `rotate(${angle}deg)`,
        background: `linear-gradient(180deg, ${color} 0%, ${color}55 45%, transparent 100%)`,
        clipPath: "polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)",
        filter: "blur(34px)",
      }}
    />
  </DepthFill>
);

// --- finishing stack, above all content ---

export const Grade: React.FC<{ warmth?: number }> = ({ warmth = 0.12 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: theme.colors.gold, mixBlendMode: "soft-light", opacity: warmth }} />
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.18), transparent 22%, transparent 78%, rgba(0,0,0,0.28))",
      }}
    />
  </AbsoluteFill>
);

// the whole film sits on handmade paper
export const PaperOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.32 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      backgroundImage: `url(${PAPER_TEXTURE})`,
      backgroundSize: "512px",
      mixBlendMode: "multiply",
      opacity,
    }}
  />
);

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: noise,
        backgroundSize: "240px",
        backgroundPosition: `${(frame * 37) % 240}px ${(frame * 53) % 240}px`,
        opacity: 0.07,
        mixBlendMode: "overlay",
      }}
    />
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse 75% 60% at 50% 48%, transparent 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);
