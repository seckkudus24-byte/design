// Mesure du temps de rendu d'une image selon les réglages (inputProps).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "node:path";
import { start } from "./tileserver.mjs";
const server = await start();
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { browserExecutable: "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", chromiumOptions: { gl: "angle" } });
const configs = JSON.parse(process.argv[2]);
const frames = JSON.parse(process.argv[3]);
for (const props of configs) {
  const composition = await selectComposition({ serveUrl, id: "Littoraux", puppeteerInstance: browser, inputProps: props });
  // échauffement (chargement carte + tuiles)
  await renderStill({ composition, serveUrl, frame: frames[0], output: "out/bench_warm.jpg", imageFormat: "jpeg", puppeteerInstance: browser, inputProps: props, timeoutInMilliseconds: 400000 });
  const t = Date.now();
  for (const f of frames) await renderStill({ composition, serveUrl, frame: f, output: `out/bench_${f}.jpg`, imageFormat: "jpeg", puppeteerInstance: browser, inputProps: props, timeoutInMilliseconds: 400000 });
  console.log(JSON.stringify(props), ((Date.now() - t) / frames.length / 1000).toFixed(2), "s/image");
}
await browser.close({ silent: true }); server.close();
