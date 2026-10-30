import React from 'react';
import {interpolateColors} from 'remotion';
import {Moon, Sun} from '../ui';
import {Pine} from './Squirrel';

// Décor de taïga sibérienne. night : 0 = jour, 1 = nuit ; snow : 0..1 (neige au sol et sur les sapins).
export const Forest: React.FC<{frame: number; night?: number; snow?: number; ground?: number; trees?: boolean}> = ({
  frame,
  night = 0,
  snow = 0,
  ground = 1480,
  trees = true,
}) => {
  const sky1 = interpolateColors(night, [0, 1], ['#4FC3F7', '#0D1B4C']);
  const sky2 = interpolateColors(night, [0, 1], ['#B3E5FC', '#283593']);
  const groundCol = interpolateColors(snow, [0, 1], [interpolateColors(night, [0, 1], ['#7CB342', '#2E4D2A']), interpolateColors(night, [0, 1], ['#FFFFFF', '#C5CAE9'])]);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sky1} 0%, ${sky2} 75%)`}} />
      {night < 0.5 ? <Sun x={900} y={720} r={70} frame={frame} /> : <Moon x={880} y={720} r={70} bg={sky1} />}
      {night > 0
        ? Array.from({length: 26}, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: (i * 389) % 1060 + 10,
                top: 560 + ((i * 233) % 620),
                width: 9,
                height: 9,
                borderRadius: 5,
                background: '#FFF9C4',
                opacity: night * (0.5 + 0.5 * Math.sin(frame * 0.2 + i)),
              }}
            />
          ))
        : null}
      {/* collines au loin */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d={`M-20 ${ground - 180} Q 270 ${ground - 300} 540 ${ground - 200} T 1100 ${ground - 230} L 1100 ${ground} L -20 ${ground} Z`} fill={interpolateColors(night, [0, 1], ['#81C784', '#1B3A2A'])} opacity={0.7} />
      </svg>
      {trees
        ? [
            {x: 60, h: 700, o: 0.85},
            {x: 330, h: 560, o: 0.7},
            {x: 760, h: 620, o: 0.75},
            {x: 1010, h: 760, o: 0.85},
          ].map((t, i) => (
            <div key={i} style={{position: 'absolute', left: t.x - t.h / 6, top: ground - t.h + 20, opacity: t.o, filter: night > 0.5 ? 'brightness(0.55)' : undefined}}>
              <Pine height={t.h} snow={snow} />
            </div>
          ))
        : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: ground, bottom: 0, background: groundCol, borderTop: `10px solid ${interpolateColors(snow, [0, 1], ['#558B2F', '#B0BEC5'])}`}} />
    </>
  );
};

// Flocons qui tombent.
export const Snowfall: React.FC<{frame: number; amount?: number}> = ({frame, amount = 1}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: Math.round(60 * amount)}, (_, i) => {
      const x = ((i * 173) % 1080) + Math.sin(frame * 0.05 + i) * 30;
      const y = (((i * 311) % 1920) + frame * (3 + (i % 4))) % 1920;
      return <circle key={i} cx={x} cy={y} r={5 + (i % 3) * 3} fill="#fff" opacity={0.85} />;
    })}
  </svg>
);
