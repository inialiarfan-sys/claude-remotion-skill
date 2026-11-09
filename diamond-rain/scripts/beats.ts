/** Print absolute frame numbers of every scene and line (for `remotion still`). */
import { execSync } from 'child_process';
import { buildTimeline, countWords } from '../src/timing';
import { alignLines, detectSpeech } from '../src/align';
import { SCRIPT } from '../src/script';

let seconds: number | null = null;
try {
  seconds = parseFloat(
    execSync('ffprobe -v error -show_entries format=duration -of csv=p=0 public/narration.mp3').toString(),
  );
} catch {
  seconds = null;
}
let aligned: [number, number][] | null = null;
if (seconds !== null) {
  const raw = execSync('ffmpeg -v error -i public/narration.mp3 -ac 1 -ar 44100 -f f32le -', { maxBuffer: 1e9 });
  const pcm = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  aligned = alignLines(SCRIPT.flatMap((s) => s.lines).map((l) => countWords(l.text)), detectSpeech(pcm, 44100));
}
const tl = buildTimeline(seconds, 30, aligned);
console.log(`timing: ${tl.timing}`);
console.log(`total ${tl.totalFrames} frames (${(tl.totalFrames / 30).toFixed(1)}s), audio=${seconds}`);
for (const s of tl.scenes) {
  console.log(`\n[${s.id}] ${s.start}–${s.end}`);
  s.lines.forEach((l, i) => console.log(`  ${i}: ${l.start}–${l.end}  ${l.text}`));
}
