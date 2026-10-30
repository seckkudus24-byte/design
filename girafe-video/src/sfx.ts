// Feuille de bruitage — rigolote mais douce (pas de vent, pas de bruits violents).
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.
// Les ambiances jouent en boucle entre `from` et `to` (même syntaxe), par défaut toute la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});
const AMB = {src: 'amb_savanna', volume: 0.15};

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {ambience: [AMB], cues: [{frame: 6, src: 'pop', volume: 0.3}, {...w('metres'), src: 'sparkle', volume: 0.25}, {...w('naissance'), src: 'ding', volume: 0.25}]},
  oui: {ambience: [AMB], cues: [{...w('humains'), src: 'patter', volume: 0.25}, {...w('etranges'), src: 'pop', volume: 0.25}]},
  naissance: {
    ambience: [AMB],
    cues: [
      {...w('tombe', 0.4), src: 'boing', volume: 0.35},
      {...w('choc'), src: 'sparkle', volume: 0.25},
      {...w('respiration'), src: 'chime', volume: 0.2},
      {...w('45'), src: 'pop', volume: 0.3},
      {...w('heure'), src: 'pop', volume: 0.3},
      {...w('debout', 0, 1), src: 'clop', volume: 0.3},
    ],
  },
  dormir: {ambience: [AMB], cues: [{...w('sommeil'), src: 'snore', volume: 0.3}, {...w('tanguer'), src: 'boing', volume: 0.2}, {...w('bus'), src: 'honk', volume: 0.18}]},
  geant: {
    ambience: [AMB],
    cues: [
      {...w('adulte'), src: 'sparkle', volume: 0.3},
      {...w('grand'), src: 'ding', volume: 0.25},
      {...w('minuscules'), src: 'pop', volume: 0.3},
      {...w('tonnes'), src: 'pop', volume: 0.3},
      {...w('zoos'), src: 'pop', volume: 0.3},
    ],
  },
  boire: {ambience: [AMB], cues: [{...w('ecarter'), src: 'boing', volume: 0.2}, {...w('baisser', 0.6), src: 'slurp', volume: 0.3}, {...w('dangereuse'), src: 'pop', volume: 0.3}]},
  demarche: {
    ambience: [AMB, {src: 'clop', volume: 0.3}],
    cues: [{...w('cogner'), src: 'boing', volume: 0.25}, {...w('gauche-gauche'), src: 'pop', volume: 0.3}, {...w('droite-droite'), src: 'pop', volume: 0.3}, {...w('chameau'), src: 'sparkle', volume: 0.25}],
  },
  demenager: {ambience: [AMB], cues: [{frame: 6, src: 'honk', volume: 0.18}, {...w('casse-tete'), src: 'pop', volume: 0.3}, {...w('ponts'), src: 'pop', volume: 0.3}, {...w('fils'), src: 'plic', volume: 0.35}]},
  douce: {
    ambience: [AMB],
    cues: [{...w('calme'), src: 'chime', volume: 0.2}, {...w('coup'), src: 'boing', volume: 0.3}, {...w('rhinoceros'), src: 'sparkle', volume: 0.25}, {...w('lion'), src: 'patter', volume: 0.3}],
  },
  conclusion: {ambience: [AMB], cues: [{...w('geant'), src: 'pop', volume: 0.3}, {...w('verre'), src: 'plic', volume: 0.35}, {...w('aventure'), src: 'ding', volume: 0.25}]},
  abonne: {ambience: [AMB], cues: [{frame: 4, src: 'pop', volume: 0.35}, {at: 0.58, src: 'pop', volume: 0.3}, {at: 0.66, src: 'ding', volume: 0.3}]},
};

// Petite harpe à chaque changement de scène, et marimba sous la voix.
export const TRANSITION = {src: 'harp', volume: 0.14};
export const MUSIC = {src: 'music', volume: 0.06};
