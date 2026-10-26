// Chapter 1 — "Zaman Kanak-kanak hingga Menjelang Baligh". Cut points follow
// the storyboard (seconds); overlaps are the transition windows (frames).
import { buildSlots, FPS } from "../timeline";

const CUTS_S = [0, 15, 35, 55, 75, 95, 115, 140, 165, 180];
// 1→2 zoom/aperture, 2→3 page turn, 3→4 slow page turn, 4→5 shadow sweep,
// 5→6 paper unfold, 6→7 page turn, 7→8 shadow sweep, 8→9 fold into book
export const CH1_OVERLAPS = [36, 30, 44, 36, 40, 30, 36, 36];
export const CH1_SLOTS = buildSlots(CUTS_S, CH1_OVERLAPS);
export const CH1_TOTAL = CUTS_S[CUTS_S.length - 1] * FPS;
