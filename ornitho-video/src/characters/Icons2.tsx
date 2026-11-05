import React from 'react';

const INK = '#16121F';

// Horloge dont l'aiguille tourne. turns = tours effectués (0..1 = une heure).
export const Clock: React.FC<{size?: number; turns: number}> = ({size = 160, turns}) => (
  <svg viewBox="0 0 160 160" width={size} style={{overflow: 'visible'}}>
    <circle cx={80} cy={80} r={70} fill="#fff" stroke={INK} strokeWidth={10} />
    {Array.from({length: 12}, (_, i) => (
      <line key={i} x1={80} y1={18} x2={80} y2={30} stroke={INK} strokeWidth={5} transform={`rotate(${i * 30} 80 80)`} />
    ))}
    <path d={`M80 80 L80 22 A 58 58 0 ${turns > 0.5 ? 1 : 0} 1 ${80 + Math.sin(turns * Math.PI * 2) * 58} ${80 - Math.cos(turns * Math.PI * 2) * 58} Z`} fill="#FFE082" opacity={turns > 0 ? 1 : 0} />
    <line x1={80} y1={80} x2={80} y2={28} stroke="#E53935" strokeWidth={7} strokeLinecap="round" transform={`rotate(${turns * 360} 80 80)`} />
    <circle cx={80} cy={80} r={8} fill={INK} />
  </svg>
);

export const Star: React.FC<{size?: number}> = ({size = 160}) => (
  <svg viewBox="-60 -60 120 120" width={size} style={{overflow: 'visible'}}>
    <path d="M0 -55 L14 -18 L55 -18 L22 6 L34 46 L0 22 L-34 46 L-22 6 L-55 -18 L-14 -18 Z" fill="#FFEB3B" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

export const Hearts: React.FC<{frame: number; amount: number; x: number; y: number}> = ({frame, amount, x, y}) => (
  <>
    {[0, 1, 2].map((i) => {
      const t = ((frame + i * 18) % 54) / 54;
      return (
        <svg key={i} viewBox="0 0 260 240" width={70} style={{position: 'absolute', left: x + i * 70 - 70, top: y - t * 220, opacity: amount * (1 - t)}}>
          <path d="M130 220 C 30 150 0 100 20 60 C 40 15 105 15 130 65 C 155 15 220 15 240 60 C 260 100 230 150 130 220 Z" fill="#FF4081" stroke={INK} strokeWidth={14} />
        </svg>
      );
    })}
  </>
);
