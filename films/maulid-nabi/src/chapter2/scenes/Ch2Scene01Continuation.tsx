import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { CinematicCamera, sampleCamera, toScreen, type CamKey } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer } from "../../components/PaperLayer";
import { Dust, Glow, Grade, Grain, PaperOverlay, Stars, Vignette } from "../../components/Atmosphere";
import { House, Palm } from "../../components/Architecture";
import { Kaaba } from "../../components/Props";
import { ArabicTitle } from "../../components/ArabicTitle";
import { InkCaption, ScrollCaption } from "../../components/WorldCaption";
import { dunePath, ridgePath } from "../../components/shapes";
import { clamp } from "../../components/textMotion";
import { sec } from "../../timeline";
import { BOOK_PAGE, BookOnTable, TableLight } from "../BookOnTable";

const C = theme.colors;
const P = BOOK_PAGE;
const T = {
  fade: 24,
  oldOut: sec(1.8),
  series: sec(2.0),
  bab: sec(2.8),
  title: sec(3.4),
  titleOut: sec(7.0),
  rise: sec(7.2),
  push: sec(9.0),
  pushEnd: sec(11.4),
  day0: sec(9.6),
  day1: sec(16.4),
  caption: sec(11.6),
  captionEnd: sec(16.8),
  door: sec(16.0),
};
export const CH2_S1_BEATS = T;

// Opens exactly where Chapter 1 ends (camera at zoom 0.85 over the book), then
// settles onto the page.
const BOOK_CAM: CamKey[] = [
  { f: 0, x: 0, y: 26, zoom: 0.85 },
  { f: T.fade, x: 0, y: 26, zoom: 0.85 },
  { f: sec(3.4), x: 0, y: 0, zoom: 1.0 },
  { f: T.push, x: 0, y: 0, zoom: 1.0 },
  { f: T.pushEnd, x: 0, y: 0, zoom: 1.48 },
];
// the window inside the page's gilt frame through which the world rises
const WIN = { x: P.x + 42, y: P.y + 42, w: P.w - 84, h: P.h - 84 };

// the lit doorway the camera finally pushes into (Scene 2 opens out of it)
const TOWN = 0.5;
const DOOR = { x: 568, y: 1220 };
const aim = (zoom: number, f: number, ty = 1037): CamKey => {
  const s = 1 + (zoom - 1) * TOWN;
  return { f, x: (s * (DOOR.x - 540)) / TOWN, y: (s * (DOOR.y - 960) - (ty - 960)) / TOWN, zoom };
};
const WORLD_CAM = (dur: number): CamKey[] => [
  { f: T.rise, x: 0, y: 40, zoom: 0.9 },
  { f: T.pushEnd, x: 0, y: 10, zoom: 1.0 },
  { f: T.door, x: 20, y: 30, zoom: 1.04 },
  aim(2.2, dur),
];

// one illustrative day: dawn → noon → dusk → night → dawn (fraction of a day)
const DAY = [0, 0.25, 0.5, 0.62, 0.8, 1];
const SKY_TOP = ["#3a4a7a", "#4a7ab8", "#4a3a6a", "#0a1030", "#060a1f", "#3a4a7a"];
const SKY_LOW = ["#f0b27a", "#f6e2b8", "#f08a4a", "#2a2a4a", "#141a33", "#f0b27a"];
const FAR = ["#7a5a6a", "#9a8a90", "#6a3a4a", "#1e1a34", "#14142a", "#7a5a6a"];
const MID = ["#8a5a48", "#a87a5a", "#7a4232", "#221c2c", "#18141f", "#8a5a48"];
const WALL = ["#b07a4c", "#c99a62", "#a0603a", "#3a2c32", "#2a2028", "#b07a4c"];
const SHADE = ["#7a5034", "#946a44", "#6a3a26", "#241c22", "#1a1418", "#7a5034"];
const GROUND = ["#8a5a36", "#a8784a", "#7a4428", "#1e1820", "#161218", "#8a5a36"];

