import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../TetardsVideo';
import {useCue} from '../cue';
import {DEEP, Pond, SHALLOW, Swarm} from '../characters/Pond';
import {House} from '../characters/Pond';
import {Place, Scene, usePop} from '../ui';
import {TopBadge} from './common';

export const Titre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const maisons = useCue('maisons');
  const milliers = useCue('milliers');
  const homes = usePop(maisons, 9);
  // aller-retour en boucle
  const t = (Math.sin(frame * 0.06) + 1) / 2;
  const cx = interpolate(t, [0, 1], [SHALLOW.x, DEEP.x]);
  const cy = interpolate(t, [0, 1], [SHALLOW.y, DEEP.y]);
  const count = interpolate(frame, [milliers, milliers + 30], [8, 40], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Scene first bg="#8FD3F7">
      <Pond frame={frame} warm={1 - t} />
      <Swarm frame={frame} cx={cx} cy={cy} count={count} spread={180} flip={Math.cos(frame * 0.06) < 0} />
      <Place x={170} y={560} scale={homes}>
        <House size={150} color="#FFB74D" label="PLAGE" />
      </Place>
      <Place x={900} y={1330} scale={homes}>
        <House size={150} color="#7986CB" label="BUNKER" />
      </Place>
      <TopBadge s={usePop(6, 10)} color="#FFFFFF" size={62}>
        DEUX « MAISONS »
      </TopBadge>
    </Scene>
  );
};
