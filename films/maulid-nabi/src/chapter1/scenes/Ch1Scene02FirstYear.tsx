import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { arabicStack, latinStack, theme } from "../../theme";
import { CinematicCamera, sampleCamera, toScreen, type CamKey } from "../../components/CinematicCamera";
import { PaperLayer } from "../../components/PaperLayer";
import { Dust, Glow, Grade, Grain, LightBeam, PaperOverlay, Sky, Vignette } from "../../components/Atmosphere";
import { House, Palm } from "../../components/Architecture";
import { Cradle, Kaaba } from "../../components/Props";
import { PageSurface } from "../../components/Book";
import { FamilyTree } from "../../components/FamilyTree";
import { CalloutLabel, InkCaption } from "../../components/WorldCaption";
import { ridgePath } from "../../components/shapes";
import { clamp, rtlSweepMask } from "../../components/textMotion";
import { mulberry32, noise1 } from "../../random";
import { sec } from "../../timeline";
import { AD_DUHA_93_6 } from "../verses";

const C = theme.colors;
const TOWN_DEPTH = 0.45;
const DOOR = { x: 652, y: 1278 }; // lit doorway of the house the camera enters
const PAGE = { x: 70, y: 230, w: 940, h: 1140 };
const T = { interior: sec(5.6), panel: sec(7.6), caption: sec(12.8) };
const a = T.panel;
export const CH1_S2_BEATS = {
  birds: sec(0.6),
  callout: sec(2.4),
  door: T.interior,
  panel: T.panel,
  cards: [a + 20, a + 60, a + 95],
  dim: a + 140,
  caption: T.caption,
  verse: T.caption + 30,
};
const B = CH1_S2_BEATS;

// glide through a gap in the near rocks, settle on the valley, then push to a doorway
const VALLEY_CAM: CamKey[] = [
  { f: 0, x: -40, y: -20, zoom: 1.0 },
  { f: sec(2.6), x: 0, y: 20, zoom: 1.12 },
  { f: sec(4.4), x: 14, y: 34, zoom: 1.14 },
  { f: T.interior + 20, x: 150, y: 330, zoom: 1.42 },
];

// a thread of cooking smoke rising from a roof
const smoke = (x: number, y: number, frame: number, k: number) => {
  const len = 190;
  const L: string[] = [];
  const R: string[] = [];
  for (let s = 0; s <= len; s += 26) {
    const sway = Math.sin(s / 60 + frame / 30 + k) * (4 + s * 0.12) + noise1(frame / 80 + k, k) * 10;
    const hw = 4 + s * 0.06;
    L.push(`${x + sway - hw} ${y - s}`);
    R.unshift(`${x + sway + hw} ${y - s}`);
  }
  return `M${L.join(" L")} L${R.join(" L")} Z`;
};

