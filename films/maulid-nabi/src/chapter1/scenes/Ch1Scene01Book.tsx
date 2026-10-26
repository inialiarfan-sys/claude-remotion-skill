import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { latinStack, theme } from "../../theme";
import { BookCover, Endpaper, PageEdges, PageSurface } from "../../components/Book";
import { ArabicTitle } from "../../components/ArabicTitle";
import { MalaySubtitle } from "../../components/MalaySubtitle";
import { CinematicCamera, type CamKey } from "../../components/CinematicCamera";
import { DepthFill, PaperLayer } from "../../components/PaperLayer";
import { Dust, Glow, Grain, PaperOverlay, Vignette } from "../../components/Atmosphere";
import { CompassRose, MapMarker, MapShapes, PLACES, projection } from "../../components/ArabiaMap";
import { InkwellQalam, OilLamp, TableTop } from "../../components/Props";
import { starPath } from "../../components/shapes";
import { clamp } from "../../components/textMotion";
import { noise1 } from "../../random";
import { sec } from "../../timeline";
import { PAPER_TEXTURE } from "../../assets";

const C = theme.colors;
const BOOK = { x: 160, y: 520, w: 760, h: 1000 };
const PX = BOOK.x + 10; // page origin in frame coordinates
const PY = BOOK.y + 10;
const PW = BOOK.w - 20;
const PH = BOOK.h - 20;
const MAP_K = 26;
const proj = projection(20, 300, MAP_K);
const CART = { x: 40, y: 30, w: 660, h: 220 }; // title cartouche on the map page
const FLAP_W = 250; // fore-edge envelope flap (lisan) of an Islamic binding
const LAMP = { x: 150, y: 400 };
// where Makkah lands on screen at the end of the push-in; S2 opens from here
export const CH1_S1_APERTURE = { x: 430, y: 890, w: 220, h: 220 };

// beats of the opening (frames)
export const CH1_S1_BEATS = {
  flap: sec(2.0),
  cover: sec(2.75),
  coverLand: sec(2.75) + 23, // first frame the cover reaches the table (spring below)
  unfold: sec(3.9),
  ridge: sec(4.9),
  title: sec(6.0),
  malay: sec(6.9),
  bab: sec(7.5),
  markers: sec(10.6),
  makkah: sec(11.5),
};
const T = CH1_S1_BEATS;
const COVER_SPRING = { damping: 9, stiffness: 28, mass: 1.2 };

const e = (f: number, a: number, b: number, from = 0, to = 1, easing = theme.ease.inOut) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing });

// camera key that puts frame-point (px, py) at screen (540, ty) with zoom s (depth-1 plane)
const aim = (f: number, px: number, py: number, s: number, ty = 960): CamKey => ({ f, x: s * (px - 540), y: s * (py - 960) + 960 - ty, zoom: s });
const MAKKAH_XY: [number, number] = [PX + proj(PLACES.makkah)[0], PY + proj(PLACES.makkah)[1]];

// Camera choreography — every move has a job:
// close on the gilded medallion → pull back to reveal the book on its table →
// steady while it opens → push into the title on the page → pull back to the
// whole map → fly to Makkah.
const CAMERA: CamKey[] = [
  aim(0, 540, 1020, 2.35),
  aim(sec(1.3), 540, 1020, 2.2),
  aim(sec(2.7), 540, 1000, 0.88),
  aim(sec(4.0), 540, 994, 0.92),
  aim(sec(5.2), 540, 1000, 1.0),
  aim(sec(6.4), 540, PY + CART.y + 150, 1.5),
  aim(sec(9.8), 540, PY + CART.y + 152, 1.56),
  aim(sec(11.0), 540, PY + PH / 2, 1.1),
  aim(sec(11.6), 540, PY + PH / 2, 1.1),
  aim(sec(14.4), MAKKAH_XY[0], MAKKAH_XY[1], 2.6, 1000),
];

