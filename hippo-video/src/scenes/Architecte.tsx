import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../HippoVideo';
import {HippoFace} from '../characters/Hippo';
import {Fish} from '../characters/Animals';
import {StickMan} from '../characters/StickMan';
import {Bubble, Caption, Place, Scene, prog} from '../ui';

type Pt = [number, number];

// Courbe de Bézier cubique échantillonnée, pour pouvoir y faire marcher l'hippo.
const bezier = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number): Pt[] =>
  Array.from({length: n}, (_, i) => {
    const t = i / (n - 1);
    const u = 1 - t;
    return [
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ];
  });

const PATH: Pt[] = [
  ...bezier([540, 1600], [180, 1450], [920, 1300], [600, 1120], 60),
  ...bezier([600, 1120], [300, 950], [250, 850], [560, 720], 60).slice(1),
];
const toD = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
const D = toD(PATH);
const LEN = PATH.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - PATH[i][0], p[1] - PATH[i][1]), 0);

export const Architecte: React.FC<SceneProps> = ({dur, text}) => {
  const frame = useCurrentFrame();
  const walk = prog(frame, dur, 0.05, 0.5);
  const flood = prog(frame, dur, 0.5, 0.85);
  const pos = PATH[Math.min(PATH.length - 1, Math.round(walk * (PATH.length - 1)))];
  const fish = flood > 0.6 ? PATH[Math.round(((frame * 1.2) % 100) / 100 * (PATH.length - 1) * flood)] : null;
  return (
    <Scene bg="#8BC34A">
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {Array.from({length: 40}, (_, i) => (
          <path key={i} d={`M${(i * 263) % 1060} ${640 + ((i * 397) % 1200)} l10 -26 l10 26`} stroke="#558B2F" strokeWidth={6} fill="none" />
        ))}
        {/* rivière principale */}
        <path d="M-20 1580 Q 540 1540 1100 1600 L 1100 1920 L -20 1920 Z" fill="#29B6F6" stroke="#0277BD" strokeWidth={10} />
        {/* sentier creusé par l'hippo */}
        <path d={D} stroke="#8D6E63" strokeWidth={90} fill="none" strokeLinecap="round" strokeDasharray={`${LEN} ${LEN + 200}`} strokeDashoffset={LEN * (1 - walk)} />
        {/* l'eau remplit le sentier */}
        <path d={D} stroke="#29B6F6" strokeWidth={64} fill="none" strokeLinecap="round" strokeDasharray={`${LEN} ${LEN + 200}`} strokeDashoffset={LEN * (1 - flood)} />
        <mask id="flooded">
          <path d={D} stroke="#fff" strokeWidth={64} fill="none" strokeDasharray={`${LEN} ${LEN + 200}`} strokeDashoffset={LEN * (1 - flood)} />
        </mask>
        <path d={D} stroke="#fff" strokeWidth={8} fill="none" strokeDasharray="30 60" strokeDashoffset={-frame * 4} opacity={0.6} mask="url(#flooded)" />
      </svg>
      {fish ? (
        <Place x={fish[0]} y={fish[1]}>
          <Fish frame={frame} size={70} color="#FFCA28" />
        </Place>
      ) : null}
      {walk < 1 || flood === 0 ? (
        <Place x={pos[0]} y={pos[1]} rotate={Math.sin(frame * 0.5) * 6}>
          <HippoFace frame={frame} size={190} />
        </Place>
      ) : (
        <Place x={pos[0]} y={pos[1] - 40}>
          <HippoFace frame={frame} size={190} />
        </Place>
      )}
      <Place x={890} y={1180}>
        <StickMan frame={frame} pose={flood > 0.3 ? 'surprised' : 'point'} height={280} style={{transform: 'scaleX(-1)'}} />
      </Place>
      {flood > 0.3 ? <Bubble text="WAOUH !" x={700} y={880} size={66} tail="right" delay={Math.round(dur * 0.62)} /> : null}
      <Caption text={text} size={96} top={150} />
    </Scene>
  );
};
