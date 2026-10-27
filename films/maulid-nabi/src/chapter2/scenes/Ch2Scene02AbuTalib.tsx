import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { theme } from "../../theme";
import { CinematicCamera, type CamKey } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer } from "../../components/PaperLayer";
import { Dust, Glow, Grade, Grain, PaperOverlay, Stars, Vignette } from "../../components/Atmosphere";
import { OilLamp } from "../../components/Props";
import { CalloutLabel, ScrollCaption } from "../../components/WorldCaption";
import { IllustrationNote } from "../../components/IllustrationNote";
import { pointedArchPath, ridgePath } from "../../components/shapes";
import { clamp } from "../../components/textMotion";
import { noise1 } from "../../random";
import { sec } from "../../timeline";
import { Goat, Hearth, Quern, RolledMats, Steam, WaterSkin } from "../props";

const C = theme.colors;
const T = { cap1: sec(2.0), cap1End: sec(9.5), callout: sec(4.0), calloutEnd: sec(9.2), cap2: sec(10.0), cap2End: sec(17.5), dolly: sec(16.0) };
export const CH2_S2_BEATS = T;

const HEARTH = { x: 640, base: 1520 };
const NICHE = { x: 300, y: 1080 };
// a slow lateral dolly along the courtyard, then a push toward the hearth
const camKeys = (dur: number): CamKey[] => {
  const d = 0.8;
  const zoom = 1.5;
  const s = 1 + (zoom - 1) * d;
  return [
    { f: 0, x: -260, y: 40, zoom: 1.05 },
    { f: T.dolly, x: 220, y: 40, zoom: 1.08 },
    { f: dur, x: (s * (HEARTH.x - 540)) / d, y: (s * (HEARTH.base - 100 - 960) - 60) / d, zoom },
  ];
};

