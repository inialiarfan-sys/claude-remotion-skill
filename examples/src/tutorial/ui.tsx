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
import { ttheme } from "./theme3";

const c = ttheme.colors;
const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// seconds -> frames, the only way timing enters a component (rule 8)
export const useSec = () => {
  const { fps } = useVideoConfig();
  return (s: number) => Math.round(s * fps);
};

// deterministic 0..1 noise from an integer seed
export const hash = (i: number) => {
  const r = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return r - Math.floor(r);
};

/* ---------------------------------- sound --------------------------------- */

export type SfxName =
  | "pop"
  | "boop"
  | "type"
  | "sparkle"
  | "whoosh"
  | "blip1"
  | "blip2"
  | "blip3"
  | "boing"
  | "thump"
  | "riser"
  | "swish";

export const Sfx: React.FC<{ at: number; name: SfxName; volume?: number }> = ({
  at,
  name,
  volume = 0.6,
}) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={at} durationInFrames={fps} layout="none">
      <Audio src={staticFile(`sfx/tutorial/${name}.wav`)} volume={volume} />
    </Sequence>
  );
};

// a quiet key tick every few characters while text types in
export const TypeSfx: React.FC<{
  at: number;
  chars: number;
  per: number;
  every?: number;
}> = ({ at, chars, per, every = 3 }) => (
  <>
    {Array.from({ length: Math.ceil(chars / every) }).map((_, i) => (
      <Sfx
        key={i}
        at={at + Math.round(i * every * per)}
        name="type"
        volume={0.28}
      />
    ))}
  </>
);

/* -------------------------------- motion ---------------------------------- */

// 3-property entrance (fade + rise + scale) and a faster exit (rule 2, 4)
export const Appear: React.FC<{
  at: number;
  until?: number;
  rise?: number;
  pop?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, until, rise = 50, pop = false, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - at,
    fps,
    config: pop ? ttheme.spring.jelly : ttheme.spring.snappy,
  });
  const out =
    until === undefined
      ? 0
      : interpolate(frame, [until, until + 9], [0, 1], {
          easing: ttheme.ease.in,
          ...clamp,
        });
  const scale = pop
    ? interpolate(p, [0, 1], [0.3, 1])
    : interpolate(p, [0, 1], [0.9, 1]);
  return (
    <div
      style={{
        opacity: Math.min(1, p * 1.6) * (1 - out),
        transform: `translateY(${interpolate(p, [0, 1], [rise, 0]) - out * 60}px) scale(${scale * (1 - out * 0.08)}) rotate(${(1 - p) * (pop ? -8 : -2)}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Big cards swing in from off-screen with overshoot and motion blur, then
// fling out the other way — reads like a whip-pan edit.
export const CardIn: React.FC<{
  at: number;
  until?: number;
  from?: "right" | "bottom";
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, until, from = "bottom", style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cfg = { damping: 13, stiffness: 120, mass: 0.8 };
  const p = spring({ frame: frame - at, fps, config: cfg });
  const pPrev = spring({ frame: frame - at - 1, fps, config: cfg });
  const out =
    until === undefined
      ? 0
      : interpolate(frame, [until, until + 9], [0, 1], {
          easing: ttheme.ease.in,
          ...clamp,
        });
  const outPrev =
    until === undefined
      ? 0
      : interpolate(frame - 1, [until, until + 9], [0, 1], {
          easing: ttheme.ease.in,
          ...clamp,
        });
  const dist = from === "right" ? 1150 : 1300;
  const v = Math.abs(p - pPrev) * dist + Math.abs(out - outPrev) * dist;
  const blur = Math.min(14, v / 9);
  const enter = (1 - p) * dist;
  const exit = out * -dist;
  const tx = from === "right" ? enter + exit : 0;
  const ty = from === "bottom" ? enter + exit * 0.9 : 0;
  const rot = (1 - p) * (from === "right" ? 14 : 10) - out * 12;
  if (frame < at) return null;
  return (
    <div
      style={{
        transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg)`,
        filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : undefined,
        opacity: 1 - out * 0.3,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// spring 0 -> 1 with overshoot, for things that "pop"
export const usePop = (at: number, jelly = false) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - at,
    fps,
    config: jelly ? ttheme.spring.jelly : ttheme.spring.bouncy,
  });
};

// squash-and-stretch that rings out after `at` (0 before)
export const useJiggle = (at: number) => {
  const frame = useCurrentFrame();
  const d = frame - at;
  return d < 0 ? 0 : Math.exp(-d / 5) * Math.cos(d / 1.8);
};

