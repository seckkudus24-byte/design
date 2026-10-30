import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../OuetteVideo';
import {River, Snowfall} from '../characters/Winter';
import {Goose, Gosling} from '../characters/Goose';
import {FONT, Place, Scene, prog, usePop} from '../ui';

export const Abonne: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const cta = usePop(4, 10);
  const pulse = 1 + Math.max(0, Math.sin(frame * 0.2)) * 0.05;
  const click = prog(frame, dur, 0.55, 0.62) - prog(frame, dur, 0.66, 0.72);
  const subscribed = frame / dur > 0.66;
  return (
    <Scene bg="#B3D4F0">
      <River frame={frame} snow={1} />
      <Snowfall frame={frame} amount={0.4} />
      <Place x={330} y={1240}>
        <Goose frame={frame} width={340} />
      </Place>
      {Array.from({length: 3}, (_, i) => (
        <Place key={i} x={600 + i * 140} y={1440}>
          <Gosling frame={frame + i * 7} size={120} peep />
        </Place>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${cta})`, fontFamily: FONT}}>
        <div
          style={{
            transform: `scale(${pulse * (1 - click * 0.08)})`,
            background: subscribed ? '#9E9E9E' : '#FE2C55',
            color: '#fff',
            fontSize: 100,
            padding: '24px 60px 12px',
            borderRadius: 34,
            border: '12px solid #16121F',
            boxShadow: '0 16px 0 rgba(0,0,0,0.3)',
            position: 'relative',
          }}
        >
          {subscribed ? 'ABONNÉ !' : 'ABONNE-TOI !'}
          <svg width={120} height={140} viewBox="0 0 110 130" style={{position: 'absolute', right: -100, bottom: -90, transform: `translate(${(1 - click) * 20}px, ${(1 - click) * 20}px)`}}>
            <path d="M30 10 q12 -8 20 4 v40 q10 -6 18 2 q10 -4 16 6 q10 -2 14 8 v30 q0 26 -30 32 h-20 q-22 -4 -32 -30 l-14 -30 q-2 -12 12 -10 l12 14 z" fill="#fff" stroke="#16121F" strokeWidth={7} strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{marginTop: 70, fontSize: 60, color: '#fff', WebkitTextStroke: '12px #16121F', paintOrder: 'stroke fill', textAlign: 'center', lineHeight: 1.15}}>
          + D'HISTOIRES VRAIES
          <br />
          DU MONDE ANIMAL
        </div>
      </div>
    </Scene>
  );
};
