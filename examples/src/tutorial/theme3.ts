// Cozy cream + terracotta palette for the ClaudeTutorial composition.
// Clawdy owns the hero color — UI uses ink, success green and candy accents.
import { Easing } from "remotion";

export const ttheme = {
  colors: {
    bg: "#F5F0E8",
    bgAlt: "#EDE4D6",
    primary: "#D97757", // THE hero color — reserved for Clawdy
    primaryDark: "#B85F42",
    ink: "#1F1E1D",
    inkDim: "#7A7266",
    accent: "#E8DCC8",
    card: "#FFFDF9",
    blush: "#F4A28C",
    good: "#4E9A6A",
    bad: "#C9554A",
    heart: "#E0525E",
    line: "rgba(31, 30, 29, 0.10)",
    shadow: "rgba(31, 30, 29, 0.14)",
    // candy accents for highlights, decor and wipes
    sun: "#FFD166",
    mint: "#9ED9BE",
    sky: "#A9CBF2",
    lilac: "#C9B6F0",
    // per-scene background tints
    tint: {
      hello: "#FBEFE3",
      newChat: "#EEF5EC",
      github: "#EDF0FA",
      recap: "#FFF4DD",
    },
    // GitHub-style scenes only
    gh: "#24292F",
    ghCard: "#2F363D",
    ghText: "#E6EDF3",
    ghDim: "#8B949E",
    ghGreen: "#2DA44E",
    confetti: [
      "#4E9A6A",
      "#FFD166",
      "#6C8EBF",
      "#F4A28C",
      "#C9B6F0",
      "#1F1E1D",
    ],
  },
  fonts: {
    display: "Fredoka",
    body: "Nunito",
    mono: "JetBrains Mono",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1), // entrances
    inOut: Easing.bezier(0.83, 0, 0.17, 1), // moves
    in: Easing.bezier(0.7, 0, 0.84, 0), // exits only
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 10, stiffness: 180, mass: 0.6 }, // pop-ups
    jelly: { damping: 7, stiffness: 210, mass: 0.5 }, // letters, emotes
  },
  // hard "sticker" shadows — the punchy look
  sticker: (k = 1, color = "#1F1E1D") =>
    `0 0 0 ${4 * k}px ${color}, ${10 * k}px ${12 * k}px 0 ${4 * k}px ${color}`,
} as const;

// Timeline in seconds — every frame number in the composition derives from these.
// Cuts land on beats of the 120 BPM track (0.5s per beat).
export const T = {
  hello: 0,
  newChat: 4,
  github: 16,
  recap: 42,
  end: 50,
  step: 3.25, // each of the 8 GitHub steps
  beat: 0.5,
} as const;
