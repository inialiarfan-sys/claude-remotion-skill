import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ttheme } from "../theme3";
import {
  Appear,
  Browser,
  Bubble,
  CardIn,
  CrossCircle,
  Cursor,
  Kinetic,
  LayoutIcon,
  PageIcon,
  Sfx,
  Sparkles,
  TargetIcon,
  TickCircle,
  TipHeader,
  TypeSfx,
  TypeText,
  useJiggle,
  useSec,
} from "../ui";

const c = ttheme.colors;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Scene-local timing in seconds, shared with the camera/acting tracks.
const CLEAR =
  "Make a 30s vertical video about my study app for students. Upbeat, with captions.";
const CLEAR_CPS = 60; // characters per second
export const NEWCHAT = {
  click: 1.45,
  bubbleA: 2.0,
  partB: 4.5,
  bubbleB: 4.7,
  rows: [5.0, 5.9, 6.8],
  partC: 8.0,
  bubbleC: 8.3,
  cross: 8.75,
  clear: 9.2,
  clearType: 9.47,
  // tick lands just after the clear prompt has typed out
  tick: 9.47 + CLEAR.length / CLEAR_CPS + 0.2,
};

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
  const click = s(NEWCHAT.click);
  const clearOut = (i: number) =>
    interpolate(frame, [click + 2 + i * 2, click + 10 + i * 2], [0, 1], {
      easing: ttheme.ease.in,
      ...clamp,
    });
  const jig = useJiggle(click);
  const panic = frame < click ? Math.sin(frame / 1.5) * 3 : 0;
  return (
    <>
      <CardIn
        at={s(0.3)}
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
                borderRight: `4px solid ${c.ink}`,
                padding: 26,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div
                style={{
                  height: 78,
                  borderRadius: 24,
                  background: c.sun,
                  color: c.ink,
                  boxShadow: `0 0 0 4px ${c.ink}, 5px 6px 0 4px ${c.ink}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  fontFamily: ttheme.fonts.display,
                  fontWeight: 700,
                  fontSize: 36,
                  transform: `scale(${1 - jig * 0.12}, ${1 + jig * 0.12})`,
                }}
              >
                <span style={{ fontSize: 50, lineHeight: 1, marginTop: -6 }}>
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
                  fontWeight: 700,
                  fontSize: 22,
                  color: c.bad,
                  opacity: 1 - clearOut(0),
                  transform: `rotate(${panic}deg)`,
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
                      fontWeight: 800,
                      fontSize: 24,
                      padding: "6px 16px",
                      borderRadius: 20,
                      background: [c.sun, c.mint, c.sky, c.lilac, c.blush][i],
                      boxShadow: `0 0 0 3px ${c.ink}`,
                      color: c.ink,
                      opacity: 1 - clearOut(i),
                      transform: `translateY(${clearOut(i) * -90 + Math.sin(frame / 3 + i) * 3}px) rotate(${(i % 2 ? 1 : -1) * (clearOut(i) * 40 + 4)}deg)`,
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
                    transform: `translateX(${clearOut(i + 1) * (i % 2 ? 400 : -400)}px) rotate(${clearOut(i + 1) * (i % 2 ? 20 : -20)}deg)`,
                  }}
                />
              ))}
              {/* empty chat */}
              <div
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
                <Kinetic text="Fresh start!" at={click + 10} size={58} />
                <Appear at={click + 16} pop>
                  <div
                    style={{
                      width: 500,
                      height: 90,
                      borderRadius: 26,
                      boxShadow: `0 0 0 4px ${c.ink}`,
                      background: c.card,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 26px",
                      fontFamily: ttheme.fonts.body,
                      fontWeight: 700,
                      fontSize: 30,
                      color: c.inkDim,
                    }}
                  >
                    Type one topic here…
                  </div>
                </Appear>
              </div>
            </div>
          </div>
        </Browser>
      </CardIn>
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
        at={s(NEWCHAT.bubbleA)}
        until={until}
        {...BUBBLE}
        text="One topic = one new chat!"
        tail="left"
      />
      <Sfx at={s(0.3)} name="swish" volume={0.5} />
      <Sfx at={click} name="boop" />
      <Sfx at={click + 3} name="whoosh" volume={0.45} />
      <Sfx at={click + 10} name="sparkle" volume={0.35} />
      <Sfx at={s(NEWCHAT.bubbleA)} name="pop" />
    </>
  );
};

/* ---------------------------- part B: prompt recipe ----------------------- */
const ROWS = [
  { icon: TargetIcon, label: "Goal", text: "Make a 30s video about my app", tone: c.sun },
  { icon: PageIcon, label: "Context", text: "It's for students on TikTok", tone: c.mint },
  { icon: LayoutIcon, label: "Format", text: "Vertical, upbeat, with captions", tone: c.sky },
];

const Row: React.FC<{ i: number; at: number }> = ({ i, at }) => {
  const r = ROWS[i];
  const Icon = r.icon;
  const jig = useJiggle(at + 4);
  return (
    <Appear at={at} rise={40} pop>
      <div
        style={{
          display: "flex",
          gap: 26,
          alignItems: "flex-start",
          padding: "24px 0",
          borderTop: i ? `4px dashed ${c.line}` : undefined,
        }}
      >
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: 28,
            background: r.tone,
            boxShadow: `0 0 0 4px ${c.ink}, 4px 5px 0 4px ${c.ink}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transform: `rotate(${jig * 14}deg) scale(${1 + jig * 0.1})`,
          }}
        >
          <Icon size={54} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: ttheme.fonts.display,
              fontWeight: 700,
              fontSize: 46,
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
            <TypeText text={r.text} at={at + 6} per={0.9} caret />
          </div>
        </div>
      </div>
    </Appear>
  );
};

