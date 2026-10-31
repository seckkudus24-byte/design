import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../LoutreVideo';
import {useCue} from '../cue';
import {Amazon, Fish, Otter} from '../characters/River';
import {SURFACE} from './helpers';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

const TEAM = [
  {a: 0, r: 330},
  {a: 1.25, r: 300},
  {a: 2.5, r: 330},
  {a: 3.75, r: 300},
  {a: 5.0, r: 320},
];

export const Equipe: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const famille = useCue('famille');
  const encerclent = useCue('encerclent');
  const rabattent = useCue('rabattent');
  const title = usePop(4, 9) * (1 - ramp(frame, famille - 6, famille));
  const family = usePop(famille, 9) * (1 - ramp(frame, encerclent - 6, encerclent));
  const circle = ramp(frame, encerclent - 6, encerclent + 20);
  const push = ramp(frame, rabattent, rabattent + 40);
  // le centre du cercle remonte vers les eaux peu profondes (en haut à gauche)
  const cx = interpolate(push, [0, 1], [600, 380]);
  const cy = interpolate(push, [0, 1], [SURFACE + 420, SURFACE + 200]);
  return (
    <Scene bg="#81D4FA">
      <Amazon frame={frame} surface={SURFACE} murk={0.5} />
      {[0, 1, 2].map((i) => (
        <Place key={i} x={cx + (i - 1) * 70 + Math.sin(frame * 0.2 + i) * 20} y={cy + (i % 2) * 40}>
          <Fish frame={frame + i * 5} size={130} color="#FFB74D" />
        </Place>
      ))}
      {TEAM.map((t, i) => {
        const ang = t.a + frame * 0.03 * circle;
        const r = interpolate(circle, [0, 1], [700, t.r * (1 - push * 0.35)]);
        return (
          <Place key={i} x={cx + Math.cos(ang) * r} y={cy + Math.sin(ang) * r * 0.5} rotate={(ang * 180) / Math.PI + 90}>
            <Otter frame={frame + i * 6} width={300} />
          </Place>
        );
      })}
      <TopBadge s={title} color="#A5D6A7">
        UNE CHASSE EN ÉQUIPE
      </TopBadge>
      <TopBadge s={family} size={66}>
        FAMILLE DE 4 À 8
      </TopBadge>
      <TopBadge s={usePop(encerclent, 9)} color="#FFE082" size={60}>
        ENCERCLÉS !
      </TopBadge>
    </Scene>
  );
};
