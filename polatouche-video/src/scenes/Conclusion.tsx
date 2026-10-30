import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PolatoucheVideo';
import {useCue} from '../cue';
import {Forest} from '../characters/Forest';
import {Birch, Camera, Glider, Squirrel} from '../characters/Squirrel';
import {Badge} from '../characters/Props';
import {StickMan} from '../characters/StickMan';
import {Place, Scene, ramp, usePop} from '../ui';

export const Conclusion: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const croiser = useCue('croiser');
  const yeux = useCue('yeux');
  const photo = useCue('photo');
  const saut = useCue('saut');
  const walk = ramp(frame, 0, croiser + 10);
  const cam = usePop(photo, 9);
  const flash = ramp(frame, saut - 6, saut - 2) * (1 - ramp(frame, saut - 2, saut + 8));
  const gone = frame >= saut - 4;
  const fly = ramp(frame, saut - 4, saut + 30);
  const missed = usePop(saut + 18, 9);
  return (
    <Scene bg="#4FC3F7">
      <Forest frame={frame} />
      <div style={{position: 'absolute', left: 640, top: 600}}>
        <Birch height={1000} />
      </div>
      {gone ? (
        <Place x={interpolate(fly, [0, 1], [760, 1350])} y={interpolate(fly, [0, 1], [900, 700])} rotate={70}>
          <Glider frame={frame} width={260} spread={1} />
        </Place>
      ) : (
        <Place x={790} y={900}>
          <Squirrel frame={frame} width={260} />
        </Place>
      )}
      <Place x={interpolate(walk, [0, 1], [-120, 330])} y={1420}>
        <StickMan frame={frame} pose={frame >= yeux ? 'surprised' : 'idle'} walking={walk > 0 && walk < 1} height={280} />
      </Place>
      <Place x={440} y={1290} scale={cam}>
        <Camera size={150} flash={flash} />
      </Place>
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.8}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, display: 'flex', justifyContent: 'center', transform: `scale(${missed}) rotate(-4deg)`}}>
        <Badge size={84} color="#FF8A80">
          RATÉ !
        </Badge>
      </div>
    </Scene>
  );
};
