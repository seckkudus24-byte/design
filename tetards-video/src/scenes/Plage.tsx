import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../TetardsVideo';
import {useCue} from '../cue';
import {DEEP, Larva, Pond, SHALLOW, Swarm, Tadpole} from '../characters/Pond';
import {Star} from '../characters/Icons2';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Plage: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const matin = useCue('matin');
  const soir = useCue('soir');
  const trompent = useCue('trompent');
  const devores = useCue('devores');
  const toDeep = ramp(frame, soir, soir + 30);
  const night = ramp(frame, soir - 10, soir + 15);
  const lost = frame >= trompent;
  const snap = ramp(frame, devores - 6, devores + 4);
  const gone = frame >= devores + 4;
  return (
    <Scene bg="#8FD3F7">
      <Pond frame={frame} night={night} warm={1 - night} />
      <Swarm frame={frame} cx={interpolate(toDeep, [0, 1], [SHALLOW.x, DEEP.x])} cy={interpolate(toDeep, [0, 1], [SHALLOW.y, DEEP.y])} count={30} spread={170} flip={toDeep > 0 && toDeep < 1} />
      {/* le têtard qui se trompe d'horaire reste au bord… */}
      {lost && !gone ? (
        <Place x={300 + Math.sin(frame * 0.1) * 20} y={760}>
          <Tadpole frame={frame} size={70} />
        </Place>
      ) : null}
      <Place x={560 - snap * 40} y={790} scale={lost ? 1 : 0}>
        <Larva frame={frame} width={340} jaw={snap} />
      </Place>
      <Place x={300} y={760} scale={gone ? Math.max(0, 1 - (frame - devores - 4) / 20) : 0}>
        <Star size={120} />
      </Place>
      <TopBadge s={usePop(matin, 9) * (1 - ramp(frame, soir - 6, soir))} color="#FFE082">
        LE MATIN : LA PLAGE
      </TopBadge>
      <TopBadge s={usePop(soir, 9) * (1 - ramp(frame, trompent - 6, trompent))} color="#9FA8DA">
        LE SOIR : LE BUNKER
      </TopBadge>
      <TopBadge s={usePop(trompent, 9)} color="#FF8A80" size={60}>
        GARE AUX RETARDATAIRES !
      </TopBadge>
    </Scene>
  );
};
