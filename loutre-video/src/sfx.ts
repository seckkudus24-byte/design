// Feuille de bruitage — rigolote mais douce (pas de vent, pas de bruits violents).
//   word  = mot prononcé (n-ième occurrence avec nth), avec un décalage `offset` en secondes ;
//   at    = fraction de la scène (0 = début, 1 = fin) ;   frame = frame dans la scène.
// Les ambiances jouent en boucle entre `from` et `to` (même syntaxe), par défaut toute la scène.

export type When = {word: string; nth?: number; offset?: number} | {at: number} | {frame: number};
export type Cue = When & {src: string; volume: number};
export type Ambience = {src: string; volume: number; from?: When; to?: When};

const w = (word: string, offset = 0, nth = 0): When => ({word, offset, nth});
const AMB = [{src: 'amb_jungle', volume: 0.12}, {src: 'amb_river', volume: 0.12}];

export const SCENE_SOUNDS: Record<string, {ambience: Ambience[]; cues: Cue[]}> = {
  titre: {ambience: AMB, cues: [{...w('amazonie'), src: 'pop', volume: 0.3}, {...w('loup'), src: 'sparkle', volume: 0.25}]},
  taille: {ambience: AMB, cues: [{...w('homme'), src: 'pop', volume: 0.3}, {...w('carapace'), src: 'chomp', volume: 0.4}, {...w('jaguar'), src: 'mystery', volume: 0.2}]},
  geant: {ambience: AMB, cues: [{...w('metre'), src: 'pop', volume: 0.3}, {...w('30'), src: 'pop', volume: 0.3}, {...w("d'ogre"), src: 'chomp', volume: 0.35}, {...w('chasser'), src: 'plouf', volume: 0.3}]},
  machoires: {
    ambience: AMB,
    cues: [{...w('pleco'), src: 'pop', volume: 0.3}, {...w('armure'), src: 'ding', volume: 0.2}, {...w('broient'), src: 'chomp', volume: 0.45}, {...w('anguille'), src: 'bloop', volume: 0.3}, {...w('tenant'), src: 'chomp', volume: 0.35}],
  },
  amazone: {ambience: AMB, cues: [{...w('fleuve'), src: 'harp', volume: 0.15}, {...w('6'), src: 'pop', volume: 0.3}, {...w("d'eau"), src: 'bloop', volume: 0.3}, {...w('especes'), src: 'sparkle', volume: 0.25}, {...w('buffet'), src: 'ding', volume: 0.25}]},
  equipe: {ambience: AMB, cues: [{...w('famille'), src: 'kiik', volume: 0.25}, {...w('encerclent'), src: 'bloop', volume: 0.3}, {...w('rabattent'), src: 'patter', volume: 0.25}]},
  radar: {ambience: AMB, cues: [{...w('trouble'), src: 'bloop', volume: 0.25}, {...w('moustaches'), src: 'sparkle', volume: 0.3}, {...w('vibrations'), src: 'chime', volume: 0.2}]},
  famille: {ambience: AMB, cues: [{...w('rapportent'), src: 'plouf', volume: 0.25}, {...w('petits'), src: 'kiik', volume: 0.3}, {...w('famille', 0, 1), src: 'patter', volume: 0.25}, {...w('protegent'), src: 'chime', volume: 0.2}]},
  jaguar: {
    ambience: AMB,
    cues: [
      {...w('roi'), src: 'pop', volume: 0.3},
      {...w('silence'), src: 'mystery', volume: 0.25},
      {...w('cri'), src: 'kiik', volume: 0.35},
      {...w('plonge'), src: 'plouf', volume: 0.4},
      {...w('plonge', 0.25), src: 'plouf', volume: 0.35},
      {...w('crient'), src: 'kiik_alarm', volume: 0.4},
      {...w('bredouille'), src: 'boing', volume: 0.25},
    ],
  },
  conclusion: {ambience: AMB, cues: [{...w('ensemble'), src: 'patter', volume: 0.3}, {...w('force'), src: 'ding', volume: 0.3}]},
  abonne: {ambience: AMB, cues: [{frame: 4, src: 'pop', volume: 0.35}, {frame: 18, src: 'kiik', volume: 0.2}, {at: 0.58, src: 'pop', volume: 0.3}, {at: 0.66, src: 'ding', volume: 0.3}]},
};

// Petite harpe à chaque changement de scène, et marimba sous la voix.
export const TRANSITION = {src: 'harp', volume: 0.14};
export const MUSIC = {src: 'music', volume: 0.06};
