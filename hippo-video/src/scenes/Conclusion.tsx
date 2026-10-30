import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../HippoVideo';
import {Hippo} from '../characters/Hippo';
import {Algae, Fish} from '../characters/Animals';
import {StickMan} from '../characters/StickMan';
import {Caption, FONT, Place, Scene, Sun, Water, prog, usePop} from '../ui';

export const Conclusion: React.FC<SceneProps> = ({dur, text}) => {
  const frame = useCurrentFrame();
  const ctaAt = Math.round(dur * 0.4);
  const cta = usePop(ctaAt, 8);
  const pulse = 1 + Math.max(0, Math.sin((frame - ctaAt) * 0.25)) * 0.06;
  const click = prog(frame, dur, 0.6, 0.66) - prog(frame, dur, 0.68, 0.72);
  const subscribed = frame / dur > 0.68;
  return (
    <Scene bg="linear-gradient(#26C6DA 0%, #B2EBF2 100%)">
      <Sun x={900} y={920} r={60} frame={frame} />
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
            style={{position: 'absolute', right: -40, bottom: -90, transform: `translate(${(1 - click) * 20}px, ${(1 - click) * 20}px)`}}
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
        <div style={{marginTop: 36, fontSize: 58, color: '#fff', WebkitTextStroke: '10px #16121F', paintOrder: 'stroke fill'}}>
          + DE SECRETS ANIMAUX
        </div>
      </div>
      <Caption text={text} size={96} top={150} />
    </Scene>
  );
};
