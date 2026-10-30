import React from 'react';
import {interpolateColors} from 'remotion';
import {StickMan, Pose} from './StickMan';

const INK = '#3A2A20';

// Ouette d'Égypte vue de profil, tournée vers la droite.
// frost : 0..1 (couverte de givre) ; sad : tête basse ; female : un peu plus petite et plus claire.
export const Goose: React.FC<{
  frame: number;
  width?: number;
  walking?: boolean;
  flying?: boolean;
  sad?: boolean;
  frost?: number;
  female?: boolean;
  turnAway?: boolean;
  style?: React.CSSProperties;
}> = ({frame, width = 360, walking = false, flying = false, sad = false, frost = 0, female = false, turnAway = false, style}) => {
  const still = frost > 0.5;
  const t = still ? 0 : frame;
  const ice = (c: string) => interpolateColors(frost, [0, 1], [c, '#DCEBF5']);
  const body = ice(female ? '#D9C3A5' : '#C9AE8A');
  const back = ice('#8D6E63');
  const chest = ice('#E8D9C2');
  const wing = ice('#A0522D');
  const blink = t % 90 < 4 ? 0.15 : 1;
  const bob = walking ? Math.abs(Math.sin(t * 0.35)) * -8 : Math.sin(t * 0.08) * 2;
  const step = walking ? Math.sin(t * 0.35) * 14 : 0;
  const flap = flying ? Math.sin(t * 0.55) * 45 : 0;
  // cou : droit, ou baissé quand il est triste
  const neck = sad ? 'M210 110 Q 250 100 262 140' : 'M205 112 Q 228 60 238 26';
  const head = sad ? {x: 270, y: 150, r: 0} : {x: 248, y: 24, r: 0};
  const dir = turnAway ? -1 : 1;
  return (
    <svg viewBox="-20 -40 340 300" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(0 ${bob})`}>
        {/* pattes roses */}
        {flying ? null : (
          <g stroke={ice('#F48FB1')} strokeWidth={8} strokeLinecap="round" fill="none">
            <path d={`M140 190 l${-step / 2} 44 l-14 6 M${140 - step / 2} 234 l12 6`} />
            <path d={`M170 190 l${step / 2} 44 l-14 6 M${170 + step / 2} 234 l12 6`} />
          </g>
        )}
        {/* queue */}
        <path d="M60 130 L10 112 L30 150 Z" fill={ice('#3E2723')} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {/* corps */}
        <ellipse cx={140} cy={145} rx={95} ry={55} fill={body} stroke={INK} strokeWidth={6} />
        <ellipse cx={190} cy={150} rx={40} ry={40} fill={chest} />
        {/* tache brune sur la poitrine */}
        <ellipse cx={200} cy={150} rx={13} ry={11} fill={ice('#5D4037')} />
        {/* aile (blanche et rousse) */}
        <g transform={`rotate(${-flap} 150 120)`}>
          <path d="M155 112 Q 95 95 50 132 Q 100 175 170 150 Z" fill={back} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M150 120 Q 110 112 82 135 Q 115 150 155 140 Z" fill={ice('#FFFFFF')} />
          <path d="M100 142 Q 80 150 62 136" stroke={wing} strokeWidth={10} fill="none" strokeLinecap="round" />
        </g>
        {/* cou + tête */}
        <path d={neck} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d={neck} stroke={body} strokeWidth={22} fill="none" strokeLinecap="round" />
        <g transform={`translate(${head.x} ${head.y}) scale(${dir} 1)`}>
          <ellipse cx={0} cy={0} rx={30} ry={24} fill={ice('#EFE3D0')} stroke={INK} strokeWidth={5} />
          {/* masque brun autour de l'œil */}
          <ellipse cx={6} cy={-2} rx={14} ry={12} fill={ice('#6D4C41')} />
          {still ? (
            <path d="M0 -2 h12" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          ) : (
            <>
              <circle cx={7} cy={-3} r={6 * blink + 0.5} fill="#FFB300" />
              {blink > 0.5 ? <circle cx={8} cy={-3} r={3} fill={INK} /> : null}
            </>
          )}
          {sad && !still ? <path d="M10 6 q2 8 -2 12" stroke="#81D4FA" strokeWidth={4} fill="none" strokeLinecap="round" /> : null}
          {/* bec rose */}
          <path d="M26 -6 L52 4 L26 12 Z" fill={ice('#F06292')} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>
        {/* givre */}
        {frost > 0
          ? Array.from({length: 10}, (_, i) => (
              <path
                key={i}
                d={`M${70 + (i * 23) % 170} ${100 + (i * 37) % 90} m-8 0 h16 m-8 -8 v16 m-6 -6 l12 12 m0 -12 l-12 12`}
                stroke="#fff"
                strokeWidth={3}
                opacity={frost}
              />
            ))
          : null}
      </g>
    </svg>
  );
};

// Oison (petit de l'ouette), duveteux et rayé.
export const Gosling: React.FC<{frame: number; size?: number; eating?: boolean; peep?: boolean; style?: React.CSSProperties}> = ({
  frame,
  size = 110,
  eating = false,
  peep = false,
  style,
}) => {
  const peck = eating ? Math.max(0, Math.sin(frame * 0.6)) * 18 : 0;
  const hop = peep ? Math.abs(Math.sin(frame * 0.4)) * -6 : 0;
  return (
    <svg viewBox="0 0 120 110" width={size} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(0 ${hop})`}>
        <path d="M50 92 l-4 14 M70 92 l4 14" stroke="#F48FB1" strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={58} cy={68} rx={40} ry={30} fill="#F3E3A2" stroke={INK} strokeWidth={4} />
        <path d="M30 56 Q 58 44 84 56" stroke="#8D6E63" strokeWidth={9} fill="none" strokeLinecap="round" />
        <g transform={`rotate(${peck} 86 50)`}>
          <circle cx={88} cy={40} r={20} fill="#F3E3A2" stroke={INK} strokeWidth={4} />
          <path d="M80 28 Q 90 22 100 30" stroke="#8D6E63" strokeWidth={6} fill="none" strokeLinecap="round" />
          <circle cx={93} cy={38} r={3.5} fill={INK} />
          <path d="M106 38 L118 43 L106 47 Z" fill="#F06292" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
};

