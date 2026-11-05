// Feuille de bruitage — douce (pas de vent, pas de bruits violents).
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});
const AMB = [{src: 'amb_creek', volume: 0.08}, {src: 'amb_birds', volume: 0.06}];

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {ambience: AMB, cues: [{...w('bizarre'), src: 'boing', volume: 0.3}, {...w('blague'), src: 'applause', volume: 0.12}]},
  assemble: {
    ambience: [],
    cues: [{...w('bec'), src: 'pop', volume: 0.35}, {...w('canard'), src: 'honk', volume: 0.2}, {...w('corps'), src: 'pop', volume: 0.35}, {...w('queue'), src: 'pop', volume: 0.35}, {...w('assemble'), src: 'mystery', volume: 0.2}],
  },
  faux: {
    ambience: AMB,
    cues: [
      {...w("l'ornithorynque"), src: 'sparkle', volume: 0.3},
      {...w('australie'), src: 'ding', volume: 0.2},
      {...w('cousant'), src: 'click', volume: 0.3},
      {...w('ciseaux'), src: 'snap', volume: 0.35},
      {...w('ciseaux', 0.3), src: 'snap', volume: 0.35},
      {...w('aucune'), src: 'boing', volume: 0.25},
      {...w('reel'), src: 'fanfare', volume: 0.15},
    ],
  },
  mammifere: {
    ambience: AMB,
    cues: [
      {...w('oiseau'), src: 'pop', volume: 0.3},
      {...w('reptile'), src: 'pop', volume: 0.3},
      {...w('mammifere'), src: 'ding', volume: 0.25},
      {...w('pond'), src: 'pop', volume: 0.35},
      {...w('tetines'), src: 'boing', volume: 0.25},
      {...w('lechent'), src: 'lick', volume: 0.3},
    ],
  },
  bizarre: {
    ambience: AMB,
    cues: [
      {...w("d'estomac"), src: 'boing', volume: 0.25},
      {...w('venimeux'), src: 'mystery', volume: 0.2},
      {...w('ko'), src: 'thud', volume: 0.35},
      {...w("l'eau"), src: 'plouf', volume: 0.3},
      {...w('ferme'), src: 'bloop', volume: 0.3},
      {...w("l'electricite"), src: 'sparkle', volume: 0.3},
    ],
  },
  conclusion: {ambience: AMB, cues: [{...w('annees'), src: 'click', volume: 0.3}, {...w('precieux'), src: 'sparkle', volume: 0.3}, {...w('bizarres'), src: 'boing', volume: 0.25}, {...w('uniques'), src: 'fanfare', volume: 0.15}]},
  question: {ambience: AMB, cues: [{...w('famille'), src: 'pop', volume: 0.3}, {...w('celui'), src: 'ding', volume: 0.25}, {...w('commentaire'), src: 'chime', volume: 0.25}]},
  abonne: {ambience: AMB, cues: [{frame: 4, src: 'pop', volume: 0.35}, {frame: 18, src: 'honk', volume: 0.15}, {at: 0.58, src: 'pop', volume: 0.3}, {at: 0.66, src: 'ding', volume: 0.3}]},
};

// Petite harpe à chaque changement de scène, et marimba sous la voix.
export const TRANSITION = {src: 'harp', volume: 0.14};
export const MUSIC = {src: 'music', volume: 0.06};
