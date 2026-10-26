import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { arabicStack, latinStack, theme } from "../theme";
import { BookCover, Endpaper, PageEdges, PageSurface } from "../components/Book";
import { ArabicTitle } from "../components/ArabicTitle";
import { MalaySubtitle } from "../components/MalaySubtitle";
import { Dust, Grain, PaperOverlay, Vignette } from "../components/Atmosphere";
import { clamp, rtlSweepMask } from "../components/textMotion";
import { VERSE_21_107 } from "./Scene06MercyToWorlds";
import { sec } from "../timeline";

const C = theme.colors;
export const S7_PAGE = { x: 70, y: 250, w: 940, h: 1420 };

// Sahih Muslim 1162 (hadith of Abu Qatadah al-Ansari) — the Monday passage, verbatim
const HADITH =
  "وَسُئِلَ عَنْ صَوْمِ يَوْمِ الِاثْنَيْنِ، قَالَ: «ذَاكَ يَوْمٌ وُلِدْتُ فِيهِ، وَيَوْمٌ بُعِثْتُ - أَوْ أُنْزِلَ عَلَيَّ - فِيهِ»";
const HADITH_MS =
  "Rasulullah ﷺ ditanya tentang puasa hari Isnin. Baginda menjawab: “Itulah hari aku dilahirkan, dan hari aku diutus (menjadi Rasul) — atau diturunkan wahyu kepadaku.”";

const T = {
  pageA: sec(1.0),
  turn: [sec(7.2), sec(8.2)] as const,
  pageB: sec(7.2) + 4,
  close: [sec(15.4), sec(16.6)] as const,
  pull: [sec(15.8), sec(17.5)] as const,
};

