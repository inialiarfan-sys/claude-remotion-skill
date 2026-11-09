import { SCRIPT, SceneId } from './script';

/** Speaking rate used when there is no narration.mp3 to measure. */
export const WORDS_PER_SECOND = 2.5;
/** Pause after every line (seconds). Matches the gaps in a typical TTS read. */
export const PAUSE_AFTER_LINE = 0.6;
/** Extra time after the narration ends. */
export const TAIL_SECONDS = 1;

export type TimedLine = {
  text: string;
  onScreen: boolean;
  /** absolute frames */
  start: number;
  end: number;
};

export type TimedScene = {
  id: SceneId;
  title: string;
  /** Start of the first line (absolute frame). */
  start: number;
  /** End of the last line (absolute frame). */
  end: number;
  lines: TimedLine[];
};

export type Timeline = {
  fps: number;
  totalFrames: number;
  narrationSeconds: number;
  hasAudio: boolean;
  scenes: TimedScene[];
};

export const countWords = (s: string) =>
  s
    .replace(/[—–-]/g, ' ')
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/**
 * Split the narration across lines by word count.
 * - With audio: the lines fill exactly `audioSeconds` (each line followed by a pause).
 * - Without audio: ~2.5 words per second.
 */
export const buildTimeline = (audioSeconds: number | null, fps: number): Timeline => {
  const all = SCRIPT.flatMap((s) => s.lines);
  const totalWords = all.reduce((a, l) => a + countWords(l.text), 0);
  const pauseOf = (l: { pauseAfter?: number }) => l.pauseAfter ?? PAUSE_AFTER_LINE;
  const pauses = all.reduce((a, l) => a + pauseOf(l), 0);

  let secPerWord = 1 / WORDS_PER_SECOND;
  let narrationSeconds = totalWords * secPerWord + pauses;
  if (audioSeconds !== null && audioSeconds > 0) {
    narrationSeconds = audioSeconds;
    secPerWord = Math.max(0.05, (audioSeconds - pauses) / totalWords);
  }

  let t = 0;
  const scenes: TimedScene[] = SCRIPT.map((scene) => {
    const lines: TimedLine[] = scene.lines.map((l) => {
      const dur = countWords(l.text) * secPerWord;
      const line: TimedLine = {
        text: l.text,
        onScreen: Boolean(l.onScreen),
        start: Math.round(t * fps),
        end: Math.round((t + dur) * fps),
      };
      t += dur + pauseOf(l);
      return line;
    });
    return {
      id: scene.id,
      title: scene.title,
      start: lines[0].start,
      end: lines[lines.length - 1].end,
      lines,
    };
  });

  return {
    fps,
    totalFrames: Math.ceil((narrationSeconds + TAIL_SECONDS) * fps),
    narrationSeconds,
    hasAudio: audioSeconds !== null,
    scenes,
  };
};
