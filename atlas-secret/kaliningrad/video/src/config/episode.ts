// ─────────────────────────────────────────────────────────────────────────────
// ÉPISODE COMPLET — scènes 3 à 13 (plan de production V2), à la suite des scènes 1–2 validées.
// Les scènes 1–2 ne sont PAS re-rendues : le film réutilise leurs 478 images (voir scripts/render-episode.mjs).
// Temps relatifs aux segments de narration.json ("s6c@0.5", "s9d:end+0.3"…).
// Sources des données affichées : voir README (section « Épisode complet »).
// ─────────────────────────────────────────────────────────────────────────────
import type { Key } from "../camera";
import { mx, my, cameraSpline } from "../camera";
import type { Overlay } from "../overlays/types";
import type { EpOverlay } from "../overlays/episodeTypes";
import { CAMERA as PROTO_CAMERA, OVERLAYS as PROTO_OVERLAYS } from "./scenes";
import { STYLE } from "./style";
import { T } from "../timeline";
import { ISKANDER, SUWALKI_M } from "../map/geoEpisode";
import ARCH from "../generated/archives.json";

const has = (k: string) => k in (ARCH as Record<string, unknown>);
const credit = (k: string) => {
  const c = (ARCH as Record<string, any>)[k];
  if (!c) return "";
  const art = String(c.Artist || "").replace(/\s*\(.*?\)\s*/g, " ").trim().slice(0, 40);
  const lic = c.LicenseShortName === "Public domain" ? "domaine public" : c.LicenseShortName;
  return `${c.legende} · ${art ? art + " · " : ""}${lic}`;
};

// ── Jonction avec la scène 2 : même position ET même vitesse que la dernière image validée ──
export const PROTO_END = T("s2b:end") + 1.0; // = fin de la composition « Prototype »
const pk = PROTO_CAMERA.map((k) => ({ ...k, at: k.at === "end" ? PROTO_END : k.at }));
const a = pk[pk.length - 2], b = pk[pk.length - 1];
const v = (k: Key) => [mx(k.lng), my(k.lat), k.zoom, k.pitch ?? 0, k.bearing ?? 0];
const dt = T(b.at) - T(a.at);
const endSlope = v(b).map((x, i) => ((x - v(a)[i]) / dt) * 0.5);

