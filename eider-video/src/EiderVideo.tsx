import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {SCENE_IDS, sceneDurations} from './timeline';
import {SceneCtx} from './cue';
import {Titre} from './scenes/Titre';
import {Plumes} from './scenes/Plumes';
import {Nid} from './scenes/Nid';
import {Voisin} from './scenes/Voisin';
import {Duvet} from './scenes/Duvet';
import {Jeune} from './scenes/Jeune';
import {Saut} from './scenes/Saut';
import {Cri} from './scenes/Cri';
import {Creche} from './scenes/Creche';
import {Conclusion} from './scenes/Conclusion';
import {Abonne} from './scenes/Abonne';
import {InsertAudio, Inserts} from './inserts';
import {Subtitles} from './Subtitles';
import {Music, SceneSound} from './Sound';
import {Camera, Reveal, TRANSITION_FRAMES} from './camera';

export type EiderVideoProps = {k: number; total: number; hasAudio: boolean};
export type SceneProps = {dur: number};

const COMPONENTS: React.FC<SceneProps>[] = [Titre, Plumes, Nid, Voisin, Duvet, Jeune, Saut, Cri, Creche, Conclusion, Abonne];

export const EiderVideo: React.FC<EiderVideoProps> = ({k, total, hasAudio}) => {
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
