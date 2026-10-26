import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { CinematicCamera } from "../components/CinematicCamera";
import { PaperLayer } from "../components/PaperLayer";
import { Dust, Glow, Grade, Grain, PaperOverlay, Sky, Stars, Vignette } from "../components/Atmosphere";
import { House, Palm } from "../components/Architecture";
import { dunePath, ridgePath } from "../components/shapes";
import { ArabicTitle } from "../components/ArabicTitle";
import { MalaySubtitle } from "../components/MalaySubtitle";
import { mulberry32 } from "../random";
import { sec } from "../timeline";

const C = theme.colors;
// moonless desert night: sand and brick shifted toward blue
const N = {
  hillFar: "#2b3462",
  hillMid: "#212850",
  rocks: "#1b1f3d",
  town: "#4a3c4a",
  townShade: "#33293a",
  townDark: "#1a1422",
  duneMid: "#4a3a45",
  duneNear: "#33282f",
  duneFront: "#1f181d",
  scrub: "#141016",
};

export const Scene02AncientArabia: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const houses = useMemo(() => {
    const rand = mulberry32(42);
    const out: { x: number; w: number; h: number; base: number; seed: number }[] = [];
    let x = -260;
    while (x < 1340) {
      const w = 70 + rand() * 90;
      out.push({ x, w, h: 60 + rand() * 90, base: 1262 + rand() * 26, seed: Math.floor(rand() * 1e6) });
      x += w * (0.55 + rand() * 0.4);
    }
    return out;
  }, []);
  const backHouses = useMemo(() => {
    const rand = mulberry32(7);
    const out: { x: number; w: number; h: number; base: number; seed: number }[] = [];
    let x = -200;
    while (x < 1300) {
      const w = 50 + rand() * 70;
      out.push({ x, w, h: 40 + rand() * 60, base: 1232 + rand() * 14, seed: Math.floor(rand() * 1e6) });
      x += w * (0.6 + rand() * 0.5);
    }
    return out;
  }, []);

  return (
    <AbsoluteFill>
      <CinematicCamera
        keys={[
          { f: 0, x: -20, y: -30, zoom: 1.0 },
          { f: dur, x: 30, y: 60, zoom: 1.3 },
        ]}
      >
        <Sky
          stops={[
            [C.nightTop, 0],
            [C.night, 35],
            [C.nightHorizon, 62],
            [C.nightGlow, 72],
          ]}
          glow={{ x: 540, y: 1180, r: 900, color: "rgba(110,100,170,0.35)" }}
        />
        {/* faint band of the Milky Way */}
        <AbsoluteFill
          style={{
            background: "linear-gradient(120deg, transparent 30%, rgba(200,190,255,0.10) 45%, rgba(255,240,220,0.08) 52%, transparent 66%)",
            filter: "blur(20px)",
          }}
        />
        <Stars seed={21} count={210} top={-350} bottom={1150} spin={0.01} />
        <PaperLayer
          depth={0.12}
          shadow={10}
          rim="rgba(160,160,230,0.25)"
          render={(p) => <path d={ridgePath(3, { x0: -420, x1: 1500, base: 1120, amp: 280, peaks: 6, bottom: 1500 })} fill={p(N.hillFar)} />}
        />
        <PaperLayer
          depth={0.25}
          shadow={14}
          rim="rgba(160,160,230,0.2)"
          render={(p) => <path d={ridgePath(9, { x0: -420, x1: 1500, base: 1230, amp: 340, peaks: 4, bottom: 1600 })} fill={p(N.hillMid)} />}
        />
        {/* the settlement of Makkah in its valley */}
        <PaperLayer
          depth={0.4}
          shadow={10}
          render={(p) => (
            <g>
              {backHouses.map((h, i) => (
                <House key={i} p={p} x={h.x} base={h.base} w={h.w} h={h.h} body={N.townShade} shade={N.townDark} dark={N.townDark} lamp={C.lamp} seed={h.seed} lit={0.25} />
              ))}
              <rect x={-400} y={1240} width={1900} height={300} fill={p(N.townShade)} />
            </g>
          )}
        />
        <Glow x={540} y={1250} r={520} color="#ffb453" opacity={0.18} depth={0.45} />
        <PaperLayer
          depth={0.48}
          shadow={14}
          render={(p) => (
            <g>
              {houses.map((h, i) => (
                <House key={i} p={p} x={h.x} base={h.base} w={h.w} h={h.h} body={N.town} shade={N.townShade} dark={N.townDark} lamp={C.lamp} seed={h.seed} lit={0.45} />
              ))}
              <rect x={-400} y={1275} width={1900} height={300} fill={p(N.town)} />
            </g>
          )}
        />
        <PaperLayer
          depth={0.62}
          shadow={16}
          render={(p) => <path d={ridgePath(15, { x0: -420, x1: 1500, base: 1420, amp: 120, peaks: 7, bottom: 1800, rough: 0.5 })} fill={p(N.rocks)} />}
        />
        <PaperLayer
          depth={0.8}
          shadow={18}
          rim="rgba(230,200,170,0.18)"
          render={(p) => <path d={dunePath(5, { x0: -420, x1: 1500, base: 1520, amp: 60, waves: 1.4, bottom: 2000 })} fill={p(N.duneMid)} />}
        />
        <PaperLayer
          depth={0.95}
          shadow={20}
          rim="rgba(230,200,170,0.16)"
          render={(p) => (
            <g>
              <path d={dunePath(8, { x0: -420, x1: 1500, base: 1640, amp: 70, waves: 1.1, bottom: 2100 })} fill={p(N.duneNear)} />
              <Palm p={p} x={850} base={1640} h={330} lean={-0.1} color={N.scrub} seed={4} sway={Math.sin(frame / 40) * 4} />
              <Palm p={p} x={960} base={1660} h={260} lean={0.14} color={N.scrub} seed={8} sway={Math.sin(frame / 45 + 1) * 4} />
            </g>
          )}
        />
        <Dust seed={31} count={34} area={{ x: -200, y: 1350, w: 1500, h: 500 }} color="#e8d2a8" size={2.6} rise={0.15} depth={1.0} opacity={0.5} />
        <PaperLayer
          depth={1.2}
          shadow={24}
          shadowOpacity={0.7}
          render={(p) => (
            <g>
              <path d={dunePath(12, { x0: -420, x1: 1500, base: 1790, amp: 80, waves: 0.8, bottom: 2400 })} fill={p(N.duneFront)} />
              <Palm p={p} x={70} base={1800} h={520} lean={0.16} color={"#0e0b10"} seed={13} sway={Math.sin(frame / 38) * 6} />
              {/* desert scrub tufts */}
              {[260, 330, 640, 720].map((x, i) => (
                <path key={i} d={`M${x} 1790 l-26 -44 l18 30 l-4 -56 l14 52 l10 -40 l2 46 l22 -34 l-14 46 Z`} fill={p("#0e0b10")} />
              ))}
            </g>
          )}
        />
      </CinematicCamera>
      <ArabicTitle text="مَكَّةُ الْمُكَرَّمَةُ" start={sec(1.6)} end={sec(5.6)} top={430} size={118} />
      <MalaySubtitle text="MAKKAH AL-MUKARRAMAH" start={sec(2.3)} end={sec(5.6)} top={680} size={46} />
      <ArabicTitle text="عَامُ الْفِيلِ" start={sec(6.1)} end={sec(9.9)} top={440} size={124} />
      <MalaySubtitle text="Tahun Gajah" start={sec(6.8)} end={sec(9.9)} top={700} size={52} tracking={0.08} />
      <Grade warmth={0.08} />
      <PaperOverlay />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