// Makkah's valley, shown passing through days: the town the page drawing becomes
const World: React.FC<{ dur: number; d: number; rise: (i: number) => number }> = ({ dur, d, rise }) => {
  const frac = d - Math.floor(d);
  const col = (stops: string[]) => interpolateColors(frac, DAY, stops);
  const night = interpolate(frac, [0.5, 0.62, 0.9, 1], [0, 1, 1, 0], clamp);
  const lit = interpolate(frac, [0.45, 0.58, 0.95, 1], [0, 1, 1, 0], clamp);
  const sunA = interpolate(frac, [0, 0.55], [-0.1, 1.1], clamp);
  const sunX = 100 + sunA * 880;
  const sunY = 1050 - Math.sin(Math.max(0, Math.min(1, sunA)) * Math.PI) * 560;
  const lamp = interpolateColors(lit, [0, 1], [col(SHADE), C.lamp]);
  const up = (i: number): { transform: string; opacity: number } => {
    const r = rise(i);
    return { transform: `translateY(${(1 - r) * 520}px)`, opacity: Math.min(1, r * 2.5) };
  };
  return (
    <CinematicCamera keys={WORLD_CAM(dur)} drift={0.4}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${col(SKY_TOP)} 0%, ${col(SKY_LOW)} 62%)`, opacity: Math.min(1, rise(0) * 3) }} />
      <Stars seed={2101} count={180} top={-300} bottom={1000} opacity={night} spin={0.03} />
      <DepthFill depth={0.05} style={{ opacity: interpolate(frac, [0, 0.06, 0.5, 0.6], [0, 1, 1, 0], clamp) * Math.min(1, rise(0) * 2) }}>
        <div
          style={{
            position: "absolute",
            left: sunX - 62,
            top: sunY - 62,
            width: 124,
            height: 124,
            borderRadius: "50%",
            background: "radial-gradient(circle, #fff6d8, #ffd27a 70%)",
            boxShadow: "0 0 90px 40px rgba(255,210,130,0.4)",
          }}
        />
      </DepthFill>
      <PaperLayer depth={0.12} shadow={10} {...up(0)} render={(p) => <path d={ridgePath(2111, { x0: -420, x1: 1500, base: 1060, amp: 420, peaks: 4, bottom: 1500 })} fill={p(col(FAR))} />} />
      <PaperLayer depth={0.25} shadow={12} {...up(1)} render={(p) => <path d={ridgePath(2113, { x0: -420, x1: 1500, base: 1170, amp: 220, peaks: 5, bottom: 1700, rough: 0.25 })} fill={p(col(MID))} />} />
      {/* the Ka'bah in its valley, among the houses of Quraysh */}
      <PaperLayer
        depth={0.38}
        shadow={12}
        {...up(2)}
        render={(p) => (
          <g>
            <path d={dunePath(2115, { x0: -420, x1: 1500, base: 1200, amp: 14, waves: 0.8, bottom: 1700 })} fill={p(col(GROUND))} />
            {[[-160, 150, 90], [0, 120, 70], [140, 110, 100], [520, 130, 80], [690, 150, 110], [880, 140, 80], [1060, 160, 100]].map(([x, w, h], i) => (
              <House key={i} p={p} x={x} base={1196} w={w} h={h} body={col(WALL)} shade={col(SHADE)} dark="#1e1612" lamp={lamp} seed={2120 + i} lit={0.5} />
            ))}
            <Kaaba p={p} x={340} base={1198} w={100} h={86} />
          </g>
        )}
      />
      <PaperLayer
        depth={TOWN}
        shadow={16}
        {...up(3)}
        render={(p) => (
          <g>
            <path d={dunePath(2117, { x0: -420, x1: 1500, base: 1262, amp: 10, waves: 0.7, bottom: 1800 })} fill={p(col(GROUND))} />
            <House p={p} x={140} base={1256} w={190} h={150} body={col(WALL)} shade={col(SHADE)} dark="#1e1612" lamp={lamp} seed={2131} lit={0.6} />
            <House p={p} x={760} base={1258} w={220} h={170} body={col(WALL)} shade={col(SHADE)} dark="#1e1612" lamp={lamp} seed={2133} lit={0.6} />
            {/* the house whose doorway the camera enters */}
            <rect x={470} y={1080} width={200} height={170} fill={p(col(WALL))} />
            <path d="M670 1080 L702 1090 L702 1250 L670 1250 Z" fill={p(col(SHADE))} />
            {Array.from({ length: 7 }).map((_, i) => (
              <rect key={i} x={470 + i * 28.6} y={1068} width={14} height={13} fill={p(col(WALL))} />
            ))}
            <path d={`M${DOOR.x - 22} 1250 L${DOOR.x - 22} 1196 Q${DOOR.x} 1178 ${DOOR.x + 22} 1196 L${DOOR.x + 22} 1250 Z`} fill={p(interpolateColors(lit, [0, 1], ["#1e1612", C.lampCore]))} />
            <rect x={500} y={1120} width={16} height={26} rx={2} fill={p(lamp)} />
          </g>
        )}
      />
      <Glow x={DOOR.x} y={DOOR.y} r={110} color={C.lamp} opacity={lit * 0.9} depth={TOWN} />
      <PaperLayer
        depth={0.62}
        shadow={18}
        {...up(4)}
        render={(p) => (
          <g>
            <Palm p={p} x={-30} base={1330} h={380} lean={0.1} color={interpolateColors(night, [0, 1], ["#2a3a24", "#10140f"])} seed={2141} />
            <Palm p={p} x={1080} base={1340} h={420} lean={-0.12} color={interpolateColors(night, [0, 1], ["#2a3a24", "#10140f"])} seed={2143} />
          </g>
        )}
      />
      {/* the lane down to the houses: low walls, a well, rocks and scrub */}
      <PaperLayer
        depth={0.82}
        shadow={20}
        {...up(5)}
        render={(p) => (
          <g>
            <path d={dunePath(2151, { x0: -420, x1: 1500, base: 1400, amp: 18, waves: 0.5, bottom: 2200 })} fill={p(col(GROUND))} />
            <path d="M380 2200 C420 1800 640 1600 560 1400 L600 1400 C700 1600 520 1820 760 2200 Z" fill={p(interpolateColors(frac, DAY, ["#b0804e", "#c9a06a", "#a06a40", "#2a2228", "#201a20", "#b0804e"]))} />
            <rect x={-200} y={1440} width={480} height={60} fill={p(col(WALL))} />
            <rect x={-200} y={1430} width={480} height={14} fill={p(col(SHADE))} />
            <ellipse cx={170} cy={1580} rx={86} ry={26} fill={p("#3a2c26")} />
            <path d="M84 1580 L84 1620 Q170 1650 256 1620 L256 1580 Q170 1606 84 1580 Z" fill={p(col(SHADE))} />
            <ellipse cx={170} cy={1580} rx={58} ry={15} fill={p("#0e0a0a")} />
            {[[860, 1520, 70], [960, 1560, 46], [800, 1600, 34]].map(([x, y, r], i) => (
              <path key={i} d={`M${x - r} ${y} Q${x - r} ${y - r * 0.9} ${x} ${y - r} Q${x + r} ${y - r * 0.8} ${x + r} ${y} Z`} fill={p(col(SHADE))} />
            ))}
            {[300, 700, 1040].map((x, i) => (
              <path key={"s" + i} d={`M${x - 40} ${1470 + i * 30} q10 -40 20 -6 q8 -44 20 -4 q12 -40 22 -2 q10 -30 18 12 Z`} fill={p(interpolateColors(night, [0, 1], ["#4a5a30", "#14180f"]))} />
            ))}
          </g>
        )}
      />
      <PaperLayer depth={1.15} shadow={26} shadowOpacity={0.7} {...up(6)} render={(p) => <path d={dunePath(2145, { x0: -420, x1: 1500, base: 1780, amp: 46, waves: 0.6, bottom: 2400 })} fill={p(interpolateColors(night, [0, 1], ["#4a2a1a", "#120e12"]))} />} />
      <Dust seed={2147} count={30} area={{ x: -100, y: 900, w: 1300, h: 800 }} color="#ffe2a6" size={2.4} rise={0.2} depth={0.7} opacity={0.6 * (1 - night * 0.7) * Math.min(1, rise(5))} />
    </CinematicCamera>
  );
};

// gold-ink line drawing on the page, as Chapter 1 left it
const KaabaOutline: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg width={P.w} height={P.h} style={{ position: "absolute", inset: 0, opacity }}>
    <g fill="none" stroke={C.goldDeep} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 900 L170 640 L250 760 L360 520 L470 780 L560 700 L650 820 L760 560 L900 900" />
      <path d="M40 980 L200 860 L320 930 L470 850 L620 940 L760 860 L900 980" opacity={0.6} />
      <path d="M370 1180 L370 960 L560 960 L560 1180 Z" strokeWidth={5} />
      <path d="M560 960 L640 985 L640 1170 L560 1180" strokeWidth={5} />
      <path d="M370 1010 L560 1010 M370 1060 L560 1060 M370 1110 L560 1110" opacity={0.5} />
      <path d="M60 1190 L880 1190" />
    </g>
  </svg>
);

export const Ch2Scene01Continuation: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, T.fade], [1, 0], { ...clamp, easing: theme.ease.out });
  // the paper layers stand up out of the page one after another, like a pop-up book
  const rise = (i: number) => spring({ frame: frame - (T.rise + i * 6), fps, config: { damping: 13, stiffness: 110, mass: 0.7 } });
  // passing days: an eased sweep through two and a half illustrative days
  const d = interpolate(frame, [T.day0, T.day1], [0.15, 2.6], { ...clamp, easing: theme.ease.inOut });
  const drawing = interpolate(frame, [T.rise, T.rise + 30], [1, 0], clamp);
  const book = frame < T.pushEnd + 2;
  const win = (() => {
    const cam = sampleCamera(BOOK_CAM, frame);
    const [l, t] = toScreen(cam, WIN.x, WIN.y, 1);
    const [r, b] = toScreen(cam, WIN.x + WIN.w, WIN.y + WIN.h, 1);
    return `inset(${t}px ${1080 - r}px ${1920 - b}px ${l}px)`;
  })();

  return (
    <AbsoluteFill style={{ background: C.void }}>
      {book ? (
        <AbsoluteFill>
          <CinematicCamera keys={BOOK_CAM} drift={0}>
            <BookOnTable>
              <KaabaOutline opacity={drawing} />
              <InkCaption lines={["BERSAMBUNG..."]} start={-100} end={T.oldOut} top={1214} width={P.w} size={60} tracking={0.2} />
              <InkCaption lines={["BAB 2 — ZAMAN REMAJA DAN", "MENJELANG KERASULAN"]} start={-100} end={T.oldOut} top={1290} width={P.w} size={40} tracking={0.08} color={C.goldDeep} />
              <ArabicTitle text="سِيرَةُ النَّبِيِّ مُحَمَّدٍ ﷺ" start={T.series} end={T.titleOut} top={70} size={60} tone="ink" shadow={false} maxWidth={800} lineHeight={1.6} revealLen={40} />
              <InkCaption lines={["PERJALANAN HIDUP RASULULLAH SAW"]} start={T.series + 30} end={T.titleOut} top={200} width={P.w} size={26} tracking={0.14} color={C.inkSoft} per={20} />
              <InkCaption lines={["BAB 2"]} start={T.bab} end={T.titleOut} top={1206} width={P.w} size={58} tracking={0.24} color={C.goldDeep} per={16} />
              <InkCaption lines={["ZAMAN REMAJA DAN", "KEHIDUPAN SEBELUM KENABIAN"]} start={T.title} end={T.titleOut} top={1286} width={P.w} size={40} tracking={0.08} per={26} />
            </BookOnTable>
          </CinematicCamera>
          <TableLight />
        </AbsoluteFill>
      ) : null}
      {frame >= T.rise - 1 ? (
        <AbsoluteFill style={{ clipPath: book ? win : undefined }}>
          <World dur={dur} d={d} rise={rise} />
        </AbsoluteFill>
      ) : null}
      <ScrollCaption lines={["Tahun demi tahun, Baginda membesar", "menjadi seorang remaja di Makkah"]} start={T.caption} end={T.captionEnd} top={210} size={40} />
      <Grade warmth={0.08} />
      <PaperOverlay opacity={0.22} />
      <Grain />
      <Vignette strength={0.6} />
      <AbsoluteFill style={{ background: "#000", opacity: fadeIn }} />
    </AbsoluteFill>
  );
};
