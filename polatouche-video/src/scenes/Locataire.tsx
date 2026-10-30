import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PolatoucheVideo';
import {useCue} from '../cue';
import {Forest} from '../characters/Forest';
import {Birch, Owl, Squirrel, Woodpecker} from '../characters/Squirrel';
import {Badge} from '../characters/Props';
import {Cross, House} from '../characters/Icons';
import {Bubble, Place, Scene, ramp, usePop} from '../ui';

const HOLE = {x: 540, y: 1000};

export const Locataire: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const construire = useCue('construire');
  const installe = useCue("s'installe");
  const pics = useCue('pics');
  const abri = useCue('abri');
  const hauteur = useCue('hauteur'); // « en hauteur et à l'abri des prédateurs »

  const house = usePop(construire, 9) * (1 - ramp(frame, installe - 6, installe));
  const cross = ramp(frame, construire + 8, construire + 20);
  const peek = ramp(frame, installe, installe + 15);
  const pecker = usePop(pics, 9);
  const ready = usePop(abri, 9) * (1 - ramp(frame, hauteur - 6, hauteur));
  const owl = usePop(hauteur, 9);
  return (
    <Scene bg="#4FC3F7">
      <Forest frame={frame} />
      <div style={{position: 'absolute', left: HOLE.x - 100 * 1.1, top: 400}}>
        <Birch height={1320} holeY={(HOLE.y - 400) / 1320} holeSize={1.6} />
      </div>
      {/* le polatouche sort la tête de l'ancien trou de pic */}
      <div style={{position: 'absolute', left: HOLE.x - 60, top: HOLE.y - 70, width: 120, height: 110, overflow: 'hidden', borderRadius: '50% 50% 45% 45%'}}>
        <div style={{position: 'absolute', left: -40, top: interpolate(peek, [0, 1], [120, -10])}}>
          <Squirrel frame={frame} width={200} />
        </div>
      </div>
      {/* le pic qui creuse un autre trou */}
      <Place x={HOLE.x - 170} y={1330} scale={pecker} flip>
        <Woodpecker frame={frame} width={170} />
      </Place>
      {frame >= pics ? <Bubble text="TOC TOC" x={70} y={1140} size={50} delay={pics} /> : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', transform: `scale(${house})`}}>
        <div style={{position: 'relative'}}>
          <House size={240} />
          <div style={{position: 'absolute', left: 10, top: 10}}>
            <Cross size={220} draw={cross} />
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 620, top: 860, transform: `scale(${ready})`}}>
        <Badge size={52}>ABRI TOUT PRÊT</Badge>
      </div>
      {/* prédateur trop bas pour l'atteindre */}
      <Place x={860} y={1420} scale={owl}>
        <Owl frame={frame} width={200} />
      </Place>
      {owl > 0.1 ? (
        <svg width={1080} height={1920} style={{position: 'absolute', opacity: owl}}>
          <path d="M760 820 L760 1300" stroke="#16121F" strokeWidth={12} strokeDasharray="24 18" />
          <path d="M760 820 l-24 36 M760 820 l24 36 M760 1300 l-24 -36 M760 1300 l24 -36" stroke="#16121F" strokeWidth={12} strokeLinecap="round" />
        </svg>
      ) : null}
      <div style={{position: 'absolute', left: 660, top: 700, transform: `scale(${owl})`}}>
        <Badge size={52} color="#80DEEA">
          EN HAUTEUR
        </Badge>
      </div>
    </Scene>
  );
};
