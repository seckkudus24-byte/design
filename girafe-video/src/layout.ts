// Sol de toutes les scènes, et position verticale d'une girafe de hauteur h dont les sabots touchent le sol.
export const GROUND = 1380;
export const gy = (h: number) => GROUND - 0.453 * h;
// Ligne des badges (en haut, les sous-titres étant en bas).
export const BADGE_Y = 230;
