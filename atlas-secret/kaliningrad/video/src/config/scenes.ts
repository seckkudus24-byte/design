// ─────────────────────────────────────────────────────────────────────────────
// PROTOTYPE V2 — scènes 1 et 2 du plan V2, calées sur la voix off.
// Temps : secondes, ou relatifs aux segments de narration.json ("s2b@0.5", "s1d:end+0.3").
// Caméra : trajectoire CONTINUE passant par ces points (src/camera.ts → cameraSpline) :
//   lng/lat = centre, zoom MapLibre, pitch = inclinaison (°), bearing = rotation (°).
// Segments de voix (≈) : s1a 0,3–1,7 · s1b 2,1–3,1 · s1c 3,6–4,3 · s1d 4,6–6,0 · s2a 6,6–9,7 · s2b 10,2–14,9
// ─────────────────────────────────────────────────────────────────────────────
import type { Key } from "../camera";
import type { Overlay } from "../overlays/types";
import { STYLE } from "./style";
import { MEASURE_KAL_RUS } from "../map/geo";

export const CAMERA: Key[] = [
  // Scène 1 — vue large de l'Europe du Nord, puis lente approche de Kaliningrad,
  // avec un glissement latéral (centre et rotation) qui donne la profondeur.
  { at: 0, lng: 26.5, lat: 58.4, zoom: 4.05, pitch: 18, bearing: -14 },
  { at: "s1b", lng: 24.6, lat: 57.3, zoom: 4.45, pitch: 24, bearing: -9 },
  { at: "s1c", lng: 22.4, lat: 55.95, zoom: 5.25, pitch: 30, bearing: -3 },
  { at: "s1d@0.6", lng: 21.0, lat: 55.0, zoom: 6.35, pitch: 36, bearing: 3 },
  { at: "s2a@0.1", lng: 20.85, lat: 54.88, zoom: 6.55, pitch: 37, bearing: 5 },
  // Scène 2 — la caméra s'élève vers une vue cartographique plus large…
  { at: "s2a@0.9", lng: 22.6, lat: 55.05, zoom: 5.65, pitch: 26, bearing: 2 },
  // … puis accompagne la mesure jusqu'à la Russie continentale.
  { at: "s2b@0.75", lng: 24.9, lat: 55.5, zoom: 5.4, pitch: 20, bearing: -1 },
  { at: "end", lng: 25.75, lat: 55.68, zoom: 5.3, pitch: 18, bearing: -4 },
];

// Plus courte distance oblast → Russie continentale (Natural Earth 1:10M, calculée par `npm run data`) :
// départ 22,821° E 54,885° N (pointe est de l'oblast, frontière lituanienne) ;
// arrivée 28,149° E 56,142° N (région de Pskov, près du tripoint Lettonie–Biélorussie–Russie).
// 364,4 km sur l'ellipsoïde WGS84 (363,3 km sur la sphère ; 364,8 km avec les données 1:50M).
// La ligne suit le grand cercle : Lituanie (≈ 240 km) puis Lettonie.
const M = MEASURE_KAL_RUS;

export const OVERLAYS: Overlay[] = [
  { type: "borders", from: 0, opacity: 0.6 },
  // Scène 2 : Pologne et Lituanie en ton neutre
  { type: "region", id: "POL", fill: STYLE.neutral, opacity: 0.1, stroke: "rgba(255,255,255,0.85)", strokeWidth: 1.4, draw: 1.0, from: "s2a@0.32" },
  { type: "region", id: "LTU", fill: STYLE.neutral, opacity: 0.1, stroke: "rgba(255,255,255,0.85)", strokeWidth: 1.4, draw: 1.0, from: "s2a@0.5" },
  // Scène 1 : la Russie continentale apparaît d'emblée (« une région de Russie… »)
  { type: "region", id: "RUS_MAIN", fill: STYLE.russia, opacity: 0.38, stroke: "#E0464F", strokeWidth: 1.5, draw: 1.6, from: "s1a@0.35" },
  // Isolement : tout s'assombrit légèrement autour de l'oblast au moment de la révélation
  { type: "spot", keep: ["KAL"], opacity: 0.32, from: "s1c", to: "s2a@0.35", fadeOut: 0.8 },
  // Révélation de Kaliningrad : contour lumineux qui se dessine, puis remplissage ambre
  { type: "region", id: "KAL", fill: STYLE.kal, opacity: 0.3, stroke: STYLE.kal, strokeWidth: 2.4, glow: true, draw: 1.1, from: "s1c" },

  { type: "label", kind: "country", text: "RUSSIE", at: [31.0, 56.3], size: 42, from: "s1a@0.7" },
  { type: "title", text: "KALININGRAD", caption: "TERRITOIRE RUSSE", from: "s1d@0.2", to: "s2a@0.1", fadeOut: 0.45 },

  // Scène 2 : noms qui apparaissent progressivement
  { type: "label", kind: "sea", text: "Mer Baltique", at: [18.6, 56.2], from: "s2a@0.1" },
  { type: "label", kind: "country", text: "POLOGNE", at: [20.5, 53.5], from: "s2a@0.35" },
  { type: "label", kind: "country", text: "LITUANIE", at: [23.7, 54.3], size: 34, from: "s2a@0.55" },
  { type: "label", kind: "place", text: "KALININGRAD", at: [20.6, 55.05], size: 32, from: "s2a@0.7" },
  { type: "stat", value: "1 million", caption: "D'HABITANTS · RECENSEMENT 2021", from: "s2a@0.32", to: "s2b@0.12" },
  { type: "label", kind: "country", text: "LETTONIE", at: [26.2, 56.95], size: 32, from: "s2b@0.5" },
  { type: "label", kind: "country", text: "BIÉLORUSSIE", at: [28.0, 54.75], size: 32, from: "s2b@0.65" },
  { type: "measure", a: M.from, b: M.to, km: M.km, until: "s2b@0.8", caption: "À VOL D'OISEAU", note: "Distance la plus courte entre les frontières, pas un trajet routier", from: "s2b@0.12" },
];

/** Fin du prototype : légère désaturation (annonce la bascule vers le passé, scène 3). */
export const FADE_TO_PAST = { from: "s2b:end+0.4" };
/** Souffle accompagnant l'approche de la caméra (scène 1). */
export const WHOOSH_AT = "s1b@0.6";
