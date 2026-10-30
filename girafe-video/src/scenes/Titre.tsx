import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GirafeVideo';
import {useCue} from '../cue';
import {Savanna, Shadow} from '../characters/Savanna';
import {Giraffe, Ruler} from '../characters/Giraffe';
import {GROUND, gy} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Titre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const metres = useCue('metres');
  const naissance = useCue('naissance');
  const baby = usePop(6, 11);
  const ruler = ramp(frame, metres - 8, metres + 12);
  const born = usePop(naissance, 9);
  return (
    <Scene first bg="#7EC8F0">
      <Savanna frame={frame} ground={GROUND} />
      <Shadow x={520} y={GROUND} w={300} />
      <Place x={500} y={gy(900)} scale={baby}>
        <Giraffe frame={frame} height={900} baby />
      </Place>
      {/* mètre ruban : 2 m = taille du girafon */}
      <div style={{position: 'absolute', left: 760, top: GROUND - 20 - 520 * ruler, opacity: ruler > 0 ? 1 : 0}}>
        <Ruler h={520 * ruler} label="2 M" ticks={4} />
      </div>
      <TopBadge s={born} color="#F8BBD0">
        DÈS LA NAISSANCE !
      </TopBadge>
    </Scene>
  );
};
