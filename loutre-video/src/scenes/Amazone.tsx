import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../LoutreVideo';
import {useCue} from '../cue';
import {Fish} from '../characters/River';
import {Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

// Carte stylisée : le fleuve qui serpente à travers la forêt, vu du ciel.
const RIVER = 'M-40 520 C 160 420 260 760 420 640 S 640 380 780 560 S 960 900 1120 760';

export const Amazone: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const fleuve = useCue('fleuve');
  const km = useCue('6');
  const eau = useCue("d'eau");
  const especes = useCue('especes');
  const buffet = useCue('buffet');
  const title = usePop(4, 9) * (1 - ramp(frame, fleuve - 6, fleuve));
  const draw = ramp(frame, fleuve - 6, fleuve + 30);
  const fish = ramp(frame, especes - 6, especes + 30);
  return (
    <Scene bg="#2E7D32">
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect width={1080} height={1920} fill="#2E7D32" />
        {Array.from({length: 70}, (_, i) => (
          <circle key={i} cx={(i * 157) % 1080} cy={400 + ((i * 263) % 1100)} r={40 + (i % 3) * 14} fill={i % 2 ? '#388E3C' : '#1B5E20'} />
        ))}
        <path d={RIVER} transform="translate(0 300)" stroke="#5D4037" strokeWidth={92} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
        <path d={RIVER} transform="translate(0 300)" stroke="#8D9A60" strokeWidth={70} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
        <path d={RIVER} transform="translate(0 300)" stroke="#fff" strokeWidth={6} fill="none" strokeDasharray="20 40" strokeDashoffset={-frame * 3} opacity={draw > 0.95 ? 0.6 : 0} />
      </svg>
      {Array.from({length: 10}, (_, i) => {
        const x = ((i * 113 + frame * 2) % 1100) - 50;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: 1000 + (i % 4) * 90 + Math.sin(frame * 0.1 + i) * 15, transform: `scale(${fish})`}}>
            <Fish frame={frame + i * 4} size={90} color={['#FFB74D', '#4FC3F7', '#E57373', '#AED581', '#BA68C8'][i % 5]} />
          </div>
        );
      })}
      <TopBadge s={title} color="#FFE082" size={58}>
        LE PLUS GRAND GARDE-MANGER
      </TopBadge>
      <TopBadge s={usePop(km, 9) * (1 - ramp(frame, eau - 6, eau))} size={84}>
        6 400 KM
      </TopBadge>
      <TopBadge s={usePop(eau, 9) * (1 - ramp(frame, especes - 6, especes))} color="#81D4FA" size={60}>
        LE PLUS D'EAU AU MONDE
      </TopBadge>
      <TopBadge s={usePop(especes, 9) * (1 - ramp(frame, buffet - 6, buffet))} size={66} color="#FFFFFF">
        + DE 2 000 ESPÈCES
      </TopBadge>
      <TopBadge s={usePop(buffet, 9)} color="#FFE082">
        BUFFET À VOLONTÉ !
      </TopBadge>
    </Scene>
  );
};
