import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../EiderVideo';
import {useCue} from '../cue';
import {Coast, Eider, Nest} from '../characters/Arctic';
import {eiderOn} from './helpers';
import {NEST} from './Titre';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Jeune: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const semaines = useCue('semaines');
  const mange = useCue('mange');
  const graisse = useCue('graisse');
  const quarante = useCue('40');
  const title = usePop(4, 9) * (1 - ramp(frame, semaines - 6, semaines));
  const week = frame >= semaines ? Math.min(4, 1 + Math.floor((frame - semaines) / 15)) : 0;
  const dusk = frame >= semaines && frame < mange ? (Math.sin((frame - semaines) * 0.2) + 1) / 2 : 0;
  const thin = ramp(frame, graisse, quarante + 20);
  return (
    <Scene bg="#9ECFEA">
      <Coast frame={frame} wind={0.3} dusk={dusk * 0.8} />
      <Place x={NEST.x} y={NEST.y}>
        <Nest width={340} />
      </Place>
      <Place x={NEST.x + 10} y={eiderOn(NEST.y + 10, 380)}>
        <Eider frame={frame} width={380} pose="sit" thin={thin} sleepy={thin > 0.5} />
      </Place>
      <TopBadge s={title} color="#FFCC80">
        UN MOIS DE JEÛNE
      </TopBadge>
      {week > 0 && frame < mange ? (
        <TopBadge s={1} color="#FFFFFF">
          SEMAINE {week}
        </TopBadge>
      ) : null}
      <TopBadge s={usePop(mange, 9) * (1 - ramp(frame, quarante - 6, quarante))} color="#FF8A80">
        PRESQUE RIEN À MANGER
      </TopBadge>
      <TopBadge s={usePop(quarante, 9)} color="#FF8A80" size={84}>
        -40 % !
      </TopBadge>
    </Scene>
  );
};
