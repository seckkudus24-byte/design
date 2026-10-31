import React from 'react';
import {interpolateColors, random} from 'remotion';
import {Moon, Sun} from '../ui';

const INK = '#1F2A1A';

// Géométrie de l'étang en coupe : surface, plage (peu profonde, à gauche), fond (à droite).
export const SURFACE = 620;
export const SHALLOW = {x: 260, y: 780}; // zone chaude près du bord
export const DEEP = {x: 760, y: 1250}; // eaux profondes
export const BOTTOM_Y = (x: number) => (x < 120 ? 700 : x < 520 ? 700 + (x - 120) * 1.4 : 1260 + Math.sin(x * 0.02) * 20);

// Étang vu en coupe. night : 0..1 ; warm : zone chaude éclairée par le soleil.
export const Pond: React.FC<{frame: number; night?: number; warm?: number; mud?: boolean}> = ({frame, night = 0, warm = 0, mud = true}) => {
  const sky1 = interpolateColors(night, [0, 1], ['#8FD3F7', '#1A237E']);
  const sky2 = interpolateColors(night, [0, 1], ['#E1F5FE', '#3949AB']);
  const water1 = interpolateColors(night, [0, 1], ['#4DB6AC', '#123B4A']);
  const water2 = interpolateColors(night, [0, 1], ['#00695C', '#06202A']);
  let bottom = 'M-20 1920 L-20 700';
  for (let x = 0; x <= 1100; x += 40) bottom += ` L${x} ${BOTTOM_Y(x)}`;
  bottom += ' L1100 1920 Z';
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sky1} 0%, ${sky2} 30%)`}} />
      {night < 0.5 ? <Sun x={850} y={300} r={70} frame={frame} /> : <Moon x={850} y={300} r={60} bg={sky1} />}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* berge et forêt au loin */}
        <path d={`M-20 ${SURFACE} L-20 520 Q 200 470 420 520 L 520 ${SURFACE} Z`} fill={interpolateColors(night, [0, 1], ['#8BC34A', '#1B3A17'])} />
        {[60, 170, 290].map((x, i) => (
          <g key={x} transform={`translate(${x} ${500 - (i % 2) * 20})`}>
            <rect x={-8} y={-30} width={16} height={40} fill="#5D4037" />
            <path d="M0 -120 L50 -30 L-50 -30 Z" fill={interpolateColors(night, [0, 1], ['#2E7D32', '#0D2610'])} />
          </g>
        ))}
        {/* l'eau */}
        <defs>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={water1} />
            <stop offset="100%" stopColor={water2} />
          </linearGradient>
        </defs>
        <rect x={-20} y={SURFACE} width={1120} height={1920 - SURFACE} fill="url(#water)" />
        {/* zone chaude près du bord */}
        <ellipse cx={240} cy={720} rx={320} ry={170} fill="#FFE082" opacity={0.35 * warm} />
        {/* rayons de soleil dans l'eau */}
        {night < 0.5
          ? [0, 1, 2, 3].map((i) => (
              <path key={i} d={`M${120 + i * 220} ${SURFACE} l${-60} 600 l60 0 Z`} fill="#FFFFFF" opacity={0.06 + 0.03 * Math.sin(frame * 0.05 + i)} />
            ))
          : null}
        {/* fond : sable sur la plage, vase au fond */}
        <path d={bottom} fill={interpolateColors(night, [0, 1], [mud ? '#6D5A3A' : '#8D6E63', '#2B2116'])} />
        <path d="M-20 700 L120 700 L520 1260" stroke={interpolateColors(night, [0, 1], ['#E6C068', '#5D4A2A'])} strokeWidth={26} fill="none" />
        {/* surface qui ondule */}
        <path
          d={`M-20 ${SURFACE} ${Array.from({length: 14}, (_, i) => `Q ${i * 90 + 25} ${SURFACE - 8 + Math.sin(frame * 0.1 + i) * 4} ${i * 90 + 45} ${SURFACE} T ${i * 90 + 90} ${SURFACE}`).join(' ')}`}
          stroke="#FFFFFF"
          strokeWidth={6}
          fill="none"
          opacity={0.6}
        />
        {/* bulles */}
        {Array.from({length: 10}, (_, i) => {
          const t = ((frame * 1.2 + i * 37) % 300) / 300;
          return <circle key={i} cx={100 + i * 95 + Math.sin(frame * 0.05 + i) * 10} cy={1300 - t * 680} r={5 + (i % 3) * 3} fill="none" stroke="#fff" strokeWidth={3} opacity={0.5 * (1 - t)} />;
        })}
      </svg>
    </>
  );
};

// Têtard. legs : 0..1 (pattes qui poussent) ; tail : 1 = queue entière, 0 = plus de queue (petite grenouille).
export const Tadpole: React.FC<{frame: number; size?: number; legs?: number; tail?: number; flip?: boolean}> = ({frame, size = 60, legs = 0, tail = 1, flip = false}) => {
  const wig = Math.sin(frame * 0.6) * 18;
  const green = interpolateColors(1 - tail, [0, 1], ['#3E2F24', '#558B2F']);
  return (
    <svg viewBox="-70 -40 120 80" width={size} style={{overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined}}>
      {tail > 0.02 ? (
        <path d={`M-14 0 Q ${-40 * tail} ${wig * tail} ${-66 * tail} ${-wig * 0.6 * tail}`} stroke={green} strokeWidth={10 * tail + 2} fill="none" strokeLinecap="round" />
      ) : null}
      {legs > 0 ? (
        <>
          <path d={`M-6 14 l${-14 * legs} ${18 * legs} l-8 0`} stroke={green} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d={`M10 14 l${10 * legs} ${16 * legs} l8 0`} stroke={green} strokeWidth={5} fill="none" strokeLinecap="round" />
        </>
      ) : null}
      <ellipse cx={4} cy={0} rx={24} ry={19} fill={green} stroke={INK} strokeWidth={3} />
      <circle cx={16} cy={-6} r={6} fill="#fff" />
      <circle cx={18} cy={-6} r={3} fill={INK} />
      <path d="M18 8 q5 3 9 -1" stroke="#fff" strokeWidth={2} fill="none" opacity={0.7} />
    </svg>
  );
};

// Banc de têtards autour d'un point (cx, cy). count = nombre visible.
export const Swarm: React.FC<{frame: number; cx: number; cy: number; count: number; spread?: number; size?: number; flip?: boolean; legs?: number; tail?: number}> = ({
  frame,
  cx,
  cy,
  count,
  spread = 220,
  size = 46,
  flip = false,
  legs = 0,
  tail = 1,
}) => (
  <>
    {Array.from({length: Math.round(count)}, (_, i) => {
      const a = random(`a${i}`) * Math.PI * 2;
      const r = Math.sqrt(random(`r${i}`)) * spread;
      const x = cx + Math.cos(a) * r + Math.sin(frame * 0.07 + i) * 14;
      const y = cy + Math.sin(a) * r * 0.55 + Math.cos(frame * 0.09 + i) * 8;
      return (
        <div key={i} style={{position: 'absolute', left: x - size / 2, top: y - size / 2}}>
          <Tadpole frame={frame + i * 3} size={size * (0.8 + random(`s${i}`) * 0.4)} flip={flip} legs={legs} tail={tail} />
        </div>
      );
    })}
  </>
);

// Larve de libellule (prédateur) tournée vers la gauche. jaw : 0 = masque replié, 1 = déplié vers l'avant.
export const Larva: React.FC<{frame: number; width?: number; jaw?: number}> = ({frame, width = 360, jaw = 0}) => {
  const reach = jaw * 150;
  return (
    <svg viewBox="-220 -80 460 160" width={width} style={{overflow: 'visible'}}>
      {[-30, 10, 50].map((x, i) => (
        <path key={x} d={`M${x} 10 l${-20 + i * 6} 50 M${x} 10 l${10 + i * 6} 52`} stroke="#4E5B31" strokeWidth={7} strokeLinecap="round" />
      ))}
      <path d="M10 -24 Q 140 -30 210 0 Q 140 30 10 26 Z" fill="#7C8A45" stroke={INK} strokeWidth={5} />
      {[50, 90, 130, 170].map((x) => (
        <path key={x} d={`M${x} -24 q4 24 0 48`} stroke={INK} strokeWidth={3} fill="none" opacity={0.5} />
      ))}
      <ellipse cx={0} cy={0} rx={42} ry={30} fill="#8D9A52" stroke={INK} strokeWidth={5} />
      <circle cx={-22} cy={-16} r={13} fill="#FFEB3B" stroke={INK} strokeWidth={4} />
      <circle cx={-26} cy={-16} r={6} fill={INK} />
      {/* masque : bras articulé qui se déplie */}
      <path d={`M-30 18 L${-60 - reach * 0.4} ${30 - reach * 0.1} L${-70 - reach} ${10 - reach * 0.05}`} stroke="#6B7A3A" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${-70 - reach} ${10 - reach * 0.05} l-22 -14 M${-70 - reach} ${10 - reach * 0.05} l-22 14`} stroke={INK} strokeWidth={8} strokeLinecap="round" />
    </svg>
  );
};

