/**
 * All timing comes from the real narration (src/data/transcript.json), never the script.
 * - scenes: located by fuzzy-matching each scene's anchor phrase in the transcript
 * - captions: pages of 1–3 lines built from word timings, spelling fixed to the script
 * - cues: the moment a given word is spoken (for numbers, host reactions, SFX)
 * Pure functions: used by the compositions and by scripts/timing-report.ts.
 */
import transcript from '../data/transcript.json';

export type Word = { text: string; start: number; end: number };
export type SceneId =
  | 'hook' | 'welcome' | 'name' | 'exoplanets' | 'distance' | 'transit' | 'blue' | 'giant'
  | 'dayNight' | 'winds' | 'storm' | 'smell' | 'remember' | 'marble' | 'thing' | 'ending';

export const SCENES: { id: SceneId; title: string; anchor: string }[] = [
  { id: 'hook', title: 'Glass rain (cold open)', anchor: 'Glass rain' },
  { id: 'welcome', title: 'Welcome', anchor: 'Welcome to the worst planet' },
  { id: 'name', title: 'Its name', anchor: 'Its name is HD 189733 b' },
  { id: 'exoplanets', title: 'Exoplanets', anchor: 'So far, they have found more than six thousand' },
  { id: 'distance', title: '64 light-years', anchor: 'This planet is about sixty-four light-years away' },
  { id: 'transit', title: 'Transit', anchor: 'When the planet passes in front of its star' },
  { id: 'blue', title: 'Deep blue', anchor: 'From far away, the planet looks deep blue' },
  { id: 'giant', title: 'A giant', anchor: 'This planet is a giant' },
  { id: 'dayNight', title: 'Day & night', anchor: 'One side always faces its star' },
  { id: 'winds', title: 'Winds', anchor: 'That huge difference in heat' },
  { id: 'storm', title: 'Glass storm', anchor: 'Now put it all together' },
  { id: 'smell', title: 'Rotten eggs', anchor: 'And the rotten egg smell?' },
  { id: 'remember', title: 'Remember', anchor: 'But remember, nobody has actually seen' },
  { id: 'marble', title: 'Blue marble', anchor: "From far away, it looks like a peaceful blue marble" },
  { id: 'thing', title: "Here's the thing", anchor: "And here's the thing" },
  { id: 'ending', title: 'Ending', anchor: 'Space is truly amazing' },
];

/** Spellings from the script (applied to captions). Patterns match normalised tokens. */
const FIXES: { match: string[]; text: string }[] = [
  { match: ['hd', '189733', 'b'], text: 'HD 189733 b' },
  { match: ['hd189733b'], text: 'HD 189733 b' },
  { match: ['hd', '189733b'], text: 'HD 189733 b' },
  { match: ['james', 'web'], text: 'James Webb' },
  { match: ['james', 'webb'], text: 'James Webb' },
  { match: ['hydrogen', 'sulphide'], text: 'hydrogen sulfide' },
  { match: ['hydrogen', 'sulfide'], text: 'hydrogen sulfide' },
  { match: ['exo', 'planets'], text: 'exoplanets' },
  { match: ['exoplanets'], text: 'exoplanets' },
  { match: ['light', 'years'], text: 'light-years' },
  { match: ['star', 'light'], text: 'starlight' },
];

const NUMS: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9',
  ten: '10', twenty: '20', thirty: '30', forty: '40', fifty: '50', sixty: '60', seventy: '70', eighty: '80', ninety: '90',
  hundred: '100', thousand: '1000',
};

