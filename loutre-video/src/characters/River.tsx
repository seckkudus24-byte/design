import React from 'react';
import {interpolateColors} from 'remotion';
import {Sun} from '../ui';

const INK = '#2A1B12';
const FUR = '#6D4C41';
const FUR_DARK = '#4E342E';
const THROAT = '#F3E2C3';

// Loutre géante de profil, tournée vers la droite.
// pose : 'swim' (dans l'eau), 'stand' (à quatre pattes sur la berge), 'sit' (assise, tient sa proie).
export const Otter: React.FC<{
  frame: number;
  width?: number;
  pose?: 'swim' | 'stand' | 'sit';
  shout?: boolean;
  chew?: boolean;
  sleepy?: boolean;
  radar?: number;
  style?: React.CSSProperties;
}> = ({frame, width = 420, pose = 'swim', shout = false, chew = false, sleepy = false, radar = 0, style}) => {
  const wave = pose === 'swim' ? Math.sin(frame * 0.3) * 8 : 0;
  const tail = pose === 'swim' ? Math.sin(frame * 0.3 + 1) * 16 : Math.sin(frame * 0.1) * 5;
  const step = pose === 'stand' ? Math.sin(frame * 0.4) * 10 : 0;
  const blink = sleepy ? 0.15 : frame % 85 < 4 ? 0.15 : 1;
  const jaw = shout ? 10 + Math.abs(Math.sin(frame * 0.6)) * 8 : chew ? Math.abs(Math.sin(frame * 0.7)) * 6 : 0;
  const sit = pose === 'sit';
  return (
    <svg viewBox="-60 -90 480 260" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={sit ? 'rotate(-55 200 110)' : `translate(0 ${wave})`}>
        {/* queue plate */}
        <path d={`M70 95 Q 10 ${100 + tail} -50 ${92 + tail * 1.5} Q 10 ${120 + tail} 70 120 Z`} fill={FUR_DARK} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {/* pattes */}
        {pose === 'swim' ? (
          <>
            <path d={`M110 120 l${-20 + Math.sin(frame * 0.3) * 14} 26`} stroke={FUR_DARK} strokeWidth={16} strokeLinecap="round" />
            <path d={`M250 118 l${-14 - Math.sin(frame * 0.3) * 14} 26`} stroke={FUR_DARK} strokeWidth={16} strokeLinecap="round" />
          </>
        ) : sit ? null : (
          [100, 140, 240, 280].map((x, i) => <path key={x} d={`M${x} 115 l${(i % 2 ? -1 : 1) * step} 46`} stroke={FUR_DARK} strokeWidth={18} strokeLinecap="round" />)
        )}
        {/* corps allongé */}
        <path d="M60 100 C 70 50 200 52 300 62 C 340 66 350 120 300 128 C 200 140 80 140 60 100 Z" fill={FUR} stroke={INK} strokeWidth={6} />
        <path d="M120 80 C 180 70 250 72 290 80" stroke="#8D6E63" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.6} />
        {/* tête */}
        <g transform="translate(330 72)">
          <ellipse cx={0} cy={0} rx={50} ry={40} fill={FUR} stroke={INK} strokeWidth={6} />
          {/* tache crème sous la gorge */}
          <path d="M-30 20 Q -6 46 26 30 Q 10 18 -6 26 Z" fill={THROAT} />
          <circle cx={-26} cy={-34} r={9} fill={FUR} stroke={INK} strokeWidth={4} />
          <ellipse cx={8} cy={-10} rx={8} ry={9 * blink} fill={INK} />
          {blink > 0.5 ? <circle cx={10} cy={-13} r={3} fill="#fff" /> : null}
          {/* museau */}
          <ellipse cx={40} cy={8} rx={22} ry={18} fill="#8D6E63" stroke={INK} strokeWidth={5} />
          <ellipse cx={56} cy={2} rx={9} ry={7} fill={INK} />
          {/* bouche (cri ou mastication) */}
          <path d={`M34 22 Q 48 ${26 + jaw} 60 20`} stroke={INK} strokeWidth={5} fill={jaw > 2 ? '#B71C1C' : 'none'} strokeLinejoin="round" />
          {jaw > 6 ? <path d={`M38 22 l3 6 l3 -6 M52 22 l3 6 l3 -6`} fill="#fff" stroke={INK} strokeWidth={1.5} /> : null}
          {/* moustaches */}
          {[-8, 0, 8].map((dy) => (
            <path key={dy} d={`M48 ${10 + dy} q 26 ${dy * 0.8} 48 ${dy * 1.8}`} stroke="#ECEFF1" strokeWidth={3} fill="none" />
          ))}
          {/* ondes « radar » des moustaches */}
          {radar > 0
            ? [0, 1, 2].map((i) => {
                const t = ((frame + i * 12) % 36) / 36;
                return <path key={i} d={`M${90 + t * 90} ${-30 - t * 40} q ${30 + t * 20} ${40 + t * 40} 0 ${80 + t * 80}`} stroke="#FFEB3B" strokeWidth={6} fill="none" opacity={radar * (1 - t)} />;
              })
            : null}
        </g>
      </g>
    </svg>
  );
};

