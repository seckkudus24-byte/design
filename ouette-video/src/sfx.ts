// Feuille de bruitage — volontairement douce (pas de vent, pas de bruits violents).
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.
// Les ambiances jouent en boucle entre `from` et `to` (même syntaxe), par défaut toute la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {
    ambience: [],
    cues: [{...w('aimes'), src: 'chime', volume: 0.18}],
  },
  histoire: {
    ambience: [],
    cues: [
      {...w('europe'), src: 'pop', volume: 0.25},
      {...w('vraie'), src: 'pop', volume: 0.25},
      {...w('milliers'), src: 'sparkle', volume: 0.15},
    ],
  },
  couple: {
    ambience: [{src: 'amb_river', volume: 0.12}],
    cues: [
      {...w('ouette'), src: 'pop', volume: 0.25},
      {...w("d'oie"), src: 'pop', volume: 0.22},
      {...w('ensemble'), src: 'chime', volume: 0.15},
      {...w('petits'), src: 'peeps', volume: 0.22},
    ],
  },
  drame: {
    ambience: [{src: 'amb_river', volume: 0.1, to: w('gele')}],
    cues: [
      {...w('gele'), src: 'ice', volume: 0.25},
      {...w('inconnue'), src: 'pop', volume: 0.2},
      {...w('reste'), src: 'peeps', volume: 0.18},
      {...w('attendait'), src: 'chime', volume: 0.14},
    ],
  },
  passant: {
    ambience: [],
    cues: [
      {...w('homme'), src: 'snow_steps', volume: 0.3},
      {...w('compris'), src: 'sparkle', volume: 0.18},
      {...w('habitants'), src: 'snow_steps', volume: 0.25},
      {...w('recuperer'), src: 'peeps', volume: 0.2},
      {...w('recuperer', 2), src: 'peeps', volume: 0.2},
      {...w('applaudissaient', -0.1), src: 'applause', volume: 0.3},
    ],
  },
  pere: {
    ambience: [{src: 'fire', volume: 0.22, from: w('chez')}],
    cues: [
      {...w('approcher'), src: 'snow_steps', volume: 0.25},
      {...w('perdre'), src: 'chime', volume: 0.12},
      {...w('filet'), src: 'wings', volume: 0.18},
      {...w('chez'), src: 'pop', volume: 0.2},
      {...w('mangeaient'), src: 'peeps', volume: 0.2},
    ],
  },
  fin: {
    ambience: [],
    cues: [
      {...w('envole'), src: 'wings', volume: 0.22},
      {...w('quelques'), src: 'pop', volume: 0.2},
      {...w('retourne'), src: 'wings', volume: 0.18},
      {...w('fige'), src: 'ice', volume: 0.18},
      {...w('disparu'), src: 'chime', volume: 0.16},
    ],
  },
  conclusion: {
    ambience: [],
    cues: [
      {...w('lien'), src: 'sparkle', volume: 0.15},
      {...w("l'attachement"), src: 'chime', volume: 0.18},
    ],
  },
  abonne: {
    ambience: [],
    cues: [
      {frame: 4, src: 'pop', volume: 0.25},
      {at: 0.58, src: 'pop', volume: 0.25},
      {at: 0.66, src: 'chime', volume: 0.18},
    ],
  },
};

// Petite harpe à chaque changement de scène, et piano doux sous la voix.
export const TRANSITION = {src: 'harp', volume: 0.12};
export const MUSIC = {src: 'music', volume: 0.09};