/** lower-case, strip punctuation, numbers as digits ("sixty-four" → "64", "6,000" → "6000") */
export const norm = (s: string): string[] => {
  const t = s
    .toLowerCase()
    .replace(/(\d),(\d)/g, '$1$2')
    .replace(/[’']/g, '')
    .replace(/-/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < t.length; i++) {
    const w = t[i];
    if (NUMS[w] !== undefined) {
      let v = parseInt(NUMS[w], 10);
      // "sixty four", "six thousand"
      if (v >= 20 && v < 100 && NUMS[t[i + 1]] && parseInt(NUMS[t[i + 1]], 10) < 10) {
        v += parseInt(NUMS[t[++i]], 10);
      }
      if (t[i + 1] === 'thousand') {
        v *= 1000;
        i++;
      }
      out.push(String(v));
    } else out.push(w);
  }
  return out;
};

const lev = (a: string, b: string) => {
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...new Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
};
const sim = (a: string, b: string) => 1 - lev(a, b) / Math.max(a.length, b.length, 1);

type Tok = { t: string; w: number }; // normalised token + index of its word
const tokens = (words: Word[]): Tok[] => words.flatMap((w, i) => norm(w.text).map((t) => ({ t, w: i })));

/** Best fuzzy match of `phrase` in the word list at or after `fromWord`. */
export const findPhrase = (words: Word[], phrase: string, fromWord = 0, minScore = 0.72) => {
  const toks = tokens(words).filter((k) => k.w >= fromWord);
  const p = norm(phrase);
  let best = { score: 0, word: -1 };
  for (let i = 0; i + p.length <= toks.length; i++) {
    let s = 0;
    for (let k = 0; k < p.length; k++) s += sim(toks[i + k].t, p[k]);
    s /= p.length;
    if (s > best.score + 1e-6) best = { score: s, word: toks[i].w };
    if (s > 0.995) break;
  }
  return best.score >= minScore ? best : null;
};

export type TimedScene = { id: SceneId; title: string; anchor: string; start: number; end: number; found: boolean; score: number };

export type Timeline = {
  duration: number; // audio length (s)
  total: number; // composition length (s) = audio + 1.5
  words: Word[];
  scenes: TimedScene[];
  missing: string[];
};

export const TAIL = 1.5;

export const buildTimeline = (audioSeconds?: number): Timeline => {
  const words: Word[] = (transcript as { words: Word[] }).words;
  const duration = audioSeconds ?? (transcript as { duration?: number }).duration ?? words[words.length - 1].end + 0.5;
  // 1. anchors, searched in order
  let from = 0;
  const hits = SCENES.map((s) => {
    const m = findPhrase(words, s.anchor, from);
    if (m) from = m.word + 1;
    return m ? { t: words[m.word].start, score: m.score } : null;
  });
  // 2. missing anchors: proportional placement between found neighbours
  const starts: number[] = hits.map((h) => (h ? h.t : NaN));
  starts[0] = 0; // the video opens on the first scene
  for (let i = 1; i < starts.length; i++) {
    if (!Number.isNaN(starts[i])) continue;
    let a = i - 1;
    let b = i + 1;
    while (b < starts.length && Number.isNaN(starts[b])) b++;
    const tb = b < starts.length ? starts[b] : duration;
    const gap = b - a;
    for (let k = i; k < b; k++) starts[k] = starts[a] + ((tb - starts[a]) * (k - a)) / gap;
  }
  const scenes = SCENES.map((s, i) => ({
    ...s,
    start: starts[i],
    end: i < SCENES.length - 1 ? starts[i + 1] : duration + TAIL,
    found: Boolean(hits[i]),
    score: hits[i]?.score ?? 0,
  }));
  return { duration, total: duration + TAIL, words, scenes, missing: SCENES.filter((_, i) => !hits[i]).map((s) => s.anchor) };
};

/** Start time of the first word matching `phrase` at/after `after` seconds (null if not found). */
export const cue = (tl: Timeline, phrase: string, after = 0, before = Infinity): number | null => {
  const from = tl.words.findIndex((w) => w.start >= after - 0.05);
  if (from < 0) return null;
  const m = findPhrase(tl.words, phrase, from, 0.7);
  if (!m) return null;
  const t = tl.words[m.word].start;
  return t < before ? t : null;
};

// ---------------------------------------------------------------- captions
export type CapWord = { text: string; start: number; end: number };
export type CapPage = { start: number; end: number; lines: CapWord[][] };

/** Apply script spellings + number formatting to the transcript words. */
export const captionWords = (words: Word[]): CapWord[] => {
  const out: CapWord[] = [];
  for (let i = 0; i < words.length; ) {
    let fixed = false;
    for (const f of FIXES) {
      const toks: string[] = [];
      let j = i;
      while (j < words.length && toks.length < f.match.length) toks.push(...norm(words[j++].text));
      if (toks.length === f.match.length && toks.every((t, k) => t === f.match[k])) {
        const trail = (words[j - 1].text.match(/[.,!?;:]+$/) || [''])[0];
        out.push({ text: f.text + trail, start: words[i].start, end: words[j - 1].end });
        i = j;
        fixed = true;
        break;
      }
    }
    if (fixed) continue;
    // thousands separator, but never for years ("2024")
    let t = words[i].text.replace(/\b(\d)(\d{3})\b/g, (m, a, b) => (+m >= 1900 && +m <= 2100 ? m : `${a},${b}`));
    if (i === 0) t = t.charAt(0).toUpperCase() + t.slice(1);
    out.push({ text: t, start: words[i].start, end: words[i].end });
    i++;
  }
  return out;
};

/** Group words into pages of 1–3 lines (max chars per line), breaking on sentences and pauses. */
export const captionPages = (words: CapWord[], maxChars: number, maxLines: number): CapPage[] => {
  const pages: CapPage[] = [];
  let lines: CapWord[][] = [[]];
  const len = (l: CapWord[]) => l.reduce((a, w) => a + w.text.length + 1, 0);
  const flush = () => {
    const ws = lines.flat();
    if (ws.length) pages.push({ start: ws[0].start, end: ws[ws.length - 1].end, lines: lines.filter((l) => l.length) });
    lines = [[]];
  };
  words.forEach((w, i) => {
    let cur = lines[lines.length - 1];
    if (cur.length && len(cur) + w.text.length > maxChars) {
      if (lines.length >= maxLines) flush();
      else lines.push([]);
      cur = lines[lines.length - 1];
    }
    cur.push(w);
    const next = words[i + 1];
    const sentence = /[.?!]$/.test(w.text);
    const pause = next ? next.start - w.end > 0.45 : true;
    if (sentence || (pause && /[,;:]$/.test(w.text))) flush();
  });
  flush();
  // each page stays up until the next one starts (max 0.6 s after its last word)
  pages.forEach((p, i) => {
    const next = pages[i + 1];
    p.end = next ? Math.min(next.start - 0.02, p.end + 0.6) : p.end + 0.8;
  });
  return pages;
};
