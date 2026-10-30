// Feuille de bruitage — rigolote mais douce (pas de vent, pas de bruits violents).
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.
// Les ambiances jouent en boucle entre `from` et `to` (même syntaxe), par défaut toute la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});
const AMB = {src: 'amb_forest', volume: 0.16};

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {
    ambience: [AMB],
    cues: [
      {...w('chaise'), src: 'pop', volume: 0.35},
      {...w('anglaise'), src: 'flush', volume: 0.25},
    ],
  },
  vivante: {
    ambience: [AMB],
    cues: [
      {...w('vivante'), src: 'sparkle', volume: 0.3},
      {...w('jungle'), src: 'boing', volume: 0.25},
      {...w('insectes', 0.5), src: 'plouf', volume: 0.3},
    ],
  },
  rituel: {
    ambience: [AMB],
    cues: [
      {...w('borneo'), src: 'pop', volume: 0.3},
      {...w('toupaye'), src: 'patter', volume: 0.3},
      {...w('mini-ecureuil'), src: 'pop', volume: 0.3},
      {...w('matin', 0, 1), src: 'chime', volume: 0.2},
      {...w('toilettes'), src: 'patter', volume: 0.35},
    ],
  },
  toilettes: {
    ambience: [AMB],
    cues: [
      {...w('nepenthes'), src: 'pop', volume: 0.35},
      {...w('cuvette'), src: 'sparkle', volume: 0.25},
      {...w('rebord'), src: 'pop', volume: 0.3},
      {...w('couvercle'), src: 'pop', volume: 0.3},
      {...w('expres'), src: 'ding', volume: 0.25},
    ],
  },
  deal: {
    ambience: [AMB],
    cues: [
      {...w('nectar'), src: 'sparkle', volume: 0.3},
      {...w('bonbon'), src: 'pop', volume: 0.3},
      {...w("s'installe"), src: 'patter', volume: 0.3},
      {...w('leche'), src: 'lick', volume: 0.35},
      {...w('besoins'), src: 'plop', volume: 0.35},
      {...w('besoins', 0.5), src: 'plop', volume: 0.3},
      {...w('petit-dej'), src: 'flush', volume: 0.25},
    ],
  },
  plante: {
    ambience: [AMB],
    cues: [
      {...w('tresor'), src: 'sparkle', volume: 0.3},
      {...w('pauvres'), src: 'pop', volume: 0.25},
      {...w("d'azote"), src: 'pop', volume: 0.3},
      {...w('ventre'), src: 'patter', volume: 0.25},
      {...w('regale'), src: 'chime', volume: 0.2},
      {...w('contrat'), src: 'ding', volume: 0.3},
    ],
  },
  piege: {
    ambience: [AMB, {src: 'rain', volume: 0.25, from: w('pluie', -0.2)}],
    cues: [
      {...w('pieges'), src: 'pop', volume: 0.3},
      {...w('fourmis'), src: 'patter', volume: 0.2},
      {...w('goutte'), src: 'plic', volume: 0.45},
      {...w('glisse'), src: 'boing', volume: 0.2},
      {...w('plonge'), src: 'plouf', volume: 0.35},
    ],
  },
  hotel: {
    ambience: [],
    cues: [
      {...w('chauve-souris'), src: 'squeak', volume: 0.25},
      {...w('chauve-souris', 0.2), src: 'wings', volume: 0.25},
      {...w('chambre'), src: 'ding', volume: 0.25},
      {...w('dort'), src: 'snore', volume: 0.3},
      {...w('paye'), src: 'plop', volume: 0.35},
    ],
  },
  conclusion: {
    ambience: [AMB],
    cues: [
      {...w('toilettes'), src: 'pop', volume: 0.3},
      {...w('piege'), src: 'pop', volume: 0.3},
      {...w('hotel'), src: 'pop', volume: 0.3},
      {...w('extraordinaire'), src: 'sparkle', volume: 0.3},
    ],
  },
  abonne: {
    ambience: [AMB],
    cues: [
      {frame: 4, src: 'pop', volume: 0.35},
      {at: 0.58, src: 'pop', volume: 0.3},
      {at: 0.66, src: 'ding', volume: 0.3},
    ],
  },
};

// Petite harpe à chaque changement de scène, et marimba sous la voix.
export const TRANSITION = {src: 'harp', volume: 0.14};
export const MUSIC = {src: 'music', volume: 0.06};
