import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { theme } from "../../theme";
import { CinematicCamera } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer } from "../../components/PaperLayer";
import { Dust, Grade, Grain, PaperOverlay, Stars, Vignette } from "../../components/Atmosphere";
import { Palm } from "../../components/Architecture";
import { Camel, Caravan, Sheep, Tent } from "../../components/Props";
import { PageSurface } from "../../components/Book";
import { MapMarker, MapRoute, MapShapes, PLACES, projection } from "../../components/ArabiaMap";
import { MalaySubtitle, STORY } from "../../components/MalaySubtitle";
import { IllustrationNote } from "../../components/IllustrationNote";
import { dunePath, ridgePath } from "../../components/shapes";
import { clamp } from "../../components/textMotion";
import { sec } from "../../timeline";

const C = theme.colors;
const MAP_K = 420;
const proj = projection(540, 960, MAP_K, 40.3, 21.1);
const T = { route: sec(1.0), dive: sec(5.2), land: sec(6.6) };

// sky keyframes across one symbolic day: morning → noon → sunset → night → dawn
const DAY = [0, 0.3, 0.55, 0.75, 1];
const skyTop = ["#5a7aa8", "#4a78b8", "#4a3a6a", "#060a1f", "#3a4a7a"];
const skyLow = ["#f2d2a0", "#f6e2b8", "#f08a4a", "#1a2244", "#f0b27a"];
const land = ["#c99a62", "#d8aa6e", "#a8603a", "#2a2230", "#b0784a"];
const far = ["#8a7a90", "#9a8aa0", "#7a4a5a", "#1a1a33", "#7a6070"];

