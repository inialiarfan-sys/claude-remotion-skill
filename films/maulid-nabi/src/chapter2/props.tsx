// Cut-paper props for Chapter 2: the household, the pasture and the road.
// Same conventions as components/Props: drawn with a Paint, feet on `base`.
import React from "react";
import { theme } from "../theme";
import type { Paint } from "../components/PaperLayer";
import { roundArchPath } from "../components/shapes";

const C = theme.colors;

// flat-crowned acacia (samurah)
export const Acacia: React.FC<{ p: Paint; x: number; base: number; s?: number; color: string }> = ({ p, x, base, s = 1, color }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}>
    <path d="M-8 0 L-6 -120 L-50 -190 L-44 -194 L-2 -132 L4 -200 L10 -200 L8 -128 L52 -180 L58 -176 L10 -110 L8 0 Z" fill={p(color)} />
    {[-90, -40, 10, 60, 100].map((dx, i) => (
      <ellipse key={i} cx={dx} cy={-200 - (i % 2) * 14} rx={70} ry={22} fill={p(color)} />
    ))}
  </g>
);

// shepherd's staff with a crook, leaning at `lean` degrees
export const Staff: React.FC<{ p: Paint; x: number; base: number; len: number; lean?: number }> = ({ p, x, base, len, lean = 14 }) => (
  <g transform={`translate(${x} ${base}) rotate(${lean})`}>
    <rect x={-5} y={-len} width={10} height={len} rx={5} fill={p("#6a4428")} />
    <path d={`M0 ${-len + 4} C0 ${-len - 40} 54 ${-len - 44} 56 ${-len - 6} L46 ${-len - 6} C44 ${-len - 32} 10 ${-len - 30} 10 ${-len + 4} Z`} fill={p("#6a4428")} />
    {[0.3, 0.55, 0.8].map((t) => (
      <rect key={t} x={-6} y={-len * t} width={12} height={4} fill={p("#4a2e18")} />
    ))}
  </g>
);

// goatskin water bag (qirbah), tied at the neck, hanging or resting
export const WaterSkin: React.FC<{ p: Paint; x: number; y: number; s?: number; hang?: boolean }> = ({ p, x, y, s = 1, hang = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {hang ? <path d="M0 -70 L0 -40" stroke={p("#3a2414")} strokeWidth={4} /> : null}
    <path d="M-10 -44 L10 -44 L14 -30 Q60 -24 58 20 Q54 64 0 66 Q-54 64 -58 20 Q-60 -24 -14 -30 Z" fill={p("#7a4a2a")} />
    <path d="M-12 -34 L12 -34" stroke={p("#2a1a0e")} strokeWidth={5} />
    <path d="M-40 10 Q0 30 40 8" stroke={p("#5a321c")} strokeWidth={3} fill="none" opacity={0.7} />
  </g>
);

// three hearth stones, a low fire and a clay pot; `flicker` ≈ 0.8–1.1
export const Hearth: React.FC<{ p: Paint; x: number; base: number; flicker: number; s?: number }> = ({ p, x, base, flicker, s = 1 }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={130} ry={20} fill={p("#2a1c14")} />
    <g transform={`translate(0 -14) scale(${0.9 + flicker * 0.15} ${flicker})`}>
      <path d="M-50 0 Q-60 -50 -30 -90 Q-24 -50 -6 -40 Q0 -100 24 -120 Q20 -60 44 -50 Q60 -30 50 0 Z" fill={p(C.flameOrange)} />
      <path d="M-26 0 Q-30 -36 -10 -60 Q0 -30 14 -40 Q24 -20 22 0 Z" fill={p(C.flameYellow)} />
    </g>
    {[-70, 0, 70].map((sx, i) => (
      <path key={i} d={`M${sx - 34} 6 Q${sx - 36} -40 ${sx} -44 Q${sx + 36} -40 ${sx + 34} 6 Z`} fill={p(i === 1 ? "#4a3a30" : "#3a2c24")} />
    ))}
    {/* round-bellied cooking pot on the stones */}
    <path d="M-74 -46 Q-96 -120 -40 -150 L40 -150 Q96 -120 74 -46 Q0 -26 -74 -46 Z" fill={p("#5a3420")} />
    <rect x={-46} y={-162} width={92} height={16} rx={6} fill={p("#4a2a18")} />
    <path d="M-70 -100 Q0 -88 70 -100" stroke={p("#7a4a2c")} strokeWidth={4} fill="none" opacity={0.7} />
  </g>
);

// steam curling up from the pot: soft paper wisps that rise and fade
export const Steam: React.FC<{ x: number; y: number; frame: number; color?: string }> = ({ x, y, frame, color = "#f3e6cc" }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const t = ((frame / 70 + i / 3) % 1 + 1) % 1;
      const dx = Math.sin(frame / 22 + i * 2) * 14;
      return (
        <path
          key={i}
          d={`M${x + dx - 10} ${y - t * 160} q-16 -26 0 -52 q16 -26 0 -52`}
          stroke={color}
          strokeWidth={12 - t * 6}
          strokeLinecap="round"
          fill="none"
          opacity={Math.sin(t * Math.PI) * 0.4}
        />
      );
    })}
  </g>
);

