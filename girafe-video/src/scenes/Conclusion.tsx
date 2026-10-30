import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GirafeVideo';
import {useCue} from '../cue';
import {Savanna, Shadow} from '../characters/Savanna';
import {Giraffe, Glass} from '../characters/Giraffe';
import {GROUND, gy} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Conclusion: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const geant = useCue('geant');
  const verre = useCue('verre');
  const aventure = useCue('aventure');
  const title = usePop(4, 9) * (1 - ramp(frame, geant - 6, geant));
  const problems = usePop(geant, 9) * (1 - ramp(frame, verre - 6, verre));
  const glass = usePop(verre, 9);
  const bend = ramp(frame, verre, verre + 30) * 0.8;
  const adv = usePop(aventure, 9);
  return (
    <Scene bg="#7EC8F0">
      <Savanna frame={frame} ground={GROUND} dusk={0.4} />
      <Shadow x={400} y={GROUND} w={440} />
      <Place x={380} y={gy(1000)}>
        <Giraffe frame={frame} height={1000} drink={bend} />
      </Place>
      <Place x={760} y={GROUND - 80} scale={glass}>
        <Glass size={150} />
      </Place>
      <TopBadge s={title} color="#FFFFFF">
        CONCLUSION
      </TopBadge>
      <TopBadge s={problems} size={60}>
        DES PROBLÈMES DE GÉANT
      </TopBadge>
      <TopBadge s={adv} color="#81D4FA" size={64}>
        TOUTE UNE AVENTURE !
      </TopBadge>
    </Scene>
  );
};