export const Ch1Scene03BaniSaad: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const dive = interpolate(frame, [T.dive, T.land + 10], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const day = interpolate(frame, [T.land, dur - 20], [0, 1], clamp);
  const col = (stops: string[]) => interpolateColors(day, DAY, stops);
  const night = interpolate(day, [0.6, 0.72, 0.84, 0.94], [0, 1, 1, 0], clamp);
  const sunA = interpolate(day, [0, 0.62], [-0.15, 1.15], clamp);
  const sunX = 100 + sunA * 880;
  const sunY = 1080 - Math.sin(Math.max(0, Math.min(1, sunA)) * Math.PI) * 620;
  const walk = (frame - T.land) * 1.1;
  const [bx, by] = proj(PLACES.baniSaad);

  return (
    <AbsoluteFill style={{ background: C.void }}>
      {dive > 0 ? (
        <AbsoluteFill style={{ opacity: Math.min(1, dive * 1.6) }}>
          <CinematicCamera keys={[{ f: T.land - 20, x: -60, y: 20, zoom: 1.04 }, { f: dur, x: 60, y: 0, zoom: 1.12 }]}>
            <AbsoluteFill style={{ background: `linear-gradient(180deg, ${col(skyTop)} 0%, ${col(skyLow)} 62%)` }} />
            <Stars seed={303} count={160} top={-300} bottom={1000} opacity={night} />
            <DepthFill depth={0.05}>
              <div
                style={{
                  position: "absolute",
                  left: sunX - 70,
                  top: sunY - 70,
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #fff6d8, #ffd27a 70%)",
                  boxShadow: "0 0 90px 40px rgba(255,210,130,0.4)",
                  opacity: 1 - night,
                }}
              />
            </DepthFill>
            <PaperLayer depth={0.12} shadow={10} rim="rgba(255,230,180,0.3)" render={(p) => <path d={ridgePath(301, { x0: -420, x1: 1500, base: 1160, amp: 240, peaks: 6, bottom: 1600 })} fill={p(col(far))} />} />
            <PaperLayer
              depth={0.3}
              shadow={14}
              render={(p) => <path d={ridgePath(303, { x0: -420, x1: 1500, base: 1260, amp: 150, peaks: 4, bottom: 1700 })} fill={p(interpolateColors(day, DAY, ["#a07050", "#b08058", "#7a4030", "#1e1826", "#8a5a40"]))} />}
            />
            {/* the encampment: goat-hair tents, palms, grazing flock */}
            <PaperLayer
              depth={0.5}
              shadow={16}
              render={(p) => (
                <g>
                  <path d={dunePath(305, { x0: -420, x1: 1500, base: 1360, amp: 30, waves: 1.2, bottom: 1900 })} fill={p(col(land))} />
                  <Tent p={p} x={120} base={1370} w={260} h={120} color="#2a201c" />
                  <Tent p={p} x={520} base={1350} w={200} h={100} color="#33261f" />
                  <Tent p={p} x={860} base={1365} w={240} h={112} color="#2a201c" />
                  <Palm p={p} x={440} base={1355} h={260} lean={-0.08} color="#3a3020" seed={51} sway={Math.sin(frame / 44) * 4} />
                  <Palm p={p} x={780} base={1350} h={220} lean={0.1} color="#3a3020" seed={53} sway={Math.sin(frame / 50 + 1) * 4} />
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Sheep key={i} p={p} x={300 + i * 70 + Math.sin(frame / 90 + i) * 20} y={1420 + (i % 2) * 18} s={0.7} flip={i % 2 === 1} graze={(Math.sin(frame / 25 + i * 2) + 1) / 2} />
                  ))}
                </g>
              )}
            />
            <PaperLayer
              depth={0.72}
              shadow={18}
              render={(p) => (
                <g>
                  <path d={dunePath(307, { x0: -420, x1: 1500, base: 1540, amp: 60, waves: 1, bottom: 2100 })} fill={p(interpolateColors(day, DAY, ["#b07a48", "#c08a52", "#8a4a2c", "#1a1418", "#9a6038"]))} />
                  <Caravan p={p} x={-120} y={1560} n={3} gap={190} walk={walk} s={0.9} color={interpolateColors(day, DAY, ["#5a3a22", "#6a4428", "#3a2014", "#0e0a0c", "#4a2e1c"])} load="#8a3b2a" />
                  <Camel p={p} x={900} y={1540} s={0.8} kneel={1} color={interpolateColors(day, DAY, ["#6a4428", "#7a5030", "#4a2818", "#120c0e", "#5a3820"])} flip />
                </g>
              )}
            />
            <PaperLayer
              depth={1.2}
              shadow={26}
              shadowOpacity={0.7}
              render={(p) => (
                <g>
                  <path d={dunePath(309, { x0: -420, x1: 1500, base: 1790, amp: 70, waves: 0.7, bottom: 2400 })} fill={p(interpolateColors(day, DAY, ["#7a4a2a", "#8a5630", "#5a2a18", "#0a0708", "#6a3c22"]))} />
                  {[180, 260, 900].map((x, i) => (
                    <path key={i} d={`M${x} 1790 l-30 -60 l22 40 l-6 -70 l16 64 l12 -52 l2 58 l26 -44 l-16 60 Z`} fill={p("#2a1a10")} />
                  ))}
                </g>
              )}
            />
            <Dust seed={311} count={30} area={{ x: -100, y: 1200, w: 1300, h: 600 }} color="#ffe2a6" size={2.4} rise={0.15} depth={0.8} opacity={(1 - night) * 0.6} />
          </CinematicCamera>
        </AbsoluteFill>
      ) : null}
      {/* the paper map of the region, which the camera dives into */}
      {dive < 1 ? (
        <AbsoluteFill
          style={{
            opacity: 1 - dive,
            transform: `scale(${1 + dive * 2.2})`,
            transformOrigin: `${bx}px ${by}px`,
          }}
        >
          <PageSurface w={1080} h={1920} frame={false} />
          <CinematicCamera keys={[{ f: 0, x: -40, y: -30, zoom: 1.0 }, { f: T.dive, x: 40, y: 30, zoom: 1.08 }]} drift={0.5}>
            <PaperLayer depth={1} shadow={8} shadowOpacity={0.35} render={(p) => <MapShapes p={p} proj={proj} k={MAP_K} />} />
            <DepthFill depth={1}>
              <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
                <MapRoute
                  proj={proj}
                  via={[PLACES.makkah, [40.1, 21.32], [40.5, 21.05], PLACES.baniSaad]}
                  t={interpolate(frame, [T.route + 20, T.route + 100], [0, 1], { ...clamp, easing: theme.ease.inOut })}
                  width={9}
                />
                <MapMarker proj={proj} ll={PLACES.makkah} at={T.route} ar="مكة" ms="MAKKAH" k={110} side="left" scale={1.6} />
                <MapMarker proj={proj} ll={PLACES.taif} at={T.route + 40} ar="الطائف" ms="TA'IF" k={90} scale={1.3} />
                <MapMarker proj={proj} ll={PLACES.baniSaad} at={T.route + 100} ar="بنو سعد" ms="BANI SA'D (ANGGARAN)" k={200} region scale={1.5} />
              </svg>
            </DepthFill>
          </CinematicCamera>
        </AbsoluteFill>
      ) : null}
      <MalaySubtitle text="Dari Makkah ke perkampungan Bani Sa'd" {...STORY} size={50} start={sec(0.6)} end={sec(5.4)} top={300} color={C.ink} shadow={false} />
      <MalaySubtitle text="ZAMAN KANAK-KANAK BERSAMA HALIMAH AL-SA'DIYAH" start={sec(7.4)} end={sec(13.4)} top={300} size={44} tracking={0.08} maxWidth={940} />
      <MalaySubtitle text="Halimah, ibu susuan Baginda" {...STORY} start={sec(8.4)} end={sec(13.4)} top={480} />
      <MalaySubtitle text="MEMBESAR DALAM SUASANA PERKAMPUNGAN BANI SA'D." start={sec(13.8)} end={dur - 46} top={300} size={44} tracking={0.08} maxWidth={940} />
      <IllustrationNote start={sec(7.4)} end={dur - 46} />
      <Grade warmth={0.1} />
      <PaperOverlay />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
