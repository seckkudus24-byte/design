import React from 'react';
import {interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../HippoVideo';
import {Hippo} from '../characters/Hippo';
import {Fish} from '../characters/Animals';
import {Caption, FONT, Place, Scene, Water, prog, usePop} from '../ui';

export const Attention: React.FC<SceneProps> = ({dur, text}) => {
  const frame = useCurrentFrame();
  const sign = usePop(4, 8);
  const dirty = prog(frame, dur, 0.15, 0.65);
  const oxygen = interpolate(dirty, [0, 1], [100, 8]);
  const dead = frame / dur > 0.62;
  const floatUp = prog(frame, dur, 0.62, 0.9);
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <Scene bg="linear-gradient(#D32F2F 0%, #FF7043 100%)">
      {/* panneau danger */}
      <div style={{position: 'absolute', left: 790, top: 600, transform: `scale(${sign}) rotate(${Math.sin(frame * 0.3) * 6}deg)`}}>
        <svg width={220} height={200} viewBox="0 0 220 200">
          <path d="M110 10 L210 190 L10 190 Z" fill="#FFD600" stroke="#16121F" strokeWidth={12} strokeLinejoin="round" />
          <rect x={98} y={65} width={24} height={70} rx={10} fill="#16121F" />
          <circle cx={110} cy={160} r={13} fill="#16121F" />
        </svg>
      </div>
      {/* trois hippos serrés dans une mare */}
      {[
        {x: 260, w: 430, d: 0},
        {x: 780, w: 430, d: 20},
        {x: 520, w: 470, d: 40},
      ].map((h, i) => (
        <Place key={i} x={h.x} y={1050 + i * 25} flip={i === 1}>
          <Hippo frame={frame + h.d} width={h.w} happy={i !== 2} />
        </Place>
      ))}
      <Water top={1160} frame={frame} color={interpolateColors(dirty, [0, 1], ['#29B6F6', '#6D5B2E'])} opacity={0.93} />
      {/* poissons qui manquent d'air */}
      {[0, 1, 2].map((i) => {
        const x = 260 + i * 280 + (dead ? 0 : Math.sin(frame * 0.2 + i) * 40);
        const y = interpolate(floatUp, [0, 1], [1450 + (i % 2) * 120, 1250]);
        return (
          <Place key={i} x={x} y={y} rotate={dead ? 180 : 0}>
            <Fish frame={frame} color={['#FFCA28', '#FF7043', '#AB47BC'][i]} size={140} dead={dead} />
          </Place>
        );
      })}
      {/* jauge d'oxygène */}
      <div style={{position: 'absolute', left: 60, top: 600, width: 560, fontFamily: FONT}}>
        <div style={{fontSize: 64, color: '#fff', WebkitTextStroke: '10px #16121F', paintOrder: 'stroke fill'}}>OXYGÈNE</div>
        <div style={{marginTop: 10, height: 64, border: '10px solid #16121F', borderRadius: 40, background: '#fff', overflow: 'hidden'}}>
          <div
            style={{
              width: `${oxygen}%`,
              height: '100%',
              background: oxygen < 30 ? (blink ? '#D50000' : '#FF8A80') : interpolateColors(oxygen, [30, 100], ['#FFA000', '#00C853']),
            }}
          />
        </div>
      </div>
      <Caption text={text} size={92} top={140} />
    </Scene>
  );
};
