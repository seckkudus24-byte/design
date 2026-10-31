import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../TetardsVideo';
import {useCue} from '../cue';
import {Pond, Tadpole} from '../characters/Pond';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Transformation: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const routine = useCue('routine');
  const semaine = useCue('semaine');
  const pattes = useCue('pattes');
  const queue = useCue('queue');
  const meta = useCue('metamorphose');
  const title = usePop(4, 9) * (1 - ramp(frame, routine - 6, routine));
  // jours et nuits qui défilent vite pendant l'été
  const cycle = frame >= routine && frame < pattes ? (Math.sin((frame - routine) * 0.25) + 1) / 2 : 0;
  const legs = ramp(frame, pattes - 4, pattes + 20);
  const tail = 1 - ramp(frame, queue, queue + 30);
  const weeks = frame >= semaine ? Math.min(8, 1 + Math.floor((frame - semaine) / 10)) : 0;
  return (
    <Scene bg="#8FD3F7">
      <Pond frame={frame} night={cycle} />
      <Place x={540} y={980} scale={2.4}>
        <Tadpole frame={frame} size={150} legs={legs} tail={tail} />
      </Place>
      <TopBadge s={title} color="#FFE082" size={60}>
        LA GRANDE TRANSFORMATION
      </TopBadge>
      {weeks > 0 && frame < meta ? (
        <TopBadge s={1} color="#FFFFFF">
          SEMAINE {weeks}
        </TopBadge>
      ) : null}
      <TopBadge s={usePop(meta, 9)} color="#C5E1A5" size={76}>
        MÉTAMORPHOSE !
      </TopBadge>
    </Scene>
  );
};
