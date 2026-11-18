import { getInputProps } from "remotion";
const ip = getInputProps() as Record<string, any>;

// Réglages de la carte satellite. Le fournisseur de tuiles (EOX, MapTiler, Mapbox)
// se choisit au lancement : voir scripts/tileserver.mjs et le README.
export const MAP = {
  tileUrl: "http://localhost:8787/sat/{z}/{x}/{y}.jpg",
  maxTileZoom: 14,
  /** Taille d'affichage d'une tuile 256 px. 160 = tuiles d'un niveau plus détaillé, affichées plus serrées. */
  tileSize: ip.tileSize ?? 192,
  /** Suréchantillonnage du rendu WebGL (1 = natif, 1.5 = plus net, plus lent). */
  pixelRatio: ip.pr ?? 1.25,
  /**
   * Remonte le point visé de raise/2 px pour laisser la place aux sous-titres
   * (la carte est dessinée plus haute que l'écran puis décalée vers le haut).
   */
  raise: ip.raise ?? 360,
  space: "#02060f",
  // Atmosphère : visible seulement en vue « globe », jamais en vue régionale (pas de voile gris).
  sky: {
    "sky-color": "#0b2a5a",
    "horizon-color": "#5aa0e6",
    "fog-color": "#5aa0e6",
    "sky-horizon-blend": 0.5,
    "horizon-fog-blend": 0.2,
    "fog-ground-blend": 1,
    "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 3, 0.9, 4.2, 0],
  },
  // Retouche de l'imagerie (couleurs naturelles, désert non brûlé, forêts profondes)
  saturation: 0.18,
  contrast: 0.14,
  brightnessMin: 0.02,
  brightnessMax: 0.9,
  /** Étalonnage final (filtre CSS appliqué à la carte seule). */
  grade: ip.grade === false ? "none" : "saturate(1.08) contrast(1.04)",
};
