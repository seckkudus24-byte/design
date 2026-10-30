// Feuille de bruitage : pour chaque scène, une ambiance (en boucle) et des sons ponctuels.
// `at` = moment dans la scène (0 = début, 1 = fin), comme les animations.

export type Ambience = {src: string; volume: number; from?: number; to?: number};
export type Cue = {at: number; src: string; volume: number};

const every = (src: string, from: number, to: number, step: number, volume: number): Cue[] => {
  const out: Cue[] = [];
  for (let at = from; at <= to + 1e-9; at += step) out.push({at, src, volume});
  return out;
};

export const SCENE_SOUNDS: {ambience: Ambience[]; cues: Cue[]}[] = [
  // intro
  {
    ambience: [{src: 'amb_river', volume: 0.22}],
    cues: [
      {at: 0.03, src: 'splash', volume: 0.45},
      {at: 0.365, src: 'pop', volume: 0.5},
      {at: 0.75, src: 'boing', volume: 0.45},
    ],
  },
  // géant sans ennemis
  {
    ambience: [{src: 'amb_savanna', volume: 0.2}],
    cues: [
      ...every('thud', 0.02, 0.2, 0.045, 0.5),
      {at: 0.22, src: 'growl', volume: 0.4},
      {at: 0.37, src: 'yelp', volume: 0.35},
      {at: 0.42, src: 'whoosh', volume: 0.3},
      {at: 0.52, src: 'snap', volume: 0.45},
      {at: 0.57, src: 'snap', volume: 0.45},
      {at: 0.62, src: 'honk', volume: 0.6},
      {at: 0.72, src: 'whoosh', volume: 0.35},
    ],
  },
  // entre l'eau et la terre
  {
    ambience: [
      {src: 'amb_river', volume: 0.2, to: 0.56},
      {src: 'amb_night', volume: 0.24, from: 0.5},
    ],
    cues: [
      {at: 0.08, src: 'pop', volume: 0.45},
      {at: 0.6, src: 'splash', volume: 0.4},
      ...every('thud', 0.63, 0.74, 0.04, 0.4),
      ...every('chomp', 0.77, 0.79, 0.02, 0.4),
      {at: 0.8, src: 'sparkle', volume: 0.35},
      {at: 0.82, src: 'pop', volume: 0.45},
    ],
  },
  // digestion
  {
    ambience: [{src: 'amb_night', volume: 0.22}],
    cues: [
      ...every('chomp', 0.02, 0.42, 0.045, 0.4),
      {at: 0.15, src: 'pop', volume: 0.45},
      ...every('tick', 0.18, 0.4, 0.012, 0.25),
      {at: 0.47, src: 'boing', volume: 0.45},
      {at: 0.5, src: 'sparkle', volume: 0.35},
      {at: 0.68, src: 'pop', volume: 0.45},
      {at: 0.74, src: 'pop', volume: 0.45},
      {at: 0.84, src: 'ding', volume: 0.35},
    ],
  },
  // l'arroseur de la rivière
  {
    ambience: [
      {src: 'amb_underwater', volume: 0.25},
      {src: 'spray', volume: 0.22, from: 0.08, to: 0.66},
    ],
    cues: [
      {at: 0.09, src: 'splat', volume: 0.45},
      {at: 0.28, src: 'pop', volume: 0.45},
      {at: 0.45, src: 'sparkle', volume: 0.35},
      {at: 0.5, src: 'pop', volume: 0.35},
      {at: 0.66, src: 'whoosh', volume: 0.3},
      {at: 0.67, src: 'pop', volume: 0.45},
    ],
  },
  // attention
  {
    ambience: [{src: 'amb_tension', volume: 0.3}],
    cues: [
      {at: 0.0, src: 'alarm', volume: 0.3},
      {at: 0.45, src: 'alarm', volume: 0.25},
      {at: 0.62, src: 'sad', volume: 0.35},
    ],
  },
  // l'architecte
  {
    ambience: [{src: 'amb_savanna', volume: 0.18}],
    cues: [
      ...every('thud', 0.06, 0.42, 0.06, 0.4),
      {at: 0.42, src: 'pop', volume: 0.4},
      {at: 0.48, src: 'flow', volume: 0.4},
      {at: 0.62, src: 'flow', volume: 0.35},
      {at: 0.76, src: 'splash', volume: 0.35},
      {at: 0.8, src: 'sparkle', volume: 0.35},
      {at: 0.82, src: 'pop', volume: 0.45},
    ],
  },
  // conclusion + abonne-toi
  {
    ambience: [{src: 'amb_river', volume: 0.2}],
    cues: [
      {at: 0.3, src: 'boing', volume: 0.45},
      {at: 0.31, src: 'pop', volume: 0.4},
      {at: 0.69, src: 'whoosh', volume: 0.3},
      {at: 0.7, src: 'pop', volume: 0.5},
      {at: 0.86, src: 'click', volume: 0.6},
      {at: 0.9, src: 'ding', volume: 0.4},
    ],
  },
];

// Petit whoosh à chaque changement de scène.
export const TRANSITION = {src: 'whoosh', volume: 0.28};

// Musique de fond (marimba) sous la voix ; quasi coupée pendant la scène « attention ».
export const MUSIC = {src: 'music', volume: 0.07, tensionScene: 5};
