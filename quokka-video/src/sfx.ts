// Feuille de bruitage — douce (pas de vent, pas de bruits violents).
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});
const AMB = [{src: 'amb_island', volume: 0.08}, {src: 'amb_sea', volume: 0.07}];

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {ambience: AMB, cues: [{...w('sourit'), src: 'sparkle', volume: 0.3}, {...w('heureux'), src: 'fanfare', volume: 0.15}]},
  lundi: {ambience: [{src: 'rain', volume: 0.08}], cues: [{...w('lundi'), src: 'aww', volume: 0.2}, {...w('sourire'), src: 'chime', volume: 0.25}]},
  roi: {
    ambience: AMB,
    cues: [
      {...w('roi'), src: 'fanfare', volume: 0.15},
      {...w('quokka'), src: 'pop', volume: 0.3},
      {...w('kangourou'), src: 'boing', volume: 0.25},
      {...w('toujours'), src: 'sparkle', volume: 0.25},
      {...w("qu'internet"), src: 'ding', volume: 0.25},
    ],
  },
  manger: {
    ambience: AMB,
    cues: [
      {...w('manger'), src: 'pop', volume: 0.3},
      {...w('panique'), src: 'boing', volume: 0.25},
      {...w('grignoter'), src: 'mystery', volume: 0.15},
      {...w('croque'), src: 'chomp', volume: 0.35},
      {...w('croque', 0.4), src: 'chomp', volume: 0.3},
      {...w('chips'), src: 'chomp', volume: 0.3},
      {...w('debarque'), src: 'knock', volume: 0.25},
      {...w('repas'), src: 'ding', volume: 0.25},
    ],
  },
  sociable: {
    ambience: AMB,
    cues: [
      {...w('calme'), src: 'chime', volume: 0.2},
      {...w("s'approche"), src: 'clop', volume: 0.2},
      {...w('lecher'), src: 'lick', volume: 0.3},
      {...w("t'aime"), src: 'aww', volume: 0.2},
      {...w('salee'), src: 'sparkle', volume: 0.25},
    ],
  },
  curieux: {ambience: AMB, cues: [{...w('curieux'), src: 'mystery', volume: 0.2}, {...w('caillou'), src: 'pop', volume: 0.3}, {...w('enfant'), src: 'boing', volume: 0.2}]},
  attention: {
    ambience: AMB,
    cues: [
      {...w('attention'), src: 'ding', volume: 0.25},
      {...w('loi'), src: 'knock', volume: 0.25},
      {...w('vulnerable'), src: 'mystery', volume: 0.15},
      {...w('toucher'), src: 'boing', volume: 0.25},
      {...w('amende'), src: 'ding', volume: 0.25},
      {...w('photographier'), src: 'shutter', volume: 0.3},
    ],
  },
  conclusion: {
    ambience: AMB,
    cues: [{...w('argent'), src: 'pop', volume: 0.3}, {...w('telephone'), src: 'pop', volume: 0.3}, {...w('vacances'), src: 'pop', volume: 0.3}, {...w('secret'), src: 'sparkle', volume: 0.3}, {...w('feuille'), src: 'aww', volume: 0.2}],
  },
  question: {ambience: AMB, cues: [{...w('sourire'), src: 'sparkle', volume: 0.25}, {...w('commentaire'), src: 'chime', volume: 0.25}]},
  abonne: {ambience: AMB, cues: [{frame: 4, src: 'pop', volume: 0.35}, {frame: 18, src: 'sparkle', volume: 0.2}, {at: 0.58, src: 'pop', volume: 0.3}, {at: 0.66, src: 'ding', volume: 0.3}]},
};

// Petite harpe à chaque changement de scène, et marimba sous la voix.
export const TRANSITION = {src: 'harp', volume: 0.14};
export const MUSIC = {src: 'music', volume: 0.06};
