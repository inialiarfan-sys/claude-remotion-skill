import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { CinematicCamera } from "../components/CinematicCamera";
import { PaperLayer } from "../components/PaperLayer";
import { Dust, Glow, Grade, Grain, PaperOverlay, Sky, Stars, Vignette } from "../components/Atmosphere";
import { House, Palm } from "../components/Architecture";
import { ridgePath } from "../components/shapes";
import { ArabicTitle } from "../components/ArabicTitle";
import { MalaySubtitle } from "../components/MalaySubtitle";
import { clamp } from "../components/textMotion";
import { noise1 } from "../random";
import { sec } from "../timeline";
import { STORY } from "../components/MalaySubtitle";

const C = theme.colors;

/**
 * Exterior of an ancient house in Makkah at night. The Prophet ﷺ is never
 * shown — no figure, no silhouette. Reverence comes from stillness, the
 * architecture, and ordinary oil-lamp light from within the house; the light
 * is not presented as any miraculous event.
 */
export const Scene03BirthScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // natural lamp flicker
  const flicker = 0.88 + noise1(frame / 6, 2) * 0.07 + noise1(frame / 17, 5) * 0.05;
  // gentle shift in the night: the horizon softens and the house warms
  const shift = interpolate(frame, [sec(3), sec(16)], [0, 1], { ...clamp, easing: theme.ease.soft });
  const lamp = (0.75 + shift * 0.25) * flicker;

  const HX = 250;
  const HW = 580;
  const BASE = 1500;
  return (
    <AbsoluteFill>
      <CinematicCamera
        keys={[
          { f: 0, x: 0, y: -20, zoom: 1.0 },
          { f: dur, x: 0, y: 50, zoom: 1.2 },
        ]}
      >
        <Sky
          stops={[
            [C.nightTop, 0],
            [C.night, 40],
            [C.nightHorizon, 66],
            [C.nightGlow, 80],
          ]}
        />
        <AbsoluteFill
          style={{
            background: "linear-gradient(180deg, transparent 40%, rgba(150,140,200,0.22) 70%, rgba(190,160,170,0.18) 85%)",
            opacity: shift,
          }}
        />
        <Stars seed={33} count={230} top={-350} bottom={1150} spin={0.014} />
        <PaperLayer
          depth={0.1}
          shadow={12}
          rim="rgba(170,170,240,0.25)"
          render={(p) => <path d={ridgePath(41, { x0: -420, x1: 1500, base: 1180, amp: 520, peaks: 3, bottom: 1600 })} fill={p("#222a55")} />}
        />
        <PaperLayer
          depth={0.3}
          shadow={12}
          render={(p) => (
            <g>
              <House p={p} x={-180} base={1420} w={240} h={230} body="#3d3242" shade="#2a2230" dark="#17121c" lamp={C.lamp} seed={2} lit={0.3} />
              <House p={p} x={70} base={1410} w={150} h={180} body="#3a2f40" shade="#2a2230" dark="#17121c" lamp={C.lamp} seed={5} lit={0} />
              <House p={p} x={820} base={1415} w={200} h={250} body="#3d3242" shade="#2a2230" dark="#17121c" lamp={C.lamp} seed={9} lit={0.3} />
              <House p={p} x={1010} base={1420} w={220} h={170} body="#3a2f40" shade="#2a2230" dark="#17121c" lamp={C.lamp} seed={12} lit={0} />
              <rect x={-400} y={1400} width={1900} height={300} fill={p("#2a2230")} />
            </g>
          )}
        />
        {/* the house: mud-brick walls, upper room, timber door, palm-frond awning */}
        <PaperLayer
          depth={0.6}
          shadow={22}
          shadowOpacity={0.6}
          render={(p) => (
            <g>
              <rect x={HX + 40} y={BASE - 760} width={300} height={220} fill={p("#5a3d33")} />
              {Array.from({ length: 6 }).map((_, i) => (
                <rect key={i} x={HX + 40 + i * 54} y={BASE - 776} width={30} height={18} fill={p("#5a3d33")} />
              ))}
              <rect x={HX + 150} y={BASE - 700} width={30} height={46} rx={3} fill={p(C.lamp)} />
              <rect x={HX} y={BASE - 560} width={HW} height={560} fill={p("#6a4634")} />
              <path d={`M${HX + HW} ${BASE - 560} L${HX + HW + 70} ${BASE - 540} L${HX + HW + 70} ${BASE} L${HX + HW} ${BASE} Z`} fill={p("#43291d")} />
              {Array.from({ length: 11 }).map((_, i) => (
                <rect key={i} x={HX + i * 54} y={BASE - 578} width={30} height={20} fill={p("#6a4634")} />
              ))}
              {/* mud-brick courses */}
              {Array.from({ length: 13 }).map((_, i) => (
                <path key={"c" + i} d={`M${HX} ${BASE - 520 + i * 40} L${HX + HW} ${BASE - 520 + i * 40}`} stroke={p("#4e3226")} strokeWidth={2} strokeOpacity={0.35} />
              ))}
              {Array.from({ length: 9 }).map((_, i) => (
                <rect key={"j" + i} x={HX + 24 + i * 64} y={BASE - 540} width={12} height={10} fill={p("#2c1a10")} />
              ))}
              {/* doorway */}
              <path d={`M${HX + 220} ${BASE} L${HX + 220} ${BASE - 250} Q${HX + 290} ${BASE - 300} ${HX + 360} ${BASE - 250} L${HX + 360} ${BASE} Z`} fill={p("#2b170c")} />
              <rect x={HX + 230} y={BASE - 250} width={60} height={250} fill={p(C.wood)} />
              <rect x={HX + 296} y={BASE - 250} width={56} height={250} fill={p(C.wood)} />
              <rect x={HX + 289} y={BASE - 245} width={8} height={245} fill={p(C.lamp)} />
              {/* lattice windows */}
              {[HX + 70, HX + 440].map((wx, k) => (
                <g key={k}>
                  <rect x={wx} y={BASE - 420} width={74} height={96} rx={4} fill={p(C.lamp)} />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <rect key={i} x={wx + 6 + i * 18} y={BASE - 420} width={5} height={96} fill={p(C.wood)} />
                  ))}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <rect key={"h" + i} x={wx} y={BASE - 414 + i * 19} width={74} height={4} fill={p(C.wood)} />
                  ))}
                  <rect x={wx - 8} y={BASE - 326} width={90} height={10} fill={p("#4e3226")} />
                </g>
              ))}
              {/* awning on palm-trunk posts */}
              <rect x={HX + 160} y={BASE - 330} width={14} height={330} fill={p("#2c1a10")} />
              <rect x={HX + 404} y={BASE - 330} width={14} height={330} fill={p("#2c1a10")} />
              <path d={`M${HX + 130} ${BASE - 330} L${HX + 450} ${BASE - 330} L${HX + 470} ${BASE - 300} L${HX + 110} ${BASE - 300} Z`} fill={p("#3a2414")} />
              {Array.from({ length: 16 }).map((_, i) => (
                <path key={"f" + i} d={`M${HX + 116 + i * 22} ${BASE - 302} l6 ${22 + (i % 3) * 8} l6 ${-22 - (i % 3) * 8} Z`} fill={p("#3a2414")} />
              ))}
              {/* water jar and stone step */}
              <path d={`M${HX + 470} ${BASE} Q${HX + 446} ${BASE - 40} ${HX + 470} ${BASE - 80} L${HX + 476} ${BASE - 92} L${HX + 500} ${BASE - 92} L${HX + 506} ${BASE - 80} Q${HX + 530} ${BASE - 40} ${HX + 506} ${BASE} Z`} fill={p("#7b4b2c")} />
              <rect x={HX + 200} y={BASE - 14} width={180} height={18} fill={p("#5b4a3e")} />
            </g>
          )}
        />
        {/* lamplight spilling from the windows and door onto walls and ground */}
        <Glow x={HX + 107} y={BASE - 372} r={170} color={C.lamp} opacity={0.55 * lamp} depth={0.6} />
        <Glow x={HX + 477} y={BASE - 372} r={170} color={C.lamp} opacity={0.55 * lamp} depth={0.6} />
        <Glow x={HX + 293} y={BASE - 120} r={260} color={C.lamp} opacity={0.5 * lamp} depth={0.6} />
        <Glow x={HX + 165} y={BASE - 677} r={110} color={C.lamp} opacity={0.4 * lamp} depth={0.6} />
        <Dust seed={44} count={30} area={{ x: HX + 100, y: BASE - 500, w: 400, h: 500 }} color={C.lampCore} size={2.4} rise={0.25} depth={0.62} opacity={0.6} />
        <PaperLayer
          depth={0.78}
          shadow={20}
          render={(p) => <Palm p={p} x={110} base={1560} h={560} lean={0.08} color="#141a18" seed={21} sway={Math.sin(frame / 42) * 5} />}
        />
        {/* stone-paved lane */}
        <PaperLayer
          depth={0.95}
          shadow={16}
          render={(p) => (
            <g>
              <path d="M-400 1540 Q540 1500 1480 1540 L1480 2300 L-400 2300 Z" fill={p("#2a2028")} />
              {Array.from({ length: 14 }).map((_, i) => (
                <ellipse key={i} cx={-60 + i * 92 + (i % 2) * 30} cy={1600 + (i % 3) * 40} rx={38} ry={12} fill={p("#3a2e36")} />
              ))}
            </g>
          )}
        />
        <Glow x={HX + 293} y={1600} r={300} color={C.lamp} opacity={0.22 * lamp} depth={0.95} />
        {/* foreground wall corners frame the house */}
        <PaperLayer
          depth={1.35}
          shadow={30}
          shadowOpacity={0.75}
          render={(p) => (
            <g>
              <path d="M1000 2400 L1000 1180 L1030 1160 L1060 1180 L1090 1160 L1120 1180 L1500 1180 L1500 2400 Z" fill={p("#140e12")} />
              <path d="M-500 2400 L-500 1480 L40 1480 L40 2400 Z" fill={p("#120c10")} />
            </g>
          )}
        />
      </CinematicCamera>
      <MalaySubtitle text="Pada suatu malam di Makkah…" {...STORY} size={54} start={sec(0.9)} end={sec(5.4)} top={420} />
      <MalaySubtitle
        text="…lahirlah seorang insan daripada seorang ibu yang mulia, Aminah binti Wahb."
        {...STORY}
        size={52}
        start={sec(5.8)}
        end={sec(10.6)}
        top={380}
      />
      <ArabicTitle text="مُحَمَّدُ بْنُ عَبْدِ اللَّهِ ﷺ" start={sec(10.8)} end={sec(17.9)} top={330} size={98} revealLen={44} />
      <MalaySubtitle text="Muhammad bin Abdullah ﷺ" start={sec(11.6)} end={sec(17.9)} top={590} size={54} tracking={0.05} />
      {/* a simile about guidance — not a depiction of a miraculous light */}
      <MalaySubtitle
        text="Malam itu bagaikan siang, kerana telah lahir pembawa cahaya petunjuk buat sekalian alam."
        {...STORY}
        start={sec(13.2)}
        end={sec(17.9)}
        top={1560}
      />
      <Grade warmth={0.1} />
      <PaperOverlay />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
