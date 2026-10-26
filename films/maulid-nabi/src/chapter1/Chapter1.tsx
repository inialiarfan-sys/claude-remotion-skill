import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { theme } from "../theme";
import { sec } from "../timeline";
import { PageTransition } from "../components/PageTransition";
import { Bed, Sfx } from "../components/Sound";
import { CH1_SLOTS, CH1_TOTAL } from "./timeline";
import { Ch1Scene01Book, CH1_S1_APERTURE, CH1_S1_BEATS as S1B } from "./scenes/Ch1Scene01Book";
import { Ch1Scene02FirstYear } from "./scenes/Ch1Scene02FirstYear";
import { Ch1Scene03BaniSaad } from "./scenes/Ch1Scene03BaniSaad";
import { Ch1Scene04Abwa } from "./scenes/Ch1Scene04Abwa";
import { Ch1Scene05AbdulMuttalib } from "./scenes/Ch1Scene05AbdulMuttalib";
import { Ch1Scene06Market } from "./scenes/Ch1Scene06Market";
import { Ch1Scene07Years } from "./scenes/Ch1Scene07Years";
import { Ch1Scene08Youth } from "./scenes/Ch1Scene08Youth";
import { Ch1Scene09NextChapter, CH1_S9_PAGE } from "./scenes/Ch1Scene09NextChapter";

const [S1, S2, S3, S4, S5, S6, S7, S8, S9] = CH1_SLOTS;

// No narration, no voice, no music: ambience and paper sounds only.
const Soundtrack: React.FC = () => (
  <>
    <Bed
      file="wind_loop.wav"
      from={0}
      dur={CH1_TOTAL}
      env={[
        [0, 0],
        [30, 0.04],
        [S1B.markers, 0.05],
        [S2.from, 0.26],
        [S2.from + 40, 0.36],
        [S2.from + sec(6), 0.12],
        [S3.from + sec(6), 0.12],
        [S3.from + sec(7), 0.4],
        [S4.from + sec(8), 0.18],
        [S4.from + sec(9), 0.42],
        [S5.from + 40, 0.15],
        [S6.from + 40, 0.22],
        [S7.from + 40, 0.32],
        [S8.from + 40, 0.42],
        [S9.from, 0.3],
        [S9.from + 60, 0.08],
        [CH1_TOTAL - 30, 0.05],
        [CH1_TOTAL, 0],
      ]}
    />
    <Bed
      file="insects_loop.wav"
      from={S4.from + sec(8)}
      dur={S4.dur - sec(8)}
      env={[
        [S4.from + sec(8), 0],
        [S4.from + sec(10), 0.2],
        [S5.from + 20, 0],
      ]}
    />
    <Bed
      file="bells_loop.wav"
      from={S6.from}
      dur={S6.dur}
      env={[
        [S6.from, 0],
        [S6.from + 50, 0.3],
        [S6.from + sec(12), 0.3],
        [S6.from + sec(13), 0.08],
        [S7.from, 0],
      ]}
    />
    <Bed
      file="bells_loop.wav"
      from={S8.from}
      dur={S8.dur}
      env={[
        [S8.from, 0],
        [S8.from + 50, 0.26],
        [S8.from + sec(8.6), 0.26],
        [S8.from + sec(9.4), 0],
        [S8.from + sec(17.6), 0],
        [S8.from + sec(18.6), 0.2],
        [S9.from + 20, 0],
      ]}
    />
    {/* scene 1 — the book on the table, every sound tied to a visible action */}
    <Bed
      file="fire_loop.wav"
      from={0}
      dur={S2.from + 40}
      env={[
        [0, 0],
        [20, 0.05],
        [S2.from - 20, 0.05],
        [S2.from + 30, 0],
      ]}
    />
    <Sfx at={S1B.flap - 2} file="paper_unfold.wav" volume={0.32} />
    <Sfx at={S1B.cover - 3} file="cover_open.wav" volume={0.5} />
    <Sfx at={S1B.coverLand - 1} file="book_close.wav" volume={0.7} />
    <Sfx at={S1B.unfold - 2} file="paper_unfold.wav" volume={0.8} />
    <Sfx at={S1B.unfold + 8} file="paper_unfold.wav" volume={0.65} />
    <Sfx at={S1B.ridge - 1} file="paper_pop.wav" volume={0.45} />
    <Sfx at={S1B.title} file="qalam_scratch.wav" volume={0.4} />
    <Sfx at={S1B.bab - 2} file="paper_slide.wav" volume={0.55} />
    {[0, 6, 12].map((d) => (
      <Sfx key={d} at={S1B.markers + d} file="paper_tick.wav" volume={0.35} />
    ))}
    <Sfx at={S1B.makkah} file="paper_tick.wav" volume={0.45} />
    <Sfx at={S2.from - 4} file="paper_slide.wav" volume={0.6} />
    {/* scene 2 — into the dwelling; family tree page */}
    <Sfx at={S2.from + sec(8.2) - 3} file="paper_slide.wav" volume={0.4} />
    <Sfx at={S3.from - 3} file="page_turn.wav" volume={0.7} />
    {/* scene 3 — map dive, encampment, dawn */}
    <Sfx at={S3.from + sec(5.2)} file="paper_slide.wav" volume={0.45} />
    <Sfx at={S3.from + sec(17.6)} file="dawn_birds.wav" volume={0.25} />
    <Sfx at={S4.from - 3} file="page_turn.wav" volume={0.7} />
    {/* scene 4 — map dive to al-Abwa' */}
    <Sfx at={S4.from + sec(7.6)} file="paper_slide.wav" volume={0.4} />
    <Sfx at={S5.from - 2} file="paper_slide.wav" volume={0.45} />
    {/* scene 5 — family tree page */}
    <Sfx at={S5.from + 30} file="paper_unfold.wav" volume={0.45} />
    <Sfx at={S6.from - 2} file="paper_unfold.wav" volume={0.6} />
    {/* scene 6 — market morning, map card */}
    <Sfx at={S6.from + sec(1)} file="dawn_birds.wav" volume={0.18} />
    <Sfx at={S6.from + sec(12.4) - 3} file="paper_slide.wav" volume={0.4} />
    <Sfx at={S7.from - 3} file="page_turn.wav" volume={0.65} />
    {/* scene 7 — a leaf turns for each illustrative year */}
    {[0, 1, 2, 3].map((i) => (
      <Sfx key={i} at={S7.from + 40 + i * 160 - 6} file="page_turn.wav" volume={0.35} />
    ))}
    <Sfx at={S8.from - 2} file="paper_slide.wav" volume={0.45} />
    {/* scene 8 — the scale comes to rest */}
    <Sfx at={S8.from + sec(9.2)} file="clink.wav" volume={0.5} />
    <Sfx at={S9.from - 4} file="paper_slide.wav" volume={0.5} />
    {/* scene 9 — summary leaf turns; new page unfolds */}
    <Sfx at={S9.from + sec(7) - 3} file="page_turn.wav" volume={0.65} />
    <Sfx at={S9.from + sec(8)} file="paper_unfold.wav" volume={0.55} />
  </>
);

