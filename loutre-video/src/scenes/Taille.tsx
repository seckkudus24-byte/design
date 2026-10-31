import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../LoutreVideo';
import {useCue} from '../cue';
import {Amazon, Jaguar, Otter, Pleco} from '../characters/River';
import {StickMan} from '../characters/StickMan';
import {BANK_Y, SURFACE, otterOn} from './helpers';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Taille: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const homme = useCue('homme');
  const carapace = useCue('carapace');
  const jaguar = useCue('jaguar');
  const man = usePop(homme, 9) * (1 - ramp(frame, carapace - 6, carapace));
  const chips = usePop(carapace, 9) * (1 - ramp(frame, jaguar - 6, jaguar));
  const cat = ramp(frame, jaguar - 10, jaguar + 20);
  return (
    <Scene bg="#81D4FA">
      <Amazon frame={frame} surface={SURFACE} bank />
      {/* comparaison avec un humain */}
      <Place x={420} y={BANK_Y - 150} scale={man}>
        <StickMan frame={frame} pose="surprised" height={300} />
      </Place>
      <Place x={300} y={otterOn(BANK_Y, 540)}>
        <Otter frame={frame} width={540} pose="stand" chew={chips > 0.5} />
      </Place>
      <Place x={640} y={BANK_Y - 60} scale={chips}>
        <Pleco frame={frame} size={200} crunch={Math.abs(Math.sin(frame * 0.4))} />
      </Place>
      <Place x={880 - cat * 60} y={BANK_Y - 90} scale={cat * 0.7}>
        <Jaguar frame={frame} width={380} worried />
      </Place>
      <TopBadge s={man}>TAILLE D'UN HOMME</TopBadge>
      <TopBadge s={chips} color="#FFE082">
        CROC… COMME DES CHIPS !
      </TopBadge>
      <TopBadge s={usePop(jaguar, 9)} color="#FF8A80" size={60}>
        MÊME LE JAGUAR HÉSITE
      </TopBadge>
    </Scene>
  );
};
