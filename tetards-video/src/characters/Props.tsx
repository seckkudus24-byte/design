import React from 'react';
import {FONT} from '../ui';

const INK = '#2B1E14';

export const Sponge: React.FC<{size?: number}> = ({size = 220}) => (
  <svg viewBox="0 0 220 160" width={size} style={{overflow: 'visible'}}>
    <rect x={10} y={20} width={200} height={130} rx={26} fill="#FFEB3B" stroke={INK} strokeWidth={8} />
    <rect x={10} y={20} width={200} height={40} rx={20} fill="#66BB6A" stroke={INK} strokeWidth={8} />
    {[
      [50, 95, 12],
      [95, 120, 9],
      [140, 92, 14],
      [180, 125, 8],
      [70, 132, 6],
      [168, 82, 6],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#F9A825" />
    ))}
  </svg>
);

export const Drop: React.FC<{size?: number; heart?: boolean; glow?: number}> = ({size = 160, heart = false, glow = 0}) => (
  <svg viewBox="0 0 160 200" width={size} style={{overflow: 'visible', filter: glow ? `drop-shadow(0 0 ${30 * glow}px #4FC3F7)` : undefined}}>
    <path d="M80 6 C 120 70 150 100 150 132 A 70 70 0 0 1 10 132 C 10 100 40 70 80 6 Z" fill="#29B6F6" stroke={INK} strokeWidth={8} />
    <path d="M46 120 A 36 36 0 0 0 62 160" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7} />
    {heart ? (
      <path d="M80 168 C 50 146 44 130 52 118 C 60 106 76 110 80 122 C 84 110 100 106 108 118 C 116 130 110 146 80 168 Z" fill="#FF4081" stroke={INK} strokeWidth={5} />
    ) : null}
  </svg>
);

export const Seeds: React.FC<{size?: number}> = ({size = 120}) => (
  <svg viewBox="0 0 120 80" width={size} style={{overflow: 'visible'}}>
    {[
      [20, 60],
      [45, 50],
      [70, 62],
      [95, 52],
      [35, 30],
      [60, 36],
      [82, 30],
      [58, 12],
    ].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx={13} ry={8} fill="#C0A060" stroke={INK} strokeWidth={4} transform={`rotate(${i * 37} ${x} ${y})`} />
    ))}
  </svg>
);

export const Heart: React.FC<{size?: number}> = ({size = 100}) => (
  <svg viewBox="0 0 260 240" width={size} style={{overflow: 'visible'}}>
    <path d="M130 220 C 30 150 0 100 20 60 C 40 15 105 15 130 65 C 155 15 220 15 240 60 C 260 100 230 150 130 220 Z" fill="#FF4081" stroke={INK} strokeWidth={14} />
  </svg>
);

export const Medal: React.FC<{size?: number; text: string}> = ({size = 220, text}) => (
  <svg viewBox="0 0 220 260" width={size} style={{overflow: 'visible'}}>
    <path d="M60 0 L100 110 L120 110 L80 0 Z M160 0 L120 110 L100 110 L140 0 Z" fill="#E53935" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={110} cy={170} r={80} fill="#FFC107" stroke={INK} strokeWidth={8} />
    <circle cx={110} cy={170} r={60} fill="none" stroke="#FFA000" strokeWidth={6} />
    <text x={110} y={186} textAnchor="middle" fontFamily={FONT} fontSize={40} fill="#5D4037">
      {text}
    </text>
  </svg>
);

// Badge jaune façon étiquette.
export const Badge: React.FC<{children: React.ReactNode; size?: number; rotate?: number; color?: string}> = ({children, size = 76, rotate = -4, color = '#FFD600'}) => (
  <div
    style={{
      display: 'inline-block',
      background: color,
      border: '10px solid #16121F',
      borderRadius: 34,
      padding: '12px 32px 4px',
      fontFamily: FONT,
      fontSize: size,
      color: '#16121F',
      textAlign: 'center',
      lineHeight: 1.05,
      whiteSpace: 'nowrap',
      boxShadow: '0 12px 0 rgba(0,0,0,0.3)',
      transform: `rotate(${rotate}deg)`,
    }}
  >
    {children}
  </div>
);

// Petit arbre barré (« pas dans un arbre »).
export const NoTree: React.FC<{size?: number; cross?: number}> = ({size = 260, cross = 1}) => (
  <svg viewBox="0 0 260 300" width={size} style={{overflow: 'visible'}}>
    <rect x={115} y={160} width={30} height={130} rx={8} fill="#8D6E63" stroke={INK} strokeWidth={6} />
    <circle cx={130} cy={110} r={90} fill="#7CB342" stroke={INK} strokeWidth={6} />
    <g stroke="#E53935" strokeWidth={26} strokeLinecap="round" opacity={cross}>
      <line x1={20} y1={20} x2={240} y2={280} pathLength={1} strokeDasharray={`${cross} 1`} />
      <line x1={240} y1={20} x2={20} y2={280} pathLength={1} strokeDasharray={`${cross} 1`} />
    </g>
  </svg>
);
