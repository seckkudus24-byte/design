import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GirafeVideo';
import {useCue} from '../cue';
import {Savanna, Shadow} from '../characters/Savanna';
import {Giraffe} from '../characters/Giraffe';
import {Star} from '../characters/Icons2';
import {GROUND, gy} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Demarche: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const cogner = useCue('cogner');
  const gauche = useCue('gauche-gauche');
  const droite = useCue('droite-droite');
  const chameau = useCue('chameau');
  const title = usePop(4, 9) * (1 - ramp(frame, cogner - 6, cogner));
  const bump = usePop(cogner, 8) * (1 - ramp(frame, cogner + 20, cogner + 28));
  const x = interpolate(frame, [0, dur], [200, 800]);
  const highlight = frame >= droite && frame < droite + 40 ? 'right' : frame >= gauche && frame < gauche + 40 ? 'left' : undefined;
  const camel = usePop(chameau, 9);
  return (
    <Scene bg="#7EC8F0">
      <Savanna frame={frame} ground={GROUND} />
      <Shadow x={x} y={GROUND} w={440} />
      <Place x={x} y={gy(1000)}>
        <Giraffe frame={frame} height={1000} walking highlight={highlight} />
      </Place>
      <Place x={x - 20} y={GROUND - 200} scale={bump}>
        <Star size={130} />
      </Place>
      <TopBadge s={title} color="#C5E1A5">
        UNE DÉMARCHE UNIQUE
      </TopBadge>
      <TopBadge s={highlight === 'left' ? 1 : 0} size={80}>
        GAUCHE-GAUCHE
      </TopBadge>
      <TopBadge s={highlight === 'right' ? 1 : 0} size={80} color="#80DEEA">
        DROITE-DROITE
      </TopBadge>
      <TopBadge s={camel} color="#FFE0B2" size={64}>
        COMME UN CHAMEAU
      </TopBadge>
    </Scene>
  );
};
