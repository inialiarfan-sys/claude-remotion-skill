import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import type { Timeline } from '../lib/timeline';

export type Cue = { at: number; src: 'whoosh' | 'boom' | 'sparkle' | 'riser' | 'laser' | 'pop'; volume: number };

/** Music level: ducks under the voice, breathes up in pauses. */
const musicVolume = (tl: Timeline, frame: number, fps: number) => {
  const t = frame / fps;
  let dist = Infinity;
  for (const w of tl.words) {
    if (t >= w.start - 0.15 && t <= w.end + 0.15) {
      dist = 0;
      break;
    }
    dist = Math.min(dist, Math.abs(t - w.start), Math.abs(t - w.end));
  }
  const gap = Math.min(1, dist / 0.4);
  let v = 0.1 + 0.07 * gap;
  const thing = tl.scenes.find((s) => s.id === 'thing');
  if (thing && t >= thing.start && t < thing.end) v *= 0.75; // quiet, gentle
  const last = tl.words[tl.words.length - 1];
  if (t > last.end) v = Math.min(0.24, v + (t - last.end) * 0.1);
  return Math.max(0, v * Math.min(1, frame / 15) * Math.min(1, (tl.total * fps - frame) / 30));
};

export const SoundDesign: React.FC<{ tl: Timeline; fps: number; cues: Cue[] }> = ({ tl, fps, cues }) => (
  <>
    <Audio src={staticFile('audio/score.wav')} volume={(f) => musicVolume(tl, f, fps)} />
    {cues
      .filter((c) => c.at >= 0)
      .map((c, i) => (
        <Sequence key={i} from={c.at} durationInFrames={Math.round(4 * fps)} layout="none">
          <Audio src={staticFile(`audio/${c.src}.wav`)} volume={c.volume} />
        </Sequence>
      ))}
  </>
);
