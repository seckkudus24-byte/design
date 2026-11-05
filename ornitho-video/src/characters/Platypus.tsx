import React from 'react';
import {interpolateColors} from 'remotion';
import {Sun} from '../ui';

export const INK = '#231A14';
const FUR = '#7B5236';
const FUR2 = '#5D3B24';
const BILL = '#3E4A52';

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
  const step = walking ? Math.sin(frame * 0.4) * 10 : swim ? Math.sin(frame * 0.3) * 14 : 0;
  const bob = walking ? Math.abs(Math.sin(frame * 0.4)) * -5 : swim ? Math.sin(frame * 0.1) * 6 : Math.sin(frame * 0.08) * 2;
  const blink = eyesClosed ? 0.12 : frame % 90 < 4 ? 0.15 : 1;
  return (
    <svg viewBox="-60 -60 480 220" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(0 ${bob})`}>
        {/* queue de castor */}
        <g opacity={tail}>
          <path d={`M60 90 Q 10 ${70 + (swim ? step * 0.5 : 0)} -50 ${90 + (swim ? step : 0)} Q -60 120 -40 130 Q 10 128 60 112 Z`} fill={FUR2} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          {[-30, -10, 10, 30].map((x) => (
            <path key={x} d={`M${x} 96 l 6 26`} stroke="#3E2716" strokeWidth={3} />
          ))}
          <path d="M-40 106 Q 10 104 50 102" stroke="#3E2716" strokeWidth={3} fill="none" />
        </g>
        {/* pattes palmées */}
        <g opacity={body}>
          {[
            [90, step],
            [220, -step],
          ].map(([x, s], i) => (
            <g key={i}>
              <path d={`M${x} 118 l ${s * 0.6} 26`} stroke={INK} strokeWidth={16} strokeLinecap="round" />
              <path d={`M${x} 118 l ${s * 0.6} 26`} stroke={FUR2} strokeWidth={9} strokeLinecap="round" />
              <path d={`M${x - 18 + s * 0.6} 150 Q ${x + s * 0.6} 136 ${x + 22 + s * 0.6} 150 Z`} fill="#4E342E" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            </g>
          ))}
          {/* ergot venimeux (patte arrière) */}
          {spur > 0 ? (
            <g opacity={spur}>
              <circle cx={78} cy={132} r={30} fill="#FFEB3B" opacity={0.5} />
              <path d="M84 128 L 60 140 L 82 140 Z" fill="#E0E0E0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            </g>
          ) : null}
          {/* corps de loutre */}
          <path d="M50 90 Q 50 40 130 36 Q 230 30 270 70 Q 290 104 250 122 Q 160 136 80 124 Q 46 118 50 90 Z" fill={FUR} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <path d="M90 104 Q 170 118 250 104" stroke="#9C6E4A" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7} />
          {/* tête */}
          <ellipse cx={278} cy={72} rx={40} ry={34} fill={FUR} stroke={INK} strokeWidth={7} />
          {blink > 0.5 ? (
            <>
              <circle cx={288} cy={60} r={mood === 'surprised' ? 9 : 7} fill={INK} />
              <circle cx={291} cy={57} r={2.5} fill="#FFFFFF" />
            </>
          ) : (
            <path d="M280 60 q 8 5 16 0" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
          )}
        </g>
        {/* bec de canard */}
        <g opacity={bill}>
          <path d="M306 58 Q 380 44 410 64 Q 420 84 400 94 Q 360 104 306 92 Z" fill={BILL} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M310 76 Q 360 80 404 78" stroke="#263238" strokeWidth={4} fill="none" />
          <circle cx={392} cy={64} r={3.5} fill="#263238" />
          {mood === 'happy' ? <path d="M330 90 Q 360 100 392 92" stroke="#90A4AE" strokeWidth={4} fill="none" strokeLinecap="round" /> : null}
        </g>
        {/* coutures */}
        {stitches > 0 ? (
          <g opacity={stitches}>
            <path d="M304 40 L 308 104" stroke="#E53935" strokeWidth={5} strokeDasharray="6 6" />
            {[48, 62, 76, 90].map((y) => (
              <path key={y} d={`M298 ${y} l 16 4`} stroke="#E53935" strokeWidth={4} strokeLinecap="round" />
            ))}
          </g>
        ) : null}
      </g>
    </svg>
  );
};

// Œuf (blanc cassé, comme ceux de l'ornithorynque).
export const Egg: React.FC<{size?: number; crack?: number}> = ({size = 80, crack = 0}) => (
  <svg viewBox="0 0 80 100" width={size} style={{overflow: 'visible'}}>
    <ellipse cx={40} cy={54} rx={32} ry={42} fill="#FFF8E1" stroke={INK} strokeWidth={5} />
    {crack > 0 ? <path d="M14 50 l 10 -8 l 8 10 l 10 -10 l 8 10 l 12 -8" stroke={INK} strokeWidth={4} fill="none" opacity={crack} /> : null}
  </svg>
);

// Rivière australienne : berges, eucalyptus, eau. GROUND_Y = berge ; WATER_Y = surface.
export const GROUND_Y = 1300;
export const Creek: React.FC<{frame: number; dusk?: number; underwater?: boolean}> = ({frame, dusk = 0, underwater = false}) => {
  const sky1 = interpolateColors(dusk, [0, 1], ['#81D4FA', '#7E57C2']);
  const sky2 = interpolateColors(dusk, [0, 1], ['#FFF8E1', '#FFAB91']);
  if (underwater) {
    return (
      <>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#4FC3F7 0%, #0277BD 45%, #01579B 100%)'}} />
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {Array.from({length: 7}, (_, i) => (
            <path key={i} d={`M${i * 170} 1920 Q ${i * 170 + 40 * Math.sin(frame * 0.05 + i)} 1700 ${i * 170 + 10} 1480`} stroke="#2E7D32" strokeWidth={16} fill="none" strokeLinecap="round" />
          ))}
          {Array.from({length: 14}, (_, i) => {
            const y = 1900 - ((frame * 3 + i * 140) % 1400);
            return <circle key={i} cx={(i * 137) % 1080} cy={y} r={8 + (i % 3) * 4} fill="none" stroke="#E1F5FE" strokeWidth={3} opacity={0.7} />;
          })}
          <path d="M-20 1800 Q 540 1740 1100 1800 L 1100 1940 L -20 1940 Z" fill="#8D6E63" />
        </svg>
      </>
    );
  }
  const G = GROUND_Y;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sky1} 0%, ${sky2} 70%)`}} />
      <Sun x={860} y={420} r={75} frame={frame} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[0, 1].map((i) => {
          const x = ((i * 700 + frame * 0.5) % 1500) - 250;
          return (
            <g key={i} transform={`translate(${x} ${560 + i * 130})`} opacity={0.9}>
              <ellipse cx={0} cy={0} rx={120} ry={38} fill="#FFFFFF" />
              <ellipse cx={-50} cy={-20} rx={60} ry={42} fill="#FFFFFF" />
              <ellipse cx={45} cy={-28} rx={70} ry={48} fill="#FFFFFF" />
            </g>
          );
        })}
        {/* eucalyptus */}
        {[[120, 1.1], [920, 0.9], [560, 0.7]].map(([x, s], i) => (
          <g key={i} transform={`translate(${x} ${G - 40}) scale(${s})`} opacity={i === 2 ? 0.6 : 1}>
            <path d="M-18 0 Q -10 -200 -6 -380 L 6 -380 Q 12 -200 18 0 Z" fill="#E0D6CC" stroke={INK} strokeWidth={6} />
            {[[-90, -420], [40, -470], [100, -380], [-30, -520]].map(([dx, dy], k) => (
              <ellipse key={k} cx={dx} cy={dy} rx={90} ry={50} fill={k % 2 ? '#7CB342' : '#9CCC65'} stroke={INK} strokeWidth={5} />
            ))}
          </g>
        ))}
        {/* berge */}
        <path d={`M-20 ${G - 40} Q 540 ${G - 90} 1100 ${G - 40} L 1100 ${G + 120} L -20 ${G + 120} Z`} fill="#A1887F" stroke={INK} strokeWidth={8} />
        <path d={`M-20 ${G - 40} Q 540 ${G - 90} 1100 ${G - 40}`} stroke="#8BC34A" strokeWidth={22} fill="none" />
        {/* rivière */}
        <rect x={-20} y={G + 110} width={1120} height={800} fill="#4FC3F7" stroke={INK} strokeWidth={8} />
        {Array.from({length: 8}, (_, i) => (
          <path key={i} d={`M${((i * 180 + frame * 1.2) % 1300) - 100} ${G + 170 + (i % 4) * 120} q 25 -12 50 0 t 50 0`} stroke="#FFFFFF" strokeWidth={6} fill="none" opacity={0.6} />
        ))}
      </svg>
    </>
  );
};
