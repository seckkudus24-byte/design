import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../NepenthesVideo';
import {useCue} from '../cue';
import {Jungle, Toilet, Treeshrew} from '../characters/Jungle';
import {Badge} from '../characters/Props';
import {Bubble, Place, Scene, ramp, usePop} from '../ui';

export const Rituel: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const borneo = useCue('borneo');
  const toupaye = useCue('toupaye');
  const ecureuil = useCue('mini-ecureuil');
  const matin = useCue('matin', 1);
  const toilettes = useCue('toilettes');
  const title = usePop(4, 9) * (1 - ramp(frame, borneo - 6, borneo));
  const place = usePop(borneo, 9) * (1 - ramp(frame, toupaye - 6, toupaye));
  const enter = ramp(frame, toupaye - 6, toupaye + 15);
  const name = usePop(toupaye, 9) * (1 - ramp(frame, ecureuil - 6, ecureuil));
  const mini = usePop(ecureuil, 9) * (1 - ramp(frame, matin - 6, matin));
  const sunrise = ramp(frame, matin, matin + 40);
  const run = ramp(frame, toilettes, toilettes + 30);
  return (
    <Scene bg="#81D4FA">
      <Jungle frame={frame} sunrise={sunrise} />
      <Place x={interpolate(enter, [0, 1], [-200, 420]) + run * 800} y={1450}>
        <Treeshrew frame={frame} width={380} walking={(enter > 0 && enter < 1) || run > 0} />
      </Place>
      {frame >= toilettes ? (
        <div style={{position: 'absolute', left: 860, top: 1220, opacity: 0.9}}>
          <Toilet size={160} />
        </div>
      ) : null}
      {frame >= toilettes ? <Bubble text="URGENT !" x={300} y={1150} size={64} delay={toilettes} /> : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${title})`}}>
        <Badge size={60}>LE RITUEL SECRET DU MATIN</Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${place})`}}>
        <Badge size={84} color="#A5D6A7">
          BORNÉO
        </Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${name})`}}>
        <Badge size={84}>LE TOUPAYE</Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', transform: `scale(${mini})`}}>
        <Badge size={64} color="#FFFFFF">
          MINI-ÉCUREUIL AU MUSEAU POINTU
        </Badge>
      </div>
    </Scene>
  );
};
