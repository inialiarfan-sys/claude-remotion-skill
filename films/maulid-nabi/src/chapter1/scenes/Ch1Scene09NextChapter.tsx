import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { latinStack, theme } from "../../theme";
import { Endpaper, PageEdges, PageSurface } from "../../components/Book";
import { CinematicCamera } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer } from "../../components/PaperLayer";
import { Dust, Glow, Grain, PaperOverlay, Vignette } from "../../components/Atmosphere";
import { InkwellQalam, OilLamp, TableTop } from "../../components/Props";
import { InkCaption } from "../../components/WorldCaption";
import { clamp } from "../../components/textMotion";
import { noise1 } from "../../random";
import { sec } from "../../timeline";

const C = theme.colors;
export const CH1_S9_PAGE = { x: 70, y: 250, w: 940, h: 1420 };
const P = CH1_S9_PAGE;
const LAMP = { x: 40, y: 170 };
const T = { list: 30, turn: sec(7.0), unfold: sec(8.0), draw: sec(8.8), more: sec(10.6), next: sec(11.6), pull: sec(10.4) };
const ITEMS = [
  { age: "6 TAHUN", text: "KEHILANGAN IBUNDA" },
  { age: "8 TAHUN", text: "KEHILANGAN DATUK" },
  { age: "", text: "DI BAWAH JAGAAN ABU TALIB" },
  { age: "", text: "ZAMAN KANAK-KANAK MENUJU ALAM DEWASA" },
];
const ITEM_AT = (i: number) => T.list + i * 34;
export const CH1_S9_BEATS = { ...T, items: ITEMS.map((_, i) => ITEM_AT(i)) };

// the chapter summary, written entry by entry on the leaf (page-relative coordinates)
const Summary: React.FC = () => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [T.list, ITEM_AT(3) + 20], [0, 1], { ...clamp, easing: theme.ease.inOut });
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", fontFamily: latinStack, fontWeight: 700, fontSize: 40, letterSpacing: "0.22em", color: C.goldDeep }}>
        BAB 1
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: latinStack, fontWeight: 700, fontSize: 34, letterSpacing: "0.1em", color: C.ink }}>
        ZAMAN KANAK-KANAK
      </div>
      <svg width={P.w} height={P.h} style={{ position: "absolute", inset: 0 }}>
        <line x1={170} y1={330} x2={170} y2={330 + 860 * line} stroke={C.goldDeep} strokeWidth={4} />
      </svg>
      {ITEMS.map((it, i) => {
        const y = 360 + i * 230;
        const dot = interpolate(frame, [ITEM_AT(i) - 4, ITEM_AT(i) + 6], [0, 1], clamp);
        return (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                left: 152,
                top: y + 14,
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: i < 2 ? C.goldDeep : "#2e4378",
                border: `4px solid ${C.parchmentLight}`,
                transform: `scale(${dot})`,
              }}
            />
            {it.age ? <InkCaption lines={[it.age]} start={ITEM_AT(i)} top={y} left={230} width={640} size={34} tracking={0.12} color={C.goldDeep} align="left" per={14} /> : null}
            <InkCaption
              lines={it.text.length > 26 ? ["ZAMAN KANAK-KANAK", "MENUJU ALAM DEWASA"] : [it.text]}
              start={ITEM_AT(i) + (it.age ? 10 : 0)}
              top={y + (it.age ? 42 : 0)}
              left={230}
              width={690}
              size={42}
              lineHeight={1.15}
              tracking={0.02}
              align="left"
            />
          </div>
        );
      })}
    </div>
  );
};

// gold-ink line drawing of the Ka'bah among the mountains, drawn stroke by stroke
const KaabaOutline: React.FC<{ t: number }> = ({ t }) => {
  const draw = (a: number, b: number) => `${interpolate(t, [a, b], [0, 1], clamp)} 1`;
  return (
    <svg width={P.w} height={P.h} style={{ position: "absolute", inset: 0 }}>
      <g fill="none" stroke={C.goldDeep} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <path pathLength={1} strokeDasharray={draw(0, 0.45)} d="M40 900 L170 640 L250 760 L360 520 L470 780 L560 700 L650 820 L760 560 L900 900" />
        <path pathLength={1} strokeDasharray={draw(0.15, 0.55)} d="M40 980 L200 860 L320 930 L470 850 L620 940 L760 860 L900 980" opacity={0.6} />
        <path pathLength={1} strokeDasharray={draw(0.4, 0.8)} d="M370 1180 L370 960 L560 960 L560 1180 Z" strokeWidth={5} />
        <path pathLength={1} strokeDasharray={draw(0.5, 0.85)} d="M560 960 L640 985 L640 1170 L560 1180" strokeWidth={5} />
        <path pathLength={1} strokeDasharray={draw(0.6, 0.95)} d="M370 1010 L560 1010 M370 1060 L560 1060 M370 1110 L560 1110" opacity={0.5} />
        <path pathLength={1} strokeDasharray={draw(0.7, 1)} d="M60 1190 L880 1190" />
      </g>
    </svg>
  );
};

