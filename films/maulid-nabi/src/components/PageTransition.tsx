import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PAPER_TEXTURE } from "../assets";
import { theme } from "../theme";
import { clamp } from "./textMotion";

export type EnterKind = "none" | "aperture" | "unfold";
export type ExitKind = "none" | "zoomInto" | "pageTurn" | "shadowSweep" | "foldInto";
export type Rect = { x: number; y: number; w: number; h: number };

const parchmentBack: React.CSSProperties = {
  background: `linear-gradient(90deg, ${theme.colors.parchmentDark}, ${theme.colors.parchment} 40%, ${theme.colors.parchmentLight})`,
};

/**
 * Wraps a scene and performs its entrance and exit transitions. Which of two
 * overlapping scenes sits on top is decided by zIndex in Video.tsx:
 *   enter "aperture"   — the new world opens out of a window on the page
 *   enter "unfold"     — a folded parchment sheet opens from its centre crease
 *   exit  "zoomInto"   — the camera pushes into the page
 *   exit  "pageTurn"   — the scene is a manuscript leaf turned right-to-left
 *   exit  "shadowSweep"— architectural shadow passes across and carries it away
 *   exit  "foldInto"   — the scene folds down onto the page of the book
 */
export const PageTransition: React.FC<{
  dur: number;
  enter?: { kind: EnterKind; len: number; from?: Rect };
  exit?: { kind: ExitKind; len: number; to?: Rect };
  children: React.ReactNode;
}> = ({ dur, enter = { kind: "none", len: 0 }, exit = { kind: "none", len: 0 }, children }) => {
  const frame = useCurrentFrame();
  const pin =
    enter.len > 0 ? interpolate(frame, [0, enter.len], [0, 1], { ...clamp, easing: theme.ease.inOut }) : 1;
  const pout =
    exit.len > 0 ? interpolate(frame, [dur - exit.len, dur], [0, 1], { ...clamp, easing: theme.ease.inOut }) : 0;

  let content: React.ReactNode = children;
  const outerStyle: React.CSSProperties = {};
  const overlays: React.ReactNode[] = [];

  // ---- entrances ----
  if (enter.kind === "aperture" && pin < 1) {
    const r = enter.from ?? { x: 290, y: 760, w: 500, h: 520 };
    const top = r.y * (1 - pin);
    const left = r.x * (1 - pin);
    const right = (1080 - r.x - r.w) * (1 - pin);
    const bottom = (1920 - r.y - r.h) * (1 - pin);
    outerStyle.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${Math.max(0, 260 * (1 - pin))}px ${Math.max(0, 260 * (1 - pin))}px 8px 8px)`;
    content = (
      <AbsoluteFill style={{ transform: `scale(${interpolate(pin, [0, 1], [0.7, 1])})`, transformOrigin: "50% 55%" }}>
        {children}
      </AbsoluteFill>
    );
  }
  if (enter.kind === "unfold" && pin < 1) {
    const half = 50 * (1 - pin);
    outerStyle.clipPath = `inset(${half}% 0 ${half}% 0)`;
    // crease shading on the two leaves as they open flat
    overlays.push(
      <AbsoluteFill
        key="crease"
        style={{
          background: `linear-gradient(180deg, rgba(60,35,10,${0.55 * (1 - pin)}) 0%, transparent 18%, transparent 46%, rgba(60,35,10,${0.45 * (1 - pin)}) 50%, transparent 54%, transparent 82%, rgba(60,35,10,${0.55 * (1 - pin)}) 100%)`,
        }}
      />,
    );
    content = (
      <AbsoluteFill style={{ transform: `scaleY(${interpolate(pin, [0, 1], [1.12, 1])})` }}>{children}</AbsoluteFill>
    );
  }

  // ---- exits ----
  if (exit.kind === "zoomInto" && pout > 0) {
    content = (
      <AbsoluteFill
        style={{
          transform: `scale(${interpolate(pout, [0, 1], [1, 2.3])})`,
          transformOrigin: "50% 54%",
          filter: `blur(${pout * 6}px) brightness(${1 + pout * 0.4})`,
        }}
      >
        {content}
      </AbsoluteFill>
    );
  }
  if (exit.kind === "pageTurn" && pout > 0) {
    const angle = pout * 180;
    const lift = Math.sin(pout * Math.PI);
    return (
      <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: "100% 50%" }}>
        {/* cast shadow of the lifting leaf onto the page beneath */}
        <AbsoluteFill
          style={{
            background: `linear-gradient(90deg, rgba(0,0,0,${0.6 * lift}) 0%, rgba(0,0,0,${0.25 * lift}) ${100 - pout * 100}%, transparent 100%)`,
          }}
        />
        <AbsoluteFill
          style={{
            transformOrigin: "100% 50%",
            transform: `rotateY(${angle}deg) translateZ(${lift * 30}px)`,
            transformStyle: "preserve-3d",
          }}
        >
          <AbsoluteFill style={{ backfaceVisibility: "hidden", overflow: "hidden" }}>
            {content}
            <AbsoluteFill
              style={{
                background: `linear-gradient(90deg, rgba(0,0,0,${0.55 * pout}) 0%, rgba(255,240,210,${0.12 * lift}) 70%, rgba(0,0,0,${0.35 * lift}) 100%)`,
              }}
            />
          </AbsoluteFill>
          <AbsoluteFill style={{ ...parchmentBack, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <AbsoluteFill
              style={{ backgroundImage: `url(${PAPER_TEXTURE})`, backgroundSize: "512px", mixBlendMode: "multiply", opacity: 0.8 }}
            />
            <AbsoluteFill
              style={{ background: `linear-gradient(270deg, rgba(0,0,0,${0.4 * lift}), transparent 60%)` }}
            />
          </AbsoluteFill>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (exit.kind === "shadowSweep" && pout > 0) {
    // the shadow front travels left → right; behind it the old scene is gone
    const edge = pout * 140 - 20;
    const mask = `linear-gradient(90deg, transparent ${edge}%, #000 ${edge + 20}%)`;
    outerStyle.WebkitMaskImage = mask;
    outerStyle.maskImage = mask;
    overlays.push(
      <AbsoluteFill
        key="shadow"
        style={{
          background: `linear-gradient(90deg, transparent ${edge - 25}%, rgba(5,4,8,0.95) ${edge + 4}%, rgba(5,4,8,0.5) ${edge + 16}%, transparent ${edge + 34}%)`,
        }}
      />,
    );
  }
  if (exit.kind === "foldInto" && pout > 0) {
    const to = exit.to ?? { x: 140, y: 300, w: 800, h: 1150 };
    const sx = interpolate(pout, [0, 1], [1, to.w / 1080]);
    const sy = interpolate(pout, [0, 1], [1, to.h / 1920]);
    const tx = interpolate(pout, [0, 1], [0, to.x + to.w / 2 - 540]);
    const ty = interpolate(pout, [0, 1], [0, to.y + to.h / 2 - 960]);
    const fade = interpolate(pout, [0.55, 1], [1, 0], clamp);
    content = (
      <AbsoluteFill style={{ perspective: 2000 }}>
        <AbsoluteFill
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${sx}, ${sy}) rotateX(${Math.sin(pout * Math.PI) * 14}deg)`,
            opacity: fade,
            borderRadius: pout * 30,
            overflow: "hidden",
            boxShadow: `0 40px 80px rgba(0,0,0,${0.6 * pout})`,
          }}
        >
          {content}
          <AbsoluteFill style={{ background: `rgba(239,224,189,${pout * 0.65})`, mixBlendMode: "multiply" }} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={outerStyle}>
      {content}
      {overlays}
    </AbsoluteFill>
  );
};
