import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PAPER_TEXTURE } from "../assets";
import { theme } from "../theme";
import { CinematicCamera } from "../components/CinematicCamera";
import { PaperLayer, type Paint } from "../components/PaperLayer";
import { Dust, Glow, Grade, Grain, PaperOverlay, Vignette } from "../components/Atmosphere";
import { pointedArchPath, starPath } from "../components/shapes";
import { ArabicTitle } from "../components/ArabicTitle";
import { MalaySubtitle } from "../components/MalaySubtitle";
import { HistoricalDisclaimer } from "../components/HistoricalDisclaimer";
import { clamp } from "../components/textMotion";
import { noise1 } from "../random";
import { sec } from "../timeline";

const C = theme.colors;
const CX = 540;
const BOWL = 1180;

// faceted cut-paper flame tongue; the tip sways more than the root
const flamePath = (w: number, h: number, frame: number, seed: number) => {
  const steps = 9;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    const hw = (w / 2) * Math.pow(1 - s, 0.85) * Math.min(1, s * 4 + 0.45);
    const off = noise1(frame / 7 - s * 2.2, seed) * w * 0.32 * s + noise1(frame / 3.5, seed + 9) * w * 0.06 * s;
    const y = BOWL - s * h;
    left.push(`${(CX + off - hw).toFixed(1)} ${y.toFixed(1)}`);
    right.unshift(`${(CX + off + hw).toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${left.join(" L")} L${right.join(" L")} Z`;
};

const Altar: React.FC<{ p: Paint }> = ({ p }) => (
  <g>
    <rect x={370} y={1380} width={340} height={44} fill={p(C.stoneDark)} />
    <rect x={400} y={1340} width={280} height={42} fill={p(C.stone)} />
    <rect x={468} y={1222} width={144} height={120} fill={p(C.stoneDark)} />
    {[0, 1, 2].map((k) => (
      <rect key={k} x={480 + k * 44} y={1236} width={30} height={92} fill={p(C.stoneDeep)} />
    ))}
    <rect x={440} y={1202} width={200} height={22} fill={p(C.stone)} />
    <path d={`M410 ${BOWL} L670 ${BOWL} L640 1204 L440 1204 Z`} fill={p(C.stoneLight)} />
  </g>
);

export const Scene05PersianFire: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const intensity = interpolate(frame, [sec(3.3), sec(7.4)], [1, 0], { ...clamp, easing: theme.ease.inOut });
  const flicker = 0.92 + noise1(frame / 4, 3) * 0.08;
  const I = intensity * flicker;
  const ember = interpolate(frame, [sec(7.0), sec(7.5), sec(10)], [0, 1, 0], clamp);
  const parchment = interpolate(frame, [dur - 70, dur - 34], [0, 1], { ...clamp, easing: theme.ease.inOut });

  const wisps = [0, 1, 2, 3, 4, 5, 6].map((k) => {
    const start = sec(5.6) + k * 11;
    const t = frame - start;
    if (t <= 0) return null;
    const len = Math.min(1500, t * 7);
    const fade = interpolate(t, [0, 24, 140, 230], [0, 0.42, 0.3, 0.12], clamp);
    const pts: string[] = [];
    const back: string[] = [];
    for (let y = 0; y <= len; y += 30) {
      const sway = Math.sin(y / 85 + frame / 18 + k * 1.7) * (14 + y * 0.16) + noise1(y / 160 + frame / 60 + k, k) * 50;
      const hw = (8 + y * (0.07 + (k % 3) * 0.03)) * (1 - Math.pow(y / Math.max(len, 1), 3) * 0.85);
      const drift = (k - 3) * y * 0.08;
      pts.push(`${CX + sway + drift - hw} ${BOWL - y}`);
      back.unshift(`${CX + sway + drift + hw} ${BOWL - y}`);
    }
    return { d: `M${pts.join(" L")} L${back.join(" L")} Z`, fade };
  });

  return (
    <AbsoluteFill style={{ background: "#0b0807" }}>
      <CinematicCamera
        keys={[
          { f: 0, x: 0, y: 40, zoom: 1.04 },
          { f: sec(7.5), x: 0, y: -20, zoom: 1.16 },
          { f: dur, x: 0, y: -80, zoom: 1.22 },
        ]}
      >
        {/* sanctuary wall with a great niche */}
        <PaperLayer
          depth={0.2}
          shadow={0}
          render={(p) => (
            <g>
              <rect x={-420} y={-420} width={1920} height={2800} fill={p("#2b221c")} />
              <path d={pointedArchPath(210, 1440, 660, 1060, 0.5)} fill={p("#1c1612")} />
              <path d={pointedArchPath(260, 1440, 560, 960, 0.5)} fill={p("#140f0c")} />
              {Array.from({ length: 9 }).map((_, i) => (
                <g key={i}>
                  <circle cx={-40 + i * 145} cy={300} r={34} fill={p("#3a2e25")} />
                  <path d={starPath(-40 + i * 145, 300, 26, 11, 8)} fill={p("#241c16")} />
                </g>
              ))}
              <rect x={-420} y={350} width={1920} height={14} fill={p("#3a2e25")} />
            </g>
          )}
        />
        {/* the flame's warm light on the walls */}
        <Glow x={CX} y={1050} r={760} color="#ff8a2a" opacity={0.55 * I + 0.15 * ember} depth={0.3} />
        <PaperLayer
          depth={0.45}
          shadow={24}
          shadowOpacity={0.7}
          render={(p) => (
            <g>
              {[0, 860].map((x, i) => (
                <g key={i}>
                  <rect x={x - 20} y={240} width={240} height={1300} fill={p("#3d3128")} />
                  <rect x={x} y={240} width={200} height={1300} fill={p("#4a3c31")} />
                  <path d={`M${x - 40} 240 L${x + 240} 240 L${x + 220} 300 L${x - 20} 300 Z`} fill={p("#5a4a3c")} />
                  {Array.from({ length: 4 }).map((_, k) => (
                    <rect key={k} x={x + 26 + k * 44} y={320} width={14} height={1180} fill={p("#3a2e25")} />
                  ))}
                </g>
              ))}
            </g>
          )}
        />
        <PaperLayer
          depth={0.62}
          shadow={14}
          render={(p) => (
            <g>
              <path d="M-420 1420 L1500 1420 L1500 2400 L-420 2400 Z" fill={p("#211a15")} />
              {Array.from({ length: 10 }).map((_, i) => (
                <path key={i} d={`M${-180 + i * 160} 1420 L${-900 + i * 320} 2400`} stroke={p("#17110e")} strokeWidth={3} />
              ))}
            </g>
          )}
        />
        <PaperLayer depth={0.62} shadow={20} shadowOpacity={0.7} render={(p) => <Altar p={p} />} />
        {/* the sacred flame — natural, restrained movement, slowly dying */}
        {I > 0.02 ? (
          <PaperLayer
            depth={0.62}
            shadow={0}
            texture={0.35}
            style={{ mixBlendMode: "screen" }}
            render={(p) => (
              <g>
                <path d={flamePath(190 * Math.sqrt(I), 400 * Math.pow(I, 0.8), frame, 1)} fill={p(C.flameRed)} opacity={0.9} />
                <path d={flamePath(150 * Math.sqrt(I), 320 * Math.pow(I, 0.85), frame + 9, 4)} fill={p(C.flameOrange)} />
                <path d={flamePath(104 * Math.sqrt(I), 230 * Math.pow(I, 0.9), frame + 17, 7)} fill={p(C.flameYellow)} />
                <path d={flamePath(52 * Math.sqrt(I), 120 * I, frame + 23, 13)} fill={p(C.flameCore)} />
              </g>
            )}
          />
        ) : null}
        <Glow x={CX} y={BOWL - 10} r={110} color="#ff6a1f" opacity={ember * 0.9} depth={0.62} />
        <Glow x={CX} y={BOWL - 120} r={300} color="#ffb453" opacity={0.6 * I} depth={0.62} />
        <Dust seed={77} count={24} area={{ x: 380, y: 700, w: 320, h: 480 }} color="#ffb453" size={2.2} rise={2.2} depth={0.62} opacity={I} />
        {/* smoke rising and dispersing as layered paper ribbons */}
        <PaperLayer
          depth={0.62}
          shadow={6}
          shadowOpacity={0.3}
          texture={0.7}
          render={(p) => (
            <g>
              {wisps.map((w, k) => (w ? <path key={k} d={w.d} fill={p(C.smoke)} opacity={w.fade} /> : null))}
            </g>
          )}
        />
        {/* cool night air takes over once the fire is gone */}
        <AbsoluteFill style={{ background: "#26324d", mixBlendMode: "soft-light", opacity: (1 - intensity) * 0.8 }} />
        <PaperLayer
          depth={1.3}
          shadow={34}
          shadowOpacity={0.8}
          render={(p) => (
            <path
              fillRule="evenodd"
              d={`M-500 -500 L1580 -500 L1580 2500 L-500 2500 Z ${pointedArchPath(10, 2500, 1060, 2420, 0.8)}`}
              fill={p("#0d0a09")}
            />
          )}
        />
      </CinematicCamera>
      <ArabicTitle text="خُمُودُ نَارِ فَارِسَ" start={sec(1.0)} end={sec(9.6)} top={250} size={104} />
      <MalaySubtitle text="Terpadamnya Api Parsi" start={sec(1.7)} end={sec(9.6)} top={500} size={50} tracking={0.06} />
      <HistoricalDisclaimer start={sec(1.3)} end={sec(9.6)} top={1470} />
      {/* the smoke thickens into a moving sheet of parchment */}
      <AbsoluteFill
        style={{
          opacity: parchment,
          background: `linear-gradient(180deg, ${C.parchmentLight}, ${C.parchment} 50%, ${C.parchmentDark})`,
          WebkitMaskImage: `radial-gradient(ellipse ${60 + parchment * 120}% ${40 + parchment * 120}% at 50% ${70 - parchment * 30}%, #000 55%, transparent 100%)`,
          maskImage: `radial-gradient(ellipse ${60 + parchment * 120}% ${40 + parchment * 120}% at 50% ${70 - parchment * 30}%, #000 55%, transparent 100%)`,
        }}
      >
        <AbsoluteFill
          style={{
            backgroundImage: `url(${PAPER_TEXTURE})`,
            backgroundSize: "512px",
            backgroundPosition: `0 ${-frame * 3}px`,
            mixBlendMode: "multiply",
          }}
        />
      </AbsoluteFill>
      <Grade warmth={0.08} />
      <PaperOverlay />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
