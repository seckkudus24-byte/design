// Télécharge les frontières Natural Earth (domaine public) et extrait
// les pays utilisés par la vidéo dans public/geo/*.json.
import fs from "node:fs";
import path from "node:path";

const BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/";
const CACHE = "cache";
const OUT = "public/geo";

// id utilisé dans le projet -> code ADM0_A3 / GU_A3 (map units Natural Earth)
const UNITS = {
  COG: "COG", COD: "COD", GMB: "GMB", SEN: "SEN", TGO: "TGO",
  BEN: "BEN", GHA: "GHA", GAZ: "GAZ", WEB: "WEB", AGO: "AGO", ISR: "ISR",
};

async function get(file) {
  const p = path.join(CACHE, file);
  if (!fs.existsSync(p)) {
    console.log("téléchargement", file);
    const r = await fetch(BASE + file);
    if (!r.ok) throw new Error(`${file}: HTTP ${r.status}`);
    fs.writeFileSync(p, Buffer.from(await r.arrayBuffer()));
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const round = (g) => JSON.parse(JSON.stringify(g, (k, v) => (typeof v === "number" ? Math.round(v * 1e4) / 1e4 : v)));

const units = await get("ne_10m_admin_0_map_units.geojson");
fs.mkdirSync(OUT, { recursive: true });
for (const [id, code] of Object.entries(UNITS)) {
  const f = units.features.find((f) => f.properties.GU_A3 === code || f.properties.ADM0_A3 === code && !["WEB","GAZ"].includes(code));
  if (!f) throw new Error("introuvable : " + id);
  fs.writeFileSync(path.join(OUT, id + ".json"), JSON.stringify({ type: "Feature", properties: { id, name: f.properties.NAME_FR || f.properties.NAME }, geometry: round(f.geometry) }));
  console.log(id, f.properties.NAME, f.properties.NAME_FR);
}

// Afrique entière (1:50M, plus léger) pour la séquence d'ouverture.
const c50 = await get("ne_50m_admin_0_countries.geojson");
const africa = c50.features.filter((f) => f.properties.CONTINENT === "Africa");
fs.writeFileSync(path.join(OUT, "AFRICA.json"), JSON.stringify({ type: "FeatureCollection", features: africa.map((f) => ({ type: "Feature", properties: { id: f.properties.ADM0_A3 }, geometry: round(f.geometry) })) }));
console.log("Afrique :", africa.length, "pays");

// Littoraux : plus longue suite de sommets du contour qui ne touchent aucun autre pays.
const COASTS = ["COG", "COD", "GMB", "TGO", "GAZ"];
const key = (p) => `${Math.round(p[0] * 300)},${Math.round(p[1] * 300)}`;
for (const id of COASTS) {
  const self = units.features.find((f) => f.properties.GU_A3 === id || (f.properties.ADM0_A3 === id && !["WEB", "GAZ"].includes(id)));
  const others = new Set();
  for (const f of units.features) {
    if (f === self) continue;
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) for (const ring of poly) for (const p of ring) {
      for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) others.add(`${Math.round(p[0] * 300) + dx},${Math.round(p[1] * 300) + dy}`);
    }
  }
  const polys = self.geometry.type === "Polygon" ? [self.geometry.coordinates] : self.geometry.coordinates;
  const ring = polys.map((p) => p[0]).sort((a, b) => b.length - a.length)[0].slice(0, -1);
  const free = ring.map((p) => !others.has(key(p)));
  // rotation pour démarrer sur un sommet frontalier, puis plus longue suite « libre »
  const s0 = free.findIndex((v) => !v);
  let best = [], cur = [];
  for (let k = 0; k <= ring.length; k++) {
    const i = (s0 + k) % ring.length;
    if (free[i] && k < ring.length) cur.push(i);
    else { if (cur.length > best.length) best = cur; cur = []; }
  }
  // le point frontière de chaque extrémité appartient aussi à la côte
  const n = ring.length;
  best = [(best[0] - 1 + n) % n, ...best, (best.at(-1) + 1) % n].map((i) => ring[i]);
  fs.writeFileSync(path.join(OUT, `coast_${id}.json`), JSON.stringify(round(best)));
  let km = 0;
  for (let i = 1; i < best.length; i++) {
    const [a, b] = [best[i - 1], best[i]], R = 6371, r = Math.PI / 180;
    const dlat = (b[1] - a[1]) * r, dlon = (b[0] - a[0]) * r;
    km += 2 * R * Math.asin(Math.sqrt(Math.sin(dlat / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dlon / 2) ** 2));
  }
  console.log(`côte ${id}: ${best.length} sommets, ${km.toFixed(0)} km (tracé 1:10M), de ${best[0]} à ${best.at(-1)}`);
}
