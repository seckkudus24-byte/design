import React from 'react';

const INK = '#2B1E14';
const BODY = '#E6C595';
const BACK = '#B98A55';
const SPOT = '#7A5230';
const FACE = '#EDB46A';
const CHEST = '#F4DEB4';
const WET = '#6FA3C8';

type GangaProps = {
  frame: number;
  width?: number;
  flying?: boolean;
  // 0 = sec, 1 = poitrine gorgée d'eau
  wet?: number;
  // balancement d'avant en arrière (dans l'eau)
  rocking?: boolean;
  walking?: boolean;
  style?: React.CSSProperties;
};

const lerpColor = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
};

// Ganga (père) cartoon vu de profil, tourné vers la droite.
export const Ganga: React.FC<GangaProps> = ({frame, width = 360, flying = false, wet = 0, rocking = false, walking = false, style}) => {
  const blink = frame % 80 < 4 ? 0.15 : 1;
  const flap = flying ? Math.sin(frame * 0.7) * 38 : Math.sin(frame * 0.12) * 3;
  const rock = rocking ? Math.sin(frame * 0.28) * 13 : 0;
  const hop = walking ? Math.abs(Math.sin(frame * 0.45)) * -10 : 0;
  const tilt = flying ? -8 : 0;
  const chest = lerpColor(CHEST, WET, wet);
  const step = walking ? Math.sin(frame * 0.45) * 14 : 0;
  return (
    <svg viewBox="-20 -40 340 280" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(0 ${hop}) rotate(${rock + tilt} 150 185)`}>
        {/* pattes */}
        {flying ? null : (
          <g stroke={INK} strokeWidth={6} strokeLinecap="round">
            <path d={`M130 170 l${-step / 2} 30 l-12 4 M${130 - step / 2} 200 l8 4`} fill="none" />
            <path d={`M165 170 l${step / 2} 30 l-12 4 M${165 + step / 2} 200 l8 4`} fill="none" />
          </g>
        )}
        {/* queue pointue */}
        <path d="M60 105 L-12 92 L4 112 L-18 118 L58 136 Z" fill={BACK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {/* corps */}
        <ellipse cx={140} cy={122} rx={98} ry={62} fill={BODY} stroke={INK} strokeWidth={6} />
        {/* poitrine (plumes-éponges) */}
        <ellipse cx={200} cy={132} rx={46} ry={48} fill={chest} />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${186 + i * 12} ${118 + (i % 2) * 22} m-7 0 a7 7 0 1 1 7 7 a4 4 0 1 1 -4 -4`}
            stroke={lerpColor('#C9A877', '#2F6E99', wet)}
            strokeWidth={3}
            fill="none"
          />
        ))}
        {/* bandeau noir et blanc du mâle */}
        <path d="M168 86 Q 205 100 238 90" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M170 97 Q 205 110 236 101" stroke="#FFF8E7" strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* aile */}
        <g transform={`rotate(${-flap} 150 95)`}>
          <path d="M150 90 Q 95 70 55 108 Q 100 150 165 128 Z" fill={BACK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          {[
            [92, 104],
            [110, 116],
            [128, 106],
            [76, 116],
            [118, 128],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx={6} ry={4} fill={SPOT} />
          ))}
        </g>
        {/* tête */}
        <circle cx={226} cy={62} r={38} fill={FACE} stroke={INK} strokeWidth={6} />
        <path d="M258 60 L284 70 L258 78 Z" fill="#8C8C8C" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <ellipse cx={238} cy={54} rx={12} ry={12 * blink} fill="#fff" stroke={INK} strokeWidth={4} />
        {blink > 0.5 ? <circle cx={241} cy={55} r={5.5} fill={INK} /> : null}
        <circle cx={222} cy={76} r={8} fill="#F48F7A" opacity={0.55} />
        {/* gouttes qui perlent de la poitrine */}
        {wet > 0.3
          ? [0, 1, 2].map((i) => {
              const tt = ((frame + i * 13) % 40) / 40;
              return <ellipse key={i} cx={190 + i * 14} cy={175 + tt * 50} rx={5} ry={7} fill="#4FC3F7" opacity={(1 - tt) * wet} />;
            })
          : null}
      </g>
    </svg>
  );
};