export const Ch2Scene02AbuTalib: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // dusk settles into night over the household
  const n = interpolate(frame, [0, dur], [0.25, 1], { ...clamp, easing: theme.ease.soft });
  const sky = (a: string, b: string) => interpolateColors(n, [0, 1], [a, b]);
  const flicker = 0.92 + noise1(frame / 5, 11) * 0.08 + noise1(frame / 13, 12) * 0.06;
  const fire = 0.9 + noise1(frame / 3, 13) * 0.1 + noise1(frame / 8, 14) * 0.08;
  const wall = sky("#8a5a3e", "#4a3430");
  const wallDark = sky("#6a4230", "#33242a");
  const floor = sky("#7a5236", "#3a2a26");
  const end = dur - 40;

  return (
    <AbsoluteFill style={{ background: C.void }}>
      <CinematicCamera keys={camKeys(dur)} drift={0.6}>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky("#2a2a5a", "#070b22")} 0%, ${sky("#7a4a6a", "#1a1a3a")} 30%, ${sky("#d08060", "#2a2440")} 44%)` }} />
        <Stars seed={2201} count={120} top={-300} bottom={700} opacity={n} spin={0.008} />
        <PaperLayer depth={0.12} shadow={8} render={(p) => <path d={ridgePath(2203, { x0: -420, x1: 1500, base: 760, amp: 260, peaks: 4, bottom: 1300 })} fill={p(sky("#4a3448", "#181628"))} />} />
        {/* neighbouring roofs beyond the courtyard wall */}
        <PaperLayer
          depth={0.3}
          shadow={10}
          render={(p) => (
            <g>
              {[[-420, 240, 150], [-120, 200, 210], [180, 260, 120], [560, 220, 190], [900, 260, 140], [1260, 240, 200]].map(([x, w, h], i) => (
                <rect key={i} x={x} y={860 - h} width={w} height={h + 200} fill={p(sky("#5a3a34", "#221a22"))} />
              ))}
            </g>
          )}
        />
        {/* the courtyard's back wall: a lamp niche, a shelf of pots, a doorway and a water skin */}
        <PaperLayer
          depth={0.45}
          shadow={16}
          render={(p) => (
            <g>
              <rect x={-500} y={820} width={2100} height={560} fill={p(wall)} />
              {Array.from({ length: 40 }).map((_, i) => (
                <rect key={i} x={-500 + i * 54} y={804} width={28} height={17} fill={p(wall)} />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <path key={"c" + i} d={`M-500 ${880 + i * 50} L1600 ${880 + i * 50}`} stroke={p(wallDark)} strokeWidth={2} opacity={0.35} />
              ))}
              <path d={pointedArchPath(NICHE.x - 56, NICHE.y + 30, 112, 150)} fill={p("#1e1410")} />
              <rect x={480} y={1060} width={240} height={14} fill={p("#4a2e18")} />
              <path d="M500 1060 q-10 -50 22 -60 q32 10 22 60 Z" fill={p("#9a5a32")} />
              <path d="M570 1060 q-14 -34 18 -40 q32 6 18 40 Z" fill={p("#7a4a2a")} />
              <path d="M640 1060 q-8 -60 24 -70 q30 10 24 70 Z" fill={p("#a8784a")} />
              <rect x={150} y={940} width={10} height={14} fill={p("#3a2414")} />
              <WaterSkin p={p} x={156} y={1030} s={0.9} hang />
              <path d={`M820 1380 L820 1150 Q880 1110 940 1150 L940 1380 Z`} fill={p(interpolateColors(n, [0, 1], ["#2a1a14", "#a8642c"]))} />
              <path d="M-500 1380 L1600 1380 L1600 2400 L-500 2400 Z" fill={p(floor)} />
            </g>
          )}
        />
        <Glow x={NICHE.x + 30} y={NICHE.y - 40} r={150} color={C.lamp} opacity={0.75 * flicker} depth={0.45} />
        <PaperLayer depth={0.45} shadow={6} render={(p) => <OilLamp p={p} x={NICHE.x - 20} y={NICHE.y + 22} s={0.32} flicker={flicker} sway={noise1(frame / 9, 15) * 6} />} />
        <Glow x={880} y={1270} r={160} color="#ff9a40" opacity={0.6 * n * flicker} depth={0.45} />
        {/* palm-frond shade ('arish) on two posts, with rolled mats and the hand-mill below */}
        <PaperLayer
          depth={0.62}
          shadow={18}
          render={(p) => (
            <g>
              <rect x={-120} y={880} width={14} height={540} fill={p("#3a2414")} />
              <rect x={380} y={880} width={14} height={540} fill={p("#3a2414")} />
              <path
                d={`M-260 900 ${Array.from({ length: 16 }).map((_, i) => `L${-260 + i * 46} ${872 + (i % 2) * 18}`).join(" ")} L460 900 L460 930 L-260 930 Z`}
                fill={p(sky("#5a4a2a", "#221c14"))}
              />
              {Array.from({ length: 14 }).map((_, i) => (
                <path key={i} d={`M${-240 + i * 50} 930 l-10 ${30 + (i % 3) * 14}`} stroke={p(sky("#5a4a2a", "#221c14"))} strokeWidth={6} />
              ))}
              <RolledMats p={p} x={-60} base={1430} />
              <Quern p={p} x={260} base={1440} />
            </g>
          )}
        />
        {/* a goat tethered by the doorway */}
        <PaperLayer
          depth={0.7}
          shadow={16}
          render={(p) => (
            <g>
              <rect x={1010} y={1400} width={8} height={70} fill={p("#3a2414")} />
              <path d={`M1014 1410 Q970 ${1440 + Math.sin(frame / 30) * 6} 920 1420`} stroke={p("#a8844e")} strokeWidth={3} fill="none" />
              <Goat p={p} x={860} y={1490} s={1.3} head={Math.max(0, Math.sin(frame / 45)) * 0.9} />
            </g>
          )}
        />
        {/* the hearth: the household's warmth at the heart of the courtyard */}
        <Glow x={HEARTH.x} y={HEARTH.base - 60} r={520} color="#ff9a40" opacity={0.45 * fire} depth={0.8} />
        <PaperLayer depth={0.8} shadow={20} shadowOpacity={0.6} render={(p) => <Hearth p={p} x={HEARTH.x} base={HEARTH.base} flicker={fire} />} />
        <DepthFill depth={0.8}>
          <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
            <Steam x={HEARTH.x} y={HEARTH.base - 170} frame={frame} />
          </svg>
        </DepthFill>
        <Dust seed={2207} count={22} area={{ x: HEARTH.x - 120, y: HEARTH.base - 600, w: 240, h: 520 }} color="#ffb060" size={2.2} rise={1.4} depth={0.8} opacity={0.9} />
        <CalloutLabel target={[NICHE.x, NICHE.y - 20]} label={[420, 560]} lines={["Rumah Abu Talib", "(ilustrasi)"]} start={T.callout} end={T.calloutEnd} depth={0.45} size={36} width={380} />
        {/* framing foreground: the edge of a mud-brick pillar the dolly slides past, and a low wall corner */}
        <PaperLayer
          depth={1.25}
          shadow={28}
          shadowOpacity={0.75}
          render={(p) => (
            <g>
              <path d="M-600 -400 L40 -400 L40 2400 L-600 2400 Z" fill={p("#1a120e")} />
              <path d="M40 -400 L60 -400 L60 2400 L40 2400 Z" fill={p("#2e2018")} />
              {Array.from({ length: 12 }).map((_, i) => (
                <path key={i} d={`M-600 ${i * 220} L40 ${i * 220}`} stroke={p("#0e0a08")} strokeWidth={3} opacity={0.6} />
              ))}
              <path d="M900 1800 L1600 1760 L1600 2400 L860 2400 Z" fill={p("#1a120e")} />
            </g>
          )}
        />
      </CinematicCamera>
      <ScrollCaption lines={["Selepas kewafatan Abdul Muttalib,", "Baginda tinggal bersama Abu Talib."]} start={T.cap1} end={T.cap1End} top={220} size={40} />
      <ScrollCaption
        lines={["Baginda membesar dalam jagaan", "dan kasih sayang bapa saudaranya."]}
        sub="Menurut riwayat sirah (Ibn Ishaq)"
        start={T.cap2}
        end={T.cap2End}
        top={220}
        size={40}
      />
      <IllustrationNote start={40} end={end} top={1760} />
      <Grade warmth={0.14} />
      <PaperOverlay />
      <Grain />
      <Vignette strength={0.65} />
    </AbsoluteFill>
  );
};
