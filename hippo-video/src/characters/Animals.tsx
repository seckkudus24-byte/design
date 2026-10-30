import React from 'react';

const INK = '#2E2346';

// Lion cartoon tourné vers la gauche.
export const Lion: React.FC<{frame: number; width?: number; scared?: boolean; style?: React.CSSProperties}> = ({
  frame,
  width = 320,
  scared = false,
  style,
}) => {
  const mane = Array.from({length: 18}, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    const r = i % 2 === 0 ? 68 : 50;
    return `${80 + Math.cos(a) * r},${92 + Math.sin(a) * r}`;
  }).join(' ');
  const shake = scared ? Math.sin(frame * 1.7) * 3 : 0;
  return (
    <svg viewBox="0 0 320 230" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(${shake} 0)`}>
        <path d={`M250 120 Q 300 ${90 + Math.sin(frame * 0.2) * 15} 300 60`} stroke={INK} strokeWidth={8} fill="none" />
        <circle cx={300} cy={58} r={12} fill="#B5651D" stroke={INK} strokeWidth={5} />
        {[110, 150, 200, 240].map((x) => (
          <rect key={x} x={x - 14} y={140} width={30} height={70} rx={12} fill="#F2A93B" stroke={INK} strokeWidth={6} />
        ))}
        <ellipse cx={180} cy={130} rx={92} ry={52} fill="#F2A93B" stroke={INK} strokeWidth={6} />
        <polygon points={mane} fill="#B5651D" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={80} cy={92} r={40} fill="#F7C05E" stroke={INK} strokeWidth={6} />
        {[64, 96].map((x) => (
          <g key={x}>
            <circle cx={x} cy={82} r={scared ? 11 : 7} fill="#fff" stroke={INK} strokeWidth={4} />
            <circle cx={x - 2} cy={83} r={scared ? 3 : 4} fill={INK} />
          </g>
        ))}
        <path d="M72 100 L88 100 L80 110 Z" fill={INK} />
        {scared ? (
          <path d="M64 120 q8 -8 16 0 q8 8 16 0" stroke={INK} strokeWidth={4} fill="none" />
        ) : (
          <path d="M66 116 Q80 128 94 116" stroke={INK} strokeWidth={4} fill="none" />
        )}
        {scared ? (
          <path d="M128 50 q8 16 0 22 q-8 -6 0 -22" fill="#4FC3F7" stroke={INK} strokeWidth={3} />
        ) : null}
      </g>
    </svg>
  );
};

// Crocodile cartoon tourné vers la gauche. jaw : 0 = fermé, 1 = ouvert.
export const Croc: React.FC<{frame: number; width?: number; jaw?: number; scared?: boolean; style?: React.CSSProperties}> = ({
  frame,
  width = 380,
  jaw = 0,
  scared = false,
  style,
}) => {
  const tail = Math.sin(frame * 0.18) * 8;
  const teeth = (y: number, dir: number) =>
    Array.from({length: 6}, (_, i) => `M${30 + i * 14} ${y} l7 ${dir * 10} l7 ${-dir * 10}`).join(' ');
  return (
    <svg viewBox="0 0 380 170" width={width} style={{overflow: 'visible', ...style}}>
      {[150, 270].map((x) => (
        <rect key={x} x={x} y={110} width={28} height={45} rx={10} fill="#3E8E41" stroke={INK} strokeWidth={5} />
      ))}
      <path
        d={`M120 80 Q 220 50 300 85 L 375 ${100 + tail} L 300 125 Q 220 140 120 125 Z`}
        fill="#4CAF50"
        stroke={INK}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      {Array.from({length: 7}, (_, i) => (
        <path key={i} d={`M${150 + i * 22} ${72 + Math.abs(i - 3) * 2} l9 -14 l9 14`} fill="#3E8E41" stroke={INK} strokeWidth={4} />
      ))}
      {/* mâchoire du bas */}
      <g transform={`rotate(${-jaw * 18} 125 105)`}>
        <path d="M125 100 L25 108 Q15 122 30 125 L125 125 Z" fill="#81C784" stroke={INK} strokeWidth={5} />
        <path d={teeth(108, -1)} fill="#fff" stroke={INK} strokeWidth={2} />
      </g>
      {/* mâchoire du haut */}
      <g transform={`rotate(${jaw * 22} 125 100)`}>
        <path d="M130 70 L30 88 Q10 95 22 106 L130 104 Z" fill="#4CAF50" stroke={INK} strokeWidth={5} />
        <path d={teeth(104, 1)} fill="#fff" stroke={INK} strokeWidth={2} />
        <circle cx={34} cy={90} r={3} fill={INK} />
      </g>
      <circle cx={118} cy={66} r={scared ? 17 : 14} fill="#fff" stroke={INK} strokeWidth={5} />
      <circle cx={112} cy={67} r={scared ? 4 : 6} fill={INK} />
      {scared ? <path d="M150 40 q8 16 0 22 q-8 -6 0 -22" fill="#4FC3F7" stroke={INK} strokeWidth={3} /> : null}
    </svg>
  );
};

// Petit poisson tourné vers la droite.
export const Fish: React.FC<{frame: number; color?: string; size?: number; dead?: boolean; style?: React.CSSProperties}> = ({
  frame,
  color = '#FF7043',
  size = 120,
  dead = false,
  style,
}) => {
  const wag = dead ? 0 : Math.sin(frame * 0.5) * 10;
  return (
    <svg viewBox="-5 0 125 70" width={size} style={{overflow: 'visible', ...style}}>
      <g transform={`rotate(${wag} 20 35)`}>
        <path d="M22 35 L0 14 L0 56 Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
      <ellipse cx={58} cy={35} rx={40} ry={23} fill={color} stroke={INK} strokeWidth={4} />
      <path d="M48 14 Q58 2 70 14" fill={color} stroke={INK} strokeWidth={4} />
      <path d="M45 30 Q52 38 45 46" stroke={INK} strokeWidth={3} fill="none" opacity={0.6} />
      {dead ? (
        <path d="M74 24 l10 10 M84 24 l-10 10" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      ) : (
        <>
          <circle cx={80} cy={29} r={7} fill="#fff" stroke={INK} strokeWidth={3} />
          <circle cx={82} cy={29} r={3.5} fill={INK} />
        </>
      )}
      <path d={dead ? 'M88 46 q4 -4 8 0' : 'M88 44 q4 4 8 0'} stroke={INK} strokeWidth={3} fill="none" />
    </svg>
  );
};

// Algue qui ondule. grow : 0..1 (hauteur).
export const Algae: React.FC<{
  frame: number;
  x: number;
  baseY: number;
  height: number;
  grow?: number;
  color?: string;
  phase?: number;
}> = ({frame, x, baseY, height, grow = 1, color = '#2E7D32', phase = 0}) => {
  const h = height * grow;
  const segs = 5;
  let d = `M${x} ${baseY}`;
  for (let i = 1; i <= segs; i++) {
    const y = baseY - (h * i) / segs;
    const sway = Math.sin(frame * 0.08 + phase + i * 0.9) * (6 + i * 5);
    const cx = x + (i % 2 === 0 ? -28 : 28) + sway;
    d += ` Q ${cx} ${y + h / segs / 2} ${x + sway * 0.6} ${y}`;
  }
  return (
    <path d={d} stroke={color} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  );
};

// Crotte cartoon (version mignonne).
export const Poop: React.FC<{size?: number; face?: boolean; style?: React.CSSProperties}> = ({size = 120, face = true, style}) => (
  <svg viewBox="0 0 120 110" width={size} style={{overflow: 'visible', ...style}}>
    <ellipse cx={60} cy={88} rx={52} ry={20} fill="#8D5524" stroke={INK} strokeWidth={5} />
    <ellipse cx={60} cy={62} rx={40} ry={18} fill="#9C6330" stroke={INK} strokeWidth={5} />
    <ellipse cx={60} cy={40} rx={26} ry={14} fill="#A86E38" stroke={INK} strokeWidth={5} />
    <path d="M60 26 Q 66 10 76 8" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
    {face ? (
      <>
        <circle cx={46} cy={80} r={5} fill={INK} />
        <circle cx={74} cy={80} r={5} fill={INK} />
        <path d="M50 92 Q60 100 70 92" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      </>
    ) : null}
  </svg>
);

// Petite crevette tournée vers la droite.
export const Shrimp: React.FC<{frame: number; size?: number; style?: React.CSSProperties}> = ({frame, size = 100, style}) => {
  const flick = Math.sin(frame * 0.6) * 8;
  return (
    <svg viewBox="0 0 110 80" width={size} style={{overflow: 'visible', ...style}}>
      <g transform={`rotate(${flick} 20 45)`}>
        <path d="M22 44 L4 30 L6 58 Z" fill="#FF8A80" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
      <path d="M20 44 Q 30 12 70 18 Q 96 24 92 46 Q 70 40 50 52 Q 34 60 20 44 Z" fill="#FF8A80" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {[38, 52, 66].map((x) => (
        <path key={x} d={`M${x} 22 Q ${x - 6} 36 ${x + 2} 48`} stroke={INK} strokeWidth={3} fill="none" opacity={0.5} />
      ))}
      <circle cx={84} cy={30} r={5} fill={INK} />
      <path d={`M92 32 Q 108 ${10 + flick} 110 0 M90 36 Q 112 ${30 + flick} 118 22`} stroke={INK} strokeWidth={3} fill="none" />
      {[48, 60, 72].map((x) => (
        <path key={x} d={`M${x} 50 l-4 14`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      ))}
    </svg>
  );
};
