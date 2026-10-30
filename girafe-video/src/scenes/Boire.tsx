import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GirafeVideo';
import {useCue} from '../cue';
import {Savanna, Shadow} from '../characters/Savanna';
import {Giraffe, Lion} from '../characters/Giraffe';
import {GROUND, gy} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Boire: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const ecarter = useCue('ecarter');
  const baisser = useCue('baisser');
  const inconfortable = useCue('inconfortable');
  const dangereuse = useCue('dangereuse');
  const predateurs = useCue('predateurs');
  const title = usePop(4, 9) * (1 - ramp(frame, ecarter - 6, ecarter));
  const legs = ramp(frame, ecarter, ecarter + 20) * 0.35;
  const neck = ramp(frame, baisser, baisser + 25) * 0.65;
  const sweat = frame >= inconfortable;
  const danger = usePop(dangereuse, 9);
  const lion = ramp(frame, predateurs - 25, predateurs + 8);
  return (
    <Scene bg="#7EC8F0">
      <Savanna frame={frame} ground={GROUND} water={1} />
      <Shadow x={400} y={GROUND} w={440} />
      <Place x={380} y={gy(1000)}>
        <Giraffe frame={frame} height={1000} drink={Math.max(legs, legs + neck)} />
      </Place>
      {sweat
        ? [0, 1].map((i) => {
            const t = ((frame + i * 15) % 30) / 30;
            return <div key={i} style={{position: 'absolute', left: 640 + i * 60, top: 980 + t * 40, width: 22, height: 30, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#81D4FA', border: '4px solid #16121F', opacity: 1 - t}} />;
          })
        : null}
      {/* le lion qui guette dans les herbes */}
      <Place x={1250 - lion * 380} y={GROUND + 60}>
        <Lion frame={frame} width={300} />
      </Place>
      <TopBadge s={title} color="#81D4FA">
        BOIRE, UN VRAI DÉFI
      </TopBadge>
      <TopBadge s={danger} color="#FF8A80" size={66}>
        TRÈS VULNÉRABLE !
      </TopBadge>
    </Scene>
  );
};
