import React from 'react';
import {interpolate, interpolateColors, random, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../HippoVideo';
import {Hippo} from '../characters/Hippo';
import {Algae, Fish, Shrimp} from '../characters/Animals';
import {Bubble, FONT, Place, Scene, Water, prog, usePop} from '../ui';

const BadgeBox: React.FC<{s: number; top: number; children: React.ReactNode}> = ({s, top, children}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top,
      display: 'flex',
      justifyContent: 'center',
      transform: `scale(${s})`,
    }}
  >
    <div
      style={{
        background: '#FFD600',
        border: '10px solid #16121F',
        borderRadius: 36,
        padding: '12px 34px 2px',
        fontFamily: FONT,
        fontSize: 64,
        color: '#16121F',
        textAlign: 'center',
        lineHeight: 1.05,
        boxShadow: '0 12px 0 rgba(0,0,0,0.3)',
        transform: 'rotate(-3deg)',
      }}
    >
      {children}
    </div>
  </div>
);

export const Arroseur: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const at = (f: number) => Math.round(dur * f);
  const spinning = frame / dur > 0.08;
  const green = prog(frame, dur, 0.3, 0.5);
  const grow = interpolate(prog(frame, dur, 0.44, 0.62), [0, 1], [0.25, 1]);
  const fishIn = prog(frame, dur, 0.48, 0.62);
  // « Un seul hippopotame peut en rejeter des dizaines de tonnes par an »
  const tonnes = usePop(at(0.28), 9) * (1 - prog(frame, dur, 0.45, 0.49));
  // « En saison sèche, quand l'eau baisse… »
  const dry = prog(frame, dur, 0.66, 0.8);
  const seche = usePop(at(0.67), 9);
  const WATER_TOP = interpolate(dry, [0, 1], [930, 1090]);
  const TAIL = {x: 300, y: WATER_TOP - 25};

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
      <Place x={590} y={WATER_TOP - 40 + dry * 10}>
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
        const y = 1180 + dry * 150 + i * 80 + Math.sin(frame * 0.1 + i) * 20;
        return (
          <div key={i} style={{opacity: fishIn}}>
            <Place x={x} y={y} flip={dir === -1} scale={0.6 + fishIn * 0.4}>
              <Fish frame={frame + i * 5} color={['#FF7043', '#FFCA28', '#EC407A', '#AB47BC', '#29B6F6'][i]} size={140} />
            </Place>
          </div>
        );
      })}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{opacity: fishIn}}>
          <Place x={180 + i * 330 + Math.sin(frame * 0.07 + i * 2) * 60} y={1650 - (i % 2) * 40}>
            <Shrimp frame={frame + i * 4} size={110} />
          </Place>
        </div>
      ))}
      {spinning && frame < at(0.28) ? <Bubble text="SPLATCH !" x={40} y={640} size={66} delay={at(0.09)} /> : null}
      <BadgeBox s={tonnes} top={640}>
        DES DIZAINES
        <br />
        DE TONNES / AN
      </BadgeBox>
      <BadgeBox s={seche} top={600}>
        SAISON SÈCHE :
        <br />
        LE GARDE-MANGER RESTE !
      </BadgeBox>
    </Scene>
  );
};
