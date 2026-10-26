import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { theme } from "../theme";
import { sec } from "../timeline";
import { PageTransition } from "../components/PageTransition";
import { Bed, Sfx } from "../components/Sound";
import { CH1_SLOTS, CH1_TOTAL } from "./timeline";
import { Ch1Scene01Book, CH1_S1_APERTURE, CH1_S1_BEATS as S1B } from "./scenes/Ch1Scene01Book";
import { Ch1Scene02FirstYear, CH1_S2_BEATS as S2B } from "./scenes/Ch1Scene02FirstYear";
import { Ch1Scene03BaniSaad, CH1_S3_BEATS as S3B } from "./scenes/Ch1Scene03BaniSaad";
import { Ch1Scene04Abwa, CH1_S4_BEATS as S4B } from "./scenes/Ch1Scene04Abwa";
import { Ch1Scene05AbdulMuttalib, CH1_S5_BEATS as S5B } from "./scenes/Ch1Scene05AbdulMuttalib";
import { Ch1Scene06Market, CH1_S6_BEATS as S6B } from "./scenes/Ch1Scene06Market";
import { Ch1Scene07Years, CH1_S7_BEATS as S7B } from "./scenes/Ch1Scene07Years";
import { Ch1Scene08Youth, CH1_S8_BEATS as S8B } from "./scenes/Ch1Scene08Youth";
import { Ch1Scene09NextChapter, CH1_S9_PAGE, CH1_S9_BEATS as S9B } from "./scenes/Ch1Scene09NextChapter";

const [S1, S2, S3, S4, S5, S6, S7, S8, S9] = CH1_SLOTS;

