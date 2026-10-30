import timings from './timings.json';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Une entrée par section du script. `estimate` = durée estimée (s) tant que voix.mp3 n'est pas là.
// `text` = la phrase clé affichée à l'écran (*mot* = surligné en jaune).
export const SCENES = [
  {id: 'intro', estimate: 9, text: "Est-ce que tu savais que les *excréments* de l'hippopotame font vivre *toute une rivière* ?"},
  {id: 'geant', estimate: 10, text: 'Un *géant* de 3 tonnes… presque *sans ennemis*'},
  {id: 'eau-terre', estimate: 11, text: "Le jour dans l'*eau*… la nuit sur la *terre*"},
  {id: 'digestion', estimate: 11, text: "Jusqu'à *40 kg d'herbe* avalés chaque nuit"},
  {id: 'arroseur', estimate: 12, text: 'Sa queue *arrose* la rivière… et nourrit *tout le monde*'},
  {id: 'attention', estimate: 11, text: "*Attention :* trop de crottes = *plus d'oxygène*"},
  {id: 'architecte', estimate: 11, text: 'Ses chemins deviennent des *canaux* pour la rivière'},
  {id: 'conclusion', estimate: 10, text: "Pas d'hippo… pas de *rivière vivante* !"},
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
