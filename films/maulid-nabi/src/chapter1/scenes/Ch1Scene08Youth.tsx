import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { arabicStack, theme } from "../../theme";
import { CinematicCamera } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer } from "../../components/PaperLayer";
import { Dust, Glow, Grade, Grain, PaperOverlay, Sky, Vignette } from "../../components/Atmosphere";
import { BalanceScale, Caravan } from "../../components/Props";
import { PageSurface } from "../../components/Book";
import { MalaySubtitle, STORY } from "../../components/MalaySubtitle";
import { IllustrationNote } from "../../components/IllustrationNote";
import { dunePath, ridgePath } from "../../components/shapes";
import { clamp, rtlSweepMask } from "../../components/textMotion";
import { sec } from "../../timeline";

const C = theme.colors;
const T = { page: sec(9.2), word: sec(10.2), caption: sec(12.2), back: sec(17.6) };

const Desert: React.FC<{ dur: number; frame: number }> = ({ dur, frame }) => {
  const route = interpolate(frame, [sec(0.6), sec(5)], [0, 1], { ...clamp, easing: theme.ease.inOut });
  return (
    <CinematicCamera keys={[{ f: 0, x: -100, y: 0, zoom: 1.1 }, { f: dur, x: 140, y: 20, zoom: 1.02 }]}>
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
      {/* an ancient trade route traced across the sand */}
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
  const page = interpolate(frame, [T.page - 20, T.page + 14, T.back - 10, T.back + 24], [0, 1, 1, 0], { ...clamp, easing: theme.ease.inOut });
  // the scale swings and comes to rest in balance
  const settle = Math.max(0, frame - T.page);
  const tilt = 14 * Math.exp(-settle / 45) * Math.cos(settle / 9);
  const word = interpolate(frame, [T.word, T.word + 50], [0, 1], { ...clamp, easing: theme.ease.soft });
  const end = dur - 38;

  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Desert dur={dur} frame={frame} />
      {page > 0 ? (
        <AbsoluteFill style={{ opacity: page, transform: `scale(${interpolate(page, [0, 1], [1.06, 1])})` }}>
          <PageSurface w={1080} h={1920} />
          <CinematicCamera keys={[{ f: T.page, x: 0, y: 30, zoom: 1.0 }, { f: T.back, x: 0, y: -10, zoom: 1.06 }]} drift={0.4}>
            <Glow x={540} y={1050} r={520} color="#ffd890" opacity={0.35} depth={1} blend="soft-light" />
            <PaperLayer depth={1} shadow={18} shadowOpacity={0.45} render={(p) => <BalanceScale p={p} x={540} y={870} s={0.95} tilt={tilt} />} />
          </CinematicCamera>
          <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center" }}>
            <div dir="rtl" lang="ar" style={{ fontFamily: arabicStack, fontWeight: 700, fontSize: 168, lineHeight: 1.5, color: C.ink, ...rtlSweepMask(word) }}>
              الأَمِينُ
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      <MalaySubtitle text="Laluan kafilah merentasi Jazirah Arab" {...STORY} size={50} start={sec(0.8)} end={sec(8.6)} top={260} />
      <MalaySubtitle
        text="AL-AMIN — GELARAN YANG DIKENALI DALAM SIRAH BAGINDA."
        start={T.caption}
        end={T.back}
        top={1390}
        size={42}
        tracking={0.06}
        maxWidth={920}
        color={C.ink}
        shadow={false}
      />
      <IllustrationNote start={T.caption + 20} end={T.back} top={1540} text="Sirah Ibn Hisham (riwayat Ibn Ishaq) · tiada usia khusus dinyatakan" ink />
      <MalaySubtitle text="PERJALANAN HIDUP BAGINDA BERTERUSAN MENUJU ALAM DEWASA." start={T.back + 20} end={end} top={300} size={44} tracking={0.06} maxWidth={940} />
      <Grade warmth={0.12} />
      <PaperOverlay />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