const PartB: React.FC<{ until: number }> = ({ until }) => {
  const s = useSec();
  const start = s(NEWCHAT.partB);
  return (
    <>
      <CardIn
        at={start}
        until={until}
        from="right"
        style={{ position: "absolute", left: 80, top: 380 }}
      >
        <div
          style={{
            width: 920,
            borderRadius: 38,
            background: c.card,
            boxShadow: ttheme.sticker(1),
            padding: "46px 50px",
          }}
        >
          <Kinetic
            text="A good first message"
            at={start + 6}
            size={58}
            align="left"
            highlight="good"
            markColor={c.sun}
            style={{ marginBottom: 26 }}
          />
          {ROWS.map((r, i) => (
            <Row key={r.label} i={i} at={s(NEWCHAT.rows[i])} />
          ))}
        </div>
      </CardIn>
      <Bubble
        at={s(NEWCHAT.bubbleB)}
        until={until}
        {...BUBBLE}
        text="Tell Claude 3 things:"
        tail="left"
      />
      <Sfx at={start} name="swish" volume={0.5} />
      <Sfx at={s(NEWCHAT.bubbleB)} name="pop" />
      {ROWS.map((r, i) => (
        <React.Fragment key={r.label}>
          <Sfx at={s(NEWCHAT.rows[i])} name="pop" volume={0.5} />
          <TypeSfx at={s(NEWCHAT.rows[i]) + 6} chars={r.text.length} per={0.9} />
        </React.Fragment>
      ))}
    </>
  );
};

/* --------------------------- part C: vague vs clear ----------------------- */
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
      borderRadius: 38,
      background: good ? "#F3FBF5" : c.card,
      boxShadow: ttheme.sticker(1, good ? c.good : c.ink),
      padding: "34px 44px",
      opacity: 1 - dim * 0.45,
      transform: `scale(${1 - dim * 0.06}) rotate(${dim * -2}deg)`,
      filter: dim > 0 ? `grayscale(${dim})` : undefined,
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
          fontFamily: ttheme.fonts.display,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: 3,
          color: "#fff",
          background: good ? c.good : c.bad,
          padding: "6px 20px",
          borderRadius: 30,
          boxShadow: `0 0 0 3px ${c.ink}`,
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
        marginTop: 18,
      }}
    >
      {children}
    </div>
  </div>
);

const PartC: React.FC<{ until: number }> = ({ until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useSec();
  const start = s(NEWCHAT.partC);
  const vagueAt = start + s(0.2);
  const crossAt = s(NEWCHAT.cross);
  const clearAt = s(NEWCHAT.clear);
  const typeAt = s(NEWCHAT.clearType);
  const per = fps / CLEAR_CPS;
  const tickAt = s(NEWCHAT.tick);
  const dim = interpolate(frame, [tickAt, tickAt + 10], [0, 1], {
    easing: ttheme.ease.out,
    ...clamp,
  });
  const vagueShake =
    frame >= crossAt ? Math.sin((frame - crossAt) * 2.2) * 16 * Math.exp(-(frame - crossAt) / 5) : 0;
  return (
    <>
      <CardIn
        at={vagueAt}
        until={until}
        from="right"
        style={{ position: "absolute", left: 80 + vagueShake, top: 380 }}
      >
        <PromptCard
          label="VAGUE"
          good={false}
          dim={dim}
          mark={<CrossCircle size={78} at={crossAt} />}
        >
          make video
        </PromptCard>
      </CardIn>
      <CardIn
        at={clearAt}
        until={until}
        from="right"
        style={{ position: "absolute", left: 80, top: 700 }}
      >
        <PromptCard
          label="CLEAR"
          good
          mark={<TickCircle size={78} at={tickAt} />}
        >
          <TypeText text={CLEAR} at={typeAt} per={per} caret />
        </PromptCard>
      </CardIn>
      <Sparkles at={tickAt} x={860} y={760} spread={140} />
      <Bubble
        at={s(NEWCHAT.bubbleC)}
        until={until}
        {...BUBBLE}
        text="Be clear, not vague!"
        tail="left"
      />
      <Sfx at={vagueAt} name="swish" volume={0.45} />
      <Sfx at={s(NEWCHAT.bubbleC)} name="pop" />
      <Sfx at={crossAt} name="thump" volume={0.5} />
      <Sfx at={crossAt} name="boing" volume={0.35} />
      <Sfx at={clearAt} name="swish" volume={0.45} />
      <TypeSfx at={typeAt} chars={CLEAR.length} per={per} every={6} />
      <Sfx at={tickAt} name="sparkle" volume={0.6} />
      <Sfx at={tickAt} name="pop" volume={0.5} />
    </>
  );
};

// Scene 2 — start a new chat properly (12s)
export const NewChat: React.FC<{ duration: number }> = ({ duration }) => {
  const s = useSec();
  const exit = duration - 11;
  return (
    <AbsoluteFill>
      <TipHeader
        tip="TIP 1"
        title="Start a new chat"
        highlight="new chat"
        markColor={c.sun}
        at={s(0.2)}
        until={exit}
      />
      <PartA until={s(NEWCHAT.partB) - 11} />
      <PartB until={s(NEWCHAT.partC) - 11} />
      <PartC until={exit} />
    </AbsoluteFill>
  );
};
