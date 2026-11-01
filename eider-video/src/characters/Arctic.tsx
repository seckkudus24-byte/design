import React from 'react';
import {interpolateColors} from 'remotion';
import {Sun} from '../ui';

const INK = '#2B2420';

// Maman eider de profil, tournée vers la droite.
// pose : 'sit' (couve), 'stand', 'swim' ; call = bec ouvert qui appelle ; thin = 0..1 (amaigrie).
export const Eider: React.FC<{
  frame: number;
  width?: number;
  pose?: 'sit' | 'stand' | 'swim';
  call?: boolean;
  thin?: number;
  plucking?: boolean;
  sleepy?: boolean;
  walking?: boolean;
  style?: React.CSSProperties;
}> = ({frame, width = 360, pose = 'sit', call = false, thin = 0, plucking = false, sleepy = false, walking = false, style}) => {
  const bodyRy = 62 * (1 - thin * 0.3);
  const bodyRx = 110 * (1 - thin * 0.15);
  const bob = pose === 'swim' ? Math.sin(frame * 0.12) * 4 : walking ? Math.abs(Math.sin(frame * 0.4)) * -6 : 0;
  const pluck = plucking ? Math.max(0, Math.sin(frame * 0.4)) : 0;
  const blink = sleepy ? 0.15 : frame % 85 < 4 ? 0.15 : 1;
  const open = call ? 6 + Math.abs(Math.sin(frame * 0.5)) * 8 : 0;
  const step = walking ? Math.sin(frame * 0.4) * 12 : 0;
  return (
    <svg viewBox="-40 -80 380 240" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(0 ${bob})`}>
        {pose === 'stand' ? (
          <g stroke="#7E8B6A" strokeWidth={8} strokeLinecap="round" fill="none">
            <path d={`M130 150 l${-step / 2} 40 l-14 4`} />
            <path d={`M170 150 l${step / 2} 40 l-14 4`} />
          </g>
        ) : null}
        {/* queue */}
        <path d="M40 92 L-10 80 L10 112 Z" fill="#5D4037" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {/* corps brun rayé */}
        <ellipse cx={140} cy={100} rx={bodyRx} ry={bodyRy} fill="#8D6E52" stroke={INK} strokeWidth={6} />
        {Array.from({length: 7}, (_, i) => (
          <path key={i} d={`M${70 + i * 24} ${70 + (i % 2) * 6} q 8 ${bodyRy * 0.6} 0 ${bodyRy * 1.1}`} stroke="#5D4033" strokeWidth={5} fill="none" opacity={0.7} />
        ))}
        <path d="M70 80 Q 140 50 210 80" stroke="#A1887F" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
        {/* tête en coin, bec long */}
        <g transform={`translate(230 ${52 + pluck * 50}) rotate(${pluck * 60})`}>
          <path d="M-30 30 Q -40 -30 10 -36 Q 40 -36 44 0 L 86 28 Q 60 36 34 30 Z" fill="#8D6E52" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M44 4 L 92 ${26} L 40 ${26 + open} Z`} fill="#7E8B6A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          {open > 0 ? <path d={`M44 14 L 86 27 L 42 ${24 + open} Z`} fill="#C62828" /> : null}
          <ellipse cx={12} cy={-12} rx={6} ry={6 * blink} fill={INK} />
          <path d="M2 -22 q10 -4 20 0" stroke="#5D4033" strokeWidth={4} fill="none" />
        </g>
        {/* petites plumes de duvet arrachées */}
        {plucking
          ? [0, 1, 2].map((i) => {
              const t = ((frame + i * 14) % 42) / 42;
              return <ellipse key={i} cx={210 + t * 60 + i * 10} cy={120 + t * 90 - Math.sin(t * Math.PI) * 30} rx={9} ry={6} fill="#ECEFF1" stroke="#B0BEC5" strokeWidth={2} opacity={1 - t} />;
            })
          : null}
        {/* cri : ondes sonores */}
        {call
          ? [0, 1, 2].map((i) => {
              const t = ((frame + i * 10) % 30) / 30;
              return <path key={i} d={`M${340 + t * 70} ${20 - t * 40} q ${30 + t * 20} ${40 + t * 30} 0 ${80 + t * 60}`} stroke="#fff" strokeWidth={7} fill="none" opacity={1 - t} />;
            })
          : null}
      </g>
    </svg>
  );
};

