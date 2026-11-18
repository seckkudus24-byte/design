// Mixage audio du prototype avec FFmpeg (voix aux instants calés, musique, souffle) → out/parts/audio.wav
// Mêmes réglages que src/Video.tsx (volumes, enveloppe de la musique, position du souffle).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const n = JSON.parse(fs.readFileSync("src/config/narration.json", "utf8"));
const tm = JSON.parse(fs.readFileSync("src/generated/timings.json", "utf8"));
let t = n.lead; const at = {};
for (const s of n.segments) { at[s.id] = { start: t, end: t + tm[s.id] }; t += tm[s.id] + s.pauseAfter; }
const total = t;
// souffle : WHOOSH_AT = "s1c@0.2", déclenché 0,6 s avant
const w = at.s1c.start + (at.s1c.end - at.s1c.start) * 0.2 - 0.6;
const inputs = [], filters = [], labels = [];
n.segments.forEach((s, i) => {
  inputs.push("-i", `public/voice/${s.id}.wav`);
  const ms = Math.round(at[s.id].start * 1000);
  filters.push(`[${i}]aformat=channel_layouts=stereo,adelay=${ms}|${ms}[v${i}]`); labels.push(`[v${i}]`);
});
const k = n.segments.length;
inputs.push("-i", "public/audio/music.wav", "-i", "public/audio/whoosh.wav");
filters.push(`[${k}]atrim=0:${total.toFixed(3)},volume=0.22,afade=t=in:d=0.5,afade=t=out:st=${(total - 1).toFixed(3)}:d=1[m]`);
filters.push(`[${k + 1}]volume=0.45,adelay=${Math.round(w * 1000)}|${Math.round(w * 1000)}[w]`);
filters.push(`${labels.join("")}[m][w]amix=inputs=${k + 2}:normalize=0:duration=longest,atrim=0:${total.toFixed(3)}[out]`);
fs.mkdirSync("out/parts", { recursive: true });
execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", filters.join(";"), "-map", "[out]", "-ar", "48000", "out/parts/audio.wav"]);
console.log("audio mixé :", total.toFixed(2), "s");
