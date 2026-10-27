import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ttheme } from "../theme3";
import { Appear, Bubble, Sfx, Sparkles, useSec } from "../ui";

const c = ttheme.colors;

// Scene 1 — Clawdy hops in (global layer), says hi, title pops in.
export const Hello: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const s = useSec();
  const exit = duration - 11;
  const squiggle = interpolate(frame, [s(2.0), s(2.5)], [1, 0], {
    easing: ttheme.ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line = (text: string, at: number, children?: React.ReactNode) => (
    <Appear at={at} until={exit} rise={70} style={{ position: "relative" }}>
      <div
        style={{
          fontFamily: ttheme.fonts.display,
          fontWeight: 700,
          fontSize: 124,
          lineHeight: 1.05,
          color: c.ink,
          textAlign: "center",
        }}
      >
        {text}
      </div>
      {children}
    </Appear>
  );
  return (
    <AbsoluteFill>
      <Bubble
        at={s(0.75)}
        until={exit}
        x={250}
        y={330}
        w={580}
        text="Hi! I'm Clawdy"
        tail="center"
        size={62}
      />
      <div
        style={{
          position: "absolute",
          top: 1150,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {line("Using Claude", s(1.5))}
        {line(
          "the right way",
          s(1.65),
          <svg
            width={420}
            height={40}
            viewBox="0 0 420 40"
            style={{
              position: "absolute",
              left: "50%",
              marginLeft: -110,
              bottom: -26,
            }}
          >
            <path
              d="M6 22 Q40 4 74 22 T142 22 T210 22 T278 22 T346 22 T414 22"
              stroke={c.ink}
              strokeWidth={9}
              strokeLinecap="round"
              fill="none"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={squiggle}
            />
          </svg>,
        )}
        <Appear at={s(2.4)} until={exit} rise={30} style={{ marginTop: 56 }}>
          <div
            style={{
              fontFamily: ttheme.fonts.body,
              fontWeight: 800,
              fontSize: 42,
              color: c.inkDim,
              letterSpacing: 2,
            }}
          >
            A TINY TUTORIAL · 2 TIPS
          </div>
        </Appear>
      </div>
      <Sparkles at={s(2.1)} x={760} y={1320} spread={120} />

      <Sfx at={s(0.75)} name="pop" />
      <Sfx at={s(1.5)} name="pop" volume={0.45} />
      <Sfx at={s(1.65)} name="pop" volume={0.45} />
      <Sfx at={s(2.05)} name="sparkle" volume={0.5} />
      <Sfx at={s(2.4)} name="pop" volume={0.3} />
    </AbsoluteFill>
  );
};