// No narration, no voice, no music: ambience and paper sounds only.
const Soundtrack: React.FC = () => (
  <>
    {/* desert wind: up outdoors, down indoors and on the pages, lowest at the solemn moment */}
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
        [S2.from + S2B.door, 0.3],
        [S2.from + S2B.door + 30, 0.08],
        [S3.from + S3B.dive, 0.1],
        [S3.from + S3B.land, 0.38],
        [S4.from + 20, 0.12],
        [S4.from + S4B.land, 0.3],
        [S4.from + S4B.wafat, 0.14],
        [S5.from + 40, 0.1],
        [S6.from + 40, 0.2],
        [S7.from + 40, 0.3],
        [S8.from + 40, 0.4],
        [S8.from + S8B.page, 0.12],
        [S8.from + S8B.back + 20, 0.36],
        [S9.from, 0.2],
        [S9.from + 60, 0.06],
        [CH1_TOTAL - 30, 0.04],
        [CH1_TOTAL, 0],
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
    {/* scene 2 — valley, callout, the doorway, the family page */}
    <Sfx at={S2.from + S2B.birds} file="dawn_birds.wav" volume={0.2} />
    <Sfx at={S2.from + S2B.callout + 14} file="paper_tick.wav" volume={0.3} />
    <Sfx at={S2.from + S2B.door - 2} file="paper_slide.wav" volume={0.35} />
    <Bed
      file="fire_loop.wav"
      from={S2.from + S2B.door}
      dur={S3.from + 10 - (S2.from + S2B.door)}
      env={[
        [S2.from + S2B.door, 0],
        [S2.from + S2B.door + 30, 0.05],
        [S3.from - 10, 0.05],
        [S3.from + 10, 0],
      ]}
    />
    <Sfx at={S2.from + S2B.panel - 2} file="paper_unfold.wav" volume={0.6} />
    {S2B.cards.map((c) => (
      <Sfx key={c} at={S2.from + c + 4} file="paper_tick.wav" volume={0.3} />
    ))}
    <Sfx at={S2.from + S2B.caption} file="qalam_scratch.wav" volume={0.35} />
    <Sfx at={S2.from + S2B.verse} file="qalam_scratch.wav" volume={0.35} />
    <Sfx at={S3.from - 3} file="page_turn.wav" volume={0.7} />
    {/* scene 3 — the route is inked, the marker opens, a day and a night at the camp */}
    <Sfx at={S3.from + 18} file="paper_slide.wav" volume={0.28} />
    {[6, S3B.taif, S3B.baniSaad].map((f) => (
      <Sfx key={f} at={S3.from + f} file="paper_tick.wav" volume={0.35} />
    ))}
    <Sfx at={S3.from + S3B.route} file="qalam_scratch.wav" volume={0.25} />
    <Sfx at={S3.from + S3B.dive} file="paper_slide.wav" volume={0.45} />
    <Sfx at={S3.from + sec(7.0)} file="paper_slide.wav" volume={0.28} />
    <Sfx at={S3.from + sec(13.6)} file="paper_slide.wav" volume={0.28} />
    <Bed
      file="bells_loop.wav"
      from={S3.from + S3B.land}
      dur={S4.from - (S3.from + S3B.land)}
      env={[
        [S3.from + S3B.land, 0],
        [S3.from + S3B.land + 40, 0.12],
        [S3.from + S3B.nightFrom, 0.04],
        [S4.from - 10, 0],
      ]}
    />
    <Bed
      file="insects_loop.wav"
      from={S3.from + S3B.nightFrom - 20}
      dur={S3B.nightTo - S3B.nightFrom + 50}
      env={[
        [S3.from + S3B.nightFrom - 20, 0],
        [S3.from + S3B.nightFrom + 10, 0.2],
        [S3.from + S3B.nightTo - 10, 0.2],
        [S3.from + S3B.nightTo + 25, 0],
      ]}
    />
    <Sfx at={S3.from + S3B.nightTo - 20} file="dawn_birds.wav" volume={0.22} />
    <Sfx at={S4.from - 3} file="page_turn.wav" volume={0.7} />
    {/* scene 4 — the return route; then a quiet dusk with no effects at all */}
    <Sfx at={S4.from + sec(0.8)} file="paper_slide.wav" volume={0.28} />
    {[S4B.out + 40, S4B.abwa, S4B.callout + 14].map((f) => (
      <Sfx key={f} at={S4.from + f} file="paper_tick.wav" volume={0.35} />
    ))}
    <Sfx at={S4.from + S4B.back + 16} file="qalam_scratch.wav" volume={0.25} />
    <Sfx at={S4.from + S4B.dive} file="paper_slide.wav" volume={0.4} />
    <Bed
      file="insects_loop.wav"
      from={S4.from + S4B.land}
      dur={S5.from + 20 - (S4.from + S4B.land)}
      env={[
        [S4.from + S4B.land, 0],
        [S4.from + S4B.land + 60, 0.16],
        [S5.from - 10, 0.12],
        [S5.from + 20, 0],
      ]}
    />
    <Sfx at={S5.from - 2} file="paper_slide.wav" volume={0.3} />
    {/* scene 5 — the header band is written as guardianship passes */}
    <Sfx at={S5.from + S5B.h1 - 14} file="paper_slide.wav" volume={0.35} />
    {[S5B.h1 + 6, S5B.h2, S5B.h3].map((f) => (
      <Sfx key={f} at={S5.from + f} file="qalam_scratch.wav" volume={0.3} />
    ))}
    <Sfx at={S5.from + S5B.abuTalibIn + 4} file="paper_tick.wav" volume={0.3} />
    <Sfx at={S6.from - 2} file="paper_unfold.wav" volume={0.6} />
    {/* scene 6 — market morning: stalls stocked, bells, the map card unfolds */}
    <Sfx at={S6.from + sec(1.8)} file="dawn_birds.wav" volume={0.2} />
    {S6B.stalls.map((f) => (
      <Sfx key={f} at={S6.from + f + 10} file="paper_tick.wav" volume={0.15} />
    ))}
    {[S6B.scroll1, S6B.scroll2, S6B.syam].map((f) => (
      <Sfx key={f} at={S6.from + f} file="paper_slide.wav" volume={0.28} />
    ))}
    <Bed
      file="bells_loop.wav"
      from={S6.from}
      dur={S6.dur}
      env={[
        [S6.from, 0],
        [S6.from + 50, 0.3],
        [S6.from + S6B.map, 0.3],
        [S6.from + S6B.map + 30, 0.08],
        [S7.from, 0],
      ]}
    />
    <Sfx at={S6.from + S6B.map - 2} file="paper_unfold.wav" volume={0.5} />
    {S6B.markers.map((f) => (
      <Sfx key={f} at={S6.from + f} file="paper_tick.wav" volume={0.3} />
    ))}
    <Sfx at={S7.from - 3} file="page_turn.wav" volume={0.65} />
    {/* scene 7 — a leaf turns for each illustrative year; insects on each night */}
    {[0, 1, 2, 3].map((i) => (
      <Sfx key={i} at={S7.from + S7B.start + i * S7B.year - 6} file="page_turn.wav" volume={0.35} />
    ))}
    <Bed
      file="insects_loop.wav"
      from={S7.from}
      dur={S7.dur}
      env={S7B.nights.flatMap(([a, b]) => [
        [S7.from + a - 6, 0],
        [S7.from + a + 10, 0.16],
        [S7.from + b - 10, 0.16],
        [S7.from + b + 6, 0],
      ] as [number, number][])}
    />
    <Sfx at={S7.from + S7B.shepherd} file="paper_slide.wav" volume={0.28} />
    <Sfx at={S8.from - 2} file="paper_slide.wav" volume={0.35} />
    {/* scene 8 — caravans; the page opens; goods settle on the scale */}
    <Bed
      file="bells_loop.wav"
      from={S8.from}
      dur={S8.dur}
      env={[
        [S8.from, 0],
        [S8.from + 50, 0.26],
        [S8.from + S8B.page - 20, 0.26],
        [S8.from + S8B.page + 10, 0],
        [S8.from + S8B.back, 0],
        [S8.from + S8B.back + 30, 0.2],
        [S9.from + 20, 0],
      ]}
    />
    <Sfx at={S8.from + S8B.page - 20} file="paper_unfold.wav" volume={0.55} />
    <Sfx at={S8.from + S8B.landL} file="clink.wav" volume={0.5} />
    <Sfx at={S8.from + S8B.landR} file="clink.wav" volume={0.45} />
    <Sfx at={S8.from + S8B.word} file="qalam_scratch.wav" volume={0.35} />
    <Sfx at={S8.from + S8B.caption} file="qalam_scratch.wav" volume={0.3} />
    <Sfx at={S8.from + S8B.back - 10} file="paper_slide.wav" volume={0.4} />
    <Sfx at={S8.from + S8B.back + 20} file="paper_slide.wav" volume={0.28} />
    <Sfx at={S9.from - 4} file="paper_slide.wav" volume={0.5} />
    {/* scene 9 — back at the lamp-lit table: the summary is written, the next page opens */}
    <Bed
      file="fire_loop.wav"
      from={S9.from}
      dur={S9.dur}
      env={[
        [S9.from, 0],
        [S9.from + 40, 0.05],
        [CH1_TOTAL - 30, 0.05],
        [CH1_TOTAL, 0],
      ]}
    />
    {S9B.items.map((f) => (
      <Sfx key={f} at={S9.from + f} file="qalam_scratch.wav" volume={0.28} />
    ))}
    <Sfx at={S9.from + S9B.turn - 3} file="page_turn.wav" volume={0.65} />
    <Sfx at={S9.from + S9B.unfold} file="paper_unfold.wav" volume={0.55} />
    <Sfx at={S9.from + S9B.more} file="qalam_scratch.wav" volume={0.3} />
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
