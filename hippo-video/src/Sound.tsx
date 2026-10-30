import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {MUSIC, SCENE_SOUNDS, TRANSITION} from './sfx';

const sfx = (name: string) => staticFile(`sfx/${name}.mp3`);
const FADE = 15;

// Ambiances + bruitages d'une scène (à placer dans la Series.Sequence de la scène).
export const SceneSound: React.FC<{index: number; dur: number}> = ({index, dur}) => {
  const {ambience, cues} = SCENE_SOUNDS[index];
  return (
    <>
      {ambience.map((a, i) => {
        const from = Math.round((a.from ?? 0) * dur);
        const len = Math.round((a.to ?? 1) * dur) - from;
        return (
          <Sequence key={`a${i}`} from={from} durationInFrames={len} layout="none">
            <Audio
              src={sfx(a.src)}
              loop
              volume={(f) =>
                a.volume * interpolate(f, [0, FADE, len - FADE, len], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
              }
            />
          </Sequence>
        );
      })}
      {index > 0 ? <Audio src={sfx(TRANSITION.src)} volume={TRANSITION.volume} /> : null}
      {cues.map((c, i) => (
        <Sequence key={`c${i}`} from={Math.round(c.at * dur)} layout="none">
          <Audio src={sfx(c.src)} volume={c.volume} />
        </Sequence>
      ))}
    </>
  );
};

// Musique de fond sur toute la vidéo.
export const Music: React.FC<{durations: number[]}> = ({durations}) => {
  const start = durations.slice(0, MUSIC.tensionScene).reduce((a, b) => a + b, 0);
  const end = start + durations[MUSIC.tensionScene];
  const total = durations.reduce((a, b) => a + b, 0);
  return (
    <Audio
      src={sfx(MUSIC.src)}
      loop
      volume={(f) =>
        MUSIC.volume *
        interpolate(f, [0, 20, start - 10, start + 10, end - 10, end + 10, total - 30, total], [0, 1, 1, 0.15, 0.15, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      }
    />
  );
};
