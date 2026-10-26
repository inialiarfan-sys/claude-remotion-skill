import React, { useId } from "react";
import { PAPER_TEXTURE } from "../assets";
import { HEIGHT, WIDTH } from "../timeline";
import { useDepth } from "./CinematicCamera";

export type Paint = (color: string) => string;

const BLEED = 400;

/**
 * One sheet of cut paper. `render` draws the sheet's shapes in frame
 * coordinates (0..1080 × 0..1920, with 400px of bleed on every side) and
 * receives a paint function: shapes are drawn once in colour, then again
 * with the handmade-paper texture multiplied on top. The sheet casts a soft
 * shadow on the layers behind it and moves with the camera at its depth.
 */
export const PaperLayer: React.FC<{
  depth: number;
  render: (p: Paint) => React.ReactNode;
  texture?: number;
  shadow?: number;
  shadowOpacity?: number;
  rim?: string;
  transform?: string;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({ depth, render, texture = 0.55, shadow = 14, shadowOpacity = 0.55, rim, transform = "", opacity = 1, style }) => {
  const id = "tex" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const depthStyle = useDepth(depth, BLEED);
  const filters = [
    rim ? `drop-shadow(0 -2px 0 ${rim})` : "",
    shadow > 0 ? `drop-shadow(0 ${Math.round(shadow * 0.45)}px ${shadow}px rgba(0,0,0,${shadowOpacity}))` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: -BLEED,
        top: -BLEED,
        width: WIDTH + BLEED * 2,
        height: HEIGHT + BLEED * 2,
        opacity,
        ...depthStyle,
        transform: `${depthStyle.transform} ${transform}`,
        ...style,
      }}
    >
      <svg
        width={WIDTH + BLEED * 2}
        height={HEIGHT + BLEED * 2}
        viewBox={`${-BLEED} ${-BLEED} ${WIDTH + BLEED * 2} ${HEIGHT + BLEED * 2}`}
        style={{ position: "absolute", inset: 0, filter: filters || undefined, overflow: "visible" }}
      >
        <defs>
          <pattern id={id} patternUnits="userSpaceOnUse" width={512} height={512}>
            <image href={PAPER_TEXTURE} width={512} height={512} />
          </pattern>
        </defs>
        <g>{render((c) => c)}</g>
        {texture > 0 ? (
          <g opacity={texture} style={{ mixBlendMode: "multiply" }}>
            {render(() => `url(#${id})`)}
          </g>
        ) : null}
      </svg>
    </div>
  );
};

// A plain (untextured) div that follows the camera at a depth — for glows,
// particles and other light that is not made of paper.
export const DepthFill: React.FC<{ depth: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  depth,
  children,
  style,
}) => {
  const depthStyle = useDepth(depth, BLEED);
  return (
    <div
      style={{
        position: "absolute",
        left: -BLEED,
        top: -BLEED,
        width: WIDTH + BLEED * 2,
        height: HEIGHT + BLEED * 2,
        ...depthStyle,
        ...style,
      }}
    >
      <div style={{ position: "absolute", left: BLEED, top: BLEED, width: WIDTH, height: HEIGHT, overflow: "visible" }}>
        {children}
      </div>
    </div>
  );
};
