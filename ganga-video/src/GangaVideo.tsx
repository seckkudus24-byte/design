import React from 'react';
import {AbsoluteFill, Audio, Series, staticFile} from 'remotion';
import {SCENE_IDS, sceneDurations, FPS} from './timeline';
import {SceneCtx} from './cue';
import {Titre} from './scenes/Titre';
import {Presentation} from './scenes/Presentation';
import {Nid} from './scenes/Nid';
import {Vol} from './scenes/Vol';
import {Eponge} from './scenes/Eponge';
import {Retour} from './scenes/Retour';
import {Conclusion} from './scenes/Conclusion';
import {Abonne} from './scenes/Abonne';
import {Subtitles} from './Subtitles';
import {Music, SceneSound} from './Sound';

export type GangaVideoProps = {k: number; total: number; hasAudio: boolean};
export type SceneProps = {dur: number};

const COMPONENTS: React.FC<SceneProps>[] = [Titre, Presentation, Nid, Vol, Eponge, Retour, Conclusion, Abonne];

export const GangaVideo: React.FC<GangaVideoProps> = ({k, total, hasAudio}) => {
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

export {FPS};
