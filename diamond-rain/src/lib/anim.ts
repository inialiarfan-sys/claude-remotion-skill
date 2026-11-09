import { interpolate, EasingFunction } from 'remotion';
import { theme } from '../theme';

/** Eased, clamped interpolate. Never linear. */
export const ease = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing: EasingFunction = theme.ease.inOut,
) =>
  interpolate(frame, input, output, {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** Multi-stop eased interpolate. */
export const easeMulti = (
  frame: number,
  input: number[],
  output: number[],
  easing: EasingFunction = theme.ease.inOut,
) =>
  interpolate(frame, input, output, {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** 0 → 1 → 0 window: fades in over `fin` frames at `a`, fades out over `fout` ending at `b`. */
export const windowIn = (frame: number, a: number, b: number, fin = 18, fout = 12) =>
  Math.min(
    ease(frame, [a, a + fin], [0, 1], theme.ease.out),
    ease(frame, [b - fout, b], [1, 0], theme.ease.in),
  );

/** Deterministic PRNG. */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
