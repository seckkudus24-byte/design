import React from 'react';

const INK = '#22201F';
const FUR = '#BDB6AA';
const FUR_DARK = '#9C9488';
const BELLY = '#F5F1E8';

// Polatouche assis, vu de profil (tourné vers la droite).
export const Squirrel: React.FC<{
  frame: number;
  width?: number;
  // grosse fourrure d'hiver
  fluffy?: boolean;
  // yeux qui brillent dans la nuit
  glow?: boolean;
  happy?: boolean;
  nibbling?: boolean;
  style?: React.CSSProperties;
}> = ({frame, width = 300, fluffy = false, glow = false, happy = true, nibbling = false, style}) => {
  const blink = frame % 90 < 4 ? 0.12 : 1;
  const tail = Math.sin(frame * 0.1) * 5;
  const nib = nibbling ? Math.sin(frame * 0.9) * 4 : 0;
  const puff = fluffy ? 1.12 : 1;
  return (
    <svg viewBox="-30 -20 300 300" width={width} style={{overflow: 'visible', ...style}}>
      {/* queue plate et large */}
      <g transform={`rotate(${tail} 70 190)`}>
        <path d="M80 200 C 20 210 -20 150 0 80 C 15 40 50 60 45 110 C 42 150 60 175 90 180 Z" fill={FUR_DARK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M20 90 q 10 40 30 70" stroke="#fff" strokeWidth={5} fill="none" opacity={0.35} strokeLinecap="round" />
      </g>
      {/* corps */}
      <g transform={`translate(125 175) scale(${puff}) translate(-125 -175)`}>
        <ellipse cx={125} cy={175} rx={72} ry={70} fill={FUR} stroke={INK} strokeWidth={6} />
        <ellipse cx={145} cy={190} rx={42} ry={48} fill={BELLY} />
        {fluffy
          ? Array.from({length: 12}, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <path key={i} d={`M${125 + Math.cos(a) * 68} ${175 + Math.sin(a) * 66} l${Math.cos(a) * 14} ${Math.sin(a) * 14}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />;
            })
          : null}
      </g>
      {/* pattes */}
      <ellipse cx={110} cy={240} rx={26} ry={12} fill={FUR_DARK} stroke={INK} strokeWidth={5} />
      <ellipse cx={170} cy={185 + nib} rx={14} ry={10} fill={FUR} stroke={INK} strokeWidth={5} />
      {/* tête */}
      <g transform={`translate(0 ${nib * 0.5})`}>
        <ellipse cx={170} cy={92} rx={68} ry={60} fill={FUR} stroke={INK} strokeWidth={6} />
        <ellipse cx={135} cy={40} rx={16} ry={20} fill={FUR} stroke={INK} strokeWidth={5} />
        <ellipse cx={135} cy={42} rx={7} ry={10} fill="#E8B4A8" />
        <ellipse cx={200} cy={115} rx={34} ry={24} fill={BELLY} />
        {/* très grands yeux noirs */}
        <ellipse cx={192} cy={84} rx={26} ry={28 * blink} fill={glow ? '#FFE082' : INK} />
        {blink > 0.5 ? (
          <>
            {glow ? <ellipse cx={192} cy={84} rx={12} ry={22} fill={INK} /> : null}
            <circle cx={202} cy={72} r={9} fill="#fff" />
            <circle cx={186} cy={96} r={4} fill="#fff" />
          </>
        ) : null}
        <circle cx={236} cy={102} r={7} fill="#7A5C55" />
        <path d={happy ? 'M222 120 q8 8 16 0' : 'M222 124 q8 -6 16 0'} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M232 106 l26 -6 M232 110 l26 4" stroke={INK} strokeWidth={2.5} opacity={0.6} />
        <circle cx={168} cy={120} r={11} fill="#F4A3A3" opacity={0.6} />
      </g>
    </svg>
  );
};

// Polatouche en vol plané, vu de dessus : la membrane tendue entre les pattes, comme un parachute.
export const Glider: React.FC<{frame: number; width?: number; spread?: number; style?: React.CSSProperties}> = ({frame, width = 360, spread = 1, style}) => {
  const s = 0.35 + spread * 0.65;
  const flutter = Math.sin(frame * 0.5) * 4 * spread;
  const blink = frame % 80 < 4 ? 0.12 : 1;
  // coins de la membrane (pattes)
  const fl = [100 - 80 * s, 110 - 30 * s];
  const fr = [200 + 80 * s, 110 - 30 * s];
  const bl = [100 - 70 * s, 220 + 20 * s];
  const br = [200 + 70 * s, 220 + 20 * s];
  return (
    <svg viewBox="-40 -40 380 400" width={width} style={{overflow: 'visible', ...style}}>
      {/* queue plate */}
      <path d="M135 230 Q 130 330 150 350 Q 170 330 165 230 Z" fill={FUR_DARK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {/* membrane */}
      <path
        d={`M${fl[0]} ${fl[1]} Q 150 ${70 + flutter} ${fr[0]} ${fr[1]} Q ${230 + 40 * s} 165 ${br[0]} ${br[1]} Q 150 ${250 - flutter} ${bl[0]} ${bl[1]} Q ${70 - 40 * s} 165 ${fl[0]} ${fl[1]} Z`}
        fill="#CFC8BC"
        stroke={INK}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <path d={`M${fl[0] + 20} ${fl[1] + 20} Q 150 ${150} ${br[0] - 20} ${br[1] - 20} M${fr[0] - 20} ${fr[1] + 20} Q 150 150 ${bl[0] + 20} ${bl[1] - 20}`} stroke="#fff" strokeWidth={4} opacity={0.25} fill="none" />
      {/* corps */}
      <ellipse cx={150} cy={165} rx={42} ry={70} fill={FUR} stroke={INK} strokeWidth={6} />
      {/* pattes aux coins */}
      {[fl, fr, bl, br].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={13} fill={FUR_DARK} stroke={INK} strokeWidth={5} />
      ))}
      {/* tête */}
      <ellipse cx={150} cy={78} rx={46} ry={42} fill={FUR} stroke={INK} strokeWidth={6} />
      <ellipse cx={112} cy={46} rx={12} ry={15} fill={FUR} stroke={INK} strokeWidth={5} />
      <ellipse cx={188} cy={46} rx={12} ry={15} fill={FUR} stroke={INK} strokeWidth={5} />
      {[128, 172].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={76} rx={16} ry={18 * blink} fill={INK} />
          {blink > 0.5 ? <circle cx={x + 5} cy={69} r={6} fill="#fff" /> : null}
        </g>
      ))}
      <circle cx={150} cy={98} r={6} fill="#7A5C55" />
      <path d="M140 108 q10 8 20 0" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
    </svg>
  );
};

// Pic (oiseau) tourné vers la gauche, qui tape sur le tronc.
export const Woodpecker: React.FC<{frame: number; width?: number; pecking?: boolean; style?: React.CSSProperties}> = ({frame, width = 200, pecking = true, style}) => {
  const peck = pecking ? Math.max(0, Math.sin(frame * 1.2)) * 12 : 0;
  return (
    <svg viewBox="0 0 200 240" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={`rotate(${-peck} 120 120)`}>
        <path d="M120 200 L135 235 L150 200 Z" fill={INK} />
        <ellipse cx={125} cy={140} rx={38} ry={65} fill={INK} />
        <ellipse cx={110} cy={150} rx={20} ry={45} fill="#fff" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M140 ${110 + i * 25} l14 0`} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
        ))}
        <circle cx={105} cy={70} r={32} fill="#fff" stroke={INK} strokeWidth={5} />
        <path d="M80 52 Q 105 25 132 50 Z" fill="#E53935" stroke={INK} strokeWidth={4} />
        <path d="M76 70 L30 76 L76 82 Z" fill="#9E9E9E" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={96} cy={66} r={6} fill={INK} />
      </g>
    </svg>
  );
};