export const CAMERA_EP: Key[] = [
  ...pk.slice(0, -1),
  { ...b, slope: endSlope },
  // 3 — plongée lente vers Kaliningrad vue du ciel (≈ 3 s), puis poussée
  { at: "s3b@0.2", lng: 22.5, lat: 55.2, zoom: 6.25, pitch: 26, bearing: -2 },
  { at: "s3b:end+0.2", lng: 20.8, lat: 54.8, zoom: 7.55, pitch: 33, bearing: 2 },
  { at: "s4a:end", lng: 20.56, lat: 54.73, zoom: 8.25, pitch: 36, bearing: 4 },
  // 4 — recul à l'échelle de la Prusse, travelling latéral continu
  { at: "s4b@0.6", lng: 20.95, lat: 54.4, zoom: 7.3, pitch: 28, bearing: 2 },
  { at: "s4c:end", lng: 21.5, lat: 54.2, zoom: 6.85, pitch: 24, bearing: -2 },
  // 5 — Berlin et Königsberg dans le même cadre, dérive lente
  { at: "s5b@0.2", lng: 17.6, lat: 53.7, zoom: 5.8, pitch: 16, bearing: 0 },
  { at: "s5b:end", lng: 17.1, lat: 53.6, zoom: 5.72, pitch: 15, bearing: -1 },
  // 6 — la guerre : descente vers la ville pendant « Puis vient la guerre », puis recul
  { at: "s6b@0.6", lng: 20.47, lat: 54.72, zoom: 8.55, pitch: 33, bearing: 0 },
  { at: "s6b:end+0.1", lng: 20.5, lat: 54.71, zoom: 8.85, pitch: 35, bearing: 2 },
  { at: "s6c@0.6", lng: 20.52, lat: 54.68, zoom: 8.2, pitch: 30, bearing: 0 },
  { at: "s6c:end+0.3", lng: 20.6, lat: 54.6, zoom: 7.7, pitch: 26, bearing: -1 },
  // 7 — Potsdam : partage, mouvement continu le long de la ligne
  { at: "s7a@0.5", lng: 20.65, lat: 54.2, zoom: 6.85, pitch: 21, bearing: 0 },
  { at: "s7b@0.5", lng: 21.15, lat: 54.12, zoom: 6.75, pitch: 22, bearing: -2 },
  { at: "s7c:end", lng: 21.55, lat: 54.05, zoom: 6.85, pitch: 24, bearing: -3 },
  // 8 — descente vers le nom, puis recul pour les flux
  { at: "s8a@0.75", lng: 20.55, lat: 54.7, zoom: 8.45, pitch: 32, bearing: 0 },
  { at: "s8b@0.3", lng: 20.2, lat: 54.55, zoom: 7.2, pitch: 24, bearing: 0 },
  { at: "s8b:end", lng: 20.0, lat: 54.25, zoom: 5.3, pitch: 14, bearing: 0 },
  // 9 — la carte se déroule vers l'est, puis lente poussée vers l'oblast
  { at: "s9a:end", lng: 28.2, lat: 55.6, zoom: 4.6, pitch: 10, bearing: 0 },
  { at: "s9c@0.5", lng: 27.4, lat: 55.55, zoom: 4.74, pitch: 11, bearing: 0 },
  { at: "s9d:end", lng: 26.0, lat: 55.3, zoom: 4.98, pitch: 13, bearing: 0 },
  { at: "s9e:end", lng: 23.0, lat: 55.05, zoom: 5.5, pitch: 17, bearing: -1 },
  // 10 — l'oblast, la Baltique et la Lituanie, puis élargissement vers le golfe de Finlande
  { at: "s10a@0.7", lng: 23.2, lat: 56.3, zoom: 5.2, pitch: 14, bearing: 0 },
  { at: "s10c@0.2", lng: 23.8, lat: 57.1, zoom: 4.95, pitch: 12, bearing: 1 },
  { at: "s10d@0.3", lng: 24.1, lat: 57.35, zoom: 4.88, pitch: 12, bearing: 1.5 },
  // 11 — plongée progressive sur Baltiïsk (≈ 4 s), dérive, puis recul pendant le cercle de portée
  { at: "s11b@0.5", lng: 20.02, lat: 54.67, zoom: 8.75, pitch: 36, bearing: -7 },
  { at: "s11b:end", lng: 19.95, lat: 54.655, zoom: 9.35, pitch: 40, bearing: -10 },
  { at: "s11c@0.65", lng: 21.2, lat: 54.65, zoom: 6.6, pitch: 24, bearing: -2 },
  { at: "s11d@0.65", lng: 21.9, lat: 54.6, zoom: 4.65, pitch: 11, bearing: 0 },
  { at: "s11d:end+0.2", lng: 22.3, lat: 54.55, zoom: 4.75, pitch: 13, bearing: 2 },
  // 12 — glissement vers le corridor de Suwałki, dérive, puis recul sur les pays baltes
  { at: "s12a:end", lng: 23.1, lat: 54.28, zoom: 7.15, pitch: 36, bearing: 9 },
  { at: "s12c:end", lng: 23.25, lat: 54.12, zoom: 7.5, pitch: 40, bearing: 12 },
  { at: "s12d:end", lng: 24.4, lat: 55.9, zoom: 5.6, pitch: 22, bearing: 2 },
  // 13 — les trois noms sur la ville, puis long recul jusqu'au globe
  { at: "s13b", lng: 20.6, lat: 54.75, zoom: 7.25, pitch: 24, bearing: 0 },
  { at: "s13c", lng: 20.55, lat: 54.72, zoom: 6.7, pitch: 20, bearing: 0 },
  { at: "s13d:end", lng: 20.5, lat: 54.7, zoom: 3.4, pitch: 2, bearing: 0 },
  { at: "end", lng: 20.5, lat: 54.7, zoom: 3.0, pitch: 0, bearing: 0 },
];

/** Caméra de l'épisode : trajectoire continue + lissage temporel (gaussien, σ = 0,45 s) après la jonction,
 *  pour supprimer les à-coups aux images-clés. Jusqu'à la fin de la scène 2 : trajectoire du prototype, inchangée. */
