import React from "react";
import { useCurrentFrame } from "remotion";
import { Endpaper, PageEdges, PageSurface } from "../components/Book";
import { DepthFill, PaperLayer, type Paint } from "../components/PaperLayer";
import { Dust, Glow } from "../components/Atmosphere";
import { InkwellQalam, OilLamp, TableTop } from "../components/Props";
import { noise1 } from "../random";

// The open book on the lamp-lit writing table where Chapter 1 ends (same layout
// as Ch1Scene09NextChapter), so Chapter 2 can pick the story up on that page.
// Must sit inside a CinematicCamera; `children` are drawn on the page in
// page coordinates, `onTable` draws extra objects on the table in world space.
export const BOOK_PAGE = { x: 70, y: 250, w: 940, h: 1420 };
const P = BOOK_PAGE;
const LAMP = { x: 40, y: 170 };

export const useLampFlicker = () => {
  const frame = useCurrentFrame();
  return 0.92 + noise1(frame / 5, 1) * 0.08 + noise1(frame / 13, 2) * 0.05;
};

export const BookOnTable: React.FC<{ children?: React.ReactNode; onTable?: (p: Paint) => React.ReactNode }> = ({ children, onTable }) => {
  const frame = useCurrentFrame();
  const flicker = useLampFlicker();
  return (
    <>
      <PaperLayer depth={0.94} shadow={0} render={(p) => <TableTop p={p} top={-400} />} />
      <Glow x={LAMP.x + 80} y={LAMP.y + 60} r={900} color="#ffb453" opacity={0.3 * flicker} depth={0.94} />
      <DepthFill depth={1}>
        <div style={{ position: "absolute", left: P.x - 250, top: P.y + 40, width: P.w + 1240, height: P.h + 20, background: "rgba(0,0,0,0.6)", filter: "blur(44px)" }} />
        <div style={{ position: "absolute", left: P.x - 4, top: P.y + 10, width: P.w + 10, height: P.h + 6, background: "rgba(0,0,0,0.7)", filter: "blur(8px)" }} />
        <div style={{ position: "absolute", left: P.x + P.w, top: P.y - 10, width: 960, height: P.h + 20, overflow: "hidden", borderRadius: 8 }}>
          <Endpaper w={960} h={P.h + 20} />
        </div>
        <div style={{ position: "absolute", left: P.x - 250, top: P.y - 10, width: 250, height: P.h + 20, clipPath: "polygon(100% 0, 38% 0, 0% 50%, 38% 100%, 100% 100%)" }}>
          <Endpaper w={250} h={P.h + 20} />
        </div>
        <div style={{ position: "absolute", left: P.x, top: P.y }}>
          <PageEdges w={P.w} h={P.h} count={10} />
        </div>
        <PageSurface w={P.w} h={P.h} style={{ left: P.x, top: P.y }}>
          {children}
        </PageSurface>
      </DepthFill>
      {onTable ? <PaperLayer depth={1.02} shadow={14} shadowOpacity={0.6} render={onTable} /> : null}
      <PaperLayer depth={1.05} shadow={10} shadowOpacity={0.5} render={(p) => <InkwellQalam p={p} x={980} y={1800} />} />
      <PaperLayer depth={1.1} shadow={12} shadowOpacity={0.5} render={(p) => <OilLamp p={p} x={LAMP.x} y={LAMP.y} flicker={flicker} sway={noise1(frame / 9, 3) * 6} />} />
      <Glow x={LAMP.x + 112} y={LAMP.y - 52} r={130} color="#ffc46a" opacity={0.9 * flicker} depth={1.1} />
      <Dust seed={2909} count={30} area={{ x: 0, y: 200, w: 1080, h: 1500 }} rise={0.35} size={3} depth={1.0} opacity={0.5} />
    </>
  );
};

// warm lamp-light falloff over the table, as at the end of Chapter 1
export const TableLight: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "radial-gradient(ellipse 90% 70% at 22% 16%, rgba(255,190,110,0.10), transparent 55%, rgba(5,3,2,0.45) 100%)",
    }}
  />
);
