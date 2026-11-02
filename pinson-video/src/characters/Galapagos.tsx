import React from 'react';
import {interpolateColors} from 'remotion';
import {Sun} from '../ui';

export const INK = '#1F1A17';

// Géospize vampire : petit pinson noir au bec pointu, de profil, tourné vers la droite.
export const Finch: React.FC<{
  frame: number;
  width?: number;
  flying?: boolean;
  peck?: boolean;
  fangs?: boolean;
  cape?: boolean;
  towel?: boolean;
  mood?: 'happy' | 'sneaky' | 'hungry' | 'sad' | 'wow' | 'idea';
  style?: React.CSSProperties;
}> = ({frame, width = 200, flying = false, peck = false, fangs = false, cape = false, towel = false, mood = 'happy', style}) => {
  const flap = flying ? Math.sin(frame * 0.9) * 40 : 0;
  const p = peck ? Math.max(0, Math.sin(frame * 0.6)) : 0;
  const blink = frame % 70 < 4 ? 0.15 : 1;
  const brow = mood === 'sneaky' || mood === 'hungry' ? 'M120 22 L 146 32' : mood === 'sad' ? 'M120 32 L 146 22' : null;
  return (
    <svg viewBox="-30 -50 220 180" width={width} style={{overflow: 'visible', ...style}}>
      {cape ? <path d={`M70 40 Q 10 ${70 + Math.sin(frame * 0.2) * 6} 0 120 L 60 104 L 110 120 Q 100 70 90 44 Z`} fill="#4A148C" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
      {cape ? <path d="M70 46 Q 20 74 12 112 L 60 100 Z" fill="#C62828" opacity={0.9} /> : null}
      {!flying ? <path d="M70 100 l -6 22 M92 100 l 4 22" stroke="#5D4037" strokeWidth={5} strokeLinecap="round" /> : null}
      <path d="M26 66 L -18 52 L -8 84 Z" fill="#2B2B2B" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={78} cy={70} rx={54} ry={38} fill="#3A3A3A" stroke={INK} strokeWidth={6} />
      <ellipse cx={90} cy={86} rx={30} ry={16} fill="#5A5A5A" />
      {flying ? (
        <path d={`M76 58 Q 46 ${-6 - flap} 6 ${4 - flap} Q 40 44 78 70 Z`} fill="#2B2B2B" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      ) : (
        <path d="M40 54 Q 76 40 100 62 Q 68 86 40 72 Z" fill="#2B2B2B" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      )}
      {towel ? <path d="M50 40 Q 80 26 110 40 L 104 52 Q 80 42 56 52 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} /> : null}
      <g transform={`rotate(${p * 30} 120 50)`}>
        <circle cx={126} cy={38} r={30} fill="#3A3A3A" stroke={INK} strokeWidth={6} />
        {/* bec pointu */}
        <path d="M150 30 L 188 44 L 150 54 Z" fill="#9E9E9E" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {fangs ? <path d="M156 52 l 4 12 l 4 -11 M168 50 l 3 10 l 3 -9" fill="#FFFFFF" stroke={INK} strokeWidth={2} /> : null}
        {mood === 'wow' ? (
          <>
            <circle cx={134} cy={32} r={10} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
            <circle cx={135} cy={33} r={4} fill={INK} />
          </>
        ) : (
          <>
            <ellipse cx={134} cy={32} rx={8} ry={9 * blink} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
            {blink > 0.5 ? <circle cx={137} cy={33} r={4} fill={mood === 'hungry' || fangs ? '#C62828' : INK} /> : null}
          </>
        )}
        {brow ? <path d={brow} stroke="#BDBDBD" strokeWidth={5} strokeLinecap="round" /> : null}
        {mood === 'happy' ? <path d="M128 56 q 8 4 14 -2" stroke="#BDBDBD" strokeWidth={3} fill="none" strokeLinecap="round" /> : null}
      </g>
      {mood === 'idea' ? (
        <g transform="translate(120 -46)">
          <circle cx={0} cy={0} r={20} fill="#FFEB3B" stroke={INK} strokeWidth={4} />
          <rect x={-8} y={18} width={16} height={12} fill="#9E9E9E" stroke={INK} strokeWidth={3} />
        </g>
      ) : null}
    </svg>
  );
};

// Fou de Nazca : grand oiseau marin blanc, masque noir, bec orangé, de profil, tourné vers la droite.
export const Booby: React.FC<{
  frame: number;
  width?: number;
  mood?: 'calm' | 'relaxed' | 'annoyed' | 'tired' | 'love';
  tailUp?: boolean;
  reach?: number; // 0..1 : tourne la tête vers sa queue
  itchy?: boolean;
  style?: React.CSSProperties;
}> = ({frame, width = 500, mood = 'calm', tailUp = false, reach = 0, itchy = false, style}) => {
  const blink = frame % 95 < 4 ? 0.15 : 1;
  const shake = itchy ? Math.sin(frame * 1.3) * 3 : 0;
  const eyesClosed = mood === 'relaxed' || mood === 'love';
  return (
    <svg viewBox="-40 -120 440 360" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(${shake} 0)`}>
        {/* pattes */}
        <path d="M150 190 v 36 M190 190 v 36" stroke="#78909C" strokeWidth={10} strokeLinecap="round" />
        <path d="M130 228 h 40 M170 228 h 40" stroke="#78909C" strokeWidth={10} strokeLinecap="round" />
        {/* queue */}
        <path d={tailUp ? 'M60 130 L -30 70 L -10 120 Z' : 'M60 140 L -30 160 L 0 176 Z'} fill="#263238" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {/* corps */}
        <ellipse cx={160} cy={140} rx={120} ry={64} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
        {/* aile sombre */}
        <path d="M70 112 Q 160 90 250 120 Q 200 168 90 160 Z" fill="#37474F" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M90 130 Q 160 116 230 130" stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.5} />
        {/* cou + tête */}
        <g transform={`rotate(${-reach * 140} 240 110)`}>
          <path d="M226 120 Q 250 40 270 20 L 300 30 Q 290 80 268 130 Z" fill="#FFFFFF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <circle cx={290} cy={10} r={42} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
          {/* masque noir */}
          <path d="M282 -14 Q 330 -20 336 20 Q 310 32 286 22 Z" fill="#263238" />
          {/* bec */}
          <path d="M320 -4 L 400 22 L 320 30 Z" fill="#FFA726" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M322 14 L 396 22" stroke={INK} strokeWidth={3} />
          {eyesClosed ? (
            <path d="M296 2 q 8 6 16 0" stroke="#FFEB3B" strokeWidth={5} fill="none" strokeLinecap="round" />
          ) : (
            <>
              <circle cx={304} cy={2} r={9} fill="#FFEB3B" stroke={INK} strokeWidth={3} />
              <ellipse cx={305} cy={2} rx={4} ry={4 * blink} fill={INK} />
            </>
          )}
          {mood === 'annoyed' ? <path d="M290 -16 L 316 -8" stroke={INK} strokeWidth={6} strokeLinecap="round" /> : null}
          {mood === 'tired' ? <path d="M268 -30 q 6 10 0 18" stroke="#4FC3F7" strokeWidth={6} fill="none" strokeLinecap="round" /> : null}
        </g>
      </g>
    </svg>
  );
};

// Parasite (petite tique).
export const Parasite: React.FC<{size?: number; frame: number}> = ({size = 50, frame}) => {
  const w = Math.sin(frame * 0.8) * 6;
  return (
    <svg viewBox="0 0 60 50" width={size} style={{overflow: 'visible'}}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <path d={`M${18 + i * 12} 30 l ${-6 + w * 0.3} 16`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <path d={`M${18 + i * 12} 20 l ${-6 - w * 0.3} -16`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        </g>
      ))}
      <ellipse cx={30} cy={25} rx={20} ry={14} fill="#8D6E63" stroke={INK} strokeWidth={3} />
      <circle cx={50} cy={25} r={7} fill="#5D4037" stroke={INK} strokeWidth={3} />
    </svg>
  );
};

export const BloodDrop: React.FC<{size?: number}> = ({size = 60}) => (
  <svg viewBox="0 0 60 80" width={size} style={{overflow: 'visible'}}>
    <path d="M30 4 C 30 4 6 38 6 54 A 24 24 0 0 0 54 54 C 54 38 30 4 30 4 Z" fill="#D32F2F" stroke={INK} strokeWidth={5} />
    <ellipse cx={22} cy={52} rx={6} ry={10} fill="#FFFFFF" opacity={0.5} />
  </svg>
);

export const Seeds: React.FC<{size?: number}> = ({size = 120}) => (
  <svg viewBox="0 0 120 70" width={size} style={{overflow: 'visible'}}>
    {[
      [20, 40],
      [50, 30],
      [80, 44],
      [100, 28],
      [40, 56],
      [70, 60],
    ].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx={12} ry={8} fill="#D7B377" stroke={INK} strokeWidth={3} transform={`rotate(${i * 30} ${x} ${y})`} />
    ))}
  </svg>
);

// Île volcanique des Galápagos : roches de lave, cactus, océan. GROUND_Y = sol.
export const GROUND_Y = 1330;
export const IslandBg: React.FC<{frame: number; dry?: number; dusk?: number; ground?: number}> = ({frame, dry = 0, dusk = 0, ground = GROUND_Y}) => {
  const sky1 = interpolateColors(dusk, [0, 1], ['#4FC3F7', '#6A1B9A']);
  const sky2 = interpolateColors(dry, [0, 1], ['#E1F5FE', '#FFE0B2']);
  const G = ground;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sky1} 0%, ${sky2} 70%)`}} />
      <Sun x={860} y={400} r={80 + dry * 30} frame={frame} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[0, 1].map((i) => {
          const x = ((i * 700 + frame * 0.5) % 1500) - 250;
          return (
            <g key={i} transform={`translate(${x} ${560 + i * 130})`} opacity={0.9 * (1 - dry)}>
              <ellipse cx={0} cy={0} rx={120} ry={38} fill="#FFFFFF" />
              <ellipse cx={-50} cy={-20} rx={60} ry={42} fill="#FFFFFF" />
              <ellipse cx={45} cy={-28} rx={70} ry={48} fill="#FFFFFF" />
            </g>
          );
        })}
        {/* océan */}
        <rect x={-20} y={G - 300} width={1120} height={260} fill="#0288D1" />
        {Array.from({length: 6}, (_, i) => (
          <path key={i} d={`M${((i * 200 + frame * 1.2) % 1300) - 100} ${G - 270 + (i % 3) * 60} q 20 -10 40 0 t 40 0`} stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.6} />
        ))}
        {/* volcan au loin */}
        <path d={`M600 ${G - 300} L 760 ${G - 470} L 820 ${G - 470} L 980 ${G - 300} Z`} fill="#6D6A66" opacity={0.8} />
        {/* roches de lave */}
        <path d={`M-20 ${G - 60} Q 200 ${G - 110} 400 ${G - 70} Q 640 ${G - 120} 860 ${G - 70} Q 980 ${G - 90} 1100 ${G - 60} L 1100 1940 L -20 1940 Z`} fill={interpolateColors(dry, [0, 1], ['#5D5551', '#6D5D50'])} stroke={INK} strokeWidth={8} />
        {Array.from({length: 12}, (_, i) => (
          <ellipse key={i} cx={(i * 97) % 1080} cy={G + 40 + ((i * 131) % 500)} rx={50 + (i % 3) * 20} ry={18} fill="#4A4340" />
        ))}
        {/* cactus opuntia */}
        {[[90, G - 80], [990, G - 70]].map(([x, y], i) => (
          <g key={i} opacity={1 - dry * 0.4}>
            <rect x={x - 14} y={y - 160} width={28} height={160} fill="#8D6E63" stroke={INK} strokeWidth={5} />
            {[[-40, -200], [30, -230], [-10, -270]].map(([dx, dy], k) => (
              <ellipse key={k} cx={x + dx} cy={y + dy} rx={36} ry={48} fill={interpolateColors(dry, [0, 1], ['#689F38', '#A1887F'])} stroke={INK} strokeWidth={5} />
            ))}
          </g>
        ))}
      </svg>
    </>
  );
};
