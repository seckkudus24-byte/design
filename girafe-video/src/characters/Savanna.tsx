import React from 'react';
import {interpolateColors} from 'remotion';
import {Sun} from '../ui';

// Savane : ciel, nuages qui défilent, collines, acacias, herbe. water = point d'eau ; dusk = soir.
export const Savanna: React.FC<{frame: number; ground?: number; water?: number; dusk?: number}> = ({frame, ground = 1500, water = 0, dusk = 0}) => {
  const sky1 = interpolateColors(dusk, [0, 1], ['#7EC8F0', '#FF8A65']);
  const sky2 = interpolateColors(dusk, [0, 1], ['#E1F5FE', '#FFE0B2']);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sky1} 0%, ${sky2} 70%)`}} />
      <Sun x={880} y={620 + dusk * 300} r={75} frame={frame} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[
          {y: 520, s: 1, v: 0.5, o: 0},
          {y: 720, s: 0.7, v: 0.35, o: 600},
          {y: 900, s: 0.85, v: 0.45, o: 1000},
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
        <path d={`M-20 ${ground - 90} Q 270 ${ground - 170} 540 ${ground - 100} T 1100 ${ground - 120} L 1100 ${ground} L -20 ${ground} Z`} fill="#C5D98A" />
        <path d={`M-20 ${ground - 40} Q 330 ${ground - 90} 700 ${ground - 50} T 1100 ${ground - 60} L 1100 ${ground} L -20 ${ground} Z`} fill="#D9C27A" />
        {[
          [140, ground - 30, 0.9],
          [930, ground - 50, 0.7],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M0 0 L4 -200 M4 -150 Q -40 -190 -80 -200 M4 -170 Q 50 -210 90 -215" stroke="#5D4037" strokeWidth={18} fill="none" strokeLinecap="round" />
            <ellipse cx={4} cy={-225} rx={150} ry={42} fill="#7CB342" />
            <ellipse cx={4} cy={-212} rx={150} ry={22} fill="#558B2F" opacity={0.5} />
          </g>
        ))}
        <rect x={-20} y={ground} width={1120} height={1920 - ground} fill="#E8C872" />
        <rect x={-20} y={ground} width={1120} height={14} fill="#C9A85A" />
        {water > 0 ? <ellipse cx={720} cy={ground + 70} rx={300 * water} ry={60 * water} fill="#4FC3F7" stroke="#0288D1" strokeWidth={6} /> : null}
        {Array.from({length: 18}, (_, i) => {
          const x = (i * 157) % 1080;
          const y = ground + 60 + ((i * 97) % 340);
          const sw = Math.sin(frame * 0.08 + i) * 5;
          return <path key={i} d={`M${x} ${y} l${-8 + sw} -34 M${x} ${y} l${sw} -44 M${x} ${y} l${8 + sw} -34`} stroke="#B8860B" strokeWidth={5} strokeLinecap="round" />;
        })}
      </svg>
    </>
  );
};

// Ombre portée au sol.
export const Shadow: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.06, width: w, height: w * 0.12, borderRadius: '50%', background: 'rgba(0,0,0,0.18)'}} />
);
