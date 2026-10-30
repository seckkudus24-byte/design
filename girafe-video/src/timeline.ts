import data from './words.json';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const SCENE_IDS = ['titre', 'oui', 'naissance', 'dormir', 'geant', 'boire', 'demarche', 'demenager', 'douce', 'conclusion', 'abonne'] as const;
export type SceneId = (typeof SCENE_IDS)[number];

export type Word = {w: string; s: number; e: number; scene: SceneId};
export const WORDS = data.words as Word[];
export const ALIGN_SOURCE = data.source as 'whisper' | 'pauses' | 'estimate';
export const ALIGNED_DURATION = data.duration as number | null;

const LEAD = 0.25; // la scène apparaît un peu avant le premier mot

// Début (s) de chaque scène d'après le minutage des mots.
export const sceneStarts = (k: number): number[] =>
  SCENE_IDS.map((id, i) => (i === 0 ? 0 : Math.max(0, WORDS.find((w) => w.scene === id)!.s * k - LEAD)));

// Durée de chaque scène (frames) ; la dernière va jusqu'au bout de la vidéo.
export const sceneDurations = (k: number, totalSeconds: number): number[] => {
  const starts = sceneStarts(k).map((s) => Math.round(s * FPS));
  const total = Math.round(totalSeconds * FPS);
  return starts.map((s, i) => (i < starts.length - 1 ? starts[i + 1] : total) - s);
};

const clean = (w: string) =>
  w
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]/g, '');

// Instant (s, dans la vidéo) du n-ième mot commençant par `word` dans une scène.
export const wordTime = (scene: SceneId, word: string, nth = 0, k = 1): number => {
  const target = clean(word);
  const hits = WORDS.filter((w) => w.scene === scene && clean(w.w).startsWith(target));
  if (!hits[nth]) throw new Error(`Repère introuvable : « ${word} » (n°${nth}) dans la scène ${scene}`);
  return hits[nth].s * k;
};