const MakkahValley: React.FC = () => {
  const frame = useCurrentFrame();
  const rand = mulberry32(5);
  const houses = Array.from({ length: 16 }).map((_, i) => ({
    x: -200 + i * 95 + rand() * 30,
    w: 70 + rand() * 60,
    h: 60 + rand() * 80,
    seed: i * 7 + 3,
  }));
  const pass = interpolate(frame, [0, sec(2.8)], [0, 1], { ...clamp, easing: theme.ease.inOut });
  return (
    <CinematicCamera keys={VALLEY_CAM}>
      <Sky stops={[["#2c3b6b", 0], ["#7a6a8a", 38], ["#e0a070", 64], ["#f3c98a", 74]]} glow={{ x: 700, y: 1050, r: 700, color: "rgba(255,210,140,0.45)" }} />
      <PaperLayer depth={0.1} shadow={10} rim="rgba(255,220,170,0.35)" render={(p) => <path d={ridgePath(201, { x0: -420, x1: 1500, base: 1100, amp: 330, peaks: 5, bottom: 1500 })} fill={p("#8a6070")} />} />
      {/* birds crossing the valley at first light */}
      <PaperLayer
        depth={0.2}
        shadow={4}
        texture={0}
        render={(p) => (
          <g>
            {[0, 1, 2].map((i) => {
              const x = 1150 - (frame - B.birds) * (2.6 + i * 0.3) - i * 60;
              const y = 760 + i * 30 + Math.sin(frame / 16 + i) * 6;
              const f = Math.sin(frame / 3 + i * 1.4) * 8;
              return <path key={i} d={`M${x - 14} ${y - f} Q${x - 5} ${y - 3} ${x} ${y} Q${x + 5} ${y - 3} ${x + 14} ${y - f} L${x} ${y + 3} Z`} fill={p("#3a2a30")} />;
            })}
          </g>
        )}
      />
      {/* the mountains enclosing the valley */}
      <PaperLayer
        depth={0.25}
        shadow={16}
        rim="rgba(255,215,160,0.35)"
        render={(p) => (
          <g>
            <path d={ridgePath(203, { x0: -420, x1: 360, base: 1260, amp: 520, peaks: 2, bottom: 1700 })} fill={p("#6a4a50")} />
            <path d={ridgePath(205, { x0: 720, x1: 1500, base: 1260, amp: 560, peaks: 2, bottom: 1700 })} fill={p("#6a4a50")} />
          </g>
        )}
      />
      <PaperLayer depth={TOWN_DEPTH} shadow={0} texture={0.5} render={(p) => (
        <g>
          <path d={smoke(310, 1200, frame, 1)} fill={p("#e8dcc8")} opacity={0.3} />
          <path d={smoke(880, 1215, frame, 4)} fill={p("#e8dcc8")} opacity={0.28} />
        </g>
      )} />
      <PaperLayer
        depth={TOWN_DEPTH}
        shadow={14}
        render={(p) => (
          <g>
            {houses.map((h, i) =>
              Math.abs(h.x + h.w / 2 - 560) < 150 ? null : (
                <House key={i} p={p} x={h.x} base={1300 + (i % 3) * 8} w={h.w} h={h.h} body="#a8784e" shade="#7a5234" dark="#3a2414" seed={h.seed} />
              ),
            )}
            {/* the house whose doorway the camera enters */}
            <House p={p} x={620} base={1306} w={110} h={120} body="#b08050" shade="#7a5234" dark="#3a2414" seed={99} />
            <rect x={DOOR.x - 14} y={DOOR.y - 24} width={28} height={52} rx={3} fill={p(C.lamp)} />
            <rect x={-400} y={1300} width={1900} height={400} fill={p("#9a6c44")} />
            <Kaaba p={p} x={505} base={1306} w={96} h={92} />
          </g>
        )}
      />
      <Glow x={560} y={1250} r={240} color="#ffd9a0" opacity={0.25} depth={TOWN_DEPTH} />
      <Glow x={DOOR.x} y={DOOR.y} r={90} color={C.lamp} opacity={0.7} depth={TOWN_DEPTH} />
      <CalloutLabel target={[553, 1206]} label={[380, 960]} lines={["Kaabah di lembah Makkah"]} start={B.callout} end={T.interior - 6} depth={TOWN_DEPTH} size={40} width={520} />
      <PaperLayer
        depth={0.8}
        shadow={20}
        render={(p) => (
          <g>
            <path d={ridgePath(207, { x0: -420, x1: 1500, base: 1560, amp: 110, peaks: 6, bottom: 2000, rough: 0.5 })} fill={p("#5a3a26")} />
            <Palm p={p} x={110} base={1600} h={420} lean={0.1} color="#2a2018" seed={41} sway={Math.sin(frame / 40) * 5} />
          </g>
        )}
      />
      <PaperLayer
        depth={1.25}
        shadow={26}
        shadowOpacity={0.7}
        render={(p) => <path d={ridgePath(209, { x0: -420, x1: 1500, base: 1820, amp: 150, peaks: 4, bottom: 2400, rough: 0.6 })} fill={p("#2e1e14")} />}
      />
      {/* near rocks the camera passes between */}
      <PaperLayer
        depth={1.8}
        shadow={34}
        shadowOpacity={0.8}
        transform={`translateX(${-pass * 560}px)`}
        render={(p) => <path d="M-500 2400 L-500 500 L-120 420 L60 640 L180 980 L250 1500 L300 2400 Z" fill={p("#1e140e")} />}
      />
      <PaperLayer
        depth={1.8}
        shadow={34}
        shadowOpacity={0.8}
        transform={`translateX(${pass * 560}px)`}
        render={(p) => <path d="M1580 2400 L1580 560 L1220 470 L1010 700 L900 1080 L830 1600 L780 2400 Z" fill={p("#1e140e")} />}
      />
      <Dust seed={202} count={30} area={{ x: -100, y: 1100, w: 1300, h: 600 }} color="#ffe2a6" size={2.4} rise={0.25} depth={0.6} opacity={0.6} />
    </CinematicCamera>
  );
};

