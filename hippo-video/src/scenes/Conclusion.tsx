import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../HippoVideo';
import {Hippo} from '../characters/Hippo';
import {Algae, Fish, Poop} from '../characters/Animals';
import {StickMan} from '../characters/StickMan';
import {FONT, Place, Scene, Water, prog, usePop} from '../ui';

export const Conclusion: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  // « Abonne-toi… » arrive à 108,7 s dans la voix (≈ 71 % de la scène)
  const ctaAt = Math.round(dur * 0.7);
  const cta = usePop(ctaAt, 8);
  const poop = usePop(Math.round(dur * 0.3), 8) * (1 - prog(frame, dur, 0.66, 0.7));
  const pulse = 1 + Math.max(0, Math.sin((frame - ctaAt) * 0.25)) * 0.06;
  const click = prog(frame, dur, 0.84, 0.88) - prog(frame, dur, 0.9, 0.93);
  const subscribed = frame / dur > 0.9;
  return (
    <Scene bg="linear-gradient(#26C6DA 0%, #B2EBF2 100%)">
      <Place x={600} y={1160}>
        <Hippo frame={frame} width={600} />
      </Place>
      <Water top={1270} frame={frame} color="#039BE5" opacity={0.85} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[80, 260, 820, 990].map((x, i) => (
          <Algae key={x} frame={frame} x={x} baseY={1920} height={330} phase={i} color={i % 2 ? '#2E7D32' : '#66BB6A'} />
        ))}
      </svg>
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 25) % 60) / 60;
        const x = 340 + i * 230 + t * 120;
        const y = 1330 - Math.sin(t * Math.PI) * 260;
        return (
          <Place key={i} x={x} y={y} rotate={-60 + t * 120}>
            <Fish frame={frame} size={120} color={['#FF7043', '#FFCA28', '#EC407A'][i]} />
          </Place>
        );
      })}
      <Place x={720} y={760} scale={poop}>
        <svg width={260} height={240} viewBox="0 0 260 240" style={{overflow: 'visible'}}>
          <path
            d="M130 220 C 30 150 0 100 20 60 C 40 15 105 15 130 65 C 155 15 220 15 240 60 C 260 100 230 150 130 220 Z"
            fill="#FF4081"
            stroke="#16121F"
            strokeWidth={10}
            transform={`scale(${1 + Math.sin(frame * 0.3) * 0.05})`}
            style={{transformOrigin: '130px 120px'}}
          />
        </svg>
      </Place>
      <Place x={420} y={780} scale={poop}>
        <Poop size={170} />
      </Place>
      <Place x={150} y={1020}>
        <StickMan frame={frame} pose="cheer" height={300} />
      </Place>
      {/* appel à s'abonner */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 600,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `scale(${cta})`,
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            transform: `scale(${pulse * (1 - click * 0.08)})`,
            background: subscribed ? '#9E9E9E' : '#FE2C55',
            color: '#fff',
            fontSize: 92,
            padding: '20px 56px 12px',
            borderRadius: 30,
            border: '10px solid #16121F',
            boxShadow: '0 14px 0 rgba(0,0,0,0.3)',
            position: 'relative',
          }}
        >
          {subscribed ? 'ABONNÉ !' : 'ABONNE-TOI !'}
          <svg
            width={110}
            height={130}
            viewBox="0 0 110 130"
            style={{position: 'absolute', right: -95, bottom: -80, transform: `translate(${(1 - click) * 20}px, ${(1 - click) * 20}px)`}}
          >
            <path
              d="M30 10 q12 -8 20 4 v40 q10 -6 18 2 q10 -4 16 6 q10 -2 14 8 v30 q0 26 -30 32 h-20 q-22 -4 -32 -30 l-14 -30 q-2 -12 12 -10 l12 14 z"
              fill="#fff"
              stroke="#16121F"
              strokeWidth={7}
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div style={{marginTop: 70, fontSize: 58, color: '#fff', WebkitTextStroke: '10px #16121F', paintOrder: 'stroke fill'}}>
          + DE SECRETS ANIMAUX
        </div>
      </div>
    </Scene>
  );
};
