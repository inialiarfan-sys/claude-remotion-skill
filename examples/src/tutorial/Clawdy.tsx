import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ttheme } from "./theme3";

export type Expression = "happy" | "thinking" | "excited" | "wink";
export type Pose = "rest" | "wave" | "pointL" | "pointR";

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

const Arm: React.FC<{ side: 1 | -1; angle: number }> = ({ side, angle }) => (
  <g transform={`translate(${side * 60}, 6) rotate(${angle})`}>
    <ellipse cx={0} cy={22} rx={13} ry={24} fill={ttheme.colors.primaryDark} />
  </g>
);

const Eye: React.FC<{
  x: number;
  open: number;
  look: [number, number];
  wink?: boolean;
}> = ({ x, open, look, wink }) => {
  const c = ttheme.colors;
  if (wink) {
    return (
      <path
        d={`M${x - 10},-6 Q${x},-17 ${x + 10},-6`}
        stroke={c.ink}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  return (
    <g
      transform={`translate(${x + look[0]}, ${-8 + look[1]}) scale(1, ${open})`}
    >
      <ellipse rx={10.5} ry={14} fill={c.ink} />
      <circle cx={3.5} cy={-5} r={4.2} fill="#fff" />
      <circle cx={-3.5} cy={5} r={1.8} fill="#fff" opacity={0.8} />
    </g>
  );
};

const Mouth: React.FC<{ expression: Expression }> = ({ expression }) => {
  const c = ttheme.colors;
  if (expression === "excited") {
    return (
      <g>
        <path d="M-14,12 Q0,36 14,12 Z" fill={c.ink} />
        <ellipse cx={0} cy={24} rx={6} ry={3.5} fill={c.blush} />
      </g>
    );
  }
  if (expression === "thinking") {
    return <ellipse cx={8} cy={18} rx={4.5} ry={5} fill={c.ink} />;
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

// Clawdy — the mascot. Breathes and blinks on its own; parent drives expression/pose.
export const Clawdy: React.FC<{
  size: number;
  expression: Expression;
  pose: Pose;
}> = ({ size, expression, pose }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = ttheme.colors;

  // idle breathing (rule 7)
  const breathe = 1 + 0.03 * Math.sin((frame / fps) * Math.PI * 1.6);
  // blink every 2.5s, eased close/open over ~5 frames
  const cycle = frame % Math.round(fps * 2.5);
  const open = interpolate(cycle, [0, 2, 5], [1, 0.1, 1], {
    easing: ttheme.ease.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const look: [number, number] = expression === "thinking" ? [4, -4] : [0, 0];

  const wiggle = Math.sin((frame / fps) * Math.PI * 5) * 22;
  const bob = Math.sin((frame / fps) * Math.PI * 2) * 6;
  const right =
    pose === "wave" ? -150 + wiggle : pose === "pointR" ? -125 + bob : -28;
  const left = pose === "pointL" ? 125 - bob : 28;

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
        <path d={BODY} fill={c.primary} />
        {/* soft top-left sheen */}
        <ellipse
          cx={-26}
          cy={-40}
          rx={26}
          ry={14}
          fill="#fff"
          opacity={0.22}
          transform="rotate(-25 -26 -40)"
        />
        <ellipse
          cx={-42}
          cy={14}
          rx={10}
          ry={6}
          fill={c.blush}
          opacity={0.85}
        />
        <ellipse cx={42} cy={14} rx={10} ry={6} fill={c.blush} opacity={0.85} />
        <Eye x={-24} open={open} look={look} wink={expression === "wink"} />
        <Eye x={24} open={open} look={look} />
        <Mouth expression={expression} />
        {pose === "wave" &&
          [0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${104 + i * 11},${-78 + i * 6} q9,10 3,22`}
              stroke={c.ink}
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
              opacity={0.35 + 0.25 * Math.sin((frame / fps) * 10 + i)}
            />
          ))}
      </g>
    </svg>
  );
};
