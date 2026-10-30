// Feuille de bruitage. Chaque son se cale comme les animations :
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.
// Les ambiances jouent en boucle entre `from` et `to` (même syntaxe), par défaut toute la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});
const repeat = (src: string, volume: number, word: string, start: number, step: number, count: number): Cue[] =>
  Array.from({length: count}, (_, i) => ({...w(word, start + i * step), src, volume}));

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {
    ambience: [{src: 'amb_forest', volume: 0.25}],
    cues: [
      {...w('russie'), src: 'pop', volume: 0.45},
      ...repeat('glide', 0.3, 'planer', -0.3, 70 / 30, 2),
      {...w('parachutiste'), src: 'boing', volume: 0.35},
    ],
  },
  presentation: {
    ambience: [{src: 'amb_forest', volume: 0.22}],
    cues: [
      {frame: 6, src: 'pop', volume: 0.4},
      {...w('polatouche'), src: 'pop', volume: 0.45},
      {...w('yeux'), src: 'sparkle', volume: 0.3},
      {...w('mignonne'), src: 'aww', volume: 0.3},
      {...w('dangereux'), src: 'buzzer', volume: 0.2},
      {...w('mourir', 0.3), src: 'thud', volume: 0.45},
    ],
  },
  plane: {
    ambience: [{src: 'amb_forest', volume: 0.22}],
    cues: [
      {...w('membrane'), src: 'pop', volume: 0.45},
      {...w('saute'), src: 'boing', volume: 0.3},
      ...repeat('glide', 0.35, 'saute', 0.1, 75 / 30, 6),
      {...w('dizaines'), src: 'pop', volume: 0.45},
      {...w('technique'), src: 'sparkle', volume: 0.35},
    ],
  },
  ecureuil: {
    ambience: [{src: 'amb_forest', volume: 0.22}],
    cues: [
      {...w('rat'), src: 'pop', volume: 0.45},
      {...w('bien'), src: 'buzzer', volume: 0.2},
      {...w('bien', 0.25), src: 'ding', volume: 0.3},
      {...w('famille'), src: 'pop', volume: 0.45},
      {...w('arbres'), src: 'chirp', volume: 0.25},
      {...w('descend'), src: 'pop', volume: 0.4},
    ],
  },
  locataire: {
    ambience: [{src: 'amb_forest', volume: 0.22}],
    cues: [
      {...w('construire'), src: 'pop', volume: 0.4},
      {...w('construire', 0.3), src: 'buzzer', volume: 0.2},
      {...w("s'installe"), src: 'boing', volume: 0.35},
      {...w('pics'), src: 'knock', volume: 0.45},
      {...w('pics', 0.8), src: 'knock', volume: 0.4},
      {...w('abri'), src: 'ding', volume: 0.3},
      {...w('hauteur'), src: 'hoot', volume: 0.35},
    ],
  },
  hiver: {
    ambience: [{src: 'amb_wind', volume: 0.3}],
    cues: [
      {frame: 6, src: 'frost', volume: 0.3},
      {frame: 20, src: 'buzzer', volume: 0.18},
      ...repeat('glide', 0.3, 'actif', 0, 2, 2),
      {...w('glaciales'), src: 'frost', volume: 0.35},
      {...w('noix'), src: 'pop', volume: 0.45},
      {...w('feuilles'), src: 'pop', volume: 0.45},
      {...w('bourgeons'), src: 'pop', volume: 0.45},
      {...w('fourrure'), src: 'boing', volume: 0.35},
    ],
  },
  discret: {
    ambience: [
      {src: 'amb_forest', volume: 0.18, to: w('nuit')},
      {src: 'amb_night', volume: 0.28, from: w('nuit', -0.5)},
    ],
    cues: [
      {...w('nuit', 0.4), src: 'hoot', volume: 0.25},
      {...w('yeux'), src: 'sparkle', volume: 0.3},
      {...w('rarement'), src: 'mystery', volume: 0.25},
    ],
  },
  conclusion: {
    ambience: [{src: 'amb_forest', volume: 0.22}],
    cues: [
      {...w('photo'), src: 'pop', volume: 0.45},
      {...w('saut', -0.2), src: 'shutter', volume: 0.5},
      {...w('saut', -0.1), src: 'glide', volume: 0.35},
      {...w('saut', 0.6), src: 'boing', volume: 0.35},
    ],
  },
  abonne: {
    ambience: [{src: 'amb_forest', volume: 0.18}],
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
