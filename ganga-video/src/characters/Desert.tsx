import React from 'react';
import {Sun} from '../ui';

// Décor : ciel brûlant, dunes, rivière au loin, sol de sable.
export const Desert: React.FC<{
  frame: number;
  horizon?: number;
  sky?: string;
  river?: boolean;
  sunX?: number;
  sunY?: number;
  scroll?: number;
  heat?: boolean;
}> = ({frame, horizon = 1180, sky = 'linear-gradient(#FF8F00 0%, #FFCA28 45%, #FFE082 100%)', river = true, sunX = 860, sunY = 760, scroll = 0, heat = true}) => {
  const dune = (y: number, amp: number, len: number, off: number) => {
    let d = `M -200 ${y}`;
    for (let x = -200; x <= 1300; x += 20) {
      d += ` L ${x} ${y - Math.max(0, Math.sin(((x + off) / len) * Math.PI * 2)) * amp - Math.sin(((x + off) / (len * 0.37)) * Math.PI) * amp * 0.15}`;
    }
    return `${d} L 1300 1920 L -200 1920 Z`;
  };
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: sky}} />
      <Sun x={sunX} y={sunY} r={95} frame={frame} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {river ? (
          <>
            <path d={dune(horizon - 40, 70, 900, scroll * 0.2)} fill="#E9B872" />
            <path d={`M -20 ${horizon - 30} Q 300 ${horizon - 50} 600 ${horizon - 28} T 1100 ${horizon - 36} L 1100 ${horizon - 8} Q 700 ${horizon - 2} 400 ${horizon - 14} T -20 ${horizon - 6} Z`} fill="#4FC3F7" stroke="#0288D1" strokeWidth={4} />
          </>
        ) : (
          <path d={dune(horizon - 40, 90, 900, scroll * 0.2)} fill="#E9B872" />
        )}
        <path d={dune(horizon + 40, 110, 1300, scroll * 0.5 + 400)} fill="#E0A458" />
        <path d={`M -20 ${horizon + 60} L 1100 ${horizon + 60} L 1100 1920 L -20 1920 Z`} fill="#F2C987" />
        {/* cailloux et petits buissons secs */}
        {[120, 420, 760, 980].map((x, i) => {
          const xx = ((x - scroll) % 1300 + 1300) % 1300 - 110;
          return (
            <g key={i} transform={`translate(${xx} ${horizon + 160 + (i % 2) * 280})`}>
              <path d="M0 0 l-18 -40 M0 0 l0 -48 M0 0 l18 -40 M0 0 l-30 -22 M0 0 l30 -22" stroke="#8D6E63" strokeWidth={6} strokeLinecap="round" />
              <ellipse cx={60} cy={4} rx={22} ry={12} fill="#BDBDBD" stroke="#5D4037" strokeWidth={4} />
            </g>
          );
        })}
        {/* ondulations de chaleur */}
        {heat
          ? [0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M ${200 + i * 300} ${horizon - 120 - ((frame * 2 + i * 60) % 260)} q 15 -20 0 -40 q -15 -20 0 -40`}
                stroke="#fff"
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                opacity={0.45 * (1 - ((frame * 2 + i * 60) % 260) / 260)}
              />
            ))
          : null}
      </svg>
    </>
  );
};