const MapSheet: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <PageSurface w={PW} h={PH}>
    {/* every cut-paper piece of the map sits slightly proud of the page */}
    <svg width={PW} height={PH} style={{ position: "absolute", inset: 0, filter: "drop-shadow(1px 2px 1.5px rgba(60,30,10,0.35))" }}>
      <defs>
        <linearGradient id="cartLapis" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#24387c" />
          <stop offset="100%" stopColor="#111c48" />
        </linearGradient>
      </defs>
      <MapShapes
        p={(c) => c}
        proj={proj}
        k={MAP_K}
        rise={(i) => spring({ frame: frame - (T.ridge + i * 2), fps, config: { damping: 9, stiffness: 140, mass: 0.5 } })}
      />
      <text
        x={proj([46, 22.6])[0]}
        y={proj([46, 22.6])[1]}
        textAnchor="middle"
        direction="rtl"
        fontFamily="'Amiri', serif"
        fontWeight={700}
        fontSize={36}
        fill={C.inkSoft}
        opacity={interpolate(frame, [T.ridge + 30, T.ridge + 50], [0, 0.85], clamp)}
      >
        جَزِيرَةُ الْعَرَبِ
      </text>
      <CompassRose x={640} y={905} r={40} p={(c) => c} />
      {/* lapis title cartouche (sarlawh) painted on the sheet */}
      <rect x={CART.x} y={CART.y} width={CART.w} height={CART.h} rx={10} fill="url(#cartLapis)" />
      <rect x={CART.x + 10} y={CART.y + 10} width={CART.w - 20} height={CART.h - 20} rx={6} fill="none" stroke={C.gold} strokeWidth={3} />
      <rect x={CART.x + 17} y={CART.y + 17} width={CART.w - 34} height={CART.h - 34} rx={4} fill="none" stroke={C.goldDeep} strokeWidth={1.2} />
      <path d={starPath(CART.x + 40, CART.y + CART.h / 2, 13, 6)} fill={C.gold} />
      <path d={starPath(CART.x + CART.w - 40, CART.y + CART.h / 2, 13, 6)} fill={C.gold} />
      <MapMarker proj={proj} ll={PLACES.syam} at={T.markers} ms="SYAM" k={MAP_K} />
      <MapMarker proj={proj} ll={PLACES.yathrib} at={T.markers + 6} ms="YATHRIB" k={MAP_K} side="left" />
      <MapMarker proj={proj} ll={PLACES.yaman} at={T.markers + 12} ms="YAMAN" k={MAP_K} />
      <MapMarker proj={proj} ll={PLACES.makkah} at={T.makkah} ar="مكة" ms="MAKKAH" k={MAP_K} side="left" />
    </svg>
  </PageSurface>
);

