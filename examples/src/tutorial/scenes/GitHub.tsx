import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Clawdy } from "../Clawdy";
import { T, ttheme } from "../theme3";
import {
  Appear,
  BranchIcon,
  Browser,
  Bubble,
  CardIn,
  Confetti,
  Cursor,
  Kinetic,
  NumBadge,
  RepoIcon,
  Sfx,
  Sparkles,
  TickCircle,
  TipHeader,
  TypeSfx,
  TypeText,
  useJiggle,
  usePop,
  useSec,
  type Punch,
} from "../ui";

const c = ttheme.colors;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// mock window placement; cursor coordinates below are in frame space
const MOCK = { x: 80, y: 560, w: 920, h: 700 };
const BODY_Y = MOCK.y + 84; // below the browser bar
// Clawdy sits bottom-right in this scene; bubbles grow from its top-left.
const BUBBLE = { x: 70, y: 1310, w: 700 };

const STEPS = [
  "Go to claude.ai/code",
  "Click “Connect GitHub”",
  "Authorize the GitHub app",
  "Pick your repo",
  "Choose an environment",
  "Type your task, hit Enter",
  "Claude makes a new branch",
  "Review it, open a Pull Request",
];

type StepProps = { at: number; end: number };

// Camera punches toward each step's key action, in seconds from scene start.
// They mirror the click/enter times inside the step components below.
const st = (i: number) => i * T.step;
export const GH_PUNCHES: Punch[] = [
  { at: st(0) + 1.45, x: 540, y: 1000, k: 0.05 },
  { at: st(1) + 1.3, x: 610, y: 1080, k: 0.1 },
  { at: st(2) + 2.0, x: 600, y: 1150, k: 0.1 },
  { at: st(3) + 1.45, x: 520, y: 981, k: 0.09 },
  { at: st(4) + 1.0, x: 170, y: 818, k: 0.05 },
  { at: st(4) + 2.0, x: 810, y: 1131, k: 0.08 },
  { at: st(5) + 1.88, x: 860, y: 1008, k: 0.1 },
  { at: st(6) + 1.15, x: 410, y: 854, k: 0.04 },
  { at: st(6) + 1.5, x: 600, y: 854, k: 0.04 },
  { at: st(6) + 1.85, x: 790, y: 854, k: 0.05 },
  { at: st(7) + 1.3, x: 620, y: 1150, k: 0.14 },
];
export const GH_SHIP = st(7) + 1.47; // PR opened: confetti + shake

const Heading: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({
  children,
  dark,
}) => (
  <div
    style={{
      fontFamily: ttheme.fonts.display,
      fontWeight: 700,
      fontSize: 54,
      color: dark ? c.ghText : c.ink,
    }}
  >
    {children}
  </div>
);

const Button: React.FC<{
  label: React.ReactNode;
  press: number; // click frame
  color?: string;
  width?: number;
}> = ({ label, press, color = c.ink, width = 460 }) => {
  const frame = useCurrentFrame();
  const sc = interpolate(frame, [press, press + 3, press + 10], [1, 0.9, 1], {
    easing: ttheme.ease.out,
    ...clamp,
  });
  const jig = useJiggle(press + 3);
  const down = frame >= press && frame < press + 4 ? 1 : 0;
  return (
    <div
      style={{
        width,
        height: 96,
        borderRadius: 28,
        background: color,
        boxShadow: `0 0 0 4px ${c.ink}, ${6 - down * 5}px ${7 - down * 6}px 0 4px ${c.ink}`,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        fontFamily: ttheme.fonts.display,
        fontWeight: 600,
        fontSize: 40,
        transform: `translate(${down * 5}px, ${down * 6}px) scale(${sc * (1 + jig * 0.1)}, ${sc * (1 - jig * 0.1)})`,
      }}
    >
      {label}
    </div>
  );
};

const Center: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap = 40,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap,
      padding: 50,
    }}
  >
    {children}
  </div>
);

/* ------------------------------- the 8 steps ------------------------------ */

const URL1 = "claude.ai/code";

