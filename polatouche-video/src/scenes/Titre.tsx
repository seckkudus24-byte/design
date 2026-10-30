import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PolatoucheVideo';
import {useCue} from '../cue';
import {Forest} from '../characters/Forest';
import {Glider} from '../characters/Squirrel';
import {Badge} from '../characters/Props';
import {StickMan} from '../characters/StickMan';
import {Bubble, Place, Scene, ramp, usePop} from '../ui';

export const Titre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const russie = useCue('russie');
  const planer = useCue('planer');
  const para = useCue('parachutiste');
  const badge = usePop(russie, 9) * (1 - ramp(frame, planer - 6, planer));
  // vol plané en boucle d'un arbre à l'autre
  const t = ((frame + 20) % 70) / 70;
  const fly = frame >= planer - 10;
  const gx = interpolate(t, [0, 1], [-120, 1200]);
  const gy = 820 + t * 520 - Math.sin(t * Math.PI) * 120;
  return (
    <Scene first bg="#4FC3F7">
      <Forest frame={frame} />
      {fly ? (
        <Place x={gx} y={gy} rotate={70}>
          <Glider frame={frame} width={300} spread={ramp(frame, planer - 10, planer + 5)} />
        </Place>
      ) : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', transform: `scale(${badge})`}}>
        <Badge size={90}>RUSSIE</Badge>
      </div>
      <Place x={160} y={1380}>
        <StickMan frame={frame} pose={frame >= para ? 'surprised' : 'point'} height={280} />
      </Place>
      {frame >= para ? <Bubble text="?!" x={200} y={1080} size={76} delay={para} /> : null}
    </Scene>
  );
};