// Poussin de ganga.
export const Chick: React.FC<{
  frame: number;
  size?: number;
  thirsty?: boolean;
  drinking?: boolean;
  style?: React.CSSProperties;
}> = ({frame, size = 140, thirsty = false, drinking = false, style}) => {
  const bob = drinking ? Math.sin(frame * 0.6) * 6 : Math.sin(frame * 0.15) * 2;
  const pant = thirsty ? (Math.sin(frame * 0.8) + 1) / 2 : 0;
  return (
    <svg viewBox="0 0 130 120" width={size} style={{overflow: 'visible', ...style}}>
      <g stroke={INK} strokeWidth={5} strokeLinecap="round">
        <path d="M52 100 l-4 16 M76 100 l4 16" />
      </g>
      <g transform={`translate(0 ${bob}) rotate(${drinking ? -18 : 0} 64 70)`}>
        <circle cx={62} cy={68} r={42} fill="#F2D49B" stroke={INK} strokeWidth={5} />
        {[
          [44, 56],
          [62, 44],
          [80, 58],
          [50, 84],
          [74, 86],
          [36, 72],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4} fill="#A87B4C" />
        ))}
        <path d="M50 28 q4 -14 10 -2 q4 -12 10 0" stroke={INK} strokeWidth={4} fill="none" />
        <circle cx={84} cy={58} r={thirsty ? 6 : 8} fill="#fff" stroke={INK} strokeWidth={3} />
        <circle cx={86} cy={thirsty ? 60 : 58} r={3.5} fill={INK} />
        {thirsty ? <path d="M76 48 l14 4" stroke={INK} strokeWidth={3} strokeLinecap="round" /> : null}
        {/* bec */}
        <path d={`M100 64 L118 ${68 - pant * 2} L100 72 Z`} fill="#F9A825" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        {drinking || thirsty ? (
          <path d={`M100 74 L116 ${78 + pant * 6} L100 80 Z`} fill="#F9A825" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        ) : null}
        {thirsty ? <path d={`M104 78 q6 ${8 + pant * 6} 10 0`} fill="#EF5350" stroke={INK} strokeWidth={2} /> : null}
        {thirsty ? <path d="M30 34 q6 12 0 18 q-6 -6 0 -18" fill="#4FC3F7" stroke={INK} strokeWidth={2} /> : null}
      </g>
    </svg>
  );
};

// Chacal assis, tourné vers la droite.
export const Jackal: React.FC<{frame: number; width?: number; style?: React.CSSProperties}> = ({frame, width = 260, style}) => {
  const tail = Math.sin(frame * 0.2) * 10;
  const lick = frame % 90 < 20;
  return (
    <svg viewBox="0 0 260 230" width={width} style={{overflow: 'visible', ...style}}>
      <path d={`M60 180 Q 10 ${170 + tail} 20 ${120 + tail}`} stroke={INK} strokeWidth={22} strokeLinecap="round" fill="none" />
      <path d={`M60 180 Q 10 ${170 + tail} 20 ${120 + tail}`} stroke="#C8925A" strokeWidth={12} strokeLinecap="round" fill="none" />
      <path d="M60 200 Q 50 120 110 100 Q 160 95 160 150 L 160 205 Z" fill="#D4A26A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={130} y={150} width={22} height={60} rx={8} fill="#D4A26A" stroke={INK} strokeWidth={5} />
      <path d="M150 30 L162 0 L175 40 Z M180 38 L200 6 L204 48 Z" fill="#C8925A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={175} cy={72} rx={42} ry={36} fill="#D4A26A" stroke={INK} strokeWidth={6} />
      <path d="M205 66 L250 78 Q 254 92 240 94 L205 92 Z" fill="#E8C08A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={248} cy={80} r={6} fill={INK} />
      <ellipse cx={188} cy={62} rx={8} ry={6} fill="#FFEB3B" stroke={INK} strokeWidth={3} />
      <ellipse cx={190} cy={62} rx={2} ry={5} fill={INK} />
      {lick ? <path d="M230 94 q6 14 14 2" fill="#EF5350" stroke={INK} strokeWidth={3} /> : null}
    </svg>
  );
};

