import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PhacochereVideo';
import {useCue} from '../cue';
import {Mongoose, Savanna, Warthog} from '../characters/Savanna';
import {Badge} from '../characters/Props';
import {hogPoint} from '../spots';
import {Bubble, Place, Scene, ramp, usePop} from '../ui';

export const Titre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const afrique = useCue('afrique');
  const couchent = useCue('couchent');
  const masser = useCue('masser');
  const mangoustes = useCue('mangoustes');
  const walk = ramp(frame, 0, couchent);
  const lying = ramp(frame, couchent, couchent + 15);
  const badge = usePop(afrique, 9) * (1 - ramp(frame, couchent - 4, couchent + 4));
  const run = ramp(frame, mangoustes - 4, mangoustes + 20);
  const W = 640;
  const cx = interpolate(walk, [0, 1], [-200, 540]);
  return (
    <Scene first bg="#FFB74D">
      <Savanna frame={frame} />
      <Place x={cx} y={1250}>
        <Warthog frame={frame} width={W} lying={lying} walking={walk > 0 && walk < 1} blissful={frame >= masser} />
      </Place>
      {[0, 1, 2].map((i) => {
        const p = hogPoint([120, 190, 250][i], [90, 85, 110][i], 540, 1250, W, 1);
        return (
          <Place key={i} x={interpolate(run, [0, 1], [-200 - i * 150, p.x])} y={interpolate(run, [0, 1], [1550, p.y - 30])} rotate={run >= 1 ? -12 : 0}>
            <Mongoose frame={frame + i * 7} width={230} walking={run < 1} sniffing={run >= 1} />
          </Place>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 650, display: 'flex', justifyContent: 'center', transform: `scale(${badge})`}}>
        <Badge size={90}>AFRIQUE</Badge>
      </div>
      {frame >= masser ? <Bubble text="AHHH…" x={640} y={940} size={66} delay={masser} /> : null}
    </Scene>
  );
};
