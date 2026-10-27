import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { PAPER_TEXTURE } from "../../assets";
import { theme } from "../../theme";
import { CinematicCamera, type CamKey } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer } from "../../components/PaperLayer";
import { Dust, Grade, Grain, PaperOverlay, Vignette } from "../../components/Atmosphere";
import { Sheep } from "../../components/Props";
import { ArabicTitle } from "../../components/ArabicTitle";
import { InkCaption, ScrollCaption } from "../../components/WorldCaption";
import { IllustrationNote } from "../../components/IllustrationNote";
import { dunePath, ridgePath } from "../../components/shapes";
import { clamp } from "../../components/textMotion";
import { sec } from "../../timeline";
import { Acacia, Staff, WaterSkin } from "../props";

const C = theme.colors;
const T = { cap1: sec(1.6), cap1End: sec(7.6), cap2: sec(8.0), cap2End: sec(14.2), track: sec(11.0), push: sec(14.4), card: sec(14.6) };
export const CH2_S3_BEATS = { ...T, bleats: [sec(2.4), sec(6.2), sec(10.4), sec(17.0)] };

// opening words of Sahih al-Bukhari 2262 (Kitab al-Ijarah) — see RESEARCH-BAB2.md
const HADITH_AR = "مَا بَعَثَ اللَّهُ نَبِيًّا إِلَّا رَعَى الْغَنَمَ";

const STAFF = { x: 800, base: 1630, len: 420, depth: 0.85 };
const camKeys = (dur: number): CamKey[] => {
  const zoom = 1.45;
  const s = 1 + (zoom - 1) * STAFF.depth;
  const py = STAFF.base - STAFF.len * 0.6;
  return [
    { f: 0, x: -220, y: 20, zoom: 1.08 },
    { f: T.track, x: 160, y: 20, zoom: 1.1 },
    { f: T.push, x: (s * (STAFF.x + 40 - 540)) / STAFF.depth, y: (s * (py - 960) - 330) / STAFF.depth, zoom },
    { f: dur, x: (s * (STAFF.x + 40 - 540)) / STAFF.depth + 20, y: (s * (py - 960) - 330) / STAFF.depth + 10, zoom: zoom + 0.04 },
  ];
};

const FLOCK = Array.from({ length: 11 }, (_, i) => ({
  x: -260 + i * 140 + ((i * 53) % 60),
  y: 1350 + ((i * 37) % 3) * 44,
  s: 0.9 + ((i * 29) % 5) * 0.06,
  flip: i % 3 === 0,
}));

