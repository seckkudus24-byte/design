// Feuille de bruitage — douce (pas de vent, pas de bruits violents).
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.
// Les ambiances jouent en boucle entre `from` et `to` (même syntaxe), par défaut toute la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});
const AMB = [{src: 'amb_sea', volume: 0.1}, {src: 'amb_birds', volume: 0.08}];

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {ambience: AMB, cues: [{...w('mois'), src: 'pop', volume: 0.3}, {...w('chaud'), src: 'sparkle', volume: 0.25}]},
  plumes: {ambience: AMB, cues: [{...w("s'arracher"), src: 'patter', volume: 0.25}, {...w('ennemis'), src: 'mystery', volume: 0.2}]},
  nid: {
    ambience: AMB,
    cues: [
      {...w("l'eider"), src: 'call', volume: 0.25},
      {...w('islande'), src: 'pop', volume: 0.3},
      {...w('vallee'), src: 'pop', volume: 0.25},
      {...w('crete'), src: 'ding', volume: 0.2},
      {...w('pourquoi'), src: 'boing', volume: 0.25},
      {...w('renards'), src: 'mystery', volume: 0.2},
    ],
  },
  voisin: {
    ambience: AMB,
    cues: [{...w('goelands'), src: 'kiik', volume: 0.25}, {...w('ferocite'), src: 'kiik', volume: 0.25}, {...w('protection'), src: 'chime', volume: 0.2}, {...w('petits'), src: 'peep', volume: 0.3}, {...w('pari'), src: 'ding', volume: 0.25}],
  },
  duvet: {
    ambience: AMB,
    cues: [{...w('38'), src: 'pop', volume: 0.3}, {...w("s'arrache"), src: 'patter', volume: 0.25}, {...w('couette'), src: 'pop', volume: 0.3}, {...w('isolants'), src: 'chime', volume: 0.2}, {...w("l'or", 0, 1), src: 'sparkle', volume: 0.3}, {...w('luxe'), src: 'ding', volume: 0.25}],
  },
  jeune: {ambience: AMB, cues: [{...w('semaines'), src: 'clock', volume: 0.2}, {...w('mange'), src: 'boing', volume: 0.2}, {...w('graisse'), src: 'pop', volume: 0.3}, {...w('40'), src: 'ding', volume: 0.3}]},
  saut: {
    ambience: AMB,
    cues: [
      {...w('eclosent'), src: 'peeps', volume: 0.3},
      {...w('manger'), src: 'boing', volume: 0.2},
      {...w('heures'), src: 'clock', volume: 0.2},
      {...w('mer'), src: 'pop', volume: 0.3},
      {...w('sauter'), src: 'peep', volume: 0.3},
      {...w('sauter', 0.4), src: 'boing', volume: 0.25},
      {...w('sauter', 0.8), src: 'boing', volume: 0.22},
      {...w('amortissent'), src: 'sparkle', volume: 0.25},
    ],
  },
  cri: {
    ambience: AMB,
    cues: [
      {...w('attaquent'), src: 'kiik', volume: 0.3},
      {...w('seule'), src: 'peeps', volume: 0.25},
      {...w('cri', 0, 1), src: 'call', volume: 0.35},
      {...w('cri', 0.5, 1), src: 'call', volume: 0.3},
      {...w("l'aide"), src: 'chime', volume: 0.2},
      {...w('mamans'), src: 'wings', volume: 0.2},
      {...w('partout'), src: 'peeps', volume: 0.25},
    ],
  },
  creche: {
    ambience: AMB,
    cues: [{...w('cercle'), src: 'patter', volume: 0.25}, {...w('creche', 0, 1), src: 'ding', volume: 0.25}, {...w('mur'), src: 'pop', volume: 0.3}, {...w('plongent'), src: 'kiik', volume: 0.25}, {...w("d'ouverture"), src: 'boing', volume: 0.25}],
  },
  conclusion: {
    ambience: AMB,
    cues: [{...w('plonge'), src: 'plouf', volume: 0.35}, {...w('reposer'), src: 'snore', volume: 0.2}, {...w('manger'), src: 'chomp', volume: 0.3}, {...w("l'entraide"), src: 'chime', volume: 0.25}, {...w('survecu'), src: 'sparkle', volume: 0.3}],
  },
  abonne: {ambience: AMB, cues: [{frame: 4, src: 'pop', volume: 0.35}, {frame: 18, src: 'peep', volume: 0.25}, {at: 0.58, src: 'pop', volume: 0.3}, {at: 0.66, src: 'ding', volume: 0.3}]},
};

// Petite harpe à chaque changement de scène, et marimba sous la voix.
export const TRANSITION = {src: 'harp', volume: 0.14};
export const MUSIC = {src: 'music', volume: 0.06};
