// Mini serveur de tuiles satellites avec cache disque.
// La vidéo lit toujours http://localhost:PORT/sat/{z}/{x}/{y}.jpg ;
// le fournisseur réel se choisit ici (variables d'environnement) :
//   MAP_PROVIDER=eox      (défaut, Sentinel-2 cloudless, sans clé)
//     EOX_LAYER=s2cloudless_3857      (défaut : mosaïque 2016, CC BY 4.0 = usage commercial permis, crédit obligatoire)
//     EOX_LAYER=s2cloudless-2020_3857 (mosaïque 2020, CC BY-NC-SA 4.0 = usage NON commercial uniquement)
// Relief : /dem/{z}/{x}/{y}.png ← AWS Terrain Tiles (terrarium), sans clé, attribution requise.
//   MAP_PROVIDER=maptiler MAP_KEY=xxxx
//   MAP_PROVIDER=mapbox   MAP_KEY=xxxx
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";

export const PORT = Number(process.env.TILE_PORT || 8787);
const provider = process.env.MAP_PROVIDER || "eox";
const key = process.env.MAP_KEY || "";
const eoxLayer = process.env.EOX_LAYER || "s2cloudless_3857";
const UPSTREAM = {
  eox: (z, x, y) => `https://tiles.maps.eox.at/wmts/1.0.0/${eoxLayer}/default/g/${z}/${y}/${x}.jpg`,
  maptiler: (z, x, y) => `https://api.maptiler.com/tiles/satellite-v2/${z}/${x}/${y}.jpg?key=${key}`,
  mapbox: (z, x, y) => `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}.jpg90?access_token=${key}`,
}[provider];
if (!UPSTREAM) throw new Error("MAP_PROVIDER inconnu : " + provider);
const CACHE = path.resolve("cache/tiles", provider === "eox" ? eoxLayer : provider);
const DEM_CACHE = path.resolve("cache/tiles/dem");
const DEM = (z, x, y) => `https://elevation-tiles-prod.s3.amazonaws.com/terrarium/${z}/${x}/${y}.png`;
const pending = new Map();
// Au plus 12 téléchargements simultanés vers le fournisseur (évite blocages et limitations).
let active = 0; const queue = [];
const slot = () => new Promise((ok) => { if (active < 12) { active++; ok(); } else queue.push(ok); });
const release = () => { const next = queue.shift(); if (next) next(); else active--; };

async function tile(z, x, y, dem = false) {
  const file = dem ? path.join(DEM_CACHE, `${z}/${x}/${y}.png`) : path.join(CACHE, `${z}/${x}/${y}.jpg`);
  if (fs.existsSync(file)) return fs.readFileSync(file);
  const k = file;
  if (!pending.has(k)) {
    pending.set(k, (async () => {
      for (let i = 0; i < 5; i++) {
        try {
          await slot();
          let r;
          try { r = await fetch(dem ? DEM(z, x, y) : UPSTREAM(z, x, y), { signal: AbortSignal.timeout(20000) }); } finally { release(); }
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

// Ombrage du relief précalculé (scripts/shade.py) à partir des tuiles d'altitude.
const SHADE_CACHE = path.resolve("cache/tiles/shade");
const shading = new Map();
async function shade(z, x, y) {
  const file = path.join(SHADE_CACHE, `${z}/${x}/${y}.png`);
  if (fs.existsSync(file)) return fs.readFileSync(file);
  if (!shading.has(file)) {
    shading.set(file, (async () => {
      const n = 2 ** z, jobs = [];
      for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) {
        const ty = y + dy; if (ty >= 0 && ty < n) jobs.push(tile(z, (x + dx + n) % n, ty, true));
      }
      await Promise.all(jobs);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      await new Promise((ok, ko) => execFile("python3", ["-I", "scripts/shade.py", z, x, y, DEM_CACHE, file], (e) => (e ? ko(e) : ok())));
      return fs.readFileSync(file);
    })().catch((e) => { console.error("ombrage", z, x, y, e.message); return null; }).finally(() => shading.delete(file)));
  }
  return shading.get(file);
}

// Tuile satellite avec relief intégré (une seule couche à dessiner : rendu bien plus rapide).
const RELIEF_MAX_Z = 11; // au-delà, terrain plat à cette échelle : imagerie seule
const SATR_CACHE = path.resolve("cache/tiles", (provider === "eox" ? eoxLayer : provider) + "+relief");
const composing = new Map();
async function satRelief(z, x, y) {
  if (z > RELIEF_MAX_Z) return tile(z, x, y);
  const file = path.join(SATR_CACHE, `${z}/${x}/${y}.jpg`);
  if (fs.existsSync(file)) return fs.readFileSync(file);
  if (!composing.has(file)) {
    composing.set(file, (async () => {
      const [sat, sh] = await Promise.all([tile(z, x, y), shade(z, x, y)]);
      if (!sat) return null;
      if (!sh) return sat;
      fs.mkdirSync(path.dirname(file), { recursive: true });
      await new Promise((ok, ko) => execFile("python3", ["-I", "scripts/compose.py", path.join(CACHE, `${z}/${x}/${y}.jpg`), path.join(SHADE_CACHE, `${z}/${x}/${y}.png`), file], (e) => (e ? ko(e) : ok())));
      return fs.readFileSync(file);
    })().catch((e) => { console.error("relief", z, x, y, e.message); return null; }).finally(() => composing.delete(file)));
  }
  return composing.get(file);
}

export function start() {
  const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const m = req.url.match(/^\/(satr|sat|dem|shade)\/(\d+)\/(\d+)\/(\d+)\.(jpg|png)/);
    if (!m) { res.writeHead(404).end(); return; }
    const dem = m[1] === "dem" || m[1] === "shade";
    const buf = m[1] === "shade" ? await shade(+m[2], +m[3], +m[4]) : m[1] === "satr" ? await satRelief(+m[2], +m[3], +m[4]) : await tile(+m[2], +m[3], +m[4], dem);
    if (!buf) { res.writeHead(404).end(); return; }
    res.writeHead(200, { "Content-Type": dem ? "image/png" : "image/jpeg", "Cache-Control": "max-age=31536000" }).end(buf);
  });
  return new Promise((ok) => server.listen(PORT, () => { console.log(`tuiles (${provider}) : http://localhost:${PORT}/sat`); ok(server); }));
}

if (import.meta.url === `file://${process.argv[1]}`) start();
