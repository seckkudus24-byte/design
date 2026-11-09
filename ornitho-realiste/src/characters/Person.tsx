import React from 'react';

// Personnage « vectoriel détaillé » (remplace le bonhomme bâton).
// Même repère que l'ancien StickMan (viewBox 0 0 160 330, pieds en bas) pour rester compatible.
const INK = '#1E1B2B';

export type Pose = 'idle' | 'wave' | 'point' | 'surprised' | 'cheer' | 'worried' | 'thumbs';

const PALETTES = [
  {shirt: '#4FC3F7', pants: '#37474F', hair: '#5D4037', skin: '#F1C27D'},
  {shirt: '#EF5350', pants: '#455A64', hair: '#212121', skin: '#C68642'},
  {shirt: '#66BB6A', pants: '#3E2723', hair: '#F9A825', skin: '#FFDBAC'},
  {shirt: '#AB47BC', pants: '#263238', hair: '#8D6E63', skin: '#E0AC69'},
  {shirt: '#FFA726', pants: '#37474F', hair: '#3E2723', skin: '#8D5524'},
];

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c * k)));
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
};

const deg = (d: number) => (d * Math.PI) / 180;

export const StickMan: React.FC<{
  frame: number;
  pose?: Pose;
  height?: number;
  walking?: boolean;
  coat?: boolean;
  glasses?: boolean;
  variant?: number;
  style?: React.CSSProperties;
}> = ({frame, pose = 'idle', height = 340, walking = false, coat = false, glasses = false, variant = 0, style}) => {
  const pal = PALETTES[((variant % PALETTES.length) + PALETTES.length) % PALETTES.length];
  const wiggle = Math.sin(frame * 0.4);
  let left = -16;
  let right = 16;
  switch (pose) {
    case 'wave':
      right = 150 + wiggle * 25;
      break;
    case 'point':
      right = 95 + wiggle * 3;
      left = -20;
      break;
    case 'surprised':
      left = -150 - wiggle * 5;
      right = 150 + wiggle * 5;
      break;
    case 'cheer':
      left = -160 - wiggle * 18;
      right = 160 + wiggle * 18;
      break;
    case 'worried':
      left = -140;
      right = 140;
      break;
    case 'thumbs':
      right = 120;
      break;
    default:
      left = -14 + wiggle * 3;
      right = 14 - wiggle * 3;
  }
  const L = 74;
  const arm = (sx: number, a: number) => [sx + Math.sin(deg(a)) * L, 118 + Math.cos(deg(a)) * L];
  const [lx, ly] = arm(56, left);
  const [rx, ry] = arm(104, right);
  const step = walking ? Math.sin(frame * 0.4) * 20 : 0;
  const bounce = walking ? Math.abs(Math.sin(frame * 0.4)) * -8 : pose === 'cheer' ? Math.abs(wiggle) * -12 : Math.sin(frame * 0.08) * 1;
  const blink = frame % 95 < 4 ? 0.12 : 1;
  const top = coat ? '#FAFAFA' : pal.shirt;
  const sleeve = coat ? '#F5F5F5' : pal.shirt;

  const mouth =
    pose === 'surprised' ? (
      <ellipse cx={80} cy={76} rx={7} ry={9} fill="#5D2B2B" stroke={INK} strokeWidth={2.5} />
    ) : pose === 'worried' ? (
      <path d="M70 79 q10 -8 20 0" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
    ) : (
      <path d="M68 72 Q80 84 92 72 Q80 77 68 72 Z" fill="#7B2D2D" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
    );

  const limb = (x1: number, y1: number, x2: number, y2: number, color: string, w: number) => (
    <>
      <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={INK} strokeWidth={w + 5} strokeLinecap="round" />
      <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={color} strokeWidth={w} strokeLinecap="round" />
    </>
  );

  return (
    <svg viewBox="0 0 160 330" height={height} style={{overflow: 'visible', ...style}}>
      {/* ombre au sol */}
      <ellipse cx={80} cy={322} rx={48} ry={7} fill="#000000" opacity={0.18} />
      <g transform={`translate(0 ${bounce})`}>
        {/* jambes */}
        {limb(68, 208, 56 + step, 306, pal.pants, 20)}
        {limb(92, 208, 104 - step, 306, shade(pal.pants, 0.85), 20)}
        <path d={`M${44 + step} 312 q 0 -12 14 -12 h 8 q 6 0 6 12 Z`} fill="#3E2723" stroke={INK} strokeWidth={3} />
        <path d={`M${94 - step} 312 q 0 -12 14 -12 h 8 q 6 0 6 12 Z`} fill="#3E2723" stroke={INK} strokeWidth={3} />
        {/* bras arrière */}
        {limb(56, 118, lx, ly, shade(sleeve, 0.9), 16)}
        <circle cx={lx} cy={ly} r={9} fill={pal.skin} stroke={INK} strokeWidth={3} />
        {/* torse */}
        <path d="M50 108 Q 50 96 64 96 L 96 96 Q 110 96 110 108 L 112 214 Q 80 222 48 214 Z" fill={top} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        <path d="M96 100 Q 108 100 108 112 L 110 212 Q 100 216 94 216 Z" fill="#000000" opacity={0.12} />
        {coat ? (
          <>
            <path d="M48 214 L 46 246 L 76 246 L 78 218 Z M112 214 L 114 246 L 84 246 L 82 218 Z" fill="#FAFAFA" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            <path d="M66 96 L 80 132 L 94 96 Z" fill={pal.shirt} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
            <path d="M80 132 V 214" stroke="#B0BEC5" strokeWidth={2.5} />
            <rect x={94} y={150} width={12} height={16} rx={2} fill="#E0E0E0" stroke={INK} strokeWidth={2} />
          </>
        ) : (
          <path d="M70 96 Q 80 110 90 96" stroke={shade(pal.shirt, 0.75)} strokeWidth={4} fill="none" />
        )}
        <rect x={50} y={206} width={62} height={10} rx={3} fill="#3E2723" opacity={coat ? 0 : 0.9} />
        {/* cou + tête */}
        <rect x={72} y={84} width={16} height={16} fill={shade(pal.skin, 0.88)} />
        <circle cx={45} cy={56} r={8} fill={pal.skin} stroke={INK} strokeWidth={3} />
        <circle cx={115} cy={56} r={8} fill={pal.skin} stroke={INK} strokeWidth={3} />
        <ellipse cx={80} cy={54} rx={35} ry={38} fill={pal.skin} stroke={INK} strokeWidth={3.5} />
        <path d="M100 30 Q 115 54 104 80 Q 112 56 100 30 Z" fill="#000000" opacity={0.08} />
        {/* cheveux */}
        <path d="M45 52 Q 42 14 80 14 Q 118 14 115 52 Q 108 34 96 32 Q 84 40 64 34 Q 50 38 45 52 Z" fill={pal.hair} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        {/* yeux */}
        {[68, 92].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={56} rx={6.5} ry={7.5 * blink} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
            {blink > 0.5 ? <circle cx={x + 1} cy={57} r={pose === 'surprised' ? 2.5 : 3.6} fill={INK} /> : null}
          </g>
        ))}
        {pose === 'worried' ? (
          <path d="M60 44 l12 4 M100 44 l-12 4" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        ) : (
          <path d="M61 45 q7 -4 14 0 M85 45 q7 -4 14 0" stroke={shade(pal.hair, 0.8)} strokeWidth={3} fill="none" strokeLinecap="round" />
        )}
        {glasses ? (
          <g fill="none" stroke={INK} strokeWidth={2.5}>
            <circle cx={68} cy={56} r={10} />
            <circle cx={92} cy={56} r={10} />
            <path d="M78 56 h4" />
          </g>
        ) : null}
        <path d="M80 60 q4 6 0 9" stroke={shade(pal.skin, 0.7)} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <ellipse cx={60} cy={68} rx={6} ry={3.5} fill="#F48FB1" opacity={0.45} />
        <ellipse cx={100} cy={68} rx={6} ry={3.5} fill="#F48FB1" opacity={0.45} />
        {mouth}
        {/* bras avant */}
        {limb(104, 118, rx, ry, sleeve, 16)}
        {pose === 'thumbs' ? (
          <g>
            <circle cx={rx} cy={ry} r={10} fill={pal.skin} stroke={INK} strokeWidth={3} />
            <path d={`M${rx} ${ry - 6} V ${ry - 26}`} stroke={INK} strokeWidth={11} strokeLinecap="round" />
            <path d={`M${rx} ${ry - 6} V ${ry - 26}`} stroke={pal.skin} strokeWidth={6} strokeLinecap="round" />
          </g>
        ) : (
          <circle cx={rx} cy={ry} r={9} fill={pal.skin} stroke={INK} strokeWidth={3} />
        )}
      </g>
    </svg>
  );
};
