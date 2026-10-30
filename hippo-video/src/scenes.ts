import timings from './timings.json';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Une entrée par section du script. `estimate` = durée estimée (s) tant que voix.mp3 n'est pas là.
export const SCENES = [
  {id: 'intro', estimate: 12},
  {id: 'geant', estimate: 11},
  {id: 'eau-terre', estimate: 18},
  {id: 'digestion', estimate: 15},
  {id: 'arroseur', estimate: 21},
  {id: 'attention', estimate: 9},
  {id: 'architecte', estimate: 11},
  {id: 'conclusion', estimate: 14},
] as const;

// Secondes de "queue" ajoutées après la fin de la voix (le temps de lire l'appel à s'abonner).
const TAIL = 1.5;

// Calcule la durée (en frames) de chaque scène.
// - voix.mp3 + timings.json rempli : chaque scène commence au temps indiqué dans `starts`.
// - voix.mp3 seul : les durées estimées sont mises à l'échelle pour couvrir tout l'audio.
// - pas d'audio : durées estimées.
export const computeDurations = (audioSeconds: number | null): number[] => {
  const starts = (timings as {starts: number[] | null}).starts;
  let secs: number[];
  if (audioSeconds !== null && starts && starts.length === SCENES.length) {
    secs = starts.map((s, i) => (i < starts.length - 1 ? starts[i + 1] - s : audioSeconds + TAIL - s));
  } else if (audioSeconds !== null) {
    const total = SCENES.reduce((a, s) => a + s.estimate, 0);
    const k = (audioSeconds + TAIL) / total;
    secs = SCENES.map((s) => s.estimate * k);
  } else {
    secs = SCENES.map((s) => s.estimate);
  }
  return secs.map((s) => Math.max(FPS, Math.round(s * FPS)));
};
