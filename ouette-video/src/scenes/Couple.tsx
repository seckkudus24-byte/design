import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../OuetteVideo';
import {useCue} from '../cue';
import {River} from '../characters/Winter';
import {Goose, Gosling} from '../characters/Goose';
import {SoftHeart} from '../characters/Bits';
import {Badge} from '../characters/Props';
import {Place, Scene, ramp, usePop} from '../ui';

export const Couple: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const ouette = useCue('ouette');
  const oie = useCue("d'oie");
  const ensemble = useCue('ensemble');
  const petits = useCue('petits');
  const quittent = useCue('quittent');
  const title = usePop(4, 10) * (1 - ramp(frame, ouette - 6, ouette));
  const name = usePop(ouette, 10) * (1 - ramp(frame, oie - 6, oie));
  const wild = usePop(oie, 10) * (1 - ramp(frame, ensemble - 6, ensemble));
  const together = ramp(frame, ensemble, ensemble + 25);
  const babies = ramp(frame, petits, petits + 40);
  const close = ramp(frame, quittent, quittent + 20);
  return (
    <Scene bg="#C8E6C9">
      {/* printemps : la famille au bord de l'eau */}
      <River frame={frame} snow={0} />
      <Place x={interpolate(close, [0, 1], [300, 360])} y={1180}>
        <Goose frame={frame} width={380} walking={babies > 0 && babies < 1} />
      </Place>
      <Place x={interpolate(close, [0, 1], [760, 640]) - together * 40} y={1195} flip>
        <Goose frame={frame + 30} width={350} female />
      </Place>
      {Array.from({length: 6}, (_, i) => (
        <Place key={i} x={interpolate(babies, [0, 1], [-150 - i * 120, 180 + i * 140])} y={1450 + (i % 2) * 70}>
          <Gosling frame={frame + i * 7} size={120} peep />
        </Place>
      ))}
      <div style={{position: 'absolute', left: 540 - 60, top: 880, opacity: together, transform: `scale(${together * (1 + Math.sin(frame * 0.18) * 0.06)})`}}>
        <SoftHeart size={120} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${title})`}}>
        <Badge size={66}>UN COUPLE POUR LA VIE</Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${name})`}}>
        <Badge size={74}>OUETTE D'ÉGYPTE</Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', transform: `scale(${wild})`}}>
        <Badge size={64} color="#FFFFFF">
          UNE OIE SAUVAGE
        </Badge>
      </div>
    </Scene>
  );
};