const Step1: React.FC<StepProps> = ({ at, end }) => {
  const s = useSec();
  const typeAt = at + s(0.55);
  const per = 1.6;
  const enter = typeAt + Math.ceil(URL1.length * per) + 4;
  return (
    <>
      <Mock at={at} end={end}>
        <Browser
          url={<TypeText text={URL1} at={typeAt} per={per} caret />}
          width={MOCK.w}
          height={MOCK.h}
        >
          <Appear at={enter + 3} pop style={{ position: "absolute", inset: 0 }}>
            <Center>
              <MiniClawdy size={150} />
              <Heading>Claude Code</Heading>
              <PromptBox text="What should we build?" />
            </Center>
          </Appear>
        </Browser>
      </Mock>
      <TypeSfx at={typeAt} chars={URL1.length} per={per} every={2} />
      <Sfx at={enter} name="boop" />
      <Sfx at={enter + 3} name="pop" volume={0.45} />
    </>
  );
};

const Step2: React.FC<StepProps> = ({ at, end }) => {
  const frame = useCurrentFrame();
  const s = useSec();
  const click = at + s(1.3);
  const connecting = frame >= click + 6;
  return (
    <>
      <Mock at={at} end={end}>
        <Browser url={URL1} width={MOCK.w} height={MOCK.h}>
          <Center>
            <div
              style={{
                width: 640,
                padding: "40px 0",
                borderRadius: 30,
                border: `3px dashed ${c.inkDim}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 18,
              }}
            >
              <RepoIcon size={90} color={c.inkDim} />
              <div
                style={{
                  fontFamily: ttheme.fonts.body,
                  fontWeight: 700,
                  fontSize: 34,
                  color: c.inkDim,
                }}
              >
                No repository connected
              </div>
            </div>
            <Button
              press={click}
              label={
                connecting ? (
                  <>
                    <Spinner /> Connecting…
                  </>
                ) : (
                  "Connect GitHub"
                )
              }
            />
          </Center>
        </Browser>
      </Mock>
      <Cursor
        show={at + s(0.4)}
        hide={end}
        keys={[
          { at: at + s(0.4), x: 800, y: 1200 },
          { at: at + s(1.15), x: 610, y: 1080 },
        ]}
        clicks={[click]}
      />
      <Sfx at={click} name="boop" />
    </>
  );
};

const PERMS = [
  "Read your repositories",
  "Create branches",
  "Open pull requests",
];

const Step3: React.FC<StepProps> = ({ at, end }) => {
  const frame = useCurrentFrame();
  const s = useSec();
  const click = at + s(2.0);
  const done = frame >= click + 5;
  const permAt = (i: number) => at + s(0.55 + i * 0.3);
  return (
    <>
      <Mock at={at} end={end}>
        <Browser url="github.com" width={MOCK.w} height={MOCK.h} dark>
          <Center gap={34}>
            <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <MiniClawdy size={110} />
              <DotLine at={at + s(0.3)} />
              <div
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: 104,
                  background: c.ghCard,
                  border: `4px solid ${c.ghDim}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: ttheme.fonts.display,
                  fontWeight: 700,
                  fontSize: 50,
                  color: c.ghText,
                }}
              >
                you
              </div>
            </div>
            <Heading dark>Authorize Claude</Heading>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                width: 600,
              }}
            >
              {PERMS.map((p, i) => (
                <Appear key={p} at={permAt(i)} rise={20}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 18,
                      fontFamily: ttheme.fonts.body,
                      fontWeight: 700,
                      fontSize: 34,
                      color: c.ghText,
                    }}
                  >
                    <TickCircle size={44} color={c.ghGreen} at={permAt(i)} />
                    {p}
                  </div>
                </Appear>
              ))}
            </div>
            <Button
              press={click}
              color={c.ghGreen}
              label={done ? "Authorized!" : "Authorize"}
            />
          </Center>
        </Browser>
      </Mock>
      <Cursor
        show={at + s(1.1)}
        hide={end}
        keys={[
          { at: at + s(1.1), x: 820, y: 1240 },
          { at: at + s(1.85), x: 600, y: 1150 },
        ]}
        clicks={[click]}
      />
      <Sparkles at={click + 5} x={540} y={1145} spread={260} />
      {PERMS.map((p, i) => (
        <Sfx key={p} at={permAt(i)} name="pop" volume={0.35} />
      ))}
      <Sfx at={click} name="boop" />
      <Sfx at={click + 5} name="sparkle" volume={0.35} />
    </>
  );
};

const REPOS = ["my-website", "study-app", "notes", "pixel-game"];

