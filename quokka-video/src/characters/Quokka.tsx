import React from 'react';
import {interpolateColors} from 'remotion';
import {Sun} from '../ui';

export const INK = '#2B2118';
const FUR = '#A1887F';
const FUR2 = '#8D6E63';
const BELLY = '#E3D5C8';

export type QPose = 'idle' | 'beg' | 'eat' | 'wave' | 'reach' | 'cheer' | 'hug';
export type QMood = 'smile' | 'huge' | 'munch' | 'lick' | 'curious' | 'sleepy' | 'wow';

const rad = (d: number) => (d * Math.PI) / 180;
// [épaule gauche, épaule droite] : 0 = le long du corps, 90 = à l'horizontale, 180 = en l'air.
const ARMS: Record<QPose, [number, number]> = {
  idle: [20, 20],
  beg: [70, 70],
  eat: [110, 110],
  wave: [20, 160],
  reach: [120, 120],
  cheer: [160, 160],
  hug: [60, 60],
};

// Leaf (feuille d'eucalyptus / de buisson).
export const Leaf: React.FC<{size?: number; bitten?: number}> = ({size = 120, bitten = 0}) => (
  <svg viewBox="0 0 120 80" width={size} style={{overflow: 'visible'}}>
    <path d="M6 40 Q 50 -10 114 40 Q 50 90 6 40 Z" fill="#7CB342" stroke={INK} strokeWidth={6} />
    <path d="M10 40 H 108" stroke="#33691E" strokeWidth={4} />
    {bitten > 0 ? <circle cx={114} cy={40} r={14 + bitten * 20} fill="var(--bite, transparent)" /> : null}
  </svg>
);

