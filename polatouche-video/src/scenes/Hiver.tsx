import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PolatoucheVideo';
import {useCue} from '../cue';
import {Forest, Snowfall} from '../characters/Forest';
import {Bud, Glider, Leaf, Nut, Squirrel} from '../characters/Squirrel';
import {Badge} from '../characters/Props';
import {ColdThermo, Cross, Zzz} from '../characters/Icons';
import {Place, Scene, ramp, usePop} from '../ui';

export const Hiver: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const actif = useCue('actif');
  const glaciales = useCue('glaciales');
  const noix = useCue('noix');
  const feuilles = useCue('feuilles');
  const bourgeons = useCue('bourgeons');
  const fourrure = useCue('fourrure');

  const snow = ramp(frame, 0, 30);
  const zzz = usePop(4, 9) * (1 - ramp(frame, actif - 6, actif));
  const noSleep = ramp(frame, 18, 32);
  const active = frame >= actif && frame < glaciales;
  const leg = ((frame - actif) % 60) / 60;
  const cold = usePop(glaciales, 9) * (1 - ramp(frame, noix - 6, noix));
  const level = ramp(frame, glaciales, glaciales + 25);
  const stash = [usePop(noix, 9), usePop(feuilles, 9), usePop(bourgeons, 9)];
  const fluffy = frame >= fourrure;
  const furBadge = usePop(fourrure, 9);
  return (
    <Scene bg="#90CAF9">
      <Forest frame={frame} snow={snow} />
      <Snowfall frame={frame} amount={snow} />
      {/* il n'hiberne pas */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center', transform: `scale(${zzz})`}}>
        <div style={{position: 'relative'}}>
          <Zzz frame={frame} size={220} />
          <div style={{position: 'absolute', left: 0, top: 0}}>
            <Cross size={220} draw={noSleep} />
          </div>
        </div>
      </div>
      {active ? (
        <Place x={interpolate(leg, [0, 1], [-100, 1180])} y={900 + leg * 400} rotate={65}>
          <Glider frame={frame} width={280} spread={1} />
        </Place>
      ) : (
        <Place x={300} y={1360}>
          <Squirrel frame={frame} width={fluffy ? 440 : 380} fluffy={fluffy} nibbling={frame >= noix && frame < fourrure} />
        </Place>
      )}
      {/* températures glaciales */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, transform: `scale(${cold})`}}>
        <ColdThermo size={380} level={level} frame={frame} />
        <Badge size={70} color="#B3E5FC">
          GLACIAL !
        </Badge>
      </div>
      {/* réserves de noix, feuilles, bourgeons */}
      {[
        [<Nut key="n" size={130} />, 620, 1430],
        [<Leaf key="l" size={120} />, 780, 1400],
        [<Bud key="b" size={110} />, 930, 1420],
      ].map(([icon, x, y], i) => (
        <Place key={i} x={x as number} y={y as number} scale={stash[i]}>
          {icon}
        </Place>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${furBadge})`}}>
        <Badge size={66}>FOURRURE ÉPAISSE</Badge>
      </div>
    </Scene>
  );
};
