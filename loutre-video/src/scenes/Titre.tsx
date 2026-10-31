import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../LoutreVideo';
import {useCue} from '../cue';
import {Amazon, Otter} from '../characters/River';
import {SURFACE} from './helpers';
import {Place, Scene, usePop} from '../ui';
import {TopBadge} from './common';

export const Titre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const loup = useCue('loup');
  const amazonie = useCue('amazonie');
  const x = ((frame * 6) % 1600) - 300;
  return (
    <Scene first bg="#81D4FA">
      <Amazon frame={frame} surface={SURFACE} />
      <Place x={x} y={SURFACE + 260}>
        <Otter frame={frame} width={480} />
      </Place>
      <TopBadge s={usePop(amazonie, 9)} color="#A5D6A7">
        AMAZONIE
      </TopBadge>
      <TopBadge s={usePop(loup, 9)} color="#FFE082" size={64} dy={110}>
        LE « LOUP DES RIVIÈRES »
      </TopBadge>
    </Scene>
  );
};
