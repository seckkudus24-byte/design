import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GirafeVideo';
import {useCue} from '../cue';
import {Savanna, Shadow} from '../characters/Savanna';
import {Bus, Giraffe} from '../characters/Giraffe';
import {Zzz} from '../characters/Icons';
import {GROUND, gy} from '../layout';
import {Bubble, Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Dormir: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const immense = useCue('immense');
  const sommeil = useCue('sommeil');
  const droit = useCue('droit');
  const tanguer = useCue('tanguer');
  const bus = useCue('bus');
  const title = usePop(4, 9) * (1 - ramp(frame, immense - 6, immense));
  const sleepy = frame >= sommeil;
  const sway = ramp(frame, tanguer - 6, tanguer + 10);
  const busPop = usePop(bus, 9);
  return (
    <Scene bg="#7EC8F0">
      <Savanna frame={frame} ground={GROUND} dusk={ramp(frame, sommeil - 20, sommeil + 20) * 0.6} />
      <Shadow x={470} y={GROUND} w={320} />
      <Place x={460} y={gy(900)} rotate={Math.sin(frame * 0.09) * 6 * sway}>
        <Giraffe frame={frame} height={900} baby sleepy={sleepy} sway={sway} />
      </Place>
      {sleepy ? (
        <div style={{position: 'absolute', left: 560, top: 640}}>
          <Zzz frame={frame} size={150} />
        </div>
      ) : null}
      {frame >= droit && frame < tanguer ? (
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <path d="M560 1060 L560 760" stroke="#16121F" strokeWidth={10} strokeDasharray="18 12" />
        </svg>
      ) : null}
      <Place x={800} y={1180} scale={busPop}>
        <Bus width={300} frame={frame} />
      </Place>
      {busPop > 0.5 ? <Bubble text="COMME DANS LE BUS !" x={420} y={360} size={52} delay={bus} tail="right" /> : null}
      <TopBadge s={title} color="#B39DDB">
        IL NE SAIT PAS DORMIR
      </TopBadge>
    </Scene>
  );
};