export const Leech: React.FC<{frame: number; width?: number}> = ({frame, width = 200}) => {
  let d = 'M0 0';
  for (let i = 1; i <= 10; i++) d += ` L${i * 18} ${Math.sin(frame * 0.2 + i * 0.8) * 10}`;
  return (
    <svg viewBox="-20 -30 220 60" width={width} style={{overflow: 'visible'}}>
      <path d={d} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#BCAAA4" strokeWidth={14} fill="none" strokeLinecap="round" />
      <circle cx={180} cy={Math.sin(frame * 0.2 + 8) * 10} r={4} fill="#FFEB3B" />
    </svg>
  );
};

// Grenouille adulte de face, assise.
export const Frog: React.FC<{frame: number; size?: number; jump?: number}> = ({frame, size = 200, jump = 0}) => (
  <svg viewBox="-100 -90 200 180" width={size} style={{overflow: 'visible', transform: `translateY(${-jump * 60}px)`}}>
    <ellipse cx={-60} cy={60} rx={34} ry={16} fill="#558B2F" stroke={INK} strokeWidth={5} />
    <ellipse cx={60} cy={60} rx={34} ry={16} fill="#558B2F" stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={20} rx={78} ry={56} fill="#7CB342" stroke={INK} strokeWidth={6} />
    <ellipse cx={0} cy={36} rx={48} ry={30} fill="#C5E1A5" />
    {[-38, 38].map((x) => (
      <g key={x}>
        <circle cx={x} cy={-30} r={24} fill="#7CB342" stroke={INK} strokeWidth={5} />
        <circle cx={x} cy={-30} r={13} fill="#fff" />
        <circle cx={x + 2} cy={-28} r={7} fill={INK} />
      </g>
    ))}
    <path d="M-30 10 Q 0 30 30 10" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
    <circle cx={-48} cy={8} r={8} fill="#F48FB1" opacity={0.5 + 0.2 * Math.sin(frame * 0.1)} />
    <circle cx={48} cy={8} r={8} fill="#F48FB1" opacity={0.5} />
  </svg>
);

