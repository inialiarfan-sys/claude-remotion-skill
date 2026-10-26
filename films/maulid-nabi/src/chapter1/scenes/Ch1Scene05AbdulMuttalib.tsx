import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PAPER_TEXTURE } from "../../assets";
import { theme } from "../../theme";
import { CinematicCamera, type CamKey } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer } from "../../components/PaperLayer";
import { Grade, Grain, PaperOverlay, Sky, Vignette } from "../../components/Atmosphere";
import { House } from "../../components/Architecture";
import { Kaaba } from "../../components/Props";
import { PageSurface } from "../../components/Book";
import { FamilyTree } from "../../components/FamilyTree";
import { AgeTimeline } from "../../components/AgeTimeline";
import { InkCaption } from "../../components/WorldCaption";
import { ridgePath } from "../../components/shapes";
import { clamp } from "../../components/textMotion";
import { sec } from "../../timeline";

const C = theme.colors;
const N = {
  am: { x: 540, y: 560 },
  abdullah: { x: 215, y: 840 },
  aminah: { x: 490, y: 840 },
  abuTalib: { x: 855, y: 840 },
  muhammad: { x: 360, y: 1150 },
};
const T = {
  aminahFade: sec(1.2),
  toAM: sec(3.4),
  h1: sec(3.6),
  abuTalibIn: sec(7.6),
  years: sec(8.4),
  age8: sec(10.4),
  h2: sec(10.6),
  amDim: sec(11.0),
  toAT: sec(14.0),
  h3: sec(14.2),
};
export const CH1_S5_BEATS = T;
const HEADER = { top: 70, h: 300 };

// camera key that centres a node (tree sits on a depth-1 layer)
const focus = (f: number, n: { x: number; y: number }, s: number): CamKey => ({ f, x: s * (n.x - 540), y: s * (n.y - 1010), zoom: s });
const mid = { x: (N.abuTalib.x + N.muhammad.x) / 2, y: (N.abuTalib.y + N.muhammad.y) / 2 };

