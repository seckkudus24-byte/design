import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GangaVideo';
import {useCue} from '../cue';
import {Clock, Ganga, SpiralLens, Tube} from '../characters/Ganga';
import {Desert} from '../characters/Desert';
import {Badge} from '../characters/Props';
import {Place, Scene, Water, ramp, usePop} from '../ui';

export const Eponge: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const poitrine = useCue('poitrine');
  const spirale = useCue('spirale');
  const entre = useCue('entre');
  const balance = useCue('balance');
  const eponge = useCue('eponge');
  const ml = useCue('25');
  const minutes = useCue('15');

  const inWater = ramp(frame, entre, entre + 25);
  const lensIn = usePop(poitrine, 10) * (1 - ramp(frame, ml - 8, ml));
  const lensBig = 1 - ramp(frame, entre, entre + 20);
  const fill = ramp(frame, balance, ml - 10);
  const tube = usePop(ml, 9);
  const tubeFill = ramp(frame, ml, ml + 25) * 0.85;
  const clock = usePop(minutes, 9);
  const turns = interpolate(frame, [minutes, dur], [0, 3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const spongeTag = usePop(eponge, 9) * (1 - ramp(frame, ml - 8, ml));

  // le père : à gauche sur le sable, puis dans l'eau où il se balance
  const gx = interpolate(inWater, [0, 1], [300, 540]);
  const gy = interpolate(inWater, [0, 1], [1330, 1420]);
  return (
    <Scene bg="#FFB300">
      <Desert frame={frame} river={false} sunX={900} sunY={720} />
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: inWater}}>
        <ellipse cx={540} cy={1560} rx={560} ry={150} fill="#4FC3F7" stroke="#0288D1" strokeWidth={8} />
      </svg>
      <Place x={gx} y={gy}>
        <Ganga frame={frame} width={500} rocking={frame >= balance} wet={fill} walking={inWater > 0 && inWater < 1} />
      </Place>
      {inWater > 0 ? (
        <div style={{position: 'absolute', inset: 0, clipPath: 'ellipse(560px 150px at 540px 1560px)', opacity: inWater}}>
          <Water top={1470} frame={frame} color="#29B6F6" opacity={0.75} />
        </div>
      ) : null}
      {/* gros plan sur les plumes en spirale */}
      {lensIn > 0.01 ? (
        <>
          {lensBig > 0.5 ? (
            <svg width={1080} height={1920} style={{position: 'absolute', opacity: lensIn}}>
              <path d={`M 330 1320 L ${540 - 200} 1100 L ${540 + 200} 1100 Z`} fill="#fff" opacity={0.35} />
            </svg>
          ) : null}
          <Place x={interpolate(lensBig, [0, 1], [810, 540])} y={interpolate(lensBig, [0, 1], [870, 850])} scale={lensIn * interpolate(lensBig, [0, 1], [0.6, 1])}>
            <SpiralLens fill={fill} frame={frame} size={560} />
          </Place>
          {frame >= spirale && lensBig > 0.5 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center', transform: `scale(${Math.min(1, (frame - spirale) / 8)})`}}>
              <Badge size={60}>PLUMES EN SPIRALE</Badge>
            </div>
          ) : null}
          <div style={{position: 'absolute', left: 560, top: 1110, transform: `scale(${spongeTag})`}}>
            <Badge size={58} color="#80DEEA" rotate={6}>
              = ÉPONGE !
            </Badge>
          </div>
        </>
      ) : null}
      {/* 25 ml en 15 minutes */}
      <div style={{position: 'absolute', left: 120, top: 700, transform: `scale(${tube})`}}>
        <Tube fill={tubeFill} label="25 ML" height={420} />
      </div>
      <div style={{position: 'absolute', left: 650, top: 730, transform: `scale(${clock})`}}>
        <Clock turns={turns} label="15 MIN" size={290} />
      </div>
    </Scene>
  );
};
