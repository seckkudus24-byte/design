import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../NepenthesVideo';
import {useCue} from '../cue';
import {Bat, Jungle, Pellet, Pitcher} from '../characters/Jungle';
import {Badge} from '../characters/Props';
import {Zzz} from '../characters/Icons';
import {POT, RIM} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';

export const Hotel: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const chauve = useCue('chauve-souris');
  const chambre = useCue('chambre');
  const dort = useCue('dort');
  const paye = useCue('paye');
  const title = usePop(4, 9) * (1 - ramp(frame, chambre - 6, chambre));
  const night = ramp(frame, 0, 30);
  const fly = ramp(frame, chauve - 10, dort);
  const sign = usePop(chambre, 9);
  const sleep = frame >= dort;
  const pay = usePop(paye, 9);
  return (
    <Scene bg="#1A237E">
      <Jungle frame={frame} night={night} />
      <Place x={POT.x} y={POT.y}>
        <Pitcher frame={frame} height={POT.h} face="happy" />
      </Place>
      {sleep ? (
        <>
          <Place x={RIM.x} y={RIM.y + 90}>
            <Bat frame={frame} size={150} sleeping />
          </Place>
          <div style={{position: 'absolute', left: RIM.x + 40, top: RIM.y - 180}}>
            <Zzz frame={frame} size={150} />
          </div>
        </>
      ) : (
        <Place x={interpolate(fly, [0, 1], [1200, RIM.x])} y={interpolate(fly, [0, 1], [700, RIM.y - 40]) + Math.sin(frame * 0.3) * 30}>
          <Bat frame={frame} size={200} />
        </Place>
      )}
      {/* enseigne de l'hôtel */}
      <div style={{position: 'absolute', left: 140, top: 900, transform: `scale(${sign}) rotate(-6deg)`}}>
        <Badge size={64} color="#FFD54F">
          HÔTEL ★★★
        </Badge>
      </div>
      {pay > 0
        ? [0, 1, 2].map((i) => {
            const t = ((frame - paye + i * 14) % 42) / 42;
            return (
              <Place key={i} x={RIM.x + 20 - i * 20} y={RIM.y + 120 + t * 200} scale={1 - t * 0.4}>
                <Pellet size={30} />
              </Place>
            );
          })
        : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', transform: `scale(${pay})`}}>
        <Badge size={66}>LOYER PAYÉ !</Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${title})`}}>
        <Badge size={60} color="#B39DDB">
          L'HÔTEL DES CHAUVES-SOURIS
        </Badge>
      </div>
    </Scene>
  );
};
