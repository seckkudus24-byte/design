import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../TetardsVideo';
import {useCue} from '../cue';
import {Eggs, Frog, Pond, Swarm, Tadpole} from '../characters/Pond';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Depart: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const dizaines = useCue('dizaines');
  const millier = useCue('millier', 1); // « un millier » (pas « dizaines de milliers »)
  const quittent = useCue('quittent');
  const annees = useCue('annees');
  const adultes = useCue('adultes');
  const naissance = useCue('naissance');
  const title = usePop(4, 9) * (1 - ramp(frame, dizaines - 6, dizaines));
  const shrink = ramp(frame, millier - 6, millier + 20);
  const count = interpolate(shrink, [0, 1], [60, 6]);
  const hop = ramp(frame, quittent, quittent + 40);
  const years = usePop(annees, 9) * (1 - ramp(frame, adultes - 6, adultes));
  const adult = usePop(adultes, 10);
  const eggs = usePop(naissance, 9);
  return (
    <Scene bg="#8FD3F7">
      <Pond frame={frame} warm={0.4} />
      {frame < quittent ? <Swarm frame={frame} cx={540} cy={980} count={count} spread={280} legs={1} tail={0.5} /> : null}
      {/* les petites grenouilles sautent vers la forêt */}
      {frame >= quittent && frame < adultes
        ? Array.from({length: 5}, (_, i) => {
            const t = Math.min(1, Math.max(0, hop * 1.4 - i * 0.08));
            return (
              <Place key={i} x={interpolate(t, [0, 1], [500 + i * 50, -100 + i * 40])} y={interpolate(t, [0, 1], [700, 520]) - Math.abs(Math.sin(t * Math.PI * 4)) * 70}>
                <Tadpole frame={frame} size={70} legs={1} tail={0} />
              </Place>
            );
          })
        : null}
      <Place x={interpolate(ramp(frame, adultes, adultes + 30), [0, 1], [-150, 300])} y={560} scale={adult}>
        <Frog frame={frame} size={220} jump={Math.abs(Math.sin(frame * 0.2)) * (frame < adultes + 30 ? 1 : 0)} />
      </Place>
      <Place x={360} y={760} scale={eggs}>
        <Eggs size={240} />
      </Place>
      <TopBadge s={title} color="#A5D6A7">
        LE GRAND DÉPART
      </TopBadge>
      <TopBadge s={usePop(millier, 9) * (1 - ramp(frame, quittent - 6, quittent))} color="#FF8A80" size={60}>
        ~1 000 SURVIVANTS
      </TopBadge>
      <TopBadge s={years} color="#FFFFFF">
        PLUSIEURS ANNÉES…
      </TopBadge>
      <TopBadge s={eggs} color="#FFE082" size={60}>
        LA BOUCLE EST BOUCLÉE
      </TopBadge>
    </Scene>
  );
};
