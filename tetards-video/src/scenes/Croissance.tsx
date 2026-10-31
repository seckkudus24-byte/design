import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../TetardsVideo';
import {useCue} from '../cue';
import {DEEP, Pond, SHALLOW, Swarm, Weed} from '../characters/Pond';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

const Thermo: React.FC<{level: number}> = ({level}) => (
  <svg viewBox="0 0 120 330" height={280} style={{overflow: 'visible'}}>
    <rect x={38} y={10} width={44} height={250} rx={22} fill="#fff" stroke="#16121F" strokeWidth={8} />
    <rect x={50} y={250 - 200 * level} width={20} height={20 + 200 * level} rx={10} fill="#E53935" />
    <circle cx={60} cy={280} r={40} fill="#E53935" stroke="#16121F" strokeWidth={8} />
  </svg>
);

export const Croissance: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const journee = useCue('journee');
  const bords = useCue('bords');
  const soleil = useCue('soleil');
  const cinq = useCue('5');
  const chaude = useCue('chaude');
  const algues = useCue('algues');
  const title = usePop(4, 9) * (1 - ramp(frame, journee - 6, journee));
  const move = ramp(frame, bords - 10, bords + 30);
  const warm = ramp(frame, soleil, soleil + 20);
  const thermo = usePop(cinq, 9) * (1 - ramp(frame, chaude - 4, chaude + 6));
  const grow = ramp(frame, chaude, chaude + 40);
  const weeds = ramp(frame, algues - 6, algues + 25);
  return (
    <Scene bg="#8FD3F7">
      <Pond frame={frame} warm={warm} />
      {[60, 150, 240, 330, 420].map((x, i) => (
        <svg key={x} width={1080} height={1920} style={{position: 'absolute'}}>
          <Weed frame={frame} x={x} baseY={x < 120 ? 700 : 700 + (x - 120) * 1.4} height={140 + (i % 2) * 50} grow={0.2 + weeds * 0.8} phase={i} />
        </svg>
      ))}
      <Swarm
        frame={frame}
        cx={interpolate(move, [0, 1], [DEEP.x, SHALLOW.x + 40])}
        cy={interpolate(move, [0, 1], [DEEP.y, SHALLOW.y])}
        count={34}
        spread={180}
        size={42 + grow * 18}
        flip={move > 0 && move < 1}
      />
      <Place x={880} y={850} scale={thermo}>
        <Thermo level={0.85} />
      </Place>
      <TopBadge s={title} color="#FFE082" size={60}>
        CROISSANCE EXPRESS
      </TopBadge>
      <TopBadge s={thermo} color="#FF8A80" size={84}>
        +5 °C
      </TopBadge>
      <TopBadge s={usePop(chaude, 9) * (1 - ramp(frame, algues - 6, algues))}>PLUS CHAUD = PLUS VITE</TopBadge>
      <TopBadge s={usePop(algues, 9)} color="#C5E1A5">
        MIAM, LES ALGUES !
      </TopBadge>
    </Scene>
  );
};
