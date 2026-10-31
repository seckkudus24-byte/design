import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../LoutreVideo';
import {useCue} from '../cue';
import {Amazon, Otter} from '../characters/River';
import {SURFACE} from './helpers';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Conclusion: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const seule = useCue('seule');
  const ensemble = useCue('ensemble');
  const force = useCue('force');
  const title = usePop(4, 9) * (1 - ramp(frame, seule - 6, seule));
  const group = ramp(frame, ensemble - 6, ensemble + 25);
  return (
    <Scene bg="#81D4FA">
      <Amazon frame={frame} surface={SURFACE} dusk={0.35} />
      <Place x={540} y={SURFACE + 220}>
        <Otter frame={frame} width={420} />
      </Place>
      {[0, 1, 2, 3, 4].map((i) => (
        <Place key={i} x={interpolate(group, [0, 1], [-300 - i * 120, 200 + (i % 3) * 300])} y={SURFACE + 120 + Math.floor(i / 3) * 260 + (i % 2) * 50}>
          <Otter frame={frame + i * 6} width={340} />
        </Place>
      ))}
      <TopBadge s={title} color="#FFFFFF">
        CONCLUSION
      </TopBadge>
      <TopBadge s={usePop(seule, 9) * (1 - ramp(frame, ensemble - 6, ensemble))} color="#BCAAA4">
        SEULE : UNE PROIE
      </TopBadge>
      <TopBadge s={usePop(ensemble, 9) * (1 - ramp(frame, force - 6, force))} color="#FFE082" size={60}>
        ENSEMBLE : DES LOUPS !
      </TopBadge>
      <TopBadge s={usePop(force, 9)} color="#A5D6A7" size={60}>
        L'UNION FAIT LA FORCE
      </TopBadge>
    </Scene>
  );
};
