// Rendu de l'épisode complet :
//  1. scènes 1–2 : images VALIDÉES reprises telles quelles (out/proto/video_scenes_1_2.mp4, 478 images),
//     ou rendues depuis la composition « Prototype » si ce fichier manque ;
//  2. scènes 3–13 : composition « Episode », images 478 → fin, par tranches reprenables (out/ep/part_N.mp4) ;
//  3. audio : scripts/mixaudio.mjs ; 4. assemblage + encodage final H.264/AAC, sonie -14 LUFS, sous-titres SRT.
// Usage : npm run render:episode   (PARTS=6 CONCURRENCY=4 ; ONLY=2 pour une seule tranche)
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { start } from "./tileserver.mjs";

const OUT = "out/kaliningrad_episode1.mp4";
const PARTS = Number(process.env.PARTS || 6);
const ONLY = process.env.ONLY ? Number(process.env.ONLY) : null;
fs.mkdirSync("out/ep", { recursive: true });
const server = await start();
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const chromiumOptions = { gl: "angle" };
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const common = { serveUrl, browserExecutable, chromiumOptions, timeoutInMilliseconds: 1500000 };
const t0 = Date.now();
const log = (s) => console.log(`${s}  (${Math.round((Date.now() - t0) / 1000)} s)`);

// 1. scènes 1–2
const PROTO = "out/proto/video_scenes_1_2.mp4";
const proto = await selectComposition({ ...common, id: "Prototype" });
if (!fs.existsSync(PROTO)) {
  log("scènes 1–2 absentes : rendu depuis la composition Prototype");
  await renderMedia({ ...common, composition: proto, codec: "h264", crf: 16, muted: true, outputLocation: PROTO, concurrency: Number(process.env.CONCURRENCY || 4), imageFormat: "jpeg", jpegQuality: 94 });
}
// 2. scènes 3–13
const ep = await selectComposition({ ...common, id: "Episode" });
const A = proto.durationInFrames, N = ep.durationInFrames;
for (let i = 0; i < PARTS; i++) {
  if (ONLY !== null && ONLY !== i) continue;
  const file = `out/ep/part_${i}.mp4`;
  if (fs.existsSync(file)) { log(`déjà fait : ${file}`); continue; }
  const a = A + Math.floor(((N - A) * i) / PARTS), b = A + Math.floor(((N - A) * (i + 1)) / PARTS) - 1;
  let last = -1;
  await renderMedia({
    ...common, composition: ep, codec: "h264", crf: 16, muted: true, frameRange: [a, b], outputLocation: file + ".tmp.mp4",
    concurrency: Number(process.env.CONCURRENCY || 4), imageFormat: "jpeg", jpegQuality: 94,
    onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; log(`tranche ${i + 1}/${PARTS} (images ${a}–${b}) : ${p * 10} %`); } },
  });
  fs.renameSync(file + ".tmp.mp4", file);
}
server.close();
const parts = Array.from({ length: PARTS }, (_, i) => `out/ep/part_${i}.mp4`);
if (!parts.every((f) => fs.existsSync(f))) { log("tranches restantes à rendre"); process.exit(0); }

// 3. audio
execFileSync("node", ["scripts/mixaudio.mjs", "out/ep/audio.wav"], { stdio: "inherit" });
// 4. assemblage (sans ré-encodage des tranches) puis encodage final
fs.writeFileSync("out/ep/list.txt", [path.resolve(PROTO), ...parts.map((p) => path.resolve(p))].map((p) => `file '${p}'`).join("\n"));
execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "out/ep/list.txt", "-c", "copy", "out/ep/video.mp4"]);
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", "out/ep/video.mp4", "-i", "out/ep/audio.wav", "-map", "0:v", "-map", "1:a",
  "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30", "-profile:v", "high",
  "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT]);
// sous-titres
const n = JSON.parse(fs.readFileSync("src/config/narration.json", "utf8"));
const tm = JSON.parse(fs.readFileSync("src/generated/timings.json", "utf8"));
const ts = (s) => new Date(Math.max(0, s) * 1000).toISOString().slice(11, 23).replace(".", ",");
let t = n.lead, srt = "";
n.segments.forEach((s, i) => { const e = t + tm[s.id]; srt += `${i + 1}\n${ts(t)} --> ${ts(e + 0.2)}\n${s.text.replaceAll("**", "")}\n\n`; t = e + s.pauseAfter; });
fs.writeFileSync("out/kaliningrad_episode1.srt", srt);
log(`✓ ${OUT} + out/kaliningrad_episode1.srt`);
