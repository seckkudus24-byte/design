import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../EiderVideo';
import {useCue} from '../cue';
import {Coast, Eider, Nest, RIDGE_Y} from '../characters/Arctic';
import {eiderOn} from './helpers';
import {Place, Scene, usePop} from '../ui';
import {TopBadge} from './common';

export const NEST = {x: 330, y: RIDGE_Y - 28};

export const Titre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const mois = useCue('mois');
  const chaud = useCue('chaud');
  const glow = usePop(chaud, 10);
  return (
    <Scene first bg="#9ECFEA">
      <Coast frame={frame} wind={0.4} />
      <Place x={NEST.x} y={NEST.y}>
        <Nest width={340} />
      </Place>
      <div style={{position: 'absolute', left: NEST.x - 220, top: NEST.y - 200, width: 440, height: 300, borderRadius: '50%', background: 'radial-gradient(rgba(255,183,77,0.55), rgba(255,183,77,0) 70%)', opacity: glow}} />
      <Place x={NEST.x + 10} y={eiderOn(NEST.y + 10, 380)}>
        <Eider frame={frame} width={380} pose="sit" />
      </Place>
      <TopBadge s={usePop(mois, 9)} color="#FFE082">
        ~1 MOIS SANS MANGER
      </TopBadge>
    </Scene>
  );
};
