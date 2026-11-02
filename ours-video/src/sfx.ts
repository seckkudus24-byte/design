// Feuille de bruitage — avec de vrais cris d'ours (rugissements, grognements, souffles), sans vent.
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});
const AMB = [{src: 'amb_forest', volume: 0.08}, {src: 'amb_river', volume: 0.05}];

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {ambience: AMB, cues: [{...w('ours'), src: 'roar', volume: 0.45}, {...w('mort'), src: 'thud', volume: 0.3}, {...w('diner'), src: 'growl', volume: 0.35}]},
  technique: {ambience: AMB, cues: [{...w("l'ours"), src: 'growl', volume: 0.3}, {...w('technique'), src: 'click', volume: 0.3}, {...w('monde'), src: 'boing', volume: 0.25}]},
  reconnaitre: {
    ambience: AMB,
    cues: [
      {...w('reconnaitre'), src: 'mystery', volume: 0.2},
      {...w('couleur'), src: 'pop', volume: 0.3},
      {...w('epaules'), src: 'ding', volume: 0.2},
      {...w('grizzly'), src: 'roar', volume: 0.35},
      {...w('bosse'), src: 'sparkle', volume: 0.25},
      {...w('noir'), src: 'huff', volume: 0.4},
      {...w('grimpe'), src: 'scratch', volume: 0.3},
    ],
  },
  grizzly: {
    ambience: AMB,
    cues: [
      {...w('grizzly'), src: 'roar', volume: 0.45},
      {...w("t'attaque"), src: 'growl', volume: 0.35},
      {...w('allonge-toi'), src: 'thud', volume: 0.3},
      {...w('retourner'), src: 'growl', volume: 0.3},
      {...w('sac'), src: 'pop', volume: 0.3},
      {...w('defendre'), src: 'roar', volume: 0.3},
      {...w('bouges'), src: 'sniff', volume: 0.35},
      {...w('comprend'), src: 'sniff', volume: 0.3},
      {...w('partir'), src: 'clop', volume: 0.2},
    ],
  },
  noir: {
    ambience: AMB,
    cues: [
      {...w('noir'), src: 'huff', volume: 0.45},
      {...w('bats-toi'), src: 'roar', volume: 0.35},
      {...w('assiette'), src: 'ding', volume: 0.3},
      {...w('crie'), src: 'whoosh', volume: 0.2},
      {...w('attaque'), src: 'growl', volume: 0.35},
      {...w('frappe-le'), src: 'knock', volume: 0.3},
      {...w('museau'), src: 'boing', volume: 0.3},
    ],
  },
  conclusion: {ambience: AMB, cues: [{...w('calme'), src: 'chime', volume: 0.2}, {...w('tete'), src: 'huff', volume: 0.35}, {...w('ignorer'), src: 'pop', volume: 0.3}, {...w('affronter'), src: 'fanfare', volume: 0.15}]},
  question: {ambience: AMB, cues: [{...w('mort'), src: 'thud', volume: 0.3}, {...w('battrais'), src: 'roar', volume: 0.3}, {...w('commentaire'), src: 'chime', volume: 0.25}]},
  abonne: {ambience: AMB, cues: [{frame: 4, src: 'pop', volume: 0.35}, {frame: 18, src: 'growl', volume: 0.2}, {at: 0.58, src: 'pop', volume: 0.3}, {at: 0.66, src: 'ding', volume: 0.3}]},
};

// Petite harpe à chaque changement de scène, et marimba sous la voix.
export const TRANSITION = {src: 'harp', volume: 0.14};
export const MUSIC = {src: 'music', volume: 0.06};
