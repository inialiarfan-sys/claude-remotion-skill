// Cozy cream + terracotta palette for the ClaudeTutorial composition.
// Clawdy owns the hero color — UI uses ink, success green and soft accents.
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
    line: "rgba(31, 30, 29, 0.10)",
    shadow: "rgba(31, 30, 29, 0.14)",
    // GitHub-style scenes only
    gh: "#24292F",
    ghCard: "#2F363D",
    ghText: "#E6EDF3",
    ghDim: "#8B949E",
    ghGreen: "#2DA44E",
    confetti: ["#4E9A6A", "#E8B04A", "#6C8EBF", "#F4A28C", "#1F1E1D"],
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
  },
} as const;

// Timeline in seconds — every frame number in the composition derives from these.
export const T = {
  hello: 0,
  newChat: 4,
  github: 16,
  recap: 42,
  end: 50,
  step: 3.25, // each of the 8 GitHub steps
} as const;
