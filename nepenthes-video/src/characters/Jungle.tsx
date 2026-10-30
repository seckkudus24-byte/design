import React from 'react';
import {interpolateColors} from 'remotion';
import {Sun} from '../ui';

const INK = '#2B1E14';

// Toupaye (musaraigne arboricole) de profil, tourné vers la droite.
export const Treeshrew: React.FC<{
  frame: number;
  width?: number;
  walking?: boolean;
  licking?: boolean;
  sitting?: boolean;
  bigBelly?: boolean;
  happy?: boolean;
  style?: React.CSSProperties;
}> = ({frame, width = 260, walking = false, licking = false, sitting = false, bigBelly = false, happy = true, style}) => {
  const fur = '#8D6E4A';
  const light = '#C9A77C';
  const step = walking ? Math.sin(frame * 0.6) * 14 : 0;
  const bob = walking ? Math.abs(Math.sin(frame * 0.6)) * -6 : 0;
  const tongue = licking ? (Math.sin(frame * 0.9) + 1) / 2 : 0;
  const blink = frame % 80 < 4 ? 0.15 : 1;
  const tail = Math.sin(frame * 0.15) * 8;
  const belly = bigBelly ? 1.25 : 1;
  return (
    <svg viewBox="-60 -40 340 220" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(0 ${bob}) rotate(${sitting ? -18 : 0} 110 150)`}>
        {/* queue touffue */}
        <g transform={`rotate(${tail} 40 100)`}>
          <path d="M45 100 C 0 110 -40 90 -50 50 C -30 70 0 75 40 85 Z" fill={fur} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </g>
        {[60, 85, 140, 165].map((x, i) => (
          <path key={x} d={`M${x} 125 l${(i % 2 ? -1 : 1) * step * (sitting ? 0 : 1)} 30`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
        ))}
        <ellipse cx={110} cy={100} rx={72 * belly} ry={36 * belly} fill={fur} stroke={INK} strokeWidth={5} />
        <ellipse cx={120} cy={115} rx={44 * belly} ry={18 * belly} fill={light} />
        {/* tête au museau pointu */}
        <path d="M160 70 Q 200 50 250 92 Q 210 112 168 112 Z" fill={fur} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={250} cy={92} r={6} fill={INK} />
        <circle cx={174} cy={66} r={11} fill={fur} stroke={INK} strokeWidth={4} />
        <ellipse cx={196} cy={80} rx={9} ry={9 * blink} fill="#fff" stroke={INK} strokeWidth={3} />
        {blink > 0.5 ? <circle cx={199} cy={80} r={4.5} fill={INK} /> : null}
        <path d={happy ? 'M218 100 q8 6 16 0' : 'M218 104 q8 -5 16 0'} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        {tongue > 0.05 ? <path d={`M244 98 q${10 + tongue * 14} ${-6 - tongue * 10} ${8 + tongue * 18} ${-18 - tongue * 10}`} stroke="#F06292" strokeWidth={7} fill="none" strokeLinecap="round" /> : null}
      </g>
    </svg>
  );
};

// Népenthès : urne avec rebord (péristome) et couvercle. lidShake = vibration du couvercle.
export const Pitcher: React.FC<{
  frame: number;
  height?: number;
  nectar?: number;
  lidShake?: number;
  face?: 'happy' | 'yum' | 'none';
  red?: boolean;
  style?: React.CSSProperties;
}> = ({frame, height = 700, nectar = 0, lidShake = 0, face = 'none', red = false, style}) => {
  const body = red ? '#C2185B' : '#7CB342';
  const dark = red ? '#880E4F' : '#558B2F';
  const rim = red ? '#6A1B9A' : '#E53935';
  const shake = Math.sin(frame * 2.2) * 6 * lidShake;
  return (
    <svg viewBox="0 0 400 700" height={height} style={{overflow: 'visible', ...style}}>
      <ellipse cx={200} cy={600} rx={150} ry={26} fill="rgba(0,0,0,0.18)" />
      {/* vrille qui relie à la feuille */}
      <path d="M200 690 Q 120 660 140 600" stroke={dark} strokeWidth={14} fill="none" strokeLinecap="round" />
      {/* urne */}
      <path d="M110 230 C 60 360 60 560 200 600 C 340 560 340 360 290 230 Z" fill={body} stroke={INK} strokeWidth={8} />
      <path d="M250 240 C 300 360 310 520 205 596 C 300 560 330 380 290 232 Z" fill="rgba(0,0,0,0.14)" />
      <path d="M130 270 C 105 360 105 450 125 520" stroke="rgba(255,255,255,0.35)" strokeWidth={14} fill="none" strokeLinecap="round" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${150 + i * 50} 260 Q ${140 + i * 55} 420 ${160 + i * 40} 570`} stroke={dark} strokeWidth={6} fill="none" opacity={0.6} />
      ))}
      {red ? null : (
        <>
          <ellipse cx={170} cy={380} rx={14} ry={10} fill="#C62828" opacity={0.5} />
          <ellipse cx={240} cy={460} rx={12} ry={9} fill="#C62828" opacity={0.5} />
        </>
      )}
      {/* rebord (péristome) */}
      <ellipse cx={200} cy={230} rx={98} ry={36} fill="#3E2723" stroke={INK} strokeWidth={6} />
      <ellipse cx={200} cy={230} rx={98} ry={36} fill="none" stroke={rim} strokeWidth={18} />
      {/* couvercle */}
      <g transform={`rotate(${-8 + shake} 230 200)`}>
        <path d="M230 200 Q 220 90 120 70 Q 60 66 70 120 Q 110 170 230 200 Z" fill={body} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        {nectar > 0
          ? [0, 1, 2, 3].map((i) => (
              <ellipse key={i} cx={110 + i * 28} cy={112 + (i % 2) * 14} rx={9} ry={11} fill="#FFD54F" stroke={INK} strokeWidth={3} opacity={nectar} style={{filter: 'drop-shadow(0 0 8px #FFF59D)'}} />
            ))
          : null}
      </g>
      {/* petit visage */}
      {face !== 'none' ? (
        <g>
          <circle cx={170} cy={380} r={12} fill={INK} />
          <circle cx={235} cy={380} r={12} fill={INK} />
          <circle cx={174} cy={376} r={4} fill="#fff" />
          <circle cx={239} cy={376} r={4} fill="#fff" />
          {face === 'yum' ? (
            <path d="M175 420 Q 202 450 230 420 Q 215 440 200 438" stroke={INK} strokeWidth={6} fill="#F06292" />
          ) : (
            <path d="M175 420 Q 202 446 230 420" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          )}
          <circle cx={150} cy={415} r={14} fill="#F48FB1" opacity={0.6} />
          <circle cx={255} cy={415} r={14} fill="#F48FB1" opacity={0.6} />
        </g>
      ) : null}
    </svg>
  );
};

