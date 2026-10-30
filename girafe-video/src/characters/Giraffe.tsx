import React from 'react';

const INK = '#3A2A1A';
const COAT = '#F6C04A';
const SPOT = '#B5651D';
const BELLY = '#FBE3A6';

type GiraffeProps = {
  frame: number;
  height?: number;
  // marche à l'amble : les deux pattes du même côté avancent ensemble
  walking?: boolean;
  // position pour boire (pattes avant écartées, cou vers le sol) : 0..1
  drink?: number;
  // cou qui tangue (girafon endormi)
  sway?: number;
  // ruade de la patte arrière : 0..1
  kick?: number;
  sleepy?: boolean;
  angry?: boolean;
  baby?: boolean;
  // surligne les pattes gauches (« left ») ou droites (« right »)
  highlight?: 'left' | 'right';
  style?: React.CSSProperties;
};

// Girafe vue de profil, tournée vers la droite.
export const Giraffe: React.FC<GiraffeProps> = ({
  frame,
  height = 900,
  walking = false,
  drink = 0,
  sway = 0,
  kick = 0,
  sleepy = false,
  angry = false,
  baby = false,
  highlight,
  style,
}) => {
  const phase = frame * 0.18;
  // amble : pattes gauches (fond) ensemble, pattes droites (devant) ensemble
  const swingL = walking ? Math.sin(phase) * 16 : 0;
  const swingR = walking ? Math.sin(phase + Math.PI) * 16 : 0;
  const bodyRock = walking ? Math.sin(phase * 2) * 2 : 0;
  const neckAngle = drink * 148 + Math.sin(frame * 0.09) * 18 * sway + (walking ? Math.sin(phase) * 4 : 0);
  const dropBody = drink * 40;
  const blink = sleepy ? 0.15 : frame % 90 < 4 ? 0.15 : 1;
  const splay = drink * 24;
  const glow = (side: 'left' | 'right') => (highlight === side ? '#FFEB3B' : undefined);

  const leg = (x: number, angle: number, back: boolean, side: 'left' | 'right', extra = 0) => (
    <g transform={`rotate(${angle + extra} ${x} 350)`}>
      {glow(side) ? <rect x={x - 22} y={340} width={44} height={250} rx={20} fill={glow(side)} opacity={0.8} /> : null}
      <rect x={x - 12} y={345} width={24} height={230} rx={10} fill={back ? '#E2AE3C' : COAT} stroke={INK} strokeWidth={6} />
      <rect x={x - 14} y={565} width={28} height={22} rx={6} fill="#5D4037" stroke={INK} strokeWidth={5} />
    </g>
  );

  const scale = baby ? 0.62 : 1;
  return (
    <svg viewBox="-60 -80 520 700" height={height} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(200 590) scale(${scale}) translate(-200 -590)`}>
        <g transform={`translate(0 ${dropBody}) rotate(${bodyRock} 200 330)`}>
          {/* pattes du fond : gauche */}
          {leg(110, swingL - splay * 0.2, true, 'left', kick * -70)}
          {leg(270, swingL + splay, true, 'left')}
          {/* queue */}
          <path d={`M75 300 Q 50 ${360 + Math.sin(frame * 0.15) * 10} 58 420`} stroke={INK} strokeWidth={6} fill="none" />
          <path d="M58 420 l-8 24 l14 -4 l6 18 l4 -24 Z" fill={INK} />
          {/* corps */}
          <ellipse cx={190} cy={320} rx={125} ry={68} fill={COAT} stroke={INK} strokeWidth={7} />
          <ellipse cx={200} cy={355} rx={90} ry={26} fill={BELLY} />
          {[
            [120, 290, 22],
            [170, 300, 26],
            [225, 285, 22],
            [270, 310, 18],
            [140, 335, 18],
            [200, 335, 16],
            [95, 315, 14],
          ].map(([x, y, r], i) => (
            <path key={i} d={`M${x - r} ${y} q${r * 0.4} ${-r} ${r} ${-r * 0.8} q${r * 0.9} ${r * 0.2} ${r} ${r} q${-r * 0.5} ${r * 0.9} ${-r} ${r * 0.7} q${-r * 0.8} ${-r * 0.2} ${-r} ${-r * 0.9} Z`} fill={SPOT} />
          ))}
          {/* pattes de devant : droite */}
          {leg(140, swingR - splay * 0.2, false, 'right', kick * -70)}
          {leg(290, swingR + splay * 1.2, false, 'right')}
          {/* cou + tête (pivot à la base du cou) */}
          <g transform={`rotate(${neckAngle} 270 290)`}>
            <path d="M245 300 L 285 300 L 300 40 L 272 40 Z" fill={COAT} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
            <path d="M262 290 L 276 48" stroke="#8D5524" strokeWidth={10} strokeDasharray="14 10" />
            {[
              [270, 250, 12],
              [282, 190, 11],
              [276, 130, 10],
              [286, 80, 8],
            ].map(([x, y, r], i) => (
              <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 1.3} fill={SPOT} />
            ))}
            {/* tête */}
            <g transform="translate(296 34)">
              <path d="M-16 -36 l-4 -26 M6 -38 l2 -26" stroke={INK} strokeWidth={7} strokeLinecap="round" />
              <circle cx={-20} cy={-64} r={8} fill="#5D4037" />
              <circle cx={8} cy={-66} r={8} fill="#5D4037" />
              <ellipse cx={-26} cy={-20} rx={18} ry={9} fill={COAT} stroke={INK} strokeWidth={5} transform="rotate(-30 -26 -20)" />
              <path d="M-20 -30 C 10 -46 60 -20 66 6 C 70 26 48 34 30 30 C 6 26 -24 10 -20 -30 Z" fill={COAT} stroke={INK} strokeWidth={7} />
              <ellipse cx={50} cy={14} rx={20} ry={16} fill="#E8A86A" />
              <circle cx={58} cy={10} r={3.5} fill={INK} />
              <ellipse cx={8} cy={-12} rx={9} ry={10 * blink} fill="#fff" stroke={INK} strokeWidth={4} />
              {blink > 0.5 ? <circle cx={11} cy={-11} r={4.5} fill={INK} /> : null}
              {angry ? <path d="M-4 -26 l22 8" stroke={INK} strokeWidth={6} strokeLinecap="round" /> : null}
              {sleepy ? <path d="M0 -10 q8 6 16 0" stroke={INK} strokeWidth={4} fill="none" /> : null}
              <path d={angry ? 'M34 30 q8 -6 16 0' : 'M34 26 q8 6 16 0'} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
              <circle cx={24} cy={8} r={7} fill="#F48FB1" opacity={0.55} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export const Lion: React.FC<{frame: number; width?: number; scared?: boolean; style?: React.CSSProperties}> = ({frame, width = 300, scared = false, style}) => {
  const mane = Array.from({length: 18}, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    const r = i % 2 === 0 ? 68 : 50;
    return `${80 + Math.cos(a) * r},${92 + Math.sin(a) * r}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 320 230" width={width} style={{overflow: 'visible', ...style}}>
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
      {scared ? <path d="M64 120 q8 -8 16 0 q8 8 16 0" stroke={INK} strokeWidth={4} fill="none" /> : <path d="M66 116 Q80 128 94 116" stroke={INK} strokeWidth={4} fill="none" />}
      {scared ? <path d="M128 50 q8 16 0 22 q-8 -6 0 -22" fill="#4FC3F7" stroke={INK} strokeWidth={3} /> : null}
    </svg>
  );
};

