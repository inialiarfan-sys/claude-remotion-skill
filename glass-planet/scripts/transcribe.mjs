// Transcribe the narration ONCE with whisper.cpp → src/data/transcript.json (word-level).
//   npm run transcribe            (skips if transcript.json exists)
//   npm run transcribe -- --force (re-transcribe, e.g. after a new recording)
// Env: WHISPER_MODEL=small.en | medium.en (default small.en)
// Works on Windows, macOS and Linux. If whisper.cpp can't be installed, falls back to
// Python openai-whisper (scripts/transcribe_whisper.py).
import { existsSync, mkdirSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { installWhisperCpp, downloadWhisperModel, transcribe, toCaptions } from '@remotion/install-whisper-cpp';

const root = process.cwd();
const out = path.join(root, 'src', 'data', 'transcript.json');
const force = process.argv.includes('--force');
if (existsSync(out) && !force) {
  console.log('transcript.json already exists — reusing it (pass --force to redo).');
  process.exit(0);
}
const input = ['narration.mp3', 'narration.wav', 'narration.m4a']
  .map((f) => path.join(root, 'public', f))
  .find((f) => existsSync(f));
if (!input) throw new Error('No narration found. Put narration.mp3 or narration.wav in public/.');
console.log('Narration:', path.relative(root, input));

const model = process.env.WHISPER_MODEL || 'small.en';
const version = '1.5.5';
const whisperPath = path.join(root, 'whisper.cpp');
const wav = path.join(root, 'whisper.cpp-input.wav');
mkdirSync(path.dirname(out), { recursive: true });

// 16 kHz mono WAV, using Remotion's bundled ffmpeg (no system ffmpeg needed)
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
execFileSync(npx, ['remotion', 'ffmpeg', '-y', '-v', 'error', '-i', input, '-ar', '16000', '-ac', '1', wav], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

const save = (words, engine) => {
  writeFileSync(out, JSON.stringify({ engine, model, source: path.basename(input), words }, null, 1));
  console.log(`Saved ${words.length} words → src/data/transcript.json`);
};

try {
  await installWhisperCpp({ to: whisperPath, version });
  // a previous interrupted download can leave an empty/partial file behind
  const modelFile = path.join(whisperPath, `ggml-${model}.bin`);
  if (existsSync(modelFile) && statSync(modelFile).size < 1e6) rmSync(modelFile);
  await downloadWhisperModel({ model, folder: whisperPath });
  const result = await transcribe({
    inputPath: wav,
    whisperPath,
    whisperCppVersion: version,
    model,
    tokenLevelTimestamps: true,
    splitOnWord: true,
    onProgress: (p) => process.stdout.write(`\rtranscribing ${(p * 100).toFixed(0)}%`),
  });
  const { captions } = toCaptions({ whisperCppOutput: result });
  const words = captions
    .map((c) => ({ text: c.text.trim(), start: c.startMs / 1000, end: c.endMs / 1000 }))
    .filter((w) => w.text.length > 0 && !/^\[.*\]$/.test(w.text));
  save(words, 'whisper.cpp ' + version);
} catch (err) {
  console.warn('\nwhisper.cpp failed:', err.message);
  console.warn('Falling back to Python openai-whisper (pip install openai-whisper)…');
  const py = process.platform === 'win32' ? 'python' : 'python3';
  const r = spawnSync(py, [path.join('scripts', 'transcribe_whisper.py'), wav, out, model], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('Python whisper fallback failed too.');
} finally {
  rmSync(wav, { force: true });
}
// snap word timings to the real pauses in the audio
execFileSync(process.execPath, [path.join('scripts', 'refine-timings.mjs')], { stdio: 'inherit' });
