// Procedural silhouettes for the paper-cut layers. All seeded and deterministic.
import { mulberry32 } from "../random";

const r1 = (n: number) => Math.round(n * 10) / 10;

// jagged mountain ridge, closed down to `bottom`
export const ridgePath = (
  seed: number,
  opts: { x0: number; x1: number; base: number; amp: number; peaks: number; bottom: number; rough?: number },
) => {
  const rand = mulberry32(seed);
  const { x0, x1, base, amp, peaks, bottom, rough = 0.35 } = opts;
  const pts: [number, number][] = [];
  const step = (x1 - x0) / (peaks * 2);
  for (let i = 0; i <= peaks * 2; i++) {
    const isPeak = i % 2 === 1;
    const h = isPeak ? amp * (0.55 + rand() * 0.45) : amp * (rand() * 0.3);
    pts.push([x0 + i * step + (rand() - 0.5) * step * 0.5, base - h]);
  }
  // midpoint displacement for craggy paper edges
  let detailed = pts;
  for (let pass = 0; pass < 2; pass++) {
    const next: [number, number][] = [];
    for (let i = 0; i < detailed.length - 1; i++) {
      const [ax, ay] = detailed[i];
      const [bx, by] = detailed[i + 1];
      next.push([ax, ay]);
      const len = Math.hypot(bx - ax, by - ay);
      next.push([(ax + bx) / 2 + (rand() - 0.5) * len * 0.12, (ay + by) / 2 + (rand() - 0.5) * len * rough]);
    }
    next.push(detailed[detailed.length - 1]);
    detailed = next;
  }
  const d = detailed.map(([x, y], i) => `${i ? "L" : "M"}${r1(x)} ${r1(y)}`).join(" ");
  return `${d} L${x1} ${bottom} L${x0} ${bottom} Z`;
};

// soft rolling dune line made of summed sines, closed down to `bottom`
export const dunePath = (
  seed: number,
  opts: { x0: number; x1: number; base: number; amp: number; waves: number; bottom: number; phase?: number },
) => {
  const rand = mulberry32(seed);
  const { x0, x1, base, amp, waves, bottom, phase = 0 } = opts;
  const comps = [0, 1, 2].map((k) => ({
    f: (waves * (k + 1) * (0.8 + rand() * 0.4) * Math.PI * 2) / (x1 - x0),
    p: rand() * Math.PI * 2 + phase,
    a: amp / (k + 1.4),
  }));
  let d = "";
  for (let x = x0; x <= x1; x += 16) {
    const y = base - comps.reduce((acc, c) => acc + Math.sin(x * c.f + c.p) * c.a, 0);
    d += `${x === x0 ? "M" : "L"}${r1(x)} ${r1(y)} `;
  }
  return `${d}L${x1} ${bottom} L${x0} ${bottom} Z`;
};

// regular n-pointed star (8 = the Islamic khatam)
export const starPath = (cx: number, cy: number, outer: number, inner: number, points = 8, rot = 0) => {
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rot + (Math.PI * i) / points - Math.PI / 2;
    d += `${i ? "L" : "M"}${r1(cx + Math.cos(a) * r)} ${r1(cy + Math.sin(a) * r)} `;
  }
  return d + "Z";
};

// Persian pointed (four-centred) arch opening: bottom-left at (x, y), width w, height h
export const pointedArchPath = (x: number, y: number, w: number, h: number, spring = 0.55) => {
  const sy = y - h * spring; // springing line
  const top = y - h;
  const mid = x + w / 2;
  return `M${x} ${y} L${x} ${sy} C${x} ${sy - (sy - top) * 0.55} ${mid - w * 0.18} ${top + (sy - top) * 0.15} ${mid} ${top} C${mid + w * 0.18} ${top + (sy - top) * 0.15} ${x + w} ${sy - (sy - top) * 0.55} ${x + w} ${sy} L${x + w} ${y} Z`;
};

// tall parabolic vault (the Taq Kasra profile)
export const parabolicArchPath = (cx: number, base: number, w: number, h: number) => {
  const n = 40;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const t = -1 + (2 * i) / n;
    const x = cx + (t * w) / 2;
    const y = base - h * (1 - Math.pow(Math.abs(t), 2.2));
    d += `${i ? "L" : "M"}${r1(x)} ${r1(y)} `;
  }
  return d + "Z";
};

// round-topped arch
export const roundArchPath = (x: number, y: number, w: number, h: number) => {
  const r = w / 2;
  return `M${x} ${y} L${x} ${y - h + r} A${r} ${r} 0 0 1 ${x + w} ${y - h + r} L${x + w} ${y} Z`;
};
