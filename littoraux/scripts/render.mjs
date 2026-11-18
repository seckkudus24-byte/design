// Rendu final : vidéo Remotion → normalisation audio (-14 LUFS) → MP4 + sous-titres SRT.
// Usage : npm run render   (CONCURRENCY=4 npm run render pour aller plus vite)
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { start } from "./tileserver.mjs";

const OUT = "out/littoraux_fr.mp4";
const server = await start();
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const chromiumOptions = { gl: "angle" };
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const composition = await selectComposition({ serveUrl, id: "Littoraux", browserExecutable, chromiumOptions });
const t0 = Date.now();
let last = -1;
await renderMedia({
  composition, serveUrl, codec: "h264", crf: 17, outputLocation: "out/raw.mp4",
  browserExecutable, chromiumOptions, concurrency: Number(process.env.CONCURRENCY || 3),
  imageFormat: "jpeg", jpegQuality: 92, timeoutInMilliseconds: 120000, audioCodec: "aac",
  onProgress: ({ progress }) => { const p = Math.floor(progress * 20); if (p !== last) { last = p; console.log(`${Math.round(progress * 100)} %  (${Math.round((Date.now() - t0) / 1000)} s)`); } },
});
server.close();

// Audio : normalisation -14 LUFS (standard TikTok/Reels), vidéo ré-encodée (CRF 20) pour un fichier plus léger.
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", "out/raw.mp4", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT]);

// Sous-titres SRT (mêmes temps que ceux incrustés).
const n = JSON.parse(fs.readFileSync("src/config/narration.json", "utf8"));
const tm = JSON.parse(fs.readFileSync("src/generated/timings.json", "utf8"));
const ts = (s) => new Date(Math.max(0, s) * 1000).toISOString().slice(11, 23).replace(".", ",");
let t = 0.25, srt = "";
n.lines.forEach((l, i) => { const e = t + tm[l.id]; srt += `${i + 1}\n${ts(t)} --> ${ts(e + 0.25)}\n${l.text.replaceAll("**", "")}\n\n`; t = e + (l.pauseAfter ?? n.gapAfter); });
fs.writeFileSync("out/littoraux_fr.srt", srt);
console.log("✓", OUT, "+ out/littoraux_fr.srt", `en ${Math.round((Date.now() - t0) / 1000)} s`);
