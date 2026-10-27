import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { arabicStack, latinStack, theme } from "../theme";
import type { Paint } from "./PaperLayer";
import { clamp } from "./textMotion";

const C = theme.colors;

export type LonLat = [number, number];
export type Projection = (ll: LonLat) => [number, number];

// equirectangular projection placing (lon0, lat0) at (x0, y0), k px per degree
export const projection =
  (x0: number, y0: number, k: number, lon0 = 33, lat0 = 33): Projection =>
  ([lon, lat]) => [x0 + (lon - lon0) * k, y0 + (lat0 - lat) * k];

// Approximate coastlines (lon, lat) — a stylised manuscript map, not a survey.
const ARABIA_WEST: LonLat[] = [
  [34.9, 29.5], [35.0, 28.6], [35.6, 27.6], [36.0, 26.9], [36.6, 25.9], [37.3, 25.0], [38.1, 24.0], [38.8, 22.9],
  [39.1, 22.3], [39.2, 21.5], [39.7, 20.8], [40.4, 19.9], [41.0, 18.9], [41.7, 17.9], [42.5, 16.8], [42.8, 15.6],
  [43.0, 14.4], [43.3, 13.3], [43.5, 12.7],
];
const ARABIA_SOUTH: LonLat[] = [
  [44.5, 12.7], [45.2, 12.8], [46.5, 13.4], [47.8, 13.9], [48.9, 14.3], [50.0, 14.9], [51.3, 15.2], [52.2, 15.6],
  [53.0, 16.5], [54.0, 16.9], [55.1, 17.4], [55.5, 17.9], [56.4, 17.9], [56.9, 18.7], [57.8, 19.0], [57.8, 20.2],
  [58.6, 20.6], [59.4, 21.4], [59.8, 22.4], [59.2, 22.8], [58.6, 23.6], [57.6, 23.8], [56.6, 24.5], [56.4, 25.6],
  [56.2, 26.2],
];
const ARABIA_GULF: LonLat[] = [
  [55.9, 25.3], [55.3, 25.2], [54.6, 24.4], [53.8, 24.1], [52.6, 24.2], [51.6, 24.3], [51.3, 25.3], [51.5, 25.9],
  [51.2, 26.1], [50.8, 25.5], [50.5, 25.9], [50.1, 26.5], [49.6, 27.1], [48.9, 27.6], [48.4, 28.4], [48.0, 29.0],
  [47.9, 29.6], [48.1, 30.0],
];
const PERSIA: LonLat[] = [
  [48.6, 30.0], [49.5, 30.0], [50.2, 29.5], [50.7, 29.0], [51.1, 28.2], [51.6, 27.8], [52.6, 27.4], [53.6, 26.8],
  [54.5, 26.6], [55.5, 26.8], [56.3, 27.2], [57.0, 26.9], [57.3, 25.8], [58.5, 25.6], [59.6, 25.4], [62, 25.2],
];
const AFRICA: LonLat[] = [
  [32.6, 29.9], [32.7, 29.3], [33.2, 28.4], [33.8, 27.3], [34.3, 26.2], [35.1, 24.8], [35.6, 23.9], [36.5, 22.2],
  [37.2, 21.0], [37.2, 19.6], [37.6, 18.7], [38.5, 18.0], [38.9, 16.3], [39.5, 15.6], [40.2, 14.9], [41.2, 14.0],
  [42.0, 13.4], [42.7, 12.6], [43.2, 11.8], [43.3, 11.5],
];
const SOMALIA: LonLat[] = [[43.3, 11.5], [44.5, 10.4], [46, 10.7], [48, 11.2], [50.5, 11.8], [51.3, 11.8], [51.0, 8]];
const SINAI_WEST: LonLat[] = [[32.6, 29.9], [33.0, 29.0], [33.6, 28.3], [34.2, 27.8]];
const SINAI_EAST: LonLat[] = [[34.4, 28.0], [34.6, 28.6], [34.9, 29.5]];
const MEDITERRANEAN: LonLat[] = [
  [28, 36], [35.6, 36], [35.1, 33.1], [34.9, 32.5], [34.5, 31.6], [34.2, 31.3], [32.3, 31.2], [28, 31.4],
];

export const PLACES = {
  makkah: [39.83, 21.42] as LonLat,
  yathrib: [39.61, 24.47] as LonLat,
  abwa: [39.2, 23.08] as LonLat,
  taif: [40.42, 21.27] as LonLat,
  baniSaad: [40.8, 20.85] as LonLat, // approximate homeland of Banu Sa'd ibn Bakr (Hawazin), south-east of Makkah
  syam: [36.48, 32.52] as LonLat, // Busra, gateway of al-Sham
  yaman: [44.2, 15.35] as LonLat,
};

