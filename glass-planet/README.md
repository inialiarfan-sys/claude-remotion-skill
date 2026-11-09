# The Worst Planet Ever Discovered

A ~3-minute 3D short documentary about the exoplanet **HD 189733 b**, hosted by a chibi astronaut and her cat. It's built with **Remotion 4**, **@remotion/three**, **React Three Fiber 8**, **three.js** and **React 18**.

| Composition | Size | For |
|---|---|---|
| `GlassPlanetVertical` | 1080×1920, 30 fps | TikTok. Captions, numbers and the host stay clear of TikTok's buttons and caption area. |
| `GlassPlanetWide` | 1920×1080, 30 fps | YouTube |

All timing comes from **your recording**, never from the script: scene cuts, captions, big numbers and every host reaction.

## Quick start (Windows, macOS, Linux)

```bash
npm install
npm run dev          # Remotion Studio (also generates the music/SFX the first time)
```

On Windows, run the commands in PowerShell or `cmd` from the `glass-planet` folder. Node 18+ is required. Python is only needed to re-cut the character sheet.

## 1. Swap in a new recording

1. Put your narration in `public/` as `narration.mp3` **or** `narration.wav`.
2. Re-transcribe it (this overwrites `src/data/transcript.json`):
   ```bash
   npm run transcribe -- --force
   ```
   - This uses `@remotion/install-whisper-cpp`. It downloads whisper.cpp (the Windows build is a prebuilt zip) and the `small.en` model into `whisper.cpp/`. This happens once.
   - For better accuracy, use `medium.en`. In PowerShell: `$env:WHISPER_MODEL="medium.en"; npm run transcribe -- --force`
   - If whisper.cpp can't be installed, it falls back to Python `openai-whisper` (`pip install openai-whisper`).
   - Without `--force`, the existing transcript is reused: it only transcribes once.
3. Check the timing:
   ```bash
   npm run timing
   ```
   This writes `src/data/timing-report.md` with every scene's start and end. If an anchor phrase isn't found, it prints a warning and places that scene proportionally between its neighbours.

How the timing works (`src/lib/timeline.ts`, `scripts/refine-timings.mjs`):
- whisper's word timestamps can drift by about a second. After transcribing, the script detects the real pauses in your audio and re-times the words so each stretch of speech lines up with your voice.
- Each scene starts when its anchor phrase starts being spoken (fuzzy match: tolerant of skipped or changed words and of numbers written as words or digits). It ends when the next scene starts.
- The video length is the audio length + 1.5 s.
- Captions are built from the word timings: 1–3 short lines, with the spoken word highlighted. Script spellings are enforced: "HD 189733 b", "James Webb", "hydrogen sulfide", "exoplanets".
- Edit the anchors in `SCENES` in `src/lib/timeline.ts` if you change the script.

## 2. Swap in a new character sheet

1. Replace `public/character/sheet.png` (expressions, gestures, outfits, views) and `public/character/sheet-astronaut.png` (walk cycle and sitting pose).
2. If the layout differs, update the crop boxes in `scripts/make_sprites.py`, then run:
   ```bash
   pip install pillow numpy scipy
   npm run sprites
   ```
3. Open `public/character/preview.png` to check the result.

The script:
- Flood-fills the paper from outside each crop, so enclosed whites (suit, cat) stay solid.
- Gives edges soft alpha with colour decontamination (no white halos).
- Makes the helmet glass see-through.
- Scales every body sprite to the same size with the feet on one baseline.

## 3. Preview and render

```bash
npm run dev               # studio
npm run render:vertical   # out/glass-planet-vertical.mp4
npm run render:wide       # out/glass-planet-wide.mp4
npm run render:all        # both
```

`remotion.config.ts` uses `--gl=angle` (GPU). On a machine without a GPU, add `--gl=swangle`.

Single frames, for checking:

```bash
npx remotion still src/index.ts GlassPlanetVertical out/check.png --frame 1200
```

On slow Linux/macOS machines, `scripts/render-chunked.sh Vertical` renders in resumable chunks.

## What's where

- `src/lib/timeline.ts`: anchors, fuzzy matching, cues, caption pages.
- `src/GlassPlanet.tsx`: scene sequencing, transitions, captions, big numbers, grade, grain, sound.
- `src/scenes/*`: the 16 scenes. Each one times its host reactions with `at("word")`, which returns the frame when that word is spoken.
- `src/components/Host.tsx`: the host.
  - Props: `pose`, `x`/`y`, `height`, `flip`, `walking`.
  - Walking plays the 8-frame cycle at 11 fps with a bob.
  - She breathes with a gentle squash-and-stretch, bounces on pose changes, and the cat wobbles.
  - Also here: the reaction bubble and the pastel effects (sparkles, `!!`, `?`, sweat, stink cloud, frost, cat paw).
- `src/three/Host3D.tsx`: the host as a camera-facing billboard inside 3D scenes. On a planet she walks along the top curve while it rotates under her.
- `src/three/*`: the planet shader (cobalt bands with per-latitude swirl and a glowing dayside), star, instanced glass shards, wind streamlines, glow sprites.
- `scripts/gen-audio.mjs`: the generated ambient score and sound effects (ducked under the voice).

Everything animates from `useCurrentFrame()` with `interpolate`/`spring` and seeded randomness. There is no `useFrame`, so every render is deterministic.

## Science notes

The on-screen numbers are the commonly cited, rounded values:
- ~64 light-years away.
- More than 6,000 confirmed exoplanets.
- An orbit of ~2.2 days.
- A dayside around 1,000 °C.
- Winds of several thousand km/h.
- In 2024, JWST detected hydrogen sulfide (H₂S).

Sideways glass rain is a **prediction** based on silicate clouds and the winds, and the video says so.

Fonts are Inter, Cinzel and Fredoka, all under the SIL OFL (licences are in `public/fonts`).
