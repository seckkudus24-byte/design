import React from 'react';
import {AbsoluteFill, Audio, Series, staticFile} from 'remotion';
import {SCENE_IDS, sceneDurations} from './timeline';
import {SceneCtx} from './cue';
import {Titre} from './scenes/Titre';
import {Histoire} from './scenes/Histoire';
import {Couple} from './scenes/Couple';
import {Drame} from './scenes/Drame';
import {Passant} from './scenes/Passant';
import {Pere} from './scenes/Pere';
import {Fin} from './scenes/Fin';
import {Conclusion} from './scenes/Conclusion';
import {Abonne} from './scenes/Abonne';
import {Subtitles} from './Subtitles';
import {Music, SceneSound} from './Sound';

export type OuetteVideoProps = {k: number; total: number; hasAudio: boolean};
export type SceneProps = {dur: number};

const COMPONENTS: React.FC<SceneProps>[] = [Titre, Histoire, Couple, Drame, Passant, Pere, Fin, Conclusion, Abonne];

export const OuetteVideo: React.FC<OuetteVideoProps> = ({k, total, hasAudio}) => {
  const durations = sceneDurations(k, total);
  let start = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Series>
        {SCENE_IDS.map((id, i) => {
          const Comp = COMPONENTS[i];
          const ctx = {id, start, k};
          start += durations[i];
          return (
            <Series.Sequence key={id} durationInFrames={durations[i]} name={id}>
              <SceneCtx.Provider value={ctx}>
                <Comp dur={durations[i]} />
                <SceneSound dur={durations[i]} />
              </SceneCtx.Provider>
            </Series.Sequence>
          );
        })}
      </Series>
      <Subtitles k={k} />
      <Music totalFrames={durations.reduce((a, b) => a + b, 0)} />
      {hasAudio ? <Audio src={staticFile('voix.mp3')} /> : null}
    </AbsoluteFill>
  );
};
