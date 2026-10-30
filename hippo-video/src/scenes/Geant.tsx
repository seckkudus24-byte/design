import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../HippoVideo';
import {Hippo} from '../characters/Hippo';
import {Croc, Lion} from '../characters/Animals';
import {Bubble, Caption, Place, Scene, Sun, prog} from '../ui';

const Tree: React.FC<{x: number; y: number}> = ({x, y}) => (
  <svg width={360} height={420} style={{position: 'absolute', left: x - 180, top: y - 420}}>
    <path d="M170 420 L176 200 Q150 160 110 150 M176 220 Q210 170 250 160" stroke="#6D4C41" strokeWidth={22} fill="none" strokeLinecap="round" />
    <ellipse cx={180} cy={130} rx={170} ry={55} fill="#558B2F" stroke="#33691E" strokeWidth={8} />
  </svg>
);

export const Geant: React.FC<SceneProps> = ({dur, text}) => {
  const frame = useCurrentFrame();
  const walkIn = prog(frame, dur, 0.0, 0.3);
  const hippoX = interpolate(walkIn, [0, 1], [-350, 540]);
  const roar = prog(frame, dur, 0.48, 0.52) - prog(frame, dur, 0.66, 0.7);
  const approach = prog(frame, dur, 0.22, 0.42);
  const flee = prog(frame, dur, 0.6, 0.78);
  const scared = frame / dur > 0.52;
  const lionX = interpolate(approach, [0, 1], [1350, 880]) + flee * 700;
  const crocX = interpolate(approach, [0, 1], [-300, 210]) - flee * 700;
  const shake = roar > 0.5 ? Math.sin(frame * 2.3) * 6 : 0;
  return (
    <Scene bg="linear-gradient(#4FC3F7 0%, #B3E5FC 60%)">
      <Sun x={160} y={760} r={65} frame={frame} />
      <Tree x={880} y={1290} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1280, bottom: 0, background: '#E6C068', borderTop: '10px solid #A1887F'}} />
      <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake / 2}px)`}}>
        <Place x={hippoX} y={1110}>
          <Hippo frame={frame} width={680} walking={walkIn < 1} mouthOpen={roar} />
        </Place>
        <Place x={lionX} y={1500} flip={scared}>
          <Lion frame={frame} width={300} scared={scared} />
        </Place>
        <Place x={crocX} y={1560} flip={scared}>
          <Croc frame={frame} width={360} jaw={scared ? 0.2 : Math.max(0, Math.sin(frame * 0.25))} scared={scared} />
        </Place>
      </div>
      {roar > 0.2 ? <Bubble text="HOOONK !" x={560} y={730} size={78} tail="left" delay={Math.round(dur * 0.49)} /> : null}
      <Caption text={text} size={96} top={150} />
    </Scene>
  );
};
