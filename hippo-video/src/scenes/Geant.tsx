import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../HippoVideo';
import {Hippo} from '../characters/Hippo';
import {Croc, Lion} from '../characters/Animals';
import {Bubble, Place, Scene, Sun, prog} from '../ui';

const Tree: React.FC<{x: number; y: number}> = ({x, y}) => (
  <svg width={360} height={420} style={{position: 'absolute', left: x - 180, top: y - 420}}>
    <path d="M170 420 L176 200 Q150 160 110 150 M176 220 Q210 170 250 160" stroke="#6D4C41" strokeWidth={22} fill="none" strokeLinecap="round" />
    <ellipse cx={180} cy={130} rx={170} ry={55} fill="#558B2F" stroke="#33691E" strokeWidth={8} />
  </svg>
);

export const Geant: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const walkIn = prog(frame, dur, 0.0, 0.22);
  const momX = interpolate(walkIn, [0, 1], [-350, 620]);
  const babyX = interpolate(walkIn, [0, 1], [-700, 230]);

  // « Les lions préfèrent faire un détour »
  const lionIn = prog(frame, dur, 0.18, 0.32);
  const lionOut = prog(frame, dur, 0.4, 0.58);
  const lionTurned = frame / dur > 0.36;
  const lionX = interpolate(lionIn, [0, 1], [1350, 880]) + lionOut * 650;
  const lionY = 1490 - Math.sin(lionOut * Math.PI) * 90;

  // « …les crocodiles ne s'attaquent qu'aux petits »
  const crocIn = prog(frame, dur, 0.45, 0.62);
  const roar = prog(frame, dur, 0.62, 0.66) - prog(frame, dur, 0.76, 0.8);
  const crocOut = prog(frame, dur, 0.7, 0.86);
  const crocScared = frame / dur > 0.67;
  const crocX = interpolate(crocIn, [0, 1], [-320, 120]) - crocOut * 650;
  const shake = roar > 0.5 ? Math.sin(frame * 2.3) * 6 : 0;

  return (
    <Scene bg="linear-gradient(#4FC3F7 0%, #B3E5FC 60%)">
      <Sun x={160} y={760} r={65} frame={frame} />
      <Tree x={880} y={1290} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1280, bottom: 0, background: '#E6C068', borderTop: '10px solid #A1887F'}} />
      <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake / 2}px)`}}>
        <Place x={momX} y={1100}>
          <Hippo frame={frame} width={620} walking={walkIn < 1} mouthOpen={roar} happy={roar < 0.3} />
        </Place>
        <Place x={babyX} y={1280}>
          <Hippo frame={frame + 9} width={250} walking={walkIn < 1} />
        </Place>
        <Place x={lionX} y={lionY} flip={lionTurned}>
          <Lion frame={frame} width={280} scared={lionTurned && lionOut < 1} />
        </Place>
        <Place x={crocX} y={1560} flip={crocScared}>
          <Croc frame={frame} width={360} jaw={crocScared ? 0.15 : Math.max(0, Math.sin(frame * 0.25))} scared={crocScared} />
        </Place>
      </div>
      {lionTurned && lionOut < 0.9 ? <Bubble text="NON MERCI…" x={560} y={1140} size={50} tail="right" delay={Math.round(dur * 0.36)} /> : null}
      {roar > 0.2 ? <Bubble text="HOOONK !" x={600} y={730} size={78} delay={Math.round(dur * 0.63)} /> : null}
    </Scene>
  );
};
