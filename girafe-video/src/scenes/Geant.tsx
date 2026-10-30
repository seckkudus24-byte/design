import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GirafeVideo';
import {useCue} from '../cue';
import {Savanna, Shadow} from '../characters/Savanna';
import {Car, Giraffe, Lion, Rhino, Ruler, Zoo} from '../characters/Giraffe';
import {GROUND, gy} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Geant: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const adulte = useCue('adulte');
  const grand = useCue('grand');
  const minuscules = useCue('minuscules');
  const tonnes = useCue('tonnes');
  const zoos = useCue('zoos');
  const title = usePop(4, 9) * (1 - ramp(frame, adulte - 6, adulte));
  const grow = ramp(frame, adulte - 6, adulte + 20);
  const H = 900 + 260 * grow;
  const ruler = ramp(frame, adulte, adulte + 25) * (1 - ramp(frame, grand - 6, grand));
  const king = usePop(grand, 9) * (1 - ramp(frame, minuscules - 6, minuscules));
  const tiny = usePop(minuscules, 9) * (1 - ramp(frame, tonnes - 6, tonnes));
  const car = usePop(tonnes, 9) * (1 - ramp(frame, zoos - 6, zoos));
  const zoo = usePop(zoos, 10);
  return (
    <Scene bg="#7EC8F0">
      <Savanna frame={frame} ground={GROUND} />
      <Shadow x={420} y={GROUND} w={460} />
      <Place x={zoo > 0 ? 330 : 420} y={gy(H)}>
        <Giraffe frame={frame} height={H} />
      </Place>
      <div style={{position: 'absolute', left: 820, top: GROUND - 20 - 1000 * ruler, opacity: ruler > 0 ? 1 : 0}}>
        <Ruler h={1000 * ruler} label="6 M" ticks={6} />
      </div>
      {/* les autres animaux ont l'air minuscules */}
      <Place x={760} y={GROUND - 40} scale={tiny * 0.5}>
        <Lion frame={frame} width={300} />
      </Place>
      <Place x={930} y={GROUND - 40} scale={tiny * 0.45}>
        <Rhino frame={frame} width={340} />
      </Place>
      <Place x={800} y={GROUND - 70} scale={car}>
        <Car width={300} />
      </Place>
      <div style={{position: 'absolute', left: 640, top: GROUND - 700, transform: `scale(${zoo})`, transformOrigin: '50% 100%'}}>
        <Zoo height={700} frame={frame} />
      </div>
      <TopBadge s={title}>PRESQUE 6 MÈTRES</TopBadge>
      <TopBadge s={king} color="#FFD54F" size={60}>
        LE PLUS GRAND DU MONDE
      </TopBadge>
      <TopBadge s={car} size={80}>
        2 TONNES
      </TopBadge>
    </Scene>
  );
};