// Algue qui ondule. grow : 0..1.
export const Weed: React.FC<{frame: number; x: number; baseY: number; height: number; grow?: number; phase?: number}> = ({frame, x, baseY, height, grow = 1, phase = 0}) => {
  const h = height * grow;
  let d = `M${x} ${baseY}`;
  for (let i = 1; i <= 5; i++) {
    const y = baseY - (h * i) / 5;
    const sway = Math.sin(frame * 0.08 + phase + i * 0.9) * (5 + i * 4);
    d += ` Q ${x + (i % 2 ? 24 : -24) + sway} ${y + h / 10} ${x + sway * 0.6} ${y}`;
  }
  return <path d={d} stroke="#558B2F" strokeWidth={18} fill="none" strokeLinecap="round" />;
};

export const Eggs: React.FC<{size?: number}> = ({size = 200}) => (
  <svg viewBox="-100 -60 200 120" width={size} style={{overflow: 'visible'}}>
    {Array.from({length: 18}, (_, i) => {
      const x = ((i * 37) % 170) - 85;
      const y = ((i * 53) % 90) - 45;
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={14} fill="rgba(255,255,255,0.55)" stroke="#B0BEC5" strokeWidth={2} />
          <circle cx={x} cy={y} r={5} fill="#212121" />
        </g>
      );
    })}
  </svg>
);

export const House: React.FC<{size?: number; color?: string; label: string}> = ({size = 160, color = '#E57373', label}) => (
  <svg viewBox="0 0 200 230" width={size} style={{overflow: 'visible'}}>
    <path d="M20 95 L100 25 L180 95 Z" fill={color} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <rect x={40} y={92} width={120} height={95} fill="#FFF3E0" stroke={INK} strokeWidth={8} />
    <rect x={85} y={130} width={32} height={57} fill="#8D6E63" stroke={INK} strokeWidth={6} />
    <text x={100} y={225} textAnchor="middle" fontFamily="LuckiestGuy" fontSize={34} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">
      {label}
    </text>
  </svg>
);
