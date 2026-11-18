// Réglages de la carte satellite. Le fournisseur de tuiles (EOX, MapTiler, Mapbox)
// se choisit au lancement : voir scripts/tileserver.mjs et le README.
export const MAP = {
  tileUrl: "http://localhost:8787/sat/{z}/{x}/{y}.jpg",
  maxTileZoom: 13,
  space: "#02060f",
  // Atmosphère du globe (MapLibre "sky")
  sky: {
    "sky-color": "#0b2a5a",
    "horizon-color": "#5aa0e6",
    "fog-color": "#9cc7ef",
    "sky-horizon-blend": 0.6,
    "horizon-fog-blend": 0.6,
    "fog-ground-blend": 0.9,
    "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 7, 0],
  },
  // Retouche de l'imagerie pour un rendu « documentaire » plus saturé
  saturation: 0.3,
  contrast: 0.08,
  brightnessMin: 0.0,
  brightnessMax: 0.86,
};