const Step4: React.FC<StepProps> = ({ at, end }) => {
  const frame = useCurrentFrame();
  const s = useSec();
  const click = at + s(1.45);
  const pick = 1;
  const hover = interpolate(frame, [at + s(1.0), at + s(1.25)], [0, 1], {
    easing: ttheme.ease.out,
    ...clamp,
  });
  const rowY = (i: number) => BODY_Y + 214 + i * 86 + 37;
  return (
    <>
      <Mock at={at} end={end}>
        <Browser url={URL1} width={MOCK.w} height={MOCK.h}>
          <div style={{ position: "absolute", inset: 0, padding: "40px 50px" }}>
            <Heading>Select a repository</Heading>
            <div
              style={{
                marginTop: 22,
                height: 70,
                borderRadius: 20,
                border: `3px solid ${c.line}`,
                display: "flex",
                alignItems: "center",
                padding: "0 22px",
                fontFamily: ttheme.fonts.body,
                fontWeight: 600,
                fontSize: 28,
                color: c.inkDim,
              }}
            >
              Search repos…
            </div>
            <div style={{ marginTop: 20 }}>
              {REPOS.map((r, i) => {
                const picked = i === pick && frame >= click;
                return (
                  <Appear key={r} at={at + s(0.3) + i * 4} rise={24}>
                    <div
                      style={{
                        height: 74,
                        marginBottom: 12,
                        borderRadius: 22,
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        padding: "0 24px",
                        background: picked
                          ? c.accent
                          : i === pick
                            ? `rgba(232,220,200,${hover * 0.6})`
                            : "transparent",
                        boxShadow: picked
                          ? `0 0 0 3px ${c.ink}`
                          : `0 0 0 3px ${c.line}`,
                        fontFamily: ttheme.fonts.mono,
                        fontSize: 32,
                        color: c.ink,
                      }}
                    >
                      <RepoIcon size={44} />
                      <span style={{ flex: 1 }}>{r}</span>
                      {i === pick && <TickCircle size={52} at={click + 2} />}
                    </div>
                  </Appear>
                );
              })}
            </div>
          </div>
        </Browser>
      </Mock>
      <Cursor
        show={at + s(0.6)}
        hide={end}
        keys={[
          { at: at + s(0.6), x: 820, y: 1230 },
          { at: at + s(1.25), x: 520, y: rowY(pick) },
        ]}
        clicks={[click]}
      />
      <Sfx at={click} name="boop" />
      <Sfx at={click + 2} name="pop" />
    </>
  );
};

