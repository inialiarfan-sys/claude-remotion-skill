// Film timeline. Scene boundaries follow the storyboard (seconds); each cut is a
// transition window during which the outgoing and incoming scenes overlap.
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

const BOUNDARIES_S = [0, 8, 18, 36, 48, 58, 70, 88];
// overlap (frames) of each cut: 1→2, 2→3, 3→4, 4→5, 5→6, 6→7
export const OVERLAPS = [36, 30, 30, 36, 40, 36];

export const TOTAL_FRAMES = BOUNDARIES_S[BOUNDARIES_S.length - 1] * FPS;

export type SceneSlot = { from: number; dur: number; enter: number; exit: number };

export const SLOTS: SceneSlot[] = BOUNDARIES_S.slice(0, -1).map((s, i) => {
  const enter = i === 0 ? 0 : OVERLAPS[i - 1];
  const exit = i === BOUNDARIES_S.length - 2 ? 0 : OVERLAPS[i];
  const from = s * FPS - enter / 2;
  const end = BOUNDARIES_S[i + 1] * FPS + exit / 2;
  return { from, dur: end - from, enter, exit };
});

// seconds → frames, for timing inside a scene
export const sec = (s: number) => Math.round(s * FPS);
