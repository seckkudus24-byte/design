// Mini serveur de tuiles satellites avec cache disque.
// La vidéo lit toujours http://localhost:PORT/sat/{z}/{x}/{y}.jpg ;
// le fournisseur réel se choisit ici (variables d'environnement) :
//   MAP_PROVIDER=eox      (défaut, Sentinel-2 cloudless, sans clé)
//     EOX_LAYER=s2cloudless-2020_3857 (défaut : mosaïque homogène, licence CC BY-NC-SA 4.0 = non commercial)
//     EOX_LAYER=s2cloudless_3857      (mosaïque 2016, CC BY 4.0 = usage commercial permis, quelques coutures de teinte)
//   MAP_PROVIDER=maptiler MAP_KEY=xxxx
//   MAP_PROVIDER=mapbox   MAP_KEY=xxxx
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

export const PORT = Number(process.env.TILE_PORT || 8787);
const provider = process.env.MAP_PROVIDER || "eox";
const key = process.env.MAP_KEY || "";
const eoxLayer = process.env.EOX_LAYER || "s2cloudless-2020_3857";
const UPSTREAM = {
  eox: (z, x, y) => `https://tiles.maps.eox.at/wmts/1.0.0/${eoxLayer}/default/g/${z}/${y}/${x}.jpg`,
  maptiler: (z, x, y) => `https://api.maptiler.com/tiles/satellite-v2/${z}/${x}/${y}.jpg?key=${key}`,
  mapbox: (z, x, y) => `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}.jpg90?access_token=${key}`,
}[provider];
if (!UPSTREAM) throw new Error("MAP_PROVIDER inconnu : " + provider);
const CACHE = path.resolve("cache/tiles", provider === "eox" ? eoxLayer : provider);
const pending = new Map();
// Au plus 12 téléchargements simultanés vers le fournisseur (évite blocages et limitations).
let active = 0; const queue = [];
const slot = () => new Promise((ok) => { if (active < 12) { active++; ok(); } else queue.push(ok); });
const release = () => { const next = queue.shift(); if (next) next(); else active--; };

async function tile(z, x, y) {
  const file = path.join(CACHE, `${z}/${x}/${y}.jpg`);
  if (fs.existsSync(file)) return fs.readFileSync(file);
  const k = file;
  if (!pending.has(k)) {
    pending.set(k, (async () => {
      for (let i = 0; i < 5; i++) {
        try {
          await slot();
          let r;
          try { r = await fetch(UPSTREAM(z, x, y), { signal: AbortSignal.timeout(20000) }); } finally { release(); }
          if (r.status === 404) return null;
          if (!r.ok) throw new Error("HTTP " + r.status);
          const buf = Buffer.from(await r.arrayBuffer());
          fs.mkdirSync(path.dirname(file), { recursive: true });
          fs.writeFileSync(file, buf);
          return buf;
        } catch (e) {
          if (i === 4) { console.error("tuile", z, x, y, e.message); return null; }
          await new Promise((s) => setTimeout(s, 500 * 2 ** i));
        }
      }
    })().finally(() => pending.delete(k)));
  }
  return pending.get(k);
}

export function start() {
  const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const m = req.url.match(/^\/sat\/(\d+)\/(\d+)\/(\d+)\.jpg/);
    if (!m) { res.writeHead(404).end(); return; }
    const buf = await tile(+m[1], +m[2], +m[3]);
    if (!buf) { res.writeHead(404).end(); return; }
    res.writeHead(200, { "Content-Type": "image/jpeg", "Cache-Control": "max-age=31536000" }).end(buf);
  });
  return new Promise((ok) => server.listen(PORT, () => { console.log(`tuiles (${provider}) : http://localhost:${PORT}/sat`); ok(server); }));
}

if (import.meta.url === `file://${process.argv[1]}`) start();
