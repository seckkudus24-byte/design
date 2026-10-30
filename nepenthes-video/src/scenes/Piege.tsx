import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../NepenthesVideo';
import {useCue} from '../cue';
import {Ant, Jungle, Pitcher} from '../characters/Jungle';
import {Badge} from '../characters/Props';
import {LID, POT, RIM} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';

export const Piege: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const pieges = useCue('pieges');
  const fourmis = useCue('fourmis');
  const pluie = useCue('pluie');
  const goutte = useCue('goutte');
  const vibre = useCue('vibre');
  const glisse = useCue('glisse');
  const jamais = useCue('jamais');
  const title = usePop(4, 9) * (1 - ramp(frame, pieges - 6, pieges));
  const trap = usePop(pieges, 9) * (1 - ramp(frame, fourmis - 6, fourmis));
  const walk = ramp(frame, fourmis, fourmis + 45);
  const rain = ramp(frame, pluie - 6, pluie + 10);
  const drop = ramp(frame, goutte - 4, goutte + 10);
  const shake = ramp(frame, vibre - 2, vibre + 4) * (1 - ramp(frame, vibre + 30, vibre + 40));
  const fall = ramp(frame, glisse, glisse + 25);
  const gone = usePop(jamais, 9);
  return (
    <Scene bg="#81D4FA">
      <Jungle frame={frame} rain={rain} />
      <Place x={POT.x} y={POT.y}>
        <Pitcher frame={frame} height={POT.h} nectar={1} lidShake={shake} red />
      </Place>
      {/* goutte de pluie qui tombe sur le couvercle */}
      {drop > 0 && drop < 1 ? (
        <div style={{position: 'absolute', left: LID.x - 12, top: interpolate(drop, [0, 1], [500, LID.y - 30]), width: 26, height: 36, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#4FC3F7', border: '4px solid #16121F'}} />
      ) : null}
      {/* les fourmis : deux restent sur le côté, une glisse dans le pot */}
      {[0, 1, 2].map((i) => {
        const lead = i === 0;
        const x = interpolate(walk, [0, 1], [950 + i * 70, RIM.x + 90 + i * 60]);
        const y = interpolate(walk, [0, 1], [1500 - i * 20, RIM.y - 20 + i * 10]);
        const fx = lead ? interpolate(fall, [0, 1], [x, RIM.x]) : x;
        const fy = lead ? interpolate(fall, [0, 1], [y, RIM.y + 200]) : y;
        return (
          <Place key={i} x={fx} y={fy} rotate={lead ? fall * 200 : 0} scale={lead ? 1 - fall * 0.5 : 0.85}>
            <Ant frame={frame + i * 5} size={90} slip={lead && fall > 0} />
          </Place>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${title})`}}>
        <Badge size={60} color="#FF8A80">
          PAS TOUTES GENTILLES…
        </Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', transform: `scale(${trap})`}}>
        <Badge size={70} color="#FF8A80">
          PIÈGE !
        </Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', transform: `scale(${gone})`}}>
        <Badge size={64} color="#FFFFFF">
          PLOUF… FIN DU VOYAGE
        </Badge>
      </div>
    </Scene>
  );
};
