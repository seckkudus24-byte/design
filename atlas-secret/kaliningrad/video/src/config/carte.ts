import { getInputProps } from "remotion";
const ip = getInputProps() as Record<string, any>;

// ─────────────────────────────────────────────────────────────
// Carte : imagerie satellite + ombrage du relief.
// Fournisseurs (sans clé) : EOX Sentinel-2 cloudless 2016 (CC BY 4.0) et AWS Terrain Tiles.
// Changer de fournisseur (MapTiler, Mapbox : clé requise) → voir scripts/tileserver.mjs.
// ─────────────────────────────────────────────────────────────
export const MAP = {
  tileUrl: "http://localhost:8787/sat/{z}/{x}/{y}.jpg",
  /** Même imagerie, avec l'ombrage du relief fusionné côté serveur (scripts/shade.py + compose.py). */
  reliefTileUrl: "http://localhost:8787/satr/{z}/{x}/{y}.jpg",
  maxTileZoom: 14,
  /** Ombrage du relief (modèle d'altitude). */
  relief: ip.relief ?? true,
  demMaxZoom: 11,
  /** Taille d'affichage d'une tuile 256 px : < 256 = tuiles plus détaillées (plus lent). */
  tileSize: ip.tileSize ?? 208,
  /** Suréchantillonnage du rendu WebGL. */
  pixelRatio: ip.pr ?? 1.2,
  /** Remonte le point visé de raise/2 px pour laisser la place aux sous-titres. */
  raise: ip.raise ?? 300,
  space: "#03070f",
  sky: {
    "sky-color": "#0a1f3d",
    "horizon-color": "#4f86c6",
    "fog-color": "#4f86c6",
    "sky-horizon-blend": 0.5,
    "horizon-fog-blend": 0.2,
    "fog-ground-blend": 1,
    "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 3, 0.9, 4.2, 0],
  },
  // Étalonnage « nuit baltique » : légèrement désaturé et assombri, sans boucher les ombres.
  saturation: -0.12,
  contrast: 0.12,
  brightnessMin: 0.0,
  brightnessMax: 0.88,

  grade: ip.grade === false ? "none" : "contrast(1.05) saturate(1.05)",
};
