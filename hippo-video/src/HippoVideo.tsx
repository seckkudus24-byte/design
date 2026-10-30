import React from 'react';
import {AbsoluteFill, Audio, Series, staticFile} from 'remotion';
import {SCENES} from './scenes';
import {Intro} from './scenes/Intro';
import {Geant} from './scenes/Geant';
import {EauTerre} from './scenes/EauTerre';
import {Digestion} from './scenes/Digestion';
import {Arroseur} from './scenes/Arroseur';
import {Attention} from './scenes/Attention';
import {Architecte} from './scenes/Architecte';
import {Conclusion} from './scenes/Conclusion';

export type HippoVideoProps = {
  durations: number[];
  hasAudio: boolean;
};

export type SceneProps = {dur: number; text: string};

const COMPONENTS: React.FC<SceneProps>[] = [Intro, Geant, EauTerre, Digestion, Arroseur, Attention, Architecte, Conclusion];

export const HippoVideo: React.FC<HippoVideoProps> = ({durations, hasAudio}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Series>
      {SCENES.map((scene, i) => {
        const Comp = COMPONENTS[i];
        return (
          <Series.Sequence key={scene.id} durationInFrames={durations[i]} name={scene.id}>
            <Comp dur={durations[i]} text={scene.text} />
          </Series.Sequence>
        );
      })}
    </Series>
    {hasAudio ? <Audio src={staticFile('voix.mp3')} /> : null}
  </AbsoluteFill>
);
