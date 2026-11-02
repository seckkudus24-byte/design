import React from 'react';
import {interpolateColors} from 'remotion';
import {Sun} from '../ui';

export const INK = '#231A14';
const FUR = '#3B2A20';
const FUR2 = '#4E3829';
const SKIN = '#E7C3A0';

export type ChimpPose = 'idle' | 'point' | 'cheer' | 'shake' | 'eat' | 'shh' | 'climb' | 'hold' | 'block' | 'beg';
export type Mood = 'happy' | 'sad' | 'neutral' | 'angry' | 'surprised' | 'shh' | 'sleepy' | 'chew';

const rad = (d: number) => (d * Math.PI) / 180;

// Bras en deux segments ; a = angle de l'épaule (0 = le long du corps, + = vers l'extérieur), b = coude (relatif).
const Arm: React.FC<{x: number; y: number; a: number; b: number; side: 1 | -1; captain?: boolean}> = ({x, y, a, b, side, captain}) => {
  const ex = x + side * Math.sin(rad(a)) * 78;
  const ey = y + Math.cos(rad(a)) * 78;
  const hx = ex + side * Math.sin(rad(a + b)) * 74;
  const hy = ey + Math.cos(rad(a + b)) * 74;
  const d = `M${x} ${y} L${ex} ${ey} L${hx} ${hy}`;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={38} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={FUR} strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {captain ? (
        <g transform={`translate(${(x + ex) / 2} ${(y + ey) / 2}) rotate(${-side * a})`}>
          <rect x={-18} y={-10} width={36} height={22} rx={4} fill="#FFD600" stroke={INK} strokeWidth={4} />
          <text x={0} y={8} textAnchor="middle" fontFamily="LuckiestGuy" fontSize={20} fill={INK}>
            C
          </text>
        </g>
      ) : null}
      <circle cx={hx} cy={hy} r={17} fill={SKIN} stroke={INK} strokeWidth={5} />
    </g>
  );
};

const POSES: Record<ChimpPose, [number, number, number, number]> = {
  // [gauche épaule, gauche coude, droite épaule, droite coude]
  idle: [12, -6, 12, -6],
  point: [12, -6, 95, -5],
  cheer: [150, 10, 150, 10],
  shake: [150, 20, 150, 20],
  eat: [15, -5, 40, -150],
  shh: [12, -6, 30, -165],
  climb: [165, 0, 120, 30],
  hold: [50, -80, 50, -80],
  block: [95, 0, 95, 0],
  beg: [60, -60, 12, -6],
};

