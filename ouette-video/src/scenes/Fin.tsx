import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../OuetteVideo';
import {useCue} from '../cue';
import {River, Snowfall} from '../characters/Winter';
import {Goose, Gosling} from '../characters/Goose';
import {SoftHeart} from '../characters/Bits';
import {Badge} from '../characters/Props';
import {Place, Scene, ramp, usePop} from '../ui';

const SPOT = {x: 600, y: 1520};

export const Fin: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const dehors = useCue('dehors');
  const envole = useCue('envole');
  const quelques = useCue('quelques');
  const retourne = useCue('retourne');
  const fige = useCue('fige');
  const disparu = useCue('disparu');

  const title = usePop(4, 10) * (1 - ramp(frame, dehors - 6, dehors));
  const fly = ramp(frame, envole, envole + 35);
  const later = usePop(quelques, 10) * (1 - ramp(frame, retourne - 6, retourne));
  const back = frame >= retourne;
  const land = ramp(frame, retourne, retourne + 30);
  const frost = ramp(frame, fige, fige + 45);
  const memory = usePop(disparu, 14);
  const dusk = back ? 0.6 : 0;
  return (
    <Scene bg="#B3D4F0">
      <River frame={frame} snow={1} ice={1} dusk={dusk} />
      <Snowfall frame={frame} amount={back ? 1 : 0.5} />
      {!back ? (
        <>
          {Array.from({length: 6}, (_, i) => (
            <Place key={i} x={160 + i * 140} y={1460 + (i % 2) * 60}>
              <Gosling frame={frame + i * 7} size={110} />
            </Place>
          ))}
          <Place x={interpolate(fly, [0, 1], [380, 1250])} y={interpolate(fly, [0, 1], [1260, 650])}>
            <Goose frame={frame} width={360} flying={fly > 0} />
          </Place>
        </>
      ) : (
        <>
          <div style={{position: 'absolute', left: SPOT.x - 120, top: SPOT.y - 300, transform: `scale(${memory})`, opacity: 0.85}}>
            <SoftHeart size={240} outline glow={memory} />
          </div>
          <Place x={interpolate(land, [0, 1], [1200, SPOT.x - 120])} y={interpolate(land, [0, 1], [700, SPOT.y - 140])}>
            <Goose frame={frame} width={340} flying={land < 1} sad={land >= 1} frost={frost} />
          </Place>
        </>
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', transform: `scale(${later})`}}>
        <Badge size={60} color="#FFFFFF">
          QUELQUES JOURS PLUS TARD
        </Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${title})`}}>
        <Badge size={66}>LA FIN DE L'HISTOIRE</Badge>
      </div>
    </Scene>
  );
};
