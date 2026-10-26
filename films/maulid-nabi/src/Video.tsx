import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { theme } from "./theme";
import { SLOTS, TOTAL_FRAMES, sec } from "./timeline";
import { PageTransition } from "./components/PageTransition";
import { Scene01BookOpening, S1_CARD_SCREEN } from "./scenes/Scene01BookOpening";
import { Scene02AncientArabia } from "./scenes/Scene02AncientArabia";
import { Scene03BirthScene } from "./scenes/Scene03BirthScene";
import { Scene04KisraPalace } from "./scenes/Scene04KisraPalace";
import { Scene05PersianFire } from "./scenes/Scene05PersianFire";
import { Scene06MercyToWorlds } from "./scenes/Scene06MercyToWorlds";
import { Scene07Sources, S7_PAGE } from "./scenes/Scene07Sources";

const [S1, S2, S3, S4, S5, S6, S7] = SLOTS;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// one-shot sound effect placed at an absolute frame
const Sfx: React.FC<{ at: number; file: string; volume?: number }> = ({ at, file, volume = 1 }) => (
  <Sequence from={Math.max(0, at)} layout="none">
    <Audio src={staticFile(`audio/${file}`)} volume={volume} />
  </Sequence>
);

// Ambient bed with a frame-accurate volume envelope [frame, volume][]
const Bed: React.FC<{ file: string; from: number; dur: number; env: [number, number][] }> = ({ file, from, dur, env }) => (
  <Sequence from={from} durationInFrames={dur} layout="none">
    <Audio
      src={staticFile(`audio/${file}`)}
      loop
      volume={(f) =>
        interpolate(
          from + f,
          env.map((e) => e[0]),
          env.map((e) => e[1]),
          { ...clamp, easing: theme.ease.inOut },
        )
      }
    />
  </Sequence>
);

const Soundtrack: React.FC = () => {
  const s4Fall = S4.from + sec(5.8) + 34;
  return (
    <>
      <Bed
        file="wind_loop.wav"
        from={0}
        dur={TOTAL_FRAMES}
        env={[
          [0, 0],
          [40, 0.12],
          [S2.from, 0.14],
          [S2.from + 40, 0.42],
          [S3.from + 40, 0.28],
          [S4.from + 40, 0.38],
          [S5.from, 0.36],
          [S5.from + 40, 0.12],
          [S6.from + 40, 0.32],
          [S7.from, 0.3],
          [S7.from + 50, 0.1],
          [TOTAL_FRAMES - 30, 0.08],
          [TOTAL_FRAMES, 0],
        ]}
      />
      <Bed
        file="insects_loop.wav"
        from={S2.from}
        dur={S4.from + 30 - S2.from}
        env={[
          [S2.from, 0],
          [S2.from + 60, 0.22],
          [S3.from + S3.dur - 40, 0.2],
          [S4.from + 30, 0],
        ]}
      />
      <Bed
        file="fire_loop.wav"
        from={S5.from}
        dur={S5.dur}
        env={[
          [S5.from, 0],
          [S5.from + 30, 0.55],
          [S5.from + sec(3.3), 0.55],
          [S5.from + sec(7.3), 0.0],
        ]}
      />
      {/* scene 1 — the book */}
      <Sfx at={sec(1.6) - 3} file="cover_open.wav" volume={0.8} />
      <Sfx at={sec(3.05) - 2} file="paper_unfold.wav" volume={0.6} />
      <Sfx at={S2.from - 4} file="paper_slide.wav" volume={0.6} />
      {/* page turns between scenes */}
      <Sfx at={S3.from - 3} file="page_turn.wav" volume={0.75} />
      <Sfx at={S4.from - 3} file="page_turn.wav" volume={0.75} />
      {/* scene 3 — distant footsteps in the lane */}
      <Sfx at={S3.from + sec(4.2)} file="footsteps.wav" volume={0.35} />
      {/* scene 4 — tremor, creaking stone, a few fragments */}
      <Sfx at={S4.from + sec(4.4)} file="rumble.wav" volume={0.7} />
      <Sfx at={S4.from + sec(5.2)} file="creak.wav" volume={0.55} />
      <Sfx at={s4Fall} file="debris.wav" volume={0.45} />
      <Sfx at={s4Fall + 24} file="debris.wav" volume={0.3} />
      <Sfx at={S5.from - 2} file="paper_slide.wav" volume={0.5} />
      {/* scene 5 — the flame goes out */}
      <Sfx at={S5.from + sec(6.9)} file="extinguish.wav" volume={0.6} />
      {/* scene 6 — parchment unfolds into dawn */}
      <Sfx at={S6.from - 2} file="paper_unfold.wav" volume={0.6} />
      <Sfx at={S6.from + sec(2)} file="dawn_birds.wav" volume={0.3} />
      <Sfx at={S7.from - 4} file="paper_slide.wav" volume={0.55} />
      {/* scene 7 — page turn, cover, closing */}
      <Sfx at={S7.from + sec(7.2) - 3} file="page_turn.wav" volume={0.7} />
      <Sfx at={S7.from + sec(15.4)} file="cover_open.wav" volume={0.55} />
      <Sfx at={S7.from + sec(16.6) - 3} file="book_close.wav" volume={0.8} />
    </>
  );
};

/**
 * The film. Scenes overlap during each transition; zIndex decides which one
 * performs the transition on top (see PageTransition for each kind).
 */
export const MaulidNabi: React.FC = () => (
  <AbsoluteFill style={{ background: theme.colors.void }}>
    <Sequence from={S1.from} durationInFrames={S1.dur} style={{ zIndex: 1 }}>
      <PageTransition dur={S1.dur} exit={{ kind: "zoomInto", len: S1.exit }}>
        <Scene01BookOpening dur={S1.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S2.from} durationInFrames={S2.dur} style={{ zIndex: 5 }}>
      <PageTransition dur={S2.dur} enter={{ kind: "aperture", len: S2.enter, from: S1_CARD_SCREEN }} exit={{ kind: "pageTurn", len: S2.exit }}>
        <Scene02AncientArabia dur={S2.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S3.from} durationInFrames={S3.dur} style={{ zIndex: 4 }}>
      <PageTransition dur={S3.dur} exit={{ kind: "pageTurn", len: S3.exit }}>
        <Scene03BirthScene dur={S3.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S4.from} durationInFrames={S4.dur} style={{ zIndex: 3 }}>
      <PageTransition dur={S4.dur} exit={{ kind: "shadowSweep", len: S4.exit }}>
        <Scene04KisraPalace dur={S4.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S5.from} durationInFrames={S5.dur} style={{ zIndex: 2 }}>
      <PageTransition dur={S5.dur}>
        <Scene05PersianFire dur={S5.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S6.from} durationInFrames={S6.dur} style={{ zIndex: 6 }}>
      <PageTransition dur={S6.dur} enter={{ kind: "unfold", len: S6.enter }} exit={{ kind: "foldInto", len: S6.exit, to: S7_PAGE }}>
        <Scene06MercyToWorlds dur={S6.dur} />
      </PageTransition>
    </Sequence>
    <Sequence from={S7.from} durationInFrames={S7.dur} style={{ zIndex: 1 }}>
      <Scene07Sources dur={S7.dur} />
    </Sequence>
    <Soundtrack />
  </AbsoluteFill>
);