// Inside a family dwelling: daylight through a high window, a lamp niche,
// and an empty cradle — a symbol, never a figure.
const Dwelling: React.FC<{ lamp: number }> = ({ lamp }) => {
  const frame = useCurrentFrame();
  const flicker = (0.9 + noise1(frame / 6, 4) * 0.1) * lamp;
  return (
    <CinematicCamera
      keys={[
        { f: T.interior, x: 0, y: 30, zoom: 1.0 },
        { f: T.panel, x: -60, y: 120, zoom: 1.12 },
        { f: T.panel + sec(12), x: -50, y: 110, zoom: 1.15 },
      ]}
    >
      <PaperLayer
        depth={0.3}
        shadow={0}
        render={(p) => (
          <g>
            <rect x={-420} y={-420} width={1920} height={2800} fill={p("#7a5232")} />
            {Array.from({ length: 30 }).map((_, i) => (
              <path key={i} d={`M-420 ${-300 + i * 80} L1500 ${-300 + i * 80}`} stroke={p("#6a4428")} strokeWidth={3} opacity={0.5} />
            ))}
            <path d="M700 300 L700 160 Q760 110 820 160 L820 300 Z" fill={p("#fbe2b0")} />
            <path d="M180 1180 L180 1080 Q230 1040 280 1080 L280 1180 Z" fill={p("#3a2414")} />
          </g>
        )}
      />
      <LightBeam x={760} y={200} angle={28} width={260} length={1700} color="#ffe2b0" opacity={0.35} depth={0.3} />
      <Glow x={230} y={1130} r={180} color={C.lamp} opacity={0.55 * flicker} depth={0.3} />
      <PaperLayer
        depth={0.6}
        shadow={18}
        render={(p) => (
          <g>
            <path d="M-420 1560 L1500 1560 L1500 2400 L-420 2400 Z" fill={p("#5a3a22")} />
            <path d="M120 1600 L960 1600 L1010 1760 L70 1760 Z" fill={p("#a8844e")} />
            {Array.from({ length: 12 }).map((_, i) => (
              <path key={i} d={`M${130 + i * 70} 1600 L${80 + i * 78} 1760`} stroke={p("#8a6a3a")} strokeWidth={4} />
            ))}
            <path d="M228 1128 q-14 -6 -4 -18 q10 -4 18 0 q10 12 -4 18 Z" fill={p("#c08a4a")} />
            <path d="M860 1600 q-40 -30 -30 -110 q6 -26 30 -30 q24 4 30 30 q10 80 -30 110 Z" fill={p("#9a5a32")} />
          </g>
        )}
      />
      <Glow x={232} y={1100} r={26} color={C.lampCore} opacity={flicker} depth={0.3} />
      <PaperLayer depth={0.7} shadow={22} shadowOpacity={0.6} render={(p) => <Cradle p={p} x={430} base={1690} s={1.25} />} />
      <Dust seed={204} count={40} area={{ x: 500, y: 200, w: 500, h: 1300 }} color="#fff0c8" size={2.6} rise={0.2} depth={0.4} opacity={0.8} />
    </CinematicCamera>
  );
};

