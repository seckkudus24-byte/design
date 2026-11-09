import React, {useId} from 'react';
import {interpolateColors} from 'remotion';

// Style « vectoriel détaillé » : traits fins, dégradés, ombres portées, reflets.
export const INK = '#1E1B2B';

// Ornithorynque de profil, tourné vers la droite.
// bill / body / tail : opacité de chaque partie (pour « l'assembler ») ; stitches = coutures au cou.
export const Platypus: React.FC<{
  frame: number;
  width?: number;
  walking?: boolean;
  swim?: boolean;
  eyesClosed?: boolean;
  spur?: number;
  bill?: number;
  body?: number;
  tail?: number;
  stitches?: number;
  mood?: 'happy' | 'calm' | 'surprised';
  style?: React.CSSProperties;
}> = ({frame, width = 420, walking = false, swim = false, eyesClosed = false, spur = 0, bill = 1, body = 1, tail = 1, stitches = 0, mood = 'happy', style}) => {
  const id = useId().replace(/:/g, '');
  const step = walking ? Math.sin(frame * 0.4) * 10 : swim ? Math.sin(frame * 0.3) * 14 : 0;
  const bob = walking ? Math.abs(Math.sin(frame * 0.4)) * -5 : swim ? Math.sin(frame * 0.1) * 6 : Math.sin(frame * 0.08) * 2;
  const blink = eyesClosed ? 0.12 : frame % 90 < 4 ? 0.15 : 1;
  const sw = 4;
  return (
    <svg viewBox="-60 -60 480 220" width={width} style={{overflow: 'visible', ...style}}>
      <defs>
        <linearGradient id={`fur${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9A6A45" />
          <stop offset="0.55" stopColor="#7A4E30" />
          <stop offset="1" stopColor="#5A3820" />
        </linearGradient>
        <linearGradient id={`belly${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C49A72" />
          <stop offset="1" stopColor="#A27752" />
        </linearGradient>
        <linearGradient id={`bill${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5C6A73" />
          <stop offset="1" stopColor="#2F3A41" />
        </linearGradient>
        <linearGradient id={`tail${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6E4529" />
          <stop offset="1" stopColor="#4A2E1A" />
        </linearGradient>
      </defs>
      {/* ombre portée */}
      {!swim ? <ellipse cx={170} cy={156} rx={200} ry={12} fill="#000000" opacity={0.18 * body} /> : null}
      <g transform={`translate(0 ${bob})`}>
        {/* queue de castor (écailles) */}
        <g opacity={tail}>
          <path d={`M66 88 Q 10 ${70 + (swim ? step * 0.5 : 0)} -46 ${86 + (swim ? step : 0)} Q -64 106 -46 126 Q 10 130 66 114 Z`} fill={`url(#tail${id})`} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
          {Array.from({length: 4}, (_, r) =>
            Array.from({length: 5}, (_, c) => (
              <path key={`${r}-${c}`} d={`M${-36 + c * 20 + (r % 2) * 10} ${94 + r * 7} q 6 6 12 0`} stroke="#3B2414" strokeWidth={2} fill="none" opacity={0.7} />
            )),
          )}
          <path d="M-40 96 Q 0 84 50 92" stroke="#8D5E3C" strokeWidth={3} fill="none" opacity={0.6} strokeLinecap="round" />
        </g>
        <g opacity={body}>
          {/* pattes palmées (arrière-plan) */}
          {[
            [110, -step, 0.8],
            [240, step, 0.8],
          ].map(([x, s, o], i) => (
            <g key={`b${i}`} opacity={o}>
              <path d={`M${x} 112 q ${s * 0.4} 16 ${s * 0.6} 28`} stroke="#3B2414" strokeWidth={14} fill="none" strokeLinecap="round" />
              <path d={`M${x - 16 + s * 0.6} 146 Q ${x + s * 0.6} 132 ${x + 20 + s * 0.6} 146 Q ${x + 2 + s * 0.6} 152 ${x - 16 + s * 0.6} 146 Z`} fill="#3E2A1E" stroke={INK} strokeWidth={3} />
            </g>
          ))}
          {/* corps de loutre */}
          <path d="M52 92 Q 48 42 130 34 Q 228 28 272 68 Q 294 104 252 124 Q 160 140 82 126 Q 46 118 52 92 Z" fill={`url(#fur${id})`} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M84 112 Q 170 130 252 110 Q 230 128 160 132 Q 100 130 84 112 Z" fill={`url(#belly${id})`} opacity={0.85} />
          <path d="M90 52 Q 160 36 230 50" stroke="#B88660" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.55} />
          {/* poils */}
          {Array.from({length: 14}, (_, i) => (
            <path key={i} d={`M${80 + i * 13} ${56 + (i % 3) * 14} l 6 -6`} stroke="#5A3820" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
          ))}
          {/* pattes palmées (avant) avec griffes */}
          {[
            [92, step],
            [222, -step],
          ].map(([x, s], i) => (
            <g key={`f${i}`}>
              <path d={`M${x} 114 q ${s * 0.4} 16 ${s * 0.6} 28`} stroke={INK} strokeWidth={17} fill="none" strokeLinecap="round" />
              <path d={`M${x} 114 q ${s * 0.4} 16 ${s * 0.6} 28`} stroke="#6E4529" strokeWidth={12} fill="none" strokeLinecap="round" />
              <path d={`M${x - 20 + s * 0.6} 148 Q ${x + s * 0.6} 130 ${x + 24 + s * 0.6} 148 Q ${x + 2 + s * 0.6} 156 ${x - 20 + s * 0.6} 148 Z`} fill="#4E342E" stroke={INK} strokeWidth={3} />
              {[-12, 0, 12].map((d) => (
                <path key={d} d={`M${x + d + 4 + s * 0.6} 150 l 4 5`} stroke="#ECEFF1" strokeWidth={2.5} strokeLinecap="round" />
              ))}
            </g>
          ))}
          {/* ergot venimeux (patte arrière) */}
          {spur > 0 ? (
            <g opacity={spur}>
              <circle cx={82} cy={134} r={26} fill="#FFEB3B" opacity={0.45} />
              <path d="M88 130 L 62 142 L 86 142 Z" fill="#F5F5F5" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            </g>
          ) : null}
          {/* tête */}
          <ellipse cx={276} cy={72} rx={40} ry={33} fill={`url(#fur${id})`} stroke={INK} strokeWidth={sw} />
          <path d="M252 52 Q 276 40 298 50" stroke="#B88660" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
          {/* œil (petite tache claire autour, comme le vrai) */}
          <ellipse cx={290} cy={62} rx={12} ry={9} fill="#C49A72" opacity={0.7} />
          {blink > 0.5 ? (
            <>
              <circle cx={290} cy={62} r={mood === 'surprised' ? 7.5 : 6} fill="#120E0A" />
              <circle cx={292.5} cy={59.5} r={2.2} fill="#FFFFFF" />
            </>
          ) : (
            <path d="M283 62 q 7 4 14 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
          )}
        </g>
        {/* bec de canard (souple, avec narines) */}
        <g opacity={bill}>
          <path d="M306 60 Q 356 46 400 58 Q 422 68 412 88 Q 396 100 354 98 Q 326 96 306 90 Z" fill={`url(#bill${id})`} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M310 78 Q 360 84 410 80" stroke="#1F272C" strokeWidth={2.5} fill="none" />
          <path d="M318 62 Q 360 52 396 60" stroke="#8A98A1" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
          <ellipse cx={384} cy={64} rx={4} ry={2.4} fill="#1A2126" />
          <ellipse cx={396} cy={66} rx={4} ry={2.4} fill="#1A2126" />
          {Array.from({length: 6}, (_, i) => (
            <circle key={i} cx={330 + i * 12} cy={70 + (i % 2) * 4} r={1.3} fill="#9AA7AF" opacity={0.6} />
          ))}
          <path d="M304 56 Q 312 74 304 94" stroke="#7A8790" strokeWidth={6} fill="none" strokeLinecap="round" />
          {mood === 'happy' ? <path d="M330 92 Q 362 100 396 92" stroke="#7F8C94" strokeWidth={2.5} fill="none" strokeLinecap="round" /> : null}
        </g>
        {/* coutures */}
        {stitches > 0 ? (
          <g opacity={stitches}>
            <path d="M304 42 L 308 102" stroke="#C62828" strokeWidth={3.5} strokeDasharray="6 5" />
            {[50, 62, 74, 86].map((y) => (
              <path key={y} d={`M298 ${y} l 16 4`} stroke="#C62828" strokeWidth={3} strokeLinecap="round" />
            ))}
          </g>
        ) : null}
      </g>
    </svg>
  );
};

// Œuf (coquille souple, blanc cassé).
export const Egg: React.FC<{size?: number; crack?: number}> = ({size = 80, crack = 0}) => (
  <svg viewBox="0 0 80 110" width={size} style={{overflow: 'visible'}}>
    <ellipse cx={40} cy={102} rx={28} ry={5} fill="#000000" opacity={0.18} />
    <ellipse cx={40} cy={54} rx={32} ry={42} fill="#FFF6E0" stroke={INK} strokeWidth={3.5} />
    <path d="M56 26 Q 70 46 64 72 Q 70 44 56 26 Z" fill="#E8D9B5" />
    <ellipse cx={28} cy={34} rx={7} ry={11} fill="#FFFFFF" opacity={0.8} />
    {crack > 0 ? <path d="M14 50 l 10 -8 l 8 10 l 10 -10 l 8 10 l 12 -8" stroke={INK} strokeWidth={3} fill="none" opacity={crack} /> : null}
  </svg>
);

// Ombre douce sous un personnage.
export const Shadow: React.FC<{x: number; y: number; w: number; o?: number}> = ({x, y, w, o = 0.2}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.06, width: w, height: w * 0.12, borderRadius: '50%', background: `rgba(0,0,0,${o})`, filter: 'blur(6px)'}} />
);

// Plancher en lattes de bois en perspective (intérieurs).
export const WoodFloor: React.FC<{y: number; color?: string}> = ({y, color = '#C98B4F'}) => (
  <svg width={1080} height={1920 - y + 20} style={{position: 'absolute', left: 0, top: y}}>
    <defs>
      <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} />
        <stop offset="1" stopColor="#8E5A2E" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1080} height={1940 - y} fill="url(#floorG)" />
    {Array.from({length: 13}, (_, i) => {
      const xb = -400 + i * 160;
      return <path key={i} d={`M${540 + (xb - 540) * 0.25} 0 L ${xb} ${1940 - y}`} stroke="#8A5530" strokeWidth={3} opacity={0.55} />;
    })}
    {Array.from({length: 7}, (_, i) => {
      const yy = Math.pow(i / 6, 1.6) * (1940 - y);
      return <path key={i} d={`M0 ${yy} H 1080`} stroke="#8A5530" strokeWidth={2} opacity={0.35} />;
    })}
    <rect x={0} y={0} width={1080} height={14} fill="#F5F5F5" />
    <rect x={0} y={14} width={1080} height={4} fill="#000000" opacity={0.2} />
  </svg>
);

