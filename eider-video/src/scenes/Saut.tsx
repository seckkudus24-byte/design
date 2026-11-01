import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../EiderVideo';
import {useCue} from '../cue';
import {Coast, Duckling, Eider, Nest, RIDGE_Y, SEA_Y} from '../characters/Arctic';
import {Clock} from '../characters/Icons2';
import {duckOn, eiderOn} from './helpers';
import {NEST} from './Titre';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Saut: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const eclosent = useCue('eclosent');
  const manger = useCue('manger');
  const heures = useCue('heures');
  const mer = useCue('mer');
  const sauter = useCue('sauter');
  const amortissent = useCue('amortissent');
  const title = usePop(4, 9) * (1 - ramp(frame, eclosent - 6, eclosent));
  const hatch = usePop(eclosent, 9);
  const walk = ramp(frame, mer, sauter);
  const jumps = [0, 1, 2].map((i) => ramp(frame, sauter + i * 12, sauter + i * 12 + 24));
  const soft = usePop(amortissent, 9);
  return (
    <Scene bg="#9ECFEA">
      <Coast frame={frame} wind={0.2} />
      <Place x={NEST.x} y={NEST.y}>
        <Nest width={340} eggs={hatch > 0.5 ? 0 : 4} />
      </Place>
      <Place x={NEST.x - 80 + walk * 200} y={eiderOn(RIDGE_Y - 20, 340, true)}>
        <Eider frame={frame} width={340} pose="stand" walking={walk > 0 && walk < 1} />
      </Place>
      {[0, 1, 2].map((i) => {
        const j = jumps[i];
        const x0 = NEST.x + 80 + i * 70 + walk * 200;
        const x = interpolate(j, [0, 1], [Math.min(x0, 560), 760 + i * 90]);
        const y = interpolate(j, [0, 0.2, 1], [duckOn(RIDGE_Y - 10, 100), duckOn(RIDGE_Y - 80, 100), SEA_Y - 20]);
        return (
          <Place key={i} x={x} y={y} scale={hatch} rotate={j > 0 && j < 1 ? j * 360 : 0}>
            <Duckling frame={frame + i * 7} size={100} walking={walk > 0 && walk < 1} />
          </Place>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 460, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, transform: `scale(${usePop(heures, 9) * (1 - ramp(frame, mer - 6, mer))})`}}>
        <Clock size={140} turns={ramp(frame, heures, mer) * 0.4} />
      </div>
      {/* flèche vers la mer */}
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: ramp(frame, mer - 6, mer + 6) * (1 - ramp(frame, sauter, sauter + 10))}}>
        <path d={`M560 ${RIDGE_Y - 120} Q 800 ${RIDGE_Y - 220} 900 ${SEA_Y - 40}`} stroke="#FFFFFF" strokeWidth={12} strokeDasharray="26 18" fill="none" />
        <path d={`M900 ${SEA_Y - 40} l-34 -16 M900 ${SEA_Y - 40} l4 -36`} stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" />
      </svg>
      <TopBadge s={title} color="#FF8A80">
        UN SAUT DANS LE VIDE
      </TopBadge>
      <TopBadge s={usePop(manger, 9) * (1 - ramp(frame, heures - 6, heures))} color="#FFFFFF">
        RIEN À MANGER ICI
      </TopBadge>
      <TopBadge s={usePop(mer, 9) * (1 - ramp(frame, sauter - 6, sauter))} color="#B3E5FC">
        DIRECTION LA MER !
      </TopBadge>
      <TopBadge s={usePop(sauter, 9) * (1 - ramp(frame, amortissent - 6, amortissent))} color="#FFE082" size={60}>
        DES DIZAINES DE MÈTRES !
      </TopBadge>
      <TopBadge s={soft} color="#A5D6A7" size={60}>
        DUVET = AMORTISSEUR
      </TopBadge>
    </Scene>
  );
};
