import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../theme";
import { CinematicCamera } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer, type Paint } from "../../components/PaperLayer";
import { Dust, Glow, Grade, Grain, PaperOverlay, Sky, Stars, Vignette } from "../../components/Atmosphere";
import { Camel } from "../../components/Props";
import { PageSurface } from "../../components/Book";
import { MapMarker, MapRoute, MapShapes, PLACES, projection } from "../../components/ArabiaMap";
import { MalaySubtitle, STORY } from "../../components/MalaySubtitle";
import { IllustrationNote } from "../../components/IllustrationNote";
import { dunePath, ridgePath } from "../../components/shapes";
import { clamp } from "../../components/textMotion";
import { sec } from "../../timeline";

const C = theme.colors;
const MAP_K = 300;
const proj = projection(540, 980, MAP_K, 39.6, 22.95);
const T = { out: sec(1.0), back: sec(3.6), abwa: sec(5.4), dive: sec(7.6), land: sec(8.8) };

// flat-crowned acacia (samurah), alone on the plain
const Acacia: React.FC<{ p: Paint; x: number; base: number; s?: number; color: string }> = ({ p, x, base, s = 1, color }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}>
    <path d="M-8 0 L-6 -120 L-50 -190 L-44 -194 L-2 -132 L4 -200 L10 -200 L8 -128 L52 -180 L58 -176 L10 -110 L8 0 Z" fill={p(color)} />
    {[-90, -40, 10, 60, 100].map((dx, i) => (
      <ellipse key={i} cx={dx} cy={-200 - (i % 2) * 14} rx={70} ry={22} fill={p(color)} />
    ))}
  </g>
);

