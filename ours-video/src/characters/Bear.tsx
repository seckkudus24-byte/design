import React from 'react';
import {interpolateColors} from 'remotion';
import {Sun} from '../ui';

export const INK = '#231A14';

export type BearKind = 'grizzly' | 'black';

// Ours de profil, tourné vers la droite.
// grizzly : brun, grosse bosse aux épaules, face concave, petites oreilles rondes.
// black : noir, museau beige, pas de bosse, grandes oreilles.
// pose : 'walk' | 'stand' (dressé) | 'sniff' (tête basse) | 'sit' ; roar = gueule ouverte.
export const Bear: React.FC<{
  frame: number;
  kind?: BearKind;
  width?: number;
  pose?: 'walk' | 'stand' | 'sniff' | 'sit';
  walking?: boolean;
  roar?: boolean;
  mood?: 'calm' | 'angry' | 'scared' | 'hungry' | 'dizzy';
  napkin?: boolean;
  style?: React.CSSProperties;
}> = ({frame, kind = 'grizzly', width = 420, pose = 'walk', walking = false, roar = false, mood = 'calm', napkin = false, style}) => {
  const grizzly = kind === 'grizzly';
  const fur = grizzly ? '#8B5A36' : '#2B2B2B';
  const fur2 = grizzly ? '#6D4426' : '#151515';
  const muzzle = grizzly ? '#B98A5E' : '#C8A27C';
  const step = walking ? Math.sin(frame * 0.3) * 14 : 0;
  const bob = walking ? Math.abs(Math.sin(frame * 0.3)) * -6 : Math.sin(frame * 0.08) * 2;
  const open = roar ? 14 + Math.abs(Math.sin(frame * 0.5)) * 10 : mood === 'hungry' ? 6 : 0;
  const headDrop = pose === 'sniff' ? 40 : 0;
  const blink = frame % 90 < 4 ? 0.15 : 1;
  const tilt = pose === 'stand' ? -62 : pose === 'sit' ? -30 : 0;
  const brow = mood === 'angry' || roar ? 'M312 52 L 340 64' : mood === 'scared' ? 'M312 64 L 340 52' : 'M312 58 Q 326 50 340 58';
  return (
    <svg viewBox="-20 -120 440 300" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(0 ${bob}) rotate(${tilt} 90 160)`}>
        {/* pattes arrière / avant (fond) */}
        {[
          [80, -step],
          [250, step],
        ].map(([x, s], i) => (
          <rect key={i} x={x + s * 0.6} y={110} width={46} height={66} rx={20} fill={fur2} stroke={INK} strokeWidth={6} />
        ))}
        {/* queue */}
        <circle cx={30} cy={70} r={16} fill={fur} stroke={INK} strokeWidth={6} />
        {/* corps */}
        <path
          d={
            grizzly
              ? 'M40 90 Q 30 30 110 30 Q 170 -10 220 20 Q 270 30 290 70 Q 300 130 250 140 L 80 140 Q 36 130 40 90 Z'
              : 'M40 90 Q 34 36 120 34 L 230 34 Q 285 40 290 80 Q 295 132 250 140 L 80 140 Q 36 130 40 90 Z'
          }
          fill={fur}
          stroke={INK}
          strokeWidth={7}
          strokeLinejoin="round"
        />
        {grizzly ? <path d="M150 16 Q 200 -6 230 26" stroke="#A9744A" strokeWidth={12} fill="none" strokeLinecap="round" /> : null}
        {/* pattes avant (devant) */}
        {[
          [110, step],
          [270, -step],
        ].map(([x, s], i) => (
          <g key={i}>
            <rect x={x + s * 0.6} y={112} width={48} height={68} rx={20} fill={fur} stroke={INK} strokeWidth={6} />
            {grizzly ? <path d={`M${x + s * 0.6 + 8} 182 l 4 8 M${x + s * 0.6 + 22} 182 l 4 8 M${x + s * 0.6 + 36} 182 l 4 8`} stroke="#ECEFF1" strokeWidth={5} strokeLinecap="round" /> : null}
          </g>
        ))}
        {/* tête */}
        <g transform={`translate(0 ${headDrop}) rotate(${pose === 'sniff' ? 14 : 0} 300 70)`}>
          {/* oreilles */}
          {grizzly ? (
            <>
              <circle cx={300} cy={22} r={16} fill={fur} stroke={INK} strokeWidth={6} />
              <circle cx={326} cy={18} r={14} fill={fur} stroke={INK} strokeWidth={6} />
            </>
          ) : (
            <>
              <ellipse cx={296} cy={12} rx={16} ry={24} fill={fur} stroke={INK} strokeWidth={6} />
              <ellipse cx={324} cy={8} rx={15} ry={22} fill={fur} stroke={INK} strokeWidth={6} />
            </>
          )}
          <ellipse cx={316} cy={64} rx={50} ry={46} fill={fur} stroke={INK} strokeWidth={7} />
          {/* museau : concave chez le grizzly, droit chez l'ours noir */}
          <path
            d={grizzly ? `M340 46 Q 352 66 392 66 Q 410 72 404 90 Q 396 ${108 + open} 352 ${104 + open} Q 330 100 330 82 Z` : `M336 40 L 396 62 Q 412 72 404 90 Q 396 ${108 + open} 352 ${104 + open} Q 330 100 330 82 Z`}
            fill={muzzle}
            stroke={INK}
            strokeWidth={6}
            strokeLinejoin="round"
          />
          <ellipse cx={398} cy={70} rx={12} ry={9} fill={INK} />
          {open > 0 ? (
            <g>
              <path d={`M352 92 Q 380 94 400 88 L 398 ${92 + open} Q 376 ${100 + open} 354 ${98 + open} Z`} fill="#8E2C2C" stroke={INK} strokeWidth={4} />
              <path d={`M360 92 l 5 10 l 5 -10 M384 91 l 5 10 l 5 -10`} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
            </g>
          ) : (
            <path d="M356 94 Q 376 100 396 92" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          )}
          {mood === 'dizzy' ? (
            <path d="M318 48 l 16 16 M334 48 l -16 16" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx={326} cy={56} rx={10} ry={11 * blink} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
              {blink > 0.5 ? <circle cx={329} cy={57} r={5} fill={INK} /> : null}
            </>
          )}
          <path d={brow} stroke={grizzly ? INK : '#9E9E9E'} strokeWidth={6} strokeLinecap="round" fill="none" />
          {napkin ? <path d="M350 112 L 410 112 L 380 168 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
        </g>
        {/* bosse marquée par une flèche ailleurs ; ici un léger reflet */}
      </g>
    </svg>
  );
};

// Randonneur allongé à plat ventre, vu du dessus (tête vers le haut).
export const HikerProne: React.FC<{width?: number; backpack?: boolean; flipped?: number}> = ({width = 300, backpack = true, flipped = 0}) => (
  <svg viewBox="0 0 300 520" width={width} style={{overflow: 'visible'}}>
    <g transform={`rotate(${flipped * 25} 150 260)`}>
      {/* jambes écartées */}
      <path d="M130 330 L 60 500 M170 330 L 240 500" stroke={INK} strokeWidth={34} strokeLinecap="round" />
      <path d="M130 330 L 60 500 M170 330 L 240 500" stroke="#3949AB" strokeWidth={22} strokeLinecap="round" />
      {/* torse */}
      <rect x={95} y={140} width={110} height={200} rx={40} fill="#E53935" stroke={INK} strokeWidth={8} />
      {backpack ? (
        <g>
          <rect x={100} y={160} width={100} height={150} rx={26} fill="#2E7D32" stroke={INK} strokeWidth={8} />
          <rect x={118} y={200} width={64} height={50} rx={10} fill="#43A047" stroke={INK} strokeWidth={5} />
        </g>
      ) : null}
      {/* bras repliés, mains croisées sur la nuque */}
      <path d="M100 160 L 60 110 L 140 80" stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M100 160 L 60 110 L 140 80" stroke="#E53935" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M200 160 L 240 110 L 160 80" stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M200 160 L 240 110 L 160 80" stroke="#E53935" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* tête (arrière du crâne) */}
      <circle cx={150} cy={95} r={46} fill="#6D4C41" stroke={INK} strokeWidth={8} />
      <circle cx={140} cy={80} r={14} fill="#FFE0B2" stroke={INK} strokeWidth={5} />
      <circle cx={162} cy={82} r={14} fill="#FFE0B2" stroke={INK} strokeWidth={5} />
    </g>
  </svg>
);

// Sac à dos.
export const Backpack: React.FC<{size?: number}> = ({size = 220}) => (
  <svg viewBox="0 0 200 240" width={size} style={{overflow: 'visible'}}>
    <path d="M60 30 Q 100 0 140 30" stroke={INK} strokeWidth={14} fill="none" />
    <rect x={30} y={30} width={140} height={190} rx={40} fill="#2E7D32" stroke={INK} strokeWidth={10} />
    <rect x={55} y={110} width={90} height={70} rx={14} fill="#43A047" stroke={INK} strokeWidth={8} />
    <path d="M55 130 H 145" stroke={INK} strokeWidth={6} />
  </svg>
);

// Forêt de montagne (pins). GROUND_Y = sol.
export const GROUND_Y = 1320;
export const PineForest: React.FC<{frame: number; dusk?: number; ground?: number}> = ({frame, dusk = 0, ground = GROUND_Y}) => {
  const sky1 = interpolateColors(dusk, [0, 1], ['#81D4FA', '#5C6BC0']);
  const sky2 = interpolateColors(dusk, [0, 1], ['#E1F5FE', '#FFAB91']);
  const G = ground;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sky1} 0%, ${sky2} 70%)`}} />
      <Sun x={850} y={420} r={70} frame={frame} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[0, 1].map((i) => {
          const x = ((i * 700 + frame * 0.5) % 1500) - 250;
          return (
            <g key={i} transform={`translate(${x} ${560 + i * 120})`} opacity={0.95}>
              <ellipse cx={0} cy={0} rx={120} ry={38} fill="#FFFFFF" />
              <ellipse cx={-50} cy={-20} rx={60} ry={42} fill="#FFFFFF" />
              <ellipse cx={45} cy={-28} rx={70} ry={48} fill="#FFFFFF" />
            </g>
          );
        })}
        {/* montagnes */}
        <path d={`M-20 ${G - 260} L 200 ${G - 620} L 380 ${G - 420} L 600 ${G - 700} L 820 ${G - 420} L 960 ${G - 560} L 1100 ${G - 360} L 1100 ${G} L -20 ${G} Z`} fill="#90A4AE" />
        <path d={`M160 ${G - 570} L 200 ${G - 620} L 240 ${G - 570} Z M560 ${G - 650} L 600 ${G - 700} L 640 ${G - 650} Z M930 ${G - 525} L 960 ${G - 560} L 990 ${G - 525} Z`} fill="#FFFFFF" />
        {/* pins du fond */}
        {Array.from({length: 9}, (_, i) => {
          const x = i * 130 + 20;
          const h = 220 + (i % 3) * 60;
          return <path key={i} d={`M${x} ${G - 60 - h} L ${x + 70} ${G - 60} L ${x - 70} ${G - 60} Z`} fill={i % 2 ? '#2E7D32' : '#388E3C'} stroke={INK} strokeWidth={5} />;
        })}
        {/* sol */}
        <path d={`M-20 ${G - 70} Q 540 ${G - 110} 1100 ${G - 70} L1100 1940 L-20 1940 Z`} fill="#8BC34A" stroke={INK} strokeWidth={8} />
        <rect x={-20} y={G + 60} width={1120} height={500} fill="#7CB342" />
        {/* sentier */}
        <path d={`M380 1940 Q 520 ${G + 120} 600 ${G - 60} L 680 ${G - 60} Q 640 ${G + 120} 700 1940 Z`} fill="#D7CCC8" opacity={0.8} />
        {/* pins de devant */}
        {[[40, G + 160], [1040, G + 120]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 16} y={y - 60} width={32} height={120} fill="#6D4C41" stroke={INK} strokeWidth={6} />
            <path d={`M${x} ${y - 420} L ${x + 120} ${y - 60} L ${x - 120} ${y - 60} Z`} fill="#1B5E20" stroke={INK} strokeWidth={6} />
          </g>
        ))}
      </svg>
    </>
  );
};
