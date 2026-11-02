// Feuille de bruitage — douce (pas de vent, pas de bruits violents).
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});
const AMB = [{src: 'amb_savanna', volume: 0.1}];

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {ambience: AMB, cues: [{...w('afrique'), src: 'pop', volume: 0.3}, {...w('grimpe'), src: 'patter', volume: 0.2}, {...w('bebes'), src: 'peeps', volume: 0.25}]},
  roles: {ambience: AMB, cues: [{...w('oiseaux'), src: 'chirp', volume: 0.25}, {...w('mangent'), src: 'chomp', volume: 0.3}, {...w('inverses'), src: 'boing', volume: 0.3}]},
  cambrioleur: {
    ambience: AMB,
    cues: [
      {...w('cambrioleur'), src: 'mystery', volume: 0.2},
      {...w('criquet'), src: 'pop', volume: 0.3},
      {...w("d'epines"), src: 'sparkle', volume: 0.25},
      {...w('australe'), src: 'ding', volume: 0.2},
      {...w('grimpeur'), src: 'patter', volume: 0.25},
      {...w('cible'), src: 'ding', volume: 0.25},
      {...w('poussins'), src: 'peeps', volume: 0.25},
      {...w('travailleur'), src: 'chirps', volume: 0.2},
    ],
  },
  attend: {
    ambience: AMB,
    cues: [
      {...w('voleur'), src: 'mystery', volume: 0.2},
      {...w('part'), src: 'wings', volume: 0.2},
      {...w('grimpe'), src: 'patter', volume: 0.25},
      {...w('defense'), src: 'peeps', volume: 0.3},
      {...w('25'), src: 'pop', volume: 0.3},
      {...w('devorer'), src: 'chomp', volume: 0.3},
    ],
  },
  maman: {
    ambience: AMB,
    cues: [
      {...w('attaquer'), src: 'chomp', volume: 0.25},
      {...w('revient'), src: 'wings', volume: 0.22},
      {...w('chance'), src: 'ding', volume: 0.2},
      {...w('poids'), src: 'pop', volume: 0.3},
      {...w('frappe'), src: 'knock', volume: 0.25},
      {...w('encaisse'), src: 'boing', volume: 0.25},
      {...w('personne'), src: 'ding', volume: 0.2},
    ],
  },
  arme: {
    ambience: AMB,
    cues: [
      {...w('degoutante'), src: 'mystery', volume: 0.2},
      {...w('projette'), src: 'splat', volume: 0.25},
      {...w('horrible'), src: 'aww', volume: 0.2},
      {...w('mere'), src: 'chime', volume: 0.2},
      {...w('attaque'), src: 'knock', volume: 0.25},
      {...w('tomber'), src: 'whoosh', volume: 0.15},
      {...w('metres'), src: 'thud', volume: 0.3},
    ],
  },
  amis: {
    ambience: AMB,
    cues: [
      {...w('survit'), src: 'sparkle', volume: 0.25},
      {...w('odeur'), src: 'mystery', volume: 0.2},
      {...w('arrivent'), src: 'scratch', volume: 0.25},
      {...w('non'), src: 'boing', volume: 0.3},
      {...w('repas'), src: 'ding', volume: 0.25},
      {...w('proie'), src: 'chomp', volume: 0.25},
    ],
  },
  conclusion: {ambience: AMB, cues: [{...w('voler'), src: 'mystery', volume: 0.2}, {...w('devore'), src: 'chomp', volume: 0.25}, {...w('bien'), src: 'chime', volume: 0.25}]},
  question: {ambience: [], cues: [{...w('disparaissent'), src: 'whoosh', volume: 0.15}, {...w('reviennent'), src: 'pop', volume: 0.3}, {...w('commentaire'), src: 'chime', volume: 0.25}]},
  abonne: {ambience: AMB, cues: [{frame: 4, src: 'pop', volume: 0.35}, {frame: 18, src: 'peeps', volume: 0.2}, {at: 0.58, src: 'pop', volume: 0.3}, {at: 0.66, src: 'ding', volume: 0.3}]},
};

// Petite harpe à chaque changement de scène, et marimba sous la voix.
export const TRANSITION = {src: 'harp', volume: 0.14};
export const MUSIC = {src: 'music', volume: 0.06};
