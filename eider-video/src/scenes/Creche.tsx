import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../EiderVideo';
import {useCue} from '../cue';
import {Coast, Duckling, Eider, Gull, SHORE_Y} from '../characters/Arctic';
import {duckOn, eiderOn} from './helpers';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

const ANGLES = [200, 245, 295, 340, 20, 160];

export const Creche: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const cercle = useCue('cercle');
  const creche = useCue('creche', 1);
  const mur = useCue('mur');
  const plongent = useCue('plongent');
  const ouverture = useCue("d'ouverture");
  const title = usePop(4, 9) * (1 - ramp(frame, cercle - 6, cercle));
  const ring = ramp(frame, cercle - 10, cercle + 30);
  const move = ramp(frame, mur, dur);
  const cx = 420 + move * 100;
  const cy = SHORE_Y + 50;
  const adults = ANGLES.map((a, i) => {
    const r = (a * Math.PI) / 180;
    const spread = interpolate(ring, [0, 1], [1.8, 1]);
    return {i, x: cx + Math.cos(r) * 250 * spread, y: cy + Math.sin(r) * 70, back: Math.sin(r) < 0};
  });
  const walking = move > 0 && move < 1;
  const renderAdult = ({i, x, y}: (typeof adults)[number]) => (
    <Place key={i} x={x} y={eiderOn(y, 220, true)} flip={x < cx - 150 ? false : x > cx + 150 ? true : i % 2 === 0}>
      <Eider frame={frame + i * 9} width={220} pose="stand" walking={walking} />
    </Place>
  );
  const diving = frame >= plongent - 20;
  return (
    <Scene bg="#9ECFEA">
      <Coast frame={frame} shore />
      {adults.filter((a) => a.back).map(renderAdult)}
      {[0, 1, 2, 3, 4].map((i) => (
        <Place key={i} x={cx - 120 + i * 60} y={duckOn(cy + (i % 2) * 14, 64)}>
          <Duckling frame={frame + i * 6} size={64} walking={walking} />
        </Place>
      ))}
      {adults.filter((a) => !a.back).map(renderAdult)}
      {/* goélands qui piquent et rebondissent sur le mur de canards */}
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 23) % 60) / 60;
        const d = Math.sin(t * Math.PI);
        const on = diving ? 1 : ramp(frame, 0, 30);
        return (
          <Place key={i} x={cx - 260 + i * 260 + (t - 0.5) * 160} y={760 + d * (diving ? 380 : 150) - (1 - on) * 400} flip={i % 2 === 0}>
            <Gull frame={frame + i * 7} width={200} dive={diving ? d : d * 0.3} />
          </Place>
        );
      })}
      <TopBadge s={title} color="#FFE082">
        LA CRÈCHE DES CANARDS
      </TopBadge>
      <TopBadge s={usePop(cercle, 9) * (1 - ramp(frame, creche - 6, creche))} color="#B3E5FC">
        UN CERCLE SERRÉ
      </TopBadge>
      <TopBadge s={usePop(creche, 9) * (1 - ramp(frame, mur - 6, mur))} color="#A5D6A7" size={76}>
        UNE « CRÈCHE » !
      </TopBadge>
      <TopBadge s={usePop(mur, 9) * (1 - ramp(frame, ouverture - 6, ouverture))} color="#FFFFFF">
        UN MUR DE CANARDS
      </TopBadge>
      <TopBadge s={usePop(ouverture, 9)} color="#FF8A80">
        AUCUNE OUVERTURE !
      </TopBadge>
    </Scene>
  );
};
