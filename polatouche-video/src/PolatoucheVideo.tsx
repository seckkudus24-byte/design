import React from 'react';
import {AbsoluteFill, Audio, Series, staticFile} from 'remotion';
import {SCENE_IDS, sceneDurations} from './timeline';
import {SceneCtx} from './cue';
import {Titre} from './scenes/Titre';
import {Presentation} from './scenes/Presentation';
import {Plane} from './scenes/Plane';
import {Ecureuil} from './scenes/Ecureuil';
import {Locataire} from './scenes/Locataire';
import {Hiver} from './scenes/Hiver';
import {Discret} from './scenes/Discret';
import {Conclusion} from './scenes/Conclusion';
import {Abonne} from './scenes/Abonne';
import {Subtitles} from './Subtitles';
import {Music, SceneSound} from './Sound';

export type PolatoucheVideoProps = {k: number; total: number; hasAudio: boolean};
export type SceneProps = {dur: number};

const COMPONENTS: React.FC<SceneProps>[] = [Titre, Presentation, Plane, Ecureuil, Locataire, Hiver, Discret, Conclusion, Abonne];

export const PolatoucheVideo: React.FC<PolatoucheVideoProps> = ({k, total, hasAudio}) => {
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