/**
 * Bab 1 — Zaman Kanak-kanak hingga Menjelang Baligh (≈3 min, 9:16).
 * Nine scenes on the same paper-cut system as the Maulid film; zIndex decides
 * which of two overlapping scenes performs each transition (see PageTransition).
 */
export const Chapter1: React.FC = () => (
  <AbsoluteFill style={{ background: theme.colors.void }}>
    <Sequence from={S1.from} durationInFrames={S1.dur} style={{ zIndex: 1 }}>
      <PageTransition dur={S1.dur} exit={{ kind: "zoomInto", len: S1.exit }}>
        <Ch1Scene01Book dur={S1.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S2.from} durationInFrames={S2.dur} style={{ zIndex: 9 }}>
      <PageTransition dur={S2.dur} enter={{ kind: "aperture", len: S2.enter, from: CH1_S1_APERTURE }} exit={{ kind: "pageTurn", len: S2.exit }}>
        <Ch1Scene02FirstYear dur={S2.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S3.from} durationInFrames={S3.dur} style={{ zIndex: 8 }}>
      <PageTransition dur={S3.dur} exit={{ kind: "pageTurn", len: S3.exit }}>
        <Ch1Scene03BaniSaad dur={S3.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S4.from} durationInFrames={S4.dur} style={{ zIndex: 7 }}>
      <PageTransition dur={S4.dur} exit={{ kind: "shadowSweep", len: S4.exit }}>
        <Ch1Scene04Abwa dur={S4.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S5.from} durationInFrames={S5.dur} style={{ zIndex: 6 }}>
      <Ch1Scene05AbdulMuttalib dur={S5.dur} />
    </Sequence>
    <Sequence from={S6.from} durationInFrames={S6.dur} style={{ zIndex: 9 }}>
      <PageTransition dur={S6.dur} enter={{ kind: "unfold", len: S6.enter }} exit={{ kind: "pageTurn", len: S6.exit }}>
        <Ch1Scene06Market dur={S6.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S7.from} durationInFrames={S7.dur} style={{ zIndex: 8 }}>
      <PageTransition dur={S7.dur} exit={{ kind: "shadowSweep", len: S7.exit }}>
        <Ch1Scene07Years dur={S7.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S8.from} durationInFrames={S8.dur} style={{ zIndex: 7 }}>
      <PageTransition dur={S8.dur} exit={{ kind: "foldInto", len: S8.exit, to: CH1_S9_PAGE }}>
        <Ch1Scene08Youth dur={S8.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S9.from} durationInFrames={S9.dur} style={{ zIndex: 1 }}>
      <Ch1Scene09NextChapter dur={S9.dur} />
    </Sequence>
    <Soundtrack />
  </AbsoluteFill>
);
