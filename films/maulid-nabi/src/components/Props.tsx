import React from "react";
import { theme } from "../theme";
import { mulberry32 } from "../random";
import type { Paint } from "./PaperLayer";

const C = theme.colors;

// ---------------------------------------------------------------------------
// Camel — cut-paper side view facing right; feet on y = 0 at x = 0.
// `phase` drives a four-beat walk (legs swing, body bobs); `kneel` folds it
// down to rest. `load` adds a pack of goods over the hump.
// ---------------------------------------------------------------------------
const CAMEL_BODY =
  "M-62 -58 C-70 -80 -48 -100 -20 -96 C-4 -122 26 -120 34 -94 C44 -86 54 -84 60 -80 L66 -92 C72 -116 80 -132 94 -135 L108 -133 C115 -131 117 -124 110 -120 L99 -119 C92 -104 86 -84 78 -62 C72 -52 62 -48 50 -48 L-48 -48 C-60 -48 -64 -52 -62 -58 Z";

export const Camel: React.FC<{
  p: Paint;
  x: number;
  y: number;
  s?: number;
  phase?: number;
  color: string;
  load?: string;
  kneel?: number;
  flip?: boolean;
}> = ({ p, x, y, s = 1, phase = 0, color, load, kneel = 0, flip = false }) => {
  const legLen = 50 * (1 - kneel * 0.75);
  const bob = Math.sin(phase * 2) * 2.5 * (1 - kneel);
  const legs: [number, number][] = [
    [-42, 0],
    [-30, Math.PI],
    [42, Math.PI / 2],
    [54, (Math.PI * 3) / 2],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g transform={`translate(0 ${-legLen + 50 + bob})`}>
        {legs.map(([lx, off], i) => {
          const swing = Math.sin(phase + off) * 16 * (1 - kneel);
          return (
            <g key={i} transform={`translate(${lx} -50) rotate(${swing})`}>
              <rect x={-4} y={0} width={8} height={legLen} rx={3} fill={p(color)} />
              <rect x={-6} y={legLen - 6} width={13} height={6} rx={2} fill={p(color)} />
            </g>
          );
        })}
        <path d={CAMEL_BODY} fill={p(color)} />
        <path d="M-62 -60 C-72 -54 -74 -40 -70 -30" stroke={p(color)} strokeWidth={4} fill="none" />
        {load ? (
          <g>
            <rect x={-38} y={-118} width={62} height={34} rx={10} fill={p(load)} />
            <rect x={-30} y={-90} width={20} height={36} rx={6} fill={p(load)} />
            <rect x={4} y={-90} width={20} height={36} rx={6} fill={p(load)} />
            <path d="M-38 -104 L24 -104" stroke={p("#2a1a0e")} strokeWidth={3} opacity={0.6} />
          </g>
        ) : null}
      </g>
    </g>
  );
};

// a line of camels walking; `walk` is distance travelled in px
export const Caravan: React.FC<{
  p: Paint;
  x: number;
  y: number;
  n: number;
  gap: number;
  walk: number;
  s?: number;
  color: string;
  load?: string;
  dir?: 1 | -1;
}> = ({ p, x, y, n, gap, walk, s = 1, color, load, dir = 1 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <Camel
        key={i}
        p={p}
        x={x + dir * (walk - i * gap)}
        y={y + (i % 2) * 4}
        s={s * (1 - i * 0.03)}
        phase={walk / (14 * s) + i * 1.3}
        color={color}
        load={load}
        flip={dir < 0}
      />
    ))}
    {/* lead rope between camels */}
    {Array.from({ length: n - 1 }).map((_, i) => {
      const ax = x + dir * (walk - i * gap) - dir * 62 * s;
      const bx = x + dir * (walk - (i + 1) * gap) + dir * 100 * s;
      return <path key={"r" + i} d={`M${ax} ${y - 70 * s} Q${(ax + bx) / 2} ${y - 50 * s} ${bx} ${y - 118 * s}`} stroke={p(color)} strokeWidth={2} fill="none" opacity={0.7} />;
    })}
  </g>
);

