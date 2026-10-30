import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PolatoucheVideo';
import {useCue} from '../cue';
import {Forest} from '../characters/Forest';
import {Birch, Squirrel} from '../characters/Squirrel';
import {StickMan} from '../characters/StickMan';
import {Bubble, Place, Scene, ramp} from '../ui';

export const Discret: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const nuit = useCue('nuit');
  const yeux = useCue('yeux');
  const rarement = useCue('rarement');
  const night = ramp(frame, nuit - 15, nuit + 10);
  const peek = (Math.sin(frame * 0.08) + 1) / 2; // timide : se cache derrière le tronc
  const zoom = 1 + 0.6 * ramp(frame, yeux, yeux + 15) * (1 - ramp(frame, rarement - 8, rarement));
  const search = frame >= rarement;
  return (
    <Scene bg="#0D1B4C">
      <Forest frame={frame} night={night} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '560px 1050px'}}>
        <Place x={interpolate(search ? 0 : peek, [0, 1], [470, 600])} y={1050}>
          <Squirrel frame={frame} width={320} glow={night > 0.5} happy={false} />
        </Place>
        <div style={{position: 'absolute', left: 300, top: 560}}>
          <Birch height={1100} />
        </div>
      </div>
      <Place x={850} y={1480}>
        <StickMan frame={frame} pose={search ? 'point' : 'idle'} height={260} style={{transform: 'scaleX(-1)', filter: night > 0.5 ? 'invert(1)' : undefined}} />
      </Place>
      {search ? <Bubble text="OÙ EST-IL ?" x={560} y={1170} size={58} tail="right" delay={rarement} /> : null}
    </Scene>
  );
};
