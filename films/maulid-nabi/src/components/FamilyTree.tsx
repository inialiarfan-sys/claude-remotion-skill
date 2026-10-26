import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { latinStack, theme } from "../theme";
import { starPath } from "./shapes";
import { clamp } from "./textMotion";

const C = theme.colors;

export type TreeNode = {
  id: string;
  x: number;
  y: number;
  label: string; // e.g. "IBUNDA"
  name: string;
  appear: number;
  dim?: number; // frame from which the node is shown as deceased
  note?: string; // small line shown once dimmed
  prophet?: boolean; // lapis card for the Prophet's name — a name only, never a likeness
  w?: number;
};

export type TreeEdge = {
  from: string;
  to: string;
  kind: "lineage" | "marriage" | "care";
  appear: number;
  fade?: number;
  label?: string;
};

const CARD_H = 118;

/**
 * Genealogy drawn as a manuscript diagram: parchment name-cards joined by ink
 * lines that draw themselves. "care" edges are gold dotted arrows showing who
 * looked after the Prophet ﷺ; they can fade as guardianship passes on.
 * All coordinates are frame coordinates, so the tree can sit under a camera.
 */
export const FamilyTree: React.FC<{ nodes: TreeNode[]; edges: TreeEdge[]; highlight?: { id: string; from: number; to: number }[] }> = ({
  nodes,
  edges,
  highlight = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const hl = (id: string) =>
    highlight
      .filter((h) => h.id === id)
      .reduce((acc, h) => Math.max(acc, interpolate(frame, [h.from, h.from + 12, h.to - 12, h.to], [0, 1, 1, 0], clamp)), 0);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <marker id="careArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill={C.goldDeep} />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const a = byId[e.from];
          const b = byId[e.to];
          const t = interpolate(frame, [e.appear, e.appear + 24], [0, 1], { ...clamp, easing: theme.ease.inOut });
          const fade = e.fade === undefined ? 1 : interpolate(frame, [e.fade, e.fade + 18], [1, 0.12], clamp);
          if (t <= 0) return null;
          let d: string;
          if (e.kind === "marriage") d = `M${a.x} ${a.y} L${b.x} ${b.y}`;
          else if (e.kind === "lineage") {
            const midY = (a.y + CARD_H / 2 + b.y - CARD_H / 2) / 2;
            d = `M${a.x} ${a.y + CARD_H / 2} L${a.x} ${midY} L${b.x} ${midY} L${b.x} ${b.y - CARD_H / 2}`;
          } else {
            const cx = (a.x + b.x) / 2 + (b.y - a.y) * 0.25;
            const cy = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.15;
            d = `M${a.x} ${a.y + (b.y > a.y ? CARD_H / 2 : -CARD_H / 2)} Q${cx} ${cy} ${b.x + (a.x < b.x ? -40 : 40)} ${b.y - CARD_H / 2 - 6}`;
          }
          return (
            <path
              key={i}
              d={d}
              pathLength={1}
              fill="none"
              stroke={e.kind === "care" ? C.goldDeep : C.inkSoft}
              strokeWidth={e.kind === "care" ? 5 : 3.5}
              strokeLinecap="round"
              strokeDasharray={e.kind === "care" ? undefined : `${t} 1`}
              style={e.kind === "care" ? { strokeDasharray: "0.02 0.018", strokeDashoffset: 0 } : undefined}
              opacity={e.kind === "care" ? Math.min(1, t * 1.5) * fade : fade}
              markerEnd={e.kind === "care" && t > 0.95 ? "url(#careArrow)" : undefined}
              clipPath={undefined}
            />
          );
        })}
      </svg>
      {nodes.map((n) => {
        const p = spring({ frame: frame - n.appear, fps, config: theme.spring.smooth });
        if (frame < n.appear - 1) return null;
        const dim = n.dim === undefined ? 0 : interpolate(frame, [n.dim, n.dim + 20], [0, 1], { ...clamp, easing: theme.ease.inOut });
        const h = hl(n.id);
        const w = n.w ?? 330;
        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: n.x - w / 2,
              top: n.y - CARD_H / 2,
              width: w,
              height: CARD_H,
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px) scale(${1 + h * 0.06})`,
              borderRadius: 8,
              background: n.prophet
                ? "linear-gradient(180deg, #22367a, #142458)"
                : `linear-gradient(180deg, ${C.parchmentLight}, ${C.parchmentDark})`,
              boxShadow: `0 10px 24px rgba(0,0,0,0.45), 0 0 ${h * 40}px rgba(244,212,138,${h * 0.8})`,
              filter: `saturate(${1 - dim * 0.7}) brightness(${1 - dim * 0.25})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: latinStack,
              textAlign: "center",
            }}
          >
            <div style={{ position: "absolute", inset: 7, border: `2px solid ${n.prophet ? C.gold : C.goldDeep}`, borderRadius: 5, opacity: 0.85 }} />
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.16em", color: n.prophet ? C.goldLight : "#2e4378" }}>{n.label}</div>
            <div style={{ fontSize: 31, fontWeight: 700, lineHeight: 1.1, color: n.prophet ? C.parchmentLight : C.ink, padding: "0 12px" }}>{n.name}</div>
            {n.note && dim > 0 ? (
              <div style={{ fontSize: 22, fontStyle: "italic", fontWeight: 600, color: C.inkSoft, opacity: dim, marginTop: 2 }}>{n.note}</div>
            ) : null}
            {n.prophet ? (
              <svg width={w} height={CARD_H} style={{ position: "absolute", inset: 0 }}>
                <path d={starPath(24, CARD_H / 2, 10, 4.5)} fill={C.gold} />
                <path d={starPath(w - 24, CARD_H / 2, 10, 4.5)} fill={C.gold} />
              </svg>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
