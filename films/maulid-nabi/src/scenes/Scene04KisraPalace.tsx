import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { CinematicCamera } from "../components/CinematicCamera";
import { PaperLayer, type Paint } from "../components/PaperLayer";
import { Dust, Glow, Grade, Grain, PaperOverlay, Sky, Stars, Vignette } from "../components/Atmosphere";
import { parabolicArchPath, pointedArchPath, ridgePath, roundArchPath } from "../components/shapes";
import { ArabicTitle } from "../components/ArabicTitle";
import { MalaySubtitle } from "../components/MalaySubtitle";
import { HistoricalDisclaimer } from "../components/HistoricalDisclaimer";
import { clamp } from "../components/textMotion";
import { noise1 } from "../random";
import { sec } from "../timeline";

const C = theme.colors;
const BASE = 1440;
const TOP = 770;
const VAULT = { cx: 540, w: 470, h: 720 };
const WINGS: [number, number][] = [
  [-170, VAULT.cx - VAULT.w / 2],
  [VAULT.cx + VAULT.w / 2, 1250],
];
const ROWS = [
  { y0: BASE, y1: 1190, n: 3 },
  { y0: 1180, y1: 1020, n: 5 },
  { y0: 1010, y1: 900, n: 7 },
  { y0: 890, y1: 800, n: 9 },
];
const MERLON_W = 30;
const MERLON_STEP = 44;
const merlonXs = Array.from({ length: Math.ceil(1420 / MERLON_STEP) }, (_, i) => -170 + i * MERLON_STEP).filter(
  (x) => x + MERLON_W < WINGS[0][1] - 8 || x > WINGS[1][0] + 8,
);
// a few decorative merlons come loose — not the whole palace
const FALLING = [
  { x: merlonXs[5], at: sec(5.8), spin: 3.1 },
  { x: merlonXs[8], at: sec(6.5), spin: -2.4 },
  { x: merlonXs[merlonXs.length - 9], at: sec(6.1), spin: 2.2 },
  { x: merlonXs[merlonXs.length - 6], at: sec(7.0), spin: -3.4 },
];

// Sasanian stepped merlon
const merlonPath = (x: number, y: number) =>
  `M${x} ${y} L${x} ${y - 16} L${x + 6} ${y - 16} L${x + 6} ${y - 28} L${x + 12} ${y - 28} L${x + 12} ${y - 40} L${x + 18} ${y - 40} L${x + 18} ${y - 28} L${x + 24} ${y - 28} L${x + 24} ${y - 16} L${x + 30} ${y - 16} L${x + 30} ${y} Z`;

const cloudPath = (x: number, y: number, w: number, h: number) => {
  const bumps = Math.max(3, Math.round(w / 90));
  let d = `M${x} ${y}`;
  for (let i = 0; i < bumps; i++) {
    const bx = x + (w / bumps) * (i + 1);
    const r = (w / bumps) * 0.62;
    d += ` A${r} ${h * (0.7 + (i % 2) * 0.35)} 0 0 1 ${bx} ${y}`;
  }
  return d + " Z";
};

