import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../LoutreVideo';
import {useCue} from '../cue';
import {Amazon, Fish, Otter} from '../characters/River';
import {BANK_Y, SURFACE, otterOn} from './helpers';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Geant: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const voici = useCue('voici');
  const metre = useCue('metre');
  const kilos = useCue('30');
  const ogre = useCue("d'ogre");
  const chasser = useCue('chasser');
  const title = usePop(4, 9) * (1 - ramp(frame, voici - 6, voici));
  const size = usePop(metre - 6, 9) * (1 - ramp(frame, kilos - 6, kilos));
  const weight = usePop(kilos, 9) * (1 - ramp(frame, ogre - 6, ogre));
  const hungry = usePop(ogre, 9) * (1 - ramp(frame, chasser - 6, chasser));
  const hunt = frame >= chasser;
  return (
    <Scene bg="#81D4FA">
      <Amazon frame={frame} surface={SURFACE} bank={!hunt} />
      {hunt ? (
        <Place x={interpolate(frame, [chasser, chasser + 60], [-200, 600], {extrapolateRight: 'clamp'})} y={SURFACE + 300}>
          <Otter frame={frame} width={480} />
        </Place>
      ) : (
        <Place x={300} y={otterOn(BANK_Y, 520)}>
          <Otter frame={frame} width={520} pose="stand" />
        </Place>
      )}
      {/* règle 1,8 m sous la loutre */}
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: size}}>
        <path d={`M60 ${BANK_Y + 40} L560 ${BANK_Y + 40}`} stroke="#FFEB3B" strokeWidth={14} />
        <path d={`M60 ${BANK_Y + 20} v40 M560 ${BANK_Y + 20} v40`} stroke="#FFEB3B" strokeWidth={10} />
      </svg>
      {/* tas de poissons */}
      {hungry > 0.01
        ? Array.from({length: 6}, (_, i) => (
            <Place key={i} x={700 + (i % 3) * 90} y={BANK_Y - 30 - Math.floor(i / 3) * 40} scale={hungry} rotate={(i * 37) % 30 - 15}>
              <Fish frame={frame + i * 5} size={110} color={['#90A4AE', '#FFB74D', '#B0BEC5'][i % 3]} />
            </Place>
          ))
        : null}
      <TopBadge s={title} color="#A5D6A7">
        UN GÉANT PARMI LES LOUTRES
      </TopBadge>
      <TopBadge s={size} size={84}>
        1,8 M
      </TopBadge>
      <TopBadge s={weight} size={84} color="#FFE082">
        30 KG
      </TopBadge>
      <TopBadge s={hungry} color="#FF8A80">
        UN APPÉTIT D'OGRE
      </TopBadge>
    </Scene>
  );
};