const Step5: React.FC<StepProps> = ({ at, end }) => {
  const frame = useCurrentFrame();
  const s = useSec();
  const choose = at + s(1.0);
  const cont = at + s(2.0);
  const radio = usePop(choose);
  const opts = [
    { name: "Default", sub: "Ready to go" },
    { name: "Custom", sub: "Your own setup" },
  ];
  return (
    <>
      <Mock at={at} end={end}>
        <Browser url={URL1} width={MOCK.w} height={MOCK.h}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: "40px 50px",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <Heading>Choose an environment</Heading>
            {opts.map((o, i) => {
              const on = i === 0 && frame >= choose;
              return (
                <Appear key={o.name} at={at + s(0.3) + i * 5} rise={24}>
                  <div
                    style={{
                      borderRadius: 26,
                      padding: "26px 30px",
                      display: "flex",
                      alignItems: "center",
                      gap: 26,
                      boxShadow: on
                        ? `0 0 0 4px ${c.ink}`
                        : `0 0 0 3px ${c.line}`,
                      background: on ? c.bg : "transparent",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 48,
                        border: `4px solid ${c.ink}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {i === 0 && (
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 24,
                            background: c.ink,
                            transform: `scale(${radio})`,
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: ttheme.fonts.display,
                          fontWeight: 600,
                          fontSize: 42,
                          color: c.ink,
                        }}
                      >
                        {o.name}
                      </div>
                      <div
                        style={{
                          fontFamily: ttheme.fonts.body,
                          fontWeight: 600,
                          fontSize: 28,
                          color: c.inkDim,
                        }}
                      >
                        {o.sub}
                      </div>
                    </div>
                  </div>
                </Appear>
              );
            })}
            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button press={cont} label="Continue" width={340} />
            </div>
          </div>
        </Browser>
      </Mock>
      <Cursor
        show={at + s(0.45)}
        hide={end}
        keys={[
          { at: at + s(0.45), x: 760, y: 1240 },
          { at: at + s(0.9), x: 170, y: 818 },
          { at: at + s(1.4), x: 170, y: 818 },
          { at: at + s(1.85), x: 810, y: 1131 },
        ]}
        clicks={[choose, cont]}
      />
      <Sfx at={choose} name="pop" />
      <Sfx at={cont} name="boop" />
    </>
  );
};

const TASK = "Add a README section about install";

const Step6: React.FC<StepProps> = ({ at, end }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useSec();
  const typeAt = at + s(0.5);
  const per = 1;
  const enter = typeAt + TASK.length * per + s(0.25);
  const keyPress = interpolate(
    frame,
    [enter, enter + 3, enter + 10],
    [0, 1, 0],
    {
      easing: ttheme.ease.out,
      ...clamp,
    },
  );
  const working = frame >= enter + 6;
  return (
    <>
      <Mock at={at} end={end}>
        <Browser url={URL1} width={MOCK.w} height={MOCK.h}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: "40px 50px",
              display: "flex",
              flexDirection: "column",
              gap: 26,
            }}
          >
            <div
              style={{
                alignSelf: "flex-start",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 22px",
                borderRadius: 30,
                background: c.accent,
                fontFamily: ttheme.fonts.mono,
                fontSize: 28,
                color: c.ink,
              }}
            >
              <BranchIcon size={34} /> study-app · main
            </div>
            <div
              style={{
                height: 300,
                borderRadius: 30,
                boxShadow: `0 0 0 ${3 + keyPress * 3}px ${c.ink}`,
                padding: "30px 34px",
                fontFamily: ttheme.fonts.mono,
                fontSize: 40,
                lineHeight: 1.4,
                color: c.ink,
                position: "relative",
              }}
            >
              <TypeText text={TASK} at={typeAt} per={per} caret />
              <div
                style={{
                  position: "absolute",
                  right: 26,
                  bottom: 26,
                  padding: "12px 24px",
                  borderRadius: 18,
                  background: c.ink,
                  color: c.bg,
                  fontFamily: ttheme.fonts.display,
                  fontWeight: 600,
                  fontSize: 32,
                  transform: `translateY(${keyPress * 6}px) scale(${1 - keyPress * 0.08})`,
                  boxShadow: `0 ${8 - keyPress * 6}px 0 ${c.inkDim}`,
                }}
              >
                Enter ↵
              </div>
            </div>
            {working && (
              <Appear at={enter + 6} rise={20}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    fontFamily: ttheme.fonts.body,
                    fontWeight: 700,
                    fontSize: 34,
                    color: c.inkDim,
                  }}
                >
                  <MiniClawdy size={72} />
                  Claude is working
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 12,
                        background: c.inkDim,
                        transform: `translateY(${Math.sin(((frame - i * 4) / fps) * Math.PI * 3) * 6}px)`,
                      }}
                    />
                  ))}
                </div>
              </Appear>
            )}
          </div>
        </Browser>
      </Mock>
      <TypeSfx at={typeAt} chars={TASK.length} per={per} />
      <Sfx at={enter} name="boop" />
    </>
  );
};

const COMMITS = ["write install steps", "add example", "fix typos"];

const Step7: React.FC<StepProps> = ({ at, end }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useSec();
  const draw = interpolate(frame, [at + s(0.4), at + s(1.1)], [1, 0], {
    easing: ttheme.ease.out,
    ...clamp,
  });
  const dotAt = (i: number) => at + s(1.15 + i * 0.35);
  // branch geometry inside the 920 x 616 body
  const mainY = 470;
  const branchY = 210;
  const cx = (i: number) => 330 + i * 190;
  return (
    <>
      <Mock at={at} end={end}>
        <Browser url="github.com/…/study-app" width={MOCK.w} height={MOCK.h}>
          <svg
            width={MOCK.w}
            height={MOCK.h - 84}
            style={{ position: "absolute", inset: 0 }}
          >
            <line
              x1={60}
              y1={mainY}
              x2={860}
              y2={mainY}
              stroke={c.inkDim}
              strokeWidth={10}
              strokeLinecap="round"
            />
            {[110, 220].map((x) => (
              <circle
                key={x}
                cx={x}
                cy={mainY}
                r={20}
                fill={c.card}
                stroke={c.inkDim}
                strokeWidth={8}
              />
            ))}
            <path
              d={`M220 ${mainY} C 220 ${branchY}, 260 ${branchY}, 330 ${branchY} L 760 ${branchY}`}
              stroke={c.good}
              strokeWidth={10}
              strokeLinecap="round"
              fill="none"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={draw}
            />
            {COMMITS.map((m, i) => {
              const p = spring({
                frame: frame - dotAt(i),
                fps,
                config: ttheme.spring.bouncy,
              });
              return (
                <g
                  key={m}
                  transform={`translate(${cx(i)}, ${branchY}) scale(${p})`}
                >
                  <circle r={24} fill={c.good} />
                  <circle r={9} fill="#fff" />
                </g>
              );
            })}
          </svg>
          <div
            style={{
              position: "absolute",
              left: 60,
              top: 60,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: ttheme.fonts.mono,
              fontSize: 30,
              color: c.good,
              fontWeight: 700,
              opacity: 1 - draw,
            }}
          >
            <BranchIcon size={38} color={c.good} /> claude/readme-install
          </div>
          {COMMITS.map((m, i) => (
            <Appear
              key={m}
              at={dotAt(i) + 2}
              rise={16}
              style={{
                position: "absolute",
                left: cx(i) - 85,
                top: branchY + 44,
                width: 170,
                textAlign: "center",
                fontFamily: ttheme.fonts.body,
                fontWeight: 700,
                fontSize: 25,
                lineHeight: 1.2,
                color: c.ink,
              }}
            >
              {m}
            </Appear>
          ))}
          <div
            style={{
              position: "absolute",
              left: 60,
              top: mainY + 44,
              fontFamily: ttheme.fonts.mono,
              fontSize: 30,
              color: c.inkDim,
            }}
          >
            main
          </div>
        </Browser>
      </Mock>
      <Sfx at={at + s(0.4)} name="whoosh" volume={0.3} />
      {COMMITS.map((m, i) => (
        <Sfx key={m} at={dotAt(i)} name="pop" volume={0.5} />
      ))}
    </>
  );
};

const Step8: React.FC<StepProps> = ({ at, end }) => {
  const frame = useCurrentFrame();
  const s = useSec();
  const click = at + s(1.3);
  const opened = frame >= click + 5;
  return (
    <>
      <Mock at={at} end={end}>
        <Browser url="github.com/…/pull/new" width={MOCK.w} height={MOCK.h}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: "44px 50px",
              display: "flex",
              flexDirection: "column",
              gap: 26,
            }}
          >
            <Heading>Add install section to README</Heading>
            <div
              style={{
                alignSelf: "flex-start",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 22px",
                borderRadius: 30,
                background: c.accent,
                fontFamily: ttheme.fonts.mono,
                fontSize: 26,
                color: c.ink,
              }}
            >
              <BranchIcon size={30} /> claude/readme-install → main
            </div>
            <div
              style={{
                borderRadius: 24,
                boxShadow: `0 0 0 3px ${c.line}`,
                padding: "20px 26px",
                fontFamily: ttheme.fonts.mono,
                fontSize: 28,
                lineHeight: 1.6,
              }}
            >
              <div style={{ color: c.good }}>+ ## Install</div>
              <div style={{ color: c.good }}>+ npm install</div>
              <div style={{ color: c.inkDim }}> 3 files changed · +24 −0</div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 6,
              }}
            >
              <Button
                press={click}
                color={c.ghGreen}
                width={560}
                label={opened ? "Pull request opened!" : "Create pull request"}
              />
            </div>
          </div>
        </Browser>
      </Mock>
      <Cursor
        show={at + s(0.45)}
        hide={end}
        keys={[
          { at: at + s(0.45), x: 860, y: 1250 },
          { at: at + s(1.15), x: 620, y: 1150 },
        ]}
        clicks={[click]}
      />
      <Confetti at={click + 5} x={540} y={1150} />
      <Sparkles at={click + 5} x={540} y={1110} spread={300} />
      <Sfx at={click} name="boop" />
      <Confetti at={click + 8} x={300} y={1200} />
      <Confetti at={click + 11} x={800} y={1200} />
      <Sfx at={click + 5} name="sparkle" volume={0.6} />
      <Sfx at={click + 5} name="thump" volume={0.6} />
    </>
  );
};

const STEP_VIEWS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8];

/* -------------------------------- helpers --------------------------------- */

// the mock window enters a beat after the step title, exits with it
const Mock: React.FC<StepProps & { children: React.ReactNode }> = ({
  at,
  end,
  children,
}) => (
  <CardIn
    at={at + 3}
    until={end}
    from="right"
    style={{ position: "absolute", left: MOCK.x, top: MOCK.y }}
  >
    {children}
  </CardIn>
);

const MiniClawdy: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size }}>
    <Clawdy size={size} expression="happy" pose="rest" />
  </div>
);

const PromptBox: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      width: 620,
      height: 96,
      borderRadius: 28,
      boxShadow: `0 0 0 4px ${c.ink}`,
      display: "flex",
      alignItems: "center",
      padding: "0 30px",
      fontFamily: ttheme.fonts.body,
      fontWeight: 600,
      fontSize: 32,
      color: c.inkDim,
    }}
  >
    {text}
  </div>
);

const Spinner: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 34,
        border: "5px solid rgba(255,255,255,0.35)",
        borderTopColor: "#fff",
        transform: `rotate(${frame * 18}deg)`,
      }}
    />
  );
};

const DotLine: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const p = spring({
          frame: frame - at - i * 3,
          fps,
          config: ttheme.spring.bouncy,
        });
        return (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 14,
              background: c.ghDim,
              transform: `scale(${p})`,
            }}
          />
        );
      })}
    </div>
  );
};

const Progress: React.FC<{ stepF: number; at: number; until: number }> = ({
  stepF,
  at,
  until,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Appear
      at={at}
      until={until}
      style={{
        position: "absolute",
        top: 336,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        gap: 22,
      }}
    >
      {STEPS.map((_, i) => {
        const p = spring({
          frame: frame - i * stepF,
          fps,
          config: ttheme.spring.bouncy,
        });
        const current = frame >= i * stepF && frame < (i + 1) * stepF;
        return (
          <div
            key={i}
            style={{
              width: current ? 64 : 24,
              height: 24,
              borderRadius: 24,
              background: current ? c.mint : p > 0.5 ? c.ink : c.card,
              boxShadow: `0 0 0 4px ${c.ink}`,
              transform: `scale(${0.7 + 0.3 * p}) translateY(${current ? Math.sin((frame / fps) * 8) * 3 : 0}px)`,
            }}
          />
        );
      })}
    </Appear>
  );
};

// Scene 3 — connect Claude Code to GitHub, step by step (26s)
export const GitHub: React.FC<{ duration: number }> = ({ duration }) => {
  const s = useSec();
  const stepF = s(T.step);
  const exit = duration - 11;
  return (
    <AbsoluteFill>
      <TipHeader
        tip="TIP 2"
        title="Connect GitHub"
        highlight="GitHub"
        markColor={c.mint}
        at={s(0.2)}
        until={exit}
      />
      <Progress stepF={stepF} at={s(0.35)} until={exit} />
      {STEPS.map((title, i) => {
        const at = i * stepF;
        const end = (i + 1) * stepF - 11;
        const View = STEP_VIEWS[i];
        return (
          <React.Fragment key={title}>
            <Appear
              at={at + 2}
              until={end}
              rise={20}
              style={{
                position: "absolute",
                left: MOCK.x,
                top: 410,
                width: MOCK.w,
                display: "flex",
                alignItems: "center",
                gap: 28,
              }}
            >
              <NumBadge n={i + 1} at={at + 2} size={104} />
              <Kinetic
                text={title}
                at={at + 5}
                until={end}
                size={60}
                per={0.8}
                align="left"
                style={{ flex: 1 }}
              />
            </Appear>
            <View at={at} end={end} />
            <Sfx at={at + 2} name="pop" />
            <Sfx at={at + 3} name="swish" volume={0.4} />
          </React.Fragment>
        );
      })}
      <Bubble
        at={s(0.7)}
        until={s(2.9)}
        {...BUBBLE}
        text="Let's link your code!"
        tail="right"
      />
      <Bubble
        at={3 * stepF + s(0.5)}
        until={4 * stepF - 11}
        {...BUBBLE}
        text="Only pick repos you want"
        tail="right"
      />
      <Bubble
        at={7 * stepF + s(1.5)}
        until={duration - 11}
        {...BUBBLE}
        text="Woohoo! You shipped it!"
        tail="right"
      />
      <Sfx at={s(0.7)} name="pop" />
      <Sfx at={3 * stepF + s(0.5)} name="pop" />
      <Sfx at={7 * stepF + s(1.5)} name="pop" />
    </AbsoluteFill>
  );
};
