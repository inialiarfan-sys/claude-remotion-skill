import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { theme } from "../theme";
import { sec } from "../timeline";
import { PageTransition } from "../components/PageTransition";
import { Bed, Sfx } from "../components/Sound";
import { CH2_SLOTS, CH2_TOTAL } from "./timeline";
import { BOOK_PAGE } from "./BookOnTable";
import { Ch2Scene01Continuation, CH2_S1_BEATS as S1B } from "./scenes/Ch2Scene01Continuation";
import { Ch2Scene02AbuTalib, CH2_S2_BEATS as S2B } from "./scenes/Ch2Scene02AbuTalib";
import { Ch2Scene03Shepherd, CH2_S3_BEATS as S3B } from "./scenes/Ch2Scene03Shepherd";
import { Ch2Scene04Syam, CH2_S4_BEATS as S4B } from "./scenes/Ch2Scene04Syam";
import { Ch2Scene05AlAmin, CH2_S5_BEATS as S5B } from "./scenes/Ch2Scene05AlAmin";
import { Ch2Scene06Reflection, CH2_S6_BEATS as S6B } from "./scenes/Ch2Scene06Reflection";

const [S1, S2, S3, S4, S5, S6] = CH2_SLOTS;
// Scene 1 ends pushing into a lit doorway at screen (540, 1037); Scene 2 opens out of it
const DOOR_APERTURE = { x: 470, y: 967, w: 140, h: 140 };

// No narration, no voice, no music: ambience and paper sounds only.
const Soundtrack: React.FC = () => (
  <>
    {/* desert wind: up outdoors, down at the table and in the courtyard */}
    <Bed
      file="wind_loop.wav"
      from={0}
      dur={CH2_TOTAL}
      env={[
        [0, 0],
        [30, 0.03],
        [S1.from + S1B.rise, 0.04],
        [S1.from + S1B.pushEnd, 0.24],
        [S2.from, 0.18],
        [S2.from + 40, 0.08],
        [S3.from, 0.1],
        [S3.from + 40, 0.3],
        [S4.from + 20, 0.1],
        [S4.from + S4B.land, 0.32],
        [S5.from, 0.2],
        [S5.from + 40, 0.05],
        [S6.from + 30, 0.08],
        [S6.from + 90, 0.24],
        [CH2_TOTAL - 36, 0.18],
        [CH2_TOTAL, 0],
      ]}
    />
    {/* scene 1 — the lamp-lit table where Chapter 1 ended; the world rises from the page */}
    <Bed file="fire_loop.wav" from={0} dur={S1B.pushEnd + 30} env={[[0, 0], [20, 0.05], [S1B.push, 0.05], [S1B.pushEnd + 20, 0]]} />
    <Sfx at={S1.from + S1B.oldOut - 16} file="paper_slide.wav" volume={0.18} />
    {[S1B.series, S1B.bab, S1B.title].map((f) => (
      <Sfx key={f} at={S1.from + f} file="qalam_scratch.wav" volume={0.3} />
    ))}
    <Sfx at={S1.from + S1B.rise} file="paper_pop.wav" volume={0.5} />
    <Sfx at={S1.from + S1B.rise + 4} file="paper_unfold.wav" volume={0.3} />
    <Sfx at={S1.from + S1B.push + 10} file="paper_slide.wav" volume={0.35} />
    <Sfx at={S1.from + S1B.caption} file="paper_slide.wav" volume={0.22} />
    <Sfx at={S2.from + 4} file="paper_slide.wav" volume={0.4} />
    {/* scene 2 — the household courtyard at nightfall: hearth, insects */}
    <Bed
      file="fire_loop.wav"
      from={S2.from}
      dur={S3.from + 40 - S2.from}
      env={[
        [S2.from, 0],
        [S2.from + 40, 0.16],
        [S3.from - 10, 0.2],
        [S3.from + 30, 0],
      ]}
    />
    <Bed
      file="insects_loop.wav"
      from={S2.from}
      dur={S3.from + 40 - S2.from}
      env={[
        [S2.from, 0],
        [S2.from + 120, 0.12],
        [S3.from, 0.14],
        [S3.from + 30, 0],
      ]}
    />
    {[S2B.cap1, S2B.cap2].map((f) => (
      <Sfx key={f} at={S2.from + f} file="paper_slide.wav" volume={0.24} />
    ))}
    <Sfx at={S2.from + S2B.callout + 14} file="paper_tick.wav" volume={0.3} />
    <Sfx at={S3.from - 2} file="paper_unfold.wav" volume={0.6} />
    {/* scene 3 — morning pasture: birds, the flock, the hadith card */}
    <Sfx at={S3.from + 30} file="dawn_birds.wav" volume={0.22} />
    {S3B.bleats.map((f, i) => (
      <Sfx key={f} at={S3.from + f} file="bleat.wav" volume={[0.3, 0.2, 0.26, 0.16][i]} />
    ))}
    {[S3B.cap1, S3B.cap2].map((f) => (
      <Sfx key={f} at={S3.from + f} file="paper_slide.wav" volume={0.24} />
    ))}
    <Sfx at={S3.from + S3B.card} file="paper_unfold.wav" volume={0.42} />
    <Sfx at={S3.from + S3B.card + 18} file="qalam_scratch.wav" volume={0.3} />
    <Sfx at={S3.from + S3B.card + 120} file="qalam_scratch.wav" volume={0.22} />
    <Sfx at={S4.from - 3} file="page_turn.wav" volume={0.7} />
    {/* scene 4 — the road north on the map, then the caravan at Busra */}
    <Sfx at={S4.from + 12} file="paper_pop.wav" volume={0.4} />
    {[16, S4B.yathrib, S4B.busra].map((f) => (
      <Sfx key={f} at={S4.from + f} file="paper_tick.wav" volume={0.35} />
    ))}
    <Sfx at={S4.from + S4B.route0} file="qalam_scratch.wav" volume={0.22} />
    <Sfx at={S4.from + S4B.dive} file="paper_slide.wav" volume={0.4} />
    <Bed
      file="bells_loop.wav"
      from={S4.from + S4B.dive}
      dur={S5.from + 30 - (S4.from + S4B.dive)}
      env={[
        [S4.from + S4B.dive, 0],
        [S4.from + S4B.dive + 60, 0.22],
        [S4.from + S4B.age, 0.12],
        [S5.from, 0.08],
        [S5.from + 30, 0],
      ]}
    />
    {[sec(1.0), S4B.cap2, S4B.cap3].map((f) => (
      <Sfx key={f} at={S4.from + f} file="paper_slide.wav" volume={0.24} />
    ))}
    <Sfx at={S5.from + 18} file="paper_slide.wav" volume={0.42} />
    {/* scene 5 — back at the book: al-Amin is written, the scale settles, goods are set down */}
    <Bed
      file="fire_loop.wav"
      from={S5.from}
      dur={S6.from + 30 - S5.from}
      env={[
        [S5.from, 0],
        [S5.from + 40, 0.05],
        [S6.from, 0.05],
        [S6.from + 30, 0],
      ]}
    />
    {[S5B.word, S5B.latin, S5B.caption].map((f) => (
      <Sfx key={f} at={S5.from + f} file="qalam_scratch.wav" volume={0.3} />
    ))}
    <Sfx at={S5.from + S5B.landL} file="clink.wav" volume={0.5} />
    <Sfx at={S5.from + S5B.landR} file="clink.wav" volume={0.45} />
    {S5B.goods.map((f) => (
      <Sfx key={f} at={S5.from + f} file="book_close.wav" volume={0.14} />
    ))}
    <Sfx at={S5.from + S5B.amanah} file="paper_slide.wav" volume={0.24} />
    <Sfx at={S6.from - 3} file="page_turn.wav" volume={0.65} />
    {/* scene 6 — night over Makkah toward dawn: the verse, the values, the sources */}
    <Bed
      file="insects_loop.wav"
      from={S6.from}
      dur={S6.dur}
      env={[
        [S6.from, 0],
        [S6.from + 60, 0.14],
        [S6.from + S6B.sourcesEnd, 0.08],
        [CH2_TOTAL - 30, 0],
      ]}
    />
    <Sfx at={S6.from + S6B.verse} file="qalam_scratch.wav" volume={0.28} />
    {S6B.valueAt.map((f) => (
      <Sfx key={f} at={S6.from + f} file="paper_tick.wav" volume={0.3} />
    ))}
    <Sfx at={S6.from + S6B.sources} file="paper_unfold.wav" volume={0.55} />
    <Sfx at={S6.from + S6B.sources + 24} file="qalam_scratch.wav" volume={0.26} />
    <Sfx at={S6.from + S6B.sourcesEnd - 20} file="paper_slide.wav" volume={0.35} />
    <Sfx at={S6.from + S6B.sourcesEnd} file="dawn_birds.wav" volume={0.12} />
    <Sfx at={S6.from + S6B.more} file="qalam_scratch.wav" volume={0.28} />
  </>
);