export const Ch1Scene04Abwa: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const dive = interpolate(frame, [T.dive, T.land + 10], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const dusk = interpolate(frame, [T.land, dur], [0, 1], { ...clamp, easing: theme.ease.soft });
  const [ax, ay] = proj(PLACES.abwa);

  return (
    <AbsoluteFill style={{ background: C.void }}>
      {dive > 0 ? (
        <AbsoluteFill style={{ opacity: Math.min(1, dive * 1.5) }}>
          <CinematicCamera keys={[{ f: T.land - 20, x: 30, y: -10, zoom: 1.08 }, { f: dur, x: -30, y: 20, zoom: 1.0 }]} drift={0.6}>
            <Sky stops={[["#141a3a", 0], ["#3a2f5a", 42], ["#8a5a6a", 64], ["#d08a62", 74]]} glow={{ x: 300, y: 1150, r: 700, color: "rgba(240,150,100,0.35)" }} />
            <Stars seed={404} count={120} top={-300} bottom={900} opacity={dusk * 0.9} spin={0.006} />
            <PaperLayer depth={0.1} shadow={10} rim="rgba(250,190,150,0.3)" render={(p) => <path d={ridgePath(401, { x0: -420, x1: 1500, base: 1200, amp: 200, peaks: 5, bottom: 1600 })} fill={p("#4a3a5a")} />} />
            <PaperLayer depth={0.28} shadow={14} render={(p) => <path d={ridgePath(403, { x0: -420, x1: 1500, base: 1300, amp: 110, peaks: 4, bottom: 1700 })} fill={p("#3a2a3e")} />} />
            <PaperLayer
              depth={0.55}
              shadow={18}
              render={(p) => (
                <g>
                  <path d={dunePath(405, { x0: -420, x1: 1500, base: 1440, amp: 30, waves: 0.9, bottom: 2000 })} fill={p("#6a4440")} />
                  <Acacia p={p} x={800} base={1430} s={1.15} color="#241820" />
                  {/* a resting caravan: camels kneel, packs set down */}
                  <Camel p={p} x={300} y={1470} s={0.85} kneel={1} color="#2e1e22" />
                  <Camel p={p} x={470} y={1480} s={0.8} kneel={1} color="#2a1a1e" flip />
                  <rect x={360} y={1452} width={60} height={30} rx={10} fill={p("#5a2a22")} />
                  <rect x={560} y={1458} width={50} height={26} rx={10} fill={p("#4a3a2a")} />
                </g>
              )}
            />
            <Glow x={300} y={1180} r={500} color="#f0a070" opacity={0.25 * (1 - dusk)} depth={0.2} />
            <PaperLayer
              depth={1.15}
              shadow={26}
              shadowOpacity={0.7}
              render={(p) => <path d={dunePath(407, { x0: -420, x1: 1500, base: 1760, amp: 50, waves: 0.6, bottom: 2400 })} fill={p("#1e1418")} />}
            />
            <Dust seed={409} count={26} area={{ x: -100, y: 1250, w: 1300, h: 500 }} color="#f0c8a0" size={2.2} rise={0.1} depth={0.7} opacity={0.4} />
          </CinematicCamera>
        </AbsoluteFill>
      ) : null}
      {dive < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - dive, transform: `scale(${1 + dive * 2})`, transformOrigin: `${ax}px ${ay}px` }}>
          <PageSurface w={1080} h={1920} frame={false} />
          <CinematicCamera keys={[{ f: 0, x: 0, y: 60, zoom: 1.0 }, { f: T.dive, x: -40, y: -10, zoom: 1.1 }]} drift={0.5}>
            <PaperLayer depth={1} shadow={8} shadowOpacity={0.35} render={(p) => <MapShapes p={p} proj={proj} k={MAP_K} />} />
            <DepthFill depth={1}>
              <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
                <MapRoute
                  proj={proj}
                  via={[PLACES.makkah, [39.5, 22.2], [39.3, 23.0], [39.45, 23.9], PLACES.yathrib]}
                  t={interpolate(frame, [T.out, T.out + 70], [0, 1], { ...clamp, easing: theme.ease.inOut })}
                  color={C.inkSoft}
                  width={6}
                  head={false}
                />
                <MapRoute
                  proj={proj}
                  via={[PLACES.yathrib, [39.4, 23.8], PLACES.abwa]}
                  t={interpolate(frame, [T.back, T.abwa], [0, 1], { ...clamp, easing: theme.ease.inOut })}
                  width={9}
                />
                <MapMarker proj={proj} ll={PLACES.makkah} at={T.out - 10} ar="مكة" ms="MAKKAH" k={MAP_K} scale={1.5} />
                <MapMarker proj={proj} ll={PLACES.yathrib} at={T.out + 60} ar="يثرب" ms="YATHRIB" k={MAP_K} scale={1.5} />
                <MapMarker proj={proj} ll={PLACES.abwa} at={T.abwa} ar="الأبواء" ms="AL-ABWA'" k={MAP_K} side="left" scale={1.7} />
              </svg>
            </DepthFill>
          </CinematicCamera>
        </AbsoluteFill>
      ) : null}
      <MalaySubtitle text="Perjalanan pulang dari Yathrib ke Makkah" {...STORY} size={50} start={sec(0.8)} end={sec(5.4)} top={250} color={C.ink} shadow={false} />
      <MalaySubtitle text="Al-Abwa', antara Makkah dan Yathrib" {...STORY} size={50} start={sec(5.6)} end={sec(8.4)} top={250} color={C.ink} shadow={false} />
      <MalaySubtitle text="USIA 6 TAHUN" start={sec(9.2)} end={dur - 38} top={260} size={84} tracking={0.14} color={C.goldLight} />
      <MalaySubtitle text="IBUNDA BAGINDA, AMINAH BINTI WAHB, WAFAT." start={sec(10.6)} end={sec(15.2)} top={500} size={42} tracking={0.06} maxWidth={920} ornament={false} />
      <MalaySubtitle
        text="RASULULLAH SAW KEMUDIAN DIJAGA OLEH DATUKNYA, ABDUL MUTTALIB."
        start={sec(15.5)}
        end={dur - 38}
        top={500}
        size={42}
        tracking={0.06}
        maxWidth={920}
        ornament={false}
      />
      <IllustrationNote start={sec(9.2)} end={dur - 38} text="Menurut riwayat sirah · ilustrasi suasana" />
      <Grade warmth={0.06} />
      <PaperOverlay />
      <Grain />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};
