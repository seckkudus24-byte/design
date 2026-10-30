import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PhacochereVideo';
import {useCue} from '../cue';
import {Mongoose, Savanna, Tick, Warthog} from '../characters/Savanna';
import {Badge, Heart} from '../characters/Props';
import {Bubble, Place, Scene, ramp, usePop} from '../ui';

export const Mutualisme: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const langue = useCue('langue');
  const comprennent = useCue('comprennent');
  const manger = useCue('manger');
  const sante = useCue('sante');
  const mutualisme = useCue('mutualisme');
  const talk = frame >= langue && frame < comprennent;
  const heart = usePop(comprennent, 9) * (1 - ramp(frame, manger - 4, manger + 4));
  const food = usePop(manger, 9) * (1 - ramp(frame, sante - 4, sante + 4));
  const health = usePop(sante, 9) * (1 - ramp(frame, mutualisme - 4, mutualisme + 4));
  const big = usePop(mutualisme, 8);
  return (
    <Scene bg="#FFB74D">
      <Savanna frame={frame} />
      <Place x={420} y={1270}>
        <Warthog frame={frame} width={560} />
      </Place>
      <Place x={840} y={1440} flip>
        <Mongoose frame={frame} width={240} eating={frame >= manger && frame < sante} />
      </Place>
      {talk ? (
        <>
          <Bubble text="GROUIK ?" x={250} y={960} size={58} delay={langue} />
          <Bubble text="KIIK ?" x={720} y={1160} size={58} tail="right" delay={langue + 8} />
        </>
      ) : null}
      <div style={{position: 'absolute', left: 540 - 80, top: 900, transform: `scale(${heart * (1 + Math.sin(frame * 0.3) * 0.08)})`}}>
        <Heart size={160} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, transform: `scale(${food})`}}>
        <Tick size={110} frame={frame} />
        <Badge size={64}>À MANGER</Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', transform: `scale(${health})`}}>
        <Badge size={60} color="#A5D6A7">
          SANTÉ + SÉCURITÉ
        </Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${big}) rotate(${Math.sin(frame * 0.2) * 3}deg)`}}>
        <Badge size={96}>MUTUALISME</Badge>
      </div>
    </Scene>
  );
};
