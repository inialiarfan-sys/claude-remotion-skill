# Maulid Nabi: a paper-cut short film

*The Birth of the Beloved Prophet Muhammad ﷺ*, an 80-second vertical (1080×1920, 30 fps) paper-cut animation made with Remotion. It has no narration, voice or music. The story is told through layered cut-paper environments, camera moves, manuscript transitions, Arabic and Malay typography, and quiet synthesized ambience.

**Rendered film:** [`video/maulid-nabi.mp4`](video/maulid-nabi.mp4)
**Fact-check record:** [`RESEARCH.md`](RESEARCH.md)

## Render it again

```bash
cd films/maulid-nabi
npm install
npm run audio          # regenerates public/audio/*.wav (deterministic)
node scripts/gen-texture.mjs   # regenerates public/textures/paper.png (deterministic)
npx remotion render src/index.ts MaulidNabi out/maulid-nabi.mp4 --codec h264 --crf 17
```

`remotion.config.ts` points Remotion at the Playwright headless-shell Chromium under `/opt/pw-browsers`. Change or remove that line on a machine where Remotion can download its own browser. Preview with `npm run studio`. Each scene is also registered as its own composition (`Scene01` … `Scene07`).

To inspect frames, `node scripts/stills.mjs MaulidNabi out/check 120 600 1400` bundles once and writes PNG stills. `scripts/sheet.sh` tiles stills into a contact sheet.

## Storyboard and timeline

| # | Time | Scene | On screen | Transition out |
|---|---|---|---|---|
| 1 | 0–8 s | The ancient book opens | A tooled-leather manuscript emerges from darkness. The cover swings open on the right-hand spine, as Arabic books open, and a lapis title panel unfolds on a paper hinge. مَوْلِدُ النَّبِيِّ مُحَمَّدٍ ﷺ / KELAHIRAN NABI MUHAMMAD ﷺ appear in a right-to-left ink sweep, with dust in the light. | The camera pushes into the page while the world opens through the panel |
| 2 | 8–18 s | Ancient Arabia | Night over Makkah in ten paper layers: sky, turning stars, three mountain ridges, two rows of flat-roofed houses with lamplit windows, dunes and palms, all with parallax. مَكَّةُ الْمُكَرَّمَةُ, then عَامُ الْفِيلِ / Tahun Gajah. | Page turn, right to left |
| 3 | 18–28 s | The birth | Exterior of a mud-brick house: lattice windows, a timber door with lamplight in the gap, a palm-frond awning, a slow push-in, and a subtle softening of the night. **No person is depicted.** مُحَمَّدُ بْنُ عَبْدِ اللَّهِ ﷺ | Page turn |
| 4 | 28–40 s | The palace of Kisra | The Taq Kasra vault and arcaded façade between foreground columns. A restrained tremor shakes dust from the cornice and four merlons fall. ارْتِجَاسُ إِيوَانِ كِسْرَى + disclaimer | An architectural shadow sweeps across |
| 5 | 40–50 s | The fire goes out | A fire-temple interior with a stepped altar. The faceted paper flame shrinks and goes out, paper smoke curls up, and cool air replaces the firelight. خُمُودُ نَارِ فَارِسَ + disclaimer | The smoke becomes parchment |
| 6 | 50–62 s | A mercy to the worlds | Parchment unfolds into dawn: the sky grades from night to gold, the sun rises behind rim-lit dunes, birds cross. Al-Anbiya' 21:107 with its Malay translation. | The landscape folds down onto the book page |
| 7 | 62–80 s | Sources | The sources page (Qur'an; Sahih Muslim 1162), a page turn to the historical-reports page with the authenticity note, then the cover closes and the camera pulls back to مُحَمَّدٌ رَسُولُ اللَّهِ ﷺ / MUHAMMAD RASULULLAH ﷺ. | Fade to black on the closing sound |

The disclaimer **SEKADAR GAMBARAN BERDASARKAN RIWAYAT SEJARAH** is shown in dark ink on a parchment label for about 10 s in scene 4 and about 8 s in scene 5.

## Structure

```
src/
  Root.tsx              compositions (full film + each scene)
  Video.tsx             scene sequencing, z-order for transitions, soundtrack
  timeline.ts           scene boundaries and transition overlaps (frames)
  theme.ts              palette, fonts, easings, springs (one source of truth)
  assets.ts             loads local fonts + paper texture before rendering
  random.ts             seeded PRNG and smooth noise (deterministic frames)
  scenes/Scene01BookOpening.tsx … Scene07Sources.tsx
  components/
    PaperLayer.tsx      textured cut-paper sheet with drop shadow + camera depth
    CinematicCamera.tsx keyframed camera, parallax by depth, tremor hook
    PageTransition.tsx  aperture, unfold, zoom-into, page-turn, shadow-sweep, fold-into
    ArabicTitle.tsx     RTL ink-sweep reveal + gold-leaf sheen (real shaped text)
    MalaySubtitle.tsx   staggered word rise
    HistoricalDisclaimer.tsx
    Book.tsx            cover (shamsa medallion), endpaper, pages, page edges
    Architecture.tsx    Hijazi houses, date palms
    Atmosphere.tsx      sky, stars, dust, glows, light beams, grade, grain, vignette
    shapes.ts           ridges, dunes, eight-point stars, Persian arches
scripts/
  gen-audio.mjs         synthesizes the ambient sound kit
  gen-texture.mjs       generates the tileable handmade-paper texture
  stills.mjs, sheet.sh  verification helpers
public/
  fonts/                Amiri, Cormorant Garamond (woff2, SIL OFL 1.1, licences included)
  textures/paper.png
  audio/*.wav
```

Every animation is driven by `useCurrentFrame()` and `interpolate`/`spring` with eased curves. No CSS animations are used, and every random value is seeded.

## Assets and licences

- **Fonts:** Amiri (Arabic, with Qur'anic marks and the ﷺ glyph) and Cormorant Garamond (Latin), both SIL Open Font License 1.1. The woff2 files and licence texts are in `public/fonts/`, so nothing is fetched at render time.
- **Paper texture:** generated by `scripts/gen-texture.mjs`.
- **Audio:** every sound is synthesized by `scripts/gen-audio.mjs`: wind, night insects, paper turns, unfolds and slides, cover creak, stone creak, a distant rumble, falling fragments, the flame bed and the extinguishing breath, footsteps on sand, dawn birds, and the book closing. There is no speech, no music, and no third-party or copyrighted audio.
- **Qur'an text:** The Noble Qur'an Encyclopedia Uthmani text (via `quran-json`). See `RESEARCH.md` for the mark normalisation.
