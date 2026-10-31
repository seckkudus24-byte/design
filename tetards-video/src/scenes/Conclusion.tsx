import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../TetardsVideo';
import {useCue} from '../cue';
import {Pond, Tadpole} from '../characters/Pond';
import {Medal} from '../characters/Props';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Conclusion: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const aventure = useCue('aventure');
  const survivant = useCue('survivant');
  const title = usePop(4, 9) * (1 - ramp(frame, aventure - 6, aventure));
  const medal = usePop(survivant, 9);
  return (
    <Scene bg="#8FD3F7">
      <Pond frame={frame} warm={0.6} />
      <Place x={540} y={1000} scale={2.6}>
        <Tadpole frame={frame} size={150} />
      </Place>
      <Place x={540} y={760} scale={medal} rotate={Math.sin(frame * 0.2) * 6}>
        <Medal size={200} text="SURVIVANT" />
      </Place>
      <TopBadge s={title} color="#FFFFFF">
        CONCLUSION
      </TopBadge>
      <TopBadge s={usePop(aventure, 9) * (1 - ramp(frame, survivant - 6, survivant))} color="#A5D6A7">
        UNE AVENTURE DE SURVIE
      </TopBadge>
      <TopBadge s={medal} color="#FFE082" size={60}>
        UN PETIT SURVIVANT !
      </TopBadge>
    </Scene>
  );
};