export const Ch1Scene02FirstYear: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  // the doorway of light opens from wherever the door is on screen
  const into = interpolate(frame, [T.interior, T.interior + 40], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const [dx, dy] = toScreen(sampleCamera(VALLEY_CAM, T.interior), DOOR.x, DOOR.y, TOWN_DEPTH);
  // the manuscript page opens from its centre crease
  const unfold = interpolate(frame, [T.panel, T.panel + 26], [0, 1], { ...clamp, easing: theme.ease.out });
  const half = PAGE.h / 2;
  const clipTop = PAGE.y + (1 - unfold) * half;
  const clipBottom = 1920 - (PAGE.y + PAGE.h) + (1 - unfold) * half;
  // the household lamp lowers as the father's card is dimmed — restraint, not drama
  const dimA = interpolate(frame, [B.dim, B.dim + 30], [0, 1], clamp);
  const verse = interpolate(frame, [B.verse, B.verse + 44], [0, 1], { ...clamp, easing: theme.ease.soft });

  return (
    <AbsoluteFill style={{ background: C.void }}>
      {into < 1 ? <MakkahValley /> : null}
      {into > 0 ? (
        <AbsoluteFill style={{ clipPath: `circle(${into * 125}% at ${dx}px ${dy}px)` }}>
          <Dwelling lamp={1 - dimA * 0.3} />
        </AbsoluteFill>
      ) : null}
      {unfold > 0 ? (
        <AbsoluteFill style={{ clipPath: `inset(${clipTop}px 0 ${clipBottom}px 0)` }}>
          <PageSurface w={PAGE.w} h={PAGE.h} style={{ left: PAGE.x, top: PAGE.y, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }} />
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, transparent ${(PAGE.y / 1920) * 100}%, rgba(60,35,10,${0.5 * (1 - unfold)}) ${((PAGE.y + half) / 1920) * 100}%, transparent ${((PAGE.y + PAGE.h) / 1920) * 100}%)`,
            }}
          />
          <div style={{ position: "absolute", left: 0, right: 0, top: 280, textAlign: "center", fontFamily: latinStack, fontWeight: 700, fontSize: 30, letterSpacing: "0.22em", color: C.goldDeep }}>
            SALASILAH KELUARGA
          </div>
          <FamilyTree
            nodes={[
              { id: "abdullah", x: 300, y: 470, label: "AYAHANDA", name: "ABDULLAH BIN ABDUL MUTTALIB", appear: B.cards[2], dim: B.dim, note: "Wafat sebelum Baginda lahir", w: 400 },
              { id: "aminah", x: 790, y: 470, label: "IBUNDA", name: "AMINAH BINTI WAHB", appear: B.cards[1], w: 360 },
              { id: "muhammad", x: 540, y: 790, label: "RASULULLAH ﷺ", name: "MUHAMMAD BIN ABDULLAH", appear: B.cards[0], prophet: true, w: 460 },
            ]}
            edges={[
              { from: "abdullah", to: "aminah", kind: "marriage", appear: a + 110 },
              { from: "aminah", to: "muhammad", kind: "lineage", appear: a + 125 },
            ]}
            highlight={[{ id: "abdullah", from: B.dim - 10, to: B.dim + 40 }]}
          />
          <InkCaption lines={["Menurut riwayat sirah yang masyhur"]} start={B.dim + 10} top={890} size={27} italic weight={600} tracking={0.01} color={C.inkSoft} />
          <svg width={1080} height={40} style={{ position: "absolute", left: 0, top: 950, opacity: interpolate(frame, [T.caption - 10, T.caption + 10], [0, 1], clamp) }}>
            <line x1={300} y1={20} x2={520} y2={20} stroke={C.goldDeep} strokeWidth={1.5} />
            <line x1={560} y1={20} x2={780} y2={20} stroke={C.goldDeep} strokeWidth={1.5} />
            <path d="M540 12 L548 20 L540 28 L532 20 Z" fill={C.gold} />
          </svg>
          <InkCaption lines={["RASULULLAH SAW DILAHIRKAN", "SEBAGAI ANAK YATIM."]} start={T.caption} top={990} size={44} tracking={0.08} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 1112, textAlign: "center" }}>
            <div dir="rtl" lang="ar" style={{ fontFamily: arabicStack, fontWeight: 700, fontSize: 60, lineHeight: 1.7, color: C.ink, ...rtlSweepMask(verse) }}>
              {AD_DUHA_93_6}
            </div>
          </div>
          <InkCaption lines={["“Bukankah Dia mendapatimu yatim, lalu Dia melindungimu?”"]} start={B.verse + 40} top={1222} size={31} italic weight={600} tracking={0.01} color={C.inkSoft} />
          <InkCaption lines={["SURAH AD-DUHA 93:6"]} start={B.verse + 56} top={1276} size={25} tracking={0.12} color={C.goldDeep} per={14} />
        </AbsoluteFill>
      ) : null}
      <Grade warmth={0.12} />
      <PaperOverlay />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
