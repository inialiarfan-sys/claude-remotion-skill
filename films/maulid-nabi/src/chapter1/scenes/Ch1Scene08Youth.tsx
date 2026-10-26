import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { arabicStack, theme } from "../../theme";
import { CinematicCamera } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer } from "../../components/PaperLayer";
import { Dust, Glow, Grade, Grain, PaperOverlay, Sky, Vignette } from "../../components/Atmosphere";
import { BalanceScale, Caravan } from "../../components/Props";
import { PageSurface } from "../../components/Book";
import { InkCaption, ScrollCaption } from "../../components/WorldCaption";
import { IllustrationNote } from "../../components/IllustrationNote";
import { dunePath, ridgePath } from "../../components/shapes";
import { clamp, rtlSweepMask } from "../../components/textMotion";
import { sec } from "../../timeline";

const C = theme.colors;
const T = { page: sec(9.0), dropL: sec(9.0) + 26, dropR: sec(9.0) + 56, word: sec(11.6), caption: sec(12.6), back: sec(17.6) };
const DROP = { damping: 14, stiffness: 120, mass: 1 };
export const CH1_S8_BEATS = { ...T, landL: T.dropL + 9, landR: T.dropR + 9 };

const Desert: React.FC<{ dur: number; frame: number }> = ({ dur, frame }) => {
  const route = interpolate(frame, [sec(0.6), sec(5)], [0, 1], { ...clamp, easing: theme.ease.inOut });
  return (
    // tracking with the middle caravan, then a pull-back as the caravans head for the horizon
    <CinematicCamera keys={[{ f: 0, x: -120, y: 0, zoom: 1.12 }, { f: sec(9), x: 240, y: 20, zoom: 1.04 }, { f: T.back, x: 250, y: 20, zoom: 1.04 }, { f: dur, x: 260, y: -10, zoom: 0.97 }]}>
      <Sky stops={[["#3a3a6a", 0], ["#b06a5a", 45], ["#f2a85a", 64], ["#ffd890", 72]]} glow={{ x: 760, y: 1120, r: 700, color: "rgba(255,200,120,0.55)" }} />
      <DepthFill depth={0.06}>
        <div style={{ position: "absolute", left: 760 - 90, top: 1060 - 90, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, #fff1c8, #ffc46a 70%)", boxShadow: "0 0 100px 50px rgba(255,190,110,0.45)" }} />
      </DepthFill>
      <PaperLayer depth={0.12} shadow={10} rim="rgba(255,220,160,0.4)" render={(p) => <path d={ridgePath(801, { x0: -420, x1: 1500, base: 1170, amp: 200, peaks: 6, bottom: 1600 })} fill={p("#7a4a5a")} />} />
      <PaperLayer
        depth={0.3}
        shadow={12}
        rim="rgba(255,210,150,0.45)"
        render={(p) => (
          <g>
            <path d={dunePath(803, { x0: -420, x1: 1500, base: 1290, amp: 40, waves: 1.4, bottom: 1800 })} fill={p("#a0603a")} />
            <Caravan p={p} x={1400} y={1300} n={6} gap={92} walk={frame * 0.9} s={0.42} color="#3a1e14" load="#5a2a1a" dir={-1} />
          </g>
        )}
      />
      {/* an ancient trade route traced across the sand, labelled where it runs */}
      <DepthFill depth={0.45}>
        <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
          <path
            d="M-300 1500 C100 1380 300 1520 560 1430 S1000 1360 1400 1420"
            pathLength={1}
            fill="none"
            stroke={C.goldLight}
            strokeWidth={5}
            strokeDasharray="0.012 0.01"
            opacity={0.85 * route}
            style={{ clipPath: `inset(0 ${(1 - route) * 100}% 0 0)` }}
          />
        </svg>
        <InkCaption lines={["Laluan kafilah merentasi Jazirah Arab"]} start={sec(1.4)} end={sec(8.6)} top={1290} left={140} width={1080} size={46} italic weight={600} tracking={0.01} color={C.parchmentLight} shadow per={30} />
      </DepthFill>
      <PaperLayer
        depth={0.6}
        shadow={16}
        rim="rgba(255,210,150,0.5)"
        render={(p) => (
          <g>
            <path d={dunePath(805, { x0: -420, x1: 1500, base: 1470, amp: 60, waves: 1, bottom: 2000 })} fill={p("#b8703e")} />
            <Caravan p={p} x={-200} y={1490} n={4} gap={150} walk={frame * 1.3} s={0.68} color="#3a1e14" load="#2e4a7a" />
          </g>
        )}
      />
      <PaperLayer
        depth={1.0}
        shadow={22}
        rim="rgba(255,220,160,0.5)"
        render={(p) => (
          <g>
            <path d={dunePath(807, { x0: -420, x1: 1500, base: 1700, amp: 70, waves: 0.7, bottom: 2300 })} fill={p("#8a4a28")} />
            <Caravan p={p} x={1500} y={1730} n={2} gap={260} walk={frame * 1.9} s={1.1} color="#2a140c" load="#8a3b2a" dir={-1} />
          </g>
        )}
      />
      <PaperLayer depth={1.3} shadow={26} shadowOpacity={0.7} render={(p) => <path d={dunePath(809, { x0: -420, x1: 1500, base: 1900, amp: 50, waves: 0.5, bottom: 2500 })} fill={p("#4a2414")} />} />
      <Dust seed={811} count={40} area={{ x: -100, y: 1100, w: 1300, h: 800 }} color="#ffe2a6" size={2.6} rise={0.2} depth={0.8} opacity={0.7} />
    </CinematicCamera>
  );
};

export const Ch1Scene08Youth: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // a manuscript page unfolds over the desert, and later folds away again
  const open = interpolate(frame, [T.page - 20, T.page + 8], [0, 1], { ...clamp, easing: theme.ease.out });
  const shut = interpolate(frame, [T.back - 10, T.back + 18], [1, 0], { ...clamp, easing: theme.ease.inOut });
  const page = Math.min(open, shut);
  // goods drop onto the pans; the beam tips, then settles level — honest weight
  const L = spring({ frame: frame - T.dropL, fps, config: DROP });
  const R = spring({ frame: frame - T.dropR, fps, config: DROP });
  const wob = (d: number) => (frame > d ? Math.exp(-(frame - d) / 18) * Math.sin((frame - d) / 3.5) : 0);
  const tilt = 12 * (L - R) + 5 * wob(T.dropL) - 4 * wob(T.dropR);
  const word = interpolate(frame, [T.word, T.word + 50], [0, 1], { ...clamp, easing: theme.ease.soft });
  const end = dur - 38;

  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Desert dur={dur} frame={frame} />
      {page > 0 ? (
        <AbsoluteFill style={{ clipPath: `inset(${(1 - page) * 50}% 0 ${(1 - page) * 50}% 0)` }}>
          <PageSurface w={1080} h={1920} />
          <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 42%, rgba(60,35,10,${0.5 * (1 - page)}) 50%, transparent 58%)` }} />
          <CinematicCamera keys={[{ f: T.page, x: 0, y: 30, zoom: 1.0 }, { f: T.back, x: 0, y: -10, zoom: 1.06 }]} drift={0.4}>
            <Glow x={540} y={1050} r={520} color="#ffd890" opacity={0.35} depth={1} blend="soft-light" />
            <PaperLayer depth={1} shadow={18} shadowOpacity={0.45} render={(p) => <BalanceScale p={p} x={540} y={870} s={0.95} tilt={tilt} loads={{ l: L, r: R }} />} />
          </CinematicCamera>
          <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center" }}>
            <div dir="rtl" lang="ar" style={{ fontFamily: arabicStack, fontWeight: 700, fontSize: 168, lineHeight: 1.5, color: C.ink, ...rtlSweepMask(word) }}>
              الأَمِينُ
            </div>
          </div>
          <InkCaption lines={["AL-AMIN — GELARAN YANG DIKENALI", "DALAM SIRAH BAGINDA."]} start={T.caption} end={T.back} top={1380} size={42} />
          <IllustrationNote start={T.caption + 24} end={T.back} top={1540} text="Sirah Ibn Hisham (riwayat Ibn Ishaq) · tiada usia khusus dinyatakan" ink />
        </AbsoluteFill>
      ) : null}
      <ScrollCaption lines={["PERJALANAN HIDUP BAGINDA BERTERUSAN", "MENUJU ALAM DEWASA."]} start={T.back + 20} end={end} top={250} size={37} width={1000} />
      <Grade warmth={0.12} />
      <PaperOverlay />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
