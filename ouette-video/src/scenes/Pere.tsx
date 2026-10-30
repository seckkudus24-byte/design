import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../OuetteVideo';
import {useCue} from '../cue';
import {Home, River, Snowfall} from '../characters/Winter';
import {Goose, Gosling, Net, Person} from '../characters/Goose';
import {BrokenHeart, Cloud} from '../characters/Bits';
import {Badge} from '../characters/Props';
import {Place, Scene, ramp, usePop} from '../ui';

export const Pere: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const approcher = useCue('approcher');
  const perdre = useCue('perdre');
  const filet = useCue('filet');
  const chez = useCue('chez');
  const mangeaient = useCue('mangeaient');
  const refusait = useCue('refusait');
  const souffrir = useCue('souffrir');

  const title = usePop(4, 10) * (1 - ramp(frame, approcher - 10, approcher - 2));
  const indoor = frame >= chez;
  // dehors : l'homme s'approche, le père recule
  const step = ramp(frame, approcher - 10, approcher + 30);
  const backOff = ramp(frame, approcher, approcher + 30);
  const broken = usePop(perdre, 10) * (1 - ramp(frame, filet - 6, filet));
  const net = ramp(frame, filet, filet + 25);
  // dedans : la famille au chaud
  const babiesIn = usePop(chez + 10, 12);
  const eat = frame >= mangeaient;
  const refuse = frame >= refusait;
  const cloud = usePop(souffrir, 12);
  const warm = usePop(chez, 10) * (1 - ramp(frame, mangeaient - 6, mangeaient));
  return (
    <Scene bg="#B3D4F0">
      {indoor ? (
        <>
          <Home frame={frame} />
          <Place x={330} y={1360}>
            <Goose frame={frame} width={360} sad={refuse} turnAway={refuse} />
          </Place>
          {/* gamelle de graines */}
          <svg width={1080} height={1920} style={{position: 'absolute'}}>
            <ellipse cx={600} cy={1560} rx={150} ry={34} fill="#90A4AE" stroke="#3A2A20" strokeWidth={7} />
            {Array.from({length: 12}, (_, i) => (
              <ellipse key={i} cx={480 + i * 20} cy={1548 - (i % 3) * 6} rx={8} ry={5} fill="#D7A86E" />
            ))}
          </svg>
          {Array.from({length: 6}, (_, i) => (
            <Place key={i} x={500 + (i % 3) * 110 - (i >= 3 ? 50 : 0)} y={1480 + (i >= 3 ? 90 : 0)} scale={babiesIn}>
              <Gosling frame={frame + i * 7} size={110} eating={eat} />
            </Place>
          ))}
          <div style={{position: 'absolute', left: 200, top: 880, transform: `scale(${cloud})`}}>
            <Cloud size={260} frame={frame} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', transform: `scale(${warm})`}}>
            <Badge size={70}>AU CHAUD</Badge>
          </div>
        </>
      ) : (
        <>
          <River frame={frame} snow={1} ice={1} />
          <Snowfall frame={frame} amount={0.6} />
          <Place x={interpolate(backOff, [0, 1], [420, 640])} y={1290} flip={backOff > 0 && backOff < 1}>
            <Goose frame={frame} width={360} sad={frame >= perdre} walking={backOff > 0 && backOff < 1} />
          </Place>
          <Place x={interpolate(step, [0, 1], [-150, 180])} y={1190}>
            <Person frame={frame} pose={frame >= filet ? 'point' : 'idle'} walking={step > 0 && step < 1} height={320} />
          </Place>
          <div style={{position: 'absolute', left: interpolate(net, [0, 1], [180, 520]), top: interpolate(net, [0, 1], [900, 1060]), opacity: net > 0 ? 1 : 0, transform: `rotate(${interpolate(net, [0, 1], [-40, 10])}deg)`}}>
            <Net size={260} />
          </div>
          <div style={{position: 'absolute', left: 600, top: 950, transform: `scale(${broken})`}}>
            <BrokenHeart size={150} split={ramp(frame, perdre + 10, perdre + 30)} />
          </div>
        </>
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${title})`}}>
        <Badge size={62}>UN PÈRE QUI REFUSE DE PARTIR</Badge>
      </div>
    </Scene>
  );
};
