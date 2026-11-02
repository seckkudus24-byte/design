import {createContext, useContext} from 'react';
import {FPS, SceneId, wordTime} from './timeline';

export const SceneCtx = createContext<{id: SceneId; start: number; k: number}>({id: 'titre', start: 0, k: 1});

// Frame (relative à la scène) où le n-ième mot commençant par `word` est prononcé.
export const useCue = (word: string, nth = 0, offsetSeconds = 0): number => {
  const {id, start, k} = useContext(SceneCtx);
  return Math.round((wordTime(id, word, nth, k) + offsetSeconds) * FPS) - start;
};
