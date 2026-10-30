import React from 'react';
import {interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../HippoVideo';
import {Hippo} from '../characters/Hippo';
import {Bubble, FONT, Moon, Place, Scene, Sun, Water, prog, usePop} from '../ui';

const STARS = Array.from({length: 22}, (_, i) => ({x: (i * 379) % 1040 + 20, y: 620 + ((i * 211) % 520)}));

export const EauTerre: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const night = prog(frame, dur, 0.5, 0.62);
  const sky = interpolateColors(night, [0, 1], ['#4FC3F7', '#1A237E']);
  const out = prog(frame, dur, 0.6, 0.76);
  const badge = usePop(Math.round(dur * 0.08), 9) * (1 - prog(frame, dur, 0.46, 0.52));
  const regrow = prog(frame, dur, 0.8, 0.94);
  const hippoX = interpolate(out, [0, 1], [780, 330]);
  const hippoY = interpolate(out, [0, 1], [1245, 1110]);
  const grazing = out >= 1;
  const mouth = grazing ? (Math.sin(frame * 0.45) + 1) / 2 : 0;
  return (
    <Scene bg={sky}>
      {STARS.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: 10,
            height: 10,
            borderRadius: 5,
            background: '#FFF9C4',
            opacity: night * (0.5 + 0.5 * Math.sin(frame * 0.2 + i)),
          }}
        />
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1250, overflow: 'hidden'}}>
        <Sun x={850} y={interpolate(night, [0, 1], [760, 1450])} r={75} frame={frame} />
        <Moon x={200} y={interpolate(night, [0, 1], [1450, 760])} r={70} bg={sky} />
      </div>
      {/* terre ferme à gauche */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M-20 1255 L 470 1255 Q 560 1290 600 1920 L -20 1920 Z" fill={interpolateColors(night, [0, 1], ['#7CB342', '#2E5E2A'])} stroke="#1B3A17" strokeWidth={8} />
        {[60, 160, 250, 380].map((x) => (
          <path key={x} d={`M${x} 1258 l12 -40 l8 40 l10 -32 l8 32`} fill="#558B2F" stroke="#1B3A17" strokeWidth={4} />
        ))}
      </svg>
      <Place x={hippoX} y={hippoY}>
        <Hippo frame={frame} width={520} walking={out > 0 && out < 1} mouthOpen={mouth} />
      </Place>
      {/* rivière à droite, par-dessus l'hippo */}
      <div style={{position: 'absolute', inset: 0, clipPath: 'polygon(540px 0, 1080px 0, 1080px 1920px, 600px 1920px)'}}>
        <Water top={1250} frame={frame} color={interpolateColors(night, [0, 1], ['#29B6F6', '#1565C0'])} opacity={0.9} />
      </div>
      {/* l'herbe repousse plus forte */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[
          [90, 1520],
          [250, 1600],
          [420, 1500],
        ].map(([x, y], k) => (
          <g key={k} transform={`translate(${x} ${y}) scale(1 ${0.35 + regrow * 1.1})`}>
            {Array.from({length: 7}, (_, i) => (
              <path key={i} d={`M${(i - 3) * 12} 0 q ${(i - 3) * 4} -60 ${(i - 3) * 12} -${90 + (i % 3) * 25}`} stroke="#9CCC65" strokeWidth={12} fill="none" strokeLinecap="round" />
            ))}
          </g>
        ))}
      </svg>
      {regrow > 0 ? <Bubble text="ÇA REPOUSSE !" x={60} y={1150} size={56} delay={Math.round(dur * 0.82)} /> : null}
      {/* 16 h par jour dans l'eau */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 700,
          transform: `scale(${badge}) rotate(-5deg)`,
          background: '#FFD600',
          border: '10px solid #16121F',
          borderRadius: 36,
          padding: '12px 30px 4px',
          fontFamily: FONT,
          fontSize: 92,
          color: '#16121F',
          textAlign: 'center',
          lineHeight: 1,
          boxShadow: '0 12px 0 rgba(0,0,0,0.3)',
        }}
      >
        16 H
        <div style={{fontSize: 40}}>PAR JOUR</div>
      </div>
    </Scene>
  );
};