export const Ant: React.FC<{size?: number; frame: number; slip?: boolean}> = ({size = 70, frame, slip = false}) => {
  const leg = Math.sin(frame * (slip ? 1.6 : 0.8)) * 8;
  return (
    <svg viewBox="-40 -30 80 60" width={size} style={{overflow: 'visible'}}>
      {[-12, 0, 12].map((x, i) => (
        <path key={x} d={`M${x} 4 l${-6 + (i % 2 ? leg : -leg) * 0.5} 14 M${x} 4 l${6 + (i % 2 ? -leg : leg) * 0.5} -14`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      ))}
      <ellipse cx={-18} cy={2} rx={11} ry={9} fill="#3E2723" />
      <ellipse cx={0} cy={2} rx={8} ry={7} fill="#3E2723" />
      <circle cx={16} cy={-2} r={8} fill="#3E2723" />
      <path d="M20 -8 q6 -10 12 -8 M18 -9 q2 -12 8 -14" stroke={INK} strokeWidth={2.5} fill="none" />
      <circle cx={19} cy={-4} r={2.4} fill="#fff" />
      {slip ? <path d="M-8 -16 q4 -8 8 0" stroke="#4FC3F7" strokeWidth={3} fill="none" /> : null}
    </svg>
  );
};

// Chauve-souris. sleeping = suspendue la tête en bas, ailes repliées.
export const Bat: React.FC<{size?: number; frame: number; sleeping?: boolean}> = ({size = 200, frame, sleeping = false}) => {
  const flap = sleeping ? 0 : Math.sin(frame * 0.7) * 30;
  return (
    <svg viewBox="-110 -70 220 160" width={size} style={{overflow: 'visible', transform: sleeping ? 'rotate(180deg)' : undefined}}>
      {sleeping ? (
        <path d="M-30 -20 Q 0 40 30 -20 Q 0 0 -30 -20 Z" fill="#5D4037" stroke={INK} strokeWidth={5} />
      ) : (
        <>
          <g transform={`rotate(${-flap} -20 0)`}>
            <path d="M-20 0 L-100 -30 L-80 0 L-95 20 L-60 10 L-50 30 L-25 15 Z" fill="#6D4C41" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          </g>
          <g transform={`rotate(${flap} 20 0)`}>
            <path d="M20 0 L100 -30 L80 0 L95 20 L60 10 L50 30 L25 15 Z" fill="#6D4C41" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          </g>
        </>
      )}
      <ellipse cx={0} cy={6} rx={24} ry={28} fill="#8D6E63" stroke={INK} strokeWidth={5} />
      <path d="M-16 -16 L-22 -42 L-4 -22 Z M16 -16 L22 -42 L4 -22 Z" fill="#8D6E63" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {sleeping ? (
        <path d="M-12 -2 q5 4 10 0 M2 -2 q5 4 10 0" stroke={INK} strokeWidth={3} fill="none" />
      ) : (
        <>
          <circle cx={-8} cy={-2} r={5} fill="#fff" />
          <circle cx={8} cy={-2} r={5} fill="#fff" />
          <circle cx={-7} cy={-2} r={2.5} fill={INK} />
          <circle cx={9} cy={-2} r={2.5} fill={INK} />
        </>
      )}
      <path d="M-6 12 q6 5 12 0" stroke={INK} strokeWidth={3} fill="none" />
    </svg>
  );
};

// Cuvette de toilettes (« chaise anglaise »).
export const Toilet: React.FC<{size?: number}> = ({size = 260}) => (
  <svg viewBox="0 0 260 320" width={size} style={{overflow: 'visible'}}>
    <rect x={150} y={10} width={90} height={150} rx={14} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    <rect x={175} y={30} width={40} height={12} rx={6} fill="#B0BEC5" />
    <path d="M30 150 L230 150 Q 230 250 150 260 L150 310 L80 310 L80 260 Q 20 240 30 150 Z" fill="#FFFFFF" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <ellipse cx={130} cy={150} rx={104} ry={26} fill="#E3F2FD" stroke={INK} strokeWidth={8} />
    <ellipse cx={130} cy={152} rx={70} ry={14} fill="#90CAF9" />
  </svg>
);

export const Candy: React.FC<{size?: number}> = ({size = 140}) => (
  <svg viewBox="0 0 200 100" width={size} style={{overflow: 'visible'}}>
    <path d="M60 50 L20 20 L24 80 Z M140 50 L180 20 L176 80 Z" fill="#F48FB1" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={100} cy={50} r={42} fill="#EC407A" stroke={INK} strokeWidth={6} />
    <path d="M70 40 Q 100 20 130 40 M68 62 Q 100 42 132 62" stroke="#fff" strokeWidth={8} fill="none" opacity={0.7} />
  </svg>
);

// Petites crottes (cartoon).
export const Pellet: React.FC<{size?: number}> = ({size = 30}) => (
  <svg viewBox="-12 -10 24 20" width={size} style={{overflow: 'visible'}}>
    <ellipse cx={0} cy={0} rx={10} ry={7} fill="#6D4C41" stroke={INK} strokeWidth={2} />
  </svg>
);

// Jungle de Bornéo : montagnes dans la brume, feuillage, lianes. night : 0..1.
export const Jungle: React.FC<{frame: number; night?: number; sunrise?: number; rain?: number}> = ({frame, night = 0, sunrise = 1, rain = 0}) => {
  const sky1 = interpolateColors(night, [0, 1], ['#81D4FA', '#1A237E']);
  const sky2 = interpolateColors(night, [0, 1], ['#E1F5FE', '#3949AB']);
  const leaf = interpolateColors(night, [0, 1], ['#43A047', '#1B5E20']);
  const leaf2 = interpolateColors(night, [0, 1], ['#66BB6A', '#2E7D32']);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sky1} 0%, ${sky2} 70%)`}} />
      {night < 0.5 ? <Sun x={860} y={1250 - sunrise * 520} r={80} frame={frame} /> : null}
      {/* nuages qui défilent doucement */}
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 1 - night * 0.7}}>
        {[
          {y: 560, s: 1, v: 0.6, o: 0},
          {y: 760, s: 0.7, v: 0.4, o: 500},
          {y: 980, s: 0.85, v: 0.5, o: 900},
        ].map((c, i) => {
          const x = ((c.o + frame * c.v) % 1500) - 250;
          return (
            <g key={i} transform={`translate(${x} ${c.y}) scale(${c.s})`}>
              <ellipse cx={0} cy={0} rx={130} ry={46} fill="#FFFFFF" />
              <ellipse cx={-60} cy={-24} rx={70} ry={52} fill="#FFFFFF" />
              <ellipse cx={50} cy={-34} rx={80} ry={60} fill="#FFFFFF" />
              <ellipse cx={0} cy={22} rx={120} ry={16} fill="#E3F2FD" />
            </g>
          );
        })}
      </svg>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* montagnes de Bornéo */}
        <path d="M-20 1250 L 180 980 L 330 1120 L 520 900 L 720 1110 L 880 960 L 1100 1200 L 1100 1300 L -20 1300 Z" fill={interpolateColors(night, [0, 1], ['#81C784', '#283593'])} opacity={0.8} />
        <rect x={-20} y={1150} width={1120} height={120} fill="#fff" opacity={0.35 * (1 - night)} />
        {/* feuillage */}
        {Array.from({length: 9}, (_, i) => (
          <ellipse key={i} cx={(i * 140) % 1120} cy={1290 + (i % 3) * 30} rx={150} ry={70} fill={i % 2 ? leaf : leaf2} />
        ))}
        <rect x={-20} y={1330} width={1120} height={600} fill={interpolateColors(night, [0, 1], ['#558B2F', '#1B3A17'])} />
        {/* lianes */}
        {[90, 990].map((x, i) => (
          <path key={x} d={`M${x} -10 Q ${x + 40 * Math.sin(frame * 0.03 + i)} 400 ${x - 20} 800`} stroke={leaf} strokeWidth={14} fill="none" strokeLinecap="round" />
        ))}
        {/* pluie */}
        {rain > 0
          ? Array.from({length: 40}, (_, i) => {
              const x = (i * 131) % 1080;
              const y = ((i * 263) % 1920 + frame * 28) % 1920;
              return <path key={i} d={`M${x} ${y} l-8 34`} stroke="#B3E5FC" strokeWidth={5} strokeLinecap="round" opacity={rain * 0.8} />;
            })
          : null}
      </svg>
    </>
  );
};
