import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { latinStack, theme } from "../theme";
import { clamp } from "./textMotion";

const C = theme.colors;

/**
 * Horizontal age ruler on a parchment strip. `marks` are labels with the
 * frame at which each becomes active; the gold bead travels between them.
 * Used both for documented ages and for purely illustrative year markers.
 */
export const AgeTimeline: React.FC<{
  marks: { label: string; at: number }[];
  top: number;
  start: number;
  end: number;
  note?: string;
}> = ({ marks, top, start, end, note }) => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [start, start + 18, end - 12, end], [0, 1, 1, 0], { ...clamp, easing: theme.ease.inOut });
  if (show <= 0) return null;
  const x0 = 210;
  const x1 = 870;
  const step = marks.length > 1 ? (x1 - x0) / (marks.length - 1) : 0;
  const pos =
    marks.length > 1
      ? interpolate(
          frame,
          marks.map((m) => m.at),
          marks.map((_, i) => x0 + i * step),
          { ...clamp, easing: theme.ease.inOut },
        )
      : x0;
  const draw = interpolate(frame, [start, start + 30], [0, 1], { ...clamp, easing: theme.ease.out });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, height: 210, opacity: show }}>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 0,
          height: note ? 200 : 160,
          borderRadius: 8,
          background: `linear-gradient(180deg, ${C.parchmentLight}, ${C.parchmentDark})`,
          boxShadow: "0 14px 30px rgba(0,0,0,0.5)",
        }}
      />
      <svg width={1080} height={210} style={{ position: "absolute", inset: 0 }}>
        <line x1={x0} y1={92} x2={x0 + (x1 - x0) * draw} y2={92} stroke={C.inkSoft} strokeWidth={3} />
        {marks.map((m, i) => {
          const x = x0 + i * step;
          const active = frame >= m.at;
          return <circle key={i} cx={x} cy={92} r={active ? 11 : 7} fill={active ? C.goldDeep : C.parchmentEdge} />;
        })}
        <circle cx={pos} cy={92} r={17} fill="none" stroke={C.gold} strokeWidth={4} />
      </svg>
      {marks.map((m, i) => {
        const x = x0 + i * step;
        const a = interpolate(frame, [m.at - 6, m.at + 8], [0.35, 1], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 110,
              width: 220,
              top: 112,
              textAlign: "center",
              fontFamily: latinStack,
              fontWeight: 700,
              fontSize: 27,
              letterSpacing: "0.06em",
              color: C.ink,
              opacity: a,
            }}
          >
            {m.label}
          </div>
        );
      })}
      {note ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 18,
            textAlign: "center",
            fontFamily: latinStack,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 26,
            color: C.inkSoft,
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
};