// Chimpanzé de face, style cartoon. Taille de référence : viewBox 300x360.
export const Chimp: React.FC<{
  frame: number;
  width?: number;
  pose?: ChimpPose;
  mood?: Mood;
  sit?: boolean;
  walking?: boolean;
  captain?: boolean;
  look?: number; // -1..1 regard gauche/droite
  baby?: boolean;
  style?: React.CSSProperties;
}> = ({frame, width = 300, pose = 'idle', mood = 'neutral', sit = false, walking = false, captain = false, look = 0, baby = false, style}) => {
  let [la, lb, ra, rb] = POSES[pose];
  const w = Math.sin(frame * 0.5);
  if (pose === 'shake') {
    la += w * 15;
    ra -= w * 15;
  }
  if (pose === 'cheer') {
    la += w * 8;
    ra += w * 8;
  }
  if (pose === 'eat') rb += Math.max(0, Math.sin(frame * 0.3)) * 25;
  if (walking) {
    la += w * 14;
    ra -= w * 14;
  }
  const bob = walking ? Math.abs(w) * -8 : Math.sin(frame * 0.08) * 2;
  const blink = mood === 'sleepy' ? 0.15 : frame % 90 < 4 ? 0.1 : 1;
  const step = walking ? w * 14 : 0;
  const ex = look * 6;
  const browL = mood === 'angry' ? 'M118 70 L142 80' : mood === 'sad' ? 'M118 80 L142 72' : 'M116 74 Q130 66 144 74';
  const browR = mood === 'angry' ? 'M182 70 L158 80' : mood === 'sad' ? 'M182 80 L158 72' : 'M156 74 Q170 66 184 74';
  const chew = Math.abs(Math.sin(frame * 0.5)) * 6;
  const mouth = {
    happy: <path d="M122 138 Q150 166 178 138" stroke={INK} strokeWidth={6} fill="#8D3B3B" strokeLinecap="round" />,
    sad: <path d="M126 150 Q150 132 174 150" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />,
    neutral: <path d="M128 144 L172 144" stroke={INK} strokeWidth={6} strokeLinecap="round" />,
    angry: <rect x={124} y={134} width={52} height={18} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={5} />,
    surprised: <ellipse cx={150} cy={144} rx={14} ry={18} fill="#5D2525" stroke={INK} strokeWidth={5} />,
    shh: <ellipse cx={150} cy={144} rx={9} ry={7} fill="#5D2525" stroke={INK} strokeWidth={4} />,
    sleepy: <path d="M134 146 Q150 152 166 146" stroke={INK} strokeWidth={5} fill="none" />,
    chew: <ellipse cx={150} cy={144} rx={18} ry={4 + chew} fill="#5D2525" stroke={INK} strokeWidth={5} />,
  }[mood];
  return (
    <svg viewBox="0 0 300 360" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(0 ${bob + (sit ? 30 : 0)}) ${baby ? 'translate(45 70) scale(0.7)' : ''}`}>
        {/* jambes */}
        {sit ? (
          <g>
            <path d="M115 270 Q 70 300 95 320 L 135 318" stroke={INK} strokeWidth={36} fill="none" strokeLinecap="round" />
            <path d="M115 270 Q 70 300 95 320 L 135 318" stroke={FUR} strokeWidth={24} fill="none" strokeLinecap="round" />
            <path d="M185 270 Q 230 300 205 320 L 165 318" stroke={INK} strokeWidth={36} fill="none" strokeLinecap="round" />
            <path d="M185 270 Q 230 300 205 320 L 165 318" stroke={FUR} strokeWidth={24} fill="none" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            {[
              [125, -1, step],
              [175, 1, -step],
            ].map(([x, s, st]) => (
              <g key={x}>
                <path d={`M${x} 260 L${x + s * 12 + st} 325`} stroke={INK} strokeWidth={36} strokeLinecap="round" />
                <path d={`M${x} 260 L${x + s * 12 + st} 325`} stroke={FUR} strokeWidth={24} strokeLinecap="round" />
                <ellipse cx={x + s * 22 + st} cy={334} rx={26} ry={12} fill={SKIN} stroke={INK} strokeWidth={5} />
              </g>
            ))}
          </g>
        )}
        {/* corps */}
        <ellipse cx={150} cy={225} rx={72} ry={70} fill={FUR} stroke={INK} strokeWidth={7} />
        <ellipse cx={150} cy={238} rx={42} ry={42} fill={FUR2} />
        {/* bras */}
        <Arm x={98} y={180} a={la} b={lb} side={-1} />
        <Arm x={202} y={180} a={ra} b={rb} side={1} captain={captain} />
        {/* tête */}
        <circle cx={70} cy={100} r={28} fill={SKIN} stroke={INK} strokeWidth={6} />
        <circle cx={230} cy={100} r={28} fill={SKIN} stroke={INK} strokeWidth={6} />
        <circle cx={150} cy={92} r={74} fill={FUR} stroke={INK} strokeWidth={7} />
        <path d="M100 64 Q150 40 200 64 Q 222 110 196 150 Q 150 182 104 150 Q 78 110 100 64 Z" fill={SKIN} stroke={INK} strokeWidth={5} />
        <path d={browL} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d={browR} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
        <ellipse cx={130 + ex} cy={92} rx={11} ry={13 * blink} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
        <ellipse cx={170 + ex} cy={92} rx={11} ry={13 * blink} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
        {blink > 0.5 ? (
          <>
            <circle cx={132 + ex * 1.4} cy={94} r={5.5} fill={INK} />
            <circle cx={172 + ex * 1.4} cy={94} r={5.5} fill={INK} />
          </>
        ) : null}
        <ellipse cx={150} cy={134} rx={40} ry={28} fill="#D9AE88" stroke={INK} strokeWidth={4} />
        <circle cx={142} cy={118} r={3.5} fill={INK} />
        <circle cx={158} cy={118} r={3.5} fill={INK} />
        {mouth}
        {mood === 'sad' ? <path d="M118 106 q-4 12 0 16" stroke="#4FC3F7" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} /> : null}
      </g>
    </svg>
  );
};

// Colobe roux, de profil, tourné vers la droite. leap = bond (membres tendus).
export const Colobus: React.FC<{frame: number; width?: number; leap?: boolean; scared?: boolean; style?: React.CSSProperties}> = ({frame, width = 260, leap = false, scared = false, style}) => {
  const tail = Math.sin(frame * 0.12) * 14;
  const RED = '#C1440E';
  const legs = leap
    ? ['M90 80 L20 70', 'M110 85 L40 105', 'M190 70 L260 50', 'M180 80 L250 92']
    : ['M95 85 L80 140', 'M115 88 L118 140', 'M180 80 L190 140', 'M195 76 L215 135'];
  return (
    <svg viewBox="-80 -60 380 220" width={width} style={{overflow: 'visible', ...style}}>
      <path d={`M80 70 Q -20 ${60 + tail} -60 ${130 + tail} Q -70 150 -40 150`} stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d={`M80 70 Q -20 ${60 + tail} -60 ${130 + tail} Q -70 150 -40 150`} stroke="#4A4A4A" strokeWidth={8} fill="none" strokeLinecap="round" />
      {legs.map((d) => (
        <g key={d}>
          <path d={d} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d={d} stroke={RED} strokeWidth={13} fill="none" strokeLinecap="round" />
        </g>
      ))}
      <ellipse cx={140} cy={72} rx={70} ry={34} fill="#3A3A3A" stroke={INK} strokeWidth={6} />
      <ellipse cx={145} cy={88} rx={50} ry={14} fill="#E9D5C0" />
      <circle cx={222} cy={50} r={32} fill="#E9D5C0" stroke={INK} strokeWidth={6} />
      <path d="M192 40 Q 220 8 252 36 Q 228 30 196 50 Z" fill={RED} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={238} cy={62} rx={16} ry={12} fill="#9E9E9E" stroke={INK} strokeWidth={3} />
      <circle cx={232} cy={46} r={scared ? 8 : 5} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
      <circle cx={234} cy={46} r={scared ? 4 : 3} fill={INK} />
      {scared ? <ellipse cx={244} cy={68} rx={5} ry={6} fill="#5D2525" /> : null}
    </svg>
  );
};

// Forêt africaine. GROUND_Y = sol ; branches à BRANCH_Y.
export const GROUND_Y = 1500;
export const BRANCH_Y = 760;
export const Forest: React.FC<{frame: number; dusk?: number; canopy?: boolean; branches?: boolean}> = ({frame, dusk = 0, canopy = false, branches = true}) => {
  const sky1 = interpolateColors(dusk, [0, 1], ['#9BD8F2', '#FF9E80']);
  const leafDark = '#2E7D32';
  const leaf = '#43A047';
  const leafLight = '#66BB6A';
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sky1} 0%, #E8F5E9 70%)`}} />
      <Sun x={850} y={330} r={70} frame={frame} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* arbres du fond */}
        {[60, 300, 560, 820, 1040].map((x, i) => (
          <g key={x} opacity={0.55}>
            <rect x={x - 22} y={600} width={44} height={1000} fill="#6D8F5A" />
            <ellipse cx={x} cy={620 + (i % 2) * 60} rx={170} ry={110} fill="#81C784" />
          </g>
        ))}
        {/* nuages */}
        {[0, 1].map((i) => {
          const x = ((i * 640 + frame * 0.5) % 1500) - 250;
          return (
            <g key={i} transform={`translate(${x} ${470 + i * 120})`}>
              <ellipse cx={0} cy={0} rx={120} ry={40} fill="#FFFFFF" opacity={0.9} />
              <ellipse cx={-50} cy={-22} rx={60} ry={44} fill="#FFFFFF" opacity={0.9} />
              <ellipse cx={45} cy={-30} rx={70} ry={50} fill="#FFFFFF" opacity={0.9} />
            </g>
          );
        })}
        {/* grands troncs */}
        {[[140, 70], [930, 80]].map(([x, w]) => (
          <g key={x}>
            <path d={`M${x - w / 2} 1940 L${x - w / 2 + 10} 300 L${x + w / 2 - 10} 300 L${x + w / 2} 1940 Z`} fill="#6D4C41" stroke={INK} strokeWidth={8} />
            <path d={`M${x - 8} 1400 q 10 -60 0 -120 M${x + 12} 1000 q -10 -50 0 -100`} stroke="#4E342E" strokeWidth={6} fill="none" />
          </g>
        ))}
        {branches ? (
          <>
            <path d={`M140 ${BRANCH_Y + 40} Q 360 ${BRANCH_Y - 10} 560 ${BRANCH_Y + 20}`} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" />
            <path d={`M140 ${BRANCH_Y + 40} Q 360 ${BRANCH_Y - 10} 560 ${BRANCH_Y + 20}`} stroke="#795548" strokeWidth={22} fill="none" strokeLinecap="round" />
            <path d={`M930 ${BRANCH_Y - 120} Q 760 ${BRANCH_Y - 160} 620 ${BRANCH_Y - 110}`} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
            <path d={`M930 ${BRANCH_Y - 120} Q 760 ${BRANCH_Y - 160} 620 ${BRANCH_Y - 110}`} stroke="#795548" strokeWidth={18} fill="none" strokeLinecap="round" />
          </>
        ) : null}
        {/* canopée */}
        {Array.from({length: 8}, (_, i) => (
          <ellipse key={i} cx={(i * 160) % 1200 - 40} cy={canopy ? 420 + (i % 3) * 50 : 300 + (i % 3) * 40} rx={190} ry={110} fill={i % 2 ? leaf : leafDark} stroke={INK} strokeWidth={6} />
        ))}
        {Array.from({length: 6}, (_, i) => (
          <ellipse key={i} cx={(i * 210 + 80) % 1100} cy={canopy ? 470 : 360} rx={90} ry={50} fill={leafLight} />
        ))}
        {/* lianes */}
        {[380, 720].map((x, i) => (
          <path key={x} d={`M${x} 360 Q ${x + 30 * Math.sin(frame * 0.03 + i)} 700 ${x - 10} 1000`} stroke={leafDark} strokeWidth={10} fill="none" strokeLinecap="round" />
        ))}
        {/* sol */}
        <path d={`M-20 ${GROUND_Y} Q 540 ${GROUND_Y - 40} 1100 ${GROUND_Y} L1100 1940 L-20 1940 Z`} fill="#7CB342" stroke={INK} strokeWidth={8} />
        <rect x={-20} y={GROUND_Y + 60} width={1120} height={400} fill="#689F38" />
        {[[60, GROUND_Y - 10], [330, GROUND_Y - 30], [760, GROUND_Y - 30], [1010, GROUND_Y - 10]].map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={90} ry={44} fill={leafDark} stroke={INK} strokeWidth={5} />
            <ellipse cx={x + 40} cy={y - 20} rx={60} ry={36} fill={leaf} stroke={INK} strokeWidth={5} />
          </g>
        ))}
      </svg>
    </>
  );
};

