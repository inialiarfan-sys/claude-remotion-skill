// theme.ts — single source of truth for the film's palette, type, easing and springs.
import { Easing } from "remotion";

export const theme = {
  colors: {
    // darkness around the manuscript
    void: "#07060a",
    voidWarm: "#140d08",
    // night skies
    nightTop: "#050a1f",
    night: "#0b1433",
    nightHorizon: "#1f2b58",
    nightGlow: "#3b3f73",
    star: "#fff4d6",
    // manuscript
    parchment: "#efe0bd",
    parchmentLight: "#f7ecd2",
    parchmentDark: "#d6bd8c",
    parchmentEdge: "#b8955e",
    ink: "#2a1a0e",
    inkSoft: "#5a4128",
    leather: "#4a1e16",
    leatherDark: "#2c110c",
    leatherLight: "#6b2c1f",
    gold: "#d6a344",
    goldLight: "#f4d48a",
    goldDeep: "#9c6f22",
    // desert + Makkah
    sandLight: "#d8a46a",
    sand: "#b67d48",
    sandDeep: "#875630",
    sandShadow: "#4f311c",
    rock: "#5b3f2c",
    mountainFar: "#27325e",
    mountainMid: "#1c2449",
    mountainNear: "#141a36",
    mudbrick: "#8d5c38",
    mudbrickLit: "#b57a48",
    mudbrickShade: "#5a3820",
    wood: "#3b2414",
    palm: "#1b2a1d",
    lamp: "#ffb453",
    lampCore: "#ffe2a6",
    // Persia
    stoneLight: "#8a7660",
    stone: "#6a5847",
    stoneDark: "#43372d",
    stoneDeep: "#2a221c",
    persianSky: "#0c1424",
    persianHaze: "#26344a",
    flameRed: "#d8471b",
    flameOrange: "#f57f22",
    flameYellow: "#ffc94a",
    flameCore: "#fff3c4",
    smoke: "#b9ab98",
    // dawn
    dawnTop: "#2b3a6b",
    dawnMid: "#c76f4a",
    dawnLow: "#f6b25e",
    sun: "#ffe7a8",
  },
  fonts: {
    arabic: "Amiri",
    latin: "Cormorant Garamond",
  },
  // linear easing is never used
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.65, 0, 0.35, 1),
    soft: Easing.bezier(0.45, 0, 0.25, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    gentle: { damping: 26, stiffness: 60, mass: 1.2 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    page: { damping: 30, stiffness: 45, mass: 1.4 },
  },
} as const;

// Latin text falls back to Amiri, which carries the ﷺ ligature glyph
export const latinStack = `'${theme.fonts.latin}', '${theme.fonts.arabic}', serif`;
export const arabicStack = `'${theme.fonts.arabic}', serif`;
