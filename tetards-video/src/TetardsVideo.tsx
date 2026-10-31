import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {SCENE_IDS, sceneDurations} from './timeline';
import {SceneCtx} from './cue';
import {Titre} from './scenes/Titre';
import {Plage} from './scenes/Plage';
import {Armee} from './scenes/Armee';
import {Croissance} from './scenes/Croissance';
import {Retour} from './scenes/Retour';
import {Monstres} from './scenes/Monstres';
import {Transformation} from './scenes/Transformation';
import {Depart} from './scenes/Depart';
import {Conclusion} from './scenes/Conclusion';
import {Abonne} from './scenes/Abonne';
import {Subtitles} from './Subtitles';
import {Music, SceneSound} from './Sound';
import {Camera, Reveal, TRANSITION_FRAMES} from './camera';

export type TetardsVideoProps = {k: number; total: number; hasAudio: boolean};
export type SceneProps = {dur: number};

const COMPONENTS: React.FC<SceneProps>[] = [Titre, Plage, Armee, Croissance, Retour, Monstres, Transformation, Depart, Conclusion, Abonne];

export const TetardsVideo: React.FC<TetardsVideoProps> = ({k, total, hasAudio}) => {
  const durations = sceneDurations(k, total);
  let start = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SCENE_IDS.map((id, i) => {
        const Comp = COMPONENTS[i];
        const ctx = {id, start, k};
        const from = start;
        start += durations[i];
        // chaque scène continue de jouer sous la suivante pendant la transition
        const extra = i < SCENE_IDS.length - 1 ? TRANSITION_FRAMES : 0;
        return (
          <Sequence key={id} from={from} durationInFrames={durations[i] + extra} name={id}>
            <SceneCtx.Provider value={ctx}>
              <Reveal index={i}>
                <Camera dur={durations[i]}>
                  <Comp dur={durations[i]} />
                </Camera>
              </Reveal>
              <SceneSound dur={durations[i]} />
            </SceneCtx.Provider>
          </Sequence>
        );
      })}
      <Subtitles k={k} />
      <Music totalFrames={durations.reduce((a, b) => a + b, 0)} />
      {hasAudio ? <Audio src={staticFile('voix.mp3')} /> : null}
    </AbsoluteFill>
  );
};