// Feuillage d'avant-plan (cachette).
export const Bush: React.FC<{width?: number; shake?: number}> = ({width = 360, shake = 0}) => (
  <svg viewBox="0 0 360 200" width={width} style={{overflow: 'visible', transform: `rotate(${shake}deg)`}}>
    {[
      [70, 120, 80],
      [180, 90, 100],
      [290, 120, 80],
      [130, 150, 70],
      [240, 150, 70],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#43A047' : '#2E7D32'} stroke={INK} strokeWidth={6} />
    ))}
  </svg>
);

// Morceau de viande cartoon (cuisse).
export const Meat: React.FC<{size?: number}> = ({size = 120}) => (
  <svg viewBox="0 0 120 80" width={size} style={{overflow: 'visible'}}>
    <path d="M8 40 Q 8 6 50 10 Q 84 14 80 40 Q 76 70 44 70 Q 8 70 8 40 Z" fill="#C0583A" stroke={INK} strokeWidth={6} />
    <path d="M24 30 Q 40 20 58 28" stroke="#E08A6C" strokeWidth={6} fill="none" strokeLinecap="round" />
    <rect x={76} y={34} width={30} height={12} fill="#FFF8E1" stroke={INK} strokeWidth={5} />
    <circle cx={110} cy={34} r={9} fill="#FFF8E1" stroke={INK} strokeWidth={5} />
    <circle cx={110} cy={48} r={9} fill="#FFF8E1" stroke={INK} strokeWidth={5} />
  </svg>
);