export const Ch1Scene09NextChapter: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const turn = interpolate(frame, [T.turn, T.turn + 30], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const unfold = interpolate(frame, [T.unfold, T.unfold + 36], [0, 1], { ...clamp, easing: theme.ease.out });
  const lines = interpolate(frame, [T.draw, T.draw + 70], [0, 1], clamp);
  const fadeOut = interpolate(frame, [dur - 30, dur], [0, 1], { ...clamp, easing: theme.ease.in });
  const flicker = 0.92 + noise1(frame / 5, 1) * 0.08 + noise1(frame / 13, 2) * 0.05;
  const lift = Math.sin(turn * Math.PI);
  const half = P.w / 2;

  return (
    <AbsoluteFill style={{ background: C.void }}>
      {/* back at the writing table of the opening: the camera eases toward the new page,
          then pulls back to show the book resting by its lamp */}
      <CinematicCamera
        keys={[
          { f: 0, x: 0, y: 0, zoom: 1.0 },
          { f: T.turn - 10, x: 0, y: 0, zoom: 1.0 },
          { f: T.pull, x: 0, y: 10, zoom: 1.04 },
          { f: sec(13.4), x: 0, y: 24, zoom: 0.86 },
          { f: dur, x: 0, y: 26, zoom: 0.85 },
        ]}
        drift={0.5}
      >
        <PaperLayer depth={0.94} shadow={0} render={(p) => <TableTop p={p} top={-400} />} />
        <Glow x={LAMP.x + 80} y={LAMP.y + 60} r={900} color="#ffb453" opacity={0.3 * flicker} depth={0.94} />
        <DepthFill depth={1}>
          {/* contact shadows of the open book */}
          <div style={{ position: "absolute", left: P.x - 250, top: P.y + 40, width: P.w + 1240, height: P.h + 20, background: "rgba(0,0,0,0.6)", filter: "blur(44px)" }} />
          <div style={{ position: "absolute", left: P.x - 4, top: P.y + 10, width: P.w + 10, height: P.h + 6, background: "rgba(0,0,0,0.7)", filter: "blur(8px)" }} />
          {/* the opened cover lies to the right, the envelope flap to the left */}
          <div style={{ position: "absolute", left: P.x + P.w, top: P.y - 10, width: 960, height: P.h + 20, overflow: "hidden", borderRadius: 8 }}>
            <Endpaper w={960} h={P.h + 20} />
          </div>
          <div style={{ position: "absolute", left: P.x - 250, top: P.y - 10, width: 250, height: P.h + 20, clipPath: "polygon(100% 0, 38% 0, 0% 50%, 38% 100%, 100% 100%)" }}>
            <Endpaper w={250} h={P.h + 20} />
          </div>
          <div style={{ position: "absolute", left: P.x, top: P.y }}>
            <PageEdges w={P.w} h={P.h} count={10} />
          </div>
          <AbsoluteFill style={{ perspective: 2600 }}>
            {/* new page: its two leaves unfold to reveal the drawing */}
            <PageSurface w={P.w} h={P.h} style={{ left: P.x, top: P.y }}>
              <KaabaOutline t={lines} />
              <InkCaption lines={["BERSAMBUNG..."]} start={T.more} top={1214} width={P.w} size={60} tracking={0.2} per={28} />
              <InkCaption lines={["BAB 2 — ZAMAN REMAJA DAN", "MENJELANG KERASULAN"]} start={T.next} top={1290} width={P.w} size={40} tracking={0.08} color={C.goldDeep} per={26} />
            </PageSurface>
            <div style={{ position: "absolute", left: P.x, top: P.y, width: P.w, height: P.h, transformStyle: "preserve-3d", perspective: 1800 }}>
              {[0, 1].map((i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: i * half,
                    top: 0,
                    width: half,
                    height: P.h,
                    transformOrigin: i === 0 ? "0% 50%" : "100% 50%",
                    transform: `rotateY(${(i === 0 ? -1 : 1) * unfold * 178}deg)`,
                    opacity: unfold < 1 ? 1 : 0,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <PageSurface w={half} h={P.h} frame={false} style={{ backfaceVisibility: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${i === 0 ? 90 : 270}deg, transparent 60%, rgba(60,35,10,0.35))` }} />
                  </PageSurface>
                  <PageSurface w={half} h={P.h} frame={false} style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} />
                </div>
              ))}
            </div>
            {/* summary leaf turns over on the right-hand spine */}
            {turn < 1 ? (
              <div
                style={{
                  position: "absolute",
                  left: P.x,
                  top: P.y,
                  width: P.w,
                  height: P.h,
                  transformOrigin: "100% 50%",
                  transform: `rotateY(${turn * 178}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <PageSurface w={P.w} h={P.h} style={{ backfaceVisibility: "hidden" }}>
                  <Summary />
                  <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(0,0,0,${0.45 * lift}), transparent 80%)` }} />
                </PageSurface>
                <PageSurface w={P.w} h={P.h} frame={false} style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} />
              </div>
            ) : null}
          </AbsoluteFill>
        </DepthFill>
        <PaperLayer depth={1.05} shadow={10} shadowOpacity={0.5} render={(p) => <InkwellQalam p={p} x={980} y={1800} />} />
        <PaperLayer depth={1.1} shadow={12} shadowOpacity={0.5} render={(p) => <OilLamp p={p} x={LAMP.x} y={LAMP.y} flicker={flicker} sway={noise1(frame / 9, 3) * 6} />} />
        <Glow x={LAMP.x + 112} y={LAMP.y - 52} r={130} color="#ffc46a" opacity={0.9 * flicker} depth={1.1} />
        <Dust seed={909} count={30} area={{ x: 0, y: 200, w: 1080, h: 1500 }} rise={0.35} size={3} depth={1.0} opacity={0.5} />
      </CinematicCamera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 22% 16%, rgba(255,190,110,0.10), transparent 55%, rgba(5,3,2,0.45) 100%)" }} />
      <PaperOverlay opacity={0.18} />
      <Grain />
      <Vignette strength={0.6} />
      <AbsoluteFill style={{ background: "#000", opacity: fadeOut }} />
    </AbsoluteFill>
  );
};
