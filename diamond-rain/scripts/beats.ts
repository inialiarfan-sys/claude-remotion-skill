/** Print absolute frame numbers of every scene and line (for `remotion still`). */
import { execSync } from 'child_process';
import { buildTimeline } from '../src/timing';

let seconds: number | null = null;
try {
  seconds = parseFloat(
    execSync('ffprobe -v error -show_entries format=duration -of csv=p=0 public/narration.mp3').toString(),
  );
} catch {
  seconds = null;
}
const tl = buildTimeline(seconds, 30);
console.log(`total ${tl.totalFrames} frames (${(tl.totalFrames / 30).toFixed(1)}s), audio=${seconds}`);
for (const s of tl.scenes) {
  console.log(`\n[${s.id}] ${s.start}–${s.end}`);
  s.lines.forEach((l, i) => console.log(`  ${i}: ${l.start}–${l.end}  ${l.text}`));
}
