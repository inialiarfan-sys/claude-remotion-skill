import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { arabicStack, latinStack, theme } from "../../theme";
import { CinematicCamera } from "../../components/CinematicCamera";
import { PaperLayer } from "../../components/PaperLayer";
import { Dust, Glow, Grade, Grain, LightBeam, PaperOverlay, Sky, Vignette } from "../../components/Atmosphere";
import { House, Palm } from "../../components/Architecture";
import { Cradle, Kaaba } from "../../components/Props";
import { PageSurface } from "../../components/Book";
import { FamilyTree } from "../../components/FamilyTree";
import { MalaySubtitle, STORY } from "../../components/MalaySubtitle";
import { ridgePath } from "../../components/shapes";
import { clamp, rtlSweepMask } from "../../components/textMotion";
import { mulberry32, noise1 } from "../../random";
import { sec } from "../../timeline";
import { AD_DUHA_93_6 } from "../verses";

const C = theme.colors;
const T = { interior: sec(6.0), panel: sec(8.2), caption: sec(14.2) };

const MakkahValley: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const rand = mulberry32(5);
  const houses = Array.from({ length: 16 }).map((_, i) => ({
    x: -200 + i * 95 + rand() * 30,
    w: 70 + rand() * 60,
    h: 60 + rand() * 80,
    seed: i * 7 + 3,
  }));
  return (
    <CinematicCamera
      keys={[
        { f: 0, x: -240, y: -120, zoom: 1.18 },
        { f: sec(6.5), x: 0, y: 30, zoom: 1.02 },
        { f: dur, x: 20, y: 40, zoom: 1.04 },
      ]}
    >
      <Sky stops={[["#2c3b6b", 0], ["#7a6a8a", 38], ["#e0a070", 64], ["#f3c98a", 74]]} glow={{ x: 700, y: 1050, r: 700, color: "rgba(255,210,140,0.45)" }} />
      <PaperLayer depth={0.1} shadow={10} rim="rgba(255,220,170,0.35)" render={(p) => <path d={ridgePath(201, { x0: -420, x1: 1500, base: 1100, amp: 330, peaks: 5, bottom: 1500 })} fill={p("#8a6070")} />} />
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
      <PaperLayer
        depth={0.45}
        shadow={14}
        render={(p) => (
          <g>
            {houses.map((h, i) =>
              Math.abs(h.x + h.w / 2 - 560) < 120 ? null : (
                <House key={i} p={p} x={h.x} base={1300 + (i % 3) * 8} w={h.w} h={h.h} body="#a8784e" shade="#7a5234" dark="#3a2414" seed={h.seed} />
              ),
            )}
            <rect x={-400} y={1300} width={1900} height={400} fill={p("#9a6c44")} />
            <Kaaba p={p} x={505} base={1306} w={96} h={92} />
          </g>
        )}
      />
      <Glow x={560} y={1250} r={240} color="#ffd9a0" opacity={0.25} depth={0.45} />
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
      <Dust seed={202} count={30} area={{ x: -100, y: 1100, w: 1300, h: 600 }} color="#ffe2a6" size={2.4} rise={0.25} depth={0.6} opacity={0.6} />
    </CinematicCamera>
  );
};

// Inside a family dwelling: daylight through a high window, a lamp niche,
// and an empty cradle — a symbol, never a figure.
const Dwelling: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const flicker = 0.9 + noise1(frame / 6, 4) * 0.1;
  return (
    <CinematicCamera keys={[{ f: 0, x: 0, y: 30, zoom: 1.08 }, { f: dur, x: 0, y: -10, zoom: 1.0 }]}>
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

export const Ch1Scene02FirstYear: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // a doorway of light opens from the valley into the dwelling
  const into = interpolate(frame, [T.interior, T.interior + 40], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const panel = spring({ frame: frame - T.panel, fps, config: theme.spring.gentle });
  const panelExit = interpolate(frame, [dur - 46, dur - 34], [0, 1], { ...clamp, easing: theme.ease.in });
  const verse = interpolate(frame, [T.caption + 30, T.caption + 70], [0, 1], { ...clamp, easing: theme.ease.soft });
  const a = T.panel;

  return (
    <AbsoluteFill style={{ background: C.void }}>
      {into < 1 ? <MakkahValley dur={dur} /> : null}
      {into > 0 ? (
        <AbsoluteFill style={{ clipPath: `circle(${into * 120}% at 62% 68%)` }}>
          <Dwelling dur={dur} />
        </AbsoluteFill>
      ) : null}
      <MalaySubtitle text="Kaabah di lembah Makkah" {...STORY} size={52} start={sec(2.6)} end={sec(6.4)} top={420} />
      <AbsoluteFill style={{ opacity: Math.min(1, panel * 1.4) * (1 - panelExit), transform: `translateY(${interpolate(panel, [0, 1], [80, 0])}px)` }}>
        <PageSurface w={940} h={780} style={{ left: 70, top: 250, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: latinStack, fontWeight: 700, fontSize: 30, letterSpacing: "0.22em", color: C.goldDeep }}>
          SALASILAH KELUARGA
        </div>
        <FamilyTree
          nodes={[
            { id: "abdullah", x: 300, y: 470, label: "AYAHANDA", name: "ABDULLAH BIN ABDUL MUTTALIB", appear: a + 110, dim: a + 160, note: "Wafat sebelum Baginda lahir", w: 400 },
            { id: "aminah", x: 790, y: 470, label: "IBUNDA", name: "AMINAH BINTI WAHB", appear: a + 70, w: 360 },
            { id: "muhammad", x: 540, y: 820, label: "RASULULLAH ﷺ", name: "MUHAMMAD BIN ABDULLAH", appear: a + 20, prophet: true, w: 460 },
          ]}
          edges={[
            { from: "abdullah", to: "aminah", kind: "marriage", appear: a + 125 },
            { from: "aminah", to: "muhammad", kind: "lineage", appear: a + 140 },
          ]}
          highlight={[{ id: "abdullah", from: a + 150, to: a + 200 }]}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 960,
            textAlign: "center",
            fontFamily: latinStack,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 26,
            color: C.inkSoft,
            opacity: interpolate(frame, [a + 170, a + 190], [0, 1], clamp),
          }}
        >
          Menurut riwayat sirah yang masyhur
        </div>
      </AbsoluteFill>
      <MalaySubtitle text="RASULULLAH SAW DILAHIRKAN SEBAGAI ANAK YATIM." start={T.caption} end={dur - 34} top={1085} size={44} tracking={0.08} maxWidth={940} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1250,
          textAlign: "center",
          opacity: verse * (1 - panelExit),
          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.8))",
        }}
      >
        <div dir="rtl" lang="ar" style={{ fontFamily: arabicStack, fontWeight: 700, fontSize: 62, lineHeight: 1.7, color: C.goldLight, ...rtlSweepMask(verse) }}>
          {AD_DUHA_93_6}
        </div>
        <div style={{ fontFamily: latinStack, fontStyle: "italic", fontWeight: 600, fontSize: 32, color: C.parchmentLight }}>
          “Bukankah Dia mendapatimu yatim, lalu Dia melindungimu?”
        </div>
        <div style={{ fontFamily: latinStack, fontWeight: 700, fontSize: 26, letterSpacing: "0.1em", color: C.gold, marginTop: 6 }}>SURAH AD-DUHA 93:6</div>
      </div>
      <Grade warmth={0.12} />
      <PaperOverlay />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
