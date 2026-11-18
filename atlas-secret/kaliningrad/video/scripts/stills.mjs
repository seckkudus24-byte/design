// Images de contrôle : node scripts/stills.mjs 1.2 5 12.5 …  (temps en secondes)
// → out/stills/t_XX.XX.jpg + planche out/stills/planche.jpg
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { start } from "./tileserver.mjs";

const times = process.argv.slice(2).map(Number);
const server = await start();
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", {
  browserExecutable: "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
  chromiumOptions: { gl: "angle" },
});
const composition = await selectComposition({ serveUrl, id: "Prototype", puppeteerInstance: browser });
fs.mkdirSync("out/stills", { recursive: true });
const files = [];
for (const s of times) {
  const output = `out/stills/t_${s.toFixed(2)}.jpg`;
  await renderStill({ composition, serveUrl, frame: Math.min(composition.durationInFrames - 1, Math.round(s * 30)), output, imageFormat: "jpeg", puppeteerInstance: browser, timeoutInMilliseconds: 1500000 });
  files.push(output); console.log("✓", output);
}
await browser.close({ silent: true });
server.close();
if (files.length > 1) {
  const cols = Math.min(6, files.length);
  const args = files.flatMap((f) => ["-i", f]);
  const label = files.map((f, i) => `[${i}]scale=300:-1,drawtext=text='${path.basename(f, ".jpg").slice(2)}s':x=6:y=6:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`).join(";");
  const pad = (cols - (files.length % cols)) % cols;
  const pads = Array.from({ length: pad }, (_, i) => `color=black:s=300x534:d=1[p${i}]`).join(";");
  const all = [...files.map((_, i) => `[v${i}]`), ...Array.from({ length: pad }, (_, i) => `[p${i}]`)];
  const rows = Math.ceil(all.length / cols);
  const tile = `${all.join("")}xstack=inputs=${all.length}:layout=${all.map((_, i) => `${(i % cols) * 300}_${Math.floor(i / cols) * 534}`).join("|")}`;
  execFileSync("ffmpeg", ["-v", "error", "-y", ...args, "-filter_complex", [label, pads, tile].filter(Boolean).join(";"), "-frames:v", "1", "out/stills/planche.jpg"]);
  console.log("planche :", rows, "lignes");
}
