import React from 'react';
import {interpolateColors} from 'remotion';
import {Water} from '../ui';

const INK = '#3A2A20';

// Paysage de rivière. ice : 0 = eau qui coule, 1 = rivière gelée ; snow : neige sur les berges ; dusk : ciel du soir.
export const River: React.FC<{frame: number; ice?: number; snow?: number; dusk?: number; riverTop?: number}> = ({
  frame,
  ice = 0,
  snow = 1,
  dusk = 0,
  riverTop = 1300,
}) => {
  const sky1 = interpolateColors(dusk, [0, 1], ['#B3D4F0', '#6A5A9E']);
  const sky2 = interpolateColors(dusk, [0, 1], ['#E8F1FA', '#F2B6A0']);
  const bank = interpolateColors(snow, [0, 1], ['#9CCC65', '#FFFFFF']);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sky1} 0%, ${sky2} 70%)`}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* arbres nus au loin */}
        {[120, 330, 760, 960].map((x, i) => (
          <g key={x} transform={`translate(${x} ${riverTop - 120}) scale(${0.8 + (i % 2) * 0.3})`} opacity={0.8}>
            <path d="M0 0 L0 -260 M0 -120 L-60 -200 M0 -170 L50 -240 M0 -210 L-30 -270 M-60 -200 L-80 -230 M50 -240 L70 -270" stroke="#6D5A50" strokeWidth={12} strokeLinecap="round" fill="none" />
          </g>
        ))}
        <path d={`M-20 ${riverTop - 140} Q 300 ${riverTop - 180} 600 ${riverTop - 130} T 1100 ${riverTop - 150} L 1100 ${riverTop + 20} L -20 ${riverTop + 20} Z`} fill={bank} stroke="#B0BEC5" strokeWidth={6} />
      </svg>
      {/* la rivière, qui se change en glace */}
      <div style={{position: 'absolute', inset: 0, opacity: 1 - ice}}>
        <Water top={riverTop} frame={frame} color="#64B5F6" />
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: ice}}>
        <rect x={-20} y={riverTop - 8} width={1120} height={1920 - riverTop + 8} fill="#D6ECF7" />
        {[
          'M80 1420 l90 40 l60 -20 l80 50',
          'M600 1380 l70 30 l40 60',
          'M380 1600 l120 -30 l70 40 l90 -10',
          'M820 1560 l60 50 l90 -20',
        ].map((d, i) => (
          <path key={i} d={d} stroke="#A7C7DA" strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
        <path d={`M-20 ${riverTop} L 1100 ${riverTop}`} stroke="#fff" strokeWidth={10} />
      </svg>
    </>
  );
};

// Intérieur chaleureux : mur, cheminée qui brûle doucement, tapis.
export const Home: React.FC<{frame: number}> = ({frame}) => {
  const flick = (i: number) => Math.sin(frame * 0.35 + i * 1.7) * 10;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#FFE0B2 0%, #FFCC80 100%)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect x={0} y={1350} width={1080} height={570} fill="#A1887F" />
        <ellipse cx={540} cy={1500} rx={460} ry={110} fill="#E57373" stroke={INK} strokeWidth={6} />
        <ellipse cx={540} cy={1500} rx={380} ry={80} fill="none" stroke="#FFCDD2" strokeWidth={8} />
        {/* cheminée */}
        <rect x={700} y={920} width={340} height={440} fill="#8D6E63" stroke={INK} strokeWidth={8} />
        <rect x={680} y={900} width={380} height={40} fill="#6D4C41" stroke={INK} strokeWidth={8} />
        <rect x={760} y={1060} width={220} height={300} rx={20} fill="#3E2723" stroke={INK} strokeWidth={6} />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${810 + i * 60} 1340 Q ${790 + i * 60 + flick(i)} ${1250 - i * 10} ${830 + i * 60} ${1180 + flick(i + 3)} Q ${860 + i * 60} ${1260} ${850 + i * 60} 1340 Z`}
            fill={i === 1 ? '#FFCA28' : '#FF7043'}
            stroke={INK}
            strokeWidth={4}
          />
        ))}
        {/* fenêtre avec la neige dehors */}
        <rect x={100} y={760} width={280} height={320} rx={14} fill="#B3D4F0" stroke={INK} strokeWidth={10} />
        <path d="M240 760 L240 1080 M100 920 L380 920" stroke={INK} strokeWidth={8} />
        {Array.from({length: 8}, (_, i) => (
          <circle key={i} cx={120 + ((i * 67) % 240)} cy={780 + ((frame * 2 + i * 41) % 290)} r={6} fill="#fff" />
        ))}
      </svg>
    </>
  );
};

// Flocons qui tombent doucement.
export const Snowfall: React.FC<{frame: number; amount?: number}> = ({frame, amount = 1}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    {Array.from({length: Math.round(50 * amount)}, (_, i) => {
      const x = ((i * 173) % 1080) + Math.sin(frame * 0.04 + i) * 30;
      const y = (((i * 311) % 1920) + frame * (1.5 + (i % 4) * 0.6)) % 1920;
      return <circle key={i} cx={x} cy={y} r={4 + (i % 3) * 3} fill="#fff" opacity={0.85} />;
    })}
  </svg>
);