/* --------------------------------- text ----------------------------------- */

// Kinetic type: letters spring in one by one with overshoot and a tilt, then
// float gently (rule 7). Optional highlighter swipe behind one phrase.
export const Kinetic: React.FC<{
  text: string;
  at: number;
  until?: number;
  size: number;
  color?: string;
  weight?: number;
  per?: number; // frames between letters
  highlight?: string; // phrase inside text to mark
  markColor?: string;
  shadow?: string; // hard drop shadow color
  align?: "left" | "center";
  style?: React.CSSProperties;
}> = ({
  text,
  at,
  until,
  size,
  color = c.ink,
  weight = 700,
  per = 1.2,
  highlight,
  markColor = c.sun,
  shadow,
  align = "center",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hStart = highlight ? text.indexOf(highlight) : -1;
  const hEnd = hStart + (highlight?.length ?? 0);
  const words = text.split(" ");
  let idx = 0;
  const markP = (wStart: number) =>
    interpolate(
      frame,
      [at + wStart * per + 4, at + wStart * per + 12],
      [0, 1],
      { easing: ttheme.ease.out, ...clamp },
    );
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: size * 0.28,
        fontFamily: ttheme.fonts.display,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.08,
        color,
        letterSpacing: "-0.01em",
        ...style,
      }}
    >
      {words.map((w, wi) => {
        const wStart = idx;
        idx += w.length + 1;
        const marked = hStart >= 0 && wStart >= hStart && wStart < hEnd;
        return (
          <span
            key={wi}
            style={{
              position: "relative",
              display: "inline-block",
              whiteSpace: "nowrap",
            }}
          >
            {marked && (
              <span
                style={{
                  position: "absolute",
                  left: -size * 0.12,
                  right: -size * 0.12,
                  top: "52%",
                  height: "42%",
                  background: markColor,
                  borderRadius: size * 0.1,
                  transformOrigin: "0% 50%",
                  transform: `scaleX(${markP(wStart)}) rotate(-1.5deg)`,
                  zIndex: 0,
                }}
              />
            )}
            {w.split("").map((ch, ci) => {
              const i = wStart + ci;
              const p = spring({
                frame: frame - at - i * per,
                fps,
                config: ttheme.spring.jelly,
              });
              const out =
                until === undefined
                  ? 0
                  : interpolate(
                      frame,
                      [until + i * 0.4, until + i * 0.4 + 7],
                      [0, 1],
                      { easing: ttheme.ease.in, ...clamp },
                    );
              const float =
                Math.sin((frame / fps) * 2.4 + i * 0.7) * size * 0.025 * p;
              return (
                <span
                  key={ci}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "inline-block",
                    opacity: Math.min(1, p * 2) * (1 - out),
                    transform: `translateY(${(1 - p) * size * 0.7 + float - out * size * 0.5}px) scale(${Math.max(0, p) * (1 - out * 0.5)}) rotate(${(1 - p) * -24}deg)`,
                    textShadow: shadow
                      ? `0 ${size * 0.06}px 0 ${shadow}`
                      : undefined,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
};

// Types text in without reflow: hidden remainder keeps the final layout.
export const TypeText: React.FC<{
  text: string;
  at: number;
  per?: number; // frames per character
  caret?: boolean;
}> = ({ text, at, per = 1, caret = false }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - at) / per)));
  const typing = frame >= at && n < text.length;
  return (
    <span>
      {text.slice(0, n)}
      {caret && typing && (
        <span
          style={{
            display: "inline-block",
            width: "0.08em",
            height: "1em",
            marginRight: "-0.08em",
            background: c.ink,
            verticalAlign: "-0.12em",
          }}
        />
      )}
      <span style={{ color: "transparent" }}>{text.slice(n)}</span>
    </span>
  );
};

/* ------------------------------ speech bubble ----------------------------- */

export const WORD_GAP = 3; // frames between bubble words
export const talkSeconds = (text: string, fps: number) =>
  (6 + text.split(" ").length * WORD_GAP) / fps;

// Bubble pops with a squash, then each word bounces in with a babble blip.
export const Bubble: React.FC<{
  at: number;
  until: number;
  x: number;
  y: number;
  w: number;
  text: string;
  tail: "left" | "right" | "center";
  size?: number;
}> = ({ at, until, x, y, w, text, tail, size = 50 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = usePop(at, true);
  const jig = useJiggle(at + 6);
  const out = interpolate(frame, [until, until + 8], [0, 1], {
    easing: ttheme.ease.in,
    ...clamp,
  });
  const tailX = tail === "left" ? 70 : tail === "right" ? w - 70 : w / 2;
  const words = text.split(" ");
  const wobble = Math.sin((frame / fps) * 2.2) * 1.2;
  if (frame < at - 1) return null;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          transformOrigin: `${tailX}px 100%`,
          transform: `scale(${p * (1 - out) * (1 + jig * 0.06)}, ${p * (1 - out) * (1 - jig * 0.06)}) rotate(${(1 - p) * -10 + wobble}deg)`,
          opacity: Math.min(1, p * 2) * (1 - out),
        }}
      >
        <div
          style={{
            position: "relative",
            background: c.card,
            borderRadius: 44,
            padding: "28px 40px",
            boxShadow: ttheme.sticker(0.8),
            fontFamily: ttheme.fonts.display,
            fontWeight: 600,
            fontSize: size,
            lineHeight: 1.18,
            color: c.ink,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: size * 0.34,
          }}
        >
          {words.map((wd, i) => {
            const wp = spring({
              frame: frame - at - 6 - i * WORD_GAP,
              fps,
              config: ttheme.spring.jelly,
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: Math.min(1, wp * 2),
                  transform: `translateY(${(1 - wp) * 26}px) scale(${Math.max(0, wp)})`,
                }}
              >
                {wd}
              </span>
            );
          })}
          <div
            style={{
              position: "absolute",
              left: tailX - 20,
              bottom: -19,
              width: 40,
              height: 40,
              background: c.card,
              transform: "rotate(45deg)",
              boxShadow: `4px 4px 0 0 ${c.ink}`,
              borderRadius: 6,
            }}
          />
        </div>
      </div>
      {words.map((_, i) => (
        <Sfx
          key={i}
          at={at + 6 + i * WORD_GAP}
          name={
            (["blip1", "blip2", "blip3"] as const)[(i * 7 + text.length) % 3]
          }
          volume={0.32}
        />
      ))}
    </>
  );
};