// Poisson générique tourné vers la droite.
export const Fish: React.FC<{frame: number; size?: number; color?: string}> = ({frame, size = 120, color = '#90A4AE'}) => (
  <svg viewBox="-5 0 125 70" width={size} style={{overflow: 'visible'}}>
    <g transform={`rotate(${Math.sin(frame * 0.5) * 10} 20 35)`}>
      <path d="M22 35 L0 14 L0 56 Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    </g>
    <ellipse cx={58} cy={35} rx={40} ry={22} fill={color} stroke={INK} strokeWidth={4} />
    <circle cx={80} cy={29} r={6} fill="#fff" stroke={INK} strokeWidth={3} />
    <circle cx={82} cy={29} r={3} fill={INK} />
  </svg>
);

// Pléco : poisson couvert de plaques (armure).
export const Pleco: React.FC<{frame: number; size?: number; crunch?: number}> = ({frame, size = 220, crunch = 0}) => (
  <svg viewBox="-10 0 230 100" width={size} style={{overflow: 'visible'}}>
    <path d="M30 50 L0 25 L6 50 L0 75 Z" fill="#5D4037" stroke={INK} strokeWidth={4} strokeLinejoin="round" transform={`rotate(${Math.sin(frame * 0.4) * 8} 30 50)`} />
    <path d="M30 30 Q 110 0 200 40 Q 210 60 190 70 Q 110 90 30 70 Z" fill="#6D5A3A" stroke={INK} strokeWidth={5} />
    {Array.from({length: 6}, (_, i) => (
      <path key={i} d={`M${50 + i * 24} 28 q 10 20 0 44`} stroke="#3E2F1C" strokeWidth={5} fill="none" />
    ))}
    {Array.from({length: 10}, (_, i) => (
      <circle key={i} cx={55 + (i % 5) * 28} cy={40 + Math.floor(i / 5) * 18} r={4} fill="#A1887F" />
    ))}
    <path d="M70 26 L100 0 L130 26" fill="#5D4037" stroke={INK} strokeWidth={4} />
    <circle cx={175} cy={42} r={6} fill="#FFEB3B" stroke={INK} strokeWidth={3} />
    {crunch > 0 ? <path d="M120 20 l-14 30 l20 -6 l-12 32" stroke="#FFF" strokeWidth={7} fill="none" opacity={crunch} /> : null}
  </svg>
);

export const Eel: React.FC<{frame: number; width?: number}> = ({frame, width = 360}) => {
  let d = 'M0 40';
  for (let i = 1; i <= 12; i++) d += ` L${i * 28} ${40 + Math.sin(frame * 0.25 + i * 0.7) * 14}`;
  return (
    <svg viewBox="-10 0 360 80" width={width} style={{overflow: 'visible'}}>
      <path d={d} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#8D8D5A" strokeWidth={22} fill="none" strokeLinecap="round" />
      <circle cx={330} cy={36 + Math.sin(frame * 0.25 + 8.4) * 14} r={4} fill={INK} />
    </svg>
  );
};

