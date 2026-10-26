import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { arabicStack, theme } from "../theme";
import { clamp, enterExit, rtlSweepMask } from "./textMotion";

/**
 * Arabic heading revealed like ink flowing right-to-left across a manuscript,
 * then finished with a slow gold-leaf sheen. The text is one shaped run in a
 * real Arabic font (Amiri) — letters are never positioned individually.
 */
export const ArabicTitle: React.FC<{
  text: string;
  start: number;
  end?: number;
  size?: number;
  top: number;
  tone?: "gold" | "ink";
  revealLen?: number;
  maxWidth?: number;
  lineHeight?: number;
  shadow?: boolean;
}> = ({ text, start, end, size = 96, top, tone = "gold", revealLen = 34, maxWidth = 940, lineHeight = 1.75, shadow = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { enter, exit, visible } = enterExit(frame, fps, start, end);
  if (!visible) return null;
  const sweep = interpolate(frame, [start, start + revealLen], [0, 1], { ...clamp, easing: theme.ease.soft });
  const sheen = interpolate(frame, [start + revealLen * 0.6, start + revealLen * 0.6 + 70], [120, -40], {
    ...clamp,
    easing: theme.ease.inOut,
  });
  const fill =
    tone === "gold"
      ? `linear-gradient(100deg, transparent ${sheen - 12}%, rgba(255,250,230,0.95) ${sheen}%, transparent ${sheen + 12}%),
         linear-gradient(180deg, ${theme.colors.goldLight} 10%, ${theme.colors.gold} 55%, ${theme.colors.goldDeep} 95%)`
      : `linear-gradient(180deg, ${theme.colors.ink}, ${theme.colors.inkSoft})`;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        display: "flex",
        justifyContent: "center",
        opacity: Math.min(1, enter * 1.4) * (1 - exit),
        transform: `translateY(${interpolate(enter, [0, 1], [26, 0]) - exit * 22}px) scale(${interpolate(enter, [0, 1], [0.97, 1])})`,
        filter: shadow
          ? `drop-shadow(0 3px 2px rgba(0,0,0,0.55)) drop-shadow(0 10px 24px rgba(0,0,0,0.55))${exit > 0 ? ` blur(${exit * 6}px)` : ""}`
          : undefined,
      }}
    >
      <div
        dir="rtl"
        lang="ar"
        style={{
          fontFamily: arabicStack,
          fontWeight: 700,
          fontSize: size,
          lineHeight,
          textAlign: "center",
          maxWidth,
          padding: "0 12px",
          backgroundImage: fill,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          ...rtlSweepMask(sweep),
        }}
      >
        {text}
      </div>
    </div>
  );
};
