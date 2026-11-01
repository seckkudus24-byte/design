// Centre vertical d'un eider de largeur w posé sur y (couché sur le nid, ou debout).
export const eiderOn = (y: number, w: number, standing = false) => y - (standing ? 0.625 : 0.508) * ((w * 240) / 380);
// Centre vertical d'un caneton de taille s posé sur y.
export const duckOn = (y: number, s: number) => y - 0.46 * ((s * 110) / 120);
