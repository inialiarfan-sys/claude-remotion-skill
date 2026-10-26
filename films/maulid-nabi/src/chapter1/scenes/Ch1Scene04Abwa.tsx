import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { CinematicCamera, type CamKey } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer, type Paint } from "../../components/PaperLayer";
import { Dust, Glow, Grade, Grain, PaperOverlay, Stars, Vignette } from "../../components/Atmosphere";
import { Camel } from "../../components/Props";
import { PageSurface } from "../../components/Book";
import { MapMarker, MapRoute, MapShapes, PLACES, projection } from "../../components/ArabiaMap";
import { CalloutLabel, InkCaption, ScrollCaption } from "../../components/WorldCaption";
import { IllustrationNote } from "../../components/IllustrationNote";
import { dunePath, ridgePath } from "../../components/shapes";
import { clamp } from "../../components/textMotion";
import { sec } from "../../timeline";

const C = theme.colors;
const MAP_K = 300;
const proj = projection(540, 980, MAP_K, 39.6, 22.95);
const T = { out: sec(0.6), back: sec(2.4), abwa: sec(5.2), callout: sec(5.6), dive: sec(7.6), land: sec(8.8), age: sec(9.0), wafat: sec(10.4), care: sec(15.4) };
export const CH1_S4_BEATS = T;

