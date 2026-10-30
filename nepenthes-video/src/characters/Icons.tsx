import React from 'react';

const INK = '#16121F';

export const Check: React.FC<{size?: number; draw?: number}> = ({size = 160, draw = 1}) => (
  <svg viewBox="0 0 160 160" width={size} style={{overflow: 'visible'}}>
    <circle cx={80} cy={80} r={72} fill="#43A047" stroke={INK} strokeWidth={10} />
    <path d="M42 84 L70 112 L120 50" stroke="#fff" strokeWidth={20} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} />
  </svg>
);

export const Cross: React.FC<{size?: number; draw?: number}> = ({size = 200, draw = 1}) => (
  <svg viewBox="0 0 200 200" width={size} style={{overflow: 'visible'}}>
    {['M20 20 L180 180', 'M180 20 L20 180'].map((d) => (
      <g key={d}>
        <path d={d} stroke={INK} strokeWidth={42} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
        <path d={d} stroke="#E53935" strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
      </g>
    ))}
  </svg>
);

export const House: React.FC<{size?: number}> = ({size = 200}) => (
  <svg viewBox="0 0 200 200" width={size} style={{overflow: 'visible'}}>
    <path d="M20 95 L100 25 L180 95 Z" fill="#E57373" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <rect x={40} y={92} width={120} height={95} fill="#FFE0B2" stroke={INK} strokeWidth={8} />
    <rect x={85} y={130} width={32} height={57} fill="#8D6E63" stroke={INK} strokeWidth={6} />
  </svg>
);

export const Zzz: React.FC<{size?: number; frame: number}> = ({size = 160, frame}) => (
  <svg viewBox="0 0 160 160" width={size} style={{overflow: 'visible'}}>
    {[0, 1, 2].map((i) => (
      <text key={i} x={20 + i * 40} y={140 - i * 45 - Math.sin(frame * 0.1 + i) * 6} fontFamily="LuckiestGuy" fontSize={44 + i * 10} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">
        Z
      </text>
    ))}
  </svg>
);

export const ColdThermo: React.FC<{size?: number; level: number; frame: number}> = ({size = 360, level, frame}) => (
  <svg viewBox="0 0 120 330" height={size} style={{overflow: 'visible'}}>
    <g transform={`translate(${level > 0.9 ? Math.sin(frame * 1.4) * 2 : 0} 0)`}>
      <rect x={38} y={10} width={44} height={250} rx={22} fill="#fff" stroke={INK} strokeWidth={8} />
      <rect x={50} y={30 + 200 * level} width={20} height={240 - 200 * level} rx={10} fill="#29B6F6" />
      <circle cx={60} cy={280} r={40} fill="#29B6F6" stroke={INK} strokeWidth={8} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${20 - i * 6} ${60 + i * 60} l-14 -10 m14 10 l-14 10 m14 -10 l-18 0`} stroke="#B3E5FC" strokeWidth={5} strokeLinecap="round" opacity={level} />
      ))}
    </g>
  </svg>
);

export const Hearts: React.FC<{frame: number; amount: number; x: number; y: number; spread?: number}> = ({frame, amount, x, y, spread = 300}) => (
  <>
    {Array.from({length: 6}, (_, i) => {
      const t = ((frame + i * 13) % 70) / 70;
      return (
        <svg
          key={i}
          viewBox="0 0 260 240"
          width={60 + (i % 3) * 20}
          style={{position: 'absolute', left: x + ((i * 97) % spread) - spread / 2, top: y - t * 300, opacity: amount * (1 - t), transform: `scale(${amount})`}}
        >
          <path d="M130 220 C 30 150 0 100 20 60 C 40 15 105 15 130 65 C 155 15 220 15 240 60 C 260 100 230 150 130 220 Z" fill="#FF4081" stroke={INK} strokeWidth={14} />
        </svg>
      );
    })}
  </>
);