// Faucon en vol plané, tourné vers la droite.
export const Hawk: React.FC<{frame: number; width?: number; style?: React.CSSProperties}> = ({frame, width = 220, style}) => {
  const w = Math.sin(frame * 0.15) * 8;
  return (
    <svg viewBox="0 0 220 120" width={width} style={{overflow: 'visible', ...style}}>
      <path d={`M110 60 Q 60 ${20 + w} 0 ${40 + w} Q 60 ${55 + w} 100 70 Z`} fill="#5D4037" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M120 60 Q 170 ${20 + w} 220 ${40 + w} Q 160 ${55 + w} 128 72 Z`} fill="#6D4C41" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M70 62 L45 50 L48 76 Z" fill="#5D4037" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={112} cy={66} rx={44} ry={16} fill="#795548" stroke={INK} strokeWidth={5} />
      <circle cx={156} cy={58} r={15} fill="#8D6E63" stroke={INK} strokeWidth={4} />
      <path d="M168 54 L184 60 L170 68 Z" fill="#FFC107" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={160} cy={55} r={4} fill="#FFEB3B" stroke={INK} strokeWidth={2} />
      <path d="M152 48 l14 4" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
};

// Thermomètre. level : 0..1 ; label affiché à côté.
export const Thermometer: React.FC<{level: number; label: string; height?: number; frame: number}> = ({level, label, height = 420, frame}) => {
  const shake = level > 0.9 ? Math.sin(frame * 1.3) * 2 : 0;
  const col = 230 * level;
  return (
    <svg viewBox="0 0 220 330" height={height} style={{overflow: 'visible'}}>
      <g transform={`translate(${shake} 0)`}>
        <rect x={40} y={10} width={44} height={250} rx={22} fill="#fff" stroke={INK} strokeWidth={8} />
        <rect x={52} y={250 - col} width={20} height={col + 20} rx={10} fill="#E53935" />
        <circle cx={62} cy={280} r={40} fill="#E53935" stroke={INK} strokeWidth={8} />
        <circle cx={50} cy={268} r={10} fill="#fff" opacity={0.5} />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={86} x2={100} y1={50 + i * 45} y2={50 + i * 45} stroke={INK} strokeWidth={5} />
        ))}
        <text x={112} y={Math.max(60, 262 - col)} fontFamily="LuckiestGuy" fontSize={58} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke">
          {label}
        </text>
      </g>
    </svg>
  );
};

// Nid : simple creux dans le sable, bordé de cailloux.
export const Nest: React.FC<{width?: number}> = ({width = 420}) => (
  <svg viewBox="0 0 420 120" width={width} style={{overflow: 'visible'}}>
    <ellipse cx={210} cy={70} rx={200} ry={45} fill="#C9A26B" stroke={INK} strokeWidth={6} />
    <ellipse cx={210} cy={64} rx={160} ry={30} fill="#B08850" />
    {Array.from({length: 14}, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return <ellipse key={i} cx={210 + Math.cos(a) * 185} cy={70 + Math.sin(a) * 40} rx={16} ry={10} fill="#9E9E9E" stroke={INK} strokeWidth={4} />;
    })}
  </svg>
);

export const Egg: React.FC<{crack?: number; size?: number}> = ({crack = 0, size = 90}) => (
  <svg viewBox="0 0 80 100" width={size} style={{overflow: 'visible'}}>
    <ellipse cx={40} cy={55} rx={32} ry={40} fill="#E8DCC0" stroke={INK} strokeWidth={5} />
    {[
      [28, 40],
      [50, 52],
      [36, 70],
      [54, 32],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={5} fill="#8D6E63" />
    ))}
    {crack > 0 ? (
      <path d="M10 50 l12 -8 l8 10 l10 -12 l10 12 l10 -10 l10 8" stroke={INK} strokeWidth={4} fill="none" strokeDasharray={100} strokeDashoffset={100 * (1 - crack)} />
    ) : null}
  </svg>
);

// Gros plan sur les plumes en spirale. fill : 0..1 (eau absorbée).
export const SpiralLens: React.FC<{fill: number; frame: number; size?: number}> = ({fill, frame, size = 620}) => {
  const spiral = (cx: number, cy: number, r: number, turns = 3) => {
    let d = '';
    const n = 60;
    for (let i = 0; i <= n; i++) {
      const tt = i / n;
      const a = tt * turns * Math.PI * 2;
      const rr = r * tt;
      d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)} `;
    }
    return d;
  };
  const spots: [number, number, number][] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      spots.push([90 + col * 110 + (row % 2) * 55, 90 + row * 105, 52]);
    }
  }
  return (
    <svg viewBox="0 0 620 620" width={size} style={{overflow: 'visible'}}>
      <defs>
        <clipPath id="lens">
          <circle cx={310} cy={310} r={290} />
        </clipPath>
      </defs>
      <circle cx={310} cy={310} r={300} fill="#F4DEB4" stroke={INK} strokeWidth={14} />
      <g clipPath="url(#lens)">
        <rect x={0} y={620 - 620 * fill} width={620} height={620} fill="#81D4FA" opacity={0.45} />
        {spots.map(([x, y, r], i) => {
          const d = spiral(x, y, r);
          // les rangées du bas se remplissent en premier
          const local = Math.min(1, Math.max(0, fill * 1.6 - ((4 - Math.floor(i / 5)) / 4) * 0.6));
          return (
            <g key={i} transform={`rotate(${Math.sin(frame * 0.05 + i) * 6} ${x} ${y})`}>
              <path d={d} stroke="#B98A55" strokeWidth={10} fill="none" strokeLinecap="round" />
              <path d={d} stroke="#1E88E5" strokeWidth={10} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${local} 1`} />
            </g>
          );
        })}
        {fill > 0 && fill < 1
          ? Array.from({length: 8}, (_, i) => {
              const tt = ((frame * 1.5 + i * 23) % 80) / 80;
              return <ellipse key={i} cx={60 + i * 70} cy={620 - tt * 500} rx={9} ry={13} fill="#4FC3F7" stroke={INK} strokeWidth={3} opacity={1 - tt} />;
            })
          : null}
      </g>
      <circle cx={310} cy={310} r={300} fill="none" stroke={INK} strokeWidth={14} />
      <path d="M120 140 A 230 230 0 0 1 250 70" stroke="#fff" strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.6} />
    </svg>
  );
};

// Éprouvette graduée. fill : 0..1.
export const Tube: React.FC<{fill: number; label: string; height?: number}> = ({fill, label, height = 380}) => (
  <svg viewBox="0 0 200 330" height={height} style={{overflow: 'visible'}}>
    <path d="M40 10 L40 280 Q 40 320 80 320 Q 120 320 120 280 L120 10" fill="#fff" stroke={INK} strokeWidth={8} />
    <path d={`M48 ${310 - 290 * fill} L112 ${310 - 290 * fill} L112 280 Q 112 312 80 312 Q 48 312 48 280 Z`} fill="#29B6F6" />
    {[0, 1, 2, 3, 4].map((i) => (
      <line key={i} x1={40} x2={60} y1={60 + i * 50} y2={60 + i * 50} stroke={INK} strokeWidth={5} />
    ))}
    <text x={130} y={Math.max(70, 310 - 290 * fill + 20)} fontFamily="LuckiestGuy" fontSize={56} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke">
      {label}
    </text>
  </svg>
);

// Horloge dont l'aiguille tourne. turns = nombre de tours effectués.
export const Clock: React.FC<{turns: number; label: string; size?: number}> = ({turns, label, size = 260}) => (
  <svg viewBox="0 0 260 300" width={size} style={{overflow: 'visible'}}>
    <circle cx={130} cy={130} r={110} fill="#fff" stroke={INK} strokeWidth={10} />
    {Array.from({length: 12}, (_, i) => (
      <line key={i} x1={130} y1={32} x2={130} y2={48} stroke={INK} strokeWidth={6} transform={`rotate(${i * 30} 130 130)`} />
    ))}
    <path d={`M130 130 L130 40 A 90 90 0 ${(turns % 1) > 0.5 ? 1 : 0} 1 ${130 + Math.sin((turns % 1) * Math.PI * 2) * 90} ${130 - Math.cos((turns % 1) * Math.PI * 2) * 90} Z`} fill="#FFE082" opacity={turns > 0 ? 1 : 0} />
    <line x1={130} y1={130} x2={130} y2={52} stroke="#E53935" strokeWidth={8} strokeLinecap="round" transform={`rotate(${turns * 360} 130 130)`} />
    <circle cx={130} cy={130} r={10} fill={INK} />
    <text x={130} y={292} textAnchor="middle" fontFamily="LuckiestGuy" fontSize={52} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke">
      {label}
    </text>
  </svg>
);
