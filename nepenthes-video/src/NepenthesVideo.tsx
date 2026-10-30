import React from 'react';
import {AbsoluteFill, Audio, Series, staticFile} from 'remotion';
import {SCENE_IDS, sceneDurations} from './timeline';
import {SceneCtx} from './cue';
import {Titre} from './scenes/Titre';
import {Vivante} from './scenes/Vivante';
import {Rituel} from './scenes/Rituel';
import {Toilettes} from './scenes/Toilettes';
import {Deal} from './scenes/Deal';
import {Plante} from './scenes/Plante';
import {Piege} from './scenes/Piege';
import {Hotel} from './scenes/Hotel';
import {Conclusion} from './scenes/Conclusion';
import {Abonne} from './scenes/Abonne';
import {Subtitles} from './Subtitles';
import {Music, SceneSound} from './Sound';

export type NepenthesVideoProps = {k: number; total: number; hasAudio: boolean};
export type SceneProps = {dur: number};

const COMPONENTS: React.FC<SceneProps>[] = [Titre, Vivante, Rituel, Toilettes, Deal, Plante, Piege, Hotel, Conclusion, Abonne];

export const NepenthesVideo: React.FC<NepenthesVideoProps> = ({k, total, hasAudio}) => {
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
