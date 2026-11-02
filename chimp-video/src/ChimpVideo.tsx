import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {SCENE_IDS, sceneDurations} from './timeline';
import {SceneCtx} from './cue';
import {Abonne, Cannibale, Collegue, Conclusion, Equipe, Partage, Piege, Proie, Question, Titre} from './scenes/Scenes';
import {InsertAudio, Inserts} from './runner';
import {Subtitles} from './Subtitles';
import {Music, SceneSound} from './Sound';
import {Camera, Reveal, TRANSITION_FRAMES} from './camera';

export type ChimpVideoProps = {k: number; total: number; hasAudio: boolean};
export type SceneProps = {dur: number};

const COMPONENTS: React.FC<SceneProps>[] = [Titre, Collegue, Cannibale, Proie, Equipe, Piege, Partage, Conclusion, Question, Abonne];

export const ChimpVideo: React.FC<ChimpVideoProps> = ({k, total, hasAudio}) => {
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
                <Camera dur={durations[i]} still={id === 'equipe' || id === 'question'}>
                  <Comp dur={durations[i]} />
                </Camera>
                <Inserts dur={durations[i]} />
              </Reveal>
              <SceneSound dur={durations[i]} />
              <InsertAudio dur={durations[i]} />
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