export function cameraEpisode(t: number) {
  const raw = cameraSpline(CAMERA_EP, t);
  const w = Math.max(0, Math.min(1, (t - PROTO_END) / 0.8));
  if (w <= 0) return raw;
  const sig = 0.45, dt = 1 / 30, N = Math.ceil((2.5 * sig) / dt);
  const acc = [0, 0, 0, 0, 0]; let tot = 0;
  for (let k = -N; k <= N; k++) {
    const tk = Math.max(PROTO_END, t + k * dt), c = cameraSpline(CAMERA_EP, tk), g = Math.exp(-((k * dt) ** 2) / (2 * sig * sig));
    const v = [mx(c.lng), my(c.lat), c.zoom, c.pitch ?? 0, c.bearing ?? 0];
    v.forEach((x, i) => (acc[i] += g * x)); tot += g;
  }
  const sm = acc.map((x) => x / tot), rv = [mx(raw.lng), my(raw.lat), raw.zoom, raw.pitch ?? 0, raw.bearing ?? 0];
  const e = w * w * (3 - 2 * w), v = rv.map((x, i) => x + (sm[i] - x) * e);
  return { lng: v[0] * 360 - 180, lat: (Math.atan(Math.sinh(Math.PI * (1 - 2 * v[1]))) * 180) / Math.PI, zoom: v[2], pitch: v[3], bearing: v[4] };
}

// ── Étalonnage : désaturation de fin de scène 2 (p), sépia « archives » (q) des scènes 4 à 8,
//    retour aux couleurs actuelles en 1991 (scène 9). ──
export const GRADE = { pFrom: "s2b:end+0.4", qIn: ["s3b@0.3", "s4a:end"], out: ["s9c@0.3", "s9d:end"] } as const;

// ── Calques des scènes 1–2 : ils s'effacent au début de la scène 3 ──
export const PROTO_EP: Overlay[] = PROTO_OVERLAYS.map((o) => ({ ...o, to: o.to ?? (o.type === "borders" ? "s3b" : "s3a"), fadeOut: 0.7 } as Overlay));

const K: [number, number] = [20.51, 54.71]; // Kaliningrad / Königsberg
const R = STYLE.russia, NATO = "#2E6BD8";