// Chouette (prédateur de nuit), de face.
export const Owl: React.FC<{frame: number; width?: number; style?: React.CSSProperties}> = ({frame, width = 220, style}) => {
  const look = Math.sin(frame * 0.05) * 6;
  return (
    <svg viewBox="0 0 220 260" width={width} style={{overflow: 'visible', ...style}}>
      <ellipse cx={110} cy={160} rx={80} ry={95} fill="#8D6E63" stroke={INK} strokeWidth={6} />
      <ellipse cx={110} cy={185} rx={50} ry={60} fill="#D7CCC8" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${85 + (i % 2) * 30} ${160 + Math.floor(i / 2) * 30} q8 8 16 0`} stroke="#8D6E63" strokeWidth={4} fill="none" />
      ))}
      <path d="M40 60 L60 10 L85 55 Z M180 60 L160 10 L135 55 Z" fill="#8D6E63" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {[75, 145].map((x) => (
        <g key={x}>
          <circle cx={x} cy={95} r={30} fill="#FFEB3B" stroke={INK} strokeWidth={5} />
          <circle cx={x + look} cy={95} r={13} fill={INK} />
        </g>
      ))}
      <path d="M100 118 L110 140 L120 118 Z" fill="#FFA000" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    </svg>
  );
};

// Rat (pour « on le prend pour un rat volant »), tourné vers la droite.
export const Rat: React.FC<{width?: number}> = ({width = 240}) => (
  <svg viewBox="0 0 260 140" width={width} style={{overflow: 'visible'}}>
    <path d="M40 100 Q 0 120 10 70" stroke="#E8A0A0" strokeWidth={8} fill="none" strokeLinecap="round" />
    <ellipse cx={110} cy={95} rx={75} ry={40} fill="#8E8E8E" stroke={INK} strokeWidth={6} />
    <path d="M170 70 L240 92 L170 112 Z" fill="#8E8E8E" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={240} cy={92} r={7} fill="#E8A0A0" />
    <circle cx={175} cy={58} r={18} fill="#BDBDBD" stroke={INK} strokeWidth={5} />
    <circle cx={200} cy={84} r={5} fill={INK} />
  </svg>
);

// Sapin de la taïga. hole = trou de pic dans le tronc (coordonnées relatives au sapin).
export const Pine: React.FC<{height?: number; snow?: number; hole?: boolean}> = ({height = 900, snow = 0, hole = false}) => (
  <svg viewBox="0 0 300 900" height={height} style={{overflow: 'visible'}}>
    <rect x={128} y={300} width={44} height={600} fill="#6D4C41" stroke={INK} strokeWidth={6} />
    {hole ? <ellipse cx={150} cy={560} rx={16} ry={22} fill="#2B1B12" stroke={INK} strokeWidth={4} /> : null}
    {[0, 1, 2, 3].map((i) => {
      const y = 40 + i * 110;
      const w = 70 + i * 40;
      return (
        <g key={i}>
          <path d={`M150 ${y} L${150 + w} ${y + 170} L${150 - w} ${y + 170} Z`} fill={i % 2 ? '#2E7D32' : '#388E3C'} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          {snow > 0 ? <path d={`M150 ${y + 4} L${150 + w * 0.45} ${y + 76} Q 150 ${y + 60} ${150 - w * 0.45} ${y + 76} Z`} fill="#fff" opacity={snow} /> : null}
        </g>
      );
    })}
  </svg>
);

// Bouleau (tronc blanc à taches noires). holeY = position du trou (0..1 du tronc), sinon pas de trou.
export const Birch: React.FC<{height?: number; holeY?: number; holeSize?: number; snow?: number}> = ({height = 1200, holeY, holeSize = 1, snow = 0}) => (
  <svg viewBox="0 0 200 1200" height={height} style={{overflow: 'visible'}}>
    <rect x={60} y={0} width={80} height={1200} fill="#F5F5F5" stroke={INK} strokeWidth={6} />
    {[80, 210, 330, 470, 620, 760, 900, 1050].map((y, i) => (
      <path key={y} d={`M${i % 2 ? 60 : 100} ${y} l${i % 2 ? 30 : 40} 4 l-6 8 l-${i % 2 ? 24 : 34} -2 Z`} fill={INK} />
    ))}
    {holeY !== undefined ? (
      <g transform={`translate(100 ${holeY * 1200}) scale(${holeSize})`}>
        <ellipse cx={0} cy={0} rx={30} ry={38} fill="#3E2723" stroke={INK} strokeWidth={6} />
        <ellipse cx={0} cy={6} rx={22} ry={28} fill="#1B0F0A" />
      </g>
    ) : null}
    {snow > 0 ? <rect x={58} y={0} width={84} height={14} rx={6} fill="#fff" opacity={snow} /> : null}
  </svg>
);

export const Nut: React.FC<{size?: number}> = ({size = 90}) => (
  <svg viewBox="0 0 90 100" width={size} style={{overflow: 'visible'}}>
    <path d="M45 30 C 80 30 85 90 45 95 C 5 90 10 30 45 30 Z" fill="#A1683A" stroke={INK} strokeWidth={5} />
    <path d="M12 40 Q 45 10 78 40 Q 45 30 12 40 Z" fill="#6D4C41" stroke={INK} strokeWidth={5} />
    <path d="M45 18 l0 -14" stroke={INK} strokeWidth={6} strokeLinecap="round" />
  </svg>
);

export const Leaf: React.FC<{size?: number; color?: string}> = ({size = 90, color = '#7CB342'}) => (
  <svg viewBox="0 0 90 100" width={size} style={{overflow: 'visible'}}>
    <path d="M45 95 C 0 70 5 20 45 5 C 85 20 90 70 45 95 Z" fill={color} stroke={INK} strokeWidth={5} />
    <path d="M45 95 L45 15 M45 50 l-18 -14 M45 66 l18 -14" stroke={INK} strokeWidth={3} fill="none" />
  </svg>
);

export const Bud: React.FC<{size?: number}> = ({size = 80}) => (
  <svg viewBox="0 0 80 110" width={size} style={{overflow: 'visible'}}>
    <path d="M40 100 L40 60" stroke="#6D4C41" strokeWidth={8} strokeLinecap="round" />
    <path d="M40 62 C 10 50 18 10 40 4 C 62 10 70 50 40 62 Z" fill="#AED581" stroke={INK} strokeWidth={5} />
    <path d="M40 60 C 30 40 34 20 40 8" stroke={INK} strokeWidth={3} fill="none" />
  </svg>
);

export const Camera: React.FC<{size?: number; flash?: number}> = ({size = 160, flash = 0}) => (
  <svg viewBox="0 0 160 120" width={size} style={{overflow: 'visible'}}>
    {flash > 0 ? <circle cx={120} cy={22} r={40 + flash * 60} fill="#FFF9C4" opacity={flash} /> : null}
    <rect x={10} y={30} width={140} height={80} rx={14} fill="#424242" stroke={INK} strokeWidth={6} />
    <rect x={45} y={16} width={50} height={20} rx={5} fill="#424242" stroke={INK} strokeWidth={5} />
    <circle cx={80} cy={70} r={28} fill="#90CAF9" stroke={INK} strokeWidth={6} />
    <circle cx={72} cy={62} r={8} fill="#fff" opacity={0.7} />
    <rect x={112} y={16} width={18} height={12} rx={3} fill="#FFEB3B" stroke={INK} strokeWidth={3} />
  </svg>
);
