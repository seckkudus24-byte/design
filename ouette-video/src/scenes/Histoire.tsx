import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../OuetteVideo';
import {useCue} from '../cue';
import {River, Snowfall} from '../characters/Winter';
import {Goose} from '../characters/Goose';
import {Crowd, SoftHeart} from '../characters/Bits';
import {Badge} from '../characters/Props';
import {Place, Scene, ramp, usePop} from '../ui';

export const Histoire: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const europe = useCue('europe');
  const vraie = useCue('vraie');
  const milliers = useCue('milliers');
  const eu = usePop(europe, 10) * (1 - ramp(frame, vraie - 6, vraie));
  const vrai = usePop(vraie, 10) * (1 - ramp(frame, milliers - 6, milliers));
  const crowd = usePop(milliers, 12);
  return (
    <Scene bg="#B3D4F0">
      <River frame={frame} snow={1} />
      <Snowfall frame={frame} amount={0.5} />
      <Place x={540} y={1180}>
        <Goose frame={frame} width={400} />
      </Place>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${eu})`}}>
        <Badge size={84} color="#90CAF9">
          EUROPE
        </Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${vrai})`}}>
        <Badge size={76}>HISTOIRE VRAIE</Badge>
      </div>
      <div style={{position: 'absolute', left: 90, top: 1460, transform: `scale(${crowd})`, transformOrigin: '50% 100%'}}>
        <Crowd size={900} frame={frame} />
      </div>
      {[0, 1, 2, 3, 4].map((i) => {
        const t = ((frame + i * 14) % 70) / 70;
        return (
          <div key={i} style={{position: 'absolute', left: 140 + i * 180, top: 1440 - t * 380, opacity: crowd * (1 - t)}}>
            <SoftHeart size={60} />
          </div>
        );
      })}
    </Scene>
  );
};
