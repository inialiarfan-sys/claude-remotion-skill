import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { latinStack, theme } from "../../theme";
import { PageEdges, PageSurface } from "../../components/Book";
import { Dust, Grain, PaperOverlay, Vignette } from "../../components/Atmosphere";
import { MalaySubtitle } from "../../components/MalaySubtitle";
import { clamp } from "../../components/textMotion";
import { sec } from "../../timeline";

const C = theme.colors;
export const CH1_S9_PAGE = { x: 70, y: 250, w: 940, h: 1420 };
const P = CH1_S9_PAGE;
const T = { list: 24, turn: sec(7.0), unfold: sec(8.0), draw: sec(8.8), more: sec(10.6), next: sec(11.6) };

const ITEMS = [
  { age: "6 TAHUN", text: "KEHILANGAN IBUNDA" },
  { age: "8 TAHUN", text: "KEHILANGAN DATUK" },
  { age: "", text: "DI BAWAH JAGAAN ABU TALIB" },
  { age: "", text: "ZAMAN KANAK-KANAK MENUJU ALAM DEWASA" },
];

const Summary: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = interpolate(frame, [T.list, T.list + 90], [0, 1], { ...clamp, easing: theme.ease.inOut });
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
        const p = spring({ frame: frame - T.list - i * 22, fps, config: theme.spring.smooth });
        const y = 360 + i * 230;
        return (
          <div key={i} style={{ position: "absolute", left: 0, top: y, width: P.w, opacity: p, transform: `translateX(${interpolate(p, [0, 1], [30, 0])}px)` }}>
            <div style={{ position: "absolute", left: 152, top: 14, width: 36, height: 36, borderRadius: "50%", background: i < 2 ? C.goldDeep : "#2e4378", border: `4px solid ${C.parchmentLight}` }} />
            <div style={{ position: "absolute", left: 230, right: 70, fontFamily: latinStack }}>
              {it.age ? <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "0.12em", color: C.goldDeep }}>{it.age}</div> : null}
              <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.15, color: C.ink }}>{it.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// gold-ink line drawing of the Ka'bah among the mountains, drawn stroke by stroke
const KaabaOutline: React.FC<{ t: number }> = ({ t }) => {
  const draw = (a: number, b: number) => `${interpolate(t, [a, b], [0, 1], clamp)} 1`;
  const W = P.w;
  return (
    <svg width={W} height={P.h} style={{ position: "absolute", inset: 0 }}>
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
  const push = interpolate(frame, [T.turn - 20, dur], [1, 1.06], { ...clamp, easing: theme.ease.inOut });
  const fadeOut = interpolate(frame, [dur - 30, dur], [0, 1], { ...clamp, easing: theme.ease.in });
  const lift = Math.sin(turn * Math.PI);
  const half = P.w / 2;

  return (
    <AbsoluteFill style={{ background: C.void }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(110,66,22,0.45), rgba(25,14,6,0.7) 55%, #07060a 100%)" }} />
      <AbsoluteFill style={{ perspective: 2600, transform: `scale(${push})`, transformOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: P.x - 30, top: P.y + 50, width: P.w + 60, height: P.h, background: "rgba(0,0,0,0.8)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", left: P.x, top: P.y }}>
          <PageEdges w={P.w} h={P.h} count={10} />
        </div>
        {/* new page: its two leaves unfold to reveal the drawing */}
        <PageSurface w={P.w} h={P.h} style={{ left: P.x, top: P.y }}>
          <KaabaOutline t={lines} />
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
      <MalaySubtitle text="BERSAMBUNG..." start={T.more} top={1450} size={64} tracking={0.2} color={C.ink} shadow={false} />
      <MalaySubtitle text="BAB 2 — ZAMAN REMAJA DAN MENJELANG KERASULAN" start={T.next} top={1560} size={38} tracking={0.08} maxWidth={800} color={C.goldDeep} shadow={false} ornament={false} />
      <Dust seed={909} count={30} area={{ x: 60, y: 200, w: 960, h: 1500 }} rise={0.35} size={3} depth={0} opacity={0.5} />
      <PaperOverlay opacity={0.18} />
      <Grain />
      <Vignette strength={0.6} />
      <AbsoluteFill style={{ background: "#000", opacity: fadeOut }} />
    </AbsoluteFill>
  );
};
