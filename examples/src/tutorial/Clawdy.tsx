import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ttheme } from "./theme3";

export type Expression =
  | "happy"
  | "thinking"
  | "excited"
  | "wink"
  | "love"
  | "star"
  | "surprised"
  | "laugh"
  | "proud";
export type Pose = "rest" | "wave" | "pointL" | "pointR" | "cheer";

const c = ttheme.colors;

// soft 8-lobed starburst body, generated once
const BODY = (() => {
  const R = 72;
  const pts: string[] = [];
  for (let d = 0; d < 360; d += 3) {
    const a = (d * Math.PI) / 180;
    const r = R * (1 + 0.075 * Math.cos(8 * a));
    pts.push(`${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
})();

const HEART =
  "M0,6 C-2,3 -11,-1 -11,-7 C-11,-12 -5,-14 0,-9 C5,-14 11,-12 11,-7 C11,-1 2,3 0,6 Z";
const STAR = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 6 : 14;
    pts.push(`${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
})();

const Arm: React.FC<{ side: 1 | -1; angle: number }> = ({ side, angle }) => (
  <g transform={`translate(${side * 60}, 6) rotate(${angle})`}>
    <ellipse cx={0} cy={22} rx={13} ry={24} fill={c.primaryDark} />
  </g>
);

// brow offsets per expression: [lift, tilt] for left / right
const BROWS: Record<Expression, [number, number, number, number]> = {
  happy: [0, 0, 0, 0],
  excited: [7, -6, 7, 6],
  thinking: [-2, 10, 9, 8],
  wink: [-1, 0, 6, 8],
  love: [6, -8, 6, 8],
  star: [8, -6, 8, 6],
  surprised: [12, -4, 12, 4],
  laugh: [6, -10, 6, 10],
  proud: [-2, 12, -2, -12],
};

const Brow: React.FC<{ x: number; lift: number; tilt: number }> = ({
  x,
  lift,
  tilt,
}) => (
  <path
    d={`M${x - 9},${-32 - lift} Q${x},${-38 - lift} ${x + 9},${-32 - lift}`}
    transform={`rotate(${tilt} ${x} ${-34 - lift})`}
    stroke={c.ink}
    strokeWidth={4.5}
    strokeLinecap="round"
    fill="none"
  />
);

const ClosedEye: React.FC<{ x: number }> = ({ x }) => (
  <path
    d={`M${x - 11},-4 Q${x},-18 ${x + 11},-4`}
    stroke={c.ink}
    strokeWidth={5.5}
    strokeLinecap="round"
    fill="none"
  />
);

const Eye: React.FC<{
  x: number;
  open: number;
  look: [number, number];
  expression: Expression;
  pulse: number;
  closed?: boolean;
}> = ({ x, open, look, expression, pulse, closed }) => {
  if (closed || expression === "laugh" || expression === "proud") {
    return <ClosedEye x={x} />;
  }
  if (expression === "love") {
    return (
      <g transform={`translate(${x}, -8) scale(${1.25 + pulse * 0.2})`}>
        <path d={HEART} fill={c.heart} />
        <circle cx={-5} cy={-7} r={2.2} fill="#fff" opacity={0.85} />
      </g>
    );
  }
  if (expression === "star") {
    return (
      <g transform={`translate(${x}, -8) rotate(${pulse * 20}) scale(${1.05 + pulse * 0.15})`}>
        <path d={STAR} fill={c.sun} stroke={c.ink} strokeWidth={3} strokeLinejoin="round" />
      </g>
    );
  }
  if (expression === "surprised") {
    return (
      <g transform={`translate(${x}, -8) scale(1, ${open})`}>
        <circle r={14} fill="#fff" stroke={c.ink} strokeWidth={4} />
        <circle cx={look[0] * 4} cy={look[1] * 4} r={6.5} fill={c.ink} />
        <circle cx={look[0] * 4 + 2.5} cy={look[1] * 4 - 2.5} r={2} fill="#fff" />
      </g>
    );
  }
  const big = expression === "excited" ? 1.12 : 1;
  return (
    <g
      transform={`translate(${x + look[0] * 5}, ${-8 + look[1] * 4}) scale(${big}, ${open * big})`}
    >
      <ellipse rx={10.5} ry={14} fill={c.ink} />
      <circle cx={3.5} cy={-5} r={4.2} fill="#fff" />
      <circle cx={-3.5} cy={5} r={1.8} fill="#fff" opacity={0.8} />
    </g>
  );
};

const Mouth: React.FC<{ expression: Expression; talk: number }> = ({
  expression,
  talk,
}) => {
  const open = (w: number, h: number, y = 16) => (
    <g>
      <ellipse cx={0} cy={y} rx={w} ry={h} fill={c.ink} />
      <ellipse cx={0} cy={y + h * 0.5} rx={w * 0.55} ry={h * 0.35} fill={c.blush} />
    </g>
  );
  if (expression === "excited" || expression === "star" || expression === "laugh") {
    const w = expression === "laugh" ? 18 : 14;
    return (
      <g>
        <path d={`M${-w},11 Q0,${38 + talk * 4} ${w},11 Z`} fill={c.ink} />
        <ellipse cx={0} cy={25 + talk * 2} rx={w * 0.45} ry={4} fill={c.blush} />
      </g>
    );
  }
  if (expression === "surprised") return open(7 + talk * 2, 9 + talk * 3);
  // talking overrides the resting mouth for the calmer faces
  if (talk > 0.05) return open(8 + talk * 3, 3 + talk * 8);
  if (expression === "thinking") {
    return <ellipse cx={8} cy={18} rx={4.5} ry={5} fill={c.ink} />;
  }
  if (expression === "love") {
    return (
      <path
        d="M-12,14 q6,8 12,0 q6,8 12,0"
        stroke={c.ink}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  }
  if (expression === "proud") {
    return (
      <path
        d="M-12,16 Q2,24 13,10"
        stroke={c.ink}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  const wide = expression === "wink" ? 13 : 10;
  return (
    <path
      d={`M${-wide},13 Q0,${expression === "wink" ? 27 : 24} ${wide},13`}
      stroke={c.ink}
      strokeWidth={5}
      strokeLinecap="round"
      fill="none"
    />
  );
};

// Clawdy — the mascot. Breathes and blinks on its own; parent drives the acting.
export const Clawdy: React.FC<{
  size: number;
  expression: Expression;
  pose: Pose;
  look?: [number, number]; // -1..1, where the pupils point
  talk?: number; // 0..1 mouth open while speaking
}> = ({ size, expression, pose, look = [0, 0], talk = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // idle breathing (rule 7)
  const breathe = 1 + 0.03 * Math.sin(t * Math.PI * 1.6);
  // blink every 2.5s, eased close/open over ~5 frames
  const cycle = frame % Math.round(fps * 2.5);
  const open = interpolate(cycle, [0, 2, 5], [1, 0.1, 1], {
    easing: ttheme.ease.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 4);
  const eyeLook: [number, number] =
    expression === "thinking" ? [0.8, -0.9] : look;

  const wiggle = Math.sin(t * Math.PI * 5) * 22;
  const bob = Math.sin(t * Math.PI * 2) * 6;
  const right =
    pose === "wave" || pose === "cheer"
      ? -150 + wiggle
      : pose === "pointR"
        ? -125 + bob
        : -28 + Math.sin(t * 3) * 4;
  const left =
    pose === "cheer"
      ? 150 + wiggle
      : pose === "pointL"
        ? 125 - bob
        : 28 - Math.sin(t * 3) * 4;
  const [bl, btl, br, btr] = BROWS[expression];
  const blushK = expression === "love" || expression === "laugh" ? 1.35 : 1;

  return (
    <svg
      width={size}
      height={size}
      viewBox="-110 -110 220 220"
      style={{ overflow: "visible" }}
    >
      <g transform={`scale(${breathe})`}>
        <Arm side={-1} angle={left} />
        <Arm side={1} angle={right} />
        <path d={BODY} fill={c.primary} stroke={c.ink} strokeWidth={4} />
        {/* soft top-left sheen */}
        <ellipse
          cx={-26}
          cy={-40}
          rx={26}
          ry={14}
          fill="#fff"
          opacity={0.25}
          transform="rotate(-25 -26 -40)"
        />
        <ellipse
          cx={-42}
          cy={14}
          rx={10 * blushK}
          ry={6 * blushK}
          fill={c.blush}
          opacity={0.9}
        />
        <ellipse
          cx={42}
          cy={14}
          rx={10 * blushK}
          ry={6 * blushK}
          fill={c.blush}
          opacity={0.9}
        />
        <Brow x={-24} lift={bl} tilt={btl} />
        <Brow x={24} lift={br} tilt={btr} />
        <Eye
          x={-24}
          open={open}
          look={eyeLook}
          expression={expression}
          pulse={pulse}
          closed={expression === "wink"}
        />
        <Eye x={24} open={open} look={eyeLook} expression={expression} pulse={pulse} />
        <Mouth expression={expression} talk={talk} />
        {(pose === "wave" || pose === "cheer") &&
          [0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${104 + i * 11},${-78 + i * 6} q9,10 3,22`}
              stroke={c.ink}
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
              opacity={0.35 + 0.25 * Math.sin(t * 10 + i)}
            />
          ))}
      </g>
    </svg>
  );
};
