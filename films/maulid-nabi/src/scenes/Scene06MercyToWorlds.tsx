import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { latinStack, theme } from "../theme";
import { CinematicCamera } from "../components/CinematicCamera";
import { DepthFill, PaperLayer } from "../components/PaperLayer";
import { Dust, Glow, Grade, Grain, LightBeam, PaperOverlay, Vignette } from "../components/Atmosphere";
import { Palm } from "../components/Architecture";
import { dunePath, ridgePath } from "../components/shapes";
import { ArabicTitle } from "../components/ArabicTitle";
import { MalaySubtitle } from "../components/MalaySubtitle";
import { clamp } from "../components/textMotion";
import { sec } from "../timeline";

const C = theme.colors;

// Al-Anbiya' 21:107 in Uthmani script. Source text: The Noble Qur'an Encyclopedia
// (quranenc.com, via the quran-json dataset). Its KFGQPC-specific marks are mapped to
// standard Unicode (U+06E1 → sukun U+0652, U+0657 → fathatan U+064B) so that a
// general Arabic font renders them correctly; letters and vowels are unchanged.
export const VERSE_21_107 = "وَمَآ أَرْسَلْنَٰكَ إِلَّا رَحْمَةً لِّلْعَٰلَمِينَ";
export const VERSE_21_107_MS =
  "Dan tidaklah Kami mengutuskan engkau (wahai Muhammad), melainkan untuk menjadi rahmat bagi sekalian alam.";

