import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../NepenthesVideo';
import {useCue} from '../cue';
import {Ant, Bat, Jungle, Pitcher, Treeshrew} from '../characters/Jungle';
import {Badge} from '../characters/Props';
import {Place, Scene, ramp, usePop} from '../ui';

const Crown: React.FC<{size?: number}> = ({size = 120}) => (
  <svg viewBox="0 0 120 90" width={size} style={{overflow: 'visible'}}>
    <path d="M10 80 L10 30 L35 55 L60 15 L85 55 L110 30 L110 80 Z" fill="#FFD54F" stroke="#16121F" strokeWidth={7} strokeLinejoin="round" />
    <circle cx={60} cy={60} r={8} fill="#E53935" />
  </svg>
);

export const Conclusion: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const toilettes = useCue('toilettes');
  const piege = useCue('piege');
  const hotel = useCue('hotel');
  const quelque = useCue('quelque');
  const extra = useCue('extraordinaire');
  const a = usePop(toilettes, 9) * (1 - ramp(frame, quelque - 6, quelque));
  const b = usePop(piege, 9) * (1 - ramp(frame, quelque - 6, quelque));
  const c = usePop(hotel, 9) * (1 - ramp(frame, quelque - 6, quelque));
  const king = usePop(quelque, 10);
  const crown = usePop(extra, 8);
  const trio = [
    {s: a, label: 'TOILETTES', x: 200, extra: <Treeshrew frame={frame} width={150} sitting />},
    {s: b, label: 'PIÈGE', x: 540, extra: <Ant frame={frame} size={70} />},
    {s: c, label: 'HÔTEL', x: 880, extra: <Bat frame={frame} size={110} />},
  ];
  return (
    <Scene bg="#81D4FA">
      <Jungle frame={frame} />
      {trio.map((p, i) => (
        <div key={i} style={{position: 'absolute', inset: 0, transform: `scale(${p.s})`, transformOrigin: `${p.x}px 1250px`}}>
          <Place x={p.x} y={1250}>
            <Pitcher frame={frame + i * 10} height={420} red={i === 1} face="happy" />
          </Place>
          <Place x={p.x} y={980}>
            {p.extra}
          </Place>
          <div style={{position: 'absolute', left: p.x - 150, width: 300, top: 1480, display: 'flex', justifyContent: 'center'}}>
            <Badge size={44}>{p.label}</Badge>
          </div>
        </div>
      ))}
      {/* le toupaye sur son trône */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${king})`, transformOrigin: '540px 1200px'}}>
        <Place x={540} y={1200}>
          <Pitcher frame={frame} height={700} face="happy" />
        </Place>
        <Place x={610} y={1000} flip>
          <Treeshrew frame={frame} width={240} sitting />
        </Place>
        <Place x={600} y={880} scale={crown} rotate={Math.sin(frame * 0.2) * 6}>
          <Crown size={110} />
        </Place>
        <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', transform: `scale(${crown})`}}>
          <Badge size={58}>LA PLUS EXTRAORDINAIRE</Badge>
        </div>
      </div>
    </Scene>
  );
};
