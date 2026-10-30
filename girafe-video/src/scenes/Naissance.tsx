import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GirafeVideo';
import {useCue} from '../cue';
import {Savanna, Shadow} from '../characters/Savanna';
import {Giraffe} from '../characters/Giraffe';
import {Clock} from '../characters/Icons2';
import {GROUND, gy} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Naissance: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const accouche = useCue('accouche');
  const tombe = useCue('tombe');
  const choc = useCue('choc');
  const respiration = useCue('respiration');
  const kilos = useCue('45');
  const heure = useCue('heure');
  const debout = useCue('debout', 1);
  const title = usePop(4, 9) * (1 - ramp(frame, accouche - 6, accouche));
  // le petit tombe d'environ 2 m puis se retrouve couché, avant de se lever
  const fall = ramp(frame, tombe, tombe + 14);
  const bounce = frame > tombe + 14 ? Math.abs(Math.sin((frame - tombe - 14) * 0.4)) * 30 * Math.max(0, 1 - (frame - tombe - 14) / 20) : 0;
  const stand = ramp(frame, debout, debout + 25);
  const wobble = stand > 0 && stand < 1 ? Math.sin(frame * 0.8) * 8 : stand >= 1 ? Math.sin(frame * 0.5) * 2 : 0;
  const babyY = gy(900) - interpolate(fall, [0, 1], [230, 0]) - bounce;
  const lying = frame >= tombe ? (1 - stand) : 0;
  const star = usePop(choc, 8) * (1 - ramp(frame, respiration - 4, respiration));
  const breath = frame >= respiration && frame < kilos;
  const kg = usePop(kilos, 9) * (1 - ramp(frame, heure - 6, heure));
  const clock = usePop(heure, 9);
  return (
    <Scene bg="#7EC8F0">
      <Savanna frame={frame} ground={GROUND} />
      <Shadow x={380} y={GROUND} w={420} />
      <Place x={360} y={gy(900)}>
        <Giraffe frame={frame} height={900} />
      </Place>
      {frame >= tombe - 2 ? (
        <>
          <Shadow x={640} y={GROUND} w={240} />
          <Place x={620} y={babyY} rotate={-75 * lying + wobble}>
            <Giraffe frame={frame} height={900} baby sleepy={lying > 0.5 && frame < respiration} />
          </Place>
        </>
      ) : null}
      {/* flèche « 2 m » pendant la chute */}
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: frame >= tombe && frame < choc + 10 ? 1 : 0}}>
        <path d={`M880 ${GROUND - 300} L880 ${GROUND - 10}`} stroke="#16121F" strokeWidth={12} strokeDasharray="22 14" />
        <path d={`M880 ${GROUND - 10} l-22 -30 M880 ${GROUND - 10} l22 -30`} stroke="#16121F" strokeWidth={12} strokeLinecap="round" />
        <text x={900} y={GROUND - 150} fontFamily="LuckiestGuy" fontSize={60} fill="#fff" stroke="#16121F" strokeWidth={10} paintOrder="stroke">
          2 M
        </text>
      </svg>
      <Place x={700} y={GROUND - 120} scale={star} rotate={frame * 3}>
        <svg viewBox="-60 -60 120 120" width={200}>
          <path d="M0 -55 L14 -18 L55 -18 L22 6 L34 46 L0 22 L-34 46 L-22 6 L-55 -18 L-14 -18 Z" fill="#FFEB3B" stroke="#16121F" strokeWidth={6} strokeLinejoin="round" />
        </svg>
      </Place>
      {breath
        ? [0, 1, 2].map((i) => {
            const t = ((frame + i * 10) % 30) / 30;
            return <div key={i} style={{position: 'absolute', left: 760 + t * 80, top: GROUND - 260 - t * 60, width: 40 + t * 40, height: 40 + t * 40, borderRadius: '50%', border: '6px solid #fff', opacity: 1 - t}} />;
          })
        : null}
      <TopBadge s={title} color="#FFCC80">
        NAISSANCE EN CHUTE LIBRE
      </TopBadge>
      <TopBadge s={kg} size={84}>
        45 KG
      </TopBadge>
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, transform: `scale(${clock})`}}>
        <Clock size={150} turns={interpolate(frame, [heure, debout + 25], [0, 0.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
        <TopBadgeInline>MOINS D'1 H</TopBadgeInline>
      </div>
    </Scene>
  );
};

const TopBadgeInline: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{background: '#FFD600', border: '10px solid #16121F', borderRadius: 34, padding: '12px 30px 4px', fontFamily: 'LuckiestGuy', fontSize: 66, boxShadow: '0 12px 0 rgba(0,0,0,0.3)'}}>{children}</div>
);