/* --------------------------------- badges --------------------------------- */

export const NumBadge: React.FC<{
  n: number | string;
  at: number;
  size?: number;
}> = ({ n, at, size = 100 }) => {
  const p = usePop(at, true);
  const jig = useJiggle(at + 8);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: c.ink,
        color: c.sun,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: ttheme.fonts.display,
        fontWeight: 700,
        fontSize: size * 0.58,
        boxShadow: `6px 7px 0 0 ${c.sun}`,
        transform: `scale(${p * (1 + jig * 0.1)}, ${p * (1 - jig * 0.1)}) rotate(${(1 - p) * -200}deg)`,
        flexShrink: 0,
      }}
    >
      {n}
    </div>
  );
};

export const TipHeader: React.FC<{
  tip: string;
  title: string;
  highlight: string;
  markColor: string;
  at: number;
  until: number;
}> = ({ tip, title, highlight, markColor, at, until }) => {
  const p = usePop(at, true);
  return (
    <div
      style={{
        position: "absolute",
        top: 200,
        left: 0,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <Appear at={at} until={until} pop>
        <div
          style={{
            fontFamily: ttheme.fonts.display,
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: 3,
            color: c.ink,
            background: markColor,
            padding: "10px 24px",
            borderRadius: 40,
            boxShadow: ttheme.sticker(0.6),
            transform: `rotate(${-6 + (1 - p) * -20}deg)`,
          }}
        >
          {tip}
        </div>
      </Appear>
      <Kinetic
        text={title}
        at={at + 4}
        until={until}
        size={70}
        highlight={highlight}
        markColor={markColor}
      />
    </div>
  );
};

/* --------------------------------- cursor --------------------------------- */

export type CursorKey = { at: number; x: number; y: number };

const cursorPos = (keys: CursorKey[], frame: number) => {
  let x = keys[0].x;
  let y = keys[0].y;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (frame >= a.at) {
      const t = interpolate(frame, [a.at, b.at], [0, 1], {
        easing: ttheme.ease.inOut,
        ...clamp,
      });
      x = a.x + (b.x - a.x) * t;
      y = a.y + (b.y - a.y) * t;
    }
  }
  return { x, y };
};

const ARROW = "M5 2 L5 19 L9.5 15 L12.5 21.5 L15 20.5 L12 14 L18 14 Z";

// Cursor with a motion-blur trail and a starburst on every click.
export const Cursor: React.FC<{
  keys: CursorKey[];
  clicks: number[];
  show: number;
  hide: number;
}> = ({ keys, clicks, show, hide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { x, y } = cursorPos(keys, frame);
  const vis =
    interpolate(frame, [show, show + 8], [0, 1], {
      easing: ttheme.ease.out,
      ...clamp,
    }) *
    interpolate(frame, [hide, hide + 6], [1, 0], {
      easing: ttheme.ease.out,
      ...clamp,
    });
  const press = clicks.reduce((acc, f) => {
    const d = frame - f;
    return d >= 0 && d < fps * 0.3
      ? Math.max(acc, Math.sin((d / (fps * 0.3)) * Math.PI))
      : acc;
  }, 0);
  if (vis <= 0) return null;
  return (
    <>
      {clicks.map((f) => (
        <ClickBurst key={f} at={f} x={x} y={y} />
      ))}
      {/* ghost trail = cheap motion blur on fast moves */}
      {[3, 2, 1].map((k) => {
        const g = cursorPos(keys, frame - k);
        const speed = Math.hypot(g.x - x, g.y - y);
        if (speed < 6) return null;
        return (
          <svg
            key={k}
            width={64}
            height={64}
            viewBox="0 0 24 24"
            style={{
              position: "absolute",
              left: g.x - 8,
              top: g.y - 6,
              opacity: vis * (0.22 - k * 0.05),
            }}
          >
            <path d={ARROW} fill={c.ink} />
          </svg>
        );
      })}
      <svg
        width={64}
        height={64}
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: x - 8,
          top: y - 6,
          opacity: vis,
          transform: `scale(${1 - press * 0.2}) rotate(${press * -10}deg)`,
          transformOrigin: "8px 6px",
          filter: `drop-shadow(3px 4px 0 ${c.ink}55)`,
        }}
      >
        <path
          d={ARROW}
          fill={c.ink}
          stroke="#fff"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};

// radial dashes + ring: the comic "click!" burst
export const ClickBurst: React.FC<{
  at: number;
  x: number;
  y: number;
  color?: string;
  r?: number;
}> = ({ at, x, y, color = c.ink, r = 70 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = frame - at;
  if (d < 0 || d > fps * 0.45) return null;
  const t = interpolate(d, [0, fps * 0.45], [0, 1], {
    easing: ttheme.ease.out,
    ...clamp,
  });
  return (
    <svg
      width={r * 4}
      height={r * 4}
      viewBox={`${-r * 2} ${-r * 2} ${r * 4} ${r * 4}`}
      style={{
        position: "absolute",
        left: x - r * 2,
        top: y - r * 2,
        overflow: "visible",
      }}
    >
      <circle
        r={r * (0.3 + t)}
        fill="none"
        stroke={color}
        strokeWidth={6 * (1 - t)}
        opacity={0.6}
      />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r1 = r * (0.5 + t * 0.9);
        const r2 = r * (0.75 + t * 1.1);
        return (
          <line
            key={i}
            x1={Math.cos(a) * r1}
            y1={Math.sin(a) * r1}
            x2={Math.cos(a) * r2}
            y2={Math.sin(a) * r2}
            stroke={i % 2 ? c.sun : color}
            strokeWidth={8 * (1 - t)}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

/* -------------------------------- browser --------------------------------- */

export const Browser: React.FC<{
  url: React.ReactNode;
  width: number;
  height: number;
  dark?: boolean;
  children: React.ReactNode;
}> = ({ url, width, height, dark = false, children }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 34,
      background: dark ? c.gh : c.card,
      boxShadow: ttheme.sticker(1),
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        height: 84,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 28px",
        background: dark ? "#1B1F24" : c.bgAlt,
        borderBottom: `4px solid ${c.ink}`,
      }}
    >
      {[c.bad, c.sun, c.good].map((col) => (
        <div
          key={col}
          style={{
            width: 22,
            height: 22,
            borderRadius: 22,
            background: col,
            boxShadow: `0 0 0 3px ${c.ink}`,
          }}
        />
      ))}
      <div
        style={{
          marginLeft: 16,
          flex: 1,
          height: 50,
          borderRadius: 25,
          background: dark ? c.ghCard : c.card,
          boxShadow: `0 0 0 3px ${dark ? "#000" : c.ink}`,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          fontFamily: ttheme.fonts.mono,
          fontSize: 28,
          color: dark ? c.ghText : c.ink,
        }}
      >
        <LockIcon color={dark ? c.ghDim : c.inkDim} />
        <span style={{ marginLeft: 12 }}>{url}</span>
      </div>
    </div>
    <div style={{ flex: 1, position: "relative" }}>{children}</div>
  </div>
);

/* ---------------------------------- icons --------------------------------- */
// Drawn in SVG with theme colors — never emoji.

export const LockIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width={22} height={26} viewBox="0 0 22 26">
    <rect x={2} y={11} width={18} height={13} rx={3} fill={color} />
    <path
      d="M6 11 V8 a5 5 0 0 1 10 0 V11"
      stroke={color}
      strokeWidth={3}
      fill="none"
    />
  </svg>
);

export const TickCircle: React.FC<{
  size: number;
  color?: string;
  at: number;
}> = ({ size, color = c.good, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = usePop(at, true);
  const draw = interpolate(frame - at, [fps * 0.08, fps * 0.3], [1, 0], {
    easing: ttheme.ease.out,
    ...clamp,
  });
  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <ClickBurst
        at={at + 2}
        x={size / 2}
        y={size / 2}
        color={color}
        r={size * 0.6}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${p}) rotate(${(1 - p) * -45}deg)`,
          overflow: "visible",
        }}
      >
        <circle
          cx={20}
          cy={20}
          r={18}
          fill={color}
          stroke={c.ink}
          strokeWidth={3}
        />
        <path
          d="M11 20.5 L17.5 27 L29.5 14"
          stroke="#fff"
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={draw}
        />
      </svg>
    </div>
  );
};

export const CrossCircle: React.FC<{ size: number; at: number }> = ({
  size,
  at,
}) => {
  const frame = useCurrentFrame();
  const p = usePop(at, true);
  const shake =
    frame >= at
      ? Math.sin((frame - at) * 1.9) * 10 * Math.exp(-(frame - at) / 6)
      : 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{
        transform: `scale(${p}) rotate(${(1 - p) * 90 + shake}deg)`,
        flexShrink: 0,
        overflow: "visible",
      }}
    >
      <circle
        cx={20}
        cy={20}
        r={18}
        fill={c.bad}
        stroke={c.ink}
        strokeWidth={3}
      />
      <path
        d="M13 13 L27 27 M27 13 L13 27"
        stroke="#fff"
        strokeWidth={4.5}
        strokeLinecap="round"
      />
    </svg>
  );
};

export const TargetIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={17} fill="none" stroke={c.ink} strokeWidth={4} />
    <circle cx={20} cy={20} r={10} fill="none" stroke={c.ink} strokeWidth={4} />
    <circle cx={20} cy={20} r={4} fill={c.ink} />
  </svg>
);

export const PageIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path
      d="M9 4 H24 L32 12 V36 H9 Z"
      fill="none"
      stroke={c.ink}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <path
      d="M14 18 H27 M14 24 H27 M14 30 H22"
      stroke={c.ink}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
  </svg>
);

export const LayoutIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <rect
      x={5}
      y={5}
      width={30}
      height={30}
      rx={5}
      fill="none"
      stroke={c.ink}
      strokeWidth={4}
    />
    <path d="M5 15 H35 M17 15 V35" stroke={c.ink} strokeWidth={4} />
  </svg>
);

export const RepoIcon: React.FC<{ size: number; color?: string }> = ({
  size,
  color = c.ink,
}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path
      d="M8 6 H30 V30 H12 a4 4 0 0 0 0 8 H30 M8 6 V34"
      fill="none"
      stroke={color}
      strokeWidth={3.5}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export const BranchIcon: React.FC<{ size: number; color?: string }> = ({
  size,
  color = c.ink,
}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={12} cy={9} r={4} fill="none" stroke={color} strokeWidth={3.5} />
    <circle
      cx={12}
      cy={31}
      r={4}
      fill="none"
      stroke={color}
      strokeWidth={3.5}
    />
    <circle
      cx={28}
      cy={13}
      r={4}
      fill="none"
      stroke={color}
      strokeWidth={3.5}
    />
    <path
      d="M12 13 V27 M28 17 C28 24 12 21 12 27"
      fill="none"
      stroke={color}
      strokeWidth={3.5}
    />
  </svg>
);

/* -------------------------------- sparkle --------------------------------- */

const STAR4 =
  "M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10 Z";

// 4-point stars that burst out and twinkle away
export const Sparkles: React.FC<{
  at: number;
  x: number;
  y: number;
  spread?: number;
}> = ({ at, x, y, spread = 160 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = frame - at;
  if (d < 0 || d > fps * 1.1) return null;
  return (
    <>
      {Array.from({ length: 9 }).map((_, i) => {
        const a = (i / 9) * Math.PI * 2 + 0.4;
        const local = d - i * 1.2;
        const p = spring({ frame: local, fps, config: ttheme.spring.snappy });
        const fade = interpolate(local, [fps * 0.5, fps * 0.9], [1, 0], {
          easing: ttheme.ease.in,
          ...clamp,
        });
        const s = (i % 2 ? 28 : 46) * p * fade;
        return (
          <svg
            key={i}
            width={s}
            height={s}
            viewBox="-12 -12 24 24"
            style={{
              position: "absolute",
              left: x + Math.cos(a) * spread * p - s / 2,
              top: y + Math.sin(a) * spread * 0.7 * p - s / 2,
              transform: `rotate(${local * 5}deg)`,
              overflow: "visible",
            }}
          >
            <path
              d={STAR4}
              fill={[c.sun, c.mint, c.sky, c.lilac][i % 4]}
              stroke={c.ink}
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </>
  );
};

// deterministic confetti burst
export const Confetti: React.FC<{ at: number; x: number; y: number }> = ({
  at,
  x,
  y,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame - at) / fps;
  if (t < 0 || t > 2.2) return null;
  return (
    <>
      {Array.from({ length: 44 }).map((_, i) => {
        const f1 = hash(i);
        const f2 = hash(i + 100);
        const ang = -Math.PI / 2 + (f1 - 0.5) * 2.8;
        const v = 1000 + f2 * 900;
        const drag = 1 - Math.min(0.6, t * 0.35);
        const px = x + Math.cos(ang) * v * t * drag + Math.sin(t * 8 + i) * 18;
        const py = y + Math.sin(ang) * v * t * drag + 1500 * t * t;
        const fade = interpolate(t, [1.4, 2.1], [1, 0], {
          easing: ttheme.ease.in,
          ...clamp,
        });
        const flip = Math.cos(t * (8 + f1 * 10));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: i % 3 === 0 ? 20 : 15,
              height: i % 3 === 0 ? 20 : 30,
              borderRadius: i % 3 === 0 ? 20 : 4,
              background: c.confetti[i % c.confetti.length],
              opacity: fade,
              transform: `rotate(${t * (300 + f1 * 500)}deg) scaleX(${flip})`,
            }}
          />
        );
      })}
    </>
  );
};

/* --------------------------------- emotes --------------------------------- */

export type EmoteKind = "!" | "?" | "heart" | "note" | "sparkle" | "idea";

// a little comic emote that pops above Clawdy's head and floats away
export const Emote: React.FC<{ kind: EmoteKind; at: number; size: number }> = ({
  kind,
  at,
  size,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = frame - at;
  if (d < 0 || d > fps * 1.3) return null;
  const p = spring({ frame: d, fps, config: ttheme.spring.jelly });
  const fade = interpolate(d, [fps * 0.9, fps * 1.3], [1, 0], {
    easing: ttheme.ease.in,
    ...clamp,
  });
  const rise = interpolate(d, [0, fps * 1.3], [0, -size * 0.5], {
    easing: ttheme.ease.out,
    ...clamp,
  });
  const sway = Math.sin(d / 3) * 8;
  const glyph = (() => {
    switch (kind) {
      case "!":
        return (
          <>
            <circle r={30} fill={c.sun} stroke={c.ink} strokeWidth={5} />
            <path
              d="M0 -16 V5"
              stroke={c.ink}
              strokeWidth={8}
              strokeLinecap="round"
            />
            <circle cy={16} r={4.5} fill={c.ink} />
          </>
        );
      case "?":
        return (
          <>
            <circle r={30} fill={c.lilac} stroke={c.ink} strokeWidth={5} />
            <path
              d="M-9 -8 Q-9 -19 1 -19 Q11 -19 11 -10 Q11 -3 2 1 V6"
              stroke={c.ink}
              strokeWidth={7}
              strokeLinecap="round"
              fill="none"
            />
            <circle cx={2} cy={17} r={4.5} fill={c.ink} />
          </>
        );
      case "heart":
        return (
          <g transform="scale(2.6)">
            <path
              d="M0,6 C-2,3 -11,-1 -11,-7 C-11,-12 -5,-14 0,-9 C5,-14 11,-12 11,-7 C11,-1 2,3 0,6 Z"
              fill={c.heart}
              stroke={c.ink}
              strokeWidth={1.8}
            />
          </g>
        );
      case "note":
        return (
          <g stroke={c.ink} strokeWidth={6} strokeLinecap="round" fill={c.ink}>
            <path d="M-6 14 V-20 L18 -26 V8" fill="none" />
            <ellipse cx={-13} cy={15} rx={9} ry={7} />
            <ellipse cx={11} cy={9} rx={9} ry={7} />
          </g>
        );
      case "idea":
        return (
          <>
            <circle
              cy={-4}
              r={22}
              fill={c.sun}
              stroke={c.ink}
              strokeWidth={5}
            />
            <rect x={-10} y={16} width={20} height={12} rx={3} fill={c.ink} />
            {[0, 1, 2, 3, 4].map((i) => {
              const a = -Math.PI + (i / 4) * Math.PI;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * 30}
                  y1={-4 + Math.sin(a) * 30}
                  x2={Math.cos(a) * 40}
                  y2={-4 + Math.sin(a) * 40}
                  stroke={c.ink}
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              );
            })}
          </>
        );
      default:
        return (
          <path
            d={STAR4}
            transform="scale(3)"
            fill={c.sun}
            stroke={c.ink}
            strokeWidth={1.4}
          />
        );
    }
  })();
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      style={{
        position: "absolute",
        left: -size / 2,
        top: -size / 2 + rise,
        opacity: fade,
        transform: `scale(${p}) rotate(${(1 - p) * 30 + sway}deg)`,
        overflow: "visible",
      }}
    >
      {glyph}
    </svg>
  );
};

/* --------------------------------- camera --------------------------------- */

export type Punch = { at: number; x: number; y: number; k: number }; // seconds
export type Shake = { at: number; amp: number };

// Virtual camera: slow handheld drift, zoom punches toward the action, shakes.
export const Camera: React.FC<{
  punches: Punch[];
  shakes: Shake[];
  children: React.ReactNode;
}> = ({ punches, shakes, children }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  let zoom = 0;
  let fx = width / 2;
  let fy = height / 2;
  for (const p of punches) {
    const d = frame - p.at * fps;
    if (d < -4) continue;
    const env =
      d < 0
        ? interpolate(d, [-4, 0], [0, 1], { easing: ttheme.ease.out, ...clamp })
        : Math.exp(-d / (fps * 0.28));
    if (env * p.k > zoom * 0.5) {
      fx = p.x;
      fy = p.y;
    }
    zoom = Math.max(zoom, env * p.k);
  }
  let sx = 0;
  let sy = 0;
  let sr = 0;
  for (const s of shakes) {
    const d = frame - s.at * fps;
    if (d < 0 || d > fps) continue;
    const e = Math.exp(-d / 4) * s.amp;
    sx += Math.sin(d * 2.1) * e;
    sy += Math.cos(d * 2.7) * e;
    sr += Math.sin(d * 1.7) * e * 0.05;
  }
  const driftR = Math.sin(t / 2.3) * 0.35;
  const driftX = Math.sin(t / 3.1) * 6;
  const driftY = Math.cos(t / 2.7) * 6;
  const push = 1.02 + Math.sin(t / 4) * 0.01;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${driftX + sx}px, ${driftY + sy}px) rotate(${driftR + sr}deg) scale(${push})`,
      }}
    >
      <AbsoluteFill
        style={{
          transformOrigin: `${fx}px ${fy}px`,
          transform: `scale(${1 + zoom})`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------- transitions ------------------------------ */

// Layered iris wipe: candy circles cover the frame, a title card holds for a
// beat, then the circles punch open on the next scene.
export const Wipe: React.FC<{
  cut: number; // frame of the cut
  x: number;
  y: number;
  label: string;
  colors: [string, string, string];
}> = ({ cut, x, y, label, colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = frame - cut;
  const inF = Math.round(fps * 0.3);
  const holdF = Math.round(fps * 0.2);
  const outF = Math.round(fps * 0.34);
  if (d < -inF - 6 || d > holdF + outF + 6) return null;
  const R = 2400;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {colors.map((col, i) => {
        const grow = interpolate(d, [-inF - 4 + i * 3, -2 + i * 2], [0, R], {
          easing: ttheme.ease.in,
          ...clamp,
        });
        const hole = interpolate(
          d,
          [holdF + (2 - i) * 3, holdF + outF + (2 - i) * 3],
          [0, R],
          { easing: ttheme.ease.out, ...clamp },
        );
        return (
          <AbsoluteFill
            key={i}
            style={{
              background: col,
              clipPath: `circle(${grow}px at ${x}px ${y}px)`,
              WebkitMaskImage:
                hole > 0
                  ? `radial-gradient(circle at ${x}px ${y}px, transparent ${hole}px, black ${hole + 1}px)`
                  : undefined,
              maskImage:
                hole > 0
                  ? `radial-gradient(circle at ${x}px ${y}px, transparent ${hole}px, black ${hole + 1}px)`
                  : undefined,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: interpolate(d, [holdF + 2, holdF + 8], [1, 0], {
            easing: ttheme.ease.in,
            ...clamp,
          }),
        }}
      >
        <Kinetic
          text={label}
          at={cut - 6}
          size={190}
          color={c.sun}
          per={2}
          shadow={c.primaryDark}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------- layers ---------------------------------- */

const DECOR = Array.from({ length: 16 }).map((_, i) => ({
  kind: i % 5,
  x: 40 + hash(i * 3) * 1000,
  y: 120 + hash(i * 3 + 1) * 1700,
  size: 34 + hash(i * 3 + 2) * 60,
  color: ["sun", "mint", "sky", "lilac", "blush"][i % 5] as
    | "sun"
    | "mint"
    | "sky"
    | "lilac"
    | "blush",
  speed: 0.6 + hash(i + 50) * 0.8,
  phase: hash(i + 70) * 6.28,
}));

const DecorShape: React.FC<{ kind: number; size: number; color: string }> = ({
  kind,
  size,
  color,
}) => {
  const common = {
    stroke: c.ink,
    strokeWidth: 3.5,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="-20 -20 40 40"
      style={{ overflow: "visible" }}
    >
      {kind === 0 && (
        <path
          d={STAR4}
          transform="scale(1.7)"
          fill={color}
          {...common}
          strokeWidth={2}
        />
      )}
      {kind === 1 && (
        <circle r={14} fill="none" stroke={color} strokeWidth={7} />
      )}
      {kind === 2 && (
        <path
          d="M-5 -16 H5 V-5 H16 V5 H5 V16 H-5 V5 H-16 V-5 H-5 Z"
          fill={color}
          {...common}
        />
      )}
      {kind === 3 && (
        <path
          d="M-18 4 Q-9 -10 0 4 T18 4"
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
        />
      )}
      {kind === 4 && <circle r={11} fill={color} {...common} />}
    </svg>
  );
};

// Layer 1 — scene-tinted backdrop: drifting blobs, floating shapes, dot grid
export const CreamBg: React.FC<{ tint: string }> = ({ tint }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: tint }}>
      <div
        style={{
          position: "absolute",
          width: 1300,
          height: 1300,
          borderRadius: "50%",
          top: -480 + Math.sin(t / 2.1) * 80,
          left: -420 + Math.cos(t / 2.6) * 90,
          filter: "blur(70px)",
          background: `radial-gradient(circle, ${c.blush}66, transparent 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          bottom: -460 + Math.cos(t / 2.4) * 80,
          right: -460 + Math.sin(t / 1.9) * 90,
          filter: "blur(80px)",
          background: `radial-gradient(circle, ${c.sky}88, transparent 64%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${c.ink}18 2.4px, transparent 2.8px)`,
          backgroundSize: "44px 44px",
          backgroundPosition: `${(t * 8) % 44}px ${(t * 16) % 44}px`,
        }}
      />
      {DECOR.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.x + Math.sin(t * d.speed + d.phase) * 30,
            top:
              d.y +
              Math.cos(t * d.speed * 0.8 + d.phase) * 40 -
              ((t * 14 * d.speed) % 60),
            opacity: 0.75,
            transform: `rotate(${t * 25 * d.speed + d.phase * 30}deg) scale(${1 + 0.12 * Math.sin(t * 2 + d.phase)})`,
          }}
        >
          <DecorShape kind={d.kind} size={d.size} color={c[d.color]} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

// Layer 4 — gentle warm grade
export const WarmGrade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        backgroundColor: "#E9A27A",
        mixBlendMode: "soft-light",
        opacity: 0.14,
      }}
    />
  </AbsoluteFill>
);

// Layer 5a — light film grain
export const SoftGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: noise,
        backgroundSize: "220px",
        backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
        opacity: 0.05,
        mixBlendMode: "multiply",
      }}
    />
  );
};

// Layer 5b — soft vignette, topmost
export const SoftVignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at center, transparent 60%, rgba(60,40,25,0.16) 100%)",
    }}
  />
);
