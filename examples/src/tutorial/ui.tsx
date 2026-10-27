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

/* ---------------------------------- sound --------------------------------- */

export type SfxName = "pop" | "boop" | "type" | "sparkle" | "whoosh";

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
    config: pop ? ttheme.spring.bouncy : ttheme.spring.smooth,
  });
  const out =
    until === undefined
      ? 0
      : interpolate(frame, [until, until + 10], [0, 1], {
          easing: ttheme.ease.in,
          ...clamp,
        });
  const scale = pop
    ? interpolate(p, [0, 1], [0.3, 1])
    : interpolate(p, [0, 1], [0.94, 1]);
  return (
    <div
      style={{
        opacity: Math.min(1, p * 1.4) * (1 - out),
        transform: `translateY(${interpolate(p, [0, 1], [rise, 0]) - out * 40}px) scale(${scale * (1 - out * 0.04)})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// spring 0 -> 1 with overshoot, for things that "pop"
export const usePop = (at: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: ttheme.spring.bouncy });
};

/* --------------------------------- text ----------------------------------- */

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
  const p = usePop(at);
  const out = interpolate(frame, [until, until + 8], [0, 1], {
    easing: ttheme.ease.in,
    ...clamp,
  });
  const tailX = tail === "left" ? 70 : tail === "right" ? w - 70 : w / 2;
  if (frame < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        transformOrigin: `${tailX}px 100%`,
        transform: `scale(${p * (1 - out)}) rotate(${(1 - p) * -6}deg)`,
        opacity: 1 - out,
      }}
    >
      <div
        style={{
          position: "relative",
          background: c.card,
          borderRadius: 40,
          padding: "30px 40px",
          boxShadow: `0 18px 40px ${c.shadow}, 0 0 0 3px ${c.ink}`,
          fontFamily: ttheme.fonts.display,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.18,
          color: c.ink,
          textAlign: "center",
        }}
      >
        <TypeText text={text} at={at + 4} per={0.8} />
        <div
          style={{
            position: "absolute",
            left: tailX - 20,
            bottom: -19,
            width: 40,
            height: 40,
            background: c.card,
            transform: "rotate(45deg)",
            boxShadow: `3px 3px 0 0 ${c.ink}`,
            borderRadius: 6,
          }}
        />
      </div>
    </div>
  );
};

/* --------------------------------- badges --------------------------------- */

export const NumBadge: React.FC<{
  n: number | string;
  at: number;
  size?: number;
}> = ({ n, at, size = 100 }) => {
  const p = usePop(at);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: c.ink,
        color: c.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: ttheme.fonts.display,
        fontWeight: 700,
        fontSize: size * 0.56,
        transform: `scale(${p}) rotate(${(1 - p) * -90}deg)`,
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
  at: number;
  until: number;
}> = ({ tip, title, at, until }) => (
  <Appear
    at={at}
    until={until}
    style={{
      position: "absolute",
      top: 210,
      left: 0,
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 22,
    }}
  >
    <div
      style={{
        fontFamily: ttheme.fonts.display,
        fontWeight: 700,
        fontSize: 34,
        letterSpacing: 3,
        color: c.bg,
        background: c.ink,
        padding: "10px 22px",
        borderRadius: 40,
      }}
    >
      {tip}
    </div>
    <div
      style={{
        fontFamily: ttheme.fonts.display,
        fontWeight: 600,
        fontSize: 66,
        color: c.ink,
      }}
    >
      {title}
    </div>
  </Appear>
);

/* --------------------------------- cursor --------------------------------- */

export type CursorKey = { at: number; x: number; y: number };

export const Cursor: React.FC<{
  keys: CursorKey[];
  clicks: number[];
  show: number;
  hide: number;
}> = ({ keys, clicks, show, hide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
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
      {clicks.map((f) => {
        const d = frame - f;
        if (d < 0 || d > fps * 0.5) return null;
        const t = d / (fps * 0.5);
        return (
          <div
            key={f}
            style={{
              position: "absolute",
              left: x - 50,
              top: y - 50,
              width: 100,
              height: 100,
              borderRadius: 100,
              border: `5px solid ${c.ink}`,
              opacity: (1 - t) * 0.5 * vis,
              transform: `scale(${0.3 + t})`,
            }}
          />
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
          transform: `scale(${1 - press * 0.18})`,
          transformOrigin: "8px 6px",
          filter: `drop-shadow(0 6px 8px ${c.shadow})`,
        }}
      >
        <path
          d="M5 2 L5 19 L9.5 15 L12.5 21.5 L15 20.5 L12 14 L18 14 Z"
          fill={c.ink}
          stroke="#fff"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </>
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
      borderRadius: 32,
      background: dark ? c.gh : c.card,
      boxShadow: `0 30px 60px ${c.shadow}, 0 0 0 3px ${c.ink}`,
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
        borderBottom: `3px solid ${dark ? "#000" : c.line}`,
      }}
    >
      {[c.bad, "#E8B04A", c.good].map((col) => (
        <div
          key={col}
          style={{
            width: 20,
            height: 20,
            borderRadius: 20,
            background: col,
            opacity: 0.85,
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
  const p = usePop(at);
  const draw = interpolate(frame - at, [fps * 0.1, fps * 0.35], [1, 0], {
    easing: ttheme.ease.out,
    ...clamp,
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{ transform: `scale(${p})`, flexShrink: 0 }}
    >
      <circle cx={20} cy={20} r={19} fill={color} />
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
  );
};

export const CrossCircle: React.FC<{ size: number; at: number }> = ({
  size,
  at,
}) => {
  const p = usePop(at);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{
        transform: `scale(${p}) rotate(${(1 - p) * 90}deg)`,
        flexShrink: 0,
      }}
    >
      <circle cx={20} cy={20} r={19} fill={c.bad} />
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
      {Array.from({ length: 7 }).map((_, i) => {
        const a = (i / 7) * Math.PI * 2 + 0.4;
        const local = d - i * 1.5;
        const p = spring({ frame: local, fps, config: ttheme.spring.snappy });
        const fade = interpolate(local, [fps * 0.5, fps * 0.9], [1, 0], {
          easing: ttheme.ease.in,
          ...clamp,
        });
        const s = (i % 2 ? 26 : 40) * p * fade;
        return (
          <svg
            key={i}
            width={s}
            height={s}
            viewBox="-10 -10 20 20"
            style={{
              position: "absolute",
              left: x + Math.cos(a) * spread * p - s / 2,
              top: y + Math.sin(a) * spread * 0.7 * p - s / 2,
              transform: `rotate(${local * 4}deg)`,
            }}
          >
            <path
              d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10 Z"
              fill={i % 3 === 0 ? "#E8B04A" : c.ink}
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
  if (t < 0 || t > 2) return null;
  return (
    <>
      {Array.from({ length: 28 }).map((_, i) => {
        const r1 = Math.sin(i * 12.9898) * 43758.5453;
        const r2 = Math.sin(i * 78.233) * 12345.678;
        const f1 = r1 - Math.floor(r1);
        const f2 = r2 - Math.floor(r2);
        const ang = -Math.PI / 2 + (f1 - 0.5) * 2.6;
        const v = 900 + f2 * 700;
        const px = x + Math.cos(ang) * v * t;
        const py = y + Math.sin(ang) * v * t + 1400 * t * t;
        const fade = interpolate(t, [1.2, 1.9], [1, 0], {
          easing: ttheme.ease.in,
          ...clamp,
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: i % 3 === 0 ? 18 : 14,
              height: i % 3 === 0 ? 18 : 26,
              borderRadius: i % 3 === 0 ? 18 : 4,
              background: c.confetti[i % c.confetti.length],
              opacity: fade,
              transform: `rotate(${t * (300 + f1 * 400)}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

/* -------------------------------- layers ---------------------------------- */

// Layer 1 — drifting warm mesh with a faint dot grid
export const CreamBg: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <div
        style={{
          position: "absolute",
          width: 1300,
          height: 1300,
          borderRadius: "50%",
          top: -480 + Math.sin(t / 2.1) * 60,
          left: -420 + Math.cos(t / 2.6) * 70,
          filter: "blur(70px)",
          background: `radial-gradient(circle, ${c.blush}55, transparent 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          bottom: -460 + Math.cos(t / 2.4) * 60,
          right: -460 + Math.sin(t / 1.9) * 70,
          filter: "blur(80px)",
          background: `radial-gradient(circle, ${c.accent}, transparent 64%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${c.ink}14 2.2px, transparent 2.6px)`,
          backgroundSize: "44px 44px",
          backgroundPosition: `0px ${(t * 12) % 44}px`,
        }}
      />
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
        opacity: 0.16,
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
        opacity: 0.06,
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
