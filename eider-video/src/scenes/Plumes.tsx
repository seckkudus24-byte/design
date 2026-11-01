import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../EiderVideo';
import {useCue} from '../cue';
import {Coast, Eider, Gull, Nest} from '../characters/Arctic';
import {eiderOn} from './helpers';
import {NEST} from './Titre';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Plumes: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const arracher = useCue("s'arracher");
  const ennemis = useCue('ennemis');
  const pluck = frame >= arracher && frame < ennemis;
  const gull = ramp(frame, ennemis - 15, ennemis + 10);
  return (
    <Scene bg="#9ECFEA">
      <Coast frame={frame} wind={0.4} />
      <Place x={NEST.x} y={NEST.y}>
        <Nest width={340} down={0.5 + ramp(frame, arracher, ennemis) * 0.5} />
      </Place>
      <Place x={NEST.x + 10} y={eiderOn(NEST.y + 10, 380)}>
        <Eider frame={frame} width={380} pose="sit" plucking={pluck} />
      </Place>
      <Place x={700 - (1 - gull) * -500} y={NEST.y - 160 + (1 - gull) * -300} flip>
        <Gull frame={frame} width={240} flying={gull < 1} />
      </Place>
      <TopBadge s={usePop(arracher, 9) * (1 - ramp(frame, ennemis - 6, ennemis))} color="#ECEFF1">
        ELLE S'ARRACHE LES PLUMES
      </TopBadge>
      <TopBadge s={usePop(ennemis, 9)} color="#FF8A80" size={60}>
        À CÔTÉ DE SES ENNEMIS !
      </TopBadge>
    </Scene>
  );
};
