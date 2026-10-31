// Surface de l'eau et hauteur de la berge communes aux scènes.
export const SURFACE = 1100;
export const BANK_Y = SURFACE - 120;
// Centre vertical d'une loutre de largeur w dont les pattes touchent y.
export const otterOn = (y: number, w: number) => y - 0.465 * ((w * 260) / 480);
