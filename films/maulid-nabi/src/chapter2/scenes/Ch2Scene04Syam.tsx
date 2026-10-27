import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { CinematicCamera, sampleCamera, toScreen, type CamKey } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer } from "../../components/PaperLayer";
import { Dust, Glow, Grade, Grain, PaperOverlay, Stars, Vignette } from "../../components/Atmosphere";
import { Caravan, Tent } from "../../components/Props";
import { PageSurface } from "../../components/Book";
import { CompassRose, MapMarker, MapRoute, MapShapes, PLACES, projection, routeHead, type LonLat } from "../../components/ArabiaMap";
import { InkCaption, ScrollCaption } from "../../components/WorldCaption";
import { HistoricalDisclaimer } from "../../components/HistoricalDisclaimer";
import { dunePath, ridgePath } from "../../components/shapes";
import { clamp } from "../../components/textMotion";
import { sec } from "../../timeline";
import { BasaltTown } from "../props";

const C = theme.colors;
const MAP_K = 70;
const proj = projection(540, 960, MAP_K, 38.2, 27.0);
const VIA: LonLat[] = [PLACES.makkah, PLACES.yathrib, [38.0, 27.5], [36.8, 30.5], PLACES.syam];
const T = {
  yathrib: sec(2.0),
  busra: sec(3.0),
  follow: sec(3.4),
  route0: sec(3.6),
  route1: sec(10.0),
  dive: sec(10.6),
  land: sec(11.8),
  cap2: sec(12.2),
  cap2End: sec(17.0),
  cap3: sec(17.4),
  cap3End: sec(23.4),
  age: sec(23.6),
};
export const CH2_S4_BEATS = T;

const routeT = (f: number) => interpolate(f, [T.route0, T.route1], [0, 1], { ...clamp, easing: theme.ease.inOut });

// overview of the whole road, then the camera rides with the caravan icon north
const MAP_CAM: CamKey[] = (() => {
  const keys: CamKey[] = [{ f: 0, x: 0, y: 30, zoom: 0.98 }];
  for (let f = T.follow; f <= T.dive + 40; f++) {
    const zoom = interpolate(f, [T.follow, T.follow + 40], [1.0, 1.6], { ...clamp, easing: theme.ease.inOut });
    const b = (zoom - 1) / 0.6;
    const [hx, hy] = routeHead(proj, VIA, routeT(f - 6));
    keys.push({ f, x: zoom * (hx - 540) * b, y: zoom * (hy - 960) * b + 30 * (1 - b), zoom });
  }
  return keys;
})();

const Busra: React.FC<{ dur: number; frame: number }> = ({ dur, frame }) => {
  const arrive = interpolate(frame, [T.dive, sec(20)], [0, 760], { ...clamp, easing: theme.ease.out });
  const dusk = interpolate(frame, [T.land, dur], [0, 1], { ...clamp, easing: theme.ease.soft });
  return (
    <CinematicCamera keys={[{ f: T.dive, x: 40, y: 0, zoom: 1.08 }, { f: T.land, x: 20, y: 0, zoom: 1.0 }, { f: dur, x: -60, y: 30, zoom: 1.12 }]} drift={0.5}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #1e2448 0%, #4a3a62 34%, #b0646a 56%, #f0a060 68%)" }} />
      <Stars seed={2401} count={90} top={-300} bottom={700} opacity={0.2 + dusk * 0.6} spin={0.006} />
      <Glow x={300} y={1150} r={560} color="#f6a868" opacity={0.4 * (1 - dusk * 0.5)} depth={0.1} />
      <PaperLayer depth={0.12} shadow={10} rim="rgba(250,190,150,0.3)" render={(p) => <path d={ridgePath(2403, { x0: -420, x1: 1500, base: 1180, amp: 140, peaks: 6, bottom: 1600 })} fill={p("#4a3448")} />} />
      {/* Bosra's black basalt gate and colonnade */}
      <PaperLayer
        depth={0.35}
        shadow={16}
        rim="rgba(255,190,140,0.35)"
        render={(p) => (
          <g>
            <path d={dunePath(2405, { x0: -420, x1: 1500, base: 1270, amp: 10, waves: 0.6, bottom: 1700 })} fill={p("#5a3a36")} />
            <BasaltTown p={p} base={1262} lit={C.lamp} />
          </g>
        )}
      />
      <Glow x={430} y={1120} r={120} color={C.lamp} opacity={0.35 + dusk * 0.4} depth={0.35} />
      <PaperLayer
        depth={0.55}
        shadow={18}
        render={(p) => (
          <g>
            <path d={dunePath(2407, { x0: -420, x1: 1500, base: 1400, amp: 22, waves: 0.7, bottom: 1900 })} fill={p("#7a4a36")} />
            <Tent p={p} x={-120} base={1404} w={260} h={140} color="#2a1e1e" />
            <Tent p={p} x={900} base={1410} w={220} h={120} color="#30221e" />
          </g>
        )}
      />
      {/* the caravan comes in from the desert road and halts before the town */}
      <PaperLayer
        depth={0.72}
        shadow={20}
        render={(p) => (
          <g>
            <path d={dunePath(2409, { x0: -420, x1: 1500, base: 1540, amp: 30, waves: 0.6, bottom: 2100 })} fill={p("#8a5236")} />
            <Caravan p={p} x={1500} y={1560} n={5} gap={170} walk={arrive} s={0.8} color="#2a1610" load="#6a2e1e" dir={-1} />
          </g>
        )}
      />
      <PaperLayer depth={1.15} shadow={26} shadowOpacity={0.7} render={(p) => <path d={dunePath(2411, { x0: -420, x1: 1500, base: 1800, amp: 50, waves: 0.6, bottom: 2400 })} fill={p("#2a1812")} />} />
      <Dust seed={2413} count={34} area={{ x: -100, y: 1200, w: 1300, h: 600 }} color="#f0c8a0" size={2.4} rise={0.12} depth={0.7} opacity={0.6} />
    </CinematicCamera>
  );
};

