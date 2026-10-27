import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";
import { Clawdy, Expression, Pose } from "./Clawdy";
import { T, ttheme } from "./theme3";
import { CreamBg, SoftGrain, SoftVignette, Sfx, WarmGrade } from "./ui";
import { Hello } from "./scenes/Hello";
import { NewChat } from "./scenes/NewChat";
import { GitHub } from "./scenes/GitHub";
import { Recap } from "./scenes/Recap";

loadFredoka("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });
loadNunito("normal", { weights: ["600", "700", "800"], subsets: ["latin"] });

export const TUT_TOTAL_S = T.end;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const G = T.github;
const st = (i: number) => G + i * T.step; // absolute start of GitHub step i

/* -------------------------- Clawdy's performance -------------------------- */
// All in absolute seconds. Clawdy lives on its own layer across every scene.

// where Clawdy stands: hold until `at`, then glide to the next spot
const SPOTS = [
  { at: 0, x: 540, y: 860, size: 440 },
  { at: 3.6, x: 230, y: 1520, size: 290 },
  { at: 15.6, x: 860, y: 1530, size: 260 },
  { at: 41.6, x: 540, y: 1380, size: 380 },
];
const MOVE_S = 0.6;

const FACES: [number, Expression][] = [
  [0, "happy"],
  [1.5, "excited"],
  [3.2, "happy"],
  [T.newChat + 1.45, "excited"],
  [T.newChat + 2.6, "happy"],
  [T.newChat + 4.6, "thinking"],
  [T.newChat + 7.4, "happy"],
  [T.newChat + 8.6, "thinking"],
  [T.newChat + 10.3, "excited"],
  [T.newChat + 11.6, "happy"],
  [st(0) + 0.7, "excited"],
  [st(1), "happy"],
  [st(2), "thinking"],
  [st(2) + 2.1, "excited"],
  [st(3), "happy"],
  [st(5), "thinking"],
  [st(6), "excited"],
  [st(7), "happy"],
  [st(7) + 1.4, "excited"],
  [T.recap, "happy"],
  [T.recap + 3.8, "wink"],
  [T.recap + 5.4, "excited"],
];

const POSES: [number, Pose][] = [
  [0, "rest"],
  [0.6, "wave"],
  [2.8, "rest"],
  [T.newChat + 0.6, "pointR"],
  [T.newChat + 11.4, "rest"],
  [st(0) + 0.4, "pointL"],
  [st(7) + 1.4, "wave"],
  [T.recap, "rest"],
  [T.recap + 3.8, "wave"],
  [T.recap + 5.4, "rest"],
];

// little celebration hops (seconds)
const HOPS = [
  1.5,
  T.newChat + 1.5,
  T.newChat + 10.3,
  st(2) + 2.15,
  st(6) + 1.2,
  st(7) + 1.45,
  T.recap + 3.8,
];

const lastAt = <V,>(track: [number, V][], t: number): V => {
  let v = track[0][1];
  for (const [at, val] of track) if (t >= at) v = val;
  return v;
};

const ClawdyLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // glide between spots
  let { x, y, size } = SPOTS[0];
  for (let i = 1; i < SPOTS.length; i++) {
    const a = SPOTS[i - 1];
    const b = SPOTS[i];
    const p = interpolate(frame, [b.at * fps, (b.at + MOVE_S) * fps], [0, 1], {
      easing: ttheme.ease.inOut,
      ...clamp,
    });
    if (frame >= b.at * fps) {
      x = a.x + (b.x - a.x) * p;
      y = a.y + (b.y - a.y) * p;
      size = a.size + (b.size - a.size) * p;
    }
  }
  // arc while gliding
  const gliding = SPOTS.slice(1).reduce((acc, b) => {
    const d = t - b.at;
    return d >= 0 && d <= MOVE_S ? Math.sin((d / MOVE_S) * Math.PI) : acc;
  }, 0);

  // hop-in at the very start: fall, then squash and settle
  const enter = 0.15 * fps;
  const fallF = 0.33 * fps;
  const fall = interpolate(frame, [enter, enter + fallF], [-1300, 0], {
    easing: ttheme.ease.in,
    ...clamp,
  });
  const landed = frame - (enter + fallF);

  // celebration hops: up and down with a squash on landing
  const hopLen = 0.42 * fps;
  let hopY = 0;
  let squashT = landed;
  for (const h of HOPS) {
    const d = frame - h * fps;
    if (d >= 0 && d < hopLen)
      hopY = Math.sin((d / hopLen) * Math.PI) * size * 0.28;
    if (d >= hopLen) squashT = Math.min(squashT, d - hopLen);
  }
  const sq =
    squashT >= 0 ? Math.exp(-squashT / 4) * Math.cos(squashT / 2.2) : -0.15;
  const scaleX = 1 + 0.16 * sq;
  const scaleY = 1 - 0.16 * sq;

  // fast exit at the very end
  const endF = T.end * fps;
  const out = interpolate(frame, [endF - 11, endF - 2], [0, 1], {
    easing: ttheme.ease.in,
    ...clamp,
  });

  const lift = fall - hopY - gliding * size * 0.35;
  const shadowK = 1 - Math.min(1, -lift / (size * 1.2));
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      {/* ground shadow */}
      <div
        style={{
          position: "absolute",
          left: x - size * 0.3,
          top: y + size * 0.33,
          width: size * 0.6,
          height: size * 0.09,
          borderRadius: "50%",
          background: ttheme.colors.ink,
          opacity: 0.13 * shadowK,
          transform: `scale(${0.6 + 0.4 * shadowK})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - size / 2,
          top: y - size / 2 + lift,
          width: size,
          height: size,
          transformOrigin: "50% 85%",
          transform: `scale(${scaleX * (1 - out * 0.3)}, ${scaleY * (1 - out * 0.3)})`,
        }}
      >
        <Clawdy
          size={size}
          expression={lastAt(FACES, t)}
          pose={lastAt(POSES, t)}
        />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------- composition ------------------------------ */

export const ClaudeTutorial: React.FC = () => {
  const { fps } = useVideoConfig();
  const f = (sec: number) => Math.round(sec * fps);
  const scenes = [
    { from: T.hello, to: T.newChat, C: Hello },
    { from: T.newChat, to: T.github, C: NewChat },
    { from: T.github, to: T.recap, C: GitHub },
    { from: T.recap, to: T.end, C: Recap },
  ];
  return (
    <AbsoluteFill>
      {/* layer 1: background mesh */}
      <CreamBg />
      {/* layers 2-3: UI mockups, type, Clawdy */}
      {scenes.map(({ from, to, C }) => (
        <Sequence key={from} from={f(from)} durationInFrames={f(to) - f(from)}>
          <C duration={f(to) - f(from)} />
        </Sequence>
      ))}
      <ClawdyLayer />
      {/* layer 4: grade — layer 5: grain + vignette on top */}
      <WarmGrade />
      <SoftGrain />
      <SoftVignette />

      {/* sound: music bed under everything, whooshes into each scene */}
      <Audio src={staticFile("sfx/tutorial/loop.wav")} volume={0.13} />
      <Sfx at={f(0.15)} name="whoosh" volume={0.4} />
      <Sfx at={f(0.15 + 0.33)} name="pop" volume={0.5} />
      {[T.newChat, T.github, T.recap].map((sec) => (
        <Sfx key={sec} at={f(sec) - 3} name="whoosh" volume={0.45} />
      ))}
      {HOPS.map((h) => (
        <Sfx key={h} at={f(h + 0.42)} name="pop" volume={0.25} />
      ))}
    </AbsoluteFill>
  );
};
