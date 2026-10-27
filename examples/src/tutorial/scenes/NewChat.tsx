import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ttheme } from "../theme3";
import {
  Appear,
  Browser,
  Bubble,
  CrossCircle,
  Cursor,
  LayoutIcon,
  PageIcon,
  Sfx,
  Sparkles,
  TargetIcon,
  TickCircle,
  TipHeader,
  TypeSfx,
  TypeText,
  useSec,
} from "../ui";

const c = ttheme.colors;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Clawdy sits bottom-left in this scene; bubbles grow from its top-right.
const BUBBLE = { x: 330, y: 1230, w: 680 };

const OLD_CHATS = [
  "Trip + essay + bug fix",
  "help!!",
  "random stuff",
  "Untitled",
  "more questions",
];
const TAGS = ["essay", "bug fix", "trip", "recipe", "taxes"];

/* --------------------------- part A: new chat button ---------------------- */
const PartA: React.FC<{ until: number }> = ({ until }) => {
  const frame = useCurrentFrame();
  const s = useSec();
  const click = s(1.45);
  const clearOut = (i: number) =>
    interpolate(frame, [click + 2 + i * 2, click + 10 + i * 2], [0, 1], {
      easing: ttheme.ease.in,
      ...clamp,
    });
  const btnPress = interpolate(
    frame,
    [click, click + 3, click + 9],
    [1, 0.9, 1],
    {
      easing: ttheme.ease.out,
      ...clamp,
    },
  );
  return (
    <>
      <Appear
        at={s(0.35)}
        until={until}
        style={{ position: "absolute", left: 80, top: 360 }}
      >
        <Browser url="claude.ai" width={920} height={780}>
          <div style={{ position: "absolute", inset: 0, display: "flex" }}>
            {/* sidebar */}
            <div
              style={{
                width: 300,
                background: c.bgAlt,
                padding: 26,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div
                style={{
                  height: 76,
                  borderRadius: 22,
                  background: c.ink,
                  color: c.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  fontFamily: ttheme.fonts.display,
                  fontWeight: 600,
                  fontSize: 36,
                  transform: `scale(${btnPress})`,
                }}
              >
                <span style={{ fontSize: 48, lineHeight: 1, marginTop: -6 }}>
                  +
                </span>{" "}
                New chat
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: ttheme.fonts.body,
                  fontWeight: 800,
                  fontSize: 24,
                  letterSpacing: 2,
                  color: c.inkDim,
                }}
              >
                RECENT
              </div>
              {OLD_CHATS.map((t) => (
                <div
                  key={t}
                  style={{
                    fontFamily: ttheme.fonts.body,
                    fontWeight: 600,
                    fontSize: 27,
                    color: c.inkDim,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
            {/* main area: messy thread, then a clean empty chat */}
            <div style={{ flex: 1, position: "relative", padding: 30 }}>
              <div
                style={{
                  position: "absolute",
                  top: 22,
                  right: 28,
                  fontFamily: ttheme.fonts.mono,
                  fontSize: 22,
                  color: c.bad,
                  opacity: 1 - clearOut(0),
                }}
              >
                message 147 of 147
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginTop: 40,
                }}
              >
                {TAGS.map((t, i) => (
                  <div
                    key={t}
                    style={{
                      fontFamily: ttheme.fonts.body,
                      fontWeight: 700,
                      fontSize: 24,
                      padding: "6px 16px",
                      borderRadius: 20,
                      background: c.accent,
                      color: c.ink,
                      opacity: 1 - clearOut(i),
                      transform: `translateY(${clearOut(i) * -60}px) rotate(${(i % 2 ? 1 : -1) * clearOut(i) * 20}deg)`,
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
              {[0.9, 0.6, 0.8, 0.5, 0.75, 0.65, 0.85].map((w, i) => (
                <div
                  key={i}
                  style={{
                    marginTop: 18,
                    marginLeft: i % 2 ? "auto" : 0,
                    width: `${w * 100}%`,
                    height: 44,
                    borderRadius: 22,
                    background: i % 2 ? c.accent : c.bgAlt,
                    opacity: 1 - clearOut(i + 1),
                    transform: `translateX(${clearOut(i + 1) * (i % 2 ? 300 : -300)}px)`,
                  }}
                />
              ))}
              {/* empty chat */}
              <Appear
                at={click + 10}
                pop
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 40,
                }}
              >
                <div
                  style={{
                    fontFamily: ttheme.fonts.display,
                    fontWeight: 600,
                    fontSize: 46,
                    color: c.ink,
                  }}
                >
                  Fresh start!
                </div>
                <div
                  style={{
                    width: 500,
                    height: 90,
                    borderRadius: 26,
                    border: `3px solid ${c.ink}`,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 26px",
                    fontFamily: ttheme.fonts.body,
                    fontWeight: 600,
                    fontSize: 30,
                    color: c.inkDim,
                  }}
                >
                  Type one topic here…
                </div>
              </Appear>
            </div>
          </div>
        </Browser>
      </Appear>
      <Cursor
        show={s(0.6)}
        hide={until - 4}
        keys={[
          { at: s(0.6), x: 760, y: 1000 },
          { at: s(1.3), x: 270, y: 500 },
        ]}
        clicks={[click]}
      />
      <Bubble
        at={s(2.0)}
        until={until}
        {...BUBBLE}
        text="One topic = one new chat!"
        tail="left"
      />
      <Sfx at={click} name="boop" />
      <Sfx at={click + 4} name="whoosh" volume={0.35} />
      <Sfx at={click + 10} name="pop" volume={0.5} />
      <Sfx at={s(2.0)} name="pop" />
    </>
  );
};

/* ---------------------------- part B: prompt recipe ----------------------- */
const ROWS = [
  { icon: TargetIcon, label: "Goal", text: "Make a 30s video about my app" },
  { icon: PageIcon, label: "Context", text: "It's for students on TikTok" },
  {
    icon: LayoutIcon,
    label: "Format",
    text: "Vertical, upbeat, with captions",
  },
];

const PartB: React.FC<{ start: number; until: number }> = ({
  start,
  until,
}) => {
  const s = useSec();
  const rowAt = (i: number) => start + s(0.5 + i * 0.9);
  return (
    <>
      <Appear
        at={start}
        until={until}
        style={{ position: "absolute", left: 80, top: 380 }}
      >
        <div
          style={{
            width: 920,
            borderRadius: 36,
            background: c.card,
            boxShadow: `0 30px 60px ${c.shadow}, 0 0 0 3px ${c.ink}`,
            padding: "46px 50px",
          }}
        >
          <div
            style={{
              fontFamily: ttheme.fonts.display,
              fontWeight: 600,
              fontSize: 56,
              color: c.ink,
              marginBottom: 26,
            }}
          >
            A good first message
          </div>
          {ROWS.map((r, i) => {
            const Icon = r.icon;
            return (
              <Appear key={r.label} at={rowAt(i)} rise={30}>
                <div
                  style={{
                    display: "flex",
                    gap: 26,
                    alignItems: "flex-start",
                    padding: "24px 0",
                    borderTop: i ? `3px dashed ${c.line}` : undefined,
                  }}
                >
                  <div
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 26,
                      background: c.accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={52} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: ttheme.fonts.display,
                        fontWeight: 700,
                        fontSize: 44,
                        color: c.ink,
                      }}
                    >
                      {r.label}
                    </div>
                    <div
                      style={{
                        fontFamily: ttheme.fonts.mono,
                        fontSize: 31,
                        lineHeight: 1.35,
                        color: c.inkDim,
                        marginTop: 6,
                      }}
                    >
                      <TypeText
                        text={r.text}
                        at={rowAt(i) + 6}
                        per={0.9}
                        caret
                      />
                    </div>
                  </div>
                </div>
              </Appear>
            );
          })}
        </div>
      </Appear>
      <Bubble
        at={start + s(0.2)}
        until={until}
        {...BUBBLE}
        text="Tell Claude 3 things:"
        tail="left"
      />
      <Sfx at={start + s(0.2)} name="pop" />
      {ROWS.map((r, i) => (
        <React.Fragment key={r.label}>
          <Sfx at={rowAt(i)} name="pop" volume={0.45} />
          <TypeSfx at={rowAt(i) + 6} chars={r.text.length} per={0.9} />
        </React.Fragment>
      ))}
    </>
  );
};

/* --------------------------- part C: vague vs clear ----------------------- */
const CLEAR =
  "Make a 30s vertical video about my study app for students. Upbeat, with captions.";

const PromptCard: React.FC<{
  label: string;
  good: boolean;
  dim?: number;
  children: React.ReactNode;
  mark: React.ReactNode;
}> = ({ label, good, dim = 0, children, mark }) => (
  <div
    style={{
      width: 920,
      borderRadius: 36,
      background: c.card,
      boxShadow: `0 24px 50px ${c.shadow}, 0 0 0 ${good ? 5 : 3}px ${good ? c.good : c.ink}`,
      padding: "34px 44px",
      opacity: 1 - dim * 0.45,
      transform: `scale(${1 - dim * 0.04})`,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          fontFamily: ttheme.fonts.body,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: 3,
          color: good ? c.good : c.bad,
        }}
      >
        {label}
      </div>
      {mark}
    </div>
    <div
      style={{
        fontFamily: ttheme.fonts.mono,
        fontSize: 38,
        lineHeight: 1.4,
        color: c.ink,
        marginTop: 14,
      }}
    >
      {children}
    </div>
  </div>
);

const PartC: React.FC<{ start: number; until: number }> = ({
  start,
  until,
}) => {
  const frame = useCurrentFrame();
  const s = useSec();
  const vagueAt = start + s(0.2);
  const crossAt = start + s(0.75);
  const clearAt = start + s(1.2);
  const typeAt = clearAt + 8;
  const per = 0.5;
  const tickAt = typeAt + Math.ceil(CLEAR.length * per) + 6;
  const dim = interpolate(frame, [tickAt, tickAt + 10], [0, 1], {
    easing: ttheme.ease.out,
    ...clamp,
  });
  return (
    <>
      <Appear
        at={vagueAt}
        until={until}
        style={{ position: "absolute", left: 80, top: 380 }}
      >
        <PromptCard
          label="VAGUE"
          good={false}
          dim={dim}
          mark={<CrossCircle size={72} at={crossAt} />}
        >
          make video
        </PromptCard>
      </Appear>
      <Appear
        at={clearAt}
        until={until}
        style={{ position: "absolute", left: 80, top: 690 }}
      >
        <PromptCard
          label="CLEAR"
          good
          mark={<TickCircle size={72} at={tickAt} />}
        >
          <TypeText text={CLEAR} at={typeAt} per={per} caret />
        </PromptCard>
      </Appear>
      <Sparkles at={tickAt} x={860} y={730} spread={110} />
      <Bubble
        at={start + s(0.3)}
        until={until}
        {...BUBBLE}
        text="Be clear, not vague!"
        tail="left"
      />
      <Sfx at={vagueAt} name="pop" volume={0.45} />
      <Sfx at={start + s(0.3)} name="pop" />
      <Sfx at={crossAt} name="boop" volume={0.5} />
      <Sfx at={clearAt} name="pop" volume={0.45} />
      <TypeSfx at={typeAt} chars={CLEAR.length} per={per} every={6} />
      <Sfx at={tickAt} name="sparkle" volume={0.55} />
    </>
  );
};

// Scene 2 — start a new chat properly (12s)
export const NewChat: React.FC<{ duration: number }> = ({ duration }) => {
  const s = useSec();
  const bStart = s(4.5);
  const cStart = s(8.0);
  const exit = duration - 11;
  return (
    <AbsoluteFill>
      <TipHeader
        tip="TIP 1"
        title="Start a new chat"
        at={s(0.2)}
        until={exit}
      />
      <PartA until={bStart - 11} />
      <PartB start={bStart} until={cStart - 11} />
      <PartC start={cStart} until={exit} />
    </AbsoluteFill>
  );
};
