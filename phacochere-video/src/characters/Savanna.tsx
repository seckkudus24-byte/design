import React from 'react';
import {interpolateColors} from 'remotion';
import {Sun} from '../ui';

const INK = '#2B1E14';

// Phacochère vu de profil, tourné vers la droite.
// lying : couché sur le côté (pattes vers le spectateur) ; pale : anémié ; blissful : yeux fermés, aux anges.
export const Warthog: React.FC<{
  frame: number;
  width?: number;
  lying?: number;
  walking?: boolean;
  pale?: number;
  blissful?: boolean;
  wary?: boolean;
  // tiques accrochées à la peau (coordonnées du dessin) ; s = taille (0 = absente), full = gorgée de sang
  ticks?: {x: number; y: number; s: number; full?: number}[];
  style?: React.CSSProperties;
}> = ({frame, width = 520, lying = 0, walking = false, pale = 0, blissful = false, wary = false, ticks = [], style}) => {
  const body = interpolateColors(pale, [0, 1], ['#8D7B6A', '#C9BFB5']);
  const dark = interpolateColors(pale, [0, 1], ['#6E5D4E', '#A99E93']);
  const leg = (x: number, phase: number) => {
    const swing = walking ? Math.sin(frame * 0.4 + phase) * 14 : 0;
    return (
      <g transform={`rotate(${swing} ${x + 12} 190)`}>
        <rect x={x} y={180} width={26} height={70} rx={10} fill={dark} stroke={INK} strokeWidth={5} />
        <path d={`M${x - 2} 246 h30`} stroke={INK} strokeWidth={8} strokeLinecap="round" />
      </g>
    );
  };
  const tail = blissful ? Math.sin(frame * 0.5) * 30 : Math.sin(frame * 0.15) * 8;
  const blink = frame % 80 < 4 ? 0.12 : 1;
  return (
    <svg viewBox="-30 -30 420 300" width={width} style={{overflow: 'visible', ...style}}>
      {/* couché : tout le corps bascule sur le côté */}
      <g transform={`translate(0 ${lying * 60}) rotate(${-lying * 12} 200 200)`}>
        <g transform={`translate(0 ${lying * -10})`}>
          {lying < 0.5 ? (
            <>
              {leg(70, Math.PI)}
              {leg(230, 0)}
            </>
          ) : null}
          {/* queue dressée avec son pompon */}
          <g transform={`rotate(${tail} 40 120)`}>
            <path d="M40 120 Q 20 80 22 30" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
            <path d="M40 120 Q 20 80 22 30" stroke={dark} strokeWidth={5} fill="none" strokeLinecap="round" />
            <path d="M22 30 l-10 -20 M22 30 l0 -24 M22 30 l10 -20" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          </g>
          <ellipse cx={160} cy={140} rx={125} ry={70} fill={body} stroke={INK} strokeWidth={6} />
          {/* crinière */}
          <path d="M70 80 l10 -26 l12 22 l12 -28 l12 26 l14 -28 l12 26 l14 -26 l10 30" fill={dark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          {lying < 0.5 ? (
            <>
              {leg(100, 0)}
              {leg(255, Math.PI)}
            </>
          ) : (
            // pattes repliées vers le spectateur
            [100, 140, 210, 250].map((x, i) => (
              <rect key={i} x={x} y={190} width={24} height={46} rx={10} fill={dark} stroke={INK} strokeWidth={5} transform={`rotate(${-20 + i * 8} ${x + 12} 190)`} />
            ))
          )}
          {/* tête */}
          <path d="M250 70 Q 330 60 360 120 L 372 168 Q 360 186 330 180 Q 280 185 250 160 Z" fill={body} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <ellipse cx={366} cy={170} rx={16} ry={18} fill="#B07A6A" stroke={INK} strokeWidth={5} />
          <circle cx={362} cy={166} r={3} fill={INK} />
          <circle cx={372} cy={170} r={3} fill={INK} />
          {/* défenses */}
          <path d="M340 168 Q 330 130 350 112" stroke="#FFF8E1" strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d="M340 168 Q 330 130 350 112" stroke={INK} strokeWidth={3} fill="none" />
          {/* verrues */}
          <ellipse cx={318} cy={124} rx={10} ry={8} fill={dark} stroke={INK} strokeWidth={4} />
          <ellipse cx={296} cy={150} rx={9} ry={7} fill={dark} stroke={INK} strokeWidth={4} />
          {/* oreille */}
          <path d="M262 74 L 250 30 L 288 66 Z" fill={dark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          {/* œil */}
          {blissful ? (
            <path d="M286 98 q12 10 24 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx={298} cy={98} rx={wary ? 12 : 10} ry={(wary ? 12 : 10) * blink} fill="#fff" stroke={INK} strokeWidth={4} />
              {blink > 0.5 ? <circle cx={wary ? 304 : 301} cy={98} r={4.5} fill={INK} /> : null}
              {wary ? <path d="M282 82 l30 8" stroke={INK} strokeWidth={5} strokeLinecap="round" /> : null}
            </>
          )}
          {blissful ? <circle cx={280} cy={128} r={10} fill="#F48FB1" opacity={0.6} /> : null}
          {ticks.map((t, i) =>
            t.s > 0.01 ? (
              <g key={i} transform={`translate(${t.x - 20 * t.s} ${t.y - 20 * t.s})`}>
                <Tick size={40 * t.s} full={t.full ?? 0} frame={frame + i * 5} />
              </g>
            ) : null,
          )}
        </g>
      </g>
    </svg>
  );
};

// Mangouste rayée. standing = dressée sur ses pattes arrière (sentinelle).
export const Mongoose: React.FC<{
  frame: number;
  width?: number;
  standing?: boolean;
  walking?: boolean;
  sniffing?: boolean;
  eating?: boolean;
  alarm?: boolean;
  style?: React.CSSProperties;
}> = ({frame, width = 220, standing = false, walking = false, sniffing = false, eating = false, alarm = false, style}) => {
  const fur = '#A1887F';
  const band = '#5D4037';
  const step = walking ? Math.sin(frame * 0.6) * 12 : 0;
  const sniff = sniffing ? Math.sin(frame * 1.1) * 3 : 0;
  const chew = eating ? Math.abs(Math.sin(frame * 0.8)) * 6 : 0;
  if (standing) {
    return (
      <svg viewBox="0 0 160 260" width={width * 0.7} style={{overflow: 'visible', ...style}}>
        <path d="M70 230 Q 20 250 10 200" stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d="M70 230 Q 20 250 10 200" stroke={fur} strokeWidth={8} fill="none" strokeLinecap="round" />
        <ellipse cx={80} cy={160} rx={36} ry={72} fill={fur} stroke={INK} strokeWidth={5} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M50 ${125 + i * 22} q30 8 60 0`} stroke={band} strokeWidth={6} fill="none" strokeLinecap="round" />
        ))}
        <path d="M60 120 l-14 26 M100 120 l14 26" stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <ellipse cx={82} cy={66} rx={32} ry={28} fill={fur} stroke={INK} strokeWidth={5} />
        <path d="M108 60 L134 70 L108 80 Z" fill={fur} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={134} cy={70} r={5} fill={INK} />
        <circle cx={68} cy={44} r={9} fill={fur} stroke={INK} strokeWidth={4} />
        <circle cx={96} cy={58} r={6} fill="#fff" stroke={INK} strokeWidth={3} />
        <circle cx={98} cy={58} r={3} fill={INK} />
        {alarm ? <path d="M100 86 q6 10 14 0" fill="#EF5350" stroke={INK} strokeWidth={3} /> : null}
      </svg>
    );
  }
  return (
    <svg viewBox="-20 0 260 130" width={width} style={{overflow: 'visible', ...style}}>
      <path d={`M40 80 Q -10 ${70 + Math.sin(frame * 0.2) * 10} -15 ${40 + Math.sin(frame * 0.2) * 10}`} stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d={`M40 80 Q -10 ${70 + Math.sin(frame * 0.2) * 10} -15 ${40 + Math.sin(frame * 0.2) * 10}`} stroke={fur} strokeWidth={9} fill="none" strokeLinecap="round" />
      {[60, 80, 140, 160].map((x, i) => (
        <path key={x} d={`M${x} 92 l${(i % 2 ? -1 : 1) * step} 30`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      ))}
      <ellipse cx={110} cy={78} rx={74} ry={26} fill={fur} stroke={INK} strokeWidth={5} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${66 + i * 16} 56 q4 22 0 42`} stroke={band} strokeWidth={6} fill="none" strokeLinecap="round" />
      ))}
      <g transform={`translate(${sniff} ${chew * 0.4})`}>
        <ellipse cx={188} cy={66} rx={28} ry={22} fill={fur} stroke={INK} strokeWidth={5} />
        <path d={`M210 56 L240 ${70 + chew * 0.3} L210 ${80 + chew * 0.5} Z`} fill={fur} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={240} cy={70} r={5} fill={INK} />
        <circle cx={178} cy={46} r={8} fill={fur} stroke={INK} strokeWidth={4} />
        <circle cx={198} cy={60} r={5.5} fill="#fff" stroke={INK} strokeWidth={3} />
        <circle cx={200} cy={60} r={3} fill={INK} />
        {sniffing
          ? [0, 1, 2].map((i) => {
              const t = ((frame + i * 6) % 18) / 18;
              return <path key={i} d={`M${248 + t * 20} ${56 + i * 10} q6 -4 12 0`} stroke="#fff" strokeWidth={4} fill="none" opacity={1 - t} strokeLinecap="round" />;
            })
          : null}
      </g>
    </svg>
  );
};

