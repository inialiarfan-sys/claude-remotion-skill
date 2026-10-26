import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../theme";
import { BookCover, Endpaper, PageEdges, PageSurface } from "../../components/Book";
import { ArabicTitle } from "../../components/ArabicTitle";
import { MalaySubtitle } from "../../components/MalaySubtitle";
import { CinematicCamera } from "../../components/CinematicCamera";
import { PaperLayer } from "../../components/PaperLayer";
import { Dust, Grain, LightBeam, PaperOverlay, Vignette } from "../../components/Atmosphere";
import { CompassRose, MapMarker, MapShapes, PLACES, projection } from "../../components/ArabiaMap";
import { TableTop } from "../../components/Props";
import { clamp } from "../../components/textMotion";
import { sec } from "../../timeline";

const C = theme.colors;
const BOOK = { x: 160, y: 520, w: 760, h: 1000 };
const PW = BOOK.w - 20;
const PH = BOOK.h - 20;
const MAP_K = 26;
const proj = projection(20, 250, MAP_K);
// where Makkah lands on screen at the end of the push-in; S2 opens from here
export const CH1_S1_APERTURE = { x: 430, y: 890, w: 220, h: 220 };

const e = (f: number, a: number, b: number, from = 0, to = 1, easing = theme.ease.inOut) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing });

const MapSheet: React.FC<{ frame: number }> = ({ frame }) => (
  <PageSurface w={PW} h={PH}>
    <svg width={PW} height={PH} style={{ position: "absolute", inset: 0 }}>
      <MapShapes p={(c) => c} proj={proj} k={MAP_K} />
      <CompassRose x={620} y={880} r={44} p={(c) => c} />
      <g>
        <MapMarker proj={proj} ll={PLACES.syam} at={sec(6.2)} ms="SYAM" k={MAP_K} />
        <MapMarker proj={proj} ll={PLACES.yathrib} at={sec(6.6)} ms="YATHRIB" k={MAP_K} side="left" />
        <MapMarker proj={proj} ll={PLACES.yaman} at={sec(7.0)} ms="YAMAN" k={MAP_K} />
        <MapMarker proj={proj} ll={PLACES.makkah} at={sec(9.2)} ar="مكة" ms="MAKKAH" k={MAP_K} side="left" />
      </g>
    </svg>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 90,
        textAlign: "center",
        fontFamily: "'Amiri', serif",
        fontWeight: 700,
        fontSize: 46,
        color: C.inkSoft,
        opacity: interpolate(frame, [sec(6), sec(7)], [0, 0.85], clamp),
      }}
      dir="rtl"
    >
      جَزِيرَةُ الْعَرَبِ
    </div>
  </PageSurface>
);

