// Cale les scènes sur public/voix.mp3 en détectant les pauses de la voix.
// Usage : npm run sync   (puis vérifie/ajuste src/timings.json à la main si besoin)
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, writeFileSync} from 'node:fs';

const SCENE_COUNT = 8;
const MIN_SCENE = 3; // secondes
const file = 'public/voix.mp3';
if (!existsSync(file)) {
  console.error(`Fichier introuvable : ${file}`);
  process.exit(1);
}

const log = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'silencedetect=noise=-35dB:d=0.3', '-f', 'null', '-'], {
  encoding: 'utf8',
}).stderr;

const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], {encoding: 'utf8'}));
const silences = [];
let start = null;
for (const line of log.split('\n')) {
  const s = line.match(/silence_start: ([\d.]+)/);
  const e = line.match(/silence_end: ([\d.]+)/);
  if (s) start = Number(s[1]);
  if (e && start !== null) {
    silences.push({start, end: Number(e[1]), len: Number(e[1]) - start});
    start = null;
  }
}

// On garde les (SCENE_COUNT - 1) plus longues pauses, en évitant des scènes trop courtes.
const cuts = [];
for (const s of [...silences].sort((a, b) => b.len - a.len)) {
  const t = Math.max(s.start, s.end - 0.2); // la scène change juste avant la phrase suivante
  if (t < MIN_SCENE || duration - t < MIN_SCENE) continue;
  if (cuts.some((c) => Math.abs(c - t) < MIN_SCENE)) continue;
  cuts.push(t);
  if (cuts.length === SCENE_COUNT - 1) break;
}
cuts.sort((a, b) => a - b);

if (cuts.length < SCENE_COUNT - 1) {
  console.error(`Seulement ${cuts.length} pauses trouvées : remplis src/timings.json à la main.`);
  process.exit(1);
}

const starts = [0, ...cuts].map((t) => Math.round(t * 100) / 100);
writeFileSync('src/timings.json', JSON.stringify({starts}, null, 2) + '\n');
console.log(`Durée de la voix : ${duration.toFixed(2)} s`);
starts.forEach((t, i) => console.log(`Scène ${i + 1} : ${t.toFixed(2)} s`));
console.log('→ écrit dans src/timings.json');
