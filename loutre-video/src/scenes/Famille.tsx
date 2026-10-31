import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../LoutreVideo';
import {useCue} from '../cue';
import {Amazon, Fish, Otter} from '../characters/River';
import {Hearts} from '../characters/Icons2';
import {BANK_Y, SURFACE, otterOn} from './helpers';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

// Terrier creusé dans la berge.
const DEN = {x: 170, y: BANK_Y + 70};

export const Famille: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const rapportent = useCue('rapportent');
  const petits = useCue('petits');
  const famille = useCue('famille', 1);
  const protegent = useCue('protegent');
  const title = usePop(4, 9) * (1 - ramp(frame, rapportent - 6, rapportent));
  const carry = ramp(frame, rapportent - 6, rapportent + 35);
  const pups = usePop(petits, 9);
  const all = ramp(frame, famille, famille + 25);
  const love = frame >= protegent ? 1 : 0;
  return (
    <Scene bg="#81D4FA">
      <Amazon frame={frame} surface={SURFACE} bank />
      {/* terrier */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <ellipse cx={DEN.x} cy={DEN.y} rx={120} ry={60} fill="#3E2723" stroke="#2A1B12" strokeWidth={8} />
      </svg>
      {/* les petits qui attendent */}
      {[0, 1].map((i) => (
        <Place key={i} x={DEN.x - 40 + i * 80} y={DEN.y - 10} scale={pups * 0.6}>
          <Otter frame={frame + i * 9} width={300} pose="stand" shout={frame >= petits && frame < petits + 40} />
        </Place>
      ))}
      {/* le parent rapporte un poisson */}
      <Place x={interpolate(carry, [0, 1], [900, 470])} y={interpolate(carry, [0, 1], [SURFACE + 200, otterOn(BANK_Y, 420)])} flip>
        <Otter frame={frame} width={420} pose={carry >= 1 ? 'stand' : 'swim'} />
      </Place>
      <Place x={interpolate(carry, [0, 1], [760, 350])} y={interpolate(carry, [0, 1], [SURFACE + 210, BANK_Y + 10])} scale={1 - all * 0.6}>
        <Fish frame={frame} size={110} color="#FFB74D" />
      </Place>
      {/* frères et sœurs qui arrivent */}
      {[0, 1, 2].map((i) => (
        <Place key={i} x={interpolate(all, [0, 1], [1200 + i * 150, 600 + i * 110])} y={otterOn(BANK_Y, 300) - (i % 2) * 10} flip>
          <Otter frame={frame + i * 7} width={300} pose="stand" />
        </Place>
      ))}
      <Hearts frame={frame} amount={love} x={300} y={520} />
      <TopBadge s={title} color="#F8BBD0">
        UNE FAMILLE SOUDÉE
      </TopBadge>
      <TopBadge s={usePop(petits, 9) * (1 - ramp(frame, famille - 6, famille))} color="#FFE082">
        LES PETITS ONT FAIM !
      </TopBadge>
      <TopBadge s={usePop(famille, 9)} color="#A5D6A7" size={60}>
        TOUTE LA FAMILLE AIDE
      </TopBadge>
    </Scene>
  );
};