// rolled sleeping mats / rugs stacked against a wall
export const RolledMats: React.FC<{ p: Paint; x: number; base: number }> = ({ p, x, base }) => (
  <g>
    {[
      { dx: 0, dy: 0, c: "#8a3b2a", r: 32 },
      { dx: 70, dy: 0, c: "#2e4a7a", r: 30 },
      { dx: 34, dy: -56, c: "#a8844e", r: 28 },
    ].map((m, i) => (
      <g key={i}>
        <rect x={x + m.dx - 10} y={base + m.dy - m.r * 2} width={74} height={m.r * 2} rx={m.r} fill={p(m.c)} />
        <circle cx={x + m.dx - 10 + m.r * 0.6} cy={base + m.dy - m.r} r={m.r * 0.55} fill={p("#00000033")} />
        <path d={`M${x + m.dx + 28} ${base + m.dy - m.r * 2} L${x + m.dx + 28} ${base + m.dy}`} stroke={p(C.goldLight)} strokeWidth={3} opacity={0.6} />
      </g>
    ))}
  </g>
);

// stone hand-mill (rahá): two discs and a wooden handle
export const Quern: React.FC<{ p: Paint; x: number; base: number }> = ({ p, x, base }) => (
  <g>
    <ellipse cx={x} cy={base - 14} rx={70} ry={18} fill={p("#5a5048")} />
    <rect x={x - 70} y={base - 34} width={140} height={22} fill={p("#5a5048")} />
    <ellipse cx={x} cy={base - 38} rx={62} ry={15} fill={p("#6e645a")} />
    <rect x={x + 26} y={base - 82} width={10} height={44} rx={4} fill={p("#6a4428")} />
  </g>
);

