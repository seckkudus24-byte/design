import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GirafeVideo';
import {useCue} from '../cue';
import {Savanna} from '../characters/Savanna';
import {Giraffe, Truck} from '../characters/Giraffe';
import {GROUND} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Demenager: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const transporter = useCue('transporter');
  const casse = useCue('casse-tete');
  const ponts = useCue('ponts');
  const fils = useCue('fils');
  const title = usePop(4, 9) * (1 - ramp(frame, transporter - 6, transporter));
  const puzzle = usePop(casse, 9) * (1 - ramp(frame, ponts - 6, ponts));
  const bridge = usePop(ponts - 4, 9);
  const wires = usePop(fils, 9);
  // le camion avance puis freine devant le pont
  const tx = interpolate(frame, [0, ponts, dur], [-300, 260, 330], {extrapolateRight: 'clamp'});
  const duck = ramp(frame, ponts + 6, ponts + 20) * 0.35;
  return (
    <Scene bg="#7EC8F0">
      <Savanna frame={frame} ground={GROUND} />
      {/* route */}
      <div style={{position: 'absolute', left: 0, right: 0, top: GROUND - 10, height: 90, background: '#616161', borderTop: '8px solid #424242'}} />
      {Array.from({length: 8}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: ((i * 160 - frame * 3) % 1280 + 1280) % 1280 - 100, top: GROUND + 30, width: 80, height: 12, background: '#FFF59D'}} />
      ))}
      {/* pont trop bas */}
      <div style={{position: 'absolute', left: 700, top: GROUND - 640, width: 400, height: 640, transform: `scale(${bridge})`, transformOrigin: '50% 100%'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 90, background: '#A1887F', border: '8px solid #3A2A1A', borderRadius: 10}} />
        <div style={{position: 'absolute', left: 30, top: 80, width: 60, height: 560, background: '#BCAAA4', border: '8px solid #3A2A1A'}} />
        <div style={{position: 'absolute', right: 30, top: 80, width: 60, height: 560, background: '#BCAAA4', border: '8px solid #3A2A1A'}} />
      </div>
      {/* fils électriques */}
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: wires}}>
        <path d="M-20 520 Q 300 600 620 540 T 1100 560" stroke="#212121" strokeWidth={8} fill="none" />
        <path d="M-20 580 Q 300 660 620 600 T 1100 620" stroke="#212121" strokeWidth={8} fill="none" />
        <path d="M560 470 l-30 70 h40 l-30 70" stroke="#FFEB3B" strokeWidth={10} fill="none" strokeLinejoin="round" />
      </svg>
      <Place x={tx + 160} y={GROUND - 50 - 0.453 * 900}>
        <Giraffe frame={frame} height={900} drink={duck} />
      </Place>
      <Place x={tx + 220} y={GROUND - 60}>
        <Truck width={520} />
      </Place>
      <TopBadge s={title} color="#FFCC80">
        DÉMÉNAGER UNE GIRAFE ?
      </TopBadge>
      <TopBadge s={puzzle}>UN VRAI CASSE-TÊTE</TopBadge>
      <TopBadge s={bridge * (1 - wires)} color="#FF8A80">
        PONT TROP BAS !
      </TopBadge>
      <TopBadge s={wires} color="#FF8A80">
        ATTENTION AUX FILS !
      </TopBadge>
    </Scene>
  );
};
