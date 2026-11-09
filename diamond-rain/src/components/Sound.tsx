import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import type { Timeline } from '../timing';

export type Cue = { at: number; src: 'whoosh' | 'boom' | 'sparkle' | 'riser' | 'laser'; volume: number };

/** Sound-effect cues, tied to the narration timeline so they land on the visuals. */
export const buildCues = (tl: Timeline, fade: number): Cue[] => {
  const S = Object.fromEntries(tl.scenes.map((s) => [s.id, s]));
  const L = (id: string, i: number) => S[id].lines[i];
  const cues: Cue[] = [];
  tl.scenes.forEach((s, i) => {
    if (i > 0) cues.push({ at: s.start - fade - 6, src: 'whoosh', volume: 0.35 });
  });
  const fps = tl.fps;
  cues.push(
    { at: 4, src: 'boom', volume: 0.55 },
    { at: 10, src: 'sparkle', volume: 0.35 },
    { at: L('inside', 4).start, src: 'boom', volume: 0.3 },
    { at: L('carbon', 6).start - Math.round(2.2 * fps) + 20, src: 'riser', volume: 0.25 },
    { at: L('carbon', 7).start - 6, src: 'sparkle', volume: 0.4 },
    { at: L('methane', 2).end - 24, src: 'sparkle', volume: 0.45 },
    { at: L('rain', 6).start, src: 'sparkle', volume: 0.35 },
    { at: L('lab', 3).start + 10, src: 'laser', volume: 0.3 },
    { at: L('lab', 4).start + 6 - Math.round(2.2 * fps), src: 'riser', volume: 0.35 },
    { at: L('lab', 4).start + 6, src: 'boom', volume: 0.6 },
    { at: L('lab', 5).start - 6, src: 'sparkle', volume: 0.45 },
    { at: L('earth', 1).start, src: 'sparkle', volume: 0.3 },
    { at: L('ending', 5).start, src: 'boom', volume: 0.4 },
  );
  return cues.filter((c) => c.at >= 0);
};

/** Music level: ducks under the voice, breathes up in the gaps, quieter for the serious note. */
export const musicVolume = (tl: Timeline, frame: number) => {
  const lines = tl.scenes.flatMap((s) => s.lines);
  let dist = Infinity;
  for (const l of lines) {
    if (frame >= l.start - 4 && frame <= l.end + 4) {
      dist = 0;
      break;
    }
    dist = Math.min(dist, Math.abs(frame - l.start), Math.abs(frame - l.end));
  }
  const gap = Math.min(1, dist / 12);
  let v = 0.11 + 0.07 * gap;
  const honest = tl.scenes.find((s) => s.id === 'honest');
  if (honest && frame >= honest.start - 20 && frame <= honest.end + 20) v *= 0.6;
  const last = lines[lines.length - 1];
  if (frame > last.end) v = Math.min(0.26, v + (frame - last.end) * 0.006);
  const fadeIn = Math.min(1, frame / 20);
  const fadeOut = Math.min(1, (tl.totalFrames - frame) / 24);
  return Math.max(0, v * fadeIn * fadeOut);
};

export const SoundDesign: React.FC<{ timeline: Timeline; fade: number }> = ({ timeline, fade }) => (
  <>
    <Audio src={staticFile('audio/score.wav')} volume={(f) => musicVolume(timeline, f)} />
    {buildCues(timeline, fade).map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={Math.round(4 * timeline.fps)} layout="none">
        <Audio src={staticFile(`audio/${c.src}.wav`)} volume={c.volume} />
      </Sequence>
    ))}
  </>
);
