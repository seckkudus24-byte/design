import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../EiderVideo';
import {useCue} from '../cue';
import {Coast, Eider, Fox, Nest, SEA_Y} from '../characters/Arctic';
import {eiderOn} from './helpers';
import {NEST} from './Titre';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Nid: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const eider = useCue("l'eider");
  const islande = useCue('islande');
  const vallee = useCue('vallee');
  const crete = useCue('crete');
  const pourquoi = useCue('pourquoi');
  const renards = useCue('renards');
  const title = usePop(4, 9) * (1 - ramp(frame, eider - 6, eider));
  const valley = ramp(frame, vallee - 10, vallee + 20);
  const wind = ramp(frame, crete - 6, crete + 15);
  const fox = ramp(frame, renards - 10, renards + 25);
  return (
    <Scene bg="#9ECFEA">
      <Coast frame={frame} wind={0.2 + wind * 0.8} valley={valley} />
      <Place x={NEST.x} y={NEST.y}>
        <Nest width={340} />
      </Place>
      <Place x={NEST.x + 10} y={eiderOn(NEST.y + 10, 380)}>
        <Eider frame={frame} width={380} pose="sit" sleepy={wind > 0.5} />
      </Place>
      <Place x={interpolate(fox, [0, 1], [1250, 860])} y={SEA_Y - 170}>
        <Fox frame={frame} width={260} />
      </Place>
      <TopBadge s={title} color="#B3E5FC">
        UN NID DANS LE VENT GLACÉ
      </TopBadge>
      <TopBadge s={usePop(eider, 9) * (1 - ramp(frame, islande - 6, islande))}>L'EIDER</TopBadge>
      <TopBadge s={usePop(islande, 9) * (1 - ramp(frame, vallee - 6, vallee))} color="#B3E5FC">
        ISLANDE
      </TopBadge>
      <TopBadge s={usePop(crete, 9) * (1 - ramp(frame, pourquoi - 6, pourquoi))} color="#FFFFFF">
        SUR LA CRÊTE, EN PLEIN VENT
      </TopBadge>
      <TopBadge s={usePop(renards, 9)} color="#FFCC80">
        DANS LA VALLÉE : LES RENARDS
      </TopBadge>
    </Scene>
  );
};
