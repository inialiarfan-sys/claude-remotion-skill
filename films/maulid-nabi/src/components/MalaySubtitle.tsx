import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { latinStack, theme } from "../theme";
import { clamp } from "./textMotion";

// Malay line, words rising in a 4-frame stagger; exits faster than it enters.
export const MalaySubtitle: React.FC<{
  text: string;
  start: number;
  end?: number;
  top: number;
  size?: number;
  color?: string;
  tracking?: number;
  weight?: number;
  italic?: boolean;
  maxWidth?: number;
  ornament?: boolean;
  shadow?: boolean;
}> = ({
  text,
  start,
  end,
  top,
  size = 44,
  color = theme.colors.parchmentLight,
  tracking = 0.16,
  weight = 600,
  italic = false,
  maxWidth = 900,
  ornament = true,
  shadow = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start - 1 || (end !== undefined && frame > end)) return null;
  const exit = end === undefined ? 0 : interpolate(frame, [end - 12, end], [0, 1], { ...clamp, easing: theme.ease.in });
  const words = text.split(" ");
  const line = spring({ frame: frame - start - words.length * 4, fps, config: theme.spring.smooth });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: 1 - exit,
        transform: `translateY(${-exit * 16}px)`,
        filter: shadow ? "drop-shadow(0 2px 2px rgba(0,0,0,0.6)) drop-shadow(0 6px 16px rgba(0,0,0,0.5))" : undefined,
      }}
    >
      {ornament ? (
        <svg width={420} height={22} style={{ marginBottom: 14, opacity: line }}>
          <line x1={210 - 190 * line} y1={11} x2={196} y2={11} stroke={theme.colors.gold} strokeWidth={1.5} />
          <line x1={224} y1={11} x2={210 + 190 * line} y2={11} stroke={theme.colors.gold} strokeWidth={1.5} />
          <path d="M210 3 L218 11 L210 19 L202 11 Z" fill={theme.colors.gold} transform={`rotate(${(1 - line) * 90} 210 11)`} />
        </svg>
      ) : null}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: size * 0.32,
          maxWidth,
          fontFamily: latinStack,
          fontWeight: weight,
          fontStyle: italic ? "italic" : "normal",
          fontSize: size,
          letterSpacing: `${tracking}em`,
          lineHeight: 1.3,
          color,
          textAlign: "center",
        }}
      >
        {words.map((w, i) => {
          const p = spring({ frame: frame - start - i * 4, fps, config: theme.spring.smooth });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [18, 0])}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