// Caneton duveteux, tourné vers la droite.
export const Duckling: React.FC<{frame: number; size?: number; walking?: boolean; style?: React.CSSProperties}> = ({frame, size = 100, walking = false, style}) => {
  const hop = walking ? Math.abs(Math.sin(frame * 0.5)) * -8 : Math.sin(frame * 0.15) * 2;
  return (
    <svg viewBox="0 0 120 110" width={size} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(0 ${hop})`}>
        <path d="M50 92 l-4 14 M70 92 l4 14" stroke="#7E8B6A" strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={58} cy={68} rx={40} ry={30} fill="#5D4A3A" stroke={INK} strokeWidth={4} />
        <ellipse cx={62} cy={78} rx={24} ry={14} fill="#8D7562" />
        <circle cx={88} cy={40} r={21} fill="#5D4A3A" stroke={INK} strokeWidth={4} />
        <path d="M80 34 q10 -4 18 2" stroke="#D7CCC8" strokeWidth={4} fill="none" />
        <circle cx={93} cy={38} r={3.5} fill="#fff" />
        <circle cx={94} cy={38} r={2} fill={INK} />
        <path d="M106 40 L120 46 L106 50 Z" fill="#7E8B6A" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      </g>
    </svg>
  );
};

// Goéland, en vol ou posé, tourné vers la droite. dive : 0..1 (piqué).
export const Gull: React.FC<{frame: number; width?: number; flying?: boolean; dive?: number; style?: React.CSSProperties}> = ({frame, width = 240, flying = true, dive = 0, style}) => {
  const flap = flying ? Math.sin(frame * 0.4) * 30 * (1 - dive * 0.7) : 0;
  return (
    <svg viewBox="-20 -60 260 160" width={width} style={{overflow: 'visible', transform: `rotate(${dive * 35}deg)`, ...style}}>
      {flying ? (
        <>
          <path d={`M110 40 Q 60 ${-10 - flap} 0 ${10 - flap}`} stroke={INK} strokeWidth={20} fill="none" strokeLinecap="round" />
          <path d={`M110 40 Q 60 ${-10 - flap} 0 ${10 - flap}`} stroke="#B0BEC5" strokeWidth={13} fill="none" strokeLinecap="round" />
          <path d={`M20 ${8 - flap} l-14 4`} stroke={INK} strokeWidth={10} strokeLinecap="round" />
        </>
      ) : (
        <path d="M80 50 l-6 36 M120 50 l6 36" stroke="#F48FB1" strokeWidth={6} strokeLinecap="round" />
      )}
      <ellipse cx={110} cy={45} rx={70} ry={26} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
      <path d="M50 40 L20 30 L30 52 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {!flying ? <path d="M70 30 Q 110 14 150 34 L 150 50 Q 110 40 70 52 Z" fill="#B0BEC5" stroke={INK} strokeWidth={4} /> : null}
      <circle cx={180} cy={28} r={20} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
      <path d="M196 26 L226 32 L196 38 Z" fill="#FFD54F" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={214} cy={33} r={3} fill="#E53935" />
      <circle cx={186} cy={22} r={4} fill="#FFEB3B" stroke={INK} strokeWidth={2} />
      <path d="M180 16 l12 4" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
};

// Renard arctique roux, tourné vers la droite, qui renifle.
export const Fox: React.FC<{frame: number; width?: number}> = ({frame, width = 280}) => {
  const sniff = Math.sin(frame * 0.8) * 3;
  return (
    <svg viewBox="0 0 300 180" width={width} style={{overflow: 'visible'}}>
      <path d={`M60 100 Q 0 ${90 + Math.sin(frame * 0.15) * 10} 10 50`} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d={`M60 100 Q 0 ${90 + Math.sin(frame * 0.15) * 10} 10 50`} stroke="#E07B39" strokeWidth={24} fill="none" strokeLinecap="round" />
      <circle cx={12} cy={50} r={10} fill="#fff" />
      {[90, 120, 190, 220].map((x) => (
        <rect key={x} x={x - 9} y={110} width={18} height={56} rx={8} fill="#B85C2A" stroke={INK} strokeWidth={4} />
      ))}
      <ellipse cx={150} cy={100} rx={95} ry={40} fill="#E07B39" stroke={INK} strokeWidth={6} />
      <g transform={`translate(${sniff} 0)`}>
        <path d="M220 60 L232 26 L246 58 Z M246 58 L262 28 L268 64 Z" fill="#E07B39" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={248} cy={78} rx={36} ry={28} fill="#E07B39" stroke={INK} strokeWidth={6} />
        <path d="M270 70 L300 84 L270 96 Z" fill="#F5E6D3" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={300} cy={84} r={5} fill={INK} />
        <ellipse cx={256} cy={70} rx={4} ry={6} fill={INK} />
      </g>
    </svg>
  );
};

// Nid tapissé de duvet. down : 0..1 (quantité de duvet) ; eggs : nombre d'œufs visibles.
export const Nest: React.FC<{width?: number; down?: number; eggs?: number}> = ({width = 320, down = 1, eggs = 4}) => (
  <svg viewBox="-160 -60 320 120" width={width} style={{overflow: 'visible'}}>
    <ellipse cx={0} cy={20} rx={150} ry={42} fill="#8D7B4A" stroke={INK} strokeWidth={5} />
    {Array.from({length: 16}, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return <path key={i} d={`M${Math.cos(a) * 130} ${20 + Math.sin(a) * 34} l${Math.cos(a) * 20} ${-10}`} stroke="#6B5B30" strokeWidth={5} strokeLinecap="round" />;
    })}
    {Array.from({length: Math.round(18 * down)}, (_, i) => (
      <circle key={i} cx={((i * 53) % 220) - 110} cy={((i * 37) % 40) - 2} r={16} fill="#ECEFF1" opacity={0.95} />
    ))}
    {Array.from({length: eggs}, (_, i) => (
      <ellipse key={i} cx={-60 + i * 40} cy={6 + (i % 2) * 8} rx={20} ry={26} fill="#A5B48A" stroke={INK} strokeWidth={4} />
    ))}
  </svg>
);

export const Quilt: React.FC<{size?: number}> = ({size = 260}) => (
  <svg viewBox="0 0 260 180" width={size} style={{overflow: 'visible'}}>
    <path d="M20 40 Q 130 0 240 40 L 240 150 Q 130 180 20 150 Z" fill="#FFF8E1" stroke={INK} strokeWidth={8} />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${70 + i * 60} 28 L${70 + i * 60} 160`} stroke="#E0C88A" strokeWidth={5} />
    ))}
    <path d="M20 95 Q 130 75 240 95" stroke="#E0C88A" strokeWidth={5} fill="none" />
  </svg>
);