/**
 * Bab 2 — Zaman Remaja dan Kehidupan Sebelum Kenabian (150 s, 9:16).
 * Continues from the last image of Chapter 1; zIndex decides which of two
 * overlapping scenes performs each transition (see PageTransition).
 */
export const Chapter2: React.FC = () => (
  <AbsoluteFill style={{ background: theme.colors.void }}>
    <Sequence from={S1.from} durationInFrames={S1.dur} style={{ zIndex: 1 }}>
      <PageTransition dur={S1.dur} exit={{ kind: "zoomInto", len: S1.exit }}>
        <Ch2Scene01Continuation dur={S1.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S2.from} durationInFrames={S2.dur} style={{ zIndex: 5 }}>
      <PageTransition dur={S2.dur} enter={{ kind: "aperture", len: S2.enter, from: DOOR_APERTURE }}>
        <Ch2Scene02AbuTalib dur={S2.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S3.from} durationInFrames={S3.dur} style={{ zIndex: 6 }}>
      <PageTransition dur={S3.dur} enter={{ kind: "unfold", len: S3.enter }} exit={{ kind: "pageTurn", len: S3.exit }}>
        <Ch2Scene03Shepherd dur={S3.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S4.from} durationInFrames={S4.dur} style={{ zIndex: 4 }}>
      <PageTransition dur={S4.dur} exit={{ kind: "foldInto", len: S4.exit, to: BOOK_PAGE }}>
        <Ch2Scene04Syam dur={S4.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S5.from} durationInFrames={S5.dur} style={{ zIndex: 3 }}>
      <PageTransition dur={S5.dur} exit={{ kind: "pageTurn", len: S5.exit }}>
        <Ch2Scene05AlAmin dur={S5.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S6.from} durationInFrames={S6.dur} style={{ zIndex: 1 }}>
      <Ch2Scene06Reflection dur={S6.dur} />
    </Sequence>
    <Soundtrack />
  </AbsoluteFill>
);
