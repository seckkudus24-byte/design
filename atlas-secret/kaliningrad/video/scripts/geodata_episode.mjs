// Données géographiques des scènes 3 à 13 → public/geo/ep/*.json
// Sources : Natural Earth 1:10M (domaine public) ; historical-basemaps (A. Ourednik, GPL-3.0, 1930,
// précision « échelle continentale », affichée en zones adoucies) ; calculs géodésiques WGS84.
import fs from "node:fs";
import path from "node:path";
const OUT = "public/geo/ep"; fs.mkdirSync(OUT, { recursive: true });
const BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/";
async function get(file) {
  const p = path.join("cache", file);
  if (!fs.existsSync(p)) { const r = await fetch(BASE + file); if (!r.ok) throw new Error(file); fs.writeFileSync(p, Buffer.from(await r.arrayBuffer())); }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
const r5 = (v) => Math.round(v * 1e5) / 1e5;
const save = (n, g) => fs.writeFileSync(path.join(OUT, n + ".json"), JSON.stringify(g, (k, v) => (typeof v === "number" ? r5(v) : v)));
const polysOf = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);
const inBox = (p, b) => p[0] >= b[0] && p[0] <= b[2] && p[1] >= b[1] && p[1] <= b[3];
function clipRing(ring, [x0, y0, x1, y1]) {
  const E = [(p) => p[0] >= x0, (p) => p[0] <= x1, (p) => p[1] >= y0, (p) => p[1] <= y1];
  const I = [(a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])], (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])],
    (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0], (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]];
  let out = ring;
  for (let k = 0; k < 4; k++) { const inp = out; out = []; if (!inp.length) break;
    for (let i = 0; i < inp.length; i++) { const c = inp[i], p = inp[(i + inp.length - 1) % inp.length], ci = E[k](c), pi = E[k](p);
      if (ci) { if (!pi) out.push(I[k](p, c)); out.push(c); } else if (pi) out.push(I[k](p, c)); } }
  return out;
}
const BOX = [5, 44, 45, 66];
const clipPolys = (ps, box = BOX) => ps.map((p) => p.map((r) => clipRing(r, box)).filter((r) => r.length > 3)).filter((p) => p.length);

const units = await get("ne_10m_admin_0_map_units.geojson");
const A3 = (a3) => units.features.filter((f) => f.properties.ADM0_A3 === a3).flatMap((f) => polysOf(f.geometry));
for (const a3 of ["UKR", "FIN", "DEU", "SWE"]) save(a3, { type: "MultiPolygon", coordinates: clipPolys(A3(a3)) });

// Terres émergées (masque pour découper les zones historiques sur le vrai littoral)
const land = await get("ne_10m_land.geojson");
const LBOX = [8, 47, 34, 62];
save("LAND", { type: "MultiPolygon", coordinates: clipPolys(land.features.flatMap((f) => polysOf(f.geometry)).filter((p) => p[0].some((q) => inBox(q, LBOX))), LBOX) });

// Lignes de frontières par paire de pays
const lines = await get("ne_10m_admin_0_boundary_lines_land.geojson");
const pair = (a, b) => lines.features.filter((f) => f.properties.FEATURECLA === "International boundary (verify)" &&
  ((f.properties.ADM0_LEFT === a && f.properties.ADM0_RIGHT === b) || (f.properties.ADM0_LEFT === b && f.properties.ADM0_RIGHT === a)))
  .flatMap((f) => (f.geometry.type === "LineString" ? [f.geometry.coordinates] : f.geometry.coordinates));
const names = [...new Set(lines.features.flatMap((f) => [f.properties.ADM0_LEFT, f.properties.ADM0_RIGHT]))];
const n = (s) => names.find((x) => x === s) || console.log("pays introuvable :", s) || s;
save("L_PL_LT", { type: "MultiLineString", coordinates: pair(n("Poland"), n("Lithuania")) });
// Limites entre républiques soviétiques de la zone (aujourd'hui frontières d'État)
const SOV = ["Russia", "Lithuania", "Latvia", "Estonia", "Belarus", "Ukraine"].map(n);
const sov = [];
for (let i = 0; i < SOV.length; i++) for (let j = i + 1; j < SOV.length; j++) sov.push(...pair(SOV[i], SOV[j]));
save("L_SOV", { type: "MultiLineString", coordinates: sov.map((l) => l.filter((p) => inBox(p, BOX))).filter((l) => l.length > 1) });

// Oblast : frontière terrestre (Pologne + Lituanie) et côte (le reste du contour)
const kal = JSON.parse(fs.readFileSync("public/geo/KAL.json", "utf8")).coordinates[0][0];
const landB = [...pair(n("Russia"), n("Poland")), ...pair(n("Russia"), n("Lithuania"))].filter((l) => l.some((p) => p[0] < 23 && p[1] < 56));
const key = (p) => `${Math.round(p[0] * 400)},${Math.round(p[1] * 400)}`;
const near = new Set(); for (const l of landB) for (const p of l) for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) near.add(`${Math.round(p[0] * 400) + dx},${Math.round(p[1] * 400) + dy}`);
const coast = []; let cur = [];
for (const p of kal) { if (!near.has(key(p))) cur.push(p); else { if (cur.length > 1) coast.push(cur); cur = []; } }
if (cur.length > 1) coast.push(cur);
save("L_KAL_LAND", { type: "MultiLineString", coordinates: landB });
save("L_KAL_COAST", { type: "MultiLineString", coordinates: coast });
// Ligne de partage de 1945 = frontière actuelle oblast–Pologne (accord polono-soviétique du 16 août 1945)
save("L_1945", { type: "MultiLineString", coordinates: pair(n("Russia"), n("Poland")).filter((l) => l.some((p) => p[0] < 23 && p[1] < 56)) });

// Frontières historiques de 1930 (historical-basemaps), découpées à la zone utile
const h = JSON.parse(fs.readFileSync("cache/hist/world_1930.geojson", "utf8"));
const H = (name) => clipPolys(h.features.filter((f) => f.properties.NAME === name).flatMap((f) => polysOf(f.geometry)));
for (const [id, name] of [["H_DE", "Germany"], ["H_EP", "East Prussia"], ["H_PL", "Poland"], ["H_DZ", "Danzig"], ["H_LT", "Lithuania"]])
  save(id, { type: "MultiPolygon", coordinates: H(name) });

// Cercle géodésique de 500 km autour de Tcherniakhovsk (152e brigade de missiles, Iskander)
const dest = ([lon, lat], km, brg) => { const R = 6371.0088, r = Math.PI / 180, d = km / R, t = brg * r, p1 = lat * r, l1 = lon * r;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(t));
  const l2 = l1 + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2)); return [l2 / r, p2 / r]; };
const CH = [21.8117, 54.6339];
save("C_ISKANDER", { center: CH, km: 500, ring: Array.from({ length: 181 }, (_, i) => dest(CH, 500, i * 2)) });
console.log("données de l'épisode écrites dans", OUT, "| côte de l'oblast :", coast.length, "tronçon(s)");