// a goat tethered by a rope, dark coat, swept-back horns
export const Goat: React.FC<{ p: Paint; x: number; y: number; s?: number; head?: number; flip?: boolean }> = ({ p, x, y, s = 1, head = 0, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    {[-26, -14, 16, 28].map((lx) => (
      <rect key={lx} x={lx - 3} y={-36} width={6} height={36} fill={p("#1e1614")} />
    ))}
    <path d="M-40 -40 Q-44 -70 -10 -70 L30 -70 Q48 -66 46 -42 Q20 -30 -40 -40 Z" fill={p("#3a2a22")} />
    <path d="M-40 -60 L-54 -52" stroke={p("#3a2a22")} strokeWidth={5} />
    <g transform={`translate(40 -64) rotate(${head * 30})`}>
      <path d="M0 0 L8 -26 Q18 -32 26 -22 L30 -4 Q24 6 12 4 Z" fill={p("#3a2a22")} />
      <path d="M10 -26 Q0 -50 -16 -44" stroke={p("#7a6a5a")} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M26 -2 L24 12" stroke={p("#1e1614")} strokeWidth={4} />
    </g>
  </g>
);

// a bundle of goods wrapped in cloth, cord-tied, with a clay seal on the knot
export const SealedBundle: React.FC<{ p: Paint; x: number; base: number; w: number; h: number; cloth: string; seal?: string }> = ({
  p,
  x,
  base,
  w,
  h,
  cloth,
  seal = "#8a2a1e",
}) => (
  <g>
    <path d={`M${x} ${base} Q${x - 8} ${base - h * 0.6} ${x + w * 0.1} ${base - h} L${x + w * 0.9} ${base - h} Q${x + w + 8} ${base - h * 0.6} ${x + w} ${base} Z`} fill={p(cloth)} />
    <path d={`M${x + w * 0.5} ${base - h} L${x + w * 0.42} ${base - h - 20} L${x + w * 0.58} ${base - h - 20} Z`} fill={p(cloth)} />
    <path d={`M${x + 4} ${base - h * 0.5} L${x + w - 4} ${base - h * 0.5} M${x + w * 0.5} ${base - h} L${x + w * 0.5} ${base}`} stroke={p("#c9a86a")} strokeWidth={4} />
    <circle cx={x + w * 0.5} cy={base - h * 0.5} r={12} fill={p(seal)} />
    <circle cx={x + w * 0.5} cy={base - h * 0.5} r={6} fill={p("#5a1810")} />
  </g>
);

// small wooden chest with brass bands and a closed hasp
export const Chest: React.FC<{ p: Paint; x: number; base: number; w: number; h: number }> = ({ p, x, base, w, h }) => (
  <g>
    <rect x={x} y={base - h} width={w} height={h} rx={6} fill={p("#4a2a16")} />
    <path d={`M${x} ${base - h + 14} Q${x + w / 2} ${base - h - 34} ${x + w} ${base - h + 14} Z`} fill={p("#5a3420")} />
    {[0.18, 0.82].map((t) => (
      <rect key={t} x={x + w * t - 6} y={base - h - 14} width={12} height={h + 14} fill={p(C.goldDeep)} />
    ))}
    <rect x={x} y={base - h + 10} width={w} height={8} fill={p(C.goldDeep)} />
    <rect x={x + w / 2 - 14} y={base - h + 4} width={28} height={34} rx={4} fill={p(C.gold)} />
    <circle cx={x + w / 2} cy={base - h + 26} r={5} fill={p("#2a1a0e")} />
  </g>
);

// Bosra's dark basalt: a colonnaded street ending in a round-arched gate
export const BasaltTown: React.FC<{ p: Paint; base: number; lit: string }> = ({ p, base, lit }) => {
  const stone = "#2c2a30";
  const stoneLit = "#3c3840";
  return (
    <g>
      {/* blocky houses behind */}
      {[[-300, 220, 160], [-60, 180, 200], [620, 240, 170], [880, 200, 220], [1180, 260, 150]].map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={base - h} width={w} height={h} fill={p(stone)} />
          <rect x={x + w * 0.4} y={base - h + 40} width={18} height={26} fill={p(i % 2 ? lit : "#16141a")} />
        </g>
      ))}
      {/* the arched gate */}
      <path d={`M240 ${base} L240 ${base - 380} L620 ${base - 380} L620 ${base} Z`} fill={p(stoneLit)} />
      <path d={roundArchPath(330, base, 200, 300)} fill={p("#121016")} />
      <path d={roundArchPath(260, base, 50, 150)} fill={p("#121016")} />
      <path d={roundArchPath(550, base, 50, 150)} fill={p("#121016")} />
      <rect x={232} y={base - 398} width={396} height={22} fill={p(stone)} />
      {/* colonnade */}
      {[40, 130, 700, 790, 880].map((cx) => (
        <g key={cx}>
          <rect x={cx - 14} y={base - 260} width={28} height={260} fill={p(stoneLit)} />
          <rect x={cx - 22} y={base - 272} width={44} height={16} fill={p(stone)} />
        </g>
      ))}
      <rect x={10} y={base - 290} width={150} height={20} fill={p(stone)} />
      <rect x={670} y={base - 290} width={240} height={20} fill={p(stone)} />
    </g>
  );
};
