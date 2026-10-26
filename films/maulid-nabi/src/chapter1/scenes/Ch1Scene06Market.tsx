import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { arabicStack, latinStack, theme } from "../../theme";
import { CinematicCamera } from "../../components/CinematicCamera";
import { PaperLayer } from "../../components/PaperLayer";
import { Dust, Grade, Grain, PaperOverlay, Sky, Vignette } from "../../components/Atmosphere";
import { House, Palm } from "../../components/Architecture";
import { Caravan, Kaaba, Stall } from "../../components/Props";
import { PageSurface } from "../../components/Book";
import { MapMarker, MapRoute, MapShapes, PLACES, projection } from "../../components/ArabiaMap";
import { ScrollCaption } from "../../components/WorldCaption";
import { IllustrationNote } from "../../components/IllustrationNote";
import { ridgePath } from "../../components/shapes";
import { clamp, rtlSweepMask } from "../../components/textMotion";
import { sec } from "../../timeline";
import { QURAYSH_106_2 } from "../verses";

const C = theme.colors;
const T = { scroll1: sec(1.2), scroll2: sec(7.0), map: sec(12.4), routes: sec(13.2), syam: sec(16.0) };
export const CH1_S6_BEATS = { ...T, stalls: [0, 1, 2, 3, 4].map((i) => sec(0.8) + i * 14), markers: [sec(13.2) - 10, sec(13.2) + 70, sec(13.2) + 90] };
const CARD = { x: 90, y: 430, w: 900, h: 980 };
const MAP_K = 36;
const proj = projection(CARD.w / 2 - 6.8 * MAP_K, 20, MAP_K, 33, 33.5);
const STALLS = [
  { x: -240, st: ["#8a3b2a", "#e8d2a8"] as [string, string] },
  { x: 60, st: ["#2e4a7a", "#e8d2a8"] as [string, string] },
  { x: 360, st: ["#6a7a3a", "#f0dcb0"] as [string, string] },
  { x: 660, st: ["#a05a2c", "#f0e0c0"] as [string, string] },
  { x: 960, st: ["#5a3a6a", "#e8d2a8"] as [string, string] },
];

