import React from 'react';
import {interpolate, interpolateColors, random, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../HippoVideo';
import {Hippo} from '../characters/Hippo';
import {Algae, Fish} from '../characters/Animals';
import {Bubble, Caption, Place, Scene, Water, prog} from '../ui';

const WATER_TOP = 930;
const TAIL = {x: 300, y: 905};

export const Arroseur: React.FC<SceneProps> = ({dur, text}) => {
  const frame = useCurrentFrame();
  const spinning = frame / dur > 0.12;
  const green = prog(frame, dur, 0.35, 0.6);
  const grow = interpolate(prog(frame, dur, 0.35, 0.75), [0, 1], [0.25, 1]);
  const fishIn = prog(frame, dur, 0.5, 0.75);

  const particles = spinning
    ? Array.from({length: 46}, (_, i) => {
        const life = 40;
        const age = (frame + i * 7) % life;
        const a = interpolate(random(`a${i}`), [0, 1], [-2.6, 0.2]);
        const v = 6 + random(`v${i}`) * 10;
        const x = TAIL.x + Math.cos(a) * v * age - age * 2;
        const y = TAIL.y + Math.sin(a) * v * age * 0.6 + age * age * 0.35;
        const c = interpolateColors(Math.min(1, green + (age / life) * green), [0, 1], ['#795548', '#76FF03']);
        return <circle key={i} cx={x} cy={y} r={9 + random(`r${i}`) * 9} fill={c} stroke="#2E2346" strokeWidth={3} opacity={1 - age / life} />;
      })
    : null;

  return (
    <Scene bg="linear-gradient(#FFB300 0%, #FFE082 100%)">
      <Place x={590} y={WATER_TOP - 40}>
        <Hippo frame={frame} width={620} tailSpin={spinning} />
      </Place>
      <Water top={WATER_TOP} frame={frame} color={interpolateColors(green, [0, 1], ['#0288D1', '#00897B'])} opacity={0.82} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {particles}
        <path d="M-20 1700 Q 300 1650 540 1690 T 1100 1680 L 1100 1920 L -20 1920 Z" fill="#D7B377" />
        {[90, 230, 400, 700, 860, 1000].map((x, i) => (
          <Algae key={x} frame={frame} x={x} baseY={1710} height={260 + (i % 3) * 70} grow={grow} phase={i} color={i % 2 ? '#2E7D32' : '#66BB6A'} />
        ))}
      </svg>
      {[0, 1, 2, 3, 4].map((i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        const base = ((frame * (3 + i) + i * 260) % 1400) - 160;
        const x = dir === 1 ? base : 1080 - base;
        const y = 1180 + i * 95 + Math.sin(frame * 0.1 + i) * 20;
        return (
          <div key={i} style={{opacity: fishIn}}>
            <Place x={x} y={y} flip={dir === -1} scale={0.6 + fishIn * 0.4}>
              <Fish frame={frame + i * 5} color={['#FF7043', '#FFCA28', '#EC407A', '#AB47BC', '#29B6F6'][i]} size={140} />
            </Place>
          </div>
        );
      })}
      {spinning ? <Bubble text="SPLATCH !" x={40} y={640} size={66} delay={Math.round(dur * 0.13)} /> : null}
      <Caption text={text} size={96} top={150} />
    </Scene>
  );
};
