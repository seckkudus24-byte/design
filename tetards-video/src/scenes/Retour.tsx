import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../TetardsVideo';
import {useCue} from '../cue';
import {DEEP, House, Pond, SHALLOW, Swarm} from '../characters/Pond';
import {Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Retour: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const nuit = useCue('nuit');
  const profondes = useCue('profondes');
  const trajet = useCue('trajet');
  const travailleurs = useCue('travailleurs');
  const title = usePop(4, 9) * (1 - ramp(frame, nuit - 6, nuit));
  const night = ramp(frame, nuit - 6, nuit + 20);
  const down = ramp(frame, profondes - 20, profondes + 25);
  const loop = ramp(frame, trajet, trajet + 30);
  const work = usePop(travailleurs, 9);
  return (
    <Scene bg="#1A237E">
      <Pond frame={frame} night={night} />
      <Swarm frame={frame} cx={interpolate(down, [0, 1], [SHALLOW.x + 40, DEEP.x])} cy={interpolate(down, [0, 1], [SHALLOW.y, DEEP.y])} count={34} spread={180} />
      {/* le trajet quotidien, en pointillés */}
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: loop}}>
        <path d={`M${SHALLOW.x} ${SHALLOW.y} Q 640 760 ${DEEP.x} ${DEEP.y} Q 380 1200 ${SHALLOW.x} ${SHALLOW.y}`} stroke="#FFF59D" strokeWidth={10} strokeDasharray="26 18" strokeDashoffset={-frame * 3} fill="none" />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, transform: `scale(${work})`}}>
        <House size={150} color="#E57373" label="MAISON" />
        <svg width={120} height={60} viewBox="0 0 120 60">
          <path d="M10 20 H100 l-16 -14 M110 40 H20 l16 14" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <House size={150} color="#64B5F6" label="BUREAU" />
      </div>
      <TopBadge s={title} color="#9FA8DA">
        RETOUR AU BUNKER
      </TopBadge>
      <TopBadge s={usePop(profondes, 9) * (1 - ramp(frame, travailleurs - 6, travailleurs))} color="#FFFFFF" size={60}>
        AU FOND, À L'ABRI
      </TopBadge>
    </Scene>
  );
};