// ---------------------------------------------------------------------------
// The Ka'bah before the Quraysh rebuilding: a plain stone cube, unroofed and
// lower than today, in a valley among houses. Shown as a dark paper block
// without later ornament.
// ---------------------------------------------------------------------------
export const Kaaba: React.FC<{ p: Paint; x: number; base: number; w: number; h: number; glow?: number }> = ({ p, x, base, w, h }) => (
  <g>
    <rect x={x} y={base - h} width={w} height={h} fill={p("#1e1a20")} />
    <path d={`M${x + w} ${base - h} L${x + w + w * 0.32} ${base - h + 12} L${x + w + w * 0.32} ${base} L${x + w} ${base} Z`} fill={p("#141117")} />
    {/* stone courses */}
    {Array.from({ length: 4 }).map((_, i) => (
      <path key={i} d={`M${x} ${base - h + (i + 1) * (h / 5)} L${x + w} ${base - h + (i + 1) * (h / 5)}`} stroke={p("#2c2730")} strokeWidth={2} />
    ))}
    <rect x={x - 6} y={base - h - 6} width={w + 6} height={8} fill={p("#2a2530")} />
  </g>
);

// Bedouin goat-hair tent (bayt al-sha'r): low ridged roof on poles, guy ropes
export const Tent: React.FC<{ p: Paint; x: number; base: number; w: number; h: number; color: string; open?: string }> = ({
  p,
  x,
  base,
  w,
  h,
  color,
  open = "#120d0b",
}) => {
  const peaks = 3;
  let roof = `M${x - 30} ${base} L${x} ${base - h * 0.55}`;
  for (let i = 0; i < peaks; i++) {
    const px = x + ((i + 0.5) * w) / peaks;
    roof += ` Q${px - w / peaks / 2 + 10} ${base - h * 0.62} ${px} ${base - h} Q${px + w / peaks / 2 - 10} ${base - h * 0.62} ${x + ((i + 1) * w) / peaks} ${base - h * 0.55}`;
  }
  roof += ` L${x + w + 30} ${base} Z`;
  return (
    <g>
      <path d={`M${x - 80} ${base} L${x - 30} ${base - h * 0.3} M${x + w + 80} ${base} L${x + w + 30} ${base - h * 0.3}`} stroke={p("#2a1e18")} strokeWidth={2} />
      <path d={roof} fill={p(color)} />
      <rect x={x + w * 0.3} y={base - h * 0.5} width={w * 0.4} height={h * 0.5} fill={p(open)} />
      {Array.from({ length: 6 }).map((_, i) => (
        <path key={i} d={`M${x + (i * w) / 5} ${base - h * 0.5} L${x + (i * w) / 5} ${base}`} stroke={p("#00000055")} strokeWidth={2} />
      ))}
    </g>
  );
};