// Calques « modernes » (types des scènes 1–2) utilisés dans la suite de l'épisode
export const MODERN_EP: Overlay[] = [
  // 6 — assombrissement de la guerre
  { type: "spot", keep: [], opacity: 0.38, from: "s6a", to: "s6c:end+0.3", fadeOut: 0.8 },
  // 7 — partie nord : URSS
  { type: "region", id: "KAL", fill: R, opacity: 0.42, stroke: "#E0464F", strokeWidth: 1.6, draw: 0.8, from: "s7a@0.65", to: "s8a@0.15", fadeOut: 0.6 },
  // 9 — l'URSS en rouge, puis les républiques deviennent des États
  { type: "region", id: "RUS_MAIN", fill: R, opacity: 0.36, draw: 0.6, from: "s9a@0.15" },
  ...(["BLR", "LTU", "LVA", "EST"] as const).map((id) => ({ type: "region", id, fill: R, opacity: 0.3, draw: 0.6, from: "s9a@0.25", to: "s9c@0.85", fadeOut: 0.9 } as Overlay)),
  ...(["BLR", "LTU", "LVA", "EST"] as const).map((id, i) => ({ type: "region", id, fill: ["#cfc6b4", "#e6dcc8", "#d9cfbb", "#e2d8c6"][i], opacity: 0.14, draw: 0.6, from: "s9c@0.8" , to: id === "BLR" ? "s12a" : "s10a", fadeOut: 0.6 } as Overlay)),
  { type: "region", id: "KAL", fill: R, opacity: 0.45, stroke: "#E0464F", strokeWidth: 2, glow: true, draw: 0.6, from: "s9a@0.15", to: "s10a@0.2", fadeOut: 0.8 },
  { type: "link", a: [21.3, 54.8], b: [28.15, 56.14], from: "s9a@0.45", to: "s9c@0.85" },
  { type: "label", kind: "country", text: "RSFS DE RUSSIE", at: [35.5, 55.2], size: 34, from: "s9a@0.3", to: "s9c@0.85" },
  { type: "label", kind: "country", text: "RSS DE LITUANIE", at: [24.0, 55.25], size: 26, from: "s9a@0.5", to: "s9c@0.85" },
  { type: "label", kind: "country", text: "RSS DE LETTONIE", at: [25.6, 56.85], size: 26, from: "s9a@0.55", to: "s9c@0.85" },
  { type: "label", kind: "country", text: "RSS DE BIÉLORUSSIE", at: [27.9, 53.5], size: 26, from: "s9a@0.6", to: "s9c@0.85" },
  { type: "label", kind: "country", text: "RUSSIE", at: [33.0, 56.8], size: 40, from: "s9d", to: "s10d:end" },
  { type: "label", kind: "country", text: "LITUANIE", at: [24.0, 55.25], size: 30, from: "s9d" , to: "s10d:end" },
  { type: "label", kind: "country", text: "LETTONIE", at: [25.6, 56.85], size: 30, from: "s9d@0.2", to: "s10d:end" },
  { type: "label", kind: "country", text: "BIÉLORUSSIE", at: [27.9, 53.5], size: 30, from: "s9d@0.4", to: "s10a" },
  { type: "borders", from: "s9d", opacity: 0.6 },
  { type: "spot", keep: ["KAL"], opacity: 0.3, from: "s9e", to: "s10a@0.3", fadeOut: 0.7 },
  // 10–13 — retour à l'identité de la série : oblast ambre, Russie rouge
  { type: "region", id: "KAL", fill: STYLE.kal, opacity: 0.32, stroke: STYLE.kal, strokeWidth: 2.4, glow: true, draw: 0.8, from: "s10a@0.1" },
  { type: "region", id: "POL", fill: NATO, opacity: 0.26, stroke: "#8fb3ff", strokeWidth: 1.4, draw: 1.0, from: "s10a@0.2", to: "s10d:end+0.2", fadeOut: 0.8 },
  { type: "region", id: "LTU", fill: NATO, opacity: 0.26, stroke: "#8fb3ff", strokeWidth: 1.4, draw: 1.0, from: "s10a@0.45", to: "s10d:end+0.2", fadeOut: 0.8 },
  { type: "region", id: "POL", fill: NATO, opacity: 0.26, stroke: "#8fb3ff", strokeWidth: 1.4, draw: 0.8, from: "s12d", to: "s12d:end", fadeOut: 0.8 },
  { type: "region", id: "LTU", fill: NATO, opacity: 0.26, stroke: "#8fb3ff", strokeWidth: 1.4, draw: 0.8, from: "s12d@0.1", to: "s12d:end", fadeOut: 0.8 },
  { type: "label", kind: "country", text: "POLOGNE", at: [19.6, 52.6], size: 34, from: "s10a@0.3", to: "s10d:end" },
  { type: "label", kind: "sea", text: "Mer Baltique", at: [18.4, 56.6], from: "s10b", to: "s10d:end" },
  { type: "label", kind: "place", text: "KALININGRAD", at: [19.85, 55.2], size: 28, from: "s10a@0.6", to: "s10d:end" },
  // 11
  { type: "label", kind: "country", text: "RUSSIE", at: [31.5, 56.4], size: 40, from: "s11d@0.3", to: "s11d:end+0.6" },
  // 12 — Biélorussie en rouge clair ; mesure distincte de la frontière ; pays baltes
  { type: "region", id: "BLR", fill: "#E57373", opacity: 0.26, stroke: "#ef9a9a", strokeWidth: 1.4, draw: 0.8, from: "s12a@0.3", to: "s12d:end", fadeOut: 0.8 },
  { type: "measure", a: SUWALKI_M.from, b: SUWALKI_M.to, km: SUWALKI_M.km, until: "s12c@0.7", caption: "À VOL D'OISEAU", note: "Distance la plus courte entre l'oblast et la Biélorussie", from: "s12b@0.85", to: "s12d@0.5" },
  { type: "label", kind: "country", text: "POLOGNE", at: [22.2, 53.75], size: 30, from: "s12a@0.5", to: "s12d@0.6" },
  { type: "label", kind: "country", text: "LITUANIE", at: [24.0, 54.75], size: 30, from: "s12a@0.55", to: "s12d:end" },
  { type: "label", kind: "country", text: "BIÉLORUSSIE", at: [24.4, 53.75], size: 30, from: "s12a@0.6", to: "s12d@0.6" },
  { type: "region", id: "LVA", fill: NATO, opacity: 0.26, stroke: "#8fb3ff", strokeWidth: 1.4, draw: 0.8, from: "s12d", to: "s12d:end", fadeOut: 0.8 },
  { type: "region", id: "EST", fill: NATO, opacity: 0.26, stroke: "#8fb3ff", strokeWidth: 1.4, draw: 0.8, from: "s12d@0.2", to: "s12d:end", fadeOut: 0.8 },
  { type: "label", kind: "country", text: "LETTONIE", at: [25.6, 56.85], size: 30, from: "s12d@0.2", to: "s12d:end" },
  { type: "label", kind: "country", text: "ESTONIE", at: [25.8, 58.7], size: 30, from: "s12d@0.35", to: "s12d:end" },
  // 13 — l'oblast seule en lumière
  { type: "spot", keep: ["KAL"], opacity: 0.45, from: "s13c" },
];