const Facade: React.FC<{ p: Paint }> = ({ p }) => (
  <g>
    {/* façade wall */}
    <rect x={-170} y={TOP} width={1420} height={BASE - TOP} fill={p(C.stone)} />
    {/* tiers of blind arcades */}
    {WINGS.map(([x0, x1], wi) =>
      ROWS.map((r, ri) => {
        const cell = (x1 - x0) / r.n;
        return Array.from({ length: r.n }).map((_, i) => {
          const nx = x0 + i * cell + cell * 0.18;
          const nw = cell * 0.64;
          const nh = (r.y0 - r.y1) * 0.86;
          return (
            <g key={`${wi}-${ri}-${i}`}>
              <path d={roundArchPath(nx, r.y0 - 4, nw, nh)} fill={p(C.stoneDark)} />
              <path d={roundArchPath(nx + nw * 0.14, r.y0 - 4, nw * 0.72, nh * 0.86)} fill={p(C.stoneDeep)} />
              <rect x={x0 + i * cell - 5} y={r.y1 + 6} width={10} height={r.y0 - r.y1 - 6} fill={p(C.stoneLight)} />
            </g>
          );
        });
      }),
    )}
    {/* string courses */}
    {ROWS.map((r, i) => (
      <rect key={"sc" + i} x={-170} y={r.y1 - 6} width={1420} height={12} fill={p(C.stoneLight)} />
    ))}
    <rect x={-170} y={TOP - 4} width={1420} height={14} fill={p(C.stoneLight)} />
    {/* the great vault: lit outer ring, deep interior */}
    <path d={parabolicArchPath(VAULT.cx, BASE, VAULT.w + 60, VAULT.h + 50)} fill={p(C.stoneLight)} />
    <path d={parabolicArchPath(VAULT.cx, BASE, VAULT.w, VAULT.h)} fill={p(C.stone)} />
    <path d={parabolicArchPath(VAULT.cx, BASE, VAULT.w - 70, VAULT.h - 80)} fill={p("#1a1512")} />
    {/* vault ribs fading into the dark */}
    {[0.82, 0.64, 0.46].map((k, i) => (
      <path
        key={"rib" + i}
        d={parabolicArchPath(VAULT.cx, BASE, (VAULT.w - 70) * k, (VAULT.h - 80) * (0.86 + k * 0.14))}
        fill="none"
        stroke={p(C.stoneDark)}
        strokeWidth={4}
        strokeOpacity={0.6 - i * 0.15}
      />
    ))}
    {/* static crenellations */}
    {merlonXs
      .filter((x) => !FALLING.some((m) => m.x === x))
      .map((x) => (
        <path key={"m" + x} d={merlonPath(x, TOP)} fill={p(C.stoneLight)} />
      ))}
  </g>
);