const poly = (proj: Projection, pts: LonLat[]) =>
  pts.map((ll, i) => {
    const [x, y] = proj(ll);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";

const line = (proj: Projection, pts: LonLat[]) =>
  pts.map((ll, i) => {
    const [x, y] = proj(ll);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

/** Seas, coasts and the Hijaz range as cut-paper pieces on the parchment. */
export const MapShapes: React.FC<{
  p: Paint;
  proj: Projection;
  k: number;
  /** pop-up book mode: per-mountain rise 0..1 (north → south index); adds cast shadows */
  rise?: (i: number) => number;
}> = ({ p, proj, k, rise }) => {
  const redSea = [...ARABIA_WEST, [43.3, 11.6] as LonLat, ...[...AFRICA].reverse(), ...SINAI_WEST, ...SINAI_EAST];
  const eastSea = [
    [43.5, 12.7] as LonLat,
    ...ARABIA_SOUTH,
    ...ARABIA_GULF,
    ...PERSIA,
    [64, 25] as LonLat,
    [64, 6] as LonLat,
    [51.0, 6] as LonLat,
    ...[...SOMALIA].reverse(),
  ];
  const sea = "#7f98a0";
  const coast = "#5a4128";
  // Sarawat / Hijaz mountains just inland of the Red Sea coast
  const ridge: LonLat[] = [];
  for (let i = 0; i < 22; i++) {
    const t = i / 21;
    ridge.push([36.2 + t * 7.4 + 0.7, 28.2 - t * 13.8]);
  }
  return (
    <g>
      <path d={poly(proj, MEDITERRANEAN)} fill={p(sea)} />
      <path d={poly(proj, redSea)} fill={p(sea)} />
      <path d={poly(proj, eastSea)} fill={p(sea)} />
      {[MEDITERRANEAN, redSea, eastSea].map((pts, i) => (
        <path key={i} d={poly(proj, pts)} fill="none" stroke={p(coast)} strokeWidth={Math.max(1.2, k * 0.05)} strokeOpacity={0.8} />
      ))}
      {/* wave hatching in the seas, manuscript style */}
      {[
        [37.6, 23.2], [38.6, 20.0], [36.4, 25.6], [52.5, 13.0], [56.0, 21.5], [58.5, 16.5], [49.5, 27.0], [47, 12.2],
      ].map((ll, i) => {
        const [x, y] = proj(ll as LonLat);
        return (
          <path
            key={"w" + i}
            d={`M${x - k * 0.5} ${y} q${k * 0.12} ${-k * 0.12} ${k * 0.25} 0 t${k * 0.25} 0 t${k * 0.25} 0 t${k * 0.25} 0`}
            fill="none"
            stroke={p("#4c6670")}
            strokeWidth={Math.max(1, k * 0.04)}
            opacity={0.7}
          />
        );
      })}
      {ridge.map((ll, i) => {
        const [x, y] = proj(ll);
        const h = Math.min(k * (0.28 + (i % 3) * 0.08), 46);
        const tri = <path d={`M${x - h * 0.7} ${y} L${x} ${y - h} L${x + h * 0.7} ${y} Z`} fill={p(i % 2 ? "#a07a4e" : "#8c6840")} />;
        if (!rise) return <g key={"m" + i}>{tri}</g>;
        const r = rise(i);
        if (r <= 0.001) return null;
        return (
          <g key={"m" + i}>
            {/* the standing paper tab casts a shadow away from the lamp */}
            <path d={`M${x - h * 0.7} ${y} L${x + h * 0.55 * r} ${y - h * 0.35 * r} L${x + h * 0.7} ${y} Z`} fill="#3a2410" opacity={0.3 * Math.min(1, r)} />
            <g transform={`translate(${x} ${y}) scale(1 ${r}) translate(${-x} ${-y})`}>{tri}</g>
          </g>
        );
      })}
    </g>
  );
};

// Partial polyline up to fraction t of its length
const partial = (pts: [number, number][], t: number) => {
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * Math.max(0, Math.min(1, t));
  const out: [number, number][] = [pts[0]];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const f = Math.min(1, left / seg[i]);
    out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]);
    left -= seg[i];
  }
  return out;
};

// where the head of a route is after fraction t of its length (for cameras following it)
export const routeHead = (proj: Projection, via: LonLat[], t: number): [number, number] => {
  const pts = partial(via.map(proj), t);
  return pts[pts.length - 1];
};

/** A route drawn in ink across the map; `t` is how much of it is drawn. */
export const MapRoute: React.FC<{
  proj: Projection;
  via: LonLat[];
  t: number;
  color?: string;
  width?: number;
  dashed?: boolean;
  head?: boolean;
  icon?: "dot" | "camel"; // what travels at the head of the route
}> = ({ proj, via, t, color = C.flameRed, width = 5, dashed = true, head = true, icon = "dot" }) => {
  if (t <= 0) return null;
  const pts = partial(via.map(proj), t);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [hx, hy] = pts[pts.length - 1];
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? `${width * 2.4} ${width * 1.8}` : undefined} />
      {head && t < 1 && icon === "dot" ? <circle cx={hx} cy={hy} r={width * 1.6} fill={color} /> : null}
      {head && t > 0 && icon === "camel" ? (
        // a tiny cut-paper camel walking the route
        <g transform={`translate(${hx} ${hy}) scale(${width / 7})`}>
          <ellipse cx={0} cy={2} rx={20} ry={4} fill="#000000" opacity={0.25} />
          <path d="M-16 -8 C-18 -16 -10 -22 -4 -20 C0 -28 8 -28 10 -20 L16 -18 L18 -26 L24 -27 L24 -23 L20 -22 L18 -12 L14 -8 Z" fill={color} />
          {[-12, -6, 6, 12].map((lx) => (
            <rect key={lx} x={lx - 1.2} y={-9} width={2.4} height={10} fill={color} />
          ))}
        </g>
      ) : null}
    </g>
  );
};

