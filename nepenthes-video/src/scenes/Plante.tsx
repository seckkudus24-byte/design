import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../NepenthesVideo';
import {useCue} from '../cue';
import {Jungle, Pellet, Pitcher, Treeshrew} from '../characters/Jungle';
import {Badge, Heart} from '../characters/Props';
import {Check} from '../characters/Icons';
import {POT} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';

export const Plante: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const tresor = useCue('tresor');
  const pauvres = useCue('pauvres');
  const azote = useCue("d'azote");
  const ventre = useCue('ventre');
  const regale = useCue('regale');
  const contrat = useCue('contrat');
  const title = usePop(4, 9) * (1 - ramp(frame, tresor - 6, tresor));
  const treasure = usePop(tresor, 9) * (1 - ramp(frame, pauvres - 6, pauvres));
  const poor = usePop(pauvres, 9) * (1 - ramp(frame, azote - 6, azote));
  const n = usePop(azote, 9) * (1 - ramp(frame, ventre - 6, ventre));
  const leave = ramp(frame, ventre, ventre + 40);
  const yum = frame >= regale;
  const hearts = usePop(regale, 9);
  const deal = usePop(contrat, 9);
  return (
    <Scene bg="#81D4FA">
      <Jungle frame={frame} />
      {/* sol pauvre et craquelé */}
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: poor}}>
        {['M120 1650 l60 30 l50 -20 l70 40', 'M640 1700 l50 -30 l70 20 l60 -40', 'M380 1800 l80 10 l40 30'].map((d, i) => (
          <path key={i} d={d} stroke="#3E2723" strokeWidth={8} fill="none" strokeLinecap="round" />
        ))}
      </svg>
      <Place x={POT.x} y={POT.y}>
        <Pitcher frame={frame} height={POT.h} face={yum ? 'yum' : 'happy'} />
      </Place>
      <Place x={interpolate(leave, [0, 1], [820, 1300])} y={1500} >
        <Treeshrew frame={frame} width={260} bigBelly={leave > 0} walking={leave > 0 && leave < 1} />
      </Place>
      {/* trésor : les crottes brillent */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 650, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, transform: `scale(${treasure})`}}>
        <Pellet size={70} />
        <Badge size={74}>UN TRÉSOR !</Badge>
        <Pellet size={70} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', transform: `scale(${poor})`}}>
        <Badge size={66} color="#BCAAA4">
          SOL TRÈS PAUVRE
        </Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 670, display: 'flex', justifyContent: 'center', transform: `scale(${n})`}}>
        <Badge size={70} color="#80DEEA">
          AZOTE = ENGRAIS
        </Badge>
      </div>
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 18) % 54) / 54;
        return (
          <div key={i} style={{position: 'absolute', left: 380 + i * 110, top: 900 - t * 200, opacity: hearts * (1 - t)}}>
            <Heart size={60} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, transform: `scale(${deal})`}}>
        <Badge size={72}>CONTRAT PARFAIT</Badge>
        <Check size={110} />
      </div>
    </Scene>
  );
};
