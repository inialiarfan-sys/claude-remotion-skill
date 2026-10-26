// Loads the locally stored fonts and the paper texture before any frame renders.
import { continueRender, delayRender, staticFile } from "remotion";
import { theme } from "./theme";

const ARABIC_RANGE =
  "U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC";
const LATIN_RANGE =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT_RANGE =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";

type Face = { family: string; file: string; weight: string; style?: string; range?: string };

const FACES: Face[] = [
  ...(["400", "700"] as const).flatMap((w) => [
    { family: theme.fonts.arabic, file: `amiri-arabic-${w}-normal.woff2`, weight: w, range: ARABIC_RANGE },
    { family: theme.fonts.arabic, file: `amiri-latin-${w}-normal.woff2`, weight: w, range: LATIN_RANGE },
    { family: theme.fonts.arabic, file: `amiri-latin-ext-${w}-normal.woff2`, weight: w, range: LATIN_EXT_RANGE },
  ]),
  ...(["500", "600", "700"] as const).map((w) => ({
    family: theme.fonts.latin,
    file: `cormorant-garamond-latin-${w}-normal.woff2`,
    weight: w,
  })),
  { family: theme.fonts.latin, file: "cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
];

export const PAPER_TEXTURE = staticFile("textures/paper.png");

let started = false;
export const loadAssets = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("Loading fonts and paper texture");
  const fonts = FACES.map((f) => {
    const face = new FontFace(f.family, `url(${staticFile("fonts/" + f.file)}) format('woff2')`, {
      weight: f.weight,
      style: f.style ?? "normal",
      unicodeRange: f.range,
    });
    return face.load().then((loaded) => {
      document.fonts.add(loaded);
    });
  });
  const texture = new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("paper texture failed to load"));
    img.src = PAPER_TEXTURE;
  });
  Promise.all([...fonts, texture])
    // force every unicode-range subset to load, then let rendering start
    .then(() => Promise.all([document.fonts.load(`700 40px ${theme.fonts.arabic}`, "مﷺ"), document.fonts.ready]))
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      throw err;
    });
};