// leather envelope flap, tooled in gold; hinged on the fore-edge (left)
const Flap: React.FC<{ angle: number }> = ({ angle }) => {
  const front = "polygon(0 0, 62% 0, 100% 50%, 62% 100%, 0 100%)";
  const back = "polygon(100% 0, 38% 0, 0% 50%, 38% 100%, 100% 100%)";
  const lift = Math.sin((angle / 176) * Math.PI);
  return (
    <div
      style={{
        position: "absolute",
        left: BOOK.x,
        top: BOOK.y,
        width: FLAP_W,
        height: BOOK.h,
        transformOrigin: "0% 50%",
        transform: `rotateY(${-angle}deg) translateZ(1px)`,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: front,
          backfaceVisibility: "hidden",
          background: `linear-gradient(100deg, ${C.leatherDark}, ${C.leather} 55%, ${C.leatherLight})`,
        }}
      >
        <AbsoluteFill style={{ backgroundImage: `url(${PAPER_TEXTURE})`, backgroundSize: "380px", mixBlendMode: "multiply", opacity: 0.85 }} />
        <svg width={FLAP_W} height={BOOK.h} style={{ position: "absolute", inset: 0 }}>
          <path
            d={`M14 16 L${FLAP_W * 0.62 - 6} 16 L${FLAP_W - 18} ${BOOK.h / 2} L${FLAP_W * 0.62 - 6} ${BOOK.h - 16} L14 ${BOOK.h - 16} Z`}
            fill="none"
            stroke={C.gold}
            strokeWidth={4}
          />
          <path d={starPath(FLAP_W * 0.55, BOOK.h / 2, 30, 13)} fill={C.gold} />
          <path d={starPath(FLAP_W * 0.55, BOOK.h / 2, 16, 7)} fill={C.leatherDark} />
        </svg>
        <AbsoluteFill style={{ background: `rgba(0,0,0,${lift * 0.45})` }} />
      </div>
      <div style={{ position: "absolute", inset: 0, clipPath: back, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
        <Endpaper w={FLAP_W} h={BOOK.h} />
      </div>
    </div>
  );
};

export const Ch1Scene01Book: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const darkness = e(frame, 0, 14, 1, 0, theme.ease.soft);
  // the hook: raking lamplight slides across the gilding in the first second
  const sheen = e(frame, 4, sec(1.8), 0, 1);
  const flapAngle = e(frame, T.flap, T.flap + 26, 0, 176);
  const cover = Math.min(178, 172 * spring({ frame: frame - T.cover, fps, config: COVER_SPRING }));
  const flapL = e(frame, T.unfold, T.unfold + 32, 1, 0, theme.ease.out);
  const flapR = e(frame, T.unfold + 10, T.unfold + 42, 1, 0, theme.ease.out);
  const tilt = e(frame, 0, sec(2.7), 10, 3);
  const flicker = 0.92 + noise1(frame / 5, 1) * 0.08 + noise1(frame / 13, 2) * 0.05;
  const lampSway = noise1(frame / 9, 3) * 6;
  // focus pulls to the page during the title and the flight; props soften
  const focus = interpolate(frame, [sec(5.6), sec(6.4), sec(10), sec(11), sec(12), sec(14.4)], [0, 1, 1, 0.25, 0.25, 1], clamp);
  const soft = (px: number) => ({ filter: `blur(${(focus * px).toFixed(2)}px)` });
  const babIn = e(frame, T.bab, T.bab + 20, 0, 1, theme.ease.out);
  const third = PW / 3;

  const mapFlap = (i: 0 | 2, fold: number) => (
    <div
      style={{
        position: "absolute",
        left: i * third,
        top: 0,
        width: third,
        height: PH,
        transformOrigin: i === 0 ? "100% 50%" : "0% 50%",
        transform: `rotateY(${(i === 0 ? 1 : -1) * fold * 178}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", backfaceVisibility: "hidden" }}>
        <div style={{ position: "absolute", left: -i * third, top: 0 }}>
          <MapSheet frame={frame} fps={fps} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: `rgba(40,20,5,${Math.sin(fold * Math.PI) * 0.5})` }} />
      </div>
      <PageSurface w={third} h={PH} frame={false} style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} />
    </div>
  );

  return (
    <AbsoluteFill style={{ background: C.void }}>
      <CinematicCamera keys={CAMERA}>
        {/* the writing table: a small diorama around the book */}
        <PaperLayer depth={0.94} shadow={0} style={soft(2.5)} render={(p) => <TableTop p={p} top={-400} />} />
        <Glow x={LAMP.x + 60} y={LAMP.y + 60} r={900} color="#ffb453" opacity={0.3 * flicker} depth={0.94} />
        <DepthFill depth={1}>
          <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: "50% 45%" }}>
            <AbsoluteFill style={{ transform: `rotateX(${tilt}deg)`, transformOrigin: "540px 1020px", transformStyle: "preserve-3d" }}>
              {/* soft ambient shadow plus a tight contact shadow, cast away from the lamp */}
              <div style={{ position: "absolute", left: BOOK.x + 10, top: BOOK.y + 50, width: BOOK.w + 50, height: BOOK.h + 10, background: "rgba(0,0,0,0.6)", filter: "blur(44px)", borderRadius: 30 }} />
              <div style={{ position: "absolute", left: BOOK.x + 6, top: BOOK.y + 12, width: BOOK.w + 8, height: BOOK.h + 6, background: "rgba(0,0,0,0.7)", filter: "blur(8px)", borderRadius: 10 }} />
              <div style={{ position: "absolute", left: PX, top: PY }}>
                <PageEdges w={PW} h={PH} count={9} />
              </div>
              <div style={{ position: "absolute", left: PX, top: PY, width: PW, height: PH, transformStyle: "preserve-3d", perspective: 1800, opacity: cover > 90 ? 1 : 0 }}>
                {flapL > 0 || flapR > 0 ? (
                  <>
                    <div style={{ position: "absolute", left: third, top: 0, width: third, height: PH, overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: -third, top: 0 }}>
                        <MapSheet frame={frame} fps={fps} />
                      </div>
                    </div>
                    {mapFlap(0, flapL)}
                    {mapFlap(2, flapR)}
                  </>
                ) : (
                  // once flat, one continuous sheet with faint fold creases
                  <div style={{ position: "absolute", inset: 0 }}>
                    <MapSheet frame={frame} fps={fps} />
                    {[third, third * 2].map((x) => (
                      <div
                        key={x}
                        style={{
                          position: "absolute",
                          left: x - 6,
                          top: 0,
                          width: 12,
                          height: PH,
                          background: "linear-gradient(90deg, transparent, rgba(90,55,20,0.10) 45%, rgba(255,245,220,0.10) 55%, transparent)",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* the title is inked onto the cartouche once the map lies flat */}
              <div style={{ position: "absolute", left: PX + CART.x, top: PY + CART.y, width: CART.w, height: CART.h }}>
                <ArabicTitle text="سِيرَةُ النَّبِيِّ مُحَمَّدٍ ﷺ" start={T.title} top={18} size={64} maxWidth={620} lineHeight={1.6} revealLen={44} />
                <MalaySubtitle
                  text="PERJALANAN HIDUP RASULULLAH SAW"
                  start={T.malay}
                  top={142}
                  size={27}
                  tracking={0.12}
                  maxWidth={640}
                  ornament={false}
                  color={C.parchmentLight}
                />
              </div>
              {/* chapter label slides out from beneath the cartouche like a paper tab */}
              {babIn > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    left: PX + CART.x + CART.w / 2 - 250,
                    top: PY + CART.y + CART.h + 8,
                    width: 500,
                    height: 50,
                    clipPath: `inset(0 0 ${(1 - babIn) * 100}% 0)`,
                    transform: `translateY(${-(1 - babIn) * 30}px)`,
                    background: `linear-gradient(180deg, ${C.parchmentLight}, ${C.parchmentDark})`,
                    border: `2px solid ${C.goldDeep}`,
                    borderRadius: 4,
                    boxShadow: "0 4px 8px rgba(40,20,5,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: latinStack,
                    fontWeight: 700,
                    fontSize: 24,
                    letterSpacing: "0.14em",
                    color: C.ink,
                  }}
                >
                  BAB 1 — ZAMAN KANAK-KANAK
                </div>
              ) : null}
              {/* front cover: drops open on the right-hand spine with real weight */}
              <div
                style={{
                  position: "absolute",
                  left: BOOK.x,
                  top: BOOK.y,
                  width: BOOK.w,
                  height: BOOK.h,
                  transformOrigin: "100% 50%",
                  transform: `rotateY(${cover}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
                  <BookCover w={BOOK.w} h={BOOK.h} sheen={sheen} />
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(0,0,0,${Math.sin((cover / 180) * Math.PI) * 0.6}), transparent)` }} />
                </div>
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", overflow: "hidden", borderRadius: 8 }}>
                  <Endpaper w={BOOK.w} h={BOOK.h} />
                </div>
              </div>
              <Flap angle={flapAngle} />
            </AbsoluteFill>
          </AbsoluteFill>
        </DepthFill>
        <PaperLayer depth={1.05} shadow={10} shadowOpacity={0.5} style={soft(2)} render={(p) => <InkwellQalam p={p} x={900} y={1650} />} />
        <PaperLayer depth={1.1} shadow={12} shadowOpacity={0.5} style={soft(2)} render={(p) => <OilLamp p={p} x={LAMP.x} y={LAMP.y} flicker={flicker} sway={lampSway} />} />
        <Glow x={LAMP.x + 112} y={LAMP.y - 52} r={130} color="#ffc46a" opacity={0.9 * flicker} depth={1.1} />
        <Dust seed={101} count={40} area={{ x: 0, y: 200, w: 1080, h: 1500 }} rise={0.4} size={3} opacity={0.55} depth={1.0} />
        {/* near-camera motes and a fold of cloth give the diorama a foreground */}
        <Dust seed={103} count={10} area={{ x: -100, y: 300, w: 1300, h: 1400 }} rise={0.6} size={8} opacity={0.35} depth={1.4} />
        <PaperLayer
          depth={1.5}
          shadow={30}
          shadowOpacity={0.7}
          style={{ filter: "blur(5px)" }}
          render={(p) => (
            <g>
              <path d="M-400 1830 Q60 1770 280 2010 L330 2400 L-400 2400 Z" fill={p("#2a1410")} />
              <path d="M-400 1856 Q50 1798 262 2030" stroke={p(C.goldDeep)} strokeWidth={4} fill="none" opacity={0.7} />
            </g>
          )}
        />
      </CinematicCamera>
      {/* warm light from the lamp side, falling away toward the far corner */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 22% 20%, rgba(255,190,110,0.10), transparent 55%, rgba(5,3,2,0.45) 100%)" }} />
      <PaperOverlay opacity={0.18} />
      <Grain />
      <Vignette strength={interpolate(frame, [0, sec(2.7)], [0.8, 0.6], clamp)} />
      <AbsoluteFill style={{ background: C.void, opacity: darkness }} />
    </AbsoluteFill>
  );
};
