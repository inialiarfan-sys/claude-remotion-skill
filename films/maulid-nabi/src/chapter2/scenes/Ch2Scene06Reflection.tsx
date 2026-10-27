import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { theme } from "../../theme";
import { CinematicCamera } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer } from "../../components/PaperLayer";
import { Dust, Glow, Grade, Grain, PaperOverlay, Stars, Vignette } from "../../components/Atmosphere";
import { House, Palm } from "../../components/Architecture";
import { Kaaba } from "../../components/Props";
import { PageSurface } from "../../components/Book";
import { ArabicTitle } from "../../components/ArabicTitle";
import { InkCaption } from "../../components/WorldCaption";
import { dunePath, ridgePath } from "../../components/shapes";
import { clamp } from "../../components/textMotion";
import { sec } from "../../timeline";
import { AL_QALAM_68_4 } from "../verses";

const C = theme.colors;
const T = {
  verse: sec(2.5),
  verseMs: sec(4.4),
  verseRef: sec(6.0),
  verseEnd: sec(11.6),
  values: sec(12.2),
  onward: sec(15.4),
  valuesEnd: sec(18.6),
  sources: sec(19.0),
  sourcesEnd: sec(29.6),
  more: sec(30.2),
  next: sec(31.0),
};
const VALUES = ["AMANAH", "KEJUJURAN", "AKHLAK MULIA"];
const VALUE_AT = (i: number) => T.values + i * 26;
export const CH2_S6_BEATS = { ...T, valueAt: VALUES.map((_, i) => VALUE_AT(i)) };

const SRC = { x: 70, y: 300, w: 940, h: 1260 };
const SOURCES: { title: string; detail: string[] }[] = [
  { title: "Al-Quran, Surah Al-Qalam 68:4", detail: ["Teks Uthmani: quranenc.com"] },
  { title: "Sahih al-Bukhari, no. 2262", detail: ["Hadis mengembala kambing"] },
  { title: "Sunan al-Tirmidhi", detail: ["Riwayat perjalanan ke Syam —", "sebahagian butiran dipertikaikan"] },
  { title: "Sirah Ibn Hisham (riwayat Ibn Ishaq)", detail: ["Jagaan Abu Talib; gelaran al-Amin"] },
];

// the closing sources page, its lines inked one after another
const SourcesPage: React.FC = () => {
  let y = 200;
  return (
    <>
      <InkCaption lines={["SUMBER & RUJUKAN"]} start={T.sources + 24} top={90} width={SRC.w} size={42} tracking={0.2} color={C.goldDeep} per={20} />
      <svg width={SRC.w} height={30} style={{ position: "absolute", left: 0, top: 150 }}>
        <line x1={250} y1={15} x2={450} y2={15} stroke={C.goldDeep} strokeWidth={1.5} />
        <line x1={490} y1={15} x2={690} y2={15} stroke={C.goldDeep} strokeWidth={1.5} />
        <path d="M470 7 L478 15 L470 23 L462 15 Z" fill={C.gold} />
      </svg>
      {SOURCES.map((s, i) => {
        const at = T.sources + 40 + i * 30;
        const top = y;
        y += 64 + s.detail.length * 40 + 44;
        return (
          <div key={i}>
            <InkCaption lines={[s.title]} start={at} top={top} left={90} width={800} size={38} align="left" tracking={0.01} per={22} />
            <InkCaption lines={s.detail} start={at + 12} top={top + 56} left={90} width={800} size={30} italic weight={600} align="left" tracking={0.01} color={C.inkSoft} per={20} lineHeight={1.3} />
          </div>
        );
      })}
      <InkCaption
        lines={["Babak tanpa rujukan khusus ialah ilustrasi", "suasana, bukan rakaman peristiwa sebenar."]}
        start={T.sources + 170}
        top={SRC.h - 220}
        width={SRC.w}
        size={28}
        italic
        weight={600}
        tracking={0.01}
        color={C.inkSoft}
        per={24}
      />
    </>
  );
};