export const Ch1Scene06Market: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const end = dur - 32;
  // the map card unfolds from its centre fold
  const unfold = interpolate(frame, [T.map, T.map + 24], [0, 1], { ...clamp, easing: theme.ease.out });
  const cardExit = interpolate(frame, [end - 12, end], [0, 1], { ...clamp, easing: theme.ease.in });
  const routeT = (a: number) => interpolate(frame, [a, a + 70], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const verse = interpolate(frame, [T.routes + 60, T.routes + 110], [0, 1], { ...clamp, easing: theme.ease.soft });

  return (
    <AbsoluteFill style={{ background: C.void }}>
      {/* tracking shot: the camera travels with the arriving caravan */}
      <CinematicCamera keys={[{ f: 0, x: 160, y: 20, zoom: 1.1 }, { f: T.map + 20, x: -150, y: -10, zoom: 1.05 }, { f: dur, x: -170, y: -14, zoom: 1.06 }]}>
        <Sky stops={[["#5a86b8", 0], ["#a8c0d0", 40], ["#f2dcae", 68]]} glow={{ x: 820, y: 700, r: 600, color: "rgba(255,240,200,0.5)" }} />
        <PaperLayer depth={0.12} shadow={10} rim="rgba(255,240,210,0.4)" render={(p) => <path d={ridgePath(601, { x0: -420, x1: 1500, base: 1040, amp: 420, peaks: 4, bottom: 1500 })} fill={p("#9a7470")} />} />
        {/* pigeons lifting over the rooftops */}
        <PaperLayer
          depth={0.22}
          shadow={4}
          texture={0}
          render={(p) => (
            <g>
              {[0, 1, 2, 3].map((i) => {
                const t = frame - sec(2) - i * 5;
                if (t < 0) return null;
                const x = 300 + i * 50 + t * (2.4 + i * 0.2);
                const y = 1090 - t * (1.6 - i * 0.15) + Math.sin(t / 8 + i) * 6;
                const f = Math.sin(t / 2.6 + i) * 9;
                return <path key={i} d={`M${x - 13} ${y - f} Q${x - 5} ${y - 3} ${x} ${y} Q${x + 5} ${y - 3} ${x + 13} ${y - f} L${x} ${y + 3} Z`} fill={p("#4a4048")} />;
              })}
            </g>
          )}
        />
        <PaperLayer
          depth={0.3}
          shadow={14}
          render={(p) => (
            <g>
              {Array.from({ length: 14 }).map((_, i) => (
                <House key={i} p={p} x={-300 + i * 125} base={1180} w={105} h={90 + (i % 5) * 26} body="#c09060" shade="#8a6040" dark="#4a2e18" seed={i + 610} />
              ))}
              <Kaaba p={p} x={720} base={1186} w={80} h={76} />
              <rect x={-400} y={1180} width={1900} height={600} fill={p("#b48656")} />
            </g>
          )}
        />
        {/* the market street: awnings lift in the breeze, goods are set out one by one */}
        <PaperLayer
          depth={0.55}
          shadow={18}
          render={(p) =>
            STALLS.map((s, i) => (
              <Stall
                key={i}
                p={p}
                x={s.x}
                base={1420}
                w={250}
                stripes={s.st}
                arrange={interpolate(frame, [CH1_S6_BEATS.stalls[i], sec(4) + i * 14], [0, 1], clamp)}
                seed={i * 13 + 5}
                flutter={frame / 11 + i * 1.7}
              />
            ))
          }
        />
        <PaperLayer
          depth={0.8}
          shadow={20}
          render={(p) => (
            <g>
              <rect x={-400} y={1500} width={1900} height={900} fill={p("#9a6c44")} />
              <Caravan p={p} x={1300} y={1580} n={4} gap={200} walk={frame * 1.6} s={0.95} color="#5a3a22" load="#2e4a7a" dir={-1} />
            </g>
          )}
        />
        <PaperLayer
          depth={1.25}
          shadow={26}
          shadowOpacity={0.7}
          render={(p) => (
            <g>
              <Palm p={p} x={-10} base={1900} h={620} lean={0.12} color="#2a2018" seed={71} sway={Math.sin(frame / 40) * 5} />
              <path d="M820 2400 L820 1760 q60 -60 120 -20 q40 -60 110 -10 q60 -30 120 30 L1500 2400 Z" fill={p("#3a2414")} />
              <path d="M860 1780 q-30 -70 0 -110 q30 40 0 110 Z M960 1760 q-34 -80 4 -120 q34 46 -4 120 Z" fill={p("#7a4a2a")} />
            </g>
          )}
        />
        <Dust seed={611} count={40} area={{ x: -100, y: 1000, w: 1300, h: 800 }} color="#fff0c8" size={2.4} rise={0.2} depth={0.7} opacity={0.6} />
      </CinematicCamera>
      <ScrollCaption lines={["MEMBESAR DI BAWAH JAGAAN ABU TALIB."]} start={T.scroll1} end={sec(6.6)} top={200} size={40} />
      <ScrollCaption lines={["MAKKAH: PUSAT PERDAGANGAN", "DAN PERSINGGAHAN KAFILAH."]} start={T.scroll2} end={sec(12.2)} top={200} size={40} />
      {/* map card: the trade routes north to al-Sham and south to Yemen */}
      {unfold > 0 && frame <= end ? (
        <div
          style={{
            position: "absolute",
            left: CARD.x,
            top: CARD.y,
            width: CARD.w,
            height: CARD.h,
            opacity: 1 - cardExit,
            clipPath: `inset(${(1 - unfold) * 50}% 0 ${(1 - unfold) * 50}% 0)`,
            transform: `translateY(${-cardExit * 20}px) scaleY(${interpolate(unfold, [0, 1], [1.06, 1])})`,
            boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
          }}
        >
          <PageSurface w={CARD.w} h={CARD.h}>
            <svg width={CARD.w} height={CARD.h} style={{ position: "absolute", inset: 0, filter: "drop-shadow(1px 2px 1.5px rgba(60,30,10,0.35))" }}>
              <MapShapes p={(c) => c} proj={proj} k={MAP_K} />
              <MapRoute proj={proj} via={[PLACES.makkah, [39.4, 23.5], PLACES.yathrib, [38.0, 27.5], [36.8, 30.5], PLACES.syam]} t={routeT(T.routes)} width={6} icon="camel" />
              <MapRoute proj={proj} via={[PLACES.makkah, [41.0, 19.5], [42.8, 17.0], PLACES.yaman]} t={routeT(T.routes + 20)} width={6} color="#2e4378" icon="camel" />
              <MapMarker proj={proj} ll={PLACES.makkah} at={CH1_S6_BEATS.markers[0]} ar="مكة" ms="MAKKAH" k={MAP_K} side="left" scale={1.1} />
              <MapMarker proj={proj} ll={PLACES.syam} at={CH1_S6_BEATS.markers[1]} ar="الشام" ms="SYAM" k={MAP_K} scale={1.1} />
              <MapMarker proj={proj} ll={PLACES.yaman} at={CH1_S6_BEATS.markers[2]} ar="اليمن" ms="YAMAN" k={MAP_K} scale={1.1} color="#2e4378" />
            </svg>
            <div style={{ position: "absolute", left: 0, right: 0, top: 735, textAlign: "center", opacity: verse }}>
              <div dir="rtl" lang="ar" style={{ fontFamily: arabicStack, fontWeight: 700, fontSize: 52, lineHeight: 1.7, color: C.ink, ...rtlSweepMask(verse) }}>
                {QURAYSH_106_2}
              </div>
              <div style={{ fontFamily: latinStack, fontStyle: "italic", fontWeight: 600, fontSize: 29, color: C.inkSoft, padding: "0 50px" }}>
                “…kebiasaan mereka mengembara pada musim sejuk dan musim panas.”
              </div>
              <div style={{ fontFamily: latinStack, fontWeight: 700, fontSize: 24, letterSpacing: "0.1em", color: C.goldDeep, marginTop: 4 }}>SURAH QURAISY 106:2</div>
            </div>
          </PageSurface>
          <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 40%, rgba(60,35,10,${0.45 * (1 - unfold)}) 50%, transparent 60%)` }} />
        </div>
      ) : null}
      <ScrollCaption
        lines={["Menurut riwayat sirah, Baginda pernah", "mengikuti kafilah Abu Talib ke Syam."]}
        sub="Riwayat al-Tirmidhi dan kitab-kitab sirah · tiada butiran tambahan dipaparkan"
        start={T.syam}
        end={end}
        top={1440}
        size={36}
        subSize={24}
      />
      <IllustrationNote start={T.scroll1} end={T.map} />
      <Grade warmth={0.1} />
      <PaperOverlay />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
