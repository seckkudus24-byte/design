import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../NepenthesVideo';
import {useCue} from '../cue';
import {Ant, Jungle, Pitcher, Toilet} from '../characters/Jungle';
import {Badge} from '../characters/Props';
import {POT, RIM} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';

export const Vivante: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const vivante = useCue('vivante');
  const jungle = useCue('jungle');
  const insectes = useCue('insectes');
  const morph = ramp(frame, vivante - 4, vivante + 12);
  const alive = usePop(vivante, 9) * (1 - ramp(frame, jungle - 4, jungle + 4));
  const ant = ramp(frame, insectes - 10, insectes + 25);
  return (
    <Scene bg="#81D4FA">
      <Jungle frame={frame} />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - morph}}>
        <Place x={600} y={1260}>
          <Toilet size={330} />
        </Place>
      </div>
      <Place x={POT.x} y={POT.y} scale={morph}>
        <Pitcher frame={frame} height={POT.h} face="yum" />
      </Place>
      <Place x={interpolate(ant, [0, 0.6, 1], [880, RIM.x + 60, RIM.x])} y={interpolate(ant, [0, 0.6, 1], [1000, RIM.y - 30, RIM.y + 140])} scale={1 - ant * 0.5} rotate={ant > 0.6 ? 120 : 0}>
        <Ant frame={frame} size={90} slip={ant > 0.6} />
      </Place>
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, display: 'flex', justifyContent: 'center', transform: `scale(${alive})`}}>
        <Badge size={84}>VIVANTE !</Badge>
      </div>
    </Scene>
  );
};
