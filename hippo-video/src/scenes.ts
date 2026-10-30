import timings from './timings.json';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Une entrée par section du script. `estimate` = durée estimée (s) tant que voix.mp3 n'est pas là.
// `text` = la phrase clé affichée à l'écran (*mot* = surligné en jaune).
export const SCENES = [
  {id: 'intro', estimate: 12, text: "Est-ce que tu savais que les *excréments* de l'hippopotame font vivre *toute une rivière* ?"},
  {id: 'geant', estimate: 11, text: 'Un *géant* herbivore… presque *sans ennemis*'},
  {id: 'eau-terre', estimate: 18, text: "*16 h* par jour dans l'eau… la nuit, il *broute*"},
  {id: 'digestion', estimate: 15, text: 'Près de *la moitié* ressort… *non digérée* !'},
  {id: 'arroseur', estimate: 21, text: 'Sa queue *arrose* la rivière… et nourrit *tout le monde*'},
  {id: 'attention', estimate: 9, text: "*Attention :* trop de crottes = *plus d'oxygène*"},
  {id: 'architecte', estimate: 11, text: 'Il creuse des *mares* et des *chenaux*'},
  {id: 'conclusion', estimate: 14, text: 'Il nourrit *toute une rivière* !'},
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
