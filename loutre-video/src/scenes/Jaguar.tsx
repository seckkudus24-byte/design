import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../LoutreVideo';
import {useCue} from '../cue';
import {Amazon, Jaguar as Cat, Otter} from '../characters/River';
import {BANK_Y, SURFACE, otterOn} from './helpers';
import {Bubble, Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

const REST = [140, 260, 380, 480];
const WATER = [620, 760, 900, 820];

export const Jaguar: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const ennemi = useCue('ennemi');
  const roi = useCue('roi');
  const repose = useCue('repose');
  const silence = useCue('silence');
  const cri = useCue('cri');
  const plonge = useCue('plonge');
  const territoire = useCue('territoire');
  const crient = useCue('crient');
  const bredouille = useCue('bredouille');
  const title = usePop(4, 9) * (1 - ramp(frame, ennemi - 6, ennemi));
  const king = usePop(roi, 9) * (1 - ramp(frame, repose - 6, repose));
  const stalk = ramp(frame, silence - 10, cri);
  const dive = ramp(frame, plonge - 4, plonge + 20);
  const shout = frame >= crient && frame < bredouille;
  const leave = ramp(frame, bredouille, bredouille + 40);
  const catX = frame < plonge ? interpolate(stalk, [0, 1], [-300, 60]) : interpolate(leave, [0, 1], [interpolate(ramp(frame, plonge, plonge + 30), [0, 1], [60, 300]), -400]);
  const H = (380 * 220) / 420;
  return (
    <Scene bg="#81D4FA">
      <Amazon frame={frame} surface={SURFACE} bank dusk={0.2} />
      {/* le jaguar s'approche ventre à terre, puis repart */}
      <Place x={catX} y={BANK_Y - 0.45 * H} flip={leave === 0}>
        <Cat frame={frame} width={380} crouch={frame < plonge ? 0.7 : 0} walking={stalk > 0 && stalk < 1 || leave > 0} worried={shout || leave > 0} />
      </Place>
      {/* la famille : au repos sur la berge, puis dans l'eau */}
      {REST.map((x, i) => {
        const px = interpolate(dive, [0, 1], [x, WATER[i]]);
        const py = interpolate(dive, [0, 1], [otterOn(BANK_Y, 260), SURFACE + 30 + (i % 2) * 40]);
        return (
          <Place key={i} x={px} y={py - Math.sin(dive * Math.PI) * 120} flip={dive >= 1}>
            <Otter frame={frame + i * 7} width={i === 3 ? 200 : 260} pose={dive >= 1 ? 'swim' : 'stand'} sleepy={frame < cri && i !== 3} shout={(i === 3 && frame >= cri && frame < plonge) || shout} />
          </Place>
        );
      })}
      {frame >= cri && frame < plonge ? <Bubble text="ALERTE !" x={380} y={430} size={56} delay={cri} /> : null}
      {shout ? <Bubble text="KRAAAH !!!" x={560} y={520} size={64} delay={crient} tail="right" /> : null}
      <TopBadge s={title} color="#FF8A80">
        FACE AU JAGUAR
      </TopBadge>
      <TopBadge s={king} color="#FFE082">
        LE ROI DE LA JUNGLE
      </TopBadge>
      <TopBadge s={usePop(territoire, 9) * (1 - ramp(frame, crient - 6, crient))} color="#81D4FA" size={60}>
        L'EAU, LEUR TERRITOIRE
      </TopBadge>
      <TopBadge s={usePop(bredouille, 9)} color="#FFFFFF">
        BREDOUILLE !
      </TopBadge>
    </Scene>
  );
};
