import React from "react";
import { AbsoluteFill } from "remotion";
import { ttheme } from "../theme3";
import { Appear, Bubble, Sfx, Sparkles, TickCircle, useSec } from "../ui";

const c = ttheme.colors;

const ITEMS = [
  "New topic? New chat.",
  "Goal + context + format",
  "Connect GitHub, ship PRs",
];

// Scene 4 — checklist recap, Clawdy winks, end card (8s)
export const Recap: React.FC<{ duration: number }> = ({ duration }) => {
  const s = useSec();
  const exit = duration - 11;
  const itemAt = (i: number) => s(0.8 + i * 0.6);
  return (
    <AbsoluteFill>
      <Appear
        at={s(0.2)}
        until={exit}
        style={{ position: "absolute", left: 80, top: 250 }}
      >
        <div
          style={{
            width: 920,
            borderRadius: 40,
            background: c.card,
            boxShadow: `0 30px 60px ${c.shadow}, 0 0 0 3px ${c.ink}`,
            padding: "50px 56px",
          }}
        >
          <div
            style={{
              fontFamily: ttheme.fonts.display,
              fontWeight: 700,
              fontSize: 84,
              color: c.ink,
              marginBottom: 20,
            }}
          >
            Recap
          </div>
          {ITEMS.map((t, i) => (
            <Appear key={t} at={itemAt(i)} rise={24}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  padding: "26px 0",
                  borderTop: `3px dashed ${c.line}`,
                  fontFamily: ttheme.fonts.display,
                  fontWeight: 500,
                  fontSize: 50,
                  color: c.ink,
                }}
              >
                <TickCircle size={70} at={itemAt(i) + 3} />
                {t}
              </div>
            </Appear>
          ))}
        </div>
      </Appear>
      <Bubble
        at={s(3.8)}
        until={exit}
        x={170}
        y={1000}
        w={740}
        text="You're ready! Go build something cool."
        tail="center"
        size={52}
      />
      <Sparkles at={s(3.8)} x={540} y={1300} spread={300} />
      <Appear
        at={s(5.6)}
        until={exit}
        rise={30}
        style={{
          position: "absolute",
          top: 1610,
          width: "100%",
          textAlign: "center",
          fontFamily: ttheme.fonts.body,
          fontWeight: 800,
          fontSize: 36,
          letterSpacing: 3,
          color: c.inkDim,
        }}
      >
        MADE WITH CLAUDE + REMOTION
      </Appear>
      {ITEMS.map((t, i) => (
        <Sfx key={t} at={itemAt(i) + 3} name="pop" />
      ))}
      <Sfx at={s(3.8)} name="pop" />
      <Sfx at={s(3.8)} name="sparkle" volume={0.45} />
      <Sfx at={s(5.6)} name="pop" volume={0.35} />
    </AbsoluteFill>
  );
};
