import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../EiderVideo';
import {useCue} from '../cue';
import {Coast, Duckling, Eider, Gull, SHORE_Y} from '../characters/Arctic';
import {duckOn, eiderOn} from './helpers';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Cri: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const attaquent = useCue('attaquent');
  const seule = useCue('seule');
  const cri = useCue('cri', 1);
  const panique = useCue('panique');
  const aide = useCue("l'aide");
  const mamans = useCue('mamans');
  const title = usePop(4, 9) * (1 - ramp(frame, attaquent - 6, attaquent));
  const gulls = ramp(frame, attaquent - 10, attaquent + 20);
  const calling = frame >= cri && frame < mamans + 40;
  const arrive = ramp(frame, mamans, mamans + 50);
  const scared = frame >= attaquent && frame < mamans;
  return (
    <Scene bg="#9ECFEA">
      <Coast frame={frame} shore />
      {/* goélands qui tournent et piquent (sans jamais toucher) */}
      {[0, 1].map((i) => {
        const t = ((frame + i * 35) % 70) / 70;
        const dive = Math.sin(t * Math.PI);
        const x = interpolate(gulls, [0, 1], [1250 + i * 200, 420 + i * 260]) + Math.cos(t * Math.PI * 2) * 60;
        const y = 820 + i * 60 + dive * 200 * gulls;
        return (
          <Place key={i} x={x} y={y} flip>
            <Gull frame={frame + i * 9} width={230} dive={dive * gulls} />
          </Place>
        );
      })}
      {/* autres mamans qui arrivent de partout */}
      {[0, 1].map((i) => (
        <React.Fragment key={i}>
          <Place x={interpolate(arrive, [0, 1], [-260 - i * 200, 120 + i * 120])} y={eiderOn(SHORE_Y + 20 + i * 60, 240, true)}>
            <Eider frame={frame + i * 11} width={240} pose="stand" walking={arrive > 0 && arrive < 1} />
          </Place>
          <Place x={interpolate(arrive, [0, 1], [-140 - i * 200, 230 + i * 120])} y={duckOn(SHORE_Y + 40 + i * 60, 70)}>
            <Duckling frame={frame + i * 5} size={70} walking={arrive > 0 && arrive < 1} />
          </Place>
        </React.Fragment>
      ))}
      <Place x={470} y={eiderOn(SHORE_Y + 10, 320, true)}>
        <Eider frame={frame} width={320} pose="stand" call={calling} />
      </Place>
      {[0, 1, 2].map((i) => (
        <Place key={i} x={400 + i * 80 + (scared ? Math.sin(frame * 0.9 + i) * 4 : 0)} y={duckOn(SHORE_Y + 70, 80)}>
          <Duckling frame={frame + i * 7} size={80} />
        </Place>
      ))}
      <TopBadge s={title} color="#FFE082">
        LE CRI QUI SAUVE TOUT
      </TopBadge>
      <TopBadge s={usePop(attaquent, 9) * (1 - ramp(frame, seule - 6, seule))} color="#FF8A80">
        LES GOÉLANDS ATTAQUENT !
      </TopBadge>
      <TopBadge s={usePop(seule, 9) * (1 - ramp(frame, cri - 6, cri))} color="#FFFFFF">
        TOUTE SEULE…
      </TopBadge>
      <TopBadge s={usePop(panique, 9) * (1 - ramp(frame, aide - 6, aide))} color="#FFFFFF" size={60}>
        PAS DE LA PANIQUE…
      </TopBadge>
      <TopBadge s={usePop(aide, 9) * (1 - ramp(frame, mamans - 6, mamans))} color="#A5D6A7">
        UN APPEL À L'AIDE !
      </TopBadge>
      <TopBadge s={usePop(mamans, 9)} color="#B3E5FC">
        LES RENFORTS ARRIVENT !
      </TopBadge>
    </Scene>
  );
};