export const Scene04KisraPalace: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // tremor envelope: builds, peaks, settles — restrained, no collapse
  const tremor = interpolate(frame, [sec(4.6), sec(5.6), sec(7.6), sec(9.2)], [0, 1, 0.7, 0], {
    ...clamp,
    easing: theme.ease.soft,
  });
  const shake = (f: number) => ({ x: noise1(f / 1.6, 11) * 7 * tremor, y: noise1(f / 1.9, 13) * 5 * tremor });
  const sway = `rotate(${noise1(frame / 3, 17) * 0.25 * tremor}deg)`;

  return (
    <AbsoluteFill>
      <CinematicCamera
        keys={[
          { f: 0, x: 0, y: -60, zoom: 1.0 },
          { f: dur, x: 0, y: 30, zoom: 1.16 },
        ]}
        shake={shake}
      >
        <Sky
          stops={[
            ["#04070f", 0],
            [C.persianSky, 35],
            [C.persianHaze, 70],
            ["#3a4458", 82],
          ]}
          glow={{ x: 540, y: 1300, r: 800, color: "rgba(120,110,140,0.3)" }}
        />
        <Stars seed={55} count={110} top={-350} bottom={700} spin={0.006} opacity={0.7} />
        <PaperLayer
          depth={0.06}
          shadow={10}
          texture={0.4}
          render={(p) => (
            <g transform={`translate(${frame * 0.25} 0)`}>
              <path d={cloudPath(-380, 520, 560, 70)} fill={p("#1b2436")} />
              <path d={cloudPath(560, 380, 700, 80)} fill={p("#1b2436")} />
            </g>
          )}
        />
        <PaperLayer
          depth={0.12}
          shadow={12}
          texture={0.4}
          render={(p) => (
            <g transform={`translate(${-frame * 0.35} 0)`}>
              <path d={cloudPath(-120, 690, 620, 60)} fill={p("#253049")} />
              <path d={cloudPath(820, 610, 520, 70)} fill={p("#253049")} />
            </g>
          )}
        />
        {/* the plain of Ctesiphon and the line of the Tigris */}
        <PaperLayer
          depth={0.2}
          shadow={8}
          render={(p) => (
            <g>
              <path d={ridgePath(61, { x0: -420, x1: 1500, base: 1330, amp: 60, peaks: 9, bottom: 1700 })} fill={p("#2b3040")} />
              <path d="M-420 1380 Q300 1360 1500 1390 L1500 1400 Q300 1372 -420 1392 Z" fill={p("#55607a")} />
            </g>
          )}
        />
        <Glow x={540} y={1360} r={300} color="#ff9a3d" opacity={0.35} depth={0.5} />
        <PaperLayer depth={0.5} shadow={26} shadowOpacity={0.65} transform={sway} render={(p) => <Facade p={p} />} />
        {/* braziers deep inside the iwan */}
        <Glow x={470} y={1400} r={90} color="#ffa04a" opacity={0.8} depth={0.5} />
        <Glow x={610} y={1400} r={90} color="#ffa04a" opacity={0.8} depth={0.5} />
        {/* fragments that come loose and fall */}
        <PaperLayer
          depth={0.5}
          shadow={10}
          transform={sway}
          render={(p) =>
            FALLING.map((m, i) => {
              const t = frame - m.at;
              const groundDrop = BASE - TOP + 6;
              let y = 0;
              let rot = noise1(frame / 2 + i, 23) * 2 * tremor;
              if (t > 0) {
                y = Math.min(groundDrop, 0.5 * 1.1 * t * t);
                const landed = 0.5 * 1.1 * t * t >= groundDrop;
                rot = landed ? m.spin * 26 : m.spin * t;
              }
              return (
                <g key={i} transform={`translate(0 ${y}) rotate(${rot} ${m.x + MERLON_W / 2} ${TOP - 20})`}>
                  <path d={merlonPath(m.x, TOP)} fill={p(C.stoneLight)} />
                </g>
              );
            })
          }
        />
        {/* dust trickling from the cornice while the walls tremble */}
        <Dust seed={66} count={60} area={{ x: -100, y: 760, w: 1280, h: 700 }} color="#c9b89f" size={2.4} rise={-2.2} depth={0.5} opacity={tremor * 0.9} />
        {FALLING.map((m, i) => {
          const landT = Math.sqrt((2 * (BASE - TOP + 6)) / 1.1);
          const puff = interpolate(frame, [m.at + landT, m.at + landT + 8, m.at + landT + 50], [0, 0.7, 0], clamp);
          return <Glow key={i} x={m.x + 15} y={BASE - 10} r={60 + puff * 60} color="#b9a78f" opacity={puff} depth={0.5} />;
        })}
        {/* stone terrace before the palace */}
        <PaperLayer
          depth={0.72}
          shadow={18}
          render={(p) => (
            <g>
              <path d="M-420 1440 L1500 1440 L1500 2400 L-420 2400 Z" fill={p("#3a3029")} />
              <path d="M-420 1440 L1500 1440 L1500 1462 L-420 1462 Z" fill={p("#5b4c3f")} />
              {Array.from({ length: 12 }).map((_, i) => (
                <path key={i} d={`M${-300 + i * 150} 1462 L${-600 + i * 200} 2400`} stroke={p("#2a221d")} strokeWidth={3} />
              ))}
            </g>
          )}
        />
        {/* foreground columns and arch framing the view */}
        <PaperLayer
          depth={1.3}
          shadow={34}
          shadowOpacity={0.8}
          render={(p) => (
            <g>
              <path
                fillRule="evenodd"
                d={`M-500 -500 L1580 -500 L1580 2500 L-500 2500 Z ${pointedArchPath(40, 2500, 1000, 2330, 0.82)}`}
                fill={p("#0f0c0b")}
              />
              {[-30, 960].map((x, i) => (
                <g key={i}>
                  <rect x={x} y={420} width={150} height={2000} fill={p("#1c1613")} />
                  <path d={`M${x - 26} 420 L${x + 176} 420 L${x + 150} 470 L${x} 470 Z`} fill={p("#2a211c")} />
                  <path d={`M${x - 30} 1720 L${x + 180} 1720 L${x + 160} 1660 L${x - 10} 1660 Z`} fill={p("#2a211c")} />
                  {Array.from({ length: 5 }).map((_, k) => (
                    <rect key={k} x={x + 20 + k * 25} y={480} width={6} height={1180} fill={p("#130f0d")} />
                  ))}
                </g>
              ))}
            </g>
          )}
        />
      </CinematicCamera>
      <ArabicTitle text="ارْتِجَاسُ إِيوَانِ كِسْرَى" start={sec(1.2)} end={sec(11.7)} top={250} size={96} revealLen={40} />
      <MalaySubtitle text="Goncangan Istana Kisra" start={sec(2.0)} end={sec(11.7)} top={490} size={50} tracking={0.06} />
      <HistoricalDisclaimer start={sec(1.6)} end={sec(11.7)} top={1470} />
      <Grade warmth={0.06} />
      <PaperOverlay />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
