import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { arabicStack, theme } from "../../theme";
import { CinematicCamera, type CamKey } from "../../components/CinematicCamera";
import { PaperLayer } from "../../components/PaperLayer";
import { Grain, PaperOverlay, Vignette } from "../../components/Atmosphere";
import { BalanceScale } from "../../components/Props";
import { InkCaption, ScrollCaption } from "../../components/WorldCaption";
import { IllustrationNote } from "../../components/IllustrationNote";
import { clamp, rtlSweepMask } from "../../components/textMotion";
import { sec } from "../../timeline";
import { BOOK_PAGE, BookOnTable, TableLight } from "../BookOnTable";
import { Chest, SealedBundle } from "../props";

const C = theme.colors;
const P = BOOK_PAGE;
const T = {
  word: sec(1.0),
  latin: sec(2.6),
  gloss: sec(3.2),
  dropL: sec(4.6),
  dropR: sec(5.6),
  caption: sec(7.4),
  source: sec(8.6),
  pull: sec(10.2),
  goods: sec(11.2),
  amanah: sec(13.0),
  amanahEnd: sec(20.5),
  push: sec(17.0),
};
const DROP = { damping: 14, stiffness: 120, mass: 1 };
const GOODS = [
  { kind: "bundle", x: 120, w: 180, h: 120, cloth: "#8a3b2a" },
  { kind: "bundle", x: 320, w: 140, h: 96, cloth: "#2e4a7a" },
  { kind: "chest", x: 490, w: 150, h: 100, cloth: "" },
  { kind: "bundle", x: 660, w: 130, h: 110, cloth: "#6a6a3a" },
];
const GOODS_AT = (i: number) => T.goods + i * 12;
export const CH2_S5_BEATS = { ...T, landL: T.dropL + 9, landR: T.dropR + 9, goods: GOODS.map((_, i) => GOODS_AT(i) + 10) };

// lands exactly where Scene 4 folds down (the page at zoom 1), pulls back to the
// table, then settles between the scale and the entrusted goods
const CAM: CamKey[] = [
  { f: 0, x: 0, y: 0, zoom: 1.0 },
  { f: T.pull, x: 0, y: 0, zoom: 1.0 },
  { f: sec(12.8), x: 0, y: 40, zoom: 0.8 },
  { f: T.push, x: 0, y: 40, zoom: 0.8 },
  { f: sec(22), x: -60, y: 260, zoom: 1.1 },
  { f: sec(26), x: -70, y: 270, zoom: 1.12 },
];

export const Ch2Scene05AlAmin: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const word = interpolate(frame, [T.word, T.word + 50], [0, 1], { ...clamp, easing: theme.ease.soft });
  // goods drop onto the pans; the beam tips, then settles level
  const L = spring({ frame: frame - T.dropL, fps, config: DROP });
  const R = spring({ frame: frame - T.dropR, fps, config: DROP });
  const wob = (d: number) => (frame > d ? Math.exp(-(frame - d) / 18) * Math.sin((frame - d) / 3.5) : 0);
  const tilt = 12 * (L - R) + 5 * wob(T.dropL) - 4 * wob(T.dropR);
  const goods = GOODS.map((_, i) => spring({ frame: frame - GOODS_AT(i), fps, config: { damping: 15, stiffness: 140, mass: 0.8 } }));

  return (
    <AbsoluteFill style={{ background: C.void }}>
      <CinematicCamera keys={CAM} drift={0.5}>
        <BookOnTable
          onTable={(p) => (
            <g>
              {GOODS.map((g, i) => {
                const k = goods[i];
                if (k <= 0.001) return null;
                return (
                  <g key={i} transform={`translate(0 ${(1 - k) * -160})`} opacity={Math.min(1, k * 3)}>
                    <ellipse cx={g.x + g.w / 2} cy={1906} rx={g.w * 0.55} ry={12} fill="#000000" opacity={0.35 * k} />
                    {g.kind === "chest" ? (
                      <Chest p={p} x={g.x} base={1900} w={g.w} h={g.h} />
                    ) : (
                      <SealedBundle p={p} x={g.x} base={1900} w={g.w} h={g.h} cloth={g.cloth} />
                    )}
                  </g>
                );
              })}
            </g>
          )}
        >
          <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center" }}>
            <div dir="rtl" lang="ar" style={{ fontFamily: arabicStack, fontWeight: 700, fontSize: 168, lineHeight: 1.5, color: C.ink, ...rtlSweepMask(word) }}>
              الأَمِينُ
            </div>
          </div>
          <InkCaption lines={["AL-AMIN"]} start={T.latin} top={420} width={P.w} size={56} tracking={0.26} color={C.goldDeep} per={18} />
          <InkCaption lines={["YANG DIPERCAYAI"]} start={T.gloss} top={496} width={P.w} size={32} tracking={0.2} per={18} />
          <InkCaption lines={["Gelaran yang diberikan kaumnya", "kepada Baginda sebelum kenabian."]} start={T.caption} top={1090} width={P.w} size={40} per={26} />
          <InkCaption lines={["Sirah Ibn Hisham (riwayat Ibn Ishaq)"]} start={T.source} top={1210} width={P.w} size={28} italic weight={600} tracking={0.01} color={C.inkSoft} per={22} />
        </BookOnTable>
        {/* the scale stands on the page as a cut-paper pop-up */}
        <PaperLayer depth={1} shadow={16} shadowOpacity={0.45} render={(p) => <BalanceScale p={p} x={540} y={880} s={0.72} tilt={tilt} loads={{ l: L, r: R }} />} />
      </CinematicCamera>
      <TableLight />
      <ScrollCaption lines={["AMANAH: sesuatu yang dipertanggungjawabkan,", "dijaga dan dikembalikan kepada pemiliknya."]} start={T.amanah} end={T.amanahEnd} top={130} size={34} width={1000} />
      <IllustrationNote start={T.goods + 20} end={dur - 30} top={1800} text="Simbol amanah — bukan peristiwa khusus" />
      <PaperOverlay opacity={0.18} />
      <Grain />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};
