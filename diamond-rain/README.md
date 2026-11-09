# The Planet That Rains Diamonds

A ~4-minute 3D short documentary built with **Remotion 4**, **@remotion/three**, **React Three Fiber 8**, **three.js** and **React 18**.

It has two compositions built from the same scenes:

| Composition | Size | Use |
|---|---|---|
| `DiamondRainVertical` | 1080×1920, 30 fps | TikTok / Reels / Shorts (captions and 3D subjects kept clear of the app UI) |
| `DiamondRainWide` | 1920×1080, 30 fps | YouTube / landscape |

## Quick start

```bash
npm install
npm run dev            # opens Remotion Studio
```

## Narration

1. Export your voice-over as **MP3** and save it as `public/narration.mp3`.
2. Keep `src/script.ts` in sync with what is said. Lines are timed from the text, so edits to the recording should be mirrored there.

How the timing works (`src/timing.ts`):

- `calculateMetadata` reads the MP3's length with `getAudioDurationInSeconds`. The video becomes that length plus 1 second.
- The time is split across the lines by **word count**, with a short pause (0.6 s) after each line. A line can hold a longer beat with `pauseAfter` (the spoken title uses this).
- Each scene runs from the start of its first line to the end of its last, so the visuals follow the voice.
- With **no** `narration.mp3`, the length is estimated at ~2.5 words per second, and the video renders silently.
- Captions show one line at a time. A line marked `onScreen: true` already appears as a big on-screen statement, so its caption is hidden.

To check where every line lands (handy for `remotion still`), run:

```bash
npx tsx scripts/beats.ts
```

## Render

```bash
npm run render:vertical   # out/diamond-rain-vertical.mp4
npm run render:wide       # out/diamond-rain-wide.mp4
npm run render:all        # both
```

The render scripts use `--gl=angle`, which uses your GPU. On a machine **without a GPU** (CI, cloud containers), add `--gl=swangle`:

```bash
npx remotion render src/index.ts DiamondRainWide out/diamond-rain-wide.mp4 --gl=swangle
```

### Checking frames before a full render

```bash
scripts/stills.sh Vertical 60 790 2600 4777   # full-size PNGs in out/stills/
scripts/stills.sh Wide 60 790 2600 4777
```

Pass extra renderer flags through `REMOTION_FLAGS`, for example `REMOTION_FLAGS="--gl=swangle"`.

## How it's built

- `src/script.ts`: the narration, split into 10 scenes.
- `src/timing.ts`: auto-timing (audio length → line and scene frames).
- `src/DiamondRain.tsx`: scene sequencing, cross-fades, captions, grade, grain, vignette, audio.
- `src/scenes/*`: one file per scene (Hook, Giants, Inside, Carbon, Methane, Rain, Lab, Honest, Earth, Ending).
- `src/three/*`: 3D parts: instanced diamond field, cutaway planet, graphite→diamond lattice, planets with Fresnel atmospheres, star fields, additive glow "bloom" sprites and sparkle glints.
- `src/components/*`: captions, labels that track 3D points, the scene canvas and backdrop.

Everything animates from `useCurrentFrame()` with `interpolate`/`spring`; there is **no `useFrame`**. Instanced meshes are written in `useLayoutEffect` before `@remotion/three` advances the frame, so every frame renders deterministically.

### Safe areas (vertical)

- In vertical frames, the camera's optical centre moves up 12% (`Pose.shift`, a `setViewOffset`). This keeps 3D subjects in the upper-middle of the frame.
- Captions sit above the bottom ~28% of the frame and stay 170 px clear of the right edge, away from TikTok's caption block and like/share buttons.
- Titles stay below the top tab bar.

## Fonts

Inter and Cinzel are bundled in `public/fonts` (SIL Open Font License, licences included), so renders don't need internet access.

## Facts on screen

The on-screen facts are rounded, commonly cited figures:

- Distance from the Sun: Uranus ≈ 19 AU (≈ 2.9 billion km), Neptune ≈ 30 AU (≈ 4.5 billion km).
- Each planet is ~4× wider than Earth.
- Cloud tops are around −200 °C; the deep interior reaches several thousand °C.
- Neptune's winds reach ≈ 2,000 km/h.
- The Great Dark Spot was roughly Earth-sized.
- Laser shock-compression experiments on carbon-rich plastic produced nanodiamonds.

Diamond rain itself has **not** been observed. The video says so.

### Slow machines

`scripts/render-chunked.sh Vertical` (or `Wide`) renders in resumable 1000-frame chunks. It then joins them and adds `narration.mp3`, which is handy when a full render takes hours on a CPU.
