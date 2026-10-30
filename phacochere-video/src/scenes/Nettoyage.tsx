import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PhacochereVideo';
import {useCue} from '../cue';
import {Mongoose, Savanna, Warthog} from '../characters/Savanna';
import {Badge} from '../characters/Props';
import {SPOTS, hogPoint} from '../spots';
import {Place, Scene, ramp, usePop} from '../ui';

const CX = 540;
const CY = 1250;
const W = 700;

export const Nettoyage: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const grimpent = useCue('grimpent');
  const odorat = useCue('odorat');
  const reperent = useCue('reperent');
  const oreilles = useCue('oreilles');
  const plis = useCue('plis');
  const pattes = useCue('pattes');
  const arrachent = useCue('arrachent');

  const title = usePop(4, 9) * (1 - ramp(frame, grimpent - 6, grimpent));
  const climb = ramp(frame, grimpent, grimpent + 25);
  // chaque mangouste va vers sa zone : oreille, plis de la peau, entre les pattes
  const zones = [
    {spot: 4, at: oreilles},
    {spot: 2, at: plis},
    {spot: 6, at: pattes},
  ];
  const highlight = frame >= reperent && frame < arrachent;
  // les tiques sont arrachées une par une
  const pulled = (i: number) => frame >= arrachent + i * Math.max(6, (dur - arrachent) / (SPOTS.length + 2));
  const ticks = SPOTS.map((p, i) => ({...p, s: pulled(i) ? 0 : 1, full: 0.5}));
  const removed = SPOTS.filter((_, i) => pulled(i)).length;
  const counter = usePop(arrachent, 9);
  return (
    <Scene bg="#FFB74D">
      <Savanna frame={frame} />
      <Place x={CX} y={CY}>
        <Warthog frame={frame} width={W} lying={1} blissful={frame >= arrachent} ticks={ticks} />
      </Place>
      {/* cercles autour des tiques repérées */}
      {highlight
        ? SPOTS.map((p, i) => {
            const q = hogPoint(p.x, p.y, CX, CY, W, 1);
            return <div key={i} style={{position: 'absolute', left: q.x - 36, top: q.y - 36, width: 72, height: 72, borderRadius: 36, border: '7px solid #FFEB3B', transform: `scale(${1 + Math.sin(frame * 0.4 + i) * 0.12})`}} />;
          })
        : null}
      {zones.map((z, i) => {
        const home = hogPoint([110, 180, 250][i], 80, CX, CY, W, 1);
        const target = hogPoint(SPOTS[z.spot].x, SPOTS[z.spot].y, CX, CY, W, 1);
        const go = ramp(frame, z.at, z.at + 15);
        const x = (-200 + i * 100) * (1 - climb) + climb * (home.x + (target.x - home.x - 70) * go);
        const y = 1600 * (1 - climb) + climb * (home.y - 50 + (target.y - home.y + 20) * go);
        return (
          <Place key={i} x={x} y={y} rotate={-10}>
            <Mongoose frame={frame + i * 6} width={230} walking={climb < 1} sniffing={frame >= odorat} eating={frame >= arrachent && i !== 1} />
          </Place>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${title})`}}>
        <Badge size={70}>LE GRAND NETTOYAGE</Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', transform: `scale(${counter})`}}>
        <Badge size={72} color="#FFFFFF">
          {removed} / {SPOTS.length} TIQUES
        </Badge>
      </div>
    </Scene>
  );
};
