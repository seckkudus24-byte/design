import React from 'react';
import {interpolateColors} from 'remotion';
import {Sun} from '../ui';

export const INK = '#2A1F14';

// Criquet cuirassé (cartoon), de profil, tourné vers la droite.
// mask = loup de cambrioleur ; squirt = jets de « sang » jaune ; dizzy = étoiles ; jaws = mandibules qui claquent.
export const Cricket: React.FC<{
  frame: number;
  width?: number;
  walking?: boolean;
  mood?: 'sneaky' | 'angry' | 'scared' | 'hurt' | 'happy' | 'hungry';
  mask?: boolean;
  squirt?: number;
  dizzy?: boolean;
  jaws?: boolean;
  tint?: string;
  style?: React.CSSProperties;
}> = ({frame, width = 260, walking = false, mood = 'sneaky', mask = false, squirt = 0, dizzy = false, jaws = false, tint = '#9AA246', style}) => {
  const step = walking ? Math.sin(frame * 0.5) * 10 : 0;
  const bob = walking ? Math.abs(Math.sin(frame * 0.5)) * -5 : Math.sin(frame * 0.1) * 1.5;
  const ant = Math.sin(frame * 0.15) * 8;
  const bite = jaws ? Math.abs(Math.sin(frame * 0.5)) * 10 : 0;
  const dark = interpolateColors(0.45, [0, 1], [tint, '#2A1F14']);
  const blink = frame % 80 < 4 ? 0.15 : 1;
  const brow =
    mood === 'angry' || mood === 'hungry'
      ? 'M232 52 L262 62'
      : mood === 'scared' || mood === 'hurt'
        ? 'M232 62 L262 50'
        : mood === 'sneaky'
          ? 'M230 58 L264 58'
          : 'M232 54 Q 248 44 264 54';
  return (
    <svg viewBox="-40 -80 380 240" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(0 ${bob})`}>
        {/* pattes arrière (sauteuses) */}
        <path d={`M110 100 L 60 ${40 + step} L 30 ${140 - step}`} stroke={INK} strokeWidth={20} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M110 100 L 60 ${40 + step} L 30 ${140 - step}`} stroke={dark} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* pattes avant et milieu */}
        {[
          [170, -step],
          [205, step],
        ].map(([x, s], i) => (
          <g key={i}>
            <path d={`M${x} 110 L ${x + 10 + s} 145 L ${x + 30 + s} 150`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${x} 110 L ${x + 10 + s} 145 L ${x + 30 + s} 150`} stroke={dark} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
        {/* abdomen dodu */}
        <ellipse cx={120} cy={92} rx={92} ry={56} fill={tint} stroke={INK} strokeWidth={7} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${60 + i * 30} ${50 + (i % 2) * 4} q 8 40 0 84`} stroke={dark} strokeWidth={5} fill="none" opacity={0.6} />
        ))}
        {/* petites ailes atrophiées */}
        <path d="M150 48 Q 120 30 100 52 Q 125 60 150 58 Z" fill="#C8B560" stroke={INK} strokeWidth={4} />
        {/* bouclier épineux (pronotum) */}
        <path d="M150 40 Q 200 20 228 60 L 230 112 Q 190 124 152 110 Z" fill={tint} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        {[
          [160, 34],
          [182, 26],
          [204, 30],
          [222, 46],
          [170, 70],
          [200, 66],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x - 8} ${y + 6} L ${x} ${y - 18} L ${x + 8} ${y + 6} Z`} fill="#E6D47A" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        ))}
        {/* tête */}
        <ellipse cx={252} cy={78} rx={42} ry={44} fill={tint} stroke={INK} strokeWidth={7} />
        {/* mandibules */}
        <path d={`M276 108 l 18 ${6 - bite} l -16 10 Z`} fill="#6D4C41" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M270 116 l 16 ${12 + bite} l -18 2 Z`} fill="#6D4C41" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        {/* antennes */}
        <path d={`M258 40 Q 300 ${-30 + ant} 340 ${-50 + ant}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d={`M246 38 Q 270 ${-50 - ant} 300 ${-70 - ant}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* œil */}
        {dizzy ? (
          <path d="M248 64 l16 16 M264 64 l-16 16" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        ) : (
          <>
            <ellipse cx={256} cy={72} rx={16} ry={18 * blink} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
            {blink > 0.5 ? <circle cx={mood === 'scared' ? 256 : 262} cy={74} r={mood === 'scared' ? 5 : 7} fill={INK} /> : null}
          </>
        )}
        {mask ? <path d="M226 60 Q 256 50 290 62 L 288 86 Q 256 78 226 84 Z" fill="#1B1B1B" opacity={0.92} /> : null}
        {mask ? <ellipse cx={258} cy={72} rx={9} ry={8} fill="#FFFFFF" /> : null}
        {mask ? <circle cx={261} cy={73} r={4} fill={INK} /> : null}
        <path d={brow} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        {mood === 'hungry' ? <path d="M280 98 q 10 8 2 16" stroke="#E57373" strokeWidth={6} fill="none" strokeLinecap="round" /> : null}
        {mood === 'happy' ? <path d="M262 100 q 12 8 20 -2" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
        {mood === 'hurt' ? <rect x={96} y={60} width={50} height={18} rx={4} fill="#FFFFFF" stroke={INK} strokeWidth={3} transform="rotate(-20 120 70)" /> : null}
        {/* jets de « sang » jaune et odeur */}
        {squirt > 0
          ? [0, 1, 2].map((i) => {
              const t = ((frame + i * 6) % 18) / 18;
              return (
                <g key={i} opacity={squirt}>
                  <path d={`M200 ${70 + i * 14} Q ${250 + t * 60} ${20 + i * 30 - t * 30} ${300 + t * 120} ${40 + i * 40}`} stroke="#E6D42A" strokeWidth={12 - t * 6} fill="none" strokeLinecap="round" />
                  <circle cx={300 + t * 140} cy={40 + i * 40 + t * 20} r={9 - t * 4} fill="#E6D42A" stroke={INK} strokeWidth={2} />
                </g>
              );
            })
          : null}
        {dizzy
          ? [0, 1, 2].map((i) => {
              const a = frame * 0.15 + (i * Math.PI * 2) / 3;
              return <path key={i} d={`M${252 + Math.cos(a) * 50} ${10 + Math.sin(a) * 14} l5 12 l12 0 l-10 8 l4 12 l-11 -7 l-11 7 l4 -12 l-10 -8 l12 0 Z`} fill="#FFEB3B" stroke={INK} strokeWidth={2} />;
            })
          : null}
      </g>
    </svg>
  );
};