// Tique. full : 0 = plate, 1 = gorgée de sang.
export const Tick: React.FC<{size?: number; full?: number; frame?: number; hooks?: boolean}> = ({size = 60, full = 0, frame = 0, hooks = false}) => {
  const body = interpolateColors(full, [0, 1], ['#6D4C41', '#B71C1C']);
  const r = 22 + full * 14;
  const wiggle = Math.sin(frame * 0.6) * 5;
  return (
    <svg viewBox="-60 -60 120 120" width={size} height={size} style={{overflow: 'visible'}}>
      {[-1, 1].map((s) =>
        [0, 1, 2, 3].map((i) => (
          <path key={`${s}${i}`} d={`M${s * 10} ${-8 + i * 7} q${s * 18} ${-6 + wiggle * (i % 2 ? 1 : -1) * 0.3} ${s * 28} ${4 + i * 6}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        )),
      )}
      <ellipse cx={0} cy={6} rx={r * 0.8} ry={r} fill={body} stroke={INK} strokeWidth={4} />
      <ellipse cx={0} cy={-r + 2} rx={8} ry={7} fill="#3E2723" stroke={INK} strokeWidth={3} />
      {hooks ? <path d="M-5 -30 l-4 -10 l6 4 M5 -30 l4 -10 l-6 4" stroke={INK} strokeWidth={3} fill="none" strokeLinejoin="round" /> : null}
      <ellipse cx={-6} cy={0} rx={4} ry={7} fill="#fff" opacity={0.35} />
    </svg>
  );
};

// Lion (prédateur), tourné vers la gauche.
export const Lion: React.FC<{frame: number; width?: number; scared?: boolean; style?: React.CSSProperties}> = ({frame, width = 320, scared = false, style}) => {
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
    </svg>
  );
};

// Décor de savane : ciel, soleil, herbes dorées, acacias.
export const Savanna: React.FC<{frame: number; ground?: number; mud?: number}> = ({frame, ground = 1380, mud = 0}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#FFB74D 0%, #FFE0B2 60%)'}} />
    <Sun x={860} y={720} r={80} frame={frame} />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <path d={`M-20 ${ground - 60} Q 300 ${ground - 120} 600 ${ground - 70} T 1100 ${ground - 80} L 1100 ${ground} L -20 ${ground} Z`} fill="#D4A55A" opacity={0.7} />
      {[
        [170, ground - 40, 1],
        [880, ground - 60, 0.8],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M0 0 L4 -200 M4 -150 Q -40 -190 -80 -200 M4 -170 Q 50 -210 90 -215" stroke="#5D4037" strokeWidth={18} fill="none" strokeLinecap="round" />
          <ellipse cx={4} cy={-225} rx={150} ry={42} fill="#7CB342" stroke="#33691E" strokeWidth={7} />
        </g>
      ))}
      <rect x={-20} y={ground} width={1120} height={1920 - ground} fill="#E6C068" />
      <path d={`M-20 ${ground} L 1100 ${ground}`} stroke="#B08850" strokeWidth={10} />
      {mud > 0 ? <ellipse cx={540} cy={ground + 180} rx={380 * mud} ry={90 * mud} fill="#6D4C41" stroke={INK} strokeWidth={6} /> : null}
      {Array.from({length: 22}, (_, i) => {
        const x = (i * 157) % 1080;
        const y = ground + 40 + ((i * 97) % 420);
        const sw = Math.sin(frame * 0.08 + i) * 6;
        return <path key={i} d={`M${x} ${y} l${-8 + sw} -36 M${x} ${y} l${sw} -46 M${x} ${y} l${8 + sw} -36`} stroke="#B8860B" strokeWidth={5} strokeLinecap="round" />;
      })}
    </svg>
  </>
);
