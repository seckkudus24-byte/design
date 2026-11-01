import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../EiderVideo';
import {useCue} from '../cue';
import {Coast, Eider, Fox, Gull, Nest, RIDGE_Y} from '../characters/Arctic';
import {eiderOn} from './helpers';
import {NEST} from './Titre';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Voisin: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const goelands = useCue('goelands');
  const ferocite = useCue('ferocite');
  const protection = useCue('protection');
  const petits = useCue('petits');
  const pari = useCue('pari');
  const title = usePop(4, 9) * (1 - ramp(frame, goelands - 6, goelands));
  const gulls = ramp(frame, goelands - 10, goelands + 20);
  const chase = ramp(frame, ferocite, ferocite + 40);
  const eye = frame >= petits && frame < pari;
  return (
    <Scene bg="#9ECFEA">
      <Coast frame={frame} wind={0.3} />
      <Place x={NEST.x} y={NEST.y}>
        <Nest width={340} />
      </Place>
      <Place x={NEST.x + 10} y={eiderOn(NEST.y + 10, 380)}>
        <Eider frame={frame} width={380} pose="sit" />
      </Place>
      {/* nid des goélands, tout près */}
      <Place x={interpolate(gulls, [0, 1], [1300, 610])} y={RIDGE_Y - 80} flip>
        <Gull frame={frame} width={230} flying={false} />
      </Place>
      <Place x={interpolate(gulls, [0, 1], [1400, 760]) + (frame >= ferocite ? chase * 200 : 0)} y={RIDGE_Y - 240 - Math.sin(frame * 0.1) * 20}>
        <Gull frame={frame + 9} width={220} dive={frame >= ferocite && chase < 1 ? 0.5 : 0} />
      </Place>
      {/* le renard chassé par les goélands */}
      <Place x={interpolate(chase, [0, 1], [820, 1300])} y={RIDGE_Y - 60} scale={frame >= ferocite - 10 ? 0.8 : 0}>
        <Fox frame={frame} width={260} />
      </Place>
      {eye ? (
        <div style={{position: 'absolute', left: 560, top: RIDGE_Y - 260, fontFamily: 'LuckiestGuy', fontSize: 110, color: '#FF5252', WebkitTextStroke: '12px #16121F', paintOrder: 'stroke fill'}}>!</div>
      ) : null}
      <TopBadge s={title} color="#FF8A80">
        LE VOISIN DANGEREUX
      </TopBadge>
      <TopBadge s={usePop(protection, 9) * (1 - ramp(frame, petits - 6, petits))} color="#A5D6A7" size={60}>
        PROTECTION GRATUITE
      </TopBadge>
      <TopBadge s={usePop(pari, 9)} color="#FFE082">
        UN PARI RISQUÉ
      </TopBadge>
    </Scene>
  );
};
