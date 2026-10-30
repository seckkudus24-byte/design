// Feuille de bruitage. Chaque son se cale comme les animations :
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.
// Les ambiances jouent en boucle entre `from` et `to` (même syntaxe), par défaut toute la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {
    ambience: [{src: 'amb_wind', volume: 0.25}],
    cues: [
      {...w('eponge'), src: 'boing', volume: 0.45},
      {...w('eponge', 0.05), src: 'pop', volume: 0.4},
      {...w('petits'), src: 'chirps', volume: 0.2},
    ],
  },
  ganga: {
    ambience: [{src: 'amb_wind', volume: 0.25}],
    cues: [
      {frame: 4, src: 'thud', volume: 0.3},
      {frame: 16, src: 'thud', volume: 0.3},
      {frame: 28, src: 'thud', volume: 0.3},
      {frame: 40, src: 'pop', volume: 0.45},
      {...w('chaudes'), src: 'sizzle', volume: 0.35},
      {...w('seches'), src: 'crack', volume: 0.45},
      {...w('secret'), src: 'mystery', volume: 0.3},
    ],
  },
  nid: {
    ambience: [{src: 'amb_wind', volume: 0.22}],
    cues: [
      {...w('arbre'), src: 'pop', volume: 0.4},
      {...w('arbre', 0.3), src: 'buzzer', volume: 0.25},
      {...w('pond'), src: 'pop', volume: 0.45},
      {...w('abri'), src: 'sizzle', volume: 0.35},
      {...w('45', -0.2), src: 'rise', volume: 0.3},
      {...w('poussins', -0.3), src: 'crack', volume: 0.5},
      {...w('poussins', 0.2), src: 'chirps', volume: 0.22},
      {...w('nourriture'), src: 'pop', volume: 0.45},
    ],
  },
  vol: {
    ambience: [
      {src: 'amb_wind', volume: 0.3},
      {src: 'wings', volume: 0.35, to: w('seul')},
      {src: 'flock', volume: 0.4, from: w('seul')},
    ],
    cues: [
      {...w('dizaines', -0.15), src: 'pop', volume: 0.45},
      ...Array.from({length: 14}, (_, i) => ({...w('dizaines', i * 0.14), src: 'tick', volume: 0.3})),
      {...w('jour'), src: 'pop', volume: 0.45},
      {...w('autour', 0.2), src: 'screech', volume: 0.35},
      {...w('autour', 0.9), src: 'snarl', volume: 0.45},
    ],
  },
  eponge: {
    ambience: [
      {src: 'amb_wind', volume: 0.2},
      {src: 'slosh', volume: 0.35, from: w('balance'), to: w('25')},
      {src: 'clock', volume: 0.35, from: w('15')},
    ],
    cues: [
      {...w('poitrine'), src: 'pop', volume: 0.45},
      {...w('spirale'), src: 'sparkle', volume: 0.3},
      {...w('entre', 0.3), src: 'splash', volume: 0.45},
      {...w('eponge'), src: 'boing', volume: 0.35},
      {...w('25'), src: 'pop', volume: 0.45},
      {...w('15'), src: 'pop', volume: 0.45},
    ],
  },
  retour: {
    ambience: [
      {src: 'amb_wind', volume: 0.22},
      {src: 'wings', volume: 0.35, to: w('la', 0.5, 1)},
      {src: 'slurp', volume: 0.35, from: w('boivent'), to: w('survivre')},
    ],
    cues: [
      {...w('la', 0.6, 1), src: 'thud', volume: 0.4},
      {...w('assoiffes'), src: 'chirps', volume: 0.25},
      {...w('precipitent'), src: 'chirps', volume: 0.25},
      {...w('4'), src: 'pop', volume: 0.45},
      {...w('survivre'), src: 'sparkle', volume: 0.35},
    ],
  },
  conclusion: {
    ambience: [{src: 'amb_wind', volume: 0.2}],
    cues: [
      {frame: 6, src: 'sparkle', volume: 0.25},
      {...w('recommence'), src: 'pop', volume: 0.4},
      {...w('recommence', 0.1), src: 'wings', volume: 0.3},
      {...w('infatigable'), src: 'fanfare', volume: 0.3},
      {...w('goutte'), src: 'sparkle', volume: 0.35},
      {...w('vie'), src: 'ding', volume: 0.35},
    ],
  },
  abonne: {
    ambience: [{src: 'amb_wind', volume: 0.18}],
    cues: [
      {frame: 4, src: 'pop', volume: 0.5},
      {at: 0.58, src: 'click', volume: 0.6},
      {at: 0.66, src: 'ding', volume: 0.4},
    ],
  },
};

// Petit whoosh à chaque changement de scène, et musique de fond sous la voix.
export const TRANSITION = {src: 'whoosh', volume: 0.25};
export const MUSIC = {src: 'music', volume: 0.06};
