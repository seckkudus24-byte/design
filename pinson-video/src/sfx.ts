// Feuille de bruitage — douce (pas de vent, pas de bruits violents).
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});
const AMB = [{src: 'amb_sea', volume: 0.08}, {src: 'amb_birds', volume: 0.06}];

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {ambience: AMB, cues: [{...w('oiseau'), src: 'chirp', volume: 0.3}, {...w('sang'), src: 'slurp', volume: 0.2}, {...w('dix'), src: 'pop', volume: 0.3}, {...w('reagisse'), src: 'honk', volume: 0.25}]},
  horreur: {ambience: [], cues: [{...w("d'horreur"), src: 'mystery', volume: 0.3}, {...w('ile'), src: 'chime', volume: 0.2}]},
  vampire: {
    ambience: AMB,
    cues: [
      {...w('vampire'), src: 'mystery', volume: 0.25},
      {...w('pinson'), src: 'chirps', volume: 0.2},
      {...w('fou'), src: 'honk', volume: 0.25},
      {...w('pique'), src: 'knock', volume: 0.2},
      {...w('boit'), src: 'slurp', volume: 0.25},
      {...w('laisse'), src: 'boing', volume: 0.25},
    ],
  },
  pourquoi: {
    ambience: AMB,
    cues: [
      {...w('graines'), src: 'patter', volume: 0.2},
      {...w('four'), src: 'sizzle', volume: 0.2},
      {...w('pleut'), src: 'boing', volume: 0.2},
      {...w('grillent'), src: 'sizzle', volume: 0.2},
      {...w('traverser'), src: 'aww', volume: 0.2},
      {...w('solution'), src: 'ding', volume: 0.3},
    ],
  },
  service: {
    ambience: AMB,
    cues: [
      {...w('parasites'), src: 'scratch', volume: 0.25},
      {...w('atteindre'), src: 'boing', volume: 0.25},
      {...w('picorer'), src: 'knock', volume: 0.2},
      {...w('masser'), src: 'snore', volume: 0.15},
      {...w('gagnants'), src: 'fanfare', volume: 0.15},
    ],
  },
  derape: {
    ambience: AMB,
    cues: [
      {...w('derape'), src: 'mystery', volume: 0.3},
      {...w('retirant'), src: 'pop', volume: 0.3},
      {...w('perce'), src: 'plic', volume: 0.3},
      {...w('goute'), src: 'slurp', volume: 0.2},
      {...w('tresor'), src: 'sparkle', volume: 0.3},
      {...w('meilleur'), src: 'ding', volume: 0.25},
      {...w('vampire'), src: 'mystery', volume: 0.25},
    ],
  },
  reagit: {
    ambience: AMB,
    cues: [
      {...w('gentil'), src: 'chime', volume: 0.2},
      {...w('faible'), src: 'pop', volume: 0.25},
      {...w('poursuivre'), src: 'wings', volume: 0.2},
      {...w("d'energie"), src: 'aww', volume: 0.2},
      {...w('laisse'), src: 'honk', volume: 0.2},
    ],
  },
  conclusion: {ambience: AMB, cues: [{...w('survecu'), src: 'sparkle', volume: 0.3}, {...w('service'), src: 'chime', volume: 0.2}, {...w('profiter'), src: 'mystery', volume: 0.2}, {...w('personne'), src: 'boing', volume: 0.25}]},
  question: {ambience: AMB, cues: [{...w("t'aider"), src: 'chime', volume: 0.2}, {...w('sucer'), src: 'slurp', volume: 0.2}, {...w('commentaire'), src: 'chime', volume: 0.25}]},
  abonne: {ambience: AMB, cues: [{frame: 4, src: 'pop', volume: 0.35}, {frame: 18, src: 'chirp', volume: 0.2}, {at: 0.58, src: 'pop', volume: 0.3}, {at: 0.66, src: 'ding', volume: 0.3}]},
};

// Petite harpe à chaque changement de scène, et marimba sous la voix.
export const TRANSITION = {src: 'harp', volume: 0.14};
export const MUSIC = {src: 'music', volume: 0.06};
