// Feuille de bruitage — douce (pas de vent, pas de bruits violents).
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});
const AMB = [{src: 'amb_forest', volume: 0.1}];

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {ambience: AMB, cues: [{...w('chimpanzes'), src: 'kiik', volume: 0.25}, {...w('equipe'), src: 'pop', volume: 0.3}, {...w('manger'), src: 'boing', volume: 0.25}]},
  collegue: {
    ambience: [],
    cues: [{...w('connais'), src: 'click', volume: 0.3}, {...w('projet'), src: 'click', volume: 0.3}, {...w('rien'), src: 'snore', volume: 0.2}, {...w('part'), src: 'pop', volume: 0.3}, {...w('ventre'), src: 'grunt', volume: 0.2}],
  },
  cannibale: {
    ambience: AMB,
    cues: [
      {...w('cannibalisme'), src: 'mystery', volume: 0.2},
      {...w('partagent'), src: 'chomp', volume: 0.3},
      {...w('colobe'), src: 'kiik', volume: 0.2},
      {...w('pensent'), src: 'mystery', volume: 0.2},
      {...w('faux'), src: 'boing', volume: 0.3},
      {...w('grand'), src: 'pop', volume: 0.3},
      {...w('98'), src: 'sparkle', volume: 0.3},
    ],
  },
  proie: {ambience: AMB, cues: [{...w('haut'), src: 'pop', volume: 0.3}, {...w('saute'), src: 'patter', volume: 0.25}, {...w('chance'), src: 'boing', volume: 0.25}, {...w("s'organisent"), src: 'ding', volume: 0.25}]},
  equipe: {
    ambience: AMB,
    cues: [
      {...w('foot'), src: 'fanfare', volume: 0.15},
      {...w('poste'), src: 'pop', volume: 0.25},
      {...w('dirige'), src: 'hoot', volume: 0.2},
      {...w('silence'), src: 'mystery', volume: 0.15},
      {...w('bloquent'), src: 'pop', volume: 0.3},
      {...w('secoue'), src: 'scratch', volume: 0.3},
      {...w('paniquer'), src: 'kiik_alarm', volume: 0.25},
      {...w('whatsapp'), src: 'boing', volume: 0.25},
    ],
  },
  piege: {ambience: AMB, cues: [{...w('colobes'), src: 'kiik_alarm', volume: 0.25}, {...w('piege'), src: 'hoot', volume: 0.25}, {...w('secondes'), src: 'clock', volume: 0.2}, {...w('fini'), src: 'ding', volume: 0.3}]},
  partage: {
    ambience: AMB,
    cues: [{...w('repas'), src: 'pop', volume: 0.3}, {...w('chasse'), src: 'chomp', volume: 0.3}, {...w('petits'), src: 'kiik', volume: 0.2}, {...w('tournent'), src: 'patter', volume: 0.2}, {...w('rien'), src: 'boing', volume: 0.2}],
  },
  conclusion: {ambience: AMB, cues: [{...w('travail'), src: 'pop', volume: 0.3}, {...w('capitaine'), src: 'ding', volume: 0.25}, {...w('recompense'), src: 'sparkle', volume: 0.3}, {...w('ressemblent'), src: 'hoot', volume: 0.2}]},
  question: {ambience: AMB, cues: [{...w('chasseur'), src: 'pop', volume: 0.3}, {...w('celui'), src: 'snore', volume: 0.2}, {...w('commentaire'), src: 'chime', volume: 0.25}]},
  abonne: {ambience: AMB, cues: [{frame: 4, src: 'pop', volume: 0.35}, {frame: 18, src: 'kiik', volume: 0.2}, {at: 0.58, src: 'pop', volume: 0.3}, {at: 0.66, src: 'ding', volume: 0.3}]},
};

// Petite harpe à chaque changement de scène, et marimba sous la voix.
export const TRANSITION = {src: 'harp', volume: 0.14};
export const MUSIC = {src: 'music', volume: 0.06};
