import React, { createContext, useContext } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { noise1 } from "../random";
import { HEIGHT, WIDTH } from "../timeline";

export type CamKey = { f: number; x: number; y: number; zoom: number };
type Cam = { x: number; y: number; zoom: number };

const CameraCtx = createContext<Cam>({ x: 0, y: 0, zoom: 1 });
export const useCamera = () => useContext(CameraCtx);

// camera state at a frame (without handheld drift) — lets scenes compute where
// a world point sits on screen, e.g. to open a transition from it
export const sampleCamera = (keys: CamKey[], frame: number): Cam => {
  if (frame <= keys[0].f) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame <= b.f) {
      const t = interpolate(frame, [a.f, b.f], [0, 1], {
        easing: theme.ease.inOut,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, zoom: a.zoom + (b.zoom - a.zoom) * t };
    }
  }
  return keys[keys.length - 1];
};

/**
 * A virtual camera for a stack of paper layers. Layers read it through
 * useDepth(depth): far layers (small depth) move and scale less than near ones,
 * which produces parallax. A faint handheld drift keeps holds alive.
 */
export const CinematicCamera: React.FC<{
  keys: CamKey[];
  drift?: number;
  shake?: (frame: number) => { x: number; y: number };
  children: React.ReactNode;
}> = ({ keys, drift = 1, shake, children }) => {
  const frame = useCurrentFrame();
  const base = sampleCamera(keys, frame);
  const s = shake ? shake(frame) : { x: 0, y: 0 };
  const cam = {
    x: base.x + noise1(frame / 70, 3) * 4 * drift + s.x,
    y: base.y + noise1(frame / 85, 7) * 3 * drift + s.y,
    zoom: base.zoom,
  };
  return (
    <CameraCtx.Provider value={cam}>
      <AbsoluteFill style={{ overflow: "hidden" }}>{children}</AbsoluteFill>
    </CameraCtx.Provider>
  );
};

// transform for a layer at a given depth (0 = infinitely far, 1 = focal plane)
export const useDepth = (depth: number, bleed = 400): React.CSSProperties => {
  const cam = useCamera();
  const scale = 1 + (cam.zoom - 1) * depth;
  return {
    transform: `translate(${-cam.x * depth}px, ${-cam.y * depth}px) scale(${scale})`,
    transformOrigin: `${bleed + WIDTH / 2}px ${bleed + HEIGHT / 2}px`,
    willChange: "transform",
  };
};

// screen position of a world point on a layer at `depth`, for a camera state
export const toScreen = (cam: { x: number; y: number; zoom: number }, px: number, py: number, depth = 1): [number, number] => {
  const s = 1 + (cam.zoom - 1) * depth;
  return [WIDTH / 2 + s * (px - WIDTH / 2) - cam.x * depth, HEIGHT / 2 + s * (py - HEIGHT / 2) - cam.y * depth];
};