/** Place marker: ink ring + labels in Arabic and Malay, popping in at `at`. */
export const MapMarker: React.FC<{
  proj: Projection;
  ll: LonLat;
  at: number;
  ar?: string;
  ms: string;
  k: number;
  side?: "left" | "right";
  region?: boolean;
  color?: string;
  scale?: number;
}> = ({ proj, ll, at, ar, ms, k, side = "right", region = false, color = C.flameRed, scale }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 16], [0, 1], { ...clamp, easing: theme.ease.out });
  if (p <= 0) return null;
  const [x, y] = proj(ll);
  const pulse = 1 + Math.sin((frame - at) / 9) * 0.12;
  const s = scale ?? Math.max(0.6, k / 40);
  const tx = side === "right" ? x + 24 * s : x - 24 * s;
  const anchor = side === "right" ? "start" : "end";
  return (
    <g opacity={p}>
      {region ? (
        <ellipse cx={x} cy={y} rx={k * 0.75 * p} ry={k * 0.5 * p} fill={`${color}22`} stroke={color} strokeWidth={2.5 * s} strokeDasharray={`${6 * s} ${5 * s}`} />
      ) : (
        <>
          <circle cx={x} cy={y} r={15 * s * pulse} fill="none" stroke={color} strokeWidth={2.5 * s} opacity={0.6} />
          <circle cx={x} cy={y} r={7 * s * p} fill={color} />
        </>
      )}
      {ar ? (
        // with direction="rtl" the anchor is mirrored: "end" is the text's left edge
        <text x={tx} y={y - 4 * s} fontFamily={arabicStack} fontWeight={700} fontSize={30 * s} fill={C.ink} textAnchor={side === "right" ? "end" : "start"} direction="rtl">
          {ar}
        </text>
      ) : null}
      <text x={tx} y={y + (ar ? 26 : 8) * s} fontFamily={latinStack} fontWeight={700} fontSize={22 * s} letterSpacing={1.5 * s} fill={C.inkSoft} textAnchor={anchor}>
        {ms}
      </text>
    </g>
  );
};

/** Compass rose in the manuscript tradition (eight-pointed). */
export const CompassRose: React.FC<{ x: number; y: number; r: number; p: Paint }> = ({ x, y, r, p }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="none" stroke={p(C.goldDeep)} strokeWidth={2} />
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (Math.PI / 4) * i - Math.PI / 2;
      const len = i % 2 ? r * 0.55 : r * 0.95;
      const w = r * 0.14;
      return (
        <path
          key={i}
          d={`M${x} ${y} L${x + Math.cos(a - Math.PI / 2) * w} ${y + Math.sin(a - Math.PI / 2) * w} L${x + Math.cos(a) * len} ${y + Math.sin(a) * len} L${x + Math.cos(a + Math.PI / 2) * w} ${y + Math.sin(a + Math.PI / 2) * w} Z`}
          fill={p(i % 2 ? C.goldDeep : C.gold)}
        />
      );
    })}
    <text x={x} y={y - r - 8} textAnchor="middle" fontFamily={latinStack} fontWeight={700} fontSize={r * 0.35} fill={C.inkSoft}>
      U
    </text>
  </g>
);

export { line as mapLine };
