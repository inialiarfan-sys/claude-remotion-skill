import { interpolate, spring } from "remotion";
import { theme } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// entrance (spring) and exit (faster, eased) progress for a text block
export const enterExit = (frame: number, fps: number, start: number, end?: number, exitLen = 14) => {
  const enter = spring({ frame: frame - start, fps, config: theme.spring.smooth });
  const exit =
    end === undefined ? 0 : interpolate(frame, [end - exitLen, end], [0, 1], { ...clamp, easing: theme.ease.in });
  return { enter, exit, visible: frame >= start - 1 && (end === undefined || frame <= end) };
};

// right-to-left ink sweep for Arabic: 0 → hidden, 1 → fully revealed
export const rtlSweepMask = (p: number, soft = 28) => {
  const edge = p * (100 + soft);
  const img = `linear-gradient(to left, #000 ${edge - soft}%, transparent ${edge}%)`;
  return { WebkitMaskImage: img, maskImage: img };
};

export const ltrSweepMask = (p: number, soft = 22) => {
  const edge = p * (100 + soft);
  const img = `linear-gradient(to right, #000 ${edge - soft}%, transparent ${edge}%)`;
  return { WebkitMaskImage: img, maskImage: img };
};

export { clamp };
