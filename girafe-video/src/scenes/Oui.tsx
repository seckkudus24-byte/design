import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GirafeVideo';
import {useCue} from '../cue';
import {Savanna, Shadow} from '../characters/Savanna';
import {Giraffe} from '../characters/Giraffe';
import {StickMan} from '../characters/StickMan';
import {GROUND, gy} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Oui: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const humains = useCue('humains');
  const etranges = useCue('etranges');
  const people = ramp(frame, humains - 10, humains + 15);
  const odd = usePop(etranges, 9);
  return (
    <Scene bg="#7EC8F0">
      <Savanna frame={frame} ground={GROUND} />
      <Shadow x={330} y={GROUND} w={300} />
      <Place x={310} y={gy(900)}>
        <Giraffe frame={frame} height={900} baby />
      </Place>
      {/* humains plus petits que le girafon */}
      {[0, 1, 2].map((i) => (
        <Place key={i} x={640 + i * 140 + (1 - people) * 500} y={GROUND - 165}>
          <StickMan frame={frame + i * 7} pose={frame >= humains ? 'surprised' : 'idle'} height={330} walking={people > 0 && people < 1} />
        </Place>
      ))}
      <TopBadge s={usePop(humains, 9) * (1 - ramp(frame, etranges - 6, etranges))}>PLUS GRAND QUE NOUS !</TopBadge>
      <TopBadge s={odd} color="#FFFFFF">
        ET CE N'EST QUE LE DÉBUT…
      </TopBadge>
    </Scene>
  );
};
