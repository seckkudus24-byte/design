import React from 'react';

const INK = '#3A2A20';

export const Bulb: React.FC<{size?: number; glow?: number}> = ({size = 140, glow = 1}) => (
  <svg viewBox="0 0 120 160" width={size} style={{overflow: 'visible', filter: `drop-shadow(0 0 ${20 * glow}px #FFF59D)`}}>
    <path d="M60 10 C 20 10 10 50 30 80 C 40 95 42 105 42 118 L78 118 C 78 105 80 95 90 80 C 110 50 100 10 60 10 Z" fill="#FFF176" stroke={INK} strokeWidth={7} />
    <rect x={42} y={118} width={36} height={26} rx={6} fill="#B0BEC5" stroke={INK} strokeWidth={6} />
    <path d="M50 70 q10 -16 20 0" stroke="#F9A825" strokeWidth={5} fill="none" />
  </svg>
);

export const Basket: React.FC<{size?: number}> = ({size = 300}) => (
  <svg viewBox="0 0 300 170" width={size} style={{overflow: 'visible'}}>
    <path d="M20 40 Q 150 0 280 40" stroke="#8D6E63" strokeWidth={14} fill="none" strokeLinecap="round" />
    <path d="M10 60 L290 60 L260 165 L40 165 Z" fill="#D7A86E" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${20 + i * 2} ${80 + i * 22} L${280 - i * 2} ${80 + i * 22}`} stroke="#A1784A" strokeWidth={5} />
    ))}
    <path d="M10 60 Q 80 90 150 62 Q 220 90 290 60" fill="#90CAF9" stroke={INK} strokeWidth={6} />
  </svg>
);

export const BrokenHeart: React.FC<{size?: number; split?: number}> = ({size = 150, split = 1}) => (
  <svg viewBox="0 0 260 240" width={size} style={{overflow: 'visible'}}>
    <g transform={`translate(${-14 * split} 0) rotate(${-8 * split} 130 220)`}>
      <path d="M130 220 C 30 150 0 100 20 60 C 40 15 105 15 130 65 L 115 100 L 140 130 L 120 165 L 130 220 Z" fill="#E57373" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
    </g>
    <g transform={`translate(${14 * split} 0) rotate(${8 * split} 130 220)`}>
      <path d="M130 220 L 120 165 L 140 130 L 115 100 L 130 65 C 155 15 220 15 240 60 C 260 100 230 150 130 220 Z" fill="#E57373" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
    </g>
  </svg>
);

export const Cloud: React.FC<{size?: number; frame: number}> = ({size = 260, frame}) => (
  <svg viewBox="0 0 260 200" width={size} style={{overflow: 'visible'}}>
    <path d="M50 110 a40 40 0 0 1 30 -60 a55 55 0 0 1 100 10 a40 40 0 0 1 30 70 Z" fill="#B0BEC5" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    {[0, 1, 2, 3].map((i) => {
      const t = ((frame + i * 9) % 36) / 36;
      return <path key={i} d={`M${80 + i * 30} ${125 + t * 60} l-4 14`} stroke="#81D4FA" strokeWidth={6} strokeLinecap="round" opacity={1 - t} />;
    })}
  </svg>
);

export const Crowd: React.FC<{size?: number; frame: number}> = ({size = 900, frame}) => (
  <svg viewBox="0 0 900 200" width={size} style={{overflow: 'visible'}}>
    {Array.from({length: 18}, (_, i) => {
      const x = 30 + (i % 9) * 100 + (i >= 9 ? 50 : 0);
      const y = i >= 9 ? 120 : 60;
      const bob = Math.sin(frame * 0.2 + i) * 4;
      return (
        <g key={i} transform={`translate(${x} ${y + bob})`}>
          <circle cx={0} cy={0} r={26} fill="#fff" stroke="#1B1B2F" strokeWidth={6} />
          <circle cx={-8} cy={-4} r={3} fill="#1B1B2F" />
          <circle cx={8} cy={-4} r={3} fill="#1B1B2F" />
          <path d="M-8 8 q8 -6 16 0" stroke="#1B1B2F" strokeWidth={3} fill="none" />
          <path d="M0 26 L0 70" stroke="#1B1B2F" strokeWidth={8} />
        </g>
      );
    })}
  </svg>
);

export const SoftHeart: React.FC<{size?: number; outline?: boolean; glow?: number}> = ({size = 160, outline = false, glow = 0}) => (
  <svg viewBox="0 0 260 240" width={size} style={{overflow: 'visible', filter: glow ? `drop-shadow(0 0 ${25 * glow}px #FF8A80)` : undefined}}>
    <path
      d="M130 220 C 30 150 0 100 20 60 C 40 15 105 15 130 65 C 155 15 220 15 240 60 C 260 100 230 150 130 220 Z"
      fill={outline ? 'none' : '#FF6F91'}
      stroke={outline ? '#FF8A80' : INK}
      strokeWidth={outline ? 12 : 12}
      strokeDasharray={outline ? '22 16' : undefined}
    />
  </svg>
);