export const Ch2Scene04Syam: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dive = interpolate(frame, [T.dive, T.land], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const [bx, by] = toScreen(sampleCamera(MAP_CAM, T.dive), ...proj(PLACES.syam), 1);
  const t = routeT(frame);

  return (
    <AbsoluteFill style={{ background: C.void }}>
      {dive > 0 ? (
        <AbsoluteFill style={{ clipPath: `circle(${dive * 125}% at ${bx}px ${by}px)` }}>
          <Busra dur={dur} frame={frame} />
        </AbsoluteFill>
      ) : null}
      {dive < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - dive, transform: `scale(${1 + dive * 0.8})`, transformOrigin: `${bx}px ${by}px` }}>
          <PageSurface w={1080} h={1920} frame={false} />
          <CinematicCamera keys={MAP_CAM} drift={0.4}>
            <PaperLayer
              depth={1}
              shadow={8}
              shadowOpacity={0.35}
              render={(p) => (
                <g>
                  <MapShapes p={p} proj={proj} k={MAP_K} rise={(i) => spring({ frame: frame - (12 + i * 2), fps, config: { damping: 9, stiffness: 140, mass: 0.5 } })} />
                  <CompassRose x={880} y={1560} r={70} p={p} />
                </g>
              )}
            />
            <DepthFill depth={1}>
              <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
                <MapMarker proj={proj} ll={[36.9, 33.5]} at={T.busra - 10} ms="SYAM" k={MAP_K} region color={C.goldDeep} scale={1.3} />
                <MapRoute proj={proj} via={VIA} t={t} width={8} icon="camel" />
                <MapMarker proj={proj} ll={PLACES.makkah} at={16} ar="مكة" ms="MAKKAH" k={MAP_K} scale={1.4} />
                <MapMarker proj={proj} ll={PLACES.yathrib} at={T.yathrib} ar="يثرب" ms="YATHRIB" k={MAP_K} side="left" scale={1.4} />
                <MapMarker proj={proj} ll={PLACES.syam} at={T.busra} ar="بصرى" ms="BUSRA" k={MAP_K} scale={1.4} />
              </svg>
            </DepthFill>
          </CinematicCamera>
        </AbsoluteFill>
      ) : null}
      <ScrollCaption lines={["Menurut riwayat, Baginda mengikuti", "kafilah dagang Abu Talib ke Syam."]} start={sec(1.0)} end={sec(7.6)} top={200} size={40} />
      <ScrollCaption lines={["Busra, di pinggir negeri Syam"]} sub="Ilustrasi suasana" start={T.cap2} end={T.cap2End} top={200} size={42} />
      <ScrollCaption
        lines={["Riwayat ini turut menyebut pertemuan", "dengan seorang rahib di Busra."]}
        sub="Sebahagian butirannya dipertikaikan oleh ulama hadis"
        start={T.cap3}
        end={T.cap3End}
        top={200}
        size={40}
      />
      <InkCaption lines={["Usia Baginda ketika itu", "berbeza menurut riwayat."]} start={T.age} end={dur - 24} top={250} size={42} italic weight={600} tracking={0.01} color={C.parchmentLight} shadow per={30} />
      <HistoricalDisclaimer start={sec(1.4)} end={dur - 20} top={1590} lines={["RIWAYAT AL-TIRMIDHI", "SEBAHAGIAN BUTIRAN DIPERTIKAIKAN"]} />
      <Grade warmth={0.08} />
      <PaperOverlay />
      <Grain />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};
