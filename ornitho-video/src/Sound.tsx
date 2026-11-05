import React, {useContext} from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {SceneCtx} from './cue';
import {FPS, wordTime} from './timeline';
import {MUSIC, SCENE_SOUNDS, TRANSITION, When} from './sfx';

const sfx = (name: string) => staticFile(`sfx/${name}.mp3`);
const FADE = 12;

// Ambiances + bruitages de la scène courante (à placer dans la Series.Sequence de la scène).
export const SceneSound: React.FC<{dur: number}> = ({dur}) => {
  const {id, start, k} = useContext(SceneCtx);
  const {ambience, cues} = SCENE_SOUNDS[id];
  const frameOf = (when: When | undefined, fallback: number) => {
    if (!when) return fallback;
    if ('frame' in when) return when.frame;
    if ('at' in when) return Math.round(when.at * dur);
    return Math.round((wordTime(id, when.word, when.nth ?? 0, k) + (when.offset ?? 0)) * FPS) - start;
  };
  return (
    <>
      {ambience.map((a, i) => {
        const from = Math.max(0, frameOf(a.from, 0));
        const len = Math.max(1, Math.min(dur, frameOf(a.to, dur)) - from);
        return (
          <Sequence key={`a${i}`} from={from} durationInFrames={len} layout="none">
            <Audio
              src={sfx(a.src)}
              loop
              volume={(f) => a.volume * interpolate(f, [0, FADE, len - FADE, len], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
            />
          </Sequence>
        );
      })}
      {id !== 'titre' ? <Audio src={sfx(TRANSITION.src)} volume={TRANSITION.volume} /> : null}
      {cues.map((c, i) => (
        <Sequence key={`c${i}`} from={Math.max(0, frameOf(c, 0))} layout="none">
          <Audio src={sfx(c.src)} volume={c.volume} />
        </Sequence>
      ))}
    </>
  );
};

export const Music: React.FC<{totalFrames: number}> = ({totalFrames}) => (
  <Audio
    src={sfx(MUSIC.src)}
    loop
    volume={(f) =>
      MUSIC.volume * interpolate(f, [0, 20, totalFrames - 30, totalFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    }
  />
);