const at = (ll: [number, number], s: number, f: number): CamKey => {
  const [x, y] = proj(ll);
  return { f, x: s * (x - 540), y: s * (y - 960), zoom: s };
};
// overview of both towns, then ride the return route down to al-Abwa'
const MAP_CAM: CamKey[] = [
  { f: 0, x: 0, y: 0, zoom: 1.0 },
  { f: T.back - 6, x: 0, y: 0, zoom: 1.0 },
  at(PLACES.yathrib, 1.25, T.back + 16),
  at(PLACES.abwa, 1.35, T.abwa),
  at(PLACES.abwa, 1.4, T.dive + 30),
];

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
  const { fps } = useVideoConfig();
  const dive = interpolate(frame, [T.dive, T.land], [0, 1], { ...clamp, easing: theme.ease.inOut });
  // dusk deepens into night across the scene — the only "motion" in the solemn part
  const dusk = interpolate(frame, [T.land, dur], [0, 1], { ...clamp, easing: theme.ease.soft });
  const sky = (a: string, b: string) => interpolateColors(dusk, [0, 1], [a, b]);
  const [ax, ay] = proj(PLACES.abwa);

  return (
    <AbsoluteFill style={{ background: C.void }}>
      {dive > 0 ? (
        <AbsoluteFill style={{ clipPath: `circle(${dive * 125}% at 540px 960px)` }}>
          <CinematicCamera keys={[{ f: T.dive, x: -10, y: 0, zoom: 1.04 }, { f: T.land, x: -20, y: 0, zoom: 1.0 }, { f: dur, x: 40, y: 30, zoom: 1.1 }]} drift={0.5}>
            <AbsoluteFill
              style={{
                background: `linear-gradient(180deg, ${sky("#141a3a", "#070a1c")} 0%, ${sky("#3a2f5a", "#151633")} 42%, ${sky("#8a5a6a", "#2a2440")} 64%, ${sky("#d08a62", "#4a3448")} 74%)`,
              }}
            />
            <Stars seed={404} count={140} top={-300} bottom={900} opacity={0.15 + dusk * 0.85} spin={0.006} />
            <PaperLayer depth={0.1} shadow={10} rim={`rgba(250,190,150,${0.3 * (1 - dusk)})`} render={(p) => <path d={ridgePath(401, { x0: -420, x1: 1500, base: 1200, amp: 200, peaks: 5, bottom: 1600 })} fill={p(sky("#4a3a5a", "#24203a"))} />} />
            <PaperLayer depth={0.28} shadow={14} render={(p) => <path d={ridgePath(403, { x0: -420, x1: 1500, base: 1300, amp: 110, peaks: 4, bottom: 1700 })} fill={p(sky("#3a2a3e", "#1c1626"))} />} />
            <Glow x={300} y={1180} r={500} color="#f0a070" opacity={0.3 * (1 - dusk)} depth={0.2} />
            <PaperLayer
              depth={0.55}
              shadow={18}
              render={(p) => (
                <g>
                  <path d={dunePath(405, { x0: -420, x1: 1500, base: 1440, amp: 30, waves: 0.9, bottom: 2000 })} fill={p(sky("#6a4440", "#2e2028"))} />
                  <Acacia p={p} x={800} base={1430} s={1.15} color="#241820" />
                  {/* a resting caravan: camels kneel, packs set down */}
                  <Camel p={p} x={300} y={1470} s={0.85} kneel={1} color="#2e1e22" />
                  <Camel p={p} x={470} y={1480} s={0.8} kneel={1} color="#2a1a1e" flip />
                  <rect x={360} y={1452} width={60} height={30} rx={10} fill={p("#5a2a22")} />
                  <rect x={560} y={1458} width={50} height={26} rx={10} fill={p("#4a3a2a")} />
                </g>
              )}
            />
            <PaperLayer
              depth={1.15}
              shadow={26}
              shadowOpacity={0.7}
              render={(p) => <path d={dunePath(407, { x0: -420, x1: 1500, base: 1760, amp: 50, waves: 0.6, bottom: 2400 })} fill={p("#1e1418")} />}
            />
            <Dust seed={409} count={26} area={{ x: -100, y: 1250, w: 1300, h: 500 }} color="#f0c8a0" size={2.2} rise={0.1} depth={0.7} opacity={0.4 * (1 - dusk * 0.6)} />
          </CinematicCamera>
        </AbsoluteFill>
      ) : null}
      {dive < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - dive, transform: `scale(${1 + dive * 0.8})`, transformOrigin: `540px 960px` }}>
          <PageSurface w={1080} h={1920} frame={false} />
          <CinematicCamera keys={MAP_CAM} drift={0.5}>
            <PaperLayer
              depth={1}
              shadow={8}
              shadowOpacity={0.35}
              render={(p) => <MapShapes p={p} proj={proj} k={MAP_K} rise={(i) => spring({ frame: frame - (10 + i * 2), fps, config: { damping: 9, stiffness: 140, mass: 0.5 } })} />}
            />
            <DepthFill depth={1}>
              <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
                <MapRoute
                  proj={proj}
                  via={[PLACES.makkah, [39.5, 22.2], [39.3, 23.0], [39.45, 23.9], PLACES.yathrib]}
                  t={interpolate(frame, [T.out, T.back - 10], [0, 1], { ...clamp, easing: theme.ease.inOut })}
                  color={C.inkSoft}
                  width={6}
                  head={false}
                />
                <MapRoute
                  proj={proj}
                  via={[PLACES.yathrib, [39.4, 23.8], PLACES.abwa]}
                  t={interpolate(frame, [T.back + 16, T.abwa], [0, 1], { ...clamp, easing: theme.ease.inOut })}
                  width={9}
                  icon="camel"
                />
                <MapMarker proj={proj} ll={PLACES.makkah} at={4} ar="مكة" ms="MAKKAH" k={MAP_K} scale={1.5} />
                <MapMarker proj={proj} ll={PLACES.yathrib} at={T.out + 40} ar="يثرب" ms="YATHRIB" k={MAP_K} scale={1.5} />
                <MapMarker proj={proj} ll={PLACES.abwa} at={T.abwa} ar="الأبواء" ms="AL-ABWA'" k={MAP_K} side="left" scale={1.7} />
              </svg>
            </DepthFill>
            <CalloutLabel target={[ax - 4, ay + 14]} label={[300, 690]} lines={["Al-Abwa',", "antara Makkah dan Yathrib"]} start={T.callout} end={T.dive + 6} depth={1} size={38} width={500} lineColor={C.inkSoft} />
          </CinematicCamera>
        </AbsoluteFill>
      ) : null}
      <ScrollCaption lines={["Perjalanan pulang dari Yathrib ke Makkah"]} start={sec(0.8)} end={T.callout} top={230} size={38} />
      <InkCaption lines={["USIA 6 TAHUN"]} start={T.age} end={dur - 38} top={250} size={80} tracking={0.14} color={C.goldLight} shadow per={30} />
      <InkCaption lines={["IBUNDA BAGINDA, AMINAH BINTI WAHB,", "WAFAT."]} start={T.wafat} end={sec(15.0)} top={440} size={40} color={C.parchmentLight} shadow per={34} />
      <InkCaption lines={["RASULULLAH SAW KEMUDIAN DIJAGA", "OLEH DATUKNYA, ABDUL MUTTALIB."]} start={T.care} end={dur - 38} top={440} size={40} color={C.parchmentLight} shadow per={30} />
      <IllustrationNote start={T.age} end={dur - 38} text="Menurut riwayat sirah · ilustrasi suasana" />
      <Grade warmth={0.06} />
      <PaperOverlay />
      <Grain />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};