// Côte islandaise : ciel froid, crête (plateau) à gauche, falaise, mer en bas à droite.
// wind = lignes de vent (purement visuelles) ; valley = petite vallée abritée en bas à droite.
export const RIDGE_Y = 1180;
export const SEA_Y = 1640;
export const SHORE_Y = 1360;
export const Coast: React.FC<{frame: number; wind?: number; valley?: number; dusk?: number; shore?: boolean}> = ({frame, wind = 0, valley = 0, dusk = 0, shore = false}) => {
  const sky1 = interpolateColors(dusk, [0, 1], ['#9ECFEA', '#F4A88E']);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sky1} 0%, #EAF4FA 60%)`}} />
      <Sun x={880} y={300} r={60} frame={frame} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* montagnes enneigées au loin */}
        <path d="M-20 1000 L160 760 L300 900 L470 700 L660 920 L820 780 L1100 980 L1100 1100 L-20 1100 Z" fill="#B0BEC5" />
        <path d="M120 810 L160 760 L200 810 Z M430 750 L470 700 L510 750 Z M780 830 L820 780 L860 830 Z" fill="#FFFFFF" />
        {/* mer */}
        <rect x={-20} y={SEA_Y} width={1120} height={1920 - SEA_Y} fill="#2F6E8F" />
        {Array.from({length: 8}, (_, i) => (
          <path key={i} d={`M${((i * 170 + frame * 1.5) % 1200) - 100} ${SEA_Y + 40 + (i % 3) * 70} q 20 -10 40 0 t 40 0`} stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.5} />
        ))}
        {/* vallée abritée */}
        {valley > 0 ? <path d={`M600 ${SEA_Y} Q 760 ${1420} 1100 ${1440} L1100 ${SEA_Y} Z`} fill="#7CB342" opacity={valley} /> : null}
        {shore ? (
          <>
            {/* rivage plat au pied de la falaise, mer à droite */}
            <rect x={680} y={SHORE_Y - 20} width={460} height={700} fill="#2F6E8F" />
            {Array.from({length: 5}, (_, i) => (
              <path key={`s${i}`} d={`M${700 + ((i * 90 + frame * 1.5) % 380)} ${SHORE_Y + 40 + i * 70} q 20 -10 40 0 t 40 0`} stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.5} />
            ))}
            <path d={`M-20 ${SHORE_Y} L 700 ${SHORE_Y} Q 760 ${SHORE_Y + 40} 740 1920 L -20 1920 Z`} fill="#8C8577" stroke={INK} strokeWidth={6} />
            <path d={`M-20 ${SHORE_Y} L 700 ${SHORE_Y}`} stroke="#A9A190" strokeWidth={14} />
            <path d="M-20 600 L 200 640 L 160 1360 L -20 1360 Z" fill="#6D6A5E" stroke={INK} strokeWidth={6} />
          </>
        ) : null}
        {/* crête + falaise */}
        {shore ? null : <path d={`M-20 ${RIDGE_Y} Q 300 ${RIDGE_Y - 40} 600 ${RIDGE_Y} L 680 ${SEA_Y} L -20 ${SEA_Y + 300} Z`} fill="#6D6A5E" stroke={INK} strokeWidth={6} />}
        {shore ? null : <path d={`M-20 ${RIDGE_Y} Q 300 ${RIDGE_Y - 40} 600 ${RIDGE_Y}`} stroke="#9CCC65" strokeWidth={22} fill="none" />}
        {shore
          ? null
          : [[80, 1300], [260, 1420], [420, 1360], [520, 1500]].map(([x, y], i) => (
              <path key={i} d={`M${x} ${y} l40 20 l-20 30`} stroke="#4E4B42" strokeWidth={6} fill="none" />
            ))}
        {/* lignes de vent (visuelles) */}
        {wind > 0
          ? Array.from({length: 6}, (_, i) => {
              const x = ((i * 220 + frame * 14) % 1400) - 200;
              const y = 900 + (i % 3) * 110;
              return <path key={i} d={`M${x} ${y} q 60 -20 120 0 t 120 0 q 30 -30 0 -40`} stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinecap="round" opacity={wind * 0.8} />;
            })
          : null}
      </svg>
    </>
  );
};
