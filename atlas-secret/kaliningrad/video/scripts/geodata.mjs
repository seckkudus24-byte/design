// Données géographiques réelles (Natural Earth 1:10M, domaine public) → public/geo/
//  - polygones : oblast de Kaliningrad, Russie continentale (découpée à l'Europe), Pologne, Lituanie…
//  - lignes de frontières terrestres officielles (pas de doublon le long des côtes)
import fs from "node:fs";
import path from "node:path";

const BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/";
const OUT = "public/geo";
const BOX = [5, 40, 75, 72]; // zone utile (lng min, lat min, lng max, lat max)
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync("cache", { recursive: true });

async function get(file) {
  const p = path.join("cache", file);
  if (!fs.existsSync(p)) {
    console.log("téléchargement", file);
    const r = await fetch(BASE + file);
    if (!r.ok) throw new Error(file + " HTTP " + r.status);
    fs.writeFileSync(p, Buffer.from(await r.arrayBuffer()));
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
const r4 = (v) => Math.round(v * 1e4) / 1e4;
const polysOf = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);

// Découpe d'un anneau par un rectangle (Sutherland–Hodgman)
function clipRing(ring, [x0, y0, x1, y1]) {
  const edges = [
    (p) => p[0] >= x0, (p) => p[0] <= x1, (p) => p[1] >= y0, (p) => p[1] <= y1,
  ];
  const inter = [
    (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])],
    (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])],
    (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0],
    (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1],
  ];
  let out = ring;
  for (let k = 0; k < 4; k++) {
    const inp = out; out = [];
    if (!inp.length) break;
    for (let i = 0; i < inp.length; i++) {
      const cur = inp[i], prev = inp[(i + inp.length - 1) % inp.length];
      const ci = edges[k](cur), pi = edges[k](prev);
      if (ci) { if (!pi) out.push(inter[k](prev, cur)); out.push(cur); }
      else if (pi) out.push(inter[k](prev, cur));
    }
  }
  return out;
}
const inBox = (p, b) => p[0] >= b[0] && p[0] <= b[2] && p[1] >= b[1] && p[1] <= b[3];
const save = (name, geom) => {
  fs.writeFileSync(path.join(OUT, name + ".json"), JSON.stringify(JSON.parse(JSON.stringify(geom), (k, v) => (typeof v === "number" ? r4(v) : v))));
};

const units = await get("ne_10m_admin_0_map_units.geojson");
const byA3 = (a3) => units.features.filter((f) => f.properties.ADM0_A3 === a3);

// Russie : séparation oblast / continent
const rus = byA3("RUS").flatMap((f) => polysOf(f.geometry));
const KAL_BOX = [19, 54, 23, 56];
const kal = rus.filter((p) => p[0].every((q) => inBox(q, KAL_BOX)));
// La Crimée, annexée en 2014, reste internationalement reconnue comme ukrainienne :
// elle est exclue du territoire russe colorié (Natural Earth la rattache à la Russie de fait).
const CRIMEA_BOX = [32, 44, 37, 46.5];
const main = rus.filter((p) => !p[0].every((q) => inBox(q, KAL_BOX)) && !p[0].every((q) => inBox(q, CRIMEA_BOX)))
  .map((p) => p.map((ring) => clipRing(ring, BOX)).filter((r) => r.length > 3))
  .filter((p) => p.length);
save("KAL", { type: "MultiPolygon", coordinates: kal });
save("RUS_MAIN", { type: "MultiPolygon", coordinates: main });
console.log("Kaliningrad :", kal.length, "polygones ; Russie continentale :", main.length);

for (const a3 of ["POL", "LTU", "LVA", "BLR", "EST"]) {
  const ps = byA3(a3).flatMap((f) => polysOf(f.geometry));
  save(a3, { type: "MultiPolygon", coordinates: ps });
  console.log(a3, ps.length, "polygones");
}

// Frontières terrestres (lignes officielles), découpées à la zone utile
const lines = await get("ne_10m_admin_0_boundary_lines_land.geojson");
const segs = [];
// Seules les frontières internationales reconnues sont tracées (pas les lignes « disputées » ou « de contrôle »).
for (const f of lines.features.filter((f) => f.properties.FEATURECLA === "International boundary (verify)")) {
  const ls = f.geometry.type === "LineString" ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const l of ls) {
    let cur = [];
    for (const p of l) {
      if (inBox(p, BOX)) cur.push(p);
      else if (cur.length) { if (cur.length > 1) segs.push(cur); cur = []; }
    }
    if (cur.length > 1) segs.push(cur);
  }
}
const BBOX = [8, 46, 42, 64];
for (let i = segs.length - 1; i >= 0; i--) if (!segs[i].some((p) => inBox(p, BBOX))) segs.splice(i, 1);
save("BORDERS", { type: "MultiLineString", coordinates: segs });
console.log("frontières :", segs.length, "segments");

// Contrôles de géographie (distances à vol d'oiseau)
const R = 6371, rad = Math.PI / 180;
const hav = (a, b) => 2 * R * Math.asin(Math.sqrt(Math.sin((b[1] - a[1]) * rad / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin((b[0] - a[0]) * rad / 2) ** 2));
const kalPts = kal.flatMap((p) => p[0]);
const mainPts = main.flatMap((p) => p[0]).filter((q) => q[0] < 32 && q[1] < 60);
let best = [1e9];
for (const a of kalPts) for (const b of mainPts) { const d = hav(a, b); if (d < best[0]) best = [d, a, b]; }
fs.writeFileSync(path.join(OUT, "measure.json"), JSON.stringify({ km: Math.round(best[0]), from: best[1], to: best[2] }));
console.log(`distance la plus courte oblast → Russie continentale : ${best[0].toFixed(1)} km`, best[1], "→", best[2]);
