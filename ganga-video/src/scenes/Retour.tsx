import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GangaVideo';
import {useCue} from '../cue';
import {TEXT} from '../texts';
import {Chick, Ganga, Nest} from '../characters/Ganga';
import {Desert} from '../characters/Desert';
import {Badge, Heart} from '../characters/Props';
import {Caption, Place, Scene, ramp, usePop} from '../ui';

// Poussins : position dans le nid, puis contre la poitrine du père (qui regarde à droite).
const CHICKS = [
  {nest: [800, 1500], chest: [660, 1395]},
  {nest: [900, 1480], chest: [730, 1450]},
  {nest: [990, 1505], chest: [700, 1525]},
];

export const Retour: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const la = useCue('la', 1); // « Là, ses petits… » (pas « à la maison »)
  const precipitent = useCue('precipitent');
  const boivent = useCue('boivent');
  const quatre = useCue('4');
  const survivre = useCue('survivre');

  const flying = frame < la;
  const land = ramp(frame, la, la + 20);
  const run = ramp(frame, precipitent, precipitent + 25);
  const drinking = frame >= boivent;
  const wet = drinking ? interpolate(frame, [boivent, survivre], [1, 0.35], {extrapolateRight: 'clamp'}) : 1;
  const ml = usePop(quatre, 9);
  const hearts = usePop(survivre, 9);
  // gros plan « caméra » sur la poitrine quand les poussins boivent
  const zoom = 1 + 0.75 * ramp(frame, boivent - 5, boivent + 20);
  return (
    <Scene bg="#FFB300">
      <Desert frame={frame} scroll={flying ? frame * 9 : 0} sunX={160} sunY={760} />
      {flying ? (
        <Place x={540} y={1000 + Math.sin(frame * 0.12) * 30}>
          <Ganga frame={frame} width={480} flying wet={1} />
        </Place>
      ) : (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '690px 1440px'}}>
          <Place x={880} y={1540}>
            <Nest width={380} />
          </Place>
          <Place x={interpolate(land, [0, 1], [200, 420])} y={interpolate(land, [0, 1], [900, 1330])}>
            <Ganga frame={frame} width={500} flying={land < 1} wet={wet} />
          </Place>
          {CHICKS.map((c, i) => {
            const x = interpolate(run, [0, 1], [c.nest[0], c.chest[0]]);
            const y = interpolate(run, [0, 1], [c.nest[1], c.chest[1]]) - Math.abs(Math.sin(run * Math.PI * 3)) * 25 * (run < 1 ? 1 : 0);
            return (
              <Place key={i} x={x} y={y} flip={run > 0}>
                <Chick frame={frame + i * 6} size={150} thirsty={!drinking} drinking={drinking} />
              </Place>
            );
          })}
          {drinking
            ? CHICKS.map((c, i) => {
                const t = ((frame + i * 11) % 30) / 30;
                return <div key={i} style={{position: 'absolute', left: c.chest[0] - 80, top: c.chest[1] - 40 + t * 20, width: 16, height: 22, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#4FC3F7', border: '3px solid #2B1E14', opacity: 1 - t}} />;
              })
            : null}
          {[0, 1, 2].map((i) => {
            const t = ((frame + i * 20) % 60) / 60;
            return (
              <div key={i} style={{position: 'absolute', left: 560 + i * 120, top: 1150 - t * 250, opacity: hearts * (1 - t), transform: `scale(${hearts})`}}>
                <Heart size={70} />
              </div>
            );
          })}
        </div>
      )}
      {/* 4 ml par poussin */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', gap: 24, transform: `scale(${ml})`}}>
        {[0, 1, 2].map((i) => (
          <Badge key={i} size={58} rotate={i % 2 ? 5 : -5}>
            4 ML
          </Badge>
        ))}
      </div>
      <Caption text={TEXT.retour} size={96} top={150} />
    </Scene>
  );
};
