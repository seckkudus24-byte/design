import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../TetardsVideo';
import {useCue} from '../cue';
import {Larva, Leech, Pond, Tadpole} from '../characters/Pond';
import {Star} from '../characters/Icons2';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

const PREY = [
  {x: 440, y: 900},
  {x: 400, y: 1000},
  {x: 470, y: 1090},
];

export const Monstres: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const predateurs = useCue('predateurs');
  const larve = useCue('larve');
  const immobile = useCue('immobile');
  const projette = useCue('projette');
  const autre = useCue('autre');
  const vase = useCue('vase');
  const sangsues = useCue('sangsues');
  const title = usePop(4, 9) * (1 - ramp(frame, predateurs - 6, predateurs));
  const eyes = usePop(predateurs, 9) * (1 - ramp(frame, larve - 6, larve));
  const larvaIn = ramp(frame, larve - 6, larve + 20);
  // trois attaques éclair, la dernière au mot « autre »
  const strikes = [projette, Math.round((projette + autre) / 2), autre + 10];
  const jaw = strikes.reduce((a, s) => Math.max(a, frame >= s && frame < s + 12 ? Math.sin(((frame - s) / 12) * Math.PI) : 0), 0);
  const target = strikes.filter((s) => frame >= s + 6).length;
  const toMud = ramp(frame, vase - 10, vase + 20);
  const leeches = usePop(sangsues, 9);
  return (
    <Scene bg="#123B4A">
      <Pond frame={frame} night={0.55} />
      {PREY.map((p, i) => (
        <Place key={i} x={p.x + Math.sin(frame * 0.1 + i) * 15} y={p.y} scale={i < target ? 0 : 1}>
          <Tadpole frame={frame + i * 5} size={80} />
        </Place>
      ))}
      {strikes.map((s, i) =>
        frame >= s + 6 && frame < s + 26 ? (
          <Place key={i} x={PREY[i].x} y={PREY[i].y} scale={1 - (frame - s - 6) / 20}>
            <Star size={110} />
          </Place>
        ) : null,
      )}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${-toMud * 0}px)`}}>
        <Place x={interpolate(larvaIn, [0, 1], [1250, 760])} y={interpolate(target, [0, 1, 2, 3], [900, 1000, 1090, 1090])}>
          <Larva frame={frame} width={420} jaw={jaw} />
        </Place>
      </div>
      {/* yeux qui guettent */}
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: eyes}}>
        {[
          [200, 1150],
          [820, 1200],
          [560, 1300],
        ].map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={16} ry={10 * (frame % 50 < 3 ? 0.2 : 1)} fill="#FFEB3B" />
            <ellipse cx={x + 40} cy={y} rx={16} ry={10 * (frame % 50 < 3 ? 0.2 : 1)} fill="#FFEB3B" />
          </g>
        ))}
      </svg>
      {/* les sangsues dans la vase */}
      {[0, 1, 2].map((i) => (
        <Place key={i} x={600 + i * 160} y={1260 + (i % 2) * 30} scale={leeches * 0.9}>
          <Leech frame={frame + i * 10} width={250} />
        </Place>
      ))}
      <TopBadge s={title} color="#FF8A80">
        DES MONSTRES DANS L'ÉTANG
      </TopBadge>
      <TopBadge s={usePop(larve, 9) * (1 - ramp(frame, immobile + 10, immobile + 18))} color="#C5E1A5">
        LA LARVE DE LIBELLULE
      </TopBadge>
      <TopBadge s={usePop(projette, 9) * (1 - ramp(frame, vase - 6, vase))} size={60}>
        MÂCHOIRE ÉCLAIR !
      </TopBadge>
      <TopBadge s={leeches} color="#BCAAA4">
        LES SANGSUES
      </TopBadge>
    </Scene>
  );
};
