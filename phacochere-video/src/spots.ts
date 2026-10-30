// Emplacements des tiques sur le phacochère (coordonnées du dessin Warthog).
export const SPOTS = [
  {x: 120, y: 120},
  {x: 175, y: 105},
  {x: 215, y: 150},
  {x: 90, y: 165},
  {x: 268, y: 60}, // derrière l'oreille
  {x: 150, y: 175},
  {x: 245, y: 185}, // entre les pattes
  {x: 300, y: 140},
];

// Position à l'écran d'un point du dessin Warthog, pour un phacochère placé en (cx, cy) avec la largeur `width`.
// Reprend la bascule du mode couché (lying) du dessin.
export const hogPoint = (vx: number, vy: number, cx: number, cy: number, width: number, lying = 0) => {
  const k = width / 420;
  const a = (-lying * 12 * Math.PI) / 180;
  // rotation autour de (200, 200), puis translation verticale du mode couché
  const y0 = vy - 10 * lying;
  const rx = 200 + (vx - 200) * Math.cos(a) - (y0 - 200) * Math.sin(a);
  const ry = 200 + (vx - 200) * Math.sin(a) + (y0 - 200) * Math.cos(a) + 60 * lying;
  return {x: cx - width / 2 + (rx + 30) * k, y: cy - (300 * k) / 2 + (ry + 30) * k};
};
