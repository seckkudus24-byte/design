// Rendu final, découpé en morceaux reprenables :
//   1. vidéo muette par tranches  → out/parts/part_N.mp4 (une tranche déjà faite est sautée)
//   2. piste audio seule          → out/parts/audio.wav
//   3. assemblage + normalisation audio (-14 LUFS) → out/littoraux_fr.mp4 (+ out/littoraux_fr.srt)
// Usage : npm run render   (PARTS=4 CONCURRENCY=4 ; ONLY=2 pour ne rendre que la tranche 2)
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { start } from "./tileserver.mjs";

const OUT = "out/littoraux_fr.mp4";
const PARTS = Number(process.env.PARTS || 4);
const ONLY = process.env.ONLY ? Number(process.env.ONLY) : null;
fs.mkdirSync("out/parts", { recursive: true });

const server = await start();
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const chromiumOptions = { gl: "angle" };
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const composition = await selectComposition({ serveUrl, id: "Littoraux", browserExecutable, chromiumOptions });
const N = composition.durationInFrames;
const common = { composition, serveUrl, browserExecutable, chromiumOptions, timeoutInMilliseconds: 400000 };

const t0 = Date.now();
for (let i = 0; i < PARTS; i++) {
  if (ONLY !== null && ONLY !== i) continue;
  const file = `out/parts/part_${i}.mp4`;
  if (fs.existsSync(file)) { console.log("déjà fait :", file); continue; }
  const a = Math.floor((N * i) / PARTS), b = Math.floor((N * (i + 1)) / PARTS) - 1;
  let last = -1;
  await renderMedia({
    ...common, codec: "h264", crf: 16, muted: true, frameRange: [a, b], outputLocation: file + ".tmp.mp4",
    concurrency: Number(process.env.CONCURRENCY || 4), imageFormat: "jpeg", jpegQuality: 94,
    onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`tranche ${i + 1}/${PARTS} (images ${a}–${b}) : ${p * 10} %  (${Math.round((Date.now() - t0) / 1000)} s)`); } },
  });
  fs.renameSync(file + ".tmp.mp4", file);
}
const parts = Array.from({ length: PARTS }, (_, i) => `out/parts/part_${i}.mp4`);
if (!parts.every((f) => fs.existsSync(f))) { server.close(); console.log("tranches restantes à rendre"); process.exit(0); }

if (!fs.existsSync("out/parts/audio.wav")) {
  await renderMedia({ ...common, codec: "wav", outputLocation: "out/parts/audio.wav" });
}
server.close();

// Assemblage sans ré-encodage des tranches, puis encodage final + audio normalisé.
fs.writeFileSync("out/parts/list.txt", parts.map((p) => `file '${path.basename(p)}'`).join("\n"));
execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "out/parts/list.txt", "-c", "copy", "out/parts/video.mp4"]);
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", "out/parts/video.mp4", "-i", "out/parts/audio.wav", "-map", "0:v", "-map", "1:a",
  "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30",
  "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT]);

// Sous-titres SRT (mêmes temps que ceux incrustés).
const n = JSON.parse(fs.readFileSync("src/config/narration.json", "utf8"));
const tm = JSON.parse(fs.readFileSync("src/generated/timings.json", "utf8"));
const ts = (s) => new Date(Math.max(0, s) * 1000).toISOString().slice(11, 23).replace(".", ",");
let t = 0.25, srt = "";
n.lines.forEach((l, i) => { const e = t + tm[l.id]; srt += `${i + 1}\n${ts(t)} --> ${ts(e + 0.25)}\n${l.text.replaceAll("**", "")}\n\n`; t = e + (l.pauseAfter ?? n.gapAfter); });
fs.writeFileSync("out/littoraux_fr.srt", srt);
console.log("✓", OUT, "+ out/littoraux_fr.srt", `en ${Math.round((Date.now() - t0) / 1000)} s`);
