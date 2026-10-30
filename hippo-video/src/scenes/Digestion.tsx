import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../HippoVideo';
import {Hippo} from '../characters/Hippo';
import {Poop} from '../characters/Animals';
import {StickMan} from '../characters/StickMan';
import {Bubble, FONT, Moon, Place, Scene, prog, usePop} from '../ui';

const Tag: React.FC<{text: string; x: number; y: number; s: number; color: string}> = ({text, x, y, s, color}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `scale(${s})`,
      transformOrigin: '0% 50%',
      background: color,
      border: '8px solid #16121F',
      borderRadius: 50,
      padding: '10px 30px 2px',
      fontFamily: FONT,
      fontSize: 62,
      color: '#16121F',
      boxShadow: '0 10px 0 rgba(0,0,0,0.3)',
    }}
  >
    {text}
  </div>
);

export const Digestion: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const at = (f: number) => Math.round(dur * f);
  const eating = frame / dur < 0.45;
  const mouth = eating ? (Math.sin(frame * 0.5) + 1) / 2 : 0;
  // « près de la moitié de ce qu'il mange ressort sans être digérée »
  const pct = Math.round(interpolate(prog(frame, dur, 0.18, 0.4), [0, 1], [0, 50]));
  const badge = usePop(at(0.15), 9) * (1 - prog(frame, dur, 0.5, 0.55));
  const tuft = interpolate(prog(frame, dur, 0.05, 0.45), [0, 1], [1, 0.3]);
  // « Pour la rivière, c'est un trésor » puis azote + phosphore = engrais
  const poop = usePop(at(0.47), 8);
  const azote = usePop(at(0.68), 9);
  const phosphore = usePop(at(0.74), 9);
  const engrais = usePop(at(0.84), 9);
  return (
    <Scene bg="linear-gradient(#311B92 0%, #5E35B1 70%)">
      <Moon x={170} y={720} r={60} bg="#3B1FA0" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, bottom: 0, background: '#43A047', borderTop: '10px solid #1B5E20'}} />
      <Place x={580} y={1140}>
        <Hippo frame={frame} width={700} mouthOpen={mouth} />
      </Place>
      {/* herbe qui disparaît */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(950 1310) scale(${tuft}) translate(-950 -1310)`}>
          {Array.from({length: 9}, (_, i) => (
            <path key={i} d={`M${880 + i * 16} 1310 q ${(i - 4) * 6} -90 ${(i - 4) * 14} -${130 + (i % 3) * 30}`} stroke="#9CCC65" strokeWidth={14} fill="none" strokeLinecap="round" />
          ))}
        </g>
        {eating
          ? Array.from({length: 5}, (_, i) => {
              const t = ((frame + i * 7) % 35) / 35;
              const x = interpolate(t, [0, 1], [950, 860]);
              const y = interpolate(t, [0, 1], [1230, 1190]) - Math.sin(t * Math.PI) * 50;
              return <rect key={i} x={x} y={y} width={30} height={9} rx={4} fill="#C5E1A5" transform={`rotate(${t * 300} ${x + 15} ${y + 4})`} />;
            })
          : null}
      </svg>
      {/* compteur 50 % */}
      <div
        style={{
          position: 'absolute',
          left: 560,
          top: 700,
          transform: `scale(${badge}) rotate(5deg)`,
          background: '#FFD600',
          border: '10px solid #16121F',
          borderRadius: 36,
          padding: '14px 36px 4px',
          fontFamily: FONT,
          fontSize: 120,
          color: '#16121F',
          textAlign: 'center',
          lineHeight: 1,
          boxShadow: '0 12px 0 rgba(0,0,0,0.3)',
        }}
      >
        {pct} %
        <div style={{fontSize: 38}}>NON DIGÉRÉ</div>
      </div>
      <Place x={190} y={1440} scale={poop}>
        <Poop size={210} />
      </Place>
      {poop > 0.5 ? (
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {Array.from({length: 6}, (_, i) => {
            const a = (i / 6) * Math.PI * 2 + frame * 0.05;
            const r = 150 + Math.sin(frame * 0.3 + i) * 12;
            return <path key={i} d="M0 -22 L6 -6 L22 0 L6 6 L0 22 L-6 6 L-22 0 L-6 -6 Z" fill="#FFEB3B" transform={`translate(${190 + Math.cos(a) * r} ${1430 + Math.sin(a) * r * 0.7})`} />;
          })}
        </svg>
      ) : null}
      {poop > 0.5 && azote < 0.1 ? <Bubble text="UN TRÉSOR !" x={320} y={1250} size={60} delay={at(0.5)} /> : null}
      <Tag text="AZOTE" x={380} y={1400} s={azote} color="#80DEEA" />
      <Tag text="PHOSPHORE" x={380} y={1520} s={phosphore} color="#F48FB1" />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 720,
          textAlign: 'center',
          transform: `scale(${engrais}) rotate(-3deg)`,
          fontFamily: FONT,
          fontSize: 84,
          color: '#76FF03',
          WebkitTextStroke: '14px #16121F',
          paintOrder: 'stroke fill',
          textShadow: '0 8px 0 rgba(0,0,0,0.35)',
        }}
      >
        = ENGRAIS NATUREL !
      </div>
      <Place x={960} y={1520}>
        <StickMan frame={frame} pose={poop > 0.5 ? 'surprised' : 'idle'} height={240} />
      </Place>
    </Scene>
  );
};