// Rhinocéros tourné vers la gauche.
export const Rhino: React.FC<{frame: number; width?: number; dizzy?: boolean}> = ({frame, width = 340, dizzy = false}) => (
  <svg viewBox="0 0 340 220" width={width} style={{overflow: 'visible'}}>
    {[110, 150, 230, 270].map((x) => (
      <rect key={x} x={x - 16} y={140} width={34} height={60} rx={12} fill="#90A4AE" stroke={INK} strokeWidth={6} />
    ))}
    <ellipse cx={200} cy={120} rx={120} ry={60} fill="#B0BEC5" stroke={INK} strokeWidth={7} />
    <path d="M110 90 Q 50 80 30 120 Q 40 160 100 155 Z" fill="#B0BEC5" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M40 112 L 18 60 L 60 104 Z" fill="#ECEFF1" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M70 100 L 64 76 L 82 98 Z" fill="#ECEFF1" stroke={INK} strokeWidth={4} />
    <path d="M118 82 l6 -22 l10 20" fill="#B0BEC5" stroke={INK} strokeWidth={5} />
    {dizzy ? (
      <g transform={`rotate(${frame * 8} 92 104)`}>
        <path d="M84 104 l16 0 M92 96 l0 16" stroke={INK} strokeWidth={4} />
      </g>
    ) : (
      <circle cx={92} cy={104} r={5} fill={INK} />
    )}
    {dizzy
      ? [0, 1, 2].map((i) => {
          const a = frame * 0.15 + (i * Math.PI * 2) / 3;
          return <path key={i} d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z" fill="#FFEB3B" stroke={INK} strokeWidth={2} transform={`translate(${100 + Math.cos(a) * 50} ${50 + Math.sin(a) * 14})`} />;
        })
      : null}
  </svg>
);

export const Car: React.FC<{width?: number}> = ({width = 280}) => (
  <svg viewBox="0 0 280 150" width={width} style={{overflow: 'visible'}}>
    <path d="M20 100 L30 60 Q 50 40 90 38 L180 38 Q 210 40 230 64 L260 72 Q 272 76 270 100 Z" fill="#EF5350" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M70 62 L95 46 L140 46 L140 64 Z M152 46 L190 46 L214 64 L152 64 Z" fill="#B3E5FC" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={75} cy={108} r={26} fill="#424242" stroke={INK} strokeWidth={6} />
    <circle cx={210} cy={108} r={26} fill="#424242" stroke={INK} strokeWidth={6} />
    <circle cx={75} cy={108} r={10} fill="#BDBDBD" />
    <circle cx={210} cy={108} r={10} fill="#BDBDBD" />
  </svg>
);

