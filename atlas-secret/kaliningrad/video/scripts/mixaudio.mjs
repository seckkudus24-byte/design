// Mixage de l'épisode avec FFmpeg → out/parts/audio.wav (ou chemin en argument)
//  - voix : chaque segment à son instant (narration.json + timings)
//  - musique : s'efface sous la voix (compression déclenchée par la voix, « sidechain »)
//  - effets : public/audio/sfx.json
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const OUT = process.argv[2] || "out/parts/audio.wav";
const n = JSON.parse(fs.readFileSync("src/config/narration.json", "utf8"));
const tm = JSON.parse(fs.readFileSync("src/generated/timings.json", "utf8"));
const sfx = JSON.parse(fs.readFileSync("public/audio/sfx.json", "utf8"));
let t = n.lead; const at = {};
for (const s of n.segments) { at[s.id] = t; t += tm[s.id] + s.pauseAfter; }
const total = t;
const inputs = [], F = [], voice = [];
n.segments.forEach((s, i) => {
  inputs.push("-i", `public/voice/${s.id}.wav`);
  const ms = Math.round(at[s.id] * 1000);
  F.push(`[${i}]aformat=channel_layouts=stereo:sample_rates=48000,adelay=${ms}|${ms}[v${i}]`); voice.push(`[v${i}]`);
});
let k = n.segments.length;
F.push(`${voice.join("")}amix=inputs=${voice.length}:normalize=0:duration=longest,apad,atrim=0:${total.toFixed(3)},asplit=2[vo][key]`);
inputs.push("-i", "public/audio/music.wav");
F.push(`[${k}]aformat=channel_layouts=stereo:sample_rates=48000,atrim=0:${total.toFixed(3)},volume=0.30[mu]`);
F.push(`[mu][key]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=450:makeup=1[mud]`);
k++;
const fx = [];
sfx.forEach((e, i) => {
  inputs.push("-i", `public/audio/${e.f}.wav`);
  const ms = Math.max(0, Math.round(e.t * 1000));
  F.push(`[${k}]aformat=channel_layouts=stereo:sample_rates=48000,volume=${e.v},adelay=${ms}|${ms}[x${i}]`); fx.push(`[x${i}]`); k++;
});
F.push(`[vo][mud]${fx.join("")}amix=inputs=${2 + fx.length}:normalize=0:duration=first,atrim=0:${total.toFixed(3)}[out]`);
fs.mkdirSync("out/parts", { recursive: true });
execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", F.join(";"), "-map", "[out]", "-ar", "48000", OUT]);
console.log("audio mixé :", total.toFixed(2), "s →", OUT);
