import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PhacochereVideo';
import {useCue} from '../cue';
import {Lion, Mongoose, Savanna, Warthog} from '../characters/Savanna';
import {Badge} from '../characters/Props';
import {Bubble, Place, Scene, ramp, usePop} from '../ui';

export const Signal: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const mefiant = useCue('mefiant');
  const proie = useCue('proie');
  const groupe = useCue('groupe');
  const plie = useCue('plie');
  const invitation = useCue('invitation');
  const secret = usePop(6, 9) * (1 - ramp(frame, mefiant - 4, mefiant + 4));
  const wary = frame >= mefiant && frame < groupe;
  const look = wary ? Math.sin(frame * 0.15) > 0 : false;
  const predators = usePop(proie, 9) * (1 - ramp(frame, groupe - 6, groupe + 4));
  const arrive = ramp(frame, groupe, groupe + 40);
  const lying = ramp(frame, plie, plie + 20);
  const invite = usePop(invitation, 8);
  return (
    <Scene bg="#FFB74D">
      <Savanna frame={frame} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${secret})`}}>
        <Badge size={70}>UN SIGNAL SECRET ?</Badge>
      </div>
      <Place x={480} y={1250} flip={look}>
        <Warthog frame={frame} width={600} wary={wary} lying={lying} blissful={frame >= invitation} />
      </Place>
      {/* les carnivores qui le chassent d'habitude */}
      <div style={{position: 'absolute', inset: 0, opacity: predators}}>
        <Place x={900} y={1500} scale={predators}>
          <Lion frame={frame} width={300} />
        </Place>
        <div style={{position: 'absolute', left: 800, top: 1180, transform: `scale(${predators})`}}>
          <Badge size={60} color="#FF5252">!</Badge>
        </div>
      </div>
      {[0, 1, 2, 3].map((i) => (
        <Place key={i} x={interpolate(arrive, [0, 1], [1300 + i * 150, 760 + i * 80])} y={1500 + (i % 2) * 90} flip>
          <Mongoose frame={frame + i * 5} width={190} walking={arrive > 0 && arrive < 1} />
        </Place>
      ))}
      {frame >= mefiant && frame < groupe ? <Bubble text="?" x={520} y={960} size={80} delay={mefiant} /> : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, display: 'flex', justifyContent: 'center', transform: `scale(${invite}) rotate(-4deg)`}}>
        <div style={{position: 'relative'}}>
          <svg width={280} height={190} viewBox="0 0 280 190">
            <rect x={10} y={10} width={260} height={170} rx={14} fill="#FFF8E1" stroke="#16121F" strokeWidth={10} />
            <path d="M14 18 L140 110 L266 18" stroke="#16121F" strokeWidth={10} fill="none" strokeLinejoin="round" />
            <path d="M140 160 C 110 140 104 126 112 116 C 120 106 136 110 140 122 C 144 110 160 106 168 116 C 176 126 170 140 140 160 Z" fill="#FF4081" stroke="#16121F" strokeWidth={5} />
          </svg>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center', transform: `scale(${invite})`}}>
        <Badge size={64}>INVITATION</Badge>
      </div>
    </Scene>
  );
};