export const EP: EpOverlay[] = [
  // 3 — le nom actuel se désagrège
  { type: "city", text: "KALININGRAD", at: K, style: "present", size: 70, from: "s3a@0.25", dissolveAt: "s3b@0.55", to: "s3b:end+0.4", fadeOut: 0.2 },
  // 4 — Königsberg
  { type: "city", text: "Königsberg", at: K, style: "past", from: "s4a", to: "s4c:end+0.3" },
  { type: "date", date: "1255", text: "Fondation par l'ordre Teutonique", slot: 0, from: "s4b@0.05", to: "s4c:end+0.2" },
  { type: "date", date: "1701", text: "Couronnement du premier roi en Prusse", slot: 1, from: "s4b@0.55", to: "s4c:end+0.2" },
  { type: "date", date: "1724 – 1804", text: "Emmanuel Kant", slot: 2, from: "s4c", to: "s4c:end+0.2" },
  ...(has("chateau") ? [{ type: "card", src: "archives/chateau.jpg", pin: K, x: 560, y: 520, w: 420, h: 560, credit: credit("chateau"), from: "s4b@0.25", to: "s4c" } as EpOverlay] : []),
  ...(has("kant") ? [{ type: "card", src: "archives/kant.jpg", pin: K, x: 590, y: 540, w: 380, h: 500, credit: credit("kant"), tilt: 1.5, from: "s4c@0.05", to: "s4c:end+0.15" } as EpOverlay] : []),
  // 5 — le corridor polonais (frontières de 1930, tracé simplifié)
  { type: "zone", id: "H_DE", fill: "#9a9a9a", opacity: 0.55, blur: 6, from: "s5a", to: "s5b:end+0.2", fadeOut: 0.7 },
  { type: "zone", id: "H_EP", fill: "#9a9a9a", opacity: 0.55, blur: 6, from: "s5a", to: "s5b:end+0.2", fadeOut: 0.7 },
  { type: "zone", id: "H_PL", fill: "#f1e4e4", opacity: 0.16, blur: 6, from: "s5a@0.3", to: "s5b:end+0.2", fadeOut: 0.7 },
  { type: "zone", id: "H_PL", fill: "#ffffff", opacity: 0.55, blur: 5, edge: "#e53935", focus: { at: [18.1, 53.9], km: 140 }, from: "s5b", to: "s5b:end+0.2", fadeOut: 0.7 },
  { type: "place", at: [13.405, 52.52], text: "Berlin", from: "s5a@0.2", to: "s5b:end+0.2" },
  { type: "place", at: K, text: "Königsberg", color: STYLE.kal, side: "left", from: "s5a@0.35", to: "s5b:end+0.2" },
  { type: "city", text: "ALLEMAGNE", at: [12.3, 51.6], style: "present", size: 34, dy: 0, from: "s5a@0.3", to: "s5b:end+0.2" },
  { type: "city", text: "PRUSSE-ORIENTALE", at: [21.6, 53.75], style: "present", size: 28, dy: 0, from: "s5a@0.45", to: "s5b:end+0.2" },
  { type: "city", text: "POLOGNE", at: [20.0, 52.1], style: "present", size: 34, dy: 0, from: "s5a@0.55", to: "s5b:end+0.2" },
  { type: "city", text: "Corridor polonais", at: [18.0, 53.55], style: "past", size: 44, dy: 0, from: "s5b@0.35", to: "s5b:end+0.2" },
  { type: "date", date: "1919", text: "Traité de Versailles", slot: 0, from: "s5a@0.1", to: "s5b:end+0.2" },
  { type: "note", text: "Frontières de 1930, tracé simplifié · historical-basemaps (A. Ourednik)", from: "s5a@0.3", to: "s5b:end+0.2" },
  // 6 — la guerre
  ...(has("ruines") ? [{ type: "card", src: "archives/ruines.jpg", pin: K, x: 110, y: 480, w: 860, h: 594, credit: credit("ruines"), tilt: -1, from: "s6b@0.1", to: "s6c@0.15" } as EpOverlay] : []),
  { type: "date", date: "Août 1944", text: "Raids de la RAF", slot: 0, from: "s6b@0.05", to: "s6c:end+0.3" },
  { type: "date", date: "6 – 9 avril 1945", text: "Assaut soviétique", slot: 1, from: "s6c", to: "s6c:end+0.3" },
  { type: "date", date: "9 avril 1945", text: "Capitulation de la garnison", slot: 2, from: "s6c@0.7", to: "s6c:end+0.3" },
  { type: "offensive", color: "#e53935", until: "s6c:end", from: "s6c@0.05", to: "s6c:end+0.4", paths: [
    [[19.95, 54.98], [20.18, 54.86], [20.4, 54.76]],
    [[20.58, 55.07], [20.54, 54.9], [20.51, 54.775]],
    [[20.44, 54.36], [20.47, 54.52], [20.5, 54.655]] ] },
  { type: "ring", at: K, km: 13, color: "#ff5252", until: "s6c:end", from: "s6c@0.45", to: "s6c:end+0.4" },
  { type: "note", text: "Directions d'attaque schématiques : 43ᵉ et 50ᵉ armées au nord, 11ᵉ armée de la Garde au sud", from: "s6c", to: "s6c:end+0.3" },
  // 7 — Potsdam
  ...(has("potsdam") ? [{ type: "card", src: "archives/potsdam.jpg", pin: [13.07, 52.39], x: 90, y: 470, w: 900, h: 700, credit: credit("potsdam"), tilt: -1, from: "s7a", to: "s7a@0.5", fadeOut: 0.8 } as EpOverlay] : []),
  { type: "date", date: "17 juillet – 2 août 1945", text: "Conférence de Potsdam", slot: 0, from: "s7a@0.05", to: "s7c:end+0.2" },
  { type: "zone", id: "H_EP", fill: "#e57373", opacity: 0.32, blur: 6, from: "s7b", to: "s8a@0.3", fadeOut: 0.7 },
  { type: "lines", id: "L_1945", color: "#ffffff", width: 4, dash: "12 10", glow: true, solidAt: "s7c@0.75", from: "s7a@0.6", to: "s8a@0.3" },
  { type: "city", text: "Königsberg", at: K, style: "past", size: 60, from: "s7a@0.55", to: "s7c@0.8" },
  { type: "block", lines: ["NORD : TRANSFERT À L'URSS ACCEPTÉ « EN PRINCIPE »"], y: 360, from: "s7a@0.75", to: "s7c:end+0.2" },
  { type: "block", lines: ["SUD : PLACÉ SOUS ADMINISTRATION POLONAISE"], y: 410, from: "s7b@0.15", to: "s7c:end+0.2" },
  { type: "block", lines: ["FRONTIÈRE PROVISOIRE, EN ATTENDANT LE RÈGLEMENT DE PAIX"], y: 460, from: "s7c", to: "s7c:end+0.2" },
  { type: "note", text: "Règlement définitif : traité « 2+4 », 1990 · tracé actuel de la frontière (accord polono-soviétique du 16 août 1945)", from: "s7c@0.7", to: "s8a@0.3" },
  // 8 — Kaliningrad
  { type: "city", text: "Königsberg", at: K, style: "past", from: "s8a", dissolveAt: "s8a@0.3", to: "s8a@0.7", fadeOut: 0.2 },
  { type: "city", text: "KALININGRAD", at: K, style: "present", size: 62, from: "s8a@0.5", to: "s8b@0.35" },
  { type: "date", date: "4 juillet 1946", text: "Königsberg devient Kaliningrad", slot: 0, from: "s8a@0.3", to: "s8b:end+0.2" },
  ...(has("kalinine") ? [{ type: "card", src: "archives/kalinine.jpg", pin: K, x: 100, y: 800, w: 320, h: 450, credit: credit("kalinine"), tilt: 1.5, from: "s8a@0.6", to: "s8b@0.2" } as EpOverlay] : []),
  { type: "date", date: "1947 – 1948", text: "Expulsion des derniers habitants allemands", slot: 1, from: "s8b", to: "s8b:end+0.2" },
  { type: "flow", color: "#E9E1CF", from: "s8b@0.15", to: "s8b:end+0.3", lines: [[[20.2, 54.75], [17.5, 54.35], [14.6, 53.6]], [[20.6, 54.55], [17.8, 53.9], [14.9, 53.1]], [[21.2, 54.9], [18.2, 54.7], [15.2, 54.1]]] },
  { type: "flow", color: "#ff6b6b", from: "s8b@0.4", to: "s8b:end+0.3", lines: [[[30.5, 55.2], [26.0, 55.1], [21.9, 54.8]], [[30.8, 53.6], [26.3, 54.0], [22.0, 54.55]], [[29.5, 56.6], [25.7, 55.9], [21.6, 55.0]]] },
  // 9 — 1946 → 1991 (l'Ukraine, république soviétique, fait partie de l'URSS)
  { type: "zone", id: "UKR", fill: R, opacity: 0.3, blur: 0.5, landClip: false, from: "s9a@0.25", to: "s9c@0.85", fadeOut: 0.9 },
  { type: "zone", id: "UKR", fill: "#ddd2bd", opacity: 0.14, blur: 0.5, landClip: false, from: "s9c@0.8", to: "s10a", fadeOut: 0.6 },
  { type: "lines", id: "L_SOV", color: "rgba(255,255,255,0.85)", width: 2, dash: "6 7", solidAt: "s9d", glow: true, from: "s9a@0.2", to: "s10a@0.2", fadeOut: 0.8 },
  { type: "frise", from: "s9a@0.2", to: "s9e:end", y: 1150, items: [
    { date: "7 avril 1946", label: "Région rattachée à la RSFS de Russie", at: "s9a@0.35" },
    { date: "11 mars 1990", label: "La Lituanie proclame son indépendance", at: "s9c@0.25" },
    { date: "6 sept. 1991", label: "Indépendance reconnue par l'URSS", at: "s9c@0.55" },
    { date: "26 déc. 1991", label: "Fin de l'URSS", at: "s9c@0.85" } ] },
  // 10 — voisins de l'Alliance, ouverture sur la mer
  { type: "date", date: "1999 · 2004", text: "Pologne : OTAN 1999 · Union européenne 2004", slot: 0, from: "s10a@0.2", to: "s10d:end+0.2" },
  { type: "date", date: "2004", text: "Lituanie : OTAN et Union européenne", slot: 1, from: "s10a@0.5", to: "s10d:end+0.2" },
  { type: "lines", id: "L_KAL_LAND", color: "#5b8dff", width: 4.5, glow: true, draw: 1.0, from: "s10b", to: "s10d:end+0.3" },
  { type: "lines", id: "L_KAL_COAST", color: STYLE.kal, width: 4.5, glow: true, draw: 1.0, from: "s10b@0.5", to: "s10d:end+0.3" },
  { type: "route", mode: "ship", color: "#1f6fb2", until: "s10c:end", from: "s10c", to: "s10d:end+0.3", label: "Oust-Louga", path: [[19.9, 54.65], [19.55, 55.4], [19.95, 57.3], [20.9, 58.55], [22.6, 59.4], [24.8, 59.75], [26.8, 59.85], [28.39, 59.68]] },
  { type: "route", mode: "plane", color: "#7e57c2", until: "s10c:end+0.5", from: "s10c@0.3", to: "s10d:end+0.3", path: [[20.59, 54.89], [19.95, 55.95], [19.8, 57.6], [21.05, 58.9], [23.6, 59.62], [26.6, 59.98], [29.8, 59.95]] },
  { type: "route", mode: "train", color: "#2e7d32", until: "s10d:end", from: "s10d", to: "s10d:end+0.3", label: "Lituanie", path: [[20.51, 54.71], [21.81, 54.63], [22.77, 54.64], [23.9, 54.9], [25.28, 54.69], [25.95, 54.62], [27.56, 53.9], [30.4, 54.25]] },
  { type: "date", date: "Mer · air · rail", text: "Transit facilité par la Lituanie depuis 2003", slot: 2, from: "s10c", to: "s10d:end+0.2" },
  { type: "note", text: "Ferry Baltiïsk – Oust-Louga · vols par les eaux internationales de la Baltique depuis 2022 · train via la Lituanie", from: "s10c@0.2", to: "s10d:end+0.2" },
  // 11 — position militaire
  { type: "place", at: [19.91, 54.65], text: "Baltiïsk", color: STYLE.kal, from: "s11a@0.6", to: "s11c@0.4" },
  { type: "date", date: "Baltiïsk", text: "Base principale de la flotte russe de la Baltique", slot: 0, from: "s11b", to: "s11d:end+0.2" },
  ...(has("iskander") ? [{ type: "card", src: "archives/iskander.jpg", pin: ISKANDER.center, x: 110, y: 470, w: 860, h: 573, credit: credit("iskander"), tilt: -1, from: "s11c", to: "s11d", fadeOut: 0.8 } as EpOverlay] : []),
  { type: "date", date: "Depuis 2018", text: "Iskander déployés en permanence", slot: 1, from: "s11c@0.2", to: "s11d:end+0.2" },
  { type: "place", at: ISKANDER.center, text: "Tcherniakhovsk", from: "s11d@0.05", to: "s11d:end+0.3" },
  { type: "circle", ring: ISKANDER.ring, center: ISKANDER.center, from: "s11d", until: "s11d@0.65", to: "s11d:end+0.4", caption: "PORTÉE MAXIMALE ANNONCÉE : JUSQU'À 500 KM", note: "Rayon théorique : il ne désigne pas de cibles" },
  // 12 — corridor de Suwałki
  { type: "badge", text: "ANALYSE", from: "s12a", to: "s12b@0.5" },
  { type: "lines", id: "L_PL_LT", color: "#ffffff", width: 6, glow: true, draw: 1.4, from: "s12b@0.15", to: "s12d:end" },
  { type: "city", text: "CORRIDOR DE SUWAŁKI", at: [23.25, 54.12], style: "present", size: 34, dy: -60, from: "s12a@0.45", to: "s12c" },
  { type: "block", title: "≈ 104 km", lines: ["FRONTIÈRE POLOGNE – LITUANIE"], y: 300, size: 60, from: "s12b@0.4", to: "s12b:end+0.1" },
  { type: "flow", color: "#9cc0ff", from: "s12d@0.1", to: "s12d:end+0.3", lines: [[[20.8, 52.6], [23.05, 53.95], [24.3, 55.9], [25.3, 58.0]]] },
  // 13 — conclusion
  { type: "names", y: 290, from: "s13a", to: "s13c:end+0.6", items: [
    { name: "Königsberg", sub: "1255 – 1946", font: "serif", at: "s13a" },
    { name: "KALININGRAD", sub: "DEPUIS 1946", font: "display", at: "s13a@0.5" },
    { name: "Królewiec", sub: "NOM POLONAIS RECOMMANDÉ DEPUIS 2023", font: "sans", at: "s13b@0.45" } ] },
  { type: "block", lines: ["1255 · 1701 · 1919 · 1945 · 1946 · 1991 · 2004 · 2018"], y: 360, from: "s13d@0.1", to: "s13d:end" },
  { type: "end", from: "s13d:end" },
];
