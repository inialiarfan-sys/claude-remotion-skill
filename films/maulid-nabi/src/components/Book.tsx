import React from "react";
import { AbsoluteFill } from "remotion";
import { PAPER_TEXTURE } from "../assets";
import { theme } from "../theme";
import { starPath } from "./shapes";

const C = theme.colors;

// parchment leaf with fibre texture, foxed edges and a ruled gold frame (jadwal)
export const PageSurface: React.FC<{
  w: number;
  h: number;
  frame?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ w, h, frame = true, children, style }) => (
  <div
    style={{
      position: "absolute",
      width: w,
      height: h,
      background: `radial-gradient(ellipse 80% 75% at 50% 48%, ${C.parchmentLight} 0%, ${C.parchment} 60%, ${C.parchmentDark} 100%)`,
      overflow: "hidden",
      ...style,
    }}
  >
    <AbsoluteFill
      style={{ backgroundImage: `url(${PAPER_TEXTURE})`, backgroundSize: "512px", mixBlendMode: "multiply", opacity: 0.9 }}
    />
    {/* foxing / age toward the edges */}
    <AbsoluteFill
      style={{
        boxShadow: `inset 0 0 60px rgba(120,80,30,0.35), inset 0 0 8px rgba(90,55,20,0.5)`,
      }}
    />
    {frame ? (
      <>
        <div style={{ position: "absolute", inset: 34, border: `3px solid ${C.gold}`, borderRadius: 2 }} />
        <div style={{ position: "absolute", inset: 42, border: `1.5px solid ${C.goldDeep}`, opacity: 0.7 }} />
        <div style={{ position: "absolute", inset: 28, border: `1px solid #3b4d7a`, opacity: 0.55 }} />
      </>
    ) : null}
    {children}
  </div>
);

// visible edges of the text block under a page, cut-paper style
export const PageEdges: React.FC<{ w: number; h: number; count?: number }> = ({ w, h, count = 7 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: -(count - i) * 2.2,
          top: (count - i) * 2.4,
          width: w,
          height: h,
          background: i % 2 ? "#e2cc9f" : "#cdb27f",
          boxShadow: "0 1px 0 rgba(0,0,0,0.25)",
          borderRadius: 2,
        }}
      />
    ))}
  </>
);

// marbled (ebru) endpaper for the inside of the cover
export const Endpaper: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
    <rect width={w} height={h} fill="#2c3b5e" />
    {Array.from({ length: 26 }).map((_, i) => {
      const y = (h / 26) * i;
      const amp = 18 + (i % 4) * 6;
      let d = `M0 ${y}`;
      for (let x = 0; x <= w; x += 20) d += ` L${x} ${y + Math.sin(x / 47 + i) * amp + Math.sin(x / 13 + i * 2) * 4}`;
      return <path key={i} d={d} stroke={i % 3 === 0 ? C.gold : i % 3 === 1 ? "#8c3b2e" : "#d9c9a3"} strokeWidth={i % 3 === 0 ? 2 : 5} fill="none" opacity={0.65} />;
    })}
    <rect x={14} y={14} width={w - 28} height={h - 28} fill="none" stroke={C.goldDeep} strokeWidth={3} />
  </svg>
);

/**
 * Tooled leather cover in the Islamic binding tradition: gilt frame, a central
 * shamsa medallion built on the eight-pointed star, and corner pieces. Built
 * as stacked paper layers so the gilding casts small shadows.
 */
export const BookCover: React.FC<{
  w: number;
  h: number;
  children?: React.ReactNode;
  sheen?: number;
  medallion?: { dy: number; s: number };
}> = ({ w, h, children, sheen = 0, medallion = { dy: 0, s: 1 } }) => {
  const cx = w / 2;
  const cy = h / 2;
  const corner = (x: number, y: number, rot: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M0 0 L120 0 Q70 18 52 52 Q18 70 0 120 Z" fill={C.gold} />
      <path d="M14 14 L92 14 Q58 28 44 44 Q28 58 14 92 Z" fill={C.leatherDark} />
      <path d={starPath(34, 34, 16, 7, 8)} fill={C.goldLight} />
    </g>
  );
  return (
    <div
      style={{
        position: "absolute",
        width: w,
        height: h,
        borderRadius: "6px 16px 16px 6px",
        background: `linear-gradient(135deg, ${C.leatherLight} 0%, ${C.leather} 45%, ${C.leatherDark} 100%)`,
        overflow: "hidden",
        boxShadow: "inset 0 0 40px rgba(0,0,0,0.6)",
      }}
    >
      <AbsoluteFill
        style={{ backgroundImage: `url(${PAPER_TEXTURE})`, backgroundSize: "380px", mixBlendMode: "multiply", opacity: 0.85 }}
      />
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.6))" }}>
        <rect x={36} y={36} width={w - 72} height={h - 72} fill="none" stroke={C.gold} strokeWidth={5} />
        <rect x={52} y={52} width={w - 104} height={h - 104} fill="none" stroke={C.goldDeep} strokeWidth={2} />
        {/* guilloche band between the frames */}
        {Array.from({ length: Math.floor((w - 120) / 28) }).map((_, i) => (
          <circle key={"t" + i} cx={62 + i * 28 + 14} cy={44} r={4} fill={C.goldDeep} />
        ))}
        {Array.from({ length: Math.floor((w - 120) / 28) }).map((_, i) => (
          <circle key={"b" + i} cx={62 + i * 28 + 14} cy={h - 44} r={4} fill={C.goldDeep} />
        ))}
        {corner(52, 52, 0)}
        {corner(w - 52, 52, 90)}
        {corner(w - 52, h - 52, 180)}
        {corner(52, h - 52, 270)}
        {/* shamsa medallion */}
        <g transform={`translate(${cx} ${cy + medallion.dy}) scale(${medallion.s}) translate(${-cx} ${-cy})`}>
        <ellipse cx={cx} cy={cy} rx={190} ry={250} fill={C.gold} />
        <ellipse cx={cx} cy={cy} rx={176} ry={236} fill={C.leatherDark} />
        <path d={starPath(cx, cy, 150, 105, 8, Math.PI / 8)} fill={C.goldDeep} />
        <path d={starPath(cx, cy, 138, 96, 8, Math.PI / 8)} fill={C.gold} />
        <path d={starPath(cx, cy, 120, 84, 8)} fill={C.leather} />
        <circle cx={cx} cy={cy} r={72} fill={C.goldLight} />
        <circle cx={cx} cy={cy} r={64} fill={C.leatherDark} />
        <path d={starPath(cx, cy, 52, 24, 8)} fill={C.gold} />
        <path d={`M${cx} ${cy - 250 - 48} L${cx + 22} ${cy - 250 - 8} L${cx - 22} ${cy - 250 - 8} Z`} fill={C.gold} />
        <path d={`M${cx} ${cy + 250 + 48} L${cx + 22} ${cy + 250 + 8} L${cx - 22} ${cy + 250 + 8} Z`} fill={C.gold} />
        </g>
      </svg>
      {children}
      {/* raking light sheen that slides over the gilding */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, transparent ${sheen * 140 - 40}%, rgba(255,226,160,0.22) ${sheen * 140 - 20}%, transparent ${sheen * 140}%)`,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};
