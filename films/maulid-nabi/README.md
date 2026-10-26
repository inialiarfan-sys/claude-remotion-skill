# Maulid Nabi: a paper-cut short film

*The Birth of the Beloved Prophet Muhammad ﷺ*, an 88-second vertical (1080×1920, 30 fps) paper-cut animation made with Remotion. It has no narration, voice or music. The story is told through layered cut-paper environments, camera moves, manuscript transitions, Arabic and Malay typography, and quiet synthesized ambience.

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
| 2 | 8–18 s | Ancient Arabia | Night over Makkah in ten paper layers: sky, turning stars, three mountain ridges, two rows of flat-roofed houses with lamplit windows, dunes and palms, all with parallax. مَكَّةُ الْمُكَرَّمَةُ (*Sebuah lembah tandus di tengah Semenanjung Tanah Arab*), then عَامُ الْفِيلِ / Tahun Gajah (*Kira-kira 53 tahun sebelum Hijrah*). | Page turn, right to left |
| 3 | 18–36 s | The birth | Exterior of a mud-brick house: lattice windows, a timber door with lamplight in the gap, a palm-frond awning, a slow push-in, and a subtle softening of the night. **No person is depicted.** Story captions: *Pada suatu malam di Makkah… lahirlah seorang insan daripada seorang ibu yang mulia, Aminah binti Wahb.* Then مُحَمَّدُ بْنُ عَبْدِ اللَّهِ ﷺ, and the simile *Malam itu bagaikan siang, kerana telah lahir pembawa cahaya petunjuk buat sekalian alam.* | Page turn |
| 4 | 36–48 s | The palace of Kisra | The Taq Kasra vault and arcaded façade between foreground columns. A restrained tremor shakes dust from the cornice and four merlons fall. ارْتِجَاسُ إِيوَانِ كِسْرَى + disclaimer | An architectural shadow sweeps across |
| 5 | 48–58 s | The fire goes out | A fire-temple interior with a stepped altar. The faceted paper flame shrinks and goes out, paper smoke curls up, and cool air replaces the firelight. خُمُودُ نَارِ فَارِسَ + disclaimer | The smoke becomes parchment |
| 6 | 58–70 s | A mercy to the worlds | Parchment unfolds into dawn: the sky grades from night to gold, the sun rises behind rim-lit dunes, birds cross. Al-Anbiya' 21:107 with its Malay translation. | The landscape folds down onto the book page |
| 7 | 70–88 s | Sources | The sources page (Qur'an; Sahih Muslim 1162), a page turn to the historical-reports page with the authenticity note, then the cover closes and the camera pulls back to مُحَمَّدٌ رَسُولُ اللَّهِ ﷺ / MUHAMMAD RASULULLAH ﷺ. | Fade to black on the closing sound |

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

---

# Series: *Perjalanan Hidup Rasulullah SAW*, Bab 1

**Zaman Kanak-kanak hingga Menjelang Baligh** is a 3-minute (180 s, 5400 frames) vertical chapter built in this same project on the same paper-cut system. It has no narration, voice or music. The story is told through animation, short Malay captions, ages, animated maps, family trees and symbolic objects. **The Prophet ﷺ is never depicted, and no human figures appear at all.**

**Rendered chapter:** [`video/bab1-zaman-kanak-kanak.mp4`](video/bab1-zaman-kanak-kanak.mp4)
**Fact-check record:** [`RESEARCH-BAB1.md`](RESEARCH-BAB1.md)

```bash
npx remotion render src/index.ts Bab1ZamanKanakKanak out/bab1-zaman-kanak-kanak.mp4 --codec h264 --crf 18
```

Each scene is also registered as its own composition (`Bab1Scene01` … `Bab1Scene09`).

| # | Time | Scene | What happens | Transition out |
|---|---|---|---|---|
| 1 | 0:00–0:15 | The book of sirah | **Hook:** an extreme close-up of the gilded medallion as lamplight rakes across it. A pull-back reveals the book on a writing table (oil lamp, inkwell and qalam, a cloth in the foreground). The leather envelope flap lifts, then the cover drops open with spring weight. The folded map unfolds and the Hijaz mountains pop up like a pop-up book. The camera pushes in as سِيرَةُ النَّبِيِّ مُحَمَّدٍ ﷺ is inked onto the cartouche, with PERJALANAN HIDUP RASULULLAH SAW and a BAB 1 tab. It then pulls back as place pins land, and flies to Makkah. Every sound is tied to a visible action. | Push into the map; Makkah opens as an aperture |
| 2 | 0:15–0:35 | First year | The camera glides between near rocks into the valley as birds cross and cooking smoke rises. A label tied to the Ka'bah reads *Kaabah di lembah Makkah*. The camera pushes to a lamplit doorway, which opens into the dwelling with its empty cradle. A manuscript page unfolds from its crease: the family tree (Abdullah *wafat sebelum Baginda lahir*, while the house lamp lowers), then ANAK YATIM and Ad-Duha 93:6 are inked onto the same page. | Page turn |
| 3 | 0:35–0:55 | Halimah al-Sa'diyah | The mountains pop up on the map, and the camera rides the route as a small camel inks its way from Makkah to Bani Sa'd (approximate). The encampment opens through the region marker. A tracking shot follows the caravan through one day and night: hearth smoke, then a campfire, the moon and night insects. Captions are inked on unrolling scrolls. | Slow page turn |
| 4 | 0:55–1:15 | Loss of his mother | The camera follows the return route from Yathrib to al-Abwa', where a label tied to the pin names the place. It dives through the marker into a plain where dusk deepens into night over a resting caravan. The captions are inked with restraint, and the wind drops. | Shadow sweep |
| 5 | 1:15–1:35 | Abdul Muttalib | Opens on Aminah's card, where scene 4 ended. Her gold guardianship arrow fades and the camera climbs the family line to Abdul Muttalib as his arrow draws. Each change is inked on a parchment header band. Abu Talib's branch appears, the age ruler moves from 6 to 8, and guardianship passes to Abu Talib. | Parchment unfolds |
| 6 | 1:35–1:55 | Under Abu Talib | A tracking shot follows the arriving caravan through the market: awnings lift in the breeze, goods are set out stall by stall, pigeons cross. The map card unfolds and camels walk the routes to Syam and Yaman (Quraisy 106:2). The Syam journey is shown on a scroll as a report with its source gloss. | Page turn |
| 7 | 1:55–2:20 | Toward puberty | A slow push into a town that grows across four **illustrative** years (9–12): upper rooms are raised, the palm grows, the flock increases, a new stall appears. A leaf turns, the age is inked and the building shadows swing each day, with insects on each night. The shepherding scroll (Bukhari) comes after the age markers. | Shadow sweep |
| 8 | 2:20–2:45 | Youth | A tracking shot follows the caravans along a traced trade route, with the route's label riding on it. A page unfolds: goods drop onto a balance scale, which tips and settles level, with a clink on each drop, and الأَمِينُ is inked. The page folds away and the camera pulls back as the caravans head for the horizon. | Folds into the book |
| 9 | 2:45–3:00 | Next chapter | The scene returns to the opening's writing table: the open book, cover, flap, oil lamp and inkwell. The summary is inked entry by entry, the leaf turns, a new page unfolds and the Ka'bah and mountains draw themselves. The camera pulls back to the book by its lamp for BERSAMBUNG… and BAB 2. | Fade out |

**Cinematic upgrade:** every scene has a camera move with a purpose (a push to a name, a pull-back to a map or tree, a tracking shot for caravans). Captions sit in the world: inked onto pages and scrolls, tied to objects with labels, or written into the family tree's header band. Sounds are tied to visible actions through beat tables each scene exports (`CH1_S*_BEATS`), and the solemn moments are kept quiet. New shared pieces: `WorldCaption` (`InkCaption`, `ScrollCaption`, `CalloutLabel`), `sampleCamera`/`toScreen`, map pop-up mode and camel route heads, awning flutter, scale loads, the oil lamp and inkwell, and the synthesized `paper_pop`, `paper_tick` and `qalam_scratch` sounds.

**Reused from the film:** `PaperLayer`, `CinematicCamera`/`useDepth`, `PageTransition` (aperture, zoomInto, pageTurn, shadowSweep, unfold, foldInto), `ArabicTitle`, `MalaySubtitle` + `STORY`, `Book` (cover, endpaper, pages, page edges), `Architecture` (`House`, `Palm`), `Atmosphere` (sky, stars, dust, glows, beams, grade, grain, vignette), `shapes`, the timeline and `assets` loader, fonts, texture and the sound kit.

**Added for the series:**

- In `src/components/`:
  - `ArabiaMap` (projected cut-paper map, animated routes, markers)
  - `FamilyTree` (drawn genealogy with guardianship arrows)
  - `Props` (camels and caravans, Ka'bah, tent, market stall, balance scale, cradle, sheep, table)
  - `AgeTimeline`
  - `IllustrationNote`
  - `Sound` (the shared `Sfx`/`Bed` audio helpers)
- `buildSlots()` in `timeline.ts`.
- `lines` prop on `HistoricalDisclaimer`.
- The synthesized sounds `bells_loop.wav` and `clink.wav`.