// Quokka de face, assis sur ses grandes pattes.
export const Quokka: React.FC<{
  frame: number;
  width?: number;
  pose?: QPose;
  mood?: QMood;
  hop?: boolean;
  crown?: boolean;
  leaf?: boolean;
  look?: number;
  style?: React.CSSProperties;
}> = ({frame, width = 300, pose = 'idle', mood = 'smile', hop = false, crown = false, leaf = false, look = 0, style}) => {
  let [la, ra] = ARMS[pose];
  const w = Math.sin(frame * 0.5);
  if (pose === 'wave') ra += w * 20;
  if (pose === 'cheer') {
    la += w * 10;
    ra -= w * 10;
  }
  if (pose === 'reach') {
    la += w * 6;
    ra -= w * 6;
  }
  const bob = hop ? -Math.abs(Math.sin(frame * 0.3)) * 40 : Math.sin(frame * 0.1) * 2;
  const blink = mood === 'sleepy' ? 0.15 : frame % 85 < 4 ? 0.1 : 1;
  const chew = Math.abs(Math.sin(frame * 0.6)) * 8;
  const arm = (side: 1 | -1, a: number) => {
    const sx = 150 + side * 52;
    const sy = 205;
    const ex = sx + side * Math.sin(rad(a)) * 62;
    const ey = sy + Math.cos(rad(a)) * 62;
    return (
      <g key={side}>
        <path d={`M${sx} ${sy} L${ex} ${ey}`} stroke={INK} strokeWidth={30} strokeLinecap="round" />
        <path d={`M${sx} ${sy} L${ex} ${ey}`} stroke={FUR} strokeWidth={19} strokeLinecap="round" />
        <circle cx={ex} cy={ey} r={13} fill="#6D4C41" stroke={INK} strokeWidth={4} />
      </g>
    );
  };
  const mouth = {
    smile: (
      <g>
        <path d="M118 150 Q150 186 182 150 Q150 166 118 150 Z" fill="#5D2B2B" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M134 162 Q150 172 166 162" stroke="#F48FB1" strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
    ),
    huge: (
      <g>
        <path d="M108 146 Q150 206 192 146 Z" fill="#5D2B2B" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M128 172 Q150 188 172 172" stroke="#F48FB1" strokeWidth={8} fill="none" strokeLinecap="round" />
        <rect x={140} y={146} width={20} height={10} rx={2} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
      </g>
    ),
    munch: <ellipse cx={150} cy={158} rx={20} ry={4 + chew} fill="#5D2B2B" stroke={INK} strokeWidth={5} />,
    lick: (
      <g>
        <path d="M118 150 Q150 180 182 150 Z" fill="#5D2B2B" stroke={INK} strokeWidth={5} />
        <path d={`M138 160 Q150 ${190 + Math.sin(frame * 0.8) * 8} 162 160 Z`} fill="#F48FB1" stroke={INK} strokeWidth={4} />
      </g>
    ),
    curious: <ellipse cx={150} cy={158} rx={10} ry={12} fill="#5D2B2B" stroke={INK} strokeWidth={5} />,
    sleepy: <path d="M128 156 Q150 170 172 156" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />,
    wow: <ellipse cx={150} cy={160} rx={16} ry={20} fill="#5D2B2B" stroke={INK} strokeWidth={5} />,
  }[mood];
  const ex = look * 5;
  return (
    <svg viewBox="0 0 300 360" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(0 ${bob})`}>
        {/* queue */}
        <path d="M200 300 Q 270 320 280 290" stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d="M200 300 Q 270 320 280 290" stroke={FUR2} strokeWidth={12} fill="none" strokeLinecap="round" />
        {/* grands pieds */}
        <ellipse cx={108} cy={330} rx={48} ry={18} fill={FUR2} stroke={INK} strokeWidth={6} />
        <ellipse cx={192} cy={330} rx={48} ry={18} fill={FUR2} stroke={INK} strokeWidth={6} />
        {/* corps en poire */}
        <path d="M150 170 Q 238 180 236 270 Q 232 336 150 336 Q 68 336 64 270 Q 62 180 150 170 Z" fill={FUR} stroke={INK} strokeWidth={7} />
        <ellipse cx={150} cy={278} rx={52} ry={52} fill={BELLY} />
        {arm(-1, la)}
        {arm(1, ra)}
        {/* oreilles rondes */}
        <circle cx={82} cy={58} r={34} fill={FUR2} stroke={INK} strokeWidth={6} />
        <circle cx={82} cy={58} r={18} fill="#D7A9A0" />
        <circle cx={218} cy={58} r={34} fill={FUR2} stroke={INK} strokeWidth={6} />
        <circle cx={218} cy={58} r={18} fill="#D7A9A0" />
        {/* tête */}
        <ellipse cx={150} cy={120} rx={86} ry={76} fill={FUR} stroke={INK} strokeWidth={7} />
        <ellipse cx={150} cy={148} rx={50} ry={36} fill={BELLY} />
        {/* yeux */}
        {[118, 182].map((x) => (
          <g key={x}>
            {mood === 'huge' ? (
              <path d={`M${x - 12} 108 Q ${x} 94 ${x + 12} 108`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
            ) : (
              <>
                <ellipse cx={x + ex} cy={104} rx={11} ry={13 * blink} fill={INK} />
                {blink > 0.5 ? <circle cx={x + ex + 4} cy={99} r={4} fill="#FFFFFF" /> : null}
              </>
            )}
          </g>
        ))}
        {/* joues roses */}
        <ellipse cx={100} cy={140} rx={16} ry={10} fill="#F48FB1" opacity={0.7} />
        <ellipse cx={200} cy={140} rx={16} ry={10} fill="#F48FB1" opacity={0.7} />
        {/* nez */}
        <ellipse cx={150} cy={128} rx={16} ry={11} fill={INK} />
        <path d="M150 139 V 148" stroke={INK} strokeWidth={4} />
        {mouth}
        {leaf ? (
          <g transform={`translate(${95} ${150 + (mood === 'munch' ? Math.sin(frame * 0.6) * 4 : 0)}) rotate(-10)`}>
            <path d="M0 20 Q 50 -20 110 20 Q 50 60 0 20 Z" fill="#7CB342" stroke={INK} strokeWidth={6} />
            <path d="M4 20 H 104" stroke="#33691E" strokeWidth={4} />
          </g>
        ) : null}
        {crown ? (
          <path d="M100 40 L 112 0 L 132 30 L 150 -6 L 168 30 L 188 0 L 200 40 Z" fill="#FFD600" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        ) : null}
      </g>
    </svg>
  );
};

// Kangourou (le cousin), de profil, tourné vers la gauche.
export const Kangaroo: React.FC<{frame: number; width?: number}> = ({frame, width = 360}) => {
  const bob = -Math.abs(Math.sin(frame * 0.2)) * 20;
  return (
    <svg viewBox="0 0 300 420" width={width} style={{overflow: 'visible'}}>
      <g transform={`translate(0 ${bob})`}>
        <path d="M190 330 Q 290 360 290 410" stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d="M190 330 Q 290 360 290 410" stroke="#C17F4A" strokeWidth={22} fill="none" strokeLinecap="round" />
        <ellipse cx={120} cy={400} rx={70} ry={16} fill="#A86A3A" stroke={INK} strokeWidth={6} />
        <path d="M150 140 Q 230 200 220 320 Q 200 400 130 390 Q 80 380 90 300 Q 100 200 150 140 Z" fill="#C17F4A" stroke={INK} strokeWidth={7} />
        <ellipse cx={135} cy={300} rx={40} ry={60} fill="#E8C29C" />
        <path d="M110 220 l -30 30 M120 230 l -26 34" stroke={INK} strokeWidth={14} strokeLinecap="round" />
        <path d="M160 40 L 150 -10 L 175 30 Z M182 40 L 195 -8 L 198 40 Z" fill="#C17F4A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M200 60 Q 210 140 150 150 Q 90 150 60 120 Q 80 90 130 70 Q 170 30 200 60 Z" fill="#C17F4A" stroke={INK} strokeWidth={7} />
        <circle cx={150} cy={88} r={8} fill={INK} />
        <circle cx={66} cy={118} r={8} fill={INK} />
        <path d="M80 135 q 20 10 40 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
};

// Petit caillou.
export const Pebble: React.FC<{size?: number}> = ({size = 80}) => (
  <svg viewBox="0 0 80 60" width={size} style={{overflow: 'visible'}}>
    <path d="M8 40 Q 4 10 40 8 Q 76 10 72 38 Q 66 56 38 54 Q 12 54 8 40 Z" fill="#B0BEC5" stroke={INK} strokeWidth={6} />
    <path d="M24 22 q 10 -6 20 -2" stroke="#ECEFF1" strokeWidth={5} fill="none" strokeLinecap="round" />
  </svg>
);

// Île australienne : ciel, mer, plage, buissons. GROUND_Y = sol.
export const GROUND_Y = 1460;
export const Island: React.FC<{frame: number; dusk?: number; ground?: number}> = ({frame, dusk = 0, ground = GROUND_Y}) => {
  const sky2 = interpolateColors(dusk, [0, 1], ['#E1F5FE', '#FFAB91']);
  const G = ground;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(#4FC3F7 0%, ${sky2} 65%)`}} />
      <Sun x={850} y={400} r={80} frame={frame} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[0, 1, 2].map((i) => {
          const x = ((i * 520 + frame * 0.5) % 1500) - 250;
          return (
            <g key={i} transform={`translate(${x} ${560 + (i % 2) * 140})`} opacity={0.95}>
              <ellipse cx={0} cy={0} rx={120} ry={38} fill="#FFFFFF" />
              <ellipse cx={-50} cy={-20} rx={60} ry={42} fill="#FFFFFF" />
              <ellipse cx={45} cy={-28} rx={70} ry={48} fill="#FFFFFF" />
            </g>
          );
        })}
        {/* mer turquoise */}
        <rect x={-20} y={G - 330} width={1120} height={200} fill="#26C6DA" />
        {Array.from({length: 6}, (_, i) => (
          <path key={i} d={`M${((i * 200 + frame * 1.2) % 1300) - 100} ${G - 300 + (i % 3) * 50} q 20 -10 40 0 t 40 0`} stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.7} />
        ))}
        {/* plage */}
        <path d={`M-20 ${G - 140} Q 540 ${G - 180} 1100 ${G - 140} L1100 ${G} L-20 ${G} Z`} fill="#FFE0B2" />
        {/* sol de garrigue */}
        <path d={`M-20 ${G - 40} Q 540 ${G - 90} 1100 ${G - 40} L1100 1940 L-20 1940 Z`} fill="#C5A86A" stroke={INK} strokeWidth={8} />
        <rect x={-20} y={G + 80} width={1120} height={500} fill="#B39555" />
        {/* buissons */}
        {[[60, G - 70], [960, G - 80], [300, G + 160], [800, G + 200]].map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={110} ry={56} fill="#558B2F" stroke={INK} strokeWidth={6} />
            <ellipse cx={x + 40} cy={y - 26} rx={70} ry={42} fill="#7CB342" stroke={INK} strokeWidth={6} />
          </g>
        ))}
        {Array.from({length: 10}, (_, i) => (
          <circle key={i} cx={(i * 113) % 1080} cy={G + 40 + ((i * 71) % 300)} r={8} fill="#8D7444" />
        ))}
      </svg>
    </>
  );
};
