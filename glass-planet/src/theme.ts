import { Easing, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';

// Fonts are bundled in public/fonts (SIL OFL) so renders work offline.
const fonts: [string, string, string][] = [
  ['Inter', '500', 'inter-latin-500-normal.woff2'],
  ['Inter', '700', 'inter-latin-700-normal.woff2'],
  ['Inter', '800', 'inter-latin-800-normal.woff2'],
  ['Cinzel', '700', 'cinzel-latin-700-normal.woff2'],
  ['Fredoka', '600', 'fredoka-latin-600-normal.woff2'],
  ['Fredoka', '700', 'fredoka-latin-700-normal.woff2'],
];
for (const [family, weight, file] of fonts) {
  loadFont({ family, weight, url: staticFile(`fonts/${file}`), format: 'woff2' });
}

export const theme = {
  color: {
    void: '#01030a',
    deep: '#030b22',
    cobalt: '#1d47d6',
    cobaltDeep: '#0a1f7a',
    cobaltGlow: '#4f86ff',
    star: '#ffd9a8',
    starHot: '#fff3e0',
    starOrange: '#ff9a3c',
    heat: '#ff7a2f',
    glass: '#dff6ff',
    cyan: '#7ff0ff',
    green: '#9be36b',
    stink: '#b6e36a',
    earth: '#2f7bd8',
    text: '#f4f8ff',
    textDim: 'rgba(225,235,255,0.75)',
    // host / cute palette (matches the sheet's soft pastels)
    pink: '#ffb8c8',
    pinkDeep: '#f08aa6',
    mint: '#bdf3df',
    butter: '#ffe9a6',
    sky: '#bfe3ff',
    outline: '#6b4a4f',
  },
  font: {
    body: 'Inter, sans-serif',
    display: 'Cinzel, serif',
    cute: 'Fredoka, Inter, sans-serif',
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.65, 0, 0.35, 1),
    slow: Easing.bezier(0.45, 0, 0.2, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    smooth: { damping: 200, mass: 1, stiffness: 80 },
    soft: { damping: 26, mass: 1, stiffness: 70 },
    pop: { damping: 12, mass: 0.7, stiffness: 160 },
    bouncy: { damping: 9, mass: 0.6, stiffness: 180 },
  },
  sceneFade: 0.5,
} as const;
