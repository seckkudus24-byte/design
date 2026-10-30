import React from 'react';
import {Sequence, interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../HippoVideo';
import {Hippo} from '../characters/Hippo';
import {Fish, Poop} from '../characters/Animals';
import {StickMan} from '../characters/StickMan';
import {Bubble, Caption, Place, Scene, Sun, Water, usePop} from '../ui';

export const Intro: React.FC<SceneProps> = ({dur, text}) => {
  const frame = useCurrentFrame();
  const rise = usePop(10, 12);
  const hippoY = interpolate(rise, [0, 1], [1450, 1110]);
  const second = Math.round(dur * 0.365); // « Oui, tu as bien entendu… »
  const poop = usePop(Math.round(dur * 0.75), 8);
  return (
    <Scene first bg="linear-gradient(#FF8A65 0%, #FFCC80 55%, #FFE0B2 100%)">
      <Sun x={900} y={760} r={70} frame={frame} />
      {/* berge */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M-20 1120 Q 160 1060 330 1150 Q 380 1220 340 1290 L -20 1290 Z" fill="#8BC34A" stroke="#33691E" strokeWidth={8} />
      </svg>
      <Place x={150} y={950}>
        <StickMan frame={frame} pose={frame >= second ? 'surprised' : 'wave'} height={300} />
      </Place>
      <Place x={640} y={hippoY}>
        <Hippo frame={frame} width={640} />
      </Place>
      <Water top={1230} frame={frame} opacity={0.88} />
      {[0, 1, 2].map((i) => {
        const x = ((frame * (4 + i) + i * 400) % 1400) - 200;
        return (
          <Place key={i} x={x} y={1450 + i * 110}>
            <Fish frame={frame + i * 10} color={['#FF7043', '#FFCA28', '#AB47BC'][i]} size={130 - i * 15} />
          </Place>
        );
      })}
      <Place x={330 + poop * 0} y={1530} scale={poop}>
        <Poop size={130} />
      </Place>
      <Bubble text="?!" x={210} y={680} delay={second} size={80} />
      {frame < second ? <Caption text={text} size={84} top={140} /> : null}
      <Sequence from={second} layout="none">
        <Caption text="Un rôle essentiel… grâce à sa *bouse* !" size={100} top={170} />
      </Sequence>
    </Scene>
  );
};
