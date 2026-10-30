import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../OuetteVideo';
import {useCue} from '../cue';
import {River, Snowfall} from '../characters/Winter';
import {Goose} from '../characters/Goose';
import {SoftHeart} from '../characters/Bits';
import {Place, Scene, usePop} from '../ui';

export const Titre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const aimes = useCue('aimes');
  const enter = usePop(6, 14);
  const heart = usePop(aimes, 10);
  return (
    <Scene first bg="#B3D4F0">
      <River frame={frame} snow={1} />
      <Snowfall frame={frame} amount={0.6} />
      <Place x={380} y={1180} scale={enter}>
        <Goose frame={frame} width={380} />
      </Place>
      <Place x={720} y={1195} scale={enter} flip>
        <Goose frame={frame + 30} width={350} female />
      </Place>
      <div style={{position: 'absolute', left: 540 - 75, top: 870, transform: `scale(${heart * (1 + Math.sin(frame * 0.18) * 0.06)})`}}>
        <SoftHeart size={150} glow={heart} />
      </div>
    </Scene>
  );
};