// ---------------------------------------------------------------------------
// Market stall with striped awning; goods drop into place by `arrange` (0..1)
// ---------------------------------------------------------------------------
export const Stall: React.FC<{
  p: Paint;
  x: number;
  base: number;
  w: number;
  stripes: [string, string];
  arrange: number;
  seed: number;
}> = ({ p, x, base, w, stripes, arrange, seed }) => {
  const rand = mulberry32(seed);
  const top = base - 250;
  const n = 7;
  const goods = Array.from({ length: 5 }).map((_, i) => ({
    kind: Math.floor(rand() * 4),
    gx: x + 30 + i * ((w - 60) / 5),
    col: ["#8a3b2a", "#c9a24a", "#3b5a7a", "#6a7a3a", "#a05a2c"][Math.floor(rand() * 5)],
  }));
  return (
    <g>
      <rect x={x + 6} y={top} width={9} height={250} fill={p("#3a2414")} />
      <rect x={x + w - 15} y={top} width={9} height={250} fill={p("#3a2414")} />
      {Array.from({ length: n }).map((_, i) => (
        <path
          key={i}
          d={`M${x - 20 + (i * (w + 40)) / n} ${top - 30} L${x - 20 + ((i + 1) * (w + 40)) / n} ${top - 30} L${x - 20 + ((i + 1) * (w + 40)) / n} ${top + 10} Q${x - 20 + ((i + 0.5) * (w + 40)) / n} ${top + 30} ${x - 20 + (i * (w + 40)) / n} ${top + 10} Z`}
          fill={p(stripes[i % 2])}
        />
      ))}
      <rect x={x} y={base - 90} width={w} height={90} fill={p("#5a3a22")} />
      <rect x={x - 6} y={base - 96} width={w + 12} height={12} fill={p("#6e4a2c")} />
      {goods.map((g, i) => {
        const t = Math.max(0, Math.min(1, arrange * 5 - i));
        const drop = (1 - t) * -60;
        const y = base - 96 + drop;
        return (
          <g key={i} opacity={t}>
            {g.kind === 0 ? (
              <path d={`M${g.gx} ${y} q-18 -10 -14 -40 q4 -14 14 -16 q10 2 14 16 q4 30 -14 40 Z M${g.gx - 6} ${y - 56} h12 v8 h-12 Z`} fill={p(g.col)} />
            ) : g.kind === 1 ? (
              <g>
                <ellipse cx={g.gx} cy={y - 18} rx={28} ry={20} fill={p("#8a6a3a")} />
                {[-12, 0, 12].map((dx) => (
                  <circle key={dx} cx={g.gx + dx} cy={y - 34} r={7} fill={p("#5a2a14")} />
                ))}
              </g>
            ) : g.kind === 2 ? (
              <g>
                <rect x={g.gx - 26} y={y - 24} width={52} height={24} rx={12} fill={p(g.col)} />
                <rect x={g.gx - 20} y={y - 44} width={40} height={22} rx={11} fill={p(stripes[0])} />
              </g>
            ) : (
              <path d={`M${g.gx - 24} ${y} q-4 -40 10 -46 q4 -8 14 0 q16 6 10 46 Z`} fill={p("#b8955e")} />
            )}
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------------------
// Balance scale (mizan) — a symbol of honest trade. `tilt` in degrees.
// ---------------------------------------------------------------------------
export const BalanceScale: React.FC<{ p: Paint; x: number; y: number; s?: number; tilt: number; color?: string }> = ({
  p,
  x,
  y,
  s = 1,
  tilt,
  color = C.gold,
}) => {
  const arm = 230;
  const rad = (tilt * Math.PI) / 180;
  const lx = -Math.cos(rad) * arm;
  const ly = -Math.sin(rad) * arm;
  const rx = Math.cos(rad) * arm;
  const ry = Math.sin(rad) * arm;
  const pan = (px: number, py: number, key: string) => (
    <g key={key}>
      <path d={`M${px} ${py} L${px - 80} ${py + 170} M${px} ${py} L${px + 80} ${py + 170} M${px} ${py} L${px} ${py + 170}`} stroke={p(C.goldDeep)} strokeWidth={3} />
      <path d={`M${px - 100} ${py + 170} Q${px} ${py + 230} ${px + 100} ${py + 170} Z`} fill={p(color)} />
      <circle cx={px} cy={py} r={9} fill={p(color)} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-12} y={-10} width={24} height={520} fill={p(C.goldDeep)} />
      <path d={`M-120 520 L120 520 L90 490 L-90 490 Z`} fill={p(color)} />
      <path d={`M-30 -10 L0 -60 L30 -10 Z`} fill={p(color)} />
      <path d={`M${lx} ${ly} L${rx} ${ry}`} stroke={p(color)} strokeWidth={16} strokeLinecap="round" />
      <circle cx={0} cy={0} r={18} fill={p(C.goldLight)} />
      {pan(lx, ly, "l")}
      {pan(rx, ry, "r")}
    </g>
  );
};

// Empty wooden cradle — a symbolic object only
export const Cradle: React.FC<{ p: Paint; x: number; base: number; s?: number }> = ({ p, x, base, s = 1 }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}>
    <path d="M-120 -20 Q-130 -110 -100 -120 L100 -120 Q130 -110 120 -20 Z" fill={p("#6a4428")} />
    <path d="M-100 -112 L100 -112 L96 -96 L-96 -96 Z" fill={p("#c9b08a")} />
    <path d="M-150 0 Q0 -46 150 0 L150 8 Q0 -36 -150 8 Z" fill={p("#4a2e18")} />
    {[-70, -35, 0, 35, 70].map((dx) => (
      <rect key={dx} x={dx - 4} y={-118} width={8} height={98} fill={p("#4a2e18")} />
    ))}
  </g>
);

export const Sheep: React.FC<{ p: Paint; x: number; y: number; s?: number; flip?: boolean; graze?: number }> = ({
  p,
  x,
  y,
  s = 1,
  flip = false,
  graze = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <rect x={-22} y={-16} width={6} height={16} fill={p("#2a2220")} />
    <rect x={14} y={-16} width={6} height={16} fill={p("#2a2220")} />
    <ellipse cx={0} cy={-30} rx={34} ry={20} fill={p("#e8dcc4")} />
    <circle cx={-18} cy={-40} r={12} fill={p("#e8dcc4")} />
    <circle cx={14} cy={-42} r={13} fill={p("#e8dcc4")} />
    <ellipse cx={38} cy={-36 + graze * 18} rx={10} ry={8} fill={p("#2a2220")} />
  </g>
);

// Wooden table top in gentle perspective under the book
export const TableTop: React.FC<{ p: Paint; top: number }> = ({ p, top }) => (
  <g>
    <path d={`M-400 ${top} L1480 ${top} L1480 2400 L-400 2400 Z`} fill={p("#3a2214")} />
    {Array.from({ length: 9 }).map((_, i) => (
      <path key={i} d={`M${-400 + i * 240} ${top} L${-900 + i * 360} 2400`} stroke={p("#24140b")} strokeWidth={4} />
    ))}
    {Array.from({ length: 14 }).map((_, i) => (
      <path
        key={"g" + i}
        d={`M${-300 + i * 130} ${top + 60 + (i % 3) * 140} q60 -10 120 0 t120 0`}
        stroke={p("#4c2e1a")}
        strokeWidth={3}
        fill="none"
        opacity={0.6}
      />
    ))}
    <path d={`M-400 ${top} L1480 ${top} L1480 ${top + 14} L-400 ${top + 14} Z`} fill={p("#5a3820")} />
  </g>
);

// ---------------------------------------------------------------------------
// Clay oil lamp with a living flame; `flicker` (≈0.8–1.1) scales the flame.
// ---------------------------------------------------------------------------
export const OilLamp: React.FC<{ p: Paint; x: number; y: number; s?: number; flicker: number; sway: number }> = ({
  p,
  x,
  y,
  s = 1,
  flicker,
  sway,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={92} ry={16} fill="#000000" opacity={0.35} />
    <path d="M-80 0 Q-86 -40 -30 -46 L40 -44 Q70 -40 96 -22 L118 -20 Q126 -12 116 -6 L80 -4 Q40 6 -40 6 Q-76 6 -80 0 Z" fill={p("#9a5a32")} />
    <path d="M-80 -20 Q-112 -34 -104 -6 Q-98 6 -80 -4" fill="none" stroke={p("#7a4426")} strokeWidth={9} />
    <ellipse cx={-10} cy={-44} rx={30} ry={7} fill={p("#5a3018")} />
    <path d="M-60 -24 Q0 -36 70 -26" stroke={p("#c08050")} strokeWidth={3} fill="none" opacity={0.7} />
    {/* flame from the nozzle */}
    <g transform={`translate(112 -22) rotate(${sway}) scale(${flicker})`}>
      <path d="M0 0 Q-16 -24 -2 -58 Q4 -42 12 -34 Q20 -18 0 0 Z" fill={p(theme.colors.flameOrange)} />
      <path d="M0 -2 Q-8 -18 0 -38 Q8 -20 0 -2 Z" fill={p(theme.colors.flameYellow)} />
    </g>
  </g>
);

// Glazed inkwell with a reed pen (qalam) laid beside it
export const InkwellQalam: React.FC<{ p: Paint; x: number; y: number; s?: number }> = ({ p, x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={10} cy={8} rx={70} ry={16} fill="#000000" opacity={0.35} />
    <path d="M-44 0 L-40 -64 Q0 -76 40 -64 L44 0 Q0 12 -44 0 Z" fill={p("#1f3d48")} />
    <ellipse cx={0} cy={-66} rx={40} ry={11} fill={p("#2c5562")} />
    <ellipse cx={0} cy={-66} rx={20} ry={6} fill={p("#0a0a0c")} />
    <path d="M-30 -30 Q0 -38 30 -30" stroke={p("#4a8090")} strokeWidth={3} fill="none" opacity={0.6} />
    <g transform="translate(-150 40) rotate(-24)">
      <rect x={0} y={-5} width={260} height={10} rx={5} fill={p("#b8955e")} />
      <path d="M260 -5 L300 0 L260 5 Z" fill={p("#8a6a3a")} />
      {[50, 120, 190].map((nx) => (
        <rect key={nx} x={nx} y={-6} width={4} height={12} fill={p("#8a6a3a")} />
      ))}
    </g>
  </g>
);
