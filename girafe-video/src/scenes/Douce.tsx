import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GirafeVideo';
import {useCue} from '../cue';
import {Savanna, Shadow} from '../characters/Savanna';
import {Giraffe, Lion, Rhino} from '../characters/Giraffe';
import {Hearts, Star} from '../characters/Icons2';
import {GROUND, gy} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Douce: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const calme = useCue('calme');
  const attention = useCue('attention');
  const coup = useCue('coup');
  const rhino = useCue('rhinoceros');
  const lion = useCue('lion');
  const title = usePop(4, 9) * (1 - ramp(frame, calme - 6, calme));
  const peace = frame >= calme && frame < attention;
  const angry = frame >= attention;
  const kick = frame >= coup ? Math.max(0, Math.sin((frame - coup) * 0.35)) * (frame < rhino + 30 ? 1 : 0) : 0;
  const push = ramp(frame, rhino, rhino + 25);
  const flee = ramp(frame, lion + 12, lion + 55);
  const power = usePop(coup, 9);
  return (
    <Scene bg="#7EC8F0">
      <Savanna frame={frame} ground={GROUND} />
      <Shadow x={600} y={GROUND} w={440} />
      <Place x={620} y={gy(1000)}>
        <Giraffe frame={frame} height={1000} angry={angry} kick={kick} />
      </Place>
      <Hearts frame={frame} amount={peace ? 1 : 0} x={760} y={560} />
      {/* le rhinocéros repoussé, sonné */}
      <Place x={interpolate(push, [0, 1], [230, -120])} y={GROUND - 90} scale={frame >= rhino - 10 ? 0.8 : 0} flip>
        <Rhino frame={frame} width={340} dizzy={push > 0} />
      </Place>
      {/* le lion préfère s'enfuir */}
      <Place x={interpolate(flee, [0, 1], [250, -300])} y={GROUND - 80} scale={frame >= lion - 18 ? 0.85 : 0}>
        <Lion frame={frame} width={300} scared />
      </Place>
      <Place x={300} y={GROUND - 200} scale={kick}>
        <Star size={140} />
      </Place>
      <TopBadge s={title} color="#F8BBD0">
        DOUCE… MAIS PAS TROP
      </TopBadge>
      <TopBadge s={power} color="#FF8A80" size={66}>
        COUP DE PATTE PUISSANT !
      </TopBadge>
    </Scene>
  );
};
