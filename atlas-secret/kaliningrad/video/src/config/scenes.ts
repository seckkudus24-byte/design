// ─────────────────────────────────────────────────────────────────────────────
// PROTOTYPE — scènes 1 et 2 du plan V2 (caméra + calques), calés sur la voix off.
// Temps : secondes, ou relatifs aux segments de narration.json ("s2b@0.5", "s1d:end+0.3").
// Caméra : lng/lat, zoom MapLibre, pitch (inclinaison °), bearing (rotation °),
//          fly = ampleur du vol (0,9 par défaut).
// ─────────────────────────────────────────────────────────────────────────────
import type { Key } from "../camera";
import type { Overlay } from "../overlays/types";
import { STYLE } from "./style";
import { MEASURE_KAL_RUS } from "../map/geo";

export const CAMERA: Key[] = [
  // Scène 1 — plan rapproché sur l'oblast, au bord de la Baltique
  { at: 0, lng: 20.3, lat: 54.78, zoom: 8.35, pitch: 40, bearing: -14 },
  { at: "s1b", lng: 20.36, lat: 54.78, zoom: 8.12, pitch: 38, bearing: -12, ease: "linear" },
  // recul cinématographique : la Russie continentale apparaît à l'est
  { at: "s1d@0.5", lng: 25.8, lat: 56.0, zoom: 5.0, pitch: 12, bearing: 0, fly: 0.6, ease: "inOut" },
  { at: "s2a", lng: 26.0, lat: 56.0, zoom: 5.07, pitch: 12, ease: "linear" },
  // Scène 2 — on se recentre sur l'oblast, entre Pologne et Lituanie
  { at: "s2a@0.95", lng: 22.2, lat: 54.75, zoom: 6.1, pitch: 22, fly: 0.4 },
  { at: "s2b@0.15", lng: 22.4, lat: 54.8, zoom: 6.02, pitch: 22, ease: "linear" },
  // la caméra suit la mesure jusqu'à la Russie continentale
  { at: "s2b:end", lng: 25.5, lat: 55.45, zoom: 5.5, pitch: 16, fly: 0.3, ease: "inOut" },
  { at: "end", lng: 25.65, lat: 55.5, zoom: 5.55, pitch: 16, ease: "linear" },
];

const M = MEASURE_KAL_RUS; // plus courte distance oblast → Russie continentale (Natural Earth 1:10M)

export const OVERLAYS: Overlay[] = [
  { type: "borders", from: 0.1, opacity: 0.75 },
  { type: "region", id: "POL", fill: STYLE.neutral, opacity: 0.12, stroke: "rgba(255,255,255,0.9)", strokeWidth: 1.6, draw: 0.9, from: "s2a@0.3" },
  { type: "region", id: "LTU", fill: STYLE.neutral, opacity: 0.12, stroke: "rgba(255,255,255,0.9)", strokeWidth: 1.6, draw: 0.9, from: "s2a@0.55" },
  { type: "region", id: "RUS_MAIN", fill: STYLE.russia, opacity: 0.4, stroke: "#E0464F", strokeWidth: 1.6, draw: 1.4, from: "s1c" },
  { type: "region", id: "KAL", fill: STYLE.kal, opacity: 0.3, stroke: STYLE.kal, strokeWidth: 2.6, glow: true, draw: 1.3, from: 0 },

  // Scène 1
  { type: "label", kind: "sea", text: "Mer Baltique", at: [18.7, 56.35], from: "s1b@0.4" },
  { type: "label", kind: "country", text: "RUSSIE", at: [32.5, 57.2], size: 44, from: "s1c" },
  { type: "link", a: M.from, b: M.to, mark: "?", from: "s1c@0.2", to: "s2a@0.2" },
  { type: "title", text: "KALININGRAD", caption: "TERRITOIRE RUSSE", from: "s1d@0.25", to: "s2a@0.12", fadeOut: 0.35 },

  // Scène 2
  { type: "label", kind: "place", text: "KALININGRAD", at: [19.85, 55.2], from: "s2a@0.5" },
  { type: "label", kind: "country", text: "POLOGNE", at: [20.4, 53.55], from: "s2a@0.35" },
  { type: "label", kind: "country", text: "LITUANIE", at: [24.2, 54.25], from: "s2a@0.6" },
  { type: "stat", value: "≈ 1 000 000", caption: "HABITANTS · RECENSEMENT 2021", from: "s2a@0.22", to: "s2b@0.2" },
  { type: "label", kind: "country", text: "LETTONIE", at: [25.9, 56.85], size: 34, from: "s2b@0.45" },
  { type: "label", kind: "country", text: "BIÉLORUSSIE", at: [27.0, 54.0], size: 34, from: "s2b@0.55" },
  { type: "measure", a: M.from, b: M.to, km: M.km, until: "s2b@0.9", caption: "au plus court, à vol d'oiseau", from: "s2b@0.15" },
];

/** Fin du prototype : légère désaturation (annonce la bascule vers le passé, scène 3). */
export const FADE_TO_PAST = { from: "s2b:end+0.35" };
/** Souffle accompagnant le grand recul de la scène 1. */
export const WHOOSH_AT = "s1c@0.2";
