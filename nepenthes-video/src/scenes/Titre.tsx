import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../NepenthesVideo';
import {useCue} from '../cue';
import {Jungle, Toilet, Treeshrew} from '../characters/Jungle';
import {StickMan} from '../characters/StickMan';
import {Bubble, Place, Scene, ramp, usePop} from '../ui';

export const Titre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const besoins = useCue('besoins');
  const chaise = useCue('chaise');
  const toilet = usePop(chaise, 9);
  const peek = ramp(frame, besoins, besoins + 15);
  return (
    <Scene first bg="#81D4FA">
      <Jungle frame={frame} />
      <Place x={600} y={1260} scale={toilet}>
        <Toilet size={330} />
      </Place>
      <Place x={300 + peek * 60} y={1460} flip>
        <Treeshrew frame={frame} width={260} />
      </Place>
      <Place x={150} y={1150}>
        <StickMan frame={frame} pose={frame >= chaise ? 'surprised' : 'idle'} height={260} />
      </Place>
      {frame >= chaise ? <Bubble text="?!" x={180} y={880} size={76} delay={chaise} /> : null}
    </Scene>
  );
};
