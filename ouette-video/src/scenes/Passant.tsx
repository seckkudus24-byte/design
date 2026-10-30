import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../OuetteVideo';
import {useCue} from '../cue';
import {River, Snowfall} from '../characters/Winter';
import {Goose, Gosling, Person} from '../characters/Goose';
import {Basket, Bulb, SoftHeart} from '../characters/Bits';
import {Badge} from '../characters/Props';
import {ColdThermo} from '../characters/Icons';
import {Place, Scene, ramp, usePop} from '../ui';

const BASKET = {x: 860, y: 1390};

export const Passant: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const homme = useCue('homme');
  const compris = useCue('compris');
  const froid = useCue('froid');
  const habitants = useCue('habitants');
  const recuperer = useCue('recuperer');
  const applaudissaient = useCue('applaudissaient');

  const title = usePop(4, 10) * (1 - ramp(frame, homme - 6, homme));
  const walk = ramp(frame, homme, homme + 40);
  const idea = usePop(compris, 10) * (1 - ramp(frame, froid - 6, froid));
  const cold = usePop(froid, 10) * (1 - ramp(frame, habitants - 6, habitants));
  const neighbors = ramp(frame, habitants, habitants + 30);
  const basket = usePop(recuperer - 10, 10);
  // les six poussins rejoignent le panier un par un
  const gap = Math.max(8, (applaudissaient - recuperer) / 6.5);
  const saved = (i: number) => ramp(frame, recuperer + i * gap, recuperer + i * gap + gap * 0.8);
  const count = Array.from({length: 6}, (_, i) => saved(i)).filter((s) => s >= 1).length;
  const clap = frame >= applaudissaient;
  return (
    <Scene bg="#B3D4F0">
      <River frame={frame} snow={1} ice={1} />
      <Snowfall frame={frame} amount={0.6} />
      <Place x={300} y={1290}>
        <Goose frame={frame} width={340} sad />
      </Place>
      {Array.from({length: 6}, (_, i) => {
        const s = saved(i);
        const x = interpolate(s, [0, 1], [180 + i * 110, BASKET.x - 60 + (i % 3) * 50]);
        const y = interpolate(s, [0, 1], [1480 + (i % 2) * 50, BASKET.y - 40]) - Math.sin(s * Math.PI) * 120;
        return (
          <Place key={i} x={x} y={y} scale={1 - s * 0.35}>
            <Gosling frame={frame + i * 7} size={110} />
          </Place>
        );
      })}
      <Place x={BASKET.x} y={BASKET.y} scale={basket}>
        <Basket size={260} />
      </Place>
      <Place x={interpolate(walk, [0, 1], [1250, 700])} y={1180}>
        <Person frame={frame} pose={clap ? 'cheer' : walk >= 1 ? 'point' : 'idle'} walking={walk > 0 && walk < 1} height={320} flip />
      </Place>
      {[0, 1, 2].map((i) => (
        <Place key={i} x={interpolate(neighbors, [0, 1], [-200 - i * 120, 90 + i * 120])} y={1000 + (i % 2) * 30}>
          <Person frame={frame + i * 9} pose={clap ? 'cheer' : 'idle'} walking={neighbors > 0 && neighbors < 1} height={250} hat={['#43A047', '#1E88E5', '#FB8C00'][i]} />
        </Place>
      ))}
      <div style={{position: 'absolute', left: 720, top: 760, transform: `scale(${idea})`}}>
        <Bulb size={130} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 650, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, transform: `scale(${cold})`}}>
        <ColdThermo size={300} level={1} frame={frame} />
        <Badge size={64} color="#B3E5FC">
          TROP FROID !
        </Badge>
      </div>
      {count > 0 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center'}}>
          <Badge size={70}>{count} / 6 AU CHAUD</Badge>
        </div>
      ) : null}
      {clap
        ? [0, 1, 2, 3].map((i) => {
            const t = ((frame + i * 15) % 60) / 60;
            return (
              <div key={i} style={{position: 'absolute', left: 120 + i * 230, top: 1000 - t * 300, opacity: 1 - t}}>
                <SoftHeart size={60} />
              </div>
            );
          })
        : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${title})`}}>
        <Badge size={66}>UN PASSANT AU GRAND CŒUR</Badge>
      </div>
    </Scene>
  );
};