export const Ch2Scene03Shepherd: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // dawn brightens into morning over the pasture
  const m = interpolate(frame, [0, dur], [0, 1], { ...clamp, easing: theme.ease.soft });
  const tone = (a: string, b: string) => interpolateColors(m, [0, 1], [a, b]);
  const card = interpolate(frame, [T.card, T.card + 22], [0, 1], { ...clamp, easing: theme.ease.out });
  const cardOut = interpolate(frame, [dur - 24, dur - 6], [1, 0], { ...clamp, easing: theme.ease.in });
  const open = Math.min(card, cardOut);

  return (
    <AbsoluteFill style={{ background: C.void }}>
      <CinematicCamera keys={camKeys(dur)} drift={0.6}>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${tone("#3a4a7a", "#5a86b8")} 0%, ${tone("#c08a7a", "#c9d6d8")} 45%, ${tone("#f6b25e", "#f6e2b8")} 62%)` }} />
        <DepthFill depth={0.05}>
          <div
            style={{
              position: "absolute",
              left: 760 - 70,
              top: interpolate(m, [0, 1], [1040, 820]) - 70,
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "radial-gradient(circle, #fff6d8, #ffd27a 70%)",
              boxShadow: "0 0 110px 50px rgba(255,210,130,0.45)",
            }}
          />
        </DepthFill>
        <PaperLayer depth={0.12} shadow={10} rim="rgba(255,220,170,0.35)" render={(p) => <path d={ridgePath(2301, { x0: -420, x1: 1500, base: 1080, amp: 300, peaks: 5, bottom: 1500 })} fill={p(tone("#7a5a6a", "#8a8090"))} />} />
        <PaperLayer
          depth={0.3}
          shadow={12}
          rim="rgba(255,220,170,0.35)"
          render={(p) => (
            <g>
              <path d={ridgePath(2303, { x0: -420, x1: 1500, base: 1230, amp: 150, peaks: 3, bottom: 1700, rough: 0.2 })} fill={p(tone("#8a5a40", "#a87a52"))} />
              <Acacia p={p} x={120} base={1150} s={0.7} color={tone("#3a3020", "#4a4a28")} />
              <Acacia p={p} x={980} base={1170} s={0.85} color={tone("#3a3020", "#4a4a28")} />
            </g>
          )}
        />
        {/* the pasture: a small flock grazing among the scrub */}
        <PaperLayer
          depth={0.55}
          shadow={14}
          render={(p) => (
            <g>
              <path d={dunePath(2305, { x0: -420, x1: 1500, base: 1330, amp: 24, waves: 0.8, bottom: 1900 })} fill={p(tone("#9a6a40", "#b8885a"))} />
              {[40, 380, 720, 1180].map((x, i) => (
                <path key={i} d={`M${x - 50} ${1340 + i * 12} q12 -50 24 -8 q10 -54 24 -6 q14 -50 26 -2 q12 -40 22 16 Z`} fill={p(tone("#4a4a2a", "#6a7a3a"))} />
              ))}
              {FLOCK.map((s, i) => {
                const graze = Math.max(0, Math.min(1, Math.sin(frame / 26 + i * 1.7) * 1.6));
                return <Sheep key={i} p={p} x={s.x + frame * 0.12 * (s.flip ? -1 : 1)} y={s.y} s={s.s} flip={s.flip} graze={graze} />;
              })}
            </g>
          )}
        />
        {/* the shepherd's things on a rock: staff, water skin, folded cloth — no figure */}
        <PaperLayer
          depth={STAFF.depth}
          shadow={22}
          shadowOpacity={0.6}
          rim="rgba(255,230,180,0.4)"
          render={(p) => (
            <g>
              <path d={dunePath(2307, { x0: -420, x1: 1500, base: 1600, amp: 30, waves: 0.6, bottom: 2200 })} fill={p(tone("#8a5a36", "#a8784a"))} />
              <path d="M600 1660 Q590 1560 680 1540 Q800 1520 900 1560 Q960 1600 950 1660 Z" fill={p(tone("#5a4434", "#7a6250"))} />
              <Staff p={p} x={STAFF.x} base={STAFF.base} len={STAFF.len} lean={10} />
              <WaterSkin p={p} x={680} y={1500} s={0.7} />
              <path d="M840 1556 L930 1552 L940 1576 L846 1580 Z" fill={p("#8a3b2a")} />
              <path d="M846 1566 L936 1562" stroke={p(C.goldLight)} strokeWidth={3} opacity={0.6} />
            </g>
          )}
        />
        <Dust seed={2309} count={36} area={{ x: -100, y: 1000, w: 1300, h: 800 }} color="#ffe2a6" size={2.4} rise={0.15} depth={0.7} opacity={0.7} />
        <PaperLayer
          depth={1.25}
          shadow={26}
          shadowOpacity={0.7}
          render={(p) => (
            <g>
              <path d={dunePath(2311, { x0: -420, x1: 1500, base: 1860, amp: 40, waves: 0.7, bottom: 2600 })} fill={p("#3a2214")} />
              {[-80, 260, 1000].map((x, i) => (
                <path key={i} d={`M${x - 70} ${1860} q14 -90 34 -14 q12 -100 34 -10 q18 -96 36 -4 q16 -70 30 28 Z`} fill={p("#2a2414")} />
              ))}
            </g>
          )}
        />
      </CinematicCamera>
      <ScrollCaption lines={["Mengembala kambing: pekerjaan", "biasa masyarakat Arab ketika itu"]} sub="Konteks umum · ilustrasi suasana" start={T.cap1} end={T.cap1End} top={220} size={40} />
      <ScrollCaption
        lines={["Baginda pernah mengembala kambing", "untuk penduduk Makkah dengan", "upah beberapa qirat."]}
        sub="Sahih al-Bukhari"
        start={T.cap2}
        end={T.cap2End}
        top={220}
        size={40}
      />
      {/* the hadith itself, on a parchment card, with its reference */}
      {open > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 200,
            width: 960,
            height: 500,
            clipPath: `inset(${(1 - open) * 50}% 0 ${(1 - open) * 50}% 0)`,
            background: `linear-gradient(180deg, ${C.parchmentLight}, ${C.parchment} 60%, ${C.parchmentDark})`,
            borderRadius: 8,
            boxShadow: "0 20px 44px rgba(0,0,0,0.5)",
          }}
        >
          <AbsoluteFill style={{ backgroundImage: `url(${PAPER_TEXTURE})`, backgroundSize: "512px", mixBlendMode: "multiply", opacity: 0.8 }} />
          <div style={{ position: "absolute", inset: 14, border: `2px solid ${C.goldDeep}`, borderRadius: 4, opacity: 0.8 }} />
          <ArabicTitle text={HADITH_AR} start={T.card + 18} top={40} size={66} tone="ink" shadow={false} maxWidth={900} lineHeight={1.7} revealLen={50} />
          <InkCaption lines={["“Allah tidak mengutus seorang nabi pun", "melainkan dia pernah mengembala kambing.”"]} start={T.card + 64} top={200} width={960} size={36} italic weight={600} tracking={0.01} color={C.inkSoft} per={30} />
          <svg width={960} height={30} style={{ position: "absolute", left: 0, top: 330, opacity: interpolate(frame, [T.card + 110, T.card + 130], [0, 1], clamp) }}>
            <line x1={260} y1={15} x2={460} y2={15} stroke={C.goldDeep} strokeWidth={1.5} />
            <line x1={500} y1={15} x2={700} y2={15} stroke={C.goldDeep} strokeWidth={1.5} />
            <path d="M480 7 L488 15 L480 23 L472 15 Z" fill={C.gold} />
          </svg>
          <InkCaption lines={["SAHIH AL-BUKHARI, NO. 2262"]} start={T.card + 120} top={380} width={960} size={30} tracking={0.14} color={C.goldDeep} per={20} />
        </div>
      ) : null}
      <IllustrationNote start={30} end={dur - 30} top={1760} />
      <Grade warmth={0.1} />
      <PaperOverlay />
      <Grain />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};
