import React from "react";
import { AbsoluteFill } from "remotion";
import { ttheme } from "../theme3";
import {
  Appear,
  Bubble,
  CardIn,
  Kinetic,
  Sfx,
  Sparkles,
  TickCircle,
  useSec,
} from "../ui";

const c = ttheme.colors;

const ITEMS = [
  { text: "New topic? New chat.", tone: c.sun },
  { text: "Goal + context + format", tone: c.mint },
  { text: "Connect GitHub, ship PRs", tone: c.sky },
];

export const RECAP = { items: [0.8, 1.4, 2.0], bubble: 3.8, end: 5.6 };

// Scene 4 — checklist recap, Clawdy winks, end card (8s)
export const Recap: React.FC<{ duration: number }> = ({ duration }) => {
  const s = useSec();
  const exit = duration - 11;
  const itemAt = (i: number) => s(RECAP.items[i]);
  return (
    <AbsoluteFill>
      <CardIn
        at={s(0.2)}
        until={exit}
        style={{ position: "absolute", left: 80, top: 240 }}
      >
        <div
          style={{
            width: 920,
            borderRadius: 42,
            background: c.card,
            boxShadow: ttheme.sticker(1),
            padding: "48px 56px",
          }}
        >
          <Kinetic
            text="Recap time!"
            at={s(0.35)}
            size={92}
            align="left"
            highlight="Recap"
            markColor={c.sun}
            style={{ marginBottom: 18 }}
          />
          {ITEMS.map((it, i) => (
            <Appear key={it.text} at={itemAt(i)} rise={30} pop>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  padding: "24px 0",
                  borderTop: `4px dashed ${c.line}`,
                  fontFamily: ttheme.fonts.display,
                  fontWeight: 600,
                  fontSize: 50,
                  color: c.ink,
                }}
              >
                <TickCircle size={74} at={itemAt(i) + 3} />
                <span
                  style={{
                    background: `linear-gradient(transparent 55%, ${it.tone} 55%, ${it.tone} 92%, transparent 92%)`,
                    padding: "0 6px",
                  }}
                >
                  {it.text}
                </span>
              </div>
            </Appear>
          ))}
        </div>
      </CardIn>
      <Bubble
        at={s(RECAP.bubble)}
        until={exit}
        x={170}
        y={990}
        w={740}
        text="You're ready! Go build something cool."
        tail="center"
        size={54}
      />
      <Sparkles at={s(RECAP.bubble)} x={540} y={1300} spread={320} />
      <Appear
        at={s(RECAP.end)}
        until={exit}
        rise={30}
        pop
        style={{
          position: "absolute",
          top: 1600,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: ttheme.fonts.display,
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: 3,
            color: c.ink,
            background: c.sun,
            padding: "12px 28px",
            borderRadius: 40,
            boxShadow: ttheme.sticker(0.6),
            transform: "rotate(-2deg)",
          }}
        >
          MADE WITH CLAUDE + REMOTION
        </div>
      </Appear>
      {ITEMS.map((it, i) => (
        <Sfx key={it.text} at={itemAt(i) + 3} name="pop" />
      ))}
      <Sfx at={s(0.2)} name="swish" volume={0.45} />
      <Sfx at={s(RECAP.bubble)} name="pop" />
      <Sfx at={s(RECAP.bubble)} name="sparkle" volume={0.5} />
      <Sfx at={s(RECAP.end)} name="pop" volume={0.45} />
    </AbsoluteFill>
  );
};
