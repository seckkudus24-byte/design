import React from 'react';

const INK = '#1B1B2F';

export type Pose = 'idle' | 'wave' | 'point' | 'surprised' | 'cheer' | 'worried' | 'thumbs';

const deg = (d: number) => (d * Math.PI) / 180;

// Bonhomme bâton narrateur. Les angles des bras partent de "bras le long du corps" (0°).
export const StickMan: React.FC<{
  frame: number;
  pose?: Pose;
  height?: number;
  walking?: boolean;
  style?: React.CSSProperties;
}> = ({frame, pose = 'idle', height = 340, walking = false, style}) => {
  const wiggle = Math.sin(frame * 0.4);
  let left = -20;
  let right = 20;
  switch (pose) {
    case 'wave':
      right = 150 + wiggle * 25;
      break;
    case 'point':
      right = 95 + wiggle * 3;
      left = -25;
      break;
    case 'surprised':
      left = -150 - wiggle * 5;
      right = 150 + wiggle * 5;
      break;
    case 'cheer':
      left = -160 - wiggle * 18;
      right = 160 + wiggle * 18;
      break;
    case 'worried':
      left = -140;
      right = 140;
      break;
    case 'thumbs':
      right = 120;
      break;
    default:
      left = -18 + wiggle * 4;
      right = 18 - wiggle * 4;
  }
  const sx = 80;
  const sy = 120;
  const L = 78;
  const arm = (a: number) => [sx + Math.sin(deg(a)) * L, sy + Math.cos(deg(a)) * L];
  const [lx, ly] = arm(left);
  const [rx, ry] = arm(right);
  const step = walking ? Math.sin(frame * 0.4) * 22 : 0;
  const bounce = walking ? Math.abs(Math.sin(frame * 0.4)) * -8 : pose === 'cheer' ? Math.abs(wiggle) * -14 : 0;

  const mouth =
    pose === 'surprised' ? (
      <ellipse cx={80} cy={70} rx={9} ry={12} fill={INK} />
    ) : pose === 'worried' ? (
      <path d="M66 74 q14 -12 28 0" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : (
      <path d="M62 64 Q80 84 98 64" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
    );

  return (
    <svg viewBox="0 0 160 330" height={height} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(0 ${bounce})`}>
        <line x1={80} y1={92} x2={80} y2={210} stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <line x1={80} y1={210} x2={50 + step} y2={315} stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <line x1={80} y1={210} x2={110 - step} y2={315} stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <line x1={sx} y1={sy} x2={lx} y2={ly} stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <line x1={sx} y1={sy} x2={rx} y2={ry} stroke={INK} strokeWidth={12} strokeLinecap="round" />
        {pose === 'thumbs' ? (
          <g>
            <circle cx={rx} cy={ry} r={12} fill="#fff" stroke={INK} strokeWidth={6} />
            <line x1={rx} y1={ry - 8} x2={rx} y2={ry - 30} stroke={INK} strokeWidth={10} strokeLinecap="round" />
          </g>
        ) : null}
        <circle cx={80} cy={52} r={42} fill="#fff" stroke={INK} strokeWidth={10} />
        <circle cx={66} cy={46} r={pose === 'surprised' ? 7 : 5.5} fill={INK} />
        <circle cx={94} cy={46} r={pose === 'surprised' ? 7 : 5.5} fill={INK} />
        {pose === 'worried' ? (
          <path d="M56 32 l16 6 M104 32 l-16 6" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        ) : null}
        {mouth}
      </g>
    </svg>
  );
};
