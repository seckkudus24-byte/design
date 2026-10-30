import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PhacochereVideo';
import {useCue} from '../cue';
import {Mongoose, Savanna, Warthog} from '../characters/Savanna';
import {Badge, Heart} from '../characters/Props';
import {StickMan} from '../characters/StickMan';
import {Bubble, Place, Scene, usePop} from '../ui';

export const Blague: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const pourtant = useCue('pourtant');
  const partenariats = useCue('partenariats');
  const duo = usePop(partenariats, 9);
  const laugh = frame < pourtant;
  return (
    <Scene bg="#FFB74D">
      <Savanna frame={frame} />
      <Place x={170} y={1420} rotate={laugh ? Math.sin(frame * 0.8) * 8 : 0}>
        <StickMan frame={frame} pose={laugh ? 'cheer' : 'surprised'} height={280} />
      </Place>
      {laugh ? <Bubble text="HA HA !" x={200} y={1100} size={70} delay={4} /> : <Bubble text="?!" x={210} y={1100} size={76} delay={pourtant} />}
      <Place x={560} y={1290} scale={duo}>
        <Warthog frame={frame} width={480} />
      </Place>
      <Place x={880} y={1440} scale={duo} flip>
        <Mongoose frame={frame} width={220} />
      </Place>
      <div style={{position: 'absolute', left: 700, top: 1080, transform: `scale(${duo * (1 + Math.sin(frame * 0.3) * 0.08)})`}}>
        <Heart size={110} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${duo})`}}>
        <Badge size={74}>PARTENAIRES !</Badge>
      </div>
    </Scene>
  );
};