// block entrance: rise + fade, staggered by caller
const Reveal: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: theme.spring.smooth });
  return (
    <div style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [18, 0])}px)`, ...style }}>{children}</div>
  );
};

const ArabicInk: React.FC<{ at: number; text: string; size: number }> = ({ at, text, size }) => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [at, at + 45], [0, 1], { ...clamp, easing: theme.ease.soft });
  return (
    <div
      dir="rtl"
      lang="ar"
      style={{ fontFamily: arabicStack, fontWeight: 700, fontSize: size, lineHeight: 1.95, color: C.ink, textAlign: "center", ...rtlSweepMask(sweep) }}
    >
      {text}
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: latinStack, fontWeight: 700, fontSize: 30, letterSpacing: "0.16em", color: "#2e4378", textAlign: "center" }}>
    {children}
  </div>
);

const Cite: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: latinStack, fontStyle: "italic", fontWeight: 500, fontSize: 33, color: C.inkSoft, textAlign: "center" }}>
    {children}
  </div>
);

const Rule: React.FC = () => (
  <svg width={520} height={20} style={{ alignSelf: "center" }}>
    <line x1={0} y1={10} x2={240} y2={10} stroke={C.goldDeep} strokeWidth={1.5} />
    <line x1={280} y1={10} x2={520} y2={10} stroke={C.goldDeep} strokeWidth={1.5} />
    <path d="M260 2 L268 10 L260 18 L252 10 Z" fill={C.gold} />
  </svg>
);

const Header: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: latinStack, fontWeight: 700, fontSize: 40, letterSpacing: "0.22em", color: C.goldDeep, textAlign: "center" }}>
    {children}
  </div>
);

const column: React.CSSProperties = {
  position: "absolute",
  inset: "86px 84px 80px",
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const PageA: React.FC = () => {
  const a = T.pageA;
  return (
    <div style={column}>
      <Reveal at={a}>
        <Header>SUMBER &amp; RUJUKAN</Header>
      </Reveal>
      <Reveal at={a + 8}>
        <Rule />
      </Reveal>
      <Reveal at={a + 16} style={{ marginTop: 10 }}>
        <Label>A · AL-QURAN</Label>
      </Reveal>
      <ArabicInk at={a + 22} text={VERSE_21_107} size={64} />
      <Reveal at={a + 40}>
        <Cite>Surah Al-Anbiya' (21): 107</Cite>
      </Reveal>
      <Reveal at={a + 50} style={{ marginTop: 18 }}>
        <Label>B · HADIS SAHIH</Label>
      </Reveal>
      <ArabicInk at={a + 56} text={HADITH} size={50} />
      <Reveal at={a + 80}>
        <div style={{ fontFamily: latinStack, fontWeight: 600, fontSize: 37, lineHeight: 1.3, color: C.ink, textAlign: "center" }}>
          {HADITH_MS}
        </div>
      </Reveal>
      <Reveal at={a + 92}>
        <Cite>Sahih Muslim, no. 1162 — riwayat Abu Qatadah al-Ansari r.a.</Cite>
      </Reveal>
    </div>
  );
};

const PageB: React.FC = () => {
  const b = T.pageB;
  const body: React.CSSProperties = { fontFamily: latinStack, fontWeight: 600, fontSize: 38, lineHeight: 1.32, color: C.ink };
  const books = [
    ["al-Bayhaqi", "Dala'il al-Nubuwwah"],
    ["al-Khara'iti", "Hawatif al-Jinan"],
    ["Ibn Kathir", "al-Bidayah wa al-Nihayah"],
  ];
  return (
    <div style={column}>
      <Reveal at={b}>
        <Header>C · RIWAYAT SEJARAH</Header>
      </Reveal>
      <Reveal at={b + 8}>
        <Rule />
      </Reveal>
      <ArabicInk at={b + 12} text="ارْتِجَاسُ إِيوَانِ كِسْرَى · خُمُودُ نَارِ فَارِسَ" size={50} />
      <Reveal at={b + 26}>
        <div style={{ ...body, textAlign: "center" }}>
          Kisah ini diriwayatkan melalui Makhzum bin Hani' al-Makhzumi, daripada bapanya. Antara kitab yang memuatkannya:
        </div>
      </Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
        {books.map(([who, title], i) => (
          <Reveal key={i} at={b + 36 + i * 5}>
            <div style={{ ...body, fontSize: 39 }}>
              <span style={{ color: C.goldDeep }}>◆ </span>
              {who} — <i>{title}</i>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal at={b + 58} style={{ marginTop: 14 }}>
        <div
          style={{
            ...body,
            fontWeight: 700,
            textAlign: "center",
            padding: "22px 28px",
            background: "rgba(150,105,45,0.16)",
            border: `2px solid ${C.goldDeep}`,
            borderRadius: 6,
          }}
        >
          Riwayat peristiwa ini diperselisihkan dari sudut kesahihan. Penyebutan dalam kitab sejarah tidak semestinya membuktikan
          kesahihan sesuatu riwayat.
        </div>
      </Reveal>
      <Reveal at={b + 70}>
        <Cite>Nombor jilid dan halaman tidak dinyatakan kerana belum dapat disemak pada naskhah asal.</Cite>
      </Reveal>
    </div>
  );
};

export const Scene07Sources: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const turn = interpolate(frame, [T.turn[0], T.turn[1]], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const close = interpolate(frame, [T.close[0], T.close[1]], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const pull = interpolate(frame, [T.pull[0], T.pull[1]], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const fadeOut = interpolate(frame, [dur - 12, dur], [0, 1], { ...clamp, easing: theme.ease.in });
  const scale = interpolate(pull, [0, 1], [1, 0.6]);
  const lift = Math.sin(turn * Math.PI);
  const P = S7_PAGE;
  const coverLanded = T.close[1];

  return (
    <AbsoluteFill style={{ background: C.void }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 50%, rgba(110,66,22,${0.5 - pull * 0.25}) 0%, rgba(25,14,6,0.7) 55%, ${C.void} 100%)`,
        }}
      />
      <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: "50% 50%" }}>
        <AbsoluteFill style={{ transform: `scale(${scale}) rotateX(${pull * 8}deg)`, transformOrigin: "50% 50%", transformStyle: "preserve-3d" }}>
          <div
            style={{
              position: "absolute",
              left: P.x - 30,
              top: P.y + 50,
              width: P.w + 60,
              height: P.h,
              background: "rgba(0,0,0,0.8)",
              filter: "blur(40px)",
            }}
          />
          <div style={{ position: "absolute", left: P.x, top: P.y }}>
            <PageEdges w={P.w} h={P.h} count={10} />
          </div>
          {/* page B lies beneath page A */}
          <PageSurface w={P.w} h={P.h} style={{ left: P.x, top: P.y }}>
            {frame >= T.turn[0] ? <PageB /> : null}
            <AbsoluteFill style={{ background: `linear-gradient(270deg, rgba(0,0,0,${0.5 * lift}), transparent ${30 + turn * 70}%)` }} />
          </PageSurface>
          {/* page A turns over on the right-hand spine */}
          {turn < 1 ? (
            <div
              style={{
                position: "absolute",
                left: P.x,
                top: P.y,
                width: P.w,
                height: P.h,
                transformOrigin: "100% 50%",
                transform: `rotateY(${turn * 178}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <PageSurface w={P.w} h={P.h} style={{ backfaceVisibility: "hidden" }}>
                <PageA />
                <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(0,0,0,${0.45 * lift}), transparent 80%)` }} />
              </PageSurface>
              <PageSurface w={P.w} h={P.h} frame={false} style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} />
            </div>
          ) : null}
          {/* the cover swings back over the text block and the book closes */}
          {close > 0 ? (
            <div
              style={{
                position: "absolute",
                left: P.x - 10,
                top: P.y - 10,
                width: P.w + 20,
                height: P.h + 20,
                transformOrigin: "100% 50%",
                transform: `rotateY(${(1 - close) * 178}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
                <BookCover w={P.w + 20} h={P.h + 20} sheen={interpolate(frame, [coverLanded, coverLanded + 40], [0, 1], clamp)} medallion={{ dy: 330, s: 0.72 }}>
                  <div style={{ position: "absolute", left: 60, right: 60, top: 190, height: 520 }}>
                    <ArabicTitle text="مُحَمَّدٌ رَسُولُ اللَّهِ ﷺ" start={coverLanded - 6} top={30} size={104} maxWidth={760} revealLen={40} />
                    <MalaySubtitle text="MUHAMMAD RASULULLAH ﷺ" start={coverLanded + 14} top={330} size={56} tracking={0.12} color={C.goldLight} />
                  </div>
                </BookCover>
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(0,0,0,${Math.sin(close * Math.PI) * 0.6}), transparent)` }} />
              </div>
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", overflow: "hidden" }}>
                <Endpaper w={P.w + 20} h={P.h + 20} />
              </div>
            </div>
          ) : null}
        </AbsoluteFill>
      </AbsoluteFill>
      <Dust seed={99} count={30} area={{ x: 60, y: 200, w: 960, h: 1500 }} rise={0.35} size={3} depth={0} opacity={0.5} />
      <PaperOverlay opacity={0.18} />
      <Grain />
      <Vignette strength={0.6} />
      <AbsoluteFill style={{ background: "#000", opacity: fadeOut }} />
    </AbsoluteFill>
  );
};
