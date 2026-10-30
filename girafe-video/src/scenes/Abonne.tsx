import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GirafeVideo';
import {Savanna, Shadow} from '../characters/Savanna';
import {Giraffe} from '../characters/Giraffe';
import {GROUND, gy} from '../layout';
import {FONT, Place, Scene, prog, usePop} from '../ui';

export const Abonne: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const cta = usePop(4, 8);
  const pulse = 1 + Math.max(0, Math.sin(frame * 0.25)) * 0.06;
  const click = prog(frame, dur, 0.55, 0.62) - prog(frame, dur, 0.66, 0.72);
  const subscribed = frame / dur > 0.66;
  return (
    <Scene bg="#7EC8F0">
      <Savanna frame={frame} ground={GROUND} />
      <Shadow x={300} y={GROUND} w={400} />
      <Place x={300} y={gy(1000)}>
        <Giraffe frame={frame} height={1000} />
      </Place>
      <Place x={760} y={gy(900)}>
        <Giraffe frame={frame + 20} height={900} baby />
      </Place>
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${cta})`, fontFamily: FONT}}>
        <div
          style={{
            transform: `scale(${pulse * (1 - click * 0.08)})`,
            background: subscribed ? '#9E9E9E' : '#FE2C55',
            color: '#fff',
            fontSize: 96,
            padding: '24px 56px 12px',
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
        <div style={{marginTop: 60, fontSize: 56, color: '#fff', WebkitTextStroke: '12px #16121F', paintOrder: 'stroke fill', textAlign: 'center', lineHeight: 1.15}}>
          + DE SECRETS DU MONDE ANIMAL
        </div>
      </div>
    </Scene>
  );
};