export const Scene06MercyToWorlds: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dawn = interpolate(frame, [0, sec(8)], [0, 1], { ...clamp, easing: theme.ease.soft });
  const col = (a: string, b: string) => interpolateColors(dawn, [0, 1], [a, b]);
  const sunY = interpolate(frame, [0, dur], [1260, 1010], { ...clamp, easing: theme.ease.out });

  const verseStart = sec(2.2);
  const verseEnd = dur - 40;
  const panel = spring({ frame: frame - verseStart + 8, fps, config: theme.spring.gentle });
  const panelExit = interpolate(frame, [verseEnd - 12, verseEnd], [0, 1], { ...clamp, easing: theme.ease.in });

  return (
    <AbsoluteFill>
      <CinematicCamera
        keys={[
          { f: 0, x: -70, y: 0, zoom: 1.04 },
          { f: dur, x: 80, y: 30, zoom: 1.14 },
        ]}
      >
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${col("#0d1533", C.dawnTop)} 0%, ${col("#26305e", "#6b5a8a")} 34%, ${col("#5a4a72", C.dawnMid)} 55%, ${col("#8a5a5a", C.dawnLow)} 66%)`,
          }}
        />
        <Glow x={540} y={sunY} r={760} color="#ffcf7a" opacity={0.25 + dawn * 0.55} depth={0.08} />
        {[-38, -18, 4, 24, 44].map((a, i) => (
          <LightBeam key={i} x={540} y={sunY} angle={180 + a} width={260} length={1500} color="#ffe3a1" opacity={dawn * 0.13} depth={0.08} />
        ))}
        <DepthFill depth={0.08}>
          <div
            style={{
              position: "absolute",
              left: 540 - 95,
              top: sunY - 95,
              width: 190,
              height: 190,
              borderRadius: "50%",
              background: `radial-gradient(circle, #fff6d8 0%, ${C.sun} 60%, #ffc76a 100%)`,
              boxShadow: "0 0 80px 30px rgba(255,210,130,0.45)",
            }}
          />
        </DepthFill>
        {/* thin paper clouds catching the first light */}
        <PaperLayer
          depth={0.1}
          shadow={8}
          texture={0.4}
          render={(p) => (
            <g transform={`translate(${frame * 0.3} 0)`}>
              <path d="M-300 1010 Q-120 980 60 1000 Q200 985 320 1004 L320 1016 Q100 1010 -300 1020 Z" fill={p(col("#5a4a72", "#f2a77a"))} />
              <path d="M600 930 Q760 905 920 925 Q1060 912 1200 930 L1200 942 Q900 938 600 944 Z" fill={p(col("#5a4a72", "#f6b98a"))} />
            </g>
          )}
        />
        {/* birds crossing the dawn */}
        <PaperLayer
          depth={0.25}
          shadow={4}
          texture={0}
          render={(p) => (
            <g>
              {[0, 1, 2, 3, 4].map((i) => {
                const x = 1250 - (frame * (2.1 + i * 0.25) + i * 70) + (i % 2) * 40;
                const y = 960 + i * 26 + Math.sin(frame / 18 + i) * 8;
                const flap = Math.sin(frame / 3.2 + i * 1.3) * 9;
                return <path key={i} d={`M${x - 16} ${y - flap} Q${x - 6} ${y - 4} ${x} ${y} Q${x + 6} ${y - 4} ${x + 16} ${y - flap} L${x} ${y + 3} Z`} fill={p("#2b2030")} />;
              })}
            </g>
          )}
        />
        <PaperLayer
          depth={0.14}
          shadow={10}
          rim={`rgba(255,220,160,${0.2 + dawn * 0.4})`}
          render={(p) => <path d={ridgePath(71, { x0: -420, x1: 1500, base: 1180, amp: 300, peaks: 5, bottom: 1600 })} fill={p(col("#2a2f58", "#8a5a6a"))} />}
        />
        <PaperLayer
          depth={0.28}
          shadow={14}
          rim={`rgba(255,215,150,${0.2 + dawn * 0.45})`}
          render={(p) => <path d={ridgePath(73, { x0: -420, x1: 1500, base: 1290, amp: 260, peaks: 4, bottom: 1700 })} fill={p(col("#232648", "#6a4050"))} />}
        />
        <PaperLayer
          depth={0.5}
          shadow={16}
          rim={`rgba(255,205,140,${0.25 + dawn * 0.5})`}
          render={(p) => <path d={dunePath(75, { x0: -420, x1: 1500, base: 1430, amp: 70, waves: 1.3, bottom: 1900 })} fill={p(col("#3a2c3a", C.sandDeep))} />}
        />
        <PaperLayer
          depth={0.72}
          shadow={18}
          rim={`rgba(255,215,150,${0.3 + dawn * 0.5})`}
          render={(p) => <path d={dunePath(77, { x0: -420, x1: 1500, base: 1560, amp: 80, waves: 1.0, bottom: 2100 })} fill={p(col("#4a3438", C.sand))} />}
        />
        <Dust seed={88} count={36} area={{ x: -200, y: 1250, w: 1500, h: 600 }} color="#ffe2a6" size={2.6} rise={0.3} depth={0.8} opacity={0.4 + dawn * 0.5} />
        <PaperLayer
          depth={1.0}
          shadow={22}
          rim={`rgba(255,225,160,${0.35 + dawn * 0.5})`}
          render={(p) => (
            <g>
              <path d={dunePath(79, { x0: -420, x1: 1500, base: 1700, amp: 70, waves: 0.8, bottom: 2300 })} fill={p(col("#3a2a2c", C.sandDeep))} />
              <Palm p={p} x={930} base={1700} h={380} lean={-0.12} color={col("#1a1418", "#3a2416")} seed={31} sway={Math.sin(frame / 40) * 5} />
            </g>
          )}
        />
        <PaperLayer
          depth={1.3}
          shadow={28}
          shadowOpacity={0.7}
          render={(p) => <path d={dunePath(81, { x0: -420, x1: 1500, base: 1860, amp: 60, waves: 0.6, bottom: 2500 })} fill={p(col("#20171a", C.sandShadow))} />}
        />
      </CinematicCamera>

      {/* verse cartouche: dark lapis glass with gilt frame, for legibility over the bright sky */}
      {frame >= verseStart - 8 && frame <= verseEnd ? (
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 330,
            width: 960,
            height: 545,
            opacity: Math.min(1, panel * 1.3) * (1 - panelExit),
            transform: `translateY(${interpolate(panel, [0, 1], [30, 0]) - panelExit * 18}px)`,
            clipPath: `inset(0 ${(1 - panel) * 50}% 0 ${(1 - panel) * 50}% round 18px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(12,18,48,0.78), rgba(18,22,56,0.72))",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            }}
          />
          <div style={{ position: "absolute", inset: 14, border: `2px solid ${C.gold}`, borderRadius: 10, opacity: 0.85 }} />
          <div style={{ position: "absolute", inset: 22, border: `1px solid ${C.goldDeep}`, borderRadius: 6, opacity: 0.7 }} />
          <ArabicTitle text={VERSE_21_107} start={verseStart} end={verseEnd} top={46} size={78} maxWidth={860} lineHeight={2.0} revealLen={60} />
          <MalaySubtitle
            text={VERSE_21_107_MS}
            start={verseStart + 50}
            end={verseEnd}
            top={232}
            size={42}
            weight={500}
            italic
            tracking={0.01}
            maxWidth={820}
            color={C.parchmentLight}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 470,
              textAlign: "center",
              fontFamily: latinStack,
              fontWeight: 600,
              fontSize: 32,
              letterSpacing: "0.08em",
              color: C.goldLight,
              opacity: interpolate(frame, [verseStart + 90, verseStart + 110], [0, 1], clamp),
            }}
          >
            Surah Al-Anbiya' (21): 107
          </div>
        </div>
      ) : null}
      <Grade warmth={0.14} />
      <PaperOverlay />
      <Grain />
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};