// Lignes d'odeur verdâtres.
export const Stink: React.FC<{frame: number; width?: number; amount?: number}> = ({frame, width = 300, amount = 1}) => (
  <svg viewBox="0 0 300 300" width={width} style={{overflow: 'visible', opacity: amount}}>
    {[0, 1, 2].map((i) => {
      const t = ((frame + i * 12) % 36) / 36;
      return <path key={i} d={`M${60 + i * 90} ${260 - t * 160} q 20 -25 0 -50 q -20 -25 0 -50`} stroke="#9CCC65" strokeWidth={14} fill="none" strokeLinecap="round" opacity={1 - t} />;
    })}
  </svg>
);

// Travailleur à bec rouge (maman), de profil, tourné vers la droite.
export const Quelea: React.FC<{
  frame: number;
  width?: number;
  flying?: boolean;
  angry?: boolean;
  peck?: number;
  disgust?: boolean;
  carry?: boolean;
  style?: React.CSSProperties;
}> = ({frame, width = 200, flying = false, angry = false, peck = 0, disgust = false, carry = false, style}) => {
  const flap = flying ? Math.sin(frame * 0.8) * 40 : 0;
  const blink = frame % 70 < 4 ? 0.15 : 1;
  return (
    <svg viewBox="-30 -60 220 180" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={`rotate(${peck * 25} 90 60)`}>
        {!flying ? <path d="M70 100 l-4 22 M95 100 l4 22" stroke="#E57373" strokeWidth={5} strokeLinecap="round" /> : null}
        <path d="M30 60 L -20 50 L -10 80 Z" fill="#6D4C41" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={80} cy={68} rx={58} ry={38} fill="#C8A27C" stroke={INK} strokeWidth={6} />
        <ellipse cx={92} cy={82} rx={32} ry={18} fill="#EFE0CC" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${48 + i * 18} 50 l 10 14`} stroke="#6D4C41" strokeWidth={5} strokeLinecap="round" />
        ))}
        {flying ? (
          <path d={`M80 56 Q 50 ${-10 - flap} 10 ${0 - flap} Q 40 40 80 70 Z`} fill="#8D6E63" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        ) : (
          <path d="M40 50 Q 80 36 104 60 Q 70 86 40 70 Z" fill="#8D6E63" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        )}
        <circle cx={130} cy={36} r={30} fill="#C8A27C" stroke={INK} strokeWidth={6} />
        <path d="M152 28 L 186 40 L 152 52 Z" fill="#E53935" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {disgust ? (
          <path d="M128 24 l12 8 l-12 8" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <ellipse cx={136} cy={30} rx={8} ry={9 * blink} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
            {blink > 0.5 ? <circle cx={139} cy={31} r={4} fill={INK} /> : null}
          </>
        )}
        {angry ? <path d="M124 14 L 148 22" stroke={INK} strokeWidth={6} strokeLinecap="round" /> : null}
        {carry ? <path d="M182 44 q 10 6 4 16 q -8 6 -14 -2" stroke="#8BC34A" strokeWidth={6} fill="none" strokeLinecap="round" /> : null}
      </g>
    </svg>
  );
};

// Poussin (bec grand ouvert ou effrayé).
export const Chick: React.FC<{frame: number; size?: number; scared?: boolean}> = ({frame, size = 90, scared = false}) => {
  const open = scared ? 4 : 8 + Math.abs(Math.sin(frame * 0.4)) * 10;
  const shake = scared ? Math.sin(frame * 1.5) * 2 : 0;
  return (
    <svg viewBox="0 0 100 110" width={size} style={{overflow: 'visible'}}>
      <g transform={`translate(${shake} 0)`}>
        <ellipse cx={50} cy={74} rx={34} ry={30} fill="#E8B4A8" stroke={INK} strokeWidth={4} />
        {[30, 50, 70].map((x) => (
          <path key={x} d={`M${x} 46 q 3 -10 6 0`} stroke="#9E9E9E" strokeWidth={3} fill="none" />
        ))}
        <circle cx={50} cy={46} r={22} fill="#E8B4A8" stroke={INK} strokeWidth={4} />
        <path d={`M38 50 L 50 ${44 - open} L 62 50 Z`} fill="#FFD54F" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d={`M38 52 L 50 ${56 + open * 0.6} L 62 52 Z`} fill="#FFD54F" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        {scared ? (
          <>
            <circle cx={40} cy={40} r={6} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
            <circle cx={60} cy={40} r={6} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
            <circle cx={40} cy={41} r={2.5} fill={INK} />
            <circle cx={60} cy={41} r={2.5} fill={INK} />
          </>
        ) : (
          <path d="M34 40 q 5 -4 10 0 M56 40 q 5 -4 10 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        )}
      </g>
    </svg>
  );
};

// Nid tressé en forme de coupe. Les poussins sont posés par-dessus par l'appelant.
export const Nest: React.FC<{width?: number}> = ({width = 280}) => (
  <svg viewBox="-140 -40 280 110" width={width} style={{overflow: 'visible'}}>
    <path d="M-130 -10 Q -120 70 0 70 Q 120 70 130 -10 Z" fill="#C9A85C" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {Array.from({length: 9}, (_, i) => (
      <path key={i} d={`M${-110 + i * 27} -6 q 10 40 -4 66`} stroke="#9C7A3A" strokeWidth={4} fill="none" />
    ))}
    {Array.from({length: 3}, (_, i) => (
      <path key={i} d={`M-125 ${8 + i * 18} Q 0 ${30 + i * 18} 125 ${8 + i * 18}`} stroke="#9C7A3A" strokeWidth={4} fill="none" />
    ))}
    <ellipse cx={0} cy={-10} rx={130} ry={18} fill="#B08D48" stroke={INK} strokeWidth={6} />
  </svg>
);

// Savane avec un grand acacia : tronc à gauche, grosse branche horizontale, nid dessus.
export const GROUND_Y = 1700;
export const BRANCH_Y = 960;
export const NEST = {x: 690, y: BRANCH_Y - 40};
export const Savanna: React.FC<{frame: number; dusk?: number; tree?: boolean; ground?: number}> = ({frame, dusk = 0, tree = true, ground = GROUND_Y}) => {
  const GY = ground;
  const sky1 = interpolateColors(dusk, [0, 1], ['#FFD180', '#FF8A65']);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(#81D4FA 0%, ${sky1} 75%)`}} />
      <Sun x={860} y={420} r={80} frame={frame} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* nuages */}
        {[0, 1].map((i) => {
          const x = ((i * 700 + frame * 0.5) % 1500) - 250;
          return (
            <g key={i} transform={`translate(${x} ${560 + i * 140})`} opacity={0.9}>
              <ellipse cx={0} cy={0} rx={120} ry={38} fill="#FFFFFF" />
              <ellipse cx={-50} cy={-20} rx={60} ry={42} fill="#FFFFFF" />
              <ellipse cx={45} cy={-28} rx={70} ry={48} fill="#FFFFFF" />
            </g>
          );
        })}
        {/* acacias au loin */}
        {[120, 520, 960].map((x, i) => (
          <g key={x} opacity={0.6}>
            <rect x={x - 8} y={GY - 280 - i * 10} width={16} height={200} fill="#8D6E63" />
            <ellipse cx={x} cy={GY - 280 - i * 10} rx={110} ry={30} fill="#7CB342" />
          </g>
        ))}
        <path d={`M-20 ${GY - 60} Q 540 ${GY - 110} 1100 ${GY - 60} L1100 1940 L-20 1940 Z`} fill="#D4B36A" stroke={INK} strokeWidth={8} />
        {Array.from({length: 14}, (_, i) => (
          <path key={i} d={`M${(i * 83) % 1080} ${GY - 40 + (i % 3) * 40} l 8 -40 l 8 40 l 8 -30`} stroke="#A68A3E" strokeWidth={6} fill="none" strokeLinecap="round" />
        ))}
        {tree ? (
          <>
            {/* tronc */}
            <path d={`M170 ${GROUND_Y} Q 210 1300 230 ${BRANCH_Y - 120} L 300 ${BRANCH_Y - 120} Q 290 1300 300 ${GROUND_Y} Z`} fill="#795548" stroke={INK} strokeWidth={8} />
            <path d={`M240 1500 q 10 -60 0 -120 M270 1200 q -10 -50 0 -100`} stroke="#5D4037" strokeWidth={6} fill="none" />
            {/* grosse branche */}
            <path d={`M260 ${BRANCH_Y - 60} Q 600 ${BRANCH_Y - 40} 1000 ${BRANCH_Y - 10}`} stroke={INK} strokeWidth={56} fill="none" strokeLinecap="round" />
            <path d={`M260 ${BRANCH_Y - 60} Q 600 ${BRANCH_Y - 40} 1000 ${BRANCH_Y - 10}`} stroke="#795548" strokeWidth={42} fill="none" strokeLinecap="round" />
            {/* épines d'acacia */}
            {[420, 560, 820, 930].map((x) => (
              <path key={x} d={`M${x} ${BRANCH_Y - 30} l 6 22 l 6 -22`} stroke="#FFF8E1" strokeWidth={4} fill="none" />
            ))}
            {/* couronne plate */}
            {Array.from({length: 7}, (_, i) => (
              <ellipse key={i} cx={100 + i * 150} cy={BRANCH_Y - 260 + (i % 2) * 20} rx={180} ry={70} fill={i % 2 ? '#558B2F' : '#689F38'} stroke={INK} strokeWidth={6} />
            ))}
          </>
        ) : null}
      </svg>
    </>
  );
};

export const nestChicks = (frame: number, scared: boolean, n = 3) =>
  Array.from({length: n}, (_, i) => ({key: i, x: NEST.x - 70 + i * 70, y: NEST.y - 40 - (i % 2) * 8, frame: frame + i * 7, scared}));
