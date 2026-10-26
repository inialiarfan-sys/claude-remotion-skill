import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { BookCover, Endpaper, PageEdges, PageSurface } from "../components/Book";
import { ArabicTitle } from "../components/ArabicTitle";
import { MalaySubtitle } from "../components/MalaySubtitle";
import { Dust, Grain, LightBeam, PaperOverlay, Vignette } from "../components/Atmosphere";
import { starPath } from "../components/shapes";
import { clamp } from "../components/textMotion";
import { sec } from "../timeline";

const C = theme.colors;
const BOOK = { x: 160, y: 430, w: 760, h: 1060 };
const CARD = { x: 50, y: 214, w: 640, h: 560 }; // relative to the page
export const S1_CARD_SCREEN = { x: 212, y: 650, w: 656, h: 572 };

const T = {
  dark: [0, sec(1.6)],
  cover: [sec(1.6), sec(3.4)],
  unfold: [sec(3.05), sec(4.25)],
  title: sec(3.95),
  malay: sec(4.7),
  textEnd: sec(7.4),
} as const;

const e = (f: number, range: readonly [number, number], from = 0, to = 1, easing = theme.ease.inOut) =>
  interpolate(f, [range[0], range[1]], [from, to], { ...clamp, easing });

// lapis title panel (sarlawh). The lower half is folded up over the upper
// half at first and swings down on a paper hinge.
const TitleCard: React.FC<{ unfold: number }> = ({ unfold }) => {
  const half = CARD.h / 2;
  const lapis = `linear-gradient(180deg, #22367a 0%, #172760 55%, #101b47 100%)`;
  const goldEdge = (sides: React.CSSProperties) => (
    <div style={{ position: "absolute", inset: 14, border: `3px solid ${C.gold}`, ...sides }} />
  );
  const angle = (1 - unfold) * 180;
  const lift = Math.sin(unfold * Math.PI);
  return (
    <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, transformStyle: "preserve-3d" }}>
      {/* card shadow on the page */}
      <div
        style={{
          position: "absolute",
          left: 10,
          top: 18,
          width: CARD.w,
          height: half + half * unfold,
          background: "rgba(40,20,5,0.45)",
          filter: "blur(10px)",
        }}
      />
      <div style={{ position: "absolute", left: 0, top: 0, width: CARD.w, height: half, background: lapis, overflow: "hidden" }}>
        {goldEdge({ borderBottom: "none", bottom: -4 })}
        <svg width={CARD.w} height={half} style={{ position: "absolute", inset: 0 }}>
          <path d={starPath(40, 40, 14, 6)} fill={C.gold} />
          <path d={starPath(CARD.w - 40, 40, 14, 6)} fill={C.gold} />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: half,
          width: CARD.w,
          height: half,
          transformOrigin: "50% 0%",
          transform: `rotateX(${angle}deg) translateZ(${lift * 6}px)`,
          transformStyle: "preserve-3d",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: lapis, backfaceVisibility: "hidden", overflow: "hidden" }}>
          {goldEdge({ borderTop: "none", top: -4 })}
          <svg width={CARD.w} height={half} style={{ position: "absolute", inset: 0 }}>
            <path d={starPath(40, half - 40, 14, 6)} fill={C.gold} />
            <path d={starPath(CARD.w - 40, half - 40, 14, 6)} fill={C.gold} />
          </svg>
          <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.5 * lift})` }} />
        </div>
        <PageSurface
          w={CARD.w}
          h={half}
          frame={false}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg) rotateZ(180deg)" }}
        />
      </div>
    </div>
  );
};

export const Scene01BookOpening: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const darkness = e(frame, T.dark, 1, 0, theme.ease.soft);
  const zoom = interpolate(frame, [0, sec(3.6), sec(8)], [0.76, 0.95, 1.02], { ...clamp, easing: theme.ease.inOut });
  const tilt = e(frame, [0, sec(3.4)], 20, 3);
  const coverAngle = e(frame, T.cover, 0, 172);
  const unfold = e(frame, T.unfold, 0, 1, theme.ease.out);
  const light = e(frame, [sec(2.6), sec(5.6)], 0, 1, theme.ease.soft);
  const sheen = e(frame, [sec(0.4), sec(2.4)], 0, 1);

  return (
    <AbsoluteFill style={{ background: C.void }}>
      {/* warm pool of light where the book rests */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 45% at 50% 52%, rgba(120,72,24,${0.35 + light * 0.3}) 0%, rgba(30,16,6,0.6) 55%, ${C.void} 100%)`,
        }}
      />
      <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: "50% 45%" }}>
        <AbsoluteFill
          style={{
            transform: `translateY(${(1 - zoom) * 120}px) scale(${zoom}) rotateX(${tilt}deg)`,
            transformOrigin: "50% 50%",
            transformStyle: "preserve-3d",
          }}
        >
          {/* contact shadow */}
          <div
            style={{
              position: "absolute",
              left: BOOK.x - 30,
              top: BOOK.y + 40,
              width: BOOK.w + 60,
              height: BOOK.h,
              background: "rgba(0,0,0,0.75)",
              filter: "blur(36px)",
              borderRadius: 30,
            }}
          />
          <div style={{ position: "absolute", left: BOOK.x + 10, top: BOOK.y + 10 }}>
            <PageEdges w={BOOK.w - 20} h={BOOK.h - 20} count={9} />
          </div>
          <PageSurface w={BOOK.w - 20} h={BOOK.h - 20} style={{ left: BOOK.x + 10, top: BOOK.y + 10, transformStyle: "preserve-3d" }}>
            {/* gold light spreading across the leaf */}
            <AbsoluteFill
              style={{
                background: `radial-gradient(circle at 70% 25%, rgba(255,214,140,${0.55 * light}) 0%, rgba(255,190,100,${0.25 * light}) ${20 + light * 40}%, transparent ${30 + light * 55}%)`,
                mixBlendMode: "screen",
              }}
            />
            <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", perspective: 1600 }}>
              <TitleCard unfold={unfold} />
            </div>
            <svg width={BOOK.w - 20} height={BOOK.h - 20} style={{ position: "absolute", inset: 0 }}>
              {/* illuminated finials above and below the panel */}
              <path d={starPath((BOOK.w - 20) / 2, 140, 34, 15)} fill={C.gold} opacity={unfold} />
              <path d={starPath((BOOK.w - 20) / 2, 140, 20, 9)} fill="#1d2f6b" opacity={unfold} />
              <path d={starPath((BOOK.w - 20) / 2, 870, 34, 15)} fill={C.gold} opacity={unfold} />
              <path d={starPath((BOOK.w - 20) / 2, 870, 20, 9)} fill="#1d2f6b" opacity={unfold} />
            </svg>
          </PageSurface>
          {/* title text sits on the panel */}
          <div style={{ position: "absolute", left: BOOK.x + 10 + CARD.x, top: BOOK.y + 10 + CARD.y, width: CARD.w, height: CARD.h }}>
            <ArabicTitle text="مَوْلِدُ النَّبِيِّ مُحَمَّدٍ ﷺ" start={T.title} end={T.textEnd} top={78} size={80} maxWidth={560} lineHeight={1.7} revealLen={42} />
            <MalaySubtitle
              text="KELAHIRAN NABI MUHAMMAD ﷺ"
              start={T.malay}
              end={T.textEnd}
              top={340}
              size={38}
              tracking={0.14}
              maxWidth={560}
              color={C.parchmentLight}
            />
          </div>
          {/* the cover swings open on its spine (right edge — Arabic books open right-to-left) */}
          <div
            style={{
              position: "absolute",
              left: BOOK.x,
              top: BOOK.y,
              width: BOOK.w,
              height: BOOK.h,
              transformOrigin: "100% 50%",
              transform: `rotateY(${coverAngle}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
              <BookCover w={BOOK.w} h={BOOK.h} sheen={sheen} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "6px 16px 16px 6px",
                  background: `linear-gradient(90deg, rgba(0,0,0,${Math.sin((coverAngle / 180) * Math.PI) * 0.6}), transparent)`,
                }}
              />
            </div>
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", overflow: "hidden", borderRadius: 8 }}>
              <Endpaper w={BOOK.w} h={BOOK.h} />
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <LightBeam x={260} y={-200} angle={-24} width={520} length={1900} color="#ffcf87" opacity={0.16 * light} depth={0} />
      <Dust seed={11} count={46} area={{ x: 80, y: 200, w: 920, h: 1500 }} rise={0.5} size={3.2} opacity={0.3 + light * 0.7} depth={0} />
      {/* darkness from which the book emerges */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 50%, rgba(7,6,10,${darkness * 0.92}) 0%, rgba(7,6,10,${Math.min(1, darkness * 1.1 + 0.15)}) 100%)`,
        }}
      />
      <PaperOverlay opacity={0.22} />
      <Grain />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};