// Laboratoire : mur carrelé + plan de travail + placards + plancher.
export const Lab: React.FC<{floor?: number; wall?: string}> = ({floor = 1460, wall = '#CFE8F3'}) => (
  <>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: wall,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.75) 3px, transparent 3px), linear-gradient(90deg, rgba(255,255,255,0.75) 3px, transparent 3px)',
        backgroundSize: '90px 90px',
      }}
    />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.35), rgba(0,0,0,0.12) 80%)'}} />
    {/* étagère avec fioles */}
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <rect x={640} y={640} width={360} height={14} rx={4} fill="#8D6E63" stroke={INK} strokeWidth={3} />
      {[
        [670, '#81D4FA'],
        [740, '#A5D6A7'],
        [810, '#FFCC80'],
        [890, '#CE93D8'],
      ].map(([x, c], i) => (
        <g key={i}>
          <path d={`M${x} ${560 + (i % 2) * 20} h 30 v 20 q 22 20 22 40 q 0 20 -37 20 q -37 0 -37 -20 q 0 -20 22 -40 Z`} fill="#FFFFFF" fillOpacity={0.6} stroke={INK} strokeWidth={3} />
          <path d={`M${(x as number) - 13} ${620 + (i % 2) * 10} q 28 -8 56 0 q 0 16 -28 16 q -28 0 -28 -16 Z`} fill={c as string} />
        </g>
      ))}
    </svg>
    <WoodFloor y={floor} />
  </>
);

