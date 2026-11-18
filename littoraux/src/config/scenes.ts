// ─────────────────────────────────────────────────────────────────────────────
// SCÈNES : mouvements de caméra + calques, calés sur les phrases de la voix off.
// Les temps s'écrivent par rapport aux phrases (voir src/timeline.ts) :
//   "l06@0.5" = milieu de la phrase l06, "l08:end+0.3" = 0,3 s après sa fin.
// Ainsi, si la narration change de durée, tout se recale automatiquement.
// Caméra : lng/lat = centre, zoom (MapLibre), pitch = inclinaison 3D (°),
// bearing = rotation (°), arc = dézoom au milieu d'un vol entre deux régions.
// ─────────────────────────────────────────────────────────────────────────────
import type { Key } from "../camera";
import type { Overlay } from "../overlays/types";
import { TOTAL } from "../timeline";

/** Changements de séquence : flash + « whoosh ». */
export const TRANSITIONS = ["l04", "l09", "l14", "l18"];

export const CAMERA: Key[] = [
  // ── Ouverture : le globe tourne vers l'Afrique
  { at: 0, lng: -32, lat: 4, zoom: 2.05 },
  { at: "l01:end+0.1", lng: 17, lat: -3, zoom: 2.85, ease: "inOut" },
  // plongée sur la minuscule côte de la RD Congo
  { at: "l02@0.85", lng: 12.45, lat: -5.9, zoom: 8.4, pitch: 40, ease: "inOut" },
  // retour à l'échelle du continent
  { at: "l03@0.4", lng: 20, lat: -2, zoom: 3.15, pitch: 0, ease: "inOut" },
  { at: "l03:end+0.3", lng: 19.5, lat: -2.5, zoom: 3.3, ease: "linear" },

  // ── N° 4 : République du Congo
  { at: "l04@0.75", lng: 15.0, lat: -0.7, zoom: 6.1, pitch: 15, arc: 0.6 },
  { at: "l05:end", lng: 15.3, lat: -0.9, zoom: 6.0, pitch: 28, bearing: -8, ease: "linear" },
  { at: "l06@0.45", lng: 11.8, lat: -4.45, zoom: 8.25, pitch: 48, bearing: -15 },
  { at: "l06:end+0.1", lng: 11.75, lat: -4.5, zoom: 8.4, pitch: 50, bearing: -18, ease: "linear" },
  { at: "l07@0.6", lng: 18.5, lat: -3.6, zoom: 4.75, pitch: 20, bearing: 0 },
  { at: "l07:end+0.1", lng: 18.3, lat: -3.6, zoom: 4.85, pitch: 22, ease: "linear" },
  { at: "l08@0.5", lng: 12.6, lat: -5.65, zoom: 8.1, pitch: 40 },
  { at: "l08:end+0.45", lng: 12.55, lat: -5.7, zoom: 8.3, pitch: 44, ease: "linear" },

  // ── N° 3 : Gambie
  { at: "l09@0.8", lng: -15.35, lat: 13.5, zoom: 7.55, pitch: 10, bearing: 0, arc: 3.2 },
  { at: "l10:end", lng: -15.25, lat: 13.55, zoom: 7.6, pitch: 16, ease: "linear" },
  { at: "l11@0.4", lng: -16.68, lat: 13.33, zoom: 9.35, pitch: 45, bearing: 10 },
  { at: "l11:end+0.1", lng: -16.7, lat: 13.32, zoom: 9.5, pitch: 48, bearing: 12, ease: "linear" },
  { at: "l13@0.3", lng: -14.6, lat: 14.2, zoom: 6.45, pitch: 20, bearing: 0 },
  { at: "l13:end+0.35", lng: -14.6, lat: 14.25, zoom: 6.55, pitch: 22, ease: "linear" },

  // ── N° 2 : Togo
  { at: "l14@0.8", lng: 0.95, lat: 8.55, zoom: 7.3, pitch: 10, arc: 1.4 },
  { at: "l15@0.45", lng: 1.4, lat: 6.02, zoom: 9.8, pitch: 46 },
  { at: "l15:end", lng: 1.4, lat: 6.01, zoom: 9.95, pitch: 48, ease: "linear" },
  { at: "l16@0.35", lng: 1.75, lat: 6.7, zoom: 8.0, pitch: 30 },
  { at: "l16:end", lng: 1.7, lat: 6.65, zoom: 8.12, pitch: 32, ease: "linear" },
  { at: "l17:end+0.45", lng: 1.45, lat: 6.85, zoom: 8.2, pitch: 30, ease: "linear" },

  // ── N° 1 : Palestine
  { at: "l18@0.85", lng: 34.95, lat: 31.85, zoom: 8.0, pitch: 15, bearing: 0, arc: 3.0 },
  { at: "l19@0.4", lng: 34.37, lat: 31.42, zoom: 10.0, pitch: 42, bearing: -35 },
  { at: "l19:end", lng: 34.37, lat: 31.42, zoom: 10.15, pitch: 45, bearing: -40, ease: "linear" },
  { at: "l20@0.4", lng: 35.0, lat: 31.8, zoom: 7.5, pitch: 12, bearing: 0 },
  { at: TOTAL, lng: 35.05, lat: 31.85, zoom: 7.7, pitch: 14, ease: "linear" },
];

