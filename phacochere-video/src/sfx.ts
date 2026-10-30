// Feuille de bruitage. Chaque son se cale comme les animations :
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.
// Les ambiances jouent en boucle entre `from` et `to` (même syntaxe), par défaut toute la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});
const AMB = {src: 'amb_savanna', volume: 0.22};

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {
    ambience: [AMB],
    cues: [
      {...w('afrique'), src: 'pop', volume: 0.45},
      {...w('couchent'), src: 'grunt', volume: 0.4},
      {...w('masser'), src: 'aww', volume: 0.25},
      {...w('mangoustes'), src: 'kiik', volume: 0.35},
    ],
  },
  blague: {
    ambience: [AMB],
    cues: [
      {frame: 4, src: 'boing', volume: 0.35},
      {...w('pourtant'), src: 'pop', volume: 0.4},
      {...w('partenariats'), src: 'sparkle', volume: 0.35},
    ],
  },
  tiques: {
    ambience: [AMB, {src: 'scratch', volume: 0.35, to: w('tiques', 0, 0)}],
    cues: [
      {...w('tiques'), src: 'pop', volume: 0.4},
      {...w('crochets'), src: 'pop', volume: 0.45},
      {...w('sang'), src: 'mystery', volume: 0.2},
      {...w('jours'), src: 'pop', volume: 0.4},
      {...w('nombreux'), src: 'buzzer', volume: 0.18},
      {...w('lent', 0.3), src: 'growl', volume: 0.4},
      {...w('boue', 0.3), src: 'mud', volume: 0.5},
      {...w('boue', 0.6), src: 'grunt', volume: 0.35},
    ],
  },
  mangoustes: {
    ambience: [AMB],
    cues: [
      {frame: 4, src: 'pop', volume: 0.4},
      {...w('mangoustes'), src: 'kiik', volume: 0.4},
      {...w('groupe'), src: 'pop', volume: 0.4},
      {...w('insectes'), src: 'chomp', volume: 0.45},
      {...w('insectes', 0.5), src: 'chomp', volume: 0.4},
      {...w('tiques'), src: 'pop', volume: 0.45},
    ],
  },
  signal: {
    ambience: [AMB],
    cues: [
      {frame: 6, src: 'mystery', volume: 0.3},
      {...w('mefiant'), src: 'grunt', volume: 0.35},
      {...w('proie'), src: 'growl', volume: 0.4},
      {...w('groupe'), src: 'kiik', volume: 0.35},
      {...w('plie'), src: 'boing', volume: 0.3},
      {...w('invitation'), src: 'ding', volume: 0.35},
    ],
  },
  nettoyage: {
    ambience: [AMB],
    cues: [
      {frame: 4, src: 'fanfare', volume: 0.25},
      {...w('grimpent'), src: 'kiik', volume: 0.35},
      {...w('odorat'), src: 'sniff', volume: 0.45},
      {...w('reperent'), src: 'sparkle', volume: 0.3},
      {...w('oreilles'), src: 'sniff', volume: 0.4},
      {...w('arrachent'), src: 'plop', volume: 0.5},
      {...w('arrachent', 0.5), src: 'chomp', volume: 0.4},
    ],
  },
  garde: {
    ambience: [AMB],
    cues: [
      {frame: 6, src: 'aww', volume: 0.25},
      {...w('debarrasse'), src: 'sparkle', volume: 0.35},
      {...w('garde'), src: 'pop', volume: 0.4},
      {...w('predateur'), src: 'growl', volume: 0.45},
      {...w("l'alerte"), src: 'kiik_alarm', volume: 0.45},
    ],
  },
  mutualisme: {
    ambience: [AMB],
    cues: [
      {...w('langue'), src: 'grunt', volume: 0.35},
      {...w('langue', 0.3), src: 'kiik', volume: 0.3},
      {...w('comprennent'), src: 'sparkle', volume: 0.35},
      {...w('manger'), src: 'chomp', volume: 0.4},
      {...w('sante'), src: 'ding', volume: 0.3},
      {...w('mutualisme'), src: 'fanfare', volume: 0.3},
    ],
  },
  abonne: {
    ambience: [AMB],
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
