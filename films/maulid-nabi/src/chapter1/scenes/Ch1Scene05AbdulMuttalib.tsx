import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { latinStack, theme } from "../../theme";
import { CinematicCamera, type CamKey } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer } from "../../components/PaperLayer";
import { Grade, Grain, PaperOverlay, Sky, Vignette } from "../../components/Atmosphere";
import { House } from "../../components/Architecture";
import { Kaaba } from "../../components/Props";
import { PageSurface } from "../../components/Book";
import { FamilyTree } from "../../components/FamilyTree";
import { AgeTimeline } from "../../components/AgeTimeline";
import { MalaySubtitle } from "../../components/MalaySubtitle";
import { ridgePath } from "../../components/shapes";
import { clamp } from "../../components/textMotion";

const C = theme.colors;
const N = {
  am: { x: 540, y: 560 },
  abdullah: { x: 215, y: 840 },
  aminah: { x: 490, y: 840 },
  abuTalib: { x: 855, y: 840 },
  muhammad: { x: 360, y: 1150 },
};
const T = { page: 30, toAminah: 120, toAM: 190, years: 330, age8: 400, toAT: 470 };

// camera key that centres a node (tree sits on a depth-1 layer)
const focus = (f: number, n: { x: number; y: number }, s: number): CamKey => ({ f, x: s * (n.x - 540), y: s * (n.y - 1010), zoom: s });

export const Ch1Scene05AbdulMuttalib: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const page = spring({ frame: frame - T.page, fps, config: theme.spring.gentle });
  const end = dur - 40;
  const overview: CamKey = { f: 0, x: 0, y: 40, zoom: 0.94 };
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <CinematicCamera
        keys={[
          overview,
          { ...overview, f: T.toAminah },
          focus(T.toAminah + 50, N.aminah, 1.25),
          focus(T.toAM, N.am, 1.25),
          focus(T.toAM + 60, N.am, 1.3),
          { f: T.years + 20, x: 0, y: 70, zoom: 1.0 },
          { f: T.toAT - 10, x: 0, y: 70, zoom: 1.0 },
          focus(T.toAT + 40, N.abuTalib, 1.22),
          focus(dur, N.abuTalib, 1.26),
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
          <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, page * 1.4), transform: `translateY(${interpolate(page, [0, 1], [90, 0])}px)` }}>
            <PageSurface w={980} h={1060} style={{ left: 50, top: 420, boxShadow: "0 30px 70px rgba(0,0,0,0.7)" }} />
            <FamilyTree
              nodes={[
                { id: "am", ...N.am, label: "DATUK", name: "ABDUL MUTTALIB", appear: 50, dim: T.age8 + 30, note: "Wafat ketika Baginda berusia 8 tahun", w: 400 },
                { id: "abdullah", ...N.abdullah, label: "AYAHANDA", name: "ABDULLAH", appear: 62, dim: 62, note: "Wafat", w: 250 },
                { id: "aminah", ...N.aminah, label: "IBUNDA", name: "AMINAH", appear: 72, dim: 100, note: "Wafat", w: 250 },
                { id: "abuTalib", ...N.abuTalib, label: "BAPA SAUDARA", name: "ABU TALIB", appear: 84, w: 270 },
                { id: "muhammad", ...N.muhammad, label: "RASULULLAH ﷺ", name: "MUHAMMAD", appear: 76, prophet: true, w: 330 },
              ]}
              edges={[
                { from: "am", to: "abdullah", kind: "lineage", appear: 96 },
                { from: "am", to: "abuTalib", kind: "lineage", appear: 104 },
                { from: "abdullah", to: "aminah", kind: "marriage", appear: 100 },
                { from: "abdullah", to: "muhammad", kind: "lineage", appear: 112 },
                { from: "aminah", to: "muhammad", kind: "care", appear: 90, fade: T.toAminah + 30 },
                { from: "am", to: "muhammad", kind: "care", appear: T.toAM + 40, fade: T.age8 + 30 },
                { from: "abuTalib", to: "muhammad", kind: "care", appear: T.toAT + 30 },
              ]}
              highlight={[
                { id: "aminah", from: T.toAminah + 20, to: T.toAM },
                { id: "am", from: T.toAM + 20, to: T.years + 10 },
                { id: "abuTalib", from: T.toAT + 20, to: dur },
              ]}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 1300,
                textAlign: "center",
                fontFamily: latinStack,
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: 26,
                color: C.inkSoft,
              }}
            >
              Garis emas: penjaga Baginda
            </div>
          </div>
        </DepthFill>
      </CinematicCamera>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,5,3,0.85) 0%, rgba(8,5,3,0.6) 20%, transparent 27%)" }} />
      <MalaySubtitle text="DI BAWAH JAGAAN DATUKNYA" start={T.toAM + 20} end={T.years} top={120} size={46} tracking={0.12} />
      <MalaySubtitle text="ABDUL MUTTALIB" start={T.toAM + 40} end={T.years} top={240} size={74} tracking={0.1} color={C.goldLight} ornament={false} />
      <AgeTimeline
        marks={[
          { label: "USIA 6 TAHUN", at: T.years },
          { label: "USIA 8 TAHUN", at: T.age8 },
        ]}
        top={1560}
        start={T.years - 20}
        end={T.toAT + 10}
      />
      <MalaySubtitle text="USIA 8 TAHUN" start={T.age8} end={T.toAT} top={120} size={70} tracking={0.12} color={C.goldLight} />
      <MalaySubtitle text="ABDUL MUTTALIB WAFAT." start={T.age8 + 20} end={T.toAT} top={300} size={46} tracking={0.08} ornament={false} />
      <MalaySubtitle text="ABU TALIB" start={T.toAT + 20} end={end} top={120} size={74} tracking={0.1} color={C.goldLight} />
      <MalaySubtitle
        text="BAGINDA KEMUDIAN DIJAGA OLEH BAPA SAUDARANYA, ABU TALIB."
        start={T.toAT + 34}
        end={end}
        top={262}
        size={40}
        tracking={0.06}
        maxWidth={920}
        ornament={false}
      />
      <Grade warmth={0.1} />
      <PaperOverlay opacity={0.2} />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
