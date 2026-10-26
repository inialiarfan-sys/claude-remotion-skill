import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PAPER_TEXTURE } from "../assets";
import { latinStack, theme } from "../theme";
import { DepthFill } from "./PaperLayer";
import { clamp, ltrSweepMask } from "./textMotion";

const C = theme.colors;

/**
 * Latin caption written line by line, like ink drawn left to right with a
 * pen — instead of words floating up. Lines are given explicitly so each one
 * can be inked in turn. Exits by fading back into the paper.
 */
export const InkCaption: React.FC<{
  lines: string[];
  start: number;
  end?: number;
  top: number;
  size?: number;
  color?: string;
  weight?: number;
  italic?: boolean;
  tracking?: number;
  per?: number; // frames to ink one line
  lineHeight?: number;
  shadow?: boolean;
  left?: number;
  width?: number;
  align?: "center" | "left";
}> = ({
  lines,
  start,
  end,
  top,
  size = 44,
  color = C.ink,
  weight = 700,
  italic = false,
  tracking = 0.06,
  per = 24,
  lineHeight = 1.28,
  shadow = false,
  left = 0,
  width = 1080,
  align = "center",
}) => {
  const frame = useCurrentFrame();
  if (frame < start - 1 || (end !== undefined && frame > end)) return null;
  const exit = end === undefined ? 0 : interpolate(frame, [end - 12, end], [0, 1], { ...clamp, easing: theme.ease.in });
  return (
    <div
      style={{
        position: "absolute",
        left,
        width,
        top,
        opacity: 1 - exit,
        filter: [shadow ? "drop-shadow(0 2px 2px rgba(0,0,0,0.7)) drop-shadow(0 6px 16px rgba(0,0,0,0.55))" : "", exit > 0 ? `blur(${exit * 4}px)` : ""].join(" ") || undefined,
      }}
    >
      {lines.map((ln, i) => {
        const a = start + i * Math.round(per * 0.85);
        const p = interpolate(frame, [a, a + per], [0, 1], { ...clamp, easing: theme.ease.soft });
        return (
          <div
            key={i}
            style={{
              fontFamily: latinStack,
              fontWeight: weight,
              fontStyle: italic ? "italic" : "normal",
              fontSize: size,
              letterSpacing: `${tracking}em`,
              lineHeight,
              color,
              textAlign: align,
              whiteSpace: "nowrap",
              ...ltrSweepMask(p),
            }}
          >
            {ln}
          </div>
        );
      })}
    </div>
  );
};

/**
 * A parchment strip that unrolls between two rods and receives the caption in
 * ink. Used for the chapter's statements, so text always sits on paper in the
 * world rather than floating over the picture.
 */
export const ScrollCaption: React.FC<{
  lines: string[];
  sub?: string;
  start: number;
  end: number;
  top: number;
  width?: number;
  size?: number;
  subSize?: number;
}> = ({ lines, sub, start, end, top, width = 940, size = 42, subSize = 27 }) => {
  const frame = useCurrentFrame();
  if (frame < start - 1 || frame > end) return null;
  const open = interpolate(frame, [start, start + 20], [0, 1], { ...clamp, easing: theme.ease.out });
  const close = interpolate(frame, [end - 14, end], [1, 0], { ...clamp, easing: theme.ease.in });
  const w = Math.min(open, close);
  const H = 44 + lines.length * size * 1.28 + (sub ? subSize * 1.45 + 10 : 0);
  const half = (width * w) / 2;
  const rod = (x: number) => (
    <div
      style={{
        position: "absolute",
        left: x - 11,
        top: top - 10,
        width: 22,
        height: H + 20,
        borderRadius: 11,
        background: "linear-gradient(90deg, #6a4a26, #d8b878 45%, #8a6a3a 80%, #5a3a1e)",
        boxShadow: "0 8px 14px rgba(0,0,0,0.5)",
      }}
    />
  );
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 540 - width / 2,
          top,
          width,
          height: H,
          clipPath: `inset(0 ${(1 - w) * 50}% 0 ${(1 - w) * 50}%)`,
          background: `linear-gradient(180deg, ${C.parchmentLight}, ${C.parchment} 55%, ${C.parchmentDark})`,
          boxShadow: "0 16px 34px rgba(0,0,0,0.5)",
        }}
      >
        <AbsoluteFill style={{ backgroundImage: `url(${PAPER_TEXTURE})`, backgroundSize: "512px", mixBlendMode: "multiply", opacity: 0.8 }} />
        <div style={{ position: "absolute", inset: "8px 18px", borderTop: `2px solid ${C.goldDeep}`, borderBottom: `2px solid ${C.goldDeep}`, opacity: 0.75 }} />
        <InkCaption lines={lines} start={start + 16} top={22} size={size} width={width} />
        {sub ? (
          <InkCaption
            lines={[sub]}
            start={start + 16 + lines.length * 20}
            top={22 + lines.length * size * 1.28 + 6}
            size={subSize}
            weight={600}
            italic
            tracking={0.01}
            color={C.inkSoft}
            width={width}
          />
        ) : null}
      </div>
      {w > 0.02 ? (
        <>
          {rod(540 - half)}
          {rod(540 + half)}
        </>
      ) : null}
    </>
  );
};

/**
 * A label tied to the object it names: a leader line draws from the object
 * to a small parchment tag, inked in. Lives in world space at `depth`, so it
 * travels with the object under the camera. Must sit inside a CinematicCamera.
 */
export const CalloutLabel: React.FC<{
  target: [number, number];
  label: [number, number];
  lines: string[];
  start: number;
  end: number;
  depth: number;
  size?: number;
  width?: number;
  lineColor?: string; // leader colour: light over scenery, ink over a map
}> = ({ target, label, lines, start, end, depth, size = 40, width = 560, lineColor = C.parchmentLight }) => {
  const frame = useCurrentFrame();
  if (frame < start - 1 || frame > end) return null;
  const draw = interpolate(frame, [start, start + 18], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const tag = interpolate(frame, [start + 14, start + 28], [0, 1], { ...clamp, easing: theme.ease.out });
  const exit = interpolate(frame, [end - 12, end], [1, 0], { ...clamp, easing: theme.ease.in });
  const H = 30 + lines.length * size * 1.28;
  const [tx, ty] = target;
  const [lx, ly] = label;
  const ey = ly + (ty > ly ? H : 0);
  return (
    <DepthFill depth={depth} style={{ opacity: exit }}>
      <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
        <path d={`M${tx} ${ty} L${lx} ${ey}`} pathLength={1} strokeDasharray={`${draw} 1`} stroke={lineColor} strokeWidth={3} fill="none" opacity={0.9} />
        <circle cx={tx} cy={ty} r={8 * draw} fill="none" stroke={lineColor} strokeWidth={3} />
        <circle cx={tx} cy={ty} r={3.5} fill={lineColor} opacity={draw} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: lx - width / 2,
          top: ly,
          width,
          height: H,
          opacity: tag,
          transform: `translateY(${(1 - tag) * 10}px)`,
          background: `linear-gradient(180deg, ${C.parchmentLight}, ${C.parchmentDark})`,
          border: `2px solid ${C.goldDeep}`,
          borderRadius: 6,
          boxShadow: "0 10px 22px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        <InkCaption lines={lines} start={start + 22} top={15} size={size} width={width} italic weight={600} tracking={0.01} />
      </div>
    </DepthFill>
  );
};