// Part de pizza (la « récompense » du bureau).
export const Pizza: React.FC<{size?: number}> = ({size = 200}) => (
  <svg viewBox="0 0 200 200" width={size} style={{overflow: 'visible'}}>
    <path d="M100 190 L 10 30 Q 100 -10 190 30 Z" fill="#FFCA28" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M10 30 Q 100 -10 190 30 L 180 48 Q 100 12 20 48 Z" fill="#E0A04A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[[80, 70], [125, 80], [100, 125], [70, 105]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={13} fill="#D84315" stroke={INK} strokeWidth={4} />
    ))}
  </svg>
);

// Bureau avec ordinateur.
export const Desk: React.FC<{width?: number; frame: number; screen?: string}> = ({width = 360, frame, screen = '#4FC3F7'}) => (
  <svg viewBox="0 0 360 240" width={width} style={{overflow: 'visible'}}>
    <rect x={110} y={20} width={150} height={100} rx={10} fill={INK} />
    <rect x={120} y={30} width={130} height={80} rx={6} fill={screen} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={132} y={44 + i * 20} width={40 + ((frame * 3 + i * 30) % 70)} height={8} rx={4} fill="#FFFFFF" opacity={0.8} />
    ))}
    <rect x={175} y={120} width={20} height={20} fill={INK} />
    <rect x={10} y={140} width={340} height={22} rx={6} fill="#A1887F" stroke={INK} strokeWidth={6} />
    <rect x={30} y={160} width={18} height={80} fill="#8D6E63" stroke={INK} strokeWidth={5} />
    <rect x={312} y={160} width={18} height={80} fill="#8D6E63" stroke={INK} strokeWidth={5} />
  </svg>
);

