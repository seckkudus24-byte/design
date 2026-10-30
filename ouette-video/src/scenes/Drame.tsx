import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../OuetteVideo';
import {useCue} from '../cue';
import {River, Snowfall} from '../characters/Winter';
import {Goose, Gosling} from '../characters/Goose';
import {SoftHeart} from '../characters/Bits';
import {Badge} from '../characters/Props';
import {Place, Scene, ramp, usePop} from '../ui';

const SPOT = {x: 620, y: 1560};

export const Drame: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const hiver = useCue('hiver');
  const gele = useCue('gele');
  const inconnue = useCue('inconnue');
  const prisonniere = useCue('prisonniere');
  const reste = useCue('reste');
  const jours = useCue('jours');
  const attendait = useCue('attendait');

  const title = usePop(4, 10) * (1 - ramp(frame, hiver - 6, hiver));
  const snow = ramp(frame, hiver - 10, hiver + 20);
  const ice = ramp(frame, gele - 10, gele + 25);
  const mystery = usePop(inconnue, 10) * (1 - ramp(frame, prisonniere - 6, prisonniere));
  // la femelle disparaît doucement sous la glace (silhouette pâle)
  const under = ramp(frame, prisonniere, prisonniere + 30);
  const babies = usePop(reste, 12);
  // les jours passent : le ciel s'assombrit et s'éclaircit
  const days = frame >= jours ? Math.min(5, 1 + Math.floor((frame - jours) / 20)) : 0;
  const dusk = frame >= jours ? (Math.sin((frame - jours) * 0.16 - Math.PI / 2) + 1) / 2 : 0;
  const wait = usePop(attendait, 12);
  return (
    <Scene bg="#B3D4F0">
      <River frame={frame} snow={snow} ice={ice} dusk={dusk * 0.8} />
      <Snowfall frame={frame} amount={snow} />
      {/* la femelle, au début sur l'eau, puis sous la glace */}
      <div style={{position: 'absolute', inset: 0, opacity: 1 - under * 0.75, filter: under > 0 ? `grayscale(${under}) brightness(${1 + under * 0.3})` : undefined}}>
        <Place x={interpolate(under, [0, 1], [760, SPOT.x])} y={interpolate(under, [0, 1], [1290, SPOT.y])} flip>
          <Goose frame={frame} width={330} female sad={under > 0.5} />
        </Place>
      </div>
      {under > 0 ? (
        <svg width={1080} height={1920} style={{position: 'absolute', opacity: under * 0.55}}>
          <ellipse cx={SPOT.x} cy={SPOT.y} rx={220} ry={90} fill="#D6ECF7" />
        </svg>
      ) : null}
      <Place x={330} y={1270}>
        <Goose frame={frame} width={380} sad={frame >= prisonniere} />
      </Place>
      {Array.from({length: 6}, (_, i) => (
        <Place key={i} x={120 + i * 150} y={1420 + (i % 2) * 60} scale={babies}>
          <Gosling frame={frame + i * 7} size={110} />
        </Place>
      ))}
      <div style={{position: 'absolute', left: SPOT.x - 70, top: SPOT.y - 260, transform: `scale(${wait * (1 + Math.sin(frame * 0.15) * 0.05)})`}}>
        <SoftHeart size={140} outline />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${title})`}}>
        <Badge size={66} color="#B3E5FC">
          LE DRAME SOUS LA GLACE
        </Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${mystery})`}}>
        <Badge size={90} color="#FFFFFF">
          ?
        </Badge>
      </div>
      {days > 0 && wait < 0.5 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center'}}>
          <Badge size={70} color="#FFFFFF">
            JOUR {days}
          </Badge>
        </div>
      ) : null}
    </Scene>
  );
};
