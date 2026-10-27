import React from "react";
import { AbsoluteFill } from "remotion";
import { ttheme } from "../theme3";
import { Appear, Bubble, Kinetic, Sfx, Sparkles, useSec } from "../ui";

const c = ttheme.colors;

export const HELLO = { bubble: 0.75, title: 1.45 };

// Scene 1 — Clawdy drops in (global layer), says hi, title springs in.
export const Hello: React.FC<{ duration: number }> = ({ duration }) => {
  const s = useSec();
  const exit = duration - 11;
  const title = s(HELLO.title);
  return (
    <AbsoluteFill>
      <Bubble
        at={s(HELLO.bubble)}
        until={exit}
        x={230}
        y={320}
        w={620}
        text="Hi! I'm Clawdy!"
        tail="center"
        size={66}
      />
      <div
        style={{
          position: "absolute",
          top: 1150,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Kinetic
          text="Using Claude"
          at={title}
          until={exit}
          size={136}
          shadow={c.sun}
        />
        <Kinetic
          text="the right way"
          at={title + 10}
          until={exit}
          size={136}
          highlight="right way"
          markColor={c.mint}
          shadow={c.sun}
        />
        <Appear at={s(2.5)} until={exit} rise={30} pop style={{ marginTop: 40 }}>
          <div
            style={{
              fontFamily: ttheme.fonts.display,
              fontWeight: 700,
              fontSize: 40,
              color: c.ink,
              letterSpacing: 3,
              background: c.card,
              padding: "12px 30px",
              borderRadius: 40,
              boxShadow: ttheme.sticker(0.6),
              transform: "rotate(-3deg)",
            }}
          >
            A TINY TUTORIAL · 2 TIPS
          </div>
        </Appear>
      </div>
      <Sparkles at={title + 18} x={800} y={1360} spread={170} />
      <Sparkles at={title + 4} x={250} y={1210} spread={120} />

      <Sfx at={s(HELLO.bubble)} name="pop" />
      <Sfx at={title} name="swish" volume={0.4} />
      <Sfx at={title + 10} name="swish" volume={0.4} />
      <Sfx at={title + 18} name="sparkle" volume={0.5} />
      <Sfx at={s(2.5)} name="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
