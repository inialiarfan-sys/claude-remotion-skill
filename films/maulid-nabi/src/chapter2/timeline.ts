// Chapter 2 — "Zaman Remaja dan Kehidupan Sebelum Kenabian". Cut points follow
// the storyboard (seconds); overlaps are the transition windows (frames).
import { buildSlots, FPS } from "../timeline";

const CUTS_S = [0, 20, 44, 66, 92, 116, 150];
// 1→2 push through the doorway, 2→3 paper unfold, 3→4 page turn,
// 4→5 fold into the book, 5→6 page turn
export const CH2_OVERLAPS = [36, 40, 30, 36, 30];
export const CH2_SLOTS = buildSlots(CUTS_S, CH2_OVERLAPS);
export const CH2_TOTAL = CUTS_S[CUTS_S.length - 1] * FPS;
