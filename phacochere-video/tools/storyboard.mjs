// Rend des images clés de la vidéo (storyboard) sans faire tout le rendu.
// Usage : node tools/storyboard.mjs <dossier_sortie> <frame> [<frame> ...]
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const [outDir, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = process.env.REMOTION_CHROME ?? null;
const composition = await selectComposition({serveUrl, id: 'PhacochereTikTok', browserExecutable});
for (const f of frames) {
  const output = path.join(outDir, `f${String(f).padStart(5, '0')}.png`);
  await renderStill({serveUrl, composition, frame: Number(f), output, scale: 0.5, browserExecutable});
  console.log(output);
}
