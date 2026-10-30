import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PhacochereVideo';
import {useCue} from '../cue';
import {Mongoose, Savanna, Tick} from '../characters/Savanna';
import {Badge} from '../characters/Props';
import {Bubble, Place, Scene, ramp, usePop} from '../ui';

const Beetle: React.FC<{size?: number}> = ({size = 50}) => (
  <svg viewBox="-30 -30 60 60" width={size} style={{overflow: 'visible'}}>
    <path d="M-14 -6 l-12 -6 M-14 4 l-14 2 M-12 12 l-10 10 M14 -6 l12 -6 M14 4 l14 2 M12 12 l10 10" stroke="#2B1E14" strokeWidth={3} />
    <ellipse cx={0} cy={4} rx={16} ry={20} fill="#43A047" stroke="#2B1E14" strokeWidth={3} />
    <path d="M0 -16 L0 24" stroke="#2B1E14" strokeWidth={2} />
    <circle cx={0} cy={-18} r={8} fill="#2B1E14" />
  </svg>
);

export const Mangoustes: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const mangoustes = useCue('mangoustes');
  const groupe = useCue('groupe');
  const insectes = useCue('insectes');
  const tiques = useCue('tiques');
  const run = ramp(frame, mangoustes - 6, mangoustes + 30);
  const team = usePop(groupe, 9) * (1 - ramp(frame, insectes - 4, insectes + 4));
  const bugs = frame >= insectes;
  const yum = usePop(tiques, 9);
  return (
    <Scene bg="#FFB74D">
      <Savanna frame={frame} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center', transform: `scale(${usePop(4, 9) * (1 - ramp(frame, mangoustes - 6, mangoustes))})`}}>
        <Badge size={66}>LES NETTOYEURS</Badge>
      </div>
      {[0, 1, 2, 3, 4].map((i) => {
        const x = interpolate(run, [0, 1], [-250 - i * 160, 150 + i * 190]);
        const y = 1450 + (i % 2) * 120;
        return (
          <Place key={i} x={x} y={y}>
            <Mongoose frame={frame + i * 5} width={230} walking={run < 1} eating={bugs && i % 2 === 0} sniffing={bugs && i % 2 === 1} />
          </Place>
        );
      })}
      {bugs
        ? [0, 1, 2].map((i) => {
            const t = Math.max(0, Math.min(1, (frame - insectes - i * 8) / 30));
            return (
              <Place key={i} x={260 + i * 380 + Math.sin(frame * 0.4 + i) * 20} y={1520 + (i % 2) * 40} scale={1 - t}>
                <Beetle size={60} />
              </Place>
            );
          })
        : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${team})`}}>
        <Badge size={74}>EN GROUPE</Badge>
      </div>
      <Place x={540} y={880} scale={yum}>
        <Tick size={170} frame={frame} />
      </Place>
      {frame >= tiques ? <Bubble text="MIAM !" x={620} y={700} size={70} delay={tiques + 4} /> : null}
    </Scene>
  );
};