export const Ch2Scene06Reflection: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // night over the valley; the first light of dawn slowly gathers on the horizon
  const dawn = interpolate(frame, [sec(4), sec(32)], [0, 1], { ...clamp, easing: theme.ease.soft });
  const sky = (a: string, b: string) => interpolateColors(dawn, [0, 1], [a, b]);
  const unfold = interpolate(frame, [T.sources, T.sources + 28], [0, 1], { ...clamp, easing: theme.ease.out });
  const fold = interpolate(frame, [T.sourcesEnd - 20, T.sourcesEnd], [1, 0], { ...clamp, easing: theme.ease.in });
  const page = Math.min(unfold, fold);
  const fadeOut = interpolate(frame, [dur - 36, dur], [0, 1], { ...clamp, easing: theme.ease.in });
  const half = SRC.h / 2;

  return (
    <AbsoluteFill style={{ background: C.void }}>
      {/* a slow crane up from the sleeping town into the sky */}
      <CinematicCamera
        keys={[
          { f: 0, x: 0, y: 220, zoom: 1.1 },
          { f: sec(18), x: 0, y: -160, zoom: 1.0 },
          { f: dur, x: 0, y: -220, zoom: 0.98 },
        ]}
        drift={0.4}
      >
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky("#040818", "#141c44")} 0%, ${sky("#0b1433", "#3a3a6a")} 40%, ${sky("#1a1a3a", "#a05a5a")} 58%, ${sky("#242040", "#e8955a")} 66%)` }} />
        <Stars seed={2601} count={240} top={-500} bottom={1000} opacity={1 - dawn * 0.6} spin={0.02} />
        <Glow x={620} y={1100} r={700} color="#f0a060" opacity={dawn * 0.5} depth={0.08} />
        <PaperLayer depth={0.12} shadow={10} rim={`rgba(250,190,150,${dawn * 0.4})`} render={(p) => <path d={ridgePath(2603, { x0: -420, x1: 1500, base: 1110, amp: 360, peaks: 5, bottom: 1600 })} fill={p(sky("#141428", "#3a2a40"))} />} />
        <PaperLayer
          depth={0.32}
          shadow={12}
          render={(p) => (
            <g>
              <path d={dunePath(2605, { x0: -420, x1: 1500, base: 1230, amp: 12, waves: 0.8, bottom: 1700 })} fill={p(sky("#16121c", "#2a1e26"))} />
              {[[-200, 160, 90], [-20, 130, 120], [130, 120, 80], [520, 140, 100], [700, 160, 130], [900, 150, 90], [1080, 170, 110]].map(([x, w, h], i) => (
                <House key={i} p={p} x={x} base={1226} w={w} h={h} body={sky("#2a2026", "#4a3436")} shade={sky("#1a141a", "#2e2226")} dark="#0e0a0c" lamp={C.lamp} seed={2610 + i} lit={0.35} />
              ))}
              <Kaaba p={p} x={340} base={1228} w={110} h={92} />
            </g>
          )}
        />
        <PaperLayer
          depth={0.6}
          shadow={18}
          render={(p) => (
            <g>
              <Palm p={p} x={60} base={1420} h={360} lean={0.12} color={sky("#0c0a10", "#1a1216")} seed={2627} />
              <Palm p={p} x={990} base={1430} h={420} lean={-0.1} color={sky("#0c0a10", "#1a1216")} seed={2629} />
            </g>
          )}
        />
        <PaperLayer depth={0.6} shadow={18} render={(p) => <path d={ridgePath(2621, { x0: -420, x1: 1500, base: 1440, amp: 120, peaks: 3, bottom: 2000, rough: 0.2 })} fill={p(sky("#100c14", "#22161c"))} />} />
        <PaperLayer depth={1.15} shadow={26} shadowOpacity={0.7} render={(p) => <path d={dunePath(2623, { x0: -420, x1: 1500, base: 1760, amp: 50, waves: 0.6, bottom: 2400 })} fill={p("#0c080a")} />} />
        <Dust seed={2625} count={30} area={{ x: -100, y: 300, w: 1300, h: 1200 }} color="#fff0c8" size={2.2} rise={0.15} depth={0.5} opacity={0.5} />
      </CinematicCamera>
      {/* the Qur'anic verse in gold */}
      <ArabicTitle text={AL_QALAM_68_4} start={T.verse} end={T.verseEnd} top={360} size={86} maxWidth={980} revealLen={56} />
      <InkCaption lines={["“Dan sesungguhnya engkau benar-benar", "berbudi pekerti yang agung.”"]} start={T.verseMs} end={T.verseEnd} top={570} size={40} italic weight={600} tracking={0.01} color={C.parchmentLight} shadow per={30} />
      <InkCaption lines={["SURAH AL-QALAM 68:4"]} start={T.verseRef} end={T.verseEnd} top={700} size={28} tracking={0.16} color={C.goldLight} shadow per={18} />
      {/* the qualities this chapter has shown */}
      {VALUES.map((v, i) => (
        <InkCaption key={v} lines={[v]} start={VALUE_AT(i)} end={T.valuesEnd} top={350 + i * 90} size={58} tracking={0.22} color={C.goldLight} shadow per={18} />
      ))}
      <InkCaption lines={["Perjalanan Baginda menuju", "satu amanah yang lebih besar…"]} start={T.onward} end={T.valuesEnd} top={680} size={42} italic weight={600} tracking={0.01} color={C.parchmentLight} shadow per={30} />
      {page > 0 ? (
        <AbsoluteFill style={{ clipPath: `inset(${SRC.y + (1 - page) * half}px 0 ${1920 - SRC.y - SRC.h + (1 - page) * half}px 0)` }}>
          <PageSurface w={SRC.w} h={SRC.h} style={{ left: SRC.x, top: SRC.y, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
            <SourcesPage />
          </PageSurface>
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, transparent ${(SRC.y / 1920) * 100}%, rgba(60,35,10,${0.5 * (1 - page)}) ${((SRC.y + half) / 1920) * 100}%, transparent ${((SRC.y + SRC.h) / 1920) * 100}%)`,
            }}
          />
        </AbsoluteFill>
      ) : null}
      <InkCaption lines={["BERSAMBUNG..."]} start={T.more} top={820} size={62} tracking={0.2} color={C.parchmentLight} shadow per={28} />
      <InkCaption lines={["BAB 3"]} start={T.next} top={920} size={44} tracking={0.3} color={C.goldLight} shadow per={16} />
      <Grade warmth={0.08} />
      <PaperOverlay opacity={0.24} />
      <Grain />
      <Vignette strength={0.6} />
      <AbsoluteFill style={{ background: "#000", opacity: fadeOut }} />
    </AbsoluteFill>
  );
};