// Rivière australienne en coupe : berge herbeuse, terre en strates, eau translucide.
export const GROUND_Y = 1300;
export const Creek: React.FC<{frame: number; dusk?: number; underwater?: boolean}> = ({frame, dusk = 0, underwater = false}) => {
  const sky1 = interpolateColors(dusk, [0, 1], ['#7EC8EF', '#6A4C9C']);
  const sky2 = interpolateColors(dusk, [0, 1], ['#E8F6FC', '#FFB38A']);
  if (underwater) {
    return (
      <>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#5CC6EE 0%, #1E88C8 40%, #0B4F7D 100%)'}} />
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {/* rayons de lumière */}
          {[120, 380, 640, 900].map((x, i) => (
            <path key={x} d={`M${x} 0 L ${x + 120} 0 L ${x + 260 + Math.sin(frame * 0.02 + i) * 30} 1500 L ${x + 60} 1500 Z`} fill="#FFFFFF" opacity={0.07} />
          ))}
          {/* galets et herbes */}
          <path d="M-20 1760 Q 300 1700 540 1740 Q 800 1700 1100 1760 L 1100 1940 L -20 1940 Z" fill="#6D5644" />
          {[[90, 1770, 60], [300, 1760, 44], [520, 1780, 70], [760, 1765, 50], [980, 1775, 64]].map(([x, y, r], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={r} ry={r * 0.55} fill="#8D7B6A" stroke={INK} strokeWidth={3} />
              <ellipse cx={x - r * 0.3} cy={y - r * 0.2} rx={r * 0.35} ry={r * 0.15} fill="#B5A493" opacity={0.7} />
            </g>
          ))}
          {Array.from({length: 9}, (_, i) => (
            <path key={i} d={`M${40 + i * 125} 1760 Q ${40 + i * 125 + 40 * Math.sin(frame * 0.05 + i)} 1580 ${50 + i * 125} ${1420 + (i % 3) * 60}`} stroke={i % 2 ? '#2E7D32' : '#43A047'} strokeWidth={12} fill="none" strokeLinecap="round" />
          ))}
          {Array.from({length: 16}, (_, i) => {
            const y = 1880 - ((frame * 3 + i * 130) % 1450);
            return (
              <g key={i}>
                <circle cx={(i * 137) % 1080} cy={y} r={6 + (i % 3) * 4} fill="none" stroke="#E1F5FE" strokeWidth={2.5} opacity={0.75} />
                <circle cx={(i * 137) % 1080 - 2} cy={y - 2} r={1.6} fill="#FFFFFF" opacity={0.8} />
              </g>
            );
          })}
        </svg>
      </>
    );
  }
  const G = GROUND_Y;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sky1} 0%, ${sky2} 72%)`}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#59BDE8" />
            <stop offset="1" stopColor="#1A6FA3" />
          </linearGradient>
          <linearGradient id="soilG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A0724A" />
            <stop offset="1" stopColor="#6E4A2C" />
          </linearGradient>
        </defs>
        {/* soleil doux */}
        <circle cx={860} cy={430} r={110} fill="#FFF3C4" opacity={0.5} />
        <circle cx={860} cy={430} r={70} fill="#FFE082" />
        {/* nuages */}
        {[0, 1].map((i) => {
          const x = ((i * 700 + frame * 0.4) % 1500) - 250;
          return (
            <g key={i} transform={`translate(${x} ${580 + i * 130})`}>
              <ellipse cx={0} cy={6} rx={130} ry={36} fill="#FFFFFF" />
              <ellipse cx={-50} cy={-16} rx={60} ry={40} fill="#FFFFFF" />
              <ellipse cx={45} cy={-24} rx={70} ry={46} fill="#FFFFFF" />
              <ellipse cx={0} cy={26} rx={120} ry={12} fill="#DCEAF2" />
            </g>
          );
        })}
        {/* collines lointaines */}
        <path d={`M-20 ${G - 160} Q 200 ${G - 300} 420 ${G - 190} Q 640 ${G - 320} 860 ${G - 200} Q 1000 ${G - 260} 1100 ${G - 180} L 1100 ${G} L -20 ${G} Z`} fill="#9CC48A" opacity={0.7} />
        {/* eucalyptus détaillés */}
        {[[130, 1.1, 1], [930, 0.95, 1], [560, 0.65, 0.55]].map(([x, s, o], i) => (
          <g key={i} transform={`translate(${x} ${G - 60}) scale(${s})`} opacity={o}>
            <path d="M-20 0 Q -12 -200 -8 -390 L 8 -390 Q 14 -200 20 0 Z" fill="#E8DED3" stroke={INK} strokeWidth={3} />
            <path d="M-6 -60 q 6 -40 0 -80 M4 -200 q -6 -40 0 -80" stroke="#BCA996" strokeWidth={4} fill="none" />
            <path d="M-6 -300 Q -60 -340 -90 -380 M6 -320 Q 60 -360 90 -400" stroke="#D7CCC8" strokeWidth={8} fill="none" strokeLinecap="round" />
            {[[-100, -420, 0], [40, -480, 1], [110, -400, 0], [-30, -540, 1], [-130, -500, 1], [90, -520, 0]].map(([dx, dy, k], j) => (
              <g key={j}>
                <ellipse cx={dx} cy={dy} rx={80} ry={44} fill={k ? '#7FA65A' : '#93B96C'} stroke={INK} strokeWidth={3} />
                <ellipse cx={dx - 20} cy={dy - 14} rx={40} ry={14} fill="#B5D48E" opacity={0.6} />
              </g>
            ))}
          </g>
        ))}
        {/* berge : herbe + terre en coupe */}
        <path d={`M-20 ${G - 40} Q 540 ${G - 90} 1100 ${G - 40} L 1100 ${G + 150} L -20 ${G + 150} Z`} fill="url(#soilG)" stroke={INK} strokeWidth={4} />
        <path d={`M-20 ${G - 40} Q 540 ${G - 90} 1100 ${G - 40} L 1100 ${G - 6} Q 540 ${G - 56} -20 ${G - 6} Z`} fill="#7CB342" />
        {Array.from({length: 40}, (_, i) => (
          <path key={i} d={`M${i * 28} ${G - 40 - Math.sin((i / 40) * Math.PI) * 50 + 4} l 4 -18 l 4 18`} stroke={i % 2 ? '#558B2F' : '#8BC34A'} strokeWidth={3} fill="none" />
        ))}
        {Array.from({length: 14}, (_, i) => (
          <ellipse key={i} cx={(i * 83) % 1080} cy={G + 40 + ((i * 47) % 90)} rx={12 + (i % 3) * 6} ry={6} fill="#5A3B22" opacity={0.5} />
        ))}
        {/* roseaux */}
        {[60, 90, 1000, 1030].map((x, i) => (
          <g key={x}>
            <path d={`M${x} ${G + 130} Q ${x + 6 * Math.sin(frame * 0.05 + i)} ${G - 60} ${x + 10} ${G - 160}`} stroke="#6B8E23" strokeWidth={6} fill="none" />
            <ellipse cx={x + 10} cy={G - 150} rx={7} ry={26} fill="#6D4C41" />
          </g>
        ))}
        {/* rivière */}
        <rect x={-20} y={G + 140} width={1120} height={800} fill="url(#waterG)" />
        <rect x={-20} y={G + 140} width={1120} height={10} fill="#BDE7F7" opacity={0.8} />
        {Array.from({length: 9}, (_, i) => (
          <path key={i} d={`M${((i * 170 + frame * 1.1) % 1300) - 100} ${G + 200 + (i % 4) * 110} q 25 -10 50 0 t 50 0`} stroke="#FFFFFF" strokeWidth={4} fill="none" opacity={0.45} />
        ))}
      </svg>
    </>
  );
};
