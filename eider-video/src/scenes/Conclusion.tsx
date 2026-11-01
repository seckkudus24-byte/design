import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../EiderVideo';
import {useCue} from '../cue';
import {Coast, Duckling, Eider, SHORE_Y} from '../characters/Arctic';
import {Hearts} from '../characters/Icons2';
import {duckOn, eiderOn} from './helpers';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

const Mussel: React.FC<{size?: number}> = ({size = 90}) => (
  <svg viewBox="0 0 100 60" width={size} style={{overflow: 'visible'}}>
    <path d="M6 30 Q 30 0 94 22 Q 70 58 6 30 Z" fill="#283593" stroke="#2B2420" strokeWidth={5} strokeLinejoin="round" />
    <path d="M14 30 Q 50 22 88 24" stroke="#7986CB" strokeWidth={4} fill="none" />
  </svg>
);

export const Conclusion: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const dernier = useCue('dernier');
  const plonge = useCue('plonge');
  const reposer = useCue('reposer');
  const manger = useCue('manger');
  const donne = useCue('donne');
  const entraide = useCue("l'entraide");
  const survecu = useCue('survecu');
  const title = usePop(4, 9) * (1 - ramp(frame, dernier - 6, dernier));
  const toSea = ramp(frame, reposer - 10, reposer + 30);
  const jump = ramp(frame, plonge - 6, plonge + 16);
  const food = usePop(manger, 9);
  const love = ramp(frame, entraide, entraide + 15);
  return (
    <Scene bg="#9ECFEA">
      <Coast frame={frame} shore dusk={ramp(frame, reposer, survecu) * 0.6} />
      {/* canetons déjà à l'eau */}
      {[0, 1, 2].map((i) => (
        <Place key={i} x={780 + i * 90 + Math.sin(frame * 0.05 + i) * 10} y={duckOn(SHORE_Y + 40 + (i % 2) * 40, 80)}>
          <Duckling frame={frame + i * 9} size={80} />
        </Place>
      ))}
      {/* le dernier caneton qui plonge */}
      <Place
        x={interpolate(jump, [0, 1], [600, 1000])}
        y={interpolate(jump, [0, 0.4, 1], [duckOn(SHORE_Y, 80), SHORE_Y - 140, duckOn(SHORE_Y + 60, 80)])}
        rotate={jump > 0 && jump < 1 ? jump * 40 : 0}
      >
        <Duckling frame={frame} size={80} />
      </Place>
      {/* la maman rejoint l'eau, se repose puis mange */}
      <Place x={interpolate(toSea, [0, 1], [430, 820])} y={toSea < 1 ? eiderOn(SHORE_Y + 10, 300, true) : eiderOn(SHORE_Y + 90, 300)}>
        <Eider frame={frame} width={300} pose={toSea < 1 ? 'stand' : 'swim'} walking={toSea > 0 && toSea < 1} sleepy={frame > reposer + 30 && frame < manger} />
      </Place>
      <Place x={1000} y={SHORE_Y + 20 - food * 30} scale={food * (1 - ramp(frame, donne - 6, donne))}>
        <Mussel size={100} />
      </Place>
      <Hearts frame={frame} amount={love} x={800} y={SHORE_Y - 160} />
      <TopBadge s={title} color="#FFE082">
        CONCLUSION
      </TopBadge>
      <TopBadge s={usePop(plonge, 9) * (1 - ramp(frame, reposer - 6, reposer))} color="#B3E5FC">
        PLOUF ! TOUS À L'EAU
      </TopBadge>
      <TopBadge s={food * (1 - ramp(frame, donne - 6, donne))} color="#A5D6A7" size={60}>
        ENFIN UN REPAS !
      </TopBadge>
      <TopBadge s={usePop(entraide, 9) * (1 - ramp(frame, survecu - 6, survecu))} color="#F8BBD0">
        L'ENTRAIDE
      </TopBadge>
      <TopBadge s={usePop(survecu, 9)} color="#FFD54F">
        ILS ONT SURVÉCU !
      </TopBadge>
    </Scene>
  );
};