// Jaguar tourné vers la gauche. crouch : 0..1 (s'approche ventre à terre).
export const Jaguar: React.FC<{frame: number; width?: number; crouch?: number; walking?: boolean; worried?: boolean}> = ({frame, width = 420, crouch = 0, walking = false, worried = false}) => {
  const step = walking ? Math.sin(frame * 0.35) * 12 : 0;
  const spots: [number, number][] = [[150, 95], [190, 85], [230, 100], [270, 88], [200, 118], [250, 120], [300, 110], [170, 120]];
  return (
    <svg viewBox="0 0 420 220" width={width} style={{overflow: 'visible'}}>
      <g transform={`translate(0 ${crouch * 25})`}>
        <path d={`M330 100 Q 400 ${70 + Math.sin(frame * 0.15) * 15} 410 140`} stroke={INK} strokeWidth={18} fill="none" strokeLinecap="round" />
        <path d={`M330 100 Q 400 ${70 + Math.sin(frame * 0.15) * 15} 410 140`} stroke="#F2B544" strokeWidth={10} fill="none" strokeLinecap="round" />
        {[130, 170, 280, 315].map((x, i) => (
          <rect key={x} x={x - 15} y={130 - crouch * 20} width={32} height={70 - crouch * 10} rx={12} fill="#F2B544" stroke={INK} strokeWidth={6} transform={`rotate(${(i % 2 ? -1 : 1) * step} ${x} 130)`} />
        ))}
        <ellipse cx={225} cy={110} rx={120} ry={52 - crouch * 8} fill="#F2B544" stroke={INK} strokeWidth={7} />
        {spots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={9} fill="none" stroke="#5D4037" strokeWidth={5} />
        ))}
        <circle cx={90} cy={95} r={50} fill="#F2B544" stroke={INK} strokeWidth={7} />
        <path d="M58 56 L64 30 L84 50 Z M104 50 L120 28 L126 58 Z" fill="#F2B544" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {[72, 108].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={88} rx={9} ry={worried ? 11 : 7} fill="#FFEB3B" stroke={INK} strokeWidth={3} />
            <ellipse cx={x - 2} cy={88} rx={2.5} ry={6} fill={INK} />
          </g>
        ))}
        <path d="M82 106 L98 106 L90 116 Z" fill={INK} />
        <path d={worried ? 'M76 128 q14 -8 28 0' : 'M76 124 q14 8 28 0'} stroke={INK} strokeWidth={4} fill="none" />
        {worried ? <path d="M140 40 q8 16 0 22 q-8 -6 0 -22" fill="#4FC3F7" stroke={INK} strokeWidth={3} /> : null}
      </g>
    </svg>
  );
};

// Amazone : jungle en haut, fleuve trouble en coupe. bank = berge à gauche (pour se reposer) ; murk = eau trouble.
export const Amazon: React.FC<{frame: number; surface?: number; bank?: boolean; murk?: number; dusk?: number}> = ({frame, surface = 820, bank = false, murk = 0.4, dusk = 0}) => {
  const sky1 = interpolateColors(dusk, [0, 1], ['#81D4FA', '#FF8A65']);
  const water1 = interpolateColors(murk, [0, 1], ['#4E9F8F', '#7A6A3A']);
  const water2 = interpolateColors(murk, [0, 1], ['#1E5F55', '#3E3418']);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sky1} 0%, #E1F5FE ${(surface / 1920) * 60}%)`}} />
      <Sun x={860} y={260} r={65} frame={frame} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* canopée de la jungle */}
        {Array.from({length: 9}, (_, i) => (
          <ellipse key={i} cx={i * 135} cy={surface - 90 - (i % 3) * 30} rx={130} ry={90} fill={i % 2 ? '#2E7D32' : '#388E3C'} />
        ))}
        {Array.from({length: 6}, (_, i) => (
          <ellipse key={`b${i}`} cx={60 + i * 200} cy={surface - 30} rx={140} ry={50} fill="#1B5E20" />
        ))}
        <defs>
          <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={water1} />
            <stop offset="100%" stopColor={water2} />
          </linearGradient>
        </defs>
        <rect x={-20} y={surface} width={1120} height={1920 - surface} fill="url(#river)" />
        {/* particules en suspension (eau trouble) */}
        {Array.from({length: 30}, (_, i) => {
          const x = ((i * 137 + frame * (0.3 + (i % 3) * 0.2)) % 1100) - 10;
          const y = surface + 60 + ((i * 263) % (1900 - surface - 60));
          return <circle key={i} cx={x} cy={y} r={3 + (i % 3)} fill="#D7CCC8" opacity={0.25 * murk + 0.05} />;
        })}
        {/* branches mortes au fond */}
        <path d={`M640 1920 L700 ${surface + 520} M690 ${surface + 640} L780 ${surface + 560} M700 ${surface + 760} L600 ${surface + 680}`} stroke="#4E342E" strokeWidth={22} strokeLinecap="round" fill="none" />
        <path d={`M-20 1880 Q 300 1820 600 1860 T 1100 1840 L1100 1920 L-20 1920 Z`} fill="#4E3B2A" />
        {bank ? (
          <>
            <path d={`M-20 ${surface - 120} L 520 ${surface - 120} Q 600 ${surface - 100} 640 ${surface + 30} L -20 ${surface + 30} Z`} fill="#A1887F" stroke={INK} strokeWidth={6} />
            <path d={`M-20 ${surface - 120} L 520 ${surface - 120}`} stroke="#7CB342" strokeWidth={16} />
          </>
        ) : null}
        <path
          d={`M-20 ${surface} ${Array.from({length: 14}, (_, i) => `Q ${i * 90 + 25} ${surface - 8 + Math.sin(frame * 0.1 + i) * 4} ${i * 90 + 45} ${surface} T ${i * 90 + 90} ${surface}`).join(' ')}`}
          stroke="#FFFFFF"
          strokeWidth={6}
          fill="none"
          opacity={0.6}
        />
      </svg>
    </>
  );
};
