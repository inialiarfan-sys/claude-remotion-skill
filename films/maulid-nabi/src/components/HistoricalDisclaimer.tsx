import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { latinStack, theme } from "../theme";
import { clamp } from "./textMotion";

export const DISCLAIMER = "SEKADAR GAMBARAN BERDASARKAN RIWAYAT SEJARAH";

/**
 * Parchment label stating that the scene only illustrates a historical
 * report. Dark ink on light paper for maximum legibility; it stays on screen
 * for most of the scene and never implies the report is authentic.
 */
export const HistoricalDisclaimer: React.FC<{ start: number; end: number; top?: number }> = ({
  start,
  end,
  top = 1430,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start - 1 || frame > end) return null;
  const p = spring({ frame: frame - start, fps, config: theme.spring.smooth });
  const unroll = interpolate(frame, [start, start + 22], [0, 1], { ...clamp, easing: theme.ease.out });
  const exit = interpolate(frame, [end - 12, end], [0, 1], { ...clamp, easing: theme.ease.in });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        display: "flex",
        justifyContent: "center",
        opacity: Math.min(1, p * 1.5) * (1 - exit),
        transform: `translateY(${interpolate(p, [0, 1], [24, 0]) + exit * 14}px)`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: 820,
          padding: "22px 40px 24px",
          background: `linear-gradient(180deg, ${theme.colors.parchmentLight}, ${theme.colors.parchment} 60%, ${theme.colors.parchmentDark})`,
          borderRadius: 6,
          boxShadow: "0 14px 30px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.35) inset",
          clipPath: `inset(0 ${(1 - unroll) * 50}% 0 ${(1 - unroll) * 50}%)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 8,
            border: `1.5px solid ${theme.colors.goldDeep}`,
            borderRadius: 3,
            opacity: 0.8,
          }}
        />
        <div
          style={{
            fontFamily: latinStack,
            fontWeight: 700,
            fontSize: 37,
            letterSpacing: "0.07em",
            lineHeight: 1.25,
            color: theme.colors.ink,
            textAlign: "center",
          }}
        >
          SEKADAR GAMBARAN
          <br />
          BERDASARKAN RIWAYAT SEJARAH
        </div>
      </div>
    </div>
  );
};