export const Ch1Scene05AbdulMuttalib: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const end = dur - 40;
  const overview: CamKey = { f: sec(8.2), x: 0, y: 40, zoom: 1.0 };
  const band = interpolate(frame, [T.h1 - 14, T.h1 + 4], [0, 1], { ...clamp, easing: theme.ease.out });
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <CinematicCamera
        keys={[
          // opens on the mother's card, where the previous scene left off…
          focus(0, N.aminah, 1.35),
          focus(sec(1.8), N.aminah, 1.36),
          // …and climbs the family line to the grandfather
          focus(T.toAM, N.am, 1.3),
          focus(sec(6.8), N.am, 1.34),
          overview,
          { ...overview, f: sec(12.6) },
          focus(T.toAT, mid, 1.08),
          focus(dur, mid, 1.12),
        ]}
        drift={0.5}
      >
        {/* Makkah behind the manuscript page */}
        <Sky stops={[["#3a4a7a", 0], ["#b07a6a", 55], ["#e8b07a", 70]]} />
        <PaperLayer depth={0.15} shadow={10} render={(p) => <path d={ridgePath(501, { x0: -420, x1: 1500, base: 1150, amp: 420, peaks: 4, bottom: 1600 })} fill={p("#6a4a50")} />} />
        <PaperLayer
          depth={0.35}
          shadow={14}
          render={(p) => (
            <g>
              {Array.from({ length: 12 }).map((_, i) => (
                <House key={i} p={p} x={-260 + i * 140} base={1340} w={110} h={80 + (i % 4) * 30} body="#a8784e" shade="#7a5234" dark="#3a2414" seed={i + 60} />
              ))}
              <rect x={-400} y={1340} width={1900} height={500} fill={p("#8a5c3a")} />
              <Kaaba p={p} x={500} base={1346} w={90} h={86} />
            </g>
          )}
        />
        <AbsoluteFill style={{ background: "rgba(10,6,4,0.55)" }} />
        <DepthFill depth={1}>
          <PageSurface w={980} h={1060} style={{ left: 50, top: 420, boxShadow: "0 30px 70px rgba(0,0,0,0.7)" }} />
          <FamilyTree
            nodes={[
              { id: "am", ...N.am, label: "DATUK", name: "ABDUL MUTTALIB", appear: -90, dim: T.amDim, note: "Wafat ketika Baginda berusia 8 tahun", w: 400 },
              { id: "abdullah", ...N.abdullah, label: "AYAHANDA", name: "ABDULLAH", appear: -90, dim: -90, note: "Wafat", w: 250 },
              { id: "aminah", ...N.aminah, label: "IBUNDA", name: "AMINAH", appear: -90, dim: -90, note: "Wafat", w: 250 },
              { id: "abuTalib", ...N.abuTalib, label: "BAPA SAUDARA", name: "ABU TALIB", appear: T.abuTalibIn, w: 270 },
              { id: "muhammad", ...N.muhammad, label: "RASULULLAH ﷺ", name: "MUHAMMAD", appear: -90, prophet: true, w: 330 },
            ]}
            edges={[
              { from: "am", to: "abdullah", kind: "lineage", appear: -90 },
              { from: "am", to: "abuTalib", kind: "lineage", appear: T.abuTalibIn + 10 },
              { from: "abdullah", to: "aminah", kind: "marriage", appear: -90 },
              { from: "abdullah", to: "muhammad", kind: "lineage", appear: -90 },
              { from: "aminah", to: "muhammad", kind: "care", appear: -90, fade: T.aminahFade },
              { from: "am", to: "muhammad", kind: "care", appear: T.h1, fade: T.amDim },
              { from: "abuTalib", to: "muhammad", kind: "care", appear: T.h3 },
            ]}
            highlight={[
              { id: "aminah", from: -30, to: sec(2.6) },
              { id: "am", from: T.toAM - 10, to: T.age8 },
              { id: "abuTalib", from: T.toAT, to: dur },
            ]}
          />
          <InkCaption lines={["Garis emas: penjaga Baginda"]} start={T.h1 + 30} top={1300} size={26} italic weight={600} tracking={0.01} color={C.inkSoft} />
        </DepthFill>
      </CinematicCamera>
      {/* a parchment header band where each change of guardianship is written */}
      {band > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            top: HEADER.top,
            height: HEADER.h,
            clipPath: `inset(0 0 ${(1 - band) * 100}% 0)`,
            background: `linear-gradient(180deg, ${C.parchmentLight}, ${C.parchment} 60%, ${C.parchmentDark})`,
            boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
            borderRadius: 4,
          }}
        >
          <AbsoluteFill style={{ backgroundImage: `url(${PAPER_TEXTURE})`, backgroundSize: "512px", mixBlendMode: "multiply", opacity: 0.85 }} />
          <div style={{ position: "absolute", inset: 10, border: `2px solid ${C.goldDeep}`, opacity: 0.7 }} />
          <InkCaption lines={["DI BAWAH JAGAAN DATUKNYA"]} start={T.h1 + 6} end={T.h2 - 6} top={48} size={40} tracking={0.12} width={1000} />
          <InkCaption lines={["ABDUL MUTTALIB"]} start={T.h1 + 30} end={T.h2 - 6} top={118} size={70} tracking={0.1} color={C.goldDeep} width={1000} per={30} />
          <InkCaption lines={["USIA 8 TAHUN"]} start={T.h2} end={T.toAT} top={44} size={66} tracking={0.12} color={C.goldDeep} width={1000} per={28} />
          <InkCaption lines={["ABDUL MUTTALIB WAFAT."]} start={T.h2 + 24} end={T.toAT} top={160} size={42} tracking={0.08} width={1000} />
          <InkCaption lines={["ABU TALIB"]} start={T.h3} end={end} top={32} size={70} tracking={0.1} color={C.goldDeep} width={1000} per={26} />
          <InkCaption lines={["BAGINDA KEMUDIAN DIJAGA OLEH", "BAPA SAUDARANYA, ABU TALIB."]} start={T.h3 + 26} end={end} top={140} size={38} tracking={0.06} width={1000} />
        </div>
      ) : null}
      <AgeTimeline
        marks={[
          { label: "USIA 6 TAHUN", at: T.years },
          { label: "USIA 8 TAHUN", at: T.age8 },
        ]}
        top={1560}
        start={T.years - 20}
        end={T.toAT}
      />
      <Grade warmth={0.1} />
      <PaperOverlay opacity={0.2} />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