export const Bus: React.FC<{width?: number; frame: number}> = ({width = 260, frame}) => (
  <svg viewBox="0 0 260 160" width={width} style={{overflow: 'visible'}}>
    <rect x={10} y={20} width={240} height={110} rx={18} fill="#FFCA28" stroke={INK} strokeWidth={7} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={28 + i * 66} y={36} width={52} height={40} rx={6} fill="#B3E5FC" stroke={INK} strokeWidth={4} />
    ))}
    {/* passager qui s'endort, la tête qui penche */}
    <g transform={`rotate(${Math.sin(frame * 0.12) * 18} 120 70)`}>
      <circle cx={120} cy={58} r={12} fill="#fff" stroke={INK} strokeWidth={4} />
      <path d="M114 56 h4 M122 56 h4" stroke={INK} strokeWidth={3} />
    </g>
    <circle cx={60} cy={134} r={18} fill="#424242" stroke={INK} strokeWidth={5} />
    <circle cx={200} cy={134} r={18} fill="#424242" stroke={INK} strokeWidth={5} />
  </svg>
);

// Bâtiment de zoo à étage, avec un soigneur à la fenêtre du 1er.
export const Zoo: React.FC<{height?: number; frame: number}> = ({height = 700, frame}) => (
  <svg viewBox="0 0 300 600" height={height} style={{overflow: 'visible'}}>
    <rect x={20} y={120} width={260} height={480} fill="#D7CCC8" stroke={INK} strokeWidth={8} />
    <path d="M0 130 L150 30 L300 130 Z" fill="#8D6E63" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M20 360 L280 360" stroke={INK} strokeWidth={6} />
    <rect x={60} y={170} width={180} height={130} fill="#B3E5FC" stroke={INK} strokeWidth={6} />
    <rect x={110} y={440} width={80} height={160} fill="#6D4C41" stroke={INK} strokeWidth={6} />
    {/* soigneur avec une branche de feuilles */}
    <circle cx={110} cy={230} r={20} fill="#fff" stroke={INK} strokeWidth={5} />
    <path d="M110 250 L110 300 M110 268 L180 250" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <g transform={`rotate(${Math.sin(frame * 0.2) * 6} 180 250)`}>
      <path d="M180 250 l40 -10" stroke="#6D4C41" strokeWidth={6} />
      <ellipse cx={226} cy={234} rx={18} ry={10} fill="#66BB6A" stroke={INK} strokeWidth={3} />
      <ellipse cx={214} cy={250} rx={14} ry={8} fill="#43A047" stroke={INK} strokeWidth={3} />
    </g>
    <text x={150} y={400} textAnchor="middle" fontFamily="LuckiestGuy" fontSize={34} fill={INK}>
      1ER ÉTAGE
    </text>
  </svg>
);

// Camion plateau.
export const Truck: React.FC<{width?: number}> = ({width = 520}) => (
  <svg viewBox="0 0 520 200" width={width} style={{overflow: 'visible'}}>
    <rect x={20} y={110} width={360} height={40} fill="#78909C" stroke={INK} strokeWidth={7} />
    <path d="M380 150 L380 70 L450 70 L490 110 L500 150 Z" fill="#42A5F5" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <rect x={400} y={82} width={44} height={32} fill="#B3E5FC" stroke={INK} strokeWidth={4} />
    {[80, 300, 450].map((x) => (
      <g key={x}>
        <circle cx={x} cy={160} r={28} fill="#424242" stroke={INK} strokeWidth={6} />
        <circle cx={x} cy={160} r={10} fill="#BDBDBD" />
      </g>
    ))}
  </svg>
);

// Mètre ruban vertical. h = hauteur affichée (px) ; label à côté.
export const Ruler: React.FC<{h: number; label: string; ticks?: number}> = ({h, label, ticks = 6}) => (
  <svg width={160} height={h + 40} style={{overflow: 'visible'}}>
    <rect x={20} y={20} width={44} height={h} fill="#FFEB3B" stroke={INK} strokeWidth={6} />
    {Array.from({length: ticks + 1}, (_, i) => (
      <path key={i} d={`M20 ${20 + (h * i) / ticks} h22`} stroke={INK} strokeWidth={5} />
    ))}
    <text x={78} y={34} fontFamily="LuckiestGuy" fontSize={56} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke">
      {label}
    </text>
  </svg>
);

// Verre d'eau.
export const Glass: React.FC<{size?: number}> = ({size = 160}) => (
  <svg viewBox="0 0 120 160" width={size} style={{overflow: 'visible'}}>
    <path d="M14 10 L106 10 L94 150 L26 150 Z" fill="rgba(227,242,253,0.8)" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M20 60 L100 60 L94 150 L26 150 Z" fill="#4FC3F7" />
    <path d="M30 70 L36 140" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
    <path d="M86 -20 L70 60" stroke="#E53935" strokeWidth={8} strokeLinecap="round" />
  </svg>
);
