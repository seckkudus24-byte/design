import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../EiderVideo';
import {useCue} from '../cue';
import {Coast, Eider, Nest, Quilt} from '../characters/Arctic';
import {Star} from '../characters/Icons2';
import {eiderOn} from './helpers';
import {NEST} from './Titre';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Duvet: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const deg = useCue('38');
  const arrache = useCue("s'arrache");
  const couette = useCue('couette');
  const isolants = useCue('isolants');
  const or = useCue("l'or", 1);
  const luxe = useCue('luxe');
  const title = usePop(4, 9) * (1 - ramp(frame, deg - 6, deg));
  const pluck = frame >= arrache && frame < couette + 20;
  const down = 0.2 + ramp(frame, arrache, couette) * 0.8;
  const quilt = usePop(couette, 9) * (1 - ramp(frame, isolants - 6, isolants));
  const gold = usePop(or, 9);
  const lux = usePop(luxe, 9);
  return (
    <Scene bg="#9ECFEA">
      <Coast frame={frame} wind={0.3} />
      <Place x={NEST.x} y={NEST.y}>
        <Nest width={340} down={down} />
      </Place>
      <Place x={NEST.x + 10} y={eiderOn(NEST.y + 10, 380)}>
        <Eider frame={frame} width={380} pose="sit" plucking={pluck} />
      </Place>
      <Place x={790} y={NEST.y - 150} scale={Math.max(quilt, lux)}>
        <Quilt size={260} />
      </Place>
      {gold > 0.1
        ? [0, 1, 2, 3].map((i) => (
            <Place key={i} x={NEST.x - 120 + i * 90} y={NEST.y - 60 - Math.abs(Math.sin(frame * 0.2 + i)) * 40} scale={gold * 0.4}>
              <Star size={110} />
            </Place>
          ))
        : null}
      <TopBadge s={title} color="#ECEFF1">
        L'OR DOUX
      </TopBadge>
      <TopBadge s={usePop(deg, 9) * (1 - ramp(frame, arrache - 6, arrache))} color="#FF8A80" size={84}>
        38 °C
      </TopBadge>
      <TopBadge s={usePop(isolants, 9) * (1 - ramp(frame, or - 6, or))} color="#B3E5FC" size={60}>
        SUPER ISOLANT
      </TopBadge>
      <TopBadge s={gold * (1 - ramp(frame, luxe - 6, luxe))} color="#FFD54F">
        « L'OR DOUX »
      </TopBadge>
      <TopBadge s={lux} color="#FFD54F" size={60}>
        COUETTES DE LUXE
      </TopBadge>
    </Scene>
  );
};