// Bonhomme en tenue d'hiver (bonnet + écharpe).
export const Person: React.FC<{frame: number; pose?: Pose; height?: number; walking?: boolean; hat?: string; flip?: boolean}> = ({
  frame,
  pose = 'idle',
  height = 300,
  walking = false,
  hat = '#E53935',
  flip = false,
}) => (
  <div style={{position: 'relative', width: (height * 160) / 330, height, transform: flip ? 'scaleX(-1)' : undefined}}>
    <StickMan frame={frame} pose={pose} height={height} walking={walking} />
    <svg viewBox="0 0 160 330" height={height} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d="M40 30 Q 80 -20 120 30 Z" fill={hat} stroke="#1B1B2F" strokeWidth={8} strokeLinejoin="round" />
      <circle cx={80} cy={2} r={10} fill="#fff" stroke="#1B1B2F" strokeWidth={5} />
      <path d="M58 98 Q 80 112 102 98" stroke={hat} strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d="M96 104 l10 34" stroke={hat} strokeWidth={14} strokeLinecap="round" />
    </svg>
  </div>
);

// Filet (épuisette).
export const Net: React.FC<{size?: number}> = ({size = 260}) => (
  <svg viewBox="0 0 260 300" width={size} style={{overflow: 'visible'}}>
    <path d="M130 140 L130 300" stroke="#8D6E63" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={130} cy={80} rx={110} ry={70} fill="rgba(255,255,255,0.25)" stroke="#5D4037" strokeWidth={10} />
    {Array.from({length: 7}, (_, i) => (
      <path key={`v${i}`} d={`M${40 + i * 30} 20 L${40 + i * 30} 140`} stroke="#fff" strokeWidth={3} opacity={0.7} />
    ))}
    {Array.from({length: 4}, (_, i) => (
      <path key={`h${i}`} d={`M24 ${40 + i * 28} L236 ${40 + i * 28}`} stroke="#fff" strokeWidth={3} opacity={0.7} />
    ))}
  </svg>
);
