import { Easing } from 'remotion';
import { staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';

// Fonts are bundled in public/fonts (SIL OFL) so renders work offline.
const fonts: [string, string, string][] = [
  ['Inter', '500', 'inter-latin-500-normal.woff2'],
  ['Inter', '700', 'inter-latin-700-normal.woff2'],
  ['Inter', '800', 'inter-latin-800-normal.woff2'],
  ['Cinzel', '600', 'cinzel-latin-600-normal.woff2'],
  ['Cinzel', '700', 'cinzel-latin-700-normal.woff2'],
];
for (const [family, weight, file] of fonts) {
  loadFont({ family, weight, url: staticFile(`fonts/${file}`), format: 'woff2' });
}

export const theme = {
  color: {
    void: '#01030a',
    deep: '#03122b',
    navy: '#062046',
    neptune: '#1f4fd1',
    neptuneDeep: '#0b2a8a',
    uranus: '#7fd6dc',
    teal: '#1fb5b8',
    ice: '#bff6ff',
    diamond: '#e8fdff',
    cyan: '#5ff4ff',
    heat: '#ff8a3d',
    core: '#ffd7a0',
    laser: '#5dffb0',
    gold: '#e7c070',
    text: '#f2fbff',
    textDim: 'rgba(220,240,255,0.72)',
  },
  font: {
    body: 'Inter, sans-serif',
    display: 'Cinzel, serif',
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
    pop: { damping: 14, mass: 0.8, stiffness: 140 },
  },
  /** cross-fade between scenes, seconds */
  sceneFade: 0.7,
} as const;
