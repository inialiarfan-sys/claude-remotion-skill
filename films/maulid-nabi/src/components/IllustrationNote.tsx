import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { latinStack, theme } from "../theme";
import { clamp } from "./textMotion";

/**
 * Small manuscript-style gloss that marks a scene as an artistic illustration
 * of an environment, so it is never read as a recreation of a specific moment.
 */
export const IllustrationNote: React.FC<{ start: number; end: number; top?: number; text?: string; ink?: boolean }> = ({
  start,
  end,
  top = 1700,
  text = "Ilustrasi suasana — bukan gambaran peristiwa sebenar",
  ink = false,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [start, start + 20, end - 12, end], [0, 0.9, 0.9, 0], { ...clamp, easing: theme.ease.inOut });
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        textAlign: "center",
        fontFamily: latinStack,
        fontStyle: "italic",
        fontWeight: 600,
        fontSize: 27,
        letterSpacing: "0.02em",
        color: ink ? theme.colors.inkSoft : theme.colors.parchmentLight,
        opacity: o,
        filter: ink ? undefined : "drop-shadow(0 2px 4px rgba(0,0,0,0.9))",
      }}
    >
      {text}
    </div>
  );
};
