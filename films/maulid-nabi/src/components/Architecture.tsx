import React from "react";
import { mulberry32 } from "../random";
import type { Paint } from "./PaperLayer";

// Flat-roofed mud-brick house of the Hijaz: parapet with small merlons, a low
// doorway and a few high slit windows. `lit` windows glow with lamp colour.
export const House: React.FC<{
  p: Paint;
  x: number;
  base: number;
  w: number;
  h: number;
  body: string;
  shade: string;
  dark: string;
  lamp?: string;
  seed: number;
  lit?: number; // 0..1 chance a window is lit
}> = ({ p, x, base, w, h, body, shade, dark, lamp, seed, lit = 0.4 }) => {
  const rand = mulberry32(seed);
  const top = base - h;
  const merlons = Math.max(2, Math.floor(w / 26));
  const mw = w / (merlons * 2 - 1);
  const windows = Math.max(1, Math.floor(w / 70));
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} fill={p(body)} />
      {/* side face in shadow gives the block volume */}
      <path d={`M${x + w} ${top} L${x + w + w * 0.16} ${top + 10} L${x + w + w * 0.16} ${base} L${x + w} ${base} Z`} fill={p(shade)} />
      {Array.from({ length: merlons }).map((_, i) => (
        <rect key={i} x={x + i * mw * 2} y={top - 12} width={mw} height={13} fill={p(body)} />
      ))}
      {/* roof beam ends (protruding palm-trunk joists) */}
      {Array.from({ length: Math.floor(w / 34) }).map((_, i) => (
        <rect key={"j" + i} x={x + 14 + i * 34} y={top + 18} width={7} height={6} fill={p(dark)} />
      ))}
      {Array.from({ length: windows }).map((_, i) => {
        const wx = x + ((i + 0.5) * w) / windows - 9;
        const isLit = lamp && rand() < lit;
        return <rect key={"w" + i} x={wx} y={top + h * 0.3} width={18} height={30} rx={2} fill={p(isLit ? lamp! : dark)} />;
      })}
      {rand() < 0.6 ? (
        <path d={`M${x + w * 0.35} ${base} L${x + w * 0.35} ${base - 52} Q${x + w * 0.35 + 18} ${base - 66} ${x + w * 0.35 + 36} ${base - 52} L${x + w * 0.35 + 36} ${base} Z`} fill={p(dark)} />
      ) : null}
    </g>
  );
};

// Date palm: tapering curved trunk with ring scars and a crown of arching fronds
export const Palm: React.FC<{ p: Paint; x: number; base: number; h: number; lean?: number; color: string; seed: number; sway?: number }> = ({
  p,
  x,
  base,
  h,
  lean = 0.12,
  color,
  seed,
  sway = 0,
}) => {
  const rand = mulberry32(seed);
  const topX = x + h * lean;
  const topY = base - h;
  const cx = x + h * lean * 0.3;
  const cy = base - h * 0.5;
  const trunk = `M${x - 13} ${base} Q${cx - 9} ${cy} ${topX - 6} ${topY} L${topX + 6} ${topY} Q${cx + 9} ${cy} ${x + 13} ${base} Z`;
  const fronds = Array.from({ length: 11 }).map((_, i) => {
    const a = -Math.PI + (i / 10) * Math.PI + (rand() - 0.5) * 0.2;
    const len = h * (0.42 + rand() * 0.16);
    const droop = 0.55 + rand() * 0.35;
    const ex = topX + Math.cos(a) * len + sway * (i - 5) * 0.4;
    const ey = topY + Math.sin(a) * len * 0.45 + len * droop * 0.55;
    const mx = topX + Math.cos(a) * len * 0.55;
    const my = topY + Math.sin(a) * len * 0.75 - len * 0.12;
    const wdt = 10 + rand() * 6;
    // leaf: two quadratic edges, notched along the lower edge for a cut-paper feel
    let d = `M${topX} ${topY} Q${mx} ${my - wdt} ${ex} ${ey}`;
    const steps = 7;
    for (let s = steps; s >= 0; s--) {
      const t = s / steps;
      const qx = (1 - t) * (1 - t) * topX + 2 * (1 - t) * t * mx + t * t * ex;
      const qy = (1 - t) * (1 - t) * topY + 2 * (1 - t) * t * (my + wdt) + t * t * ey;
      d += ` L${qx} ${qy + (s % 2 ? 7 : 0)}`;
    }
    return <path key={i} d={d + " Z"} fill={p(color)} />;
  });
  const rings = Array.from({ length: Math.floor(h / 22) }).map((_, i) => {
    const t = i / Math.floor(h / 22);
    const rx = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * topX;
    const ry = (1 - t) * (1 - t) * base + 2 * (1 - t) * t * cy + t * t * topY;
    return <path key={i} d={`M${rx - 11} ${ry} L${rx + 11} ${ry - 4}`} stroke={p("#000000")} strokeOpacity={0.25} strokeWidth={2} />;
  });
  return (
    <g>
      <path d={trunk} fill={p(color)} />
      {rings}
      {fronds}
      <circle cx={topX} cy={topY + 6} r={9} fill={p(color)} />
    </g>
  );
};