// L'ordre de la liste = ordre d'empilement (le dernier est au-dessus).
export const OVERLAYS: Overlay[] = [
  // ── Ouverture
  { type: "country", id: "AFRICA", fill: "#c4161c", outline: false, wave: false, opacity: 0.9, draw: 0.01, fillDelay: 0, from: "l03@0.45", to: "l03:end+0.25" },
  { type: "country", id: "COD", fill: "#1e8fff", outline: false, wave: false, draw: 0.01, fillDelay: 0, opacity: 0.95, from: 0.35, to: "l03:end+0.25" },
  { type: "coast", id: "COD", clip: [12, -6.3, 12.45, -5.5], from: "l02@0.6", to: "l03@0.3" },
  { type: "scribble", at: [12.32, -5.92], r: 110, from: "l02@0.65", to: "l03@0.25" },
  { type: "arrows", points: [[17, -1.5], [16, -4.5], [18, -7]], dir: [-300, 60], bend: -60, from: "l03@0.3", to: "l03:end+0.2" },

  // ── N° 4 : République du Congo
  { type: "country", id: "COG", flag: "COG", from: "l04@0.3", to: "l08:end+0.35" },
  { type: "label", text: "République du Congo", at: [14.6, 1.6], dy: -300, size: 54, from: "l04@0.55", to: "l05:end" },
  { type: "coast", id: "COG", text: "170 km", side: -1, textOffset: 170, from: "l06@0.15", to: "l07@0.25" },
  { type: "arrows", points: [[11.75, -4.2], [11.95, -4.5], [12.15, -4.8]], dir: [-300, 130], from: "l06@0.5", to: "l07@0.25" },
  { type: "country", id: "COD", flag: "COD", from: "l07@0.15", to: "l08:end+0.35" },
  { type: "label", text: "Congo", at: [15.2, 0.5], dy: -190, dx: -60, size: 46, from: "l07@0.35", to: "l07:end+0.2" },
  { type: "label", text: "RD Congo", at: [23.5, 0.5], dy: -260, size: 46, from: "l07@0.45", to: "l07:end+0.2" },
  { type: "face", at: [23.5, -3.5], size: 150, mood: "angry", from: "l07@0.55", to: "l07:end+0.3" },
  { type: "coast", id: "COG", from: "l08@0.3", to: "l08:end+0.35" },
  { type: "coast", id: "COD", clip: [12, -6.3, 12.45, -5.5], from: "l08@0.3", to: "l08:end+0.35" },

  // ── N° 3 : Gambie (le Sénégal est listé avant pour passer dessous)
  { type: "country", id: "SEN", flag: "SEN", from: "l12@0.2", to: "l13:end+0.35" },
  { type: "country", id: "GMB", flag: "GMB", from: "l09@0.35", to: "l13:end+0.35" },
  { type: "label", text: "Gambie", at: [-15.5, 13.6], dy: -300, from: "l09@0.6", to: "l10@0.2" },
  { type: "measure", a: [-16.8, 13.82], b: [-13.8, 13.82], text: "500 km", dy: -120, from: "l10@0.15", to: "l10:end+0.15" },
  { type: "coast", id: "GMB", clip: [-16.85, 13.0, -16.5, 13.65], text: "80 km", side: -1, textOffset: 110, from: "l11@0.15", to: "l11:end+0.2" },
  { type: "label", text: "Sénégal", at: [-14.8, 15.3], dy: -220, from: "l13@0.1", to: "l13:end+0.25" },

  // ── N° 2 : Togo
  { type: "country", id: "TGO", flag: "TGO", from: "l14@0.3", to: "l17:end+0.4" },
  { type: "label", text: "Togo", at: [1.0, 9.6], dy: -260, from: "l14@0.5", to: "l15@0.2" },
  { type: "coast", id: "TGO", text: "56 km", side: 1, textOffset: 110, from: "l15@0.2", to: "l16@0.4" },
  { type: "country", id: "BEN", flag: "BEN", shift: { dx: -38, dy: 0, from: "l16@0.4", to: "l16:end" }, from: "l16@0.05", to: "l17:end+0.4" },
  { type: "label", text: "Bénin", at: [2.4, 7.9], dy: -200, from: "l16@0.2", to: "l16:end+0.1" },
  { type: "scribble", at: [1.42, 6.16], r: 85, color: "#6fc3ff", from: "l16@0.55", to: "l17:end+0.2" },
  { type: "face", at: [1.0, 7.5], size: 170, mood: "cry", from: "l17-0.15", to: "l17:end+0.4" },

  // ── N° 1 : Palestine
  { type: "country", id: "GAZ", fill: "#1f9d3a", opacity: 0.85, wave: false, from: "l18@0.3", to: "l20@0.25" },
  { type: "country", id: "WEB", flag: "PSE", from: "l18@0.3" },
  { type: "label", text: "Palestine", at: [35.25, 32.3], dy: -220, from: "l18@0.5", to: "l19@0.15" },
  { type: "label", text: "Bande de Gaza", at: [34.43, 31.5], dy: -240, size: 50, from: "l19@0.1", to: "l19:end" },
  { type: "coast", id: "GAZ", text: "40 km", side: -1, textOffset: 90, from: "l19@0.3", to: "l19:end+0.1" },
  { type: "mask", except: ["WEB"], color: "#d4141a", opacity: 0.75, from: "l20@0.35" },
];
