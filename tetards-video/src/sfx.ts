// Feuille de bruitage — rigolote mais douce (pas de vent, pas de bruits violents).
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.
// Les ambiances jouent en boucle entre `from` et `to` (même syntaxe), par défaut toute la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});
const AMB = {src: 'amb_water', volume: 0.2};

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {ambience: [AMB], cues: [{...w('milliers'), src: 'bloop', volume: 0.3}, {...w('maisons'), src: 'pop', volume: 0.3}]},
  plage: {ambience: [AMB], cues: [{...w('matin'), src: 'chime', volume: 0.2}, {...w('soir'), src: 'harp', volume: 0.15}, {...w('trompent'), src: 'pop', volume: 0.3}, {...w('devores'), src: 'boing', volume: 0.25}]},
  armee: {
    ambience: [AMB],
    cues: [{...w('centaines'), src: 'bloop', volume: 0.3}, {...w('regroupent'), src: 'bloop', volume: 0.3}, {...w('dizaines'), src: 'sparkle', volume: 0.25}, {...w('manger'), src: 'pop', volume: 0.3}, {...w('dormir'), src: 'snore', volume: 0.2}, {...w('grandir'), src: 'pop', volume: 0.3}],
  },
  croissance: {ambience: [AMB], cues: [{...w('bords'), src: 'patter', volume: 0.2}, {...w('5'), src: 'ding', volume: 0.25}, {...w('chaude'), src: 'sparkle', volume: 0.25}, {...w('algues'), src: 'bloop', volume: 0.3}]},
  retour: {ambience: [AMB], cues: [{...w('nuit'), src: 'harp', volume: 0.15}, {...w('profondes'), src: 'bloop', volume: 0.3}, {...w('travailleurs'), src: 'pop', volume: 0.3}]},
  monstres: {
    ambience: [AMB],
    cues: [{...w('predateurs'), src: 'mystery', volume: 0.25}, {...w('larve'), src: 'pop', volume: 0.3}, {...w('projette'), src: 'boing', volume: 0.25}, {...w('autre', 0.3), src: 'boing', volume: 0.2}, {...w('sangsues'), src: 'mystery', volume: 0.2}],
  },
  transformation: {ambience: [AMB], cues: [{...w('pattes'), src: 'sparkle', volume: 0.25}, {...w('queue'), src: 'sparkle', volume: 0.25}, {...w('metamorphose'), src: 'ding', volume: 0.3}]},
  depart: {ambience: [AMB], cues: [{...w('millier', 0, 1), src: 'pop', volume: 0.3}, {...w('quittent'), src: 'patter', volume: 0.3}, {...w('adultes'), src: 'croak', volume: 0.3}, {...w('naissance'), src: 'chime', volume: 0.2}]},
  conclusion: {ambience: [AMB], cues: [{...w('aventure'), src: 'pop', volume: 0.3}, {...w('survivant'), src: 'ding', volume: 0.3}]},
  abonne: {ambience: [AMB], cues: [{frame: 4, src: 'pop', volume: 0.35}, {frame: 20, src: 'croak', volume: 0.25}, {at: 0.58, src: 'pop', volume: 0.3}, {at: 0.66, src: 'ding', volume: 0.3}]},
};

// Petite harpe à chaque changement de scène, et marimba sous la voix.
export const TRANSITION = {src: 'harp', volume: 0.14};
export const MUSIC = {src: 'music', volume: 0.06};