// Téléphone avec bulles de discussion (messagerie générique).
export const Phone: React.FC<{size?: number; frame: number}> = ({size = 260, frame}) => (
  <svg viewBox="0 0 200 360" width={size} style={{overflow: 'visible'}}>
    <rect x={10} y={10} width={180} height={340} rx={30} fill={INK} />
    <rect x={22} y={40} width={156} height={280} rx={12} fill="#ECE5DD" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={i % 2 ? 70 : 32} y={60 + i * 60} width={96} height={40} rx={14} fill={i % 2 ? '#C5E1A5' : '#FFFFFF'} stroke="#9E9E9E" strokeWidth={3} opacity={frame > i * 6 ? 1 : 0} />
    ))}
  </svg>
);

// Double hélice d'ADN.
export const DNA: React.FC<{size?: number; frame: number}> = ({size = 220, frame}) => (
  <svg viewBox="0 0 160 400" height={size} style={{overflow: 'visible'}}>
    {Array.from({length: 14}, (_, i) => {
      const y = 20 + i * 27;
      const p = Math.sin(i * 0.6 + frame * 0.08);
      return (
        <g key={i}>
          <line x1={80 - p * 60} y1={y} x2={80 + p * 60} y2={y} stroke="#B0BEC5" strokeWidth={6} />
          <circle cx={80 - p * 60} cy={y} r={12} fill="#42A5F5" stroke={INK} strokeWidth={4} />
          <circle cx={80 + p * 60} cy={y} r={12} fill="#EF5350" stroke={INK} strokeWidth={4} />
        </g>
      );
    })}
  </svg>
);

// Sifflet d'arbitre.
export const Whistle: React.FC<{size?: number}> = ({size = 200}) => (
  <svg viewBox="0 0 200 140" width={size} style={{overflow: 'visible'}}>
    <path d="M20 50 H 110 A 50 50 0 1 1 70 110 L 70 80 H 20 Z" fill="#B0BEC5" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <circle cx={130} cy={90} r={14} fill={INK} />
  </svg>
);