export const Ch1Scene01Book: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const darkness = e(frame, 0, sec(1.8), 1, 0, theme.ease.soft);
  const approach = e(frame, 0, sec(4.2), 0.8, 0.95);
  const cover = e(frame, sec(2.3), sec(4.3), 0, 172);
  const flapL = e(frame, sec(4.2), sec(5.6), 1, 0, theme.ease.out);
  const flapR = e(frame, sec(4.7), sec(6.1), 1, 0, theme.ease.out);
  const light = e(frame, sec(2.5), sec(6), 0, 1, theme.ease.soft);
  // travel to Makkah
  const q = e(frame, sec(10), sec(14.4), 0, 1);
  const s = approach + (2.6 - 0.95) * q;
  const mx = BOOK.x + 10 + proj(PLACES.makkah)[0];
  const my = BOOK.y + 10 + proj(PLACES.makkah)[1];
  const tx = (540 - 540 - s * (mx - 540)) * q + (1 - q) * 0;
  const ty = (1000 - 960 - s * (my - 960)) * q;
  const third = PW / 3;

  const flap = (i: 0 | 2, fold: number) => (
    <div
      style={{
        position: "absolute",
        left: i * third,
        top: 0,
        width: third,
        height: PH,
        transformOrigin: i === 0 ? "100% 50%" : "0% 50%",
        transform: `rotateY(${(i === 0 ? 1 : -1) * fold * 178}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", backfaceVisibility: "hidden" }}>
        <div style={{ position: "absolute", left: -i * third, top: 0 }}>
          <MapSheet frame={frame} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: `rgba(40,20,5,${Math.sin(fold * Math.PI) * 0.5})` }} />
      </div>
      <PageSurface w={third} h={PH} frame={false} style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} />
    </div>
  );

  return (
    <AbsoluteFill style={{ background: C.void }}>
      <CinematicCamera keys={[{ f: 0, x: 0, y: 0, zoom: 1 }, { f: sec(15), x: 0, y: 0, zoom: 1.05 }]}>
        <PaperLayer depth={0.3} shadow={0} render={(p) => <TableTop p={p} top={-400} />} />
      </CinematicCamera>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 55%, rgba(255,190,110,${0.15 + light * 0.2}) 0%, rgba(20,10,4,0.55) 55%, rgba(7,6,10,0.92) 100%)`,
        }}
      />
      <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: "50% 45%" }}>
        <AbsoluteFill
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${s}) rotateX(${e(frame, 0, sec(4), 16, 2)}deg)`,
            transformOrigin: "540px 960px",
            transformStyle: "preserve-3d",
          }}
        >
          <div style={{ position: "absolute", left: BOOK.x - 30, top: BOOK.y + 40, width: BOOK.w + 60, height: BOOK.h, background: "rgba(0,0,0,0.75)", filter: "blur(36px)" }} />
          <div style={{ position: "absolute", left: BOOK.x + 10, top: BOOK.y + 10 }}>
            <PageEdges w={PW} h={PH} count={9} />
          </div>
          <div style={{ position: "absolute", left: BOOK.x + 10, top: BOOK.y + 10, width: PW, height: PH, transformStyle: "preserve-3d", perspective: 1800, opacity: cover > 90 ? 1 : 0 }}>
            {/* the centre panel of the folded map lies on the page; side flaps open out */}
            <div style={{ position: "absolute", left: third, top: 0, width: third, height: PH, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: -third, top: 0 }}>
                <MapSheet frame={frame} />
              </div>
            </div>
            {flap(0, flapL)}
            {flap(2, flapR)}
          </div>
          {/* cover swings open on the right-hand spine */}
          <div
            style={{
              position: "absolute",
              left: BOOK.x,
              top: BOOK.y,
              width: BOOK.w,
              height: BOOK.h,
              transformOrigin: "100% 50%",
              transform: `rotateY(${cover}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
              <BookCover w={BOOK.w} h={BOOK.h} sheen={e(frame, sec(0.6), sec(2.4))} />
            </div>
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", overflow: "hidden", borderRadius: 8 }}>
              <Endpaper w={BOOK.w} h={BOOK.h} />
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <LightBeam x={300} y={-200} angle={-22} width={560} length={2000} color="#ffcf87" opacity={0.14 * light} depth={0} />
      <Dust seed={101} count={44} area={{ x: 60, y: 150, w: 960, h: 1600 }} rise={0.45} size={3.2} opacity={0.3 + light * 0.6} depth={0} />
      <AbsoluteFill style={{ background: `rgba(7,6,10,${darkness * 0.95})` }} />
      <ArabicTitle text="سِيرَةُ النَّبِيِّ مُحَمَّدٍ ﷺ" start={sec(1.3)} end={sec(9.8)} top={150} size={92} revealLen={44} />
      <MalaySubtitle text="PERJALANAN HIDUP RASULULLAH SAW" start={sec(2.3)} end={sec(9.8)} top={360} size={44} tracking={0.12} />
      <MalaySubtitle text="BAB 1 — ZAMAN KANAK-KANAK" start={sec(4.6)} end={sec(9.8)} top={1600} size={46} tracking={0.16} color={C.goldLight} />
      <PaperOverlay opacity={0.2} />
      <Grain />
      <Vignette strength={0.65} />
    </AbsoluteFill>
  );
};
