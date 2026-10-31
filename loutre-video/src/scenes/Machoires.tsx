import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../LoutreVideo';
import {useCue} from '../cue';
import {Amazon, Eel, Otter, Pleco} from '../characters/River';
import {BANK_Y, SURFACE, otterOn} from './helpers';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Machoires: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const pleco = useCue('pleco');
  const armure = useCue('armure');
  const broient = useCue('broient');
  const anguille = useCue('anguille');
  const tenant = useCue('tenant');
  const title = usePop(4, 9) * (1 - ramp(frame, pleco - 6, pleco));
  const fish = usePop(pleco, 9) * (1 - ramp(frame, broient + 10, broient + 25));
  const armor = usePop(armure, 9) * (1 - ramp(frame, broient - 6, broient));
  const crunch = frame >= broient && frame < broient + 25 ? Math.abs(Math.sin((frame - broient) * 0.5)) : 0;
  const eel = ramp(frame, anguille - 6, anguille + 20);
  const eat = frame >= tenant;
  return (
    <Scene bg="#81D4FA">
      <Amazon frame={frame} surface={SURFACE} bank />
      <Place x={320} y={otterOn(BANK_Y, 500)}>
        <Otter frame={frame} width={500} pose={eat ? 'sit' : 'stand'} chew={crunch > 0 || eat} />
      </Place>
      <Place x={interpolate(fish, [0, 1], [900, 600])} y={BANK_Y - 70} scale={fish}>
        <Pleco frame={frame} size={230} crunch={crunch} />
      </Place>
      <Place x={interpolate(eel, [0, 1], [1250, eat ? 520 : 780])} y={eat ? BANK_Y - 220 : SURFACE + 300} scale={eel} rotate={eat ? -60 : 0}>
        <Eel frame={frame} width={eat ? 260 : 380} />
      </Place>
      <TopBadge s={title} color="#FF8A80">
        DES MÂCHOIRES DE BROYEUSE
      </TopBadge>
      <TopBadge s={armor} color="#BCAAA4">
        LE PLÉCO : UNE ARMURE !
      </TopBadge>
      <TopBadge s={usePop(broient, 9) * (1 - ramp(frame, anguille - 6, anguille))} size={84}>
        CRAC !
      </TopBadge>
      <TopBadge s={usePop(anguille, 9)} color="#C5E1A5" size={60}>
        UNE ANGUILLE DE 50 CM
      </TopBadge>
    </Scene>
  );
};
