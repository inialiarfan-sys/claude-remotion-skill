// Bundles once and renders the given frames of a composition as PNG stills,
// for the visual verification pass: node scripts/stills.mjs <CompId> <outDir> f1 f2 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "node:path";
import { mkdirSync } from "node:fs";

const [comp, outDir, ...frames] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER || "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id: comp, puppeteerInstance: browser });
for (const f of frames) {
  const out = path.join(outDir, `${comp}_${String(f).padStart(4, "0")}.png`);
  await renderStill({ composition, serveUrl, frame: Number(f), output: out, puppeteerInstance: browser, overwrite: true });
  console.log(out);
}
await browser.close({ silent: true });
