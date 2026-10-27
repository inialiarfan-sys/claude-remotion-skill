import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";
import { Clawdy, Expression, Pose } from "./Clawdy";
import { T, ttheme } from "./theme3";
import {
  Camera,
  CreamBg,
  Emote,
  EmoteKind,
  Punch,
  Sfx,
  Shake,
  SoftGrain,
  SoftVignette,
  talkSeconds,
  WarmGrade,
  Wipe,
} from "./ui";
import { Hello, HELLO } from "./scenes/Hello";
import { NewChat, NEWCHAT } from "./scenes/NewChat";
import { GitHub, GH_PUNCHES, GH_SHIP } from "./scenes/GitHub";
import { Recap, RECAP } from "./scenes/Recap";

loadFredoka("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });
loadNunito("normal", { weights: ["600", "700", "800"], subsets: ["latin"] });

export const TUT_TOTAL_S = T.end;

const c = ttheme.colors;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const NC = T.newChat;
const G = T.github;
const R = T.recap;
const st = (i: number) => G + i * T.step; // absolute start of GitHub step i

/* -------------------------- Clawdy's performance -------------------------- */
// All in absolute seconds. Clawdy lives on its own layer across every scene.

// where Clawdy stands: hold until `at`, then glide to the next spot
const SPOTS = [
  { at: 0, x: 540, y: 860, size: 440 },
  { at: 3.7, x: 230, y: 1520, size: 290 },
  { at: 15.7, x: 860, y: 1530, size: 260 },
  { at: 41.7, x: 540, y: 1380, size: 380 },
];
const MOVE_S = 0.5;

const FACES: [number, Expression][] = [
  [0, "surprised"],
  [0.5, "happy"],
  [HELLO.bubble, "excited"],
  [HELLO.title, "star"],
  [2.6, "happy"],
  [3.2, "proud"],
  [NC + 0.4, "thinking"],
  [NC + NEWCHAT.click, "surprised"],
  [NC + NEWCHAT.click + 0.35, "excited"],
  [NC + NEWCHAT.bubbleA, "happy"],
  [NC + 3.4, "proud"],
  [NC + NEWCHAT.bubbleB, "happy"],
  [NC + 5.7, "thinking"],
  [NC + 7.4, "happy"],
  [NC + NEWCHAT.cross, "surprised"],
  [NC + NEWCHAT.cross + 0.5, "thinking"],
  [NC + NEWCHAT.tick, "love"],
  [NC + 11.7, "happy"],
  [st(0), "excited"],
  [st(0) + 2.3, "happy"],
  [st(1), "thinking"],
  [st(1) + 1.3, "surprised"],
  [st(1) + 1.7, "happy"],
  [st(2), "thinking"],
  [st(2) + 2.05, "star"],
  [st(3), "happy"],
  [st(3) + 1.5, "excited"],
  [st(4), "thinking"],
  [st(4) + 2.05, "proud"],
  [st(5), "happy"],
  [st(5) + 0.6, "thinking"],
  [st(5) + 1.9, "excited"],
  [st(6), "surprised"],
  [st(6) + 1.2, "star"],
  [st(7), "thinking"],
  [st(7) + 1.35, "love"],
  [st(7) + 1.5, "laugh"],
  [R, "happy"],
  [R + RECAP.items[0], "proud"],
  [R + RECAP.bubble, "wink"],
  [R + RECAP.bubble + 0.9, "laugh"],
  [R + RECAP.end, "love"],
];

const POSES: [number, Pose][] = [
  [0, "cheer"],
  [0.5, "rest"],
  [0.6, "wave"],
  [HELLO.title, "cheer"],
  [2.6, "rest"],
  [NC + 0.6, "pointR"],
  [NC + NEWCHAT.tick, "cheer"],
  [NC + 11.7, "rest"],
  [st(0) + 0.4, "pointL"],
  [st(2) + 2.05, "cheer"],
  [st(2) + 2.8, "pointL"],
  [st(5) + 1.9, "cheer"],
  [st(5) + 2.6, "pointL"],
  [st(7) + 1.4, "cheer"],
  [R, "rest"],
  [R + RECAP.bubble, "wave"],
  [R + RECAP.end, "cheer"],
];

// where the pupils point: [x, y] in -1..1
const LOOKS: [number, [number, number]][] = [
  [0, [0, 0]],
  [HELLO.title, [0, 0.9]],
  [2.8, [0, 0]],
  [NC + 0.3, [0.8, -0.8]],
  [G, [-0.8, -0.8]],
  [R, [0, -0.9]],
  [R + RECAP.bubble, [0, 0]],
];

const EMOTES: [number, EmoteKind][] = [
  [HELLO.title, "sparkle"],
  [NC + 0.5, "?"],
  [NC + NEWCHAT.click, "!"],
  [NC + 5.8, "idea"],
  [NC + NEWCHAT.cross, "?"],
  [NC + NEWCHAT.tick, "heart"],
  [st(1) + 1.35, "!"],
  [st(2) + 2.05, "sparkle"],
  [st(3) + 1.5, "heart"],
  [st(5) + 0.7, "note"],
  [st(6) + 1.2, "idea"],
  [st(7) + 1.5, "heart"],
  [R + RECAP.bubble, "heart"],
  [R + RECAP.end, "note"],
];

// celebration hops (seconds)
const HOPS = [
  HELLO.title,
  NC + NEWCHAT.click + 0.05,
  NC + NEWCHAT.tick,
  st(2) + 2.1,
  st(5) + 1.95,
  st(6) + 1.2,
  st(7) + 1.45,
  R + RECAP.bubble,
  R + RECAP.end,
];
const HOP_S = 0.42;

// speech: mouth flaps while a bubble's words pop in
const TALKS: [number, string][] = [
  [HELLO.bubble, "Hi! I'm Clawdy!"],
  [NC + NEWCHAT.bubbleA, "One topic = one new chat!"],
  [NC + NEWCHAT.bubbleB, "Tell Claude 3 things:"],
  [NC + NEWCHAT.bubbleC, "Be clear, not vague!"],
  [G + 0.7, "Let's link your code!"],
  [st(3) + 0.5, "Only pick repos you want"],
  [st(7) + 1.5, "Woohoo! You shipped it!"],
  [R + RECAP.bubble, "You're ready! Go build something cool."],
];

// head tilt per face
const TILT: Record<Expression, number> = {
  happy: 0,
  excited: -4,
  thinking: 11,
  wink: -8,
  love: 5,
  star: -5,
  surprised: -7,
  laugh: 0,
  proud: -6,
};

const lastAt = <V,>(track: [number, V][], t: number) => {
  let i = 0;
  for (let k = 0; k < track.length; k++) if (t >= track[k][0]) i = k;
  return {
    v: track[i][1],
    at: track[i][0],
    prev: track[Math.max(0, i - 1)][1],
  };
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

  // drop-in at the very start
  const enter = 0.15 * fps;
  const fallF = 0.33 * fps;
  const fall = interpolate(frame, [enter, enter + fallF], [-1300, 0], {
    easing: ttheme.ease.in,
    ...clamp,
  });

  // squash events: landing, hop landings, face changes (softer)
  const face = lastAt(FACES, t);
  const events: [number, number][] = [
    [(enter + fallF) / fps, 1],
    ...HOPS.map((h): [number, number] => [h + HOP_S, 0.8]),
    [face.at, 0.45],
  ];
  let sq = frame < enter + fallF ? -0.25 : 0;
  let latest = -1;
  for (const [at, k] of events) {
    const d = frame - at * fps;
    if (d >= 0 && at > latest) {
      latest = at;
      sq = Math.exp(-d / 4) * Math.cos(d / 2.2) * k;
    }
  }

  let hopY = 0;
  for (const h of HOPS) {
    const d = t - h;
    if (d >= 0 && d < HOP_S)
      hopY = Math.sin((d / HOP_S) * Math.PI) * size * 0.32;
  }
  // stretch while in the air
  if (hopY > 0) sq = -0.18 * (hopY / (size * 0.32));

  // bob on the beat of the 120 BPM track
  const beatY = -Math.abs(Math.sin((t / T.beat) * Math.PI)) * size * 0.035;

  // head tilt eases toward each new face, plus idle sway / laugh shake
  const tp = spring({
    frame: frame - face.at * fps,
    fps,
    config: ttheme.spring.snappy,
  });
  const tilt =
    TILT[face.prev] +
    (TILT[face.v] - TILT[face.prev]) * tp +
    (face.v === "laugh" ? Math.sin(t * 40) * 3 : Math.sin(t * 1.7) * 3);

  // eyes ease toward each look target
  const look = lastAt(LOOKS, t);
  const lp = spring({
    frame: frame - look.at * fps,
    fps,
    config: ttheme.spring.snappy,
  });
  const eye: [number, number] = [
    look.prev[0] + (look.v[0] - look.prev[0]) * lp,
    look.prev[1] + (look.v[1] - look.prev[1]) * lp,
  ];

  // mouth flaps while talking
  let talk = 0;
  for (const [at, text] of TALKS) {
    const d = t - at - 0.2;
    if (d >= 0 && d < talkSeconds(text, fps)) {
      talk = Math.abs(Math.sin(d * Math.PI * 6));
    }
  }

  // fast exit at the very end
  const endF = T.end * fps;
  const out = interpolate(frame, [endF - 11, endF - 2], [0, 1], {
    easing: ttheme.ease.in,
    ...clamp,
  });

  const lift = fall - hopY + beatY;
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
          background: c.ink,
          opacity: 0.16 * shadowK,
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
          transform: `rotate(${tilt}deg) scale(${(1 + 0.18 * sq) * (1 - out * 0.3)}, ${(1 - 0.18 * sq) * (1 - out * 0.3)})`,
        }}
      >
        <Clawdy
          size={size}
          expression={face.v}
          pose={lastAt(POSES, t).v}
          look={eye}
          talk={talk}
        />
      </div>
      {/* emotes pop right above the head; off to the side when centered,
          where a bubble sits overhead */}
      <div
        style={{
          position: "absolute",
          left: x + (Math.abs(x - 540) < 60 ? size * 0.5 : 0),
          top: y - size * (Math.abs(x - 540) < 60 ? 0.5 : 0.72) + lift,
        }}
      >
        {EMOTES.map(([at, kind]) => (
          <Emote
            key={at}
            kind={kind}
            at={Math.round(at * fps)}
            size={size * 0.4}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------- camera --------------------------------- */

const CUTS = [
  {
    at: NC,
    label: "TIP 1",
    colors: [c.sun, c.mint, c.ink] as [string, string, string],
  },
  {
    at: G,
    label: "TIP 2",
    colors: [c.mint, c.sky, c.ink] as [string, string, string],
  },
  {
    at: R,
    label: "RECAP",
    colors: [c.lilac, c.sun, c.ink] as [string, string, string],
  },
];

const PUNCHES: Punch[] = [
  { at: 0.48, x: 540, y: 1100, k: 0.07 },
  { at: HELLO.title, x: 540, y: 1250, k: 0.05 },
  { at: HELLO.title + 0.33, x: 540, y: 1380, k: 0.05 },
  ...CUTS.map((cut) => ({ at: cut.at + 0.25, x: 540, y: 960, k: 0.07 })),
  { at: NC + NEWCHAT.click, x: 270, y: 500, k: 0.12 },
  { at: NC + NEWCHAT.cross, x: 900, y: 470, k: 0.06 },
  { at: NC + NEWCHAT.tick, x: 900, y: 760, k: 0.08 },
  ...GH_PUNCHES.map((p) => ({ ...p, at: G + p.at })),
  ...RECAP.items.map((s, i) => ({
    at: R + s + 0.1,
    x: 200,
    y: 580 + i * 120,
    k: 0.03,
  })),
  { at: R + RECAP.bubble, x: 540, y: 1150, k: 0.06 },
];

const SHAKES: Shake[] = [
  { at: 0.48, amp: 22 },
  { at: NC + NEWCHAT.cross, amp: 10 },
  { at: G + GH_SHIP, amp: 24 },
  ...CUTS.map((cut) => ({ at: cut.at + 0.2, amp: 10 })),
];

const TINTS: [number, string][] = [
  [0, c.tint.hello],
  [NC, c.tint.newChat],
  [G, c.tint.github],
  [R, c.tint.recap],
];

/* ------------------------------- composition ------------------------------ */

export const ClaudeTutorial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (sec: number) => Math.round(sec * fps);
  const scenes = [
    { from: T.hello, to: NC, C: Hello },
    { from: NC, to: G, C: NewChat },
    { from: G, to: R, C: GitHub },
    { from: R, to: T.end, C: Recap },
  ];
  return (
    <AbsoluteFill>
      <Camera punches={PUNCHES} shakes={SHAKES}>
        {/* layer 1: background mesh, tinted per scene */}
        <CreamBg tint={lastAt(TINTS, frame / fps).v} />
        {/* layers 2-3: UI mockups, type, Clawdy */}
        {scenes.map(({ from, to, C }) => (
          <Sequence
            key={from}
            from={f(from)}
            durationInFrames={f(to) - f(from)}
          >
            <C duration={f(to) - f(from)} />
          </Sequence>
        ))}
        <ClawdyLayer />
      </Camera>
      {/* scene wipes sit in screen space, above the camera */}
      {CUTS.map((cut) => (
        <Wipe
          key={cut.at}
          cut={f(cut.at)}
          x={540}
          y={960}
          label={cut.label}
          colors={cut.colors}
        />
      ))}
      {/* layer 4: grade — layer 5: grain + vignette on top */}
      <WarmGrade />
      <SoftGrain />
      <SoftVignette />

      {/* sound: music bed, drop-in, riser -> whoosh -> thump on every cut */}
      <Audio src={staticFile("sfx/tutorial/loop.wav")} volume={0.16} />
      <Sfx at={f(0.12)} name="whoosh" volume={0.45} />
      <Sfx at={f(0.48)} name="thump" volume={0.7} />
      <Sfx at={f(0.48)} name="boing" volume={0.45} />
      {CUTS.map((cut) => (
        <React.Fragment key={cut.at}>
          <Sfx at={f(cut.at - 0.75)} name="riser" volume={0.4} />
          <Sfx at={f(cut.at) - 9} name="whoosh" volume={0.55} />
          <Sfx at={f(cut.at) - 2} name="pop" volume={0.5} />
          <Sfx at={f(cut.at + 0.2)} name="thump" volume={0.65} />
        </React.Fragment>
      ))}
      {HOPS.map((h) => (
        <Sfx key={h} at={f(h)} name="boing" volume={0.3} />
      ))}
      {EMOTES.map(([at]) => (
        <Sfx key={at} at={f(at)} name="pop" volume={0.25} />
      ))}
    </AbsoluteFill>
  );
};
