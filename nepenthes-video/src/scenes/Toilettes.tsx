import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../NepenthesVideo';
import {useCue} from '../cue';
import {Jungle, Pitcher, Treeshrew} from '../characters/Jungle';
import {Badge} from '../characters/Props';
import {LID, POT, RIM} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';

const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; s: number}> = ({x1, y1, x2, y2, s}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', opacity: s}}>
    <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke="#16121F" strokeWidth={14} strokeLinecap="round" />
    <circle cx={x2} cy={y2} r={14} fill="#16121F" />
  </svg>
);

export const Toilettes: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const nepenthes = useCue('nepenthes');
  const cuvette = useCue('cuvette');
  const rebord = useCue('rebord');
  const couvercle = useCue('couvercle');
  const expres = useCue('expres');
  const title = usePop(4, 9) * (1 - ramp(frame, nepenthes - 6, nepenthes));
  const pot = usePop(nepenthes - 6, 10);
  const name = usePop(nepenthes, 9) * (1 - ramp(frame, cuvette - 6, cuvette));
  const bowl = usePop(cuvette, 9) * (1 - ramp(frame, expres - 6, expres));
  const rim = usePop(rebord, 9) * (1 - ramp(frame, expres - 6, expres));
  const lid = usePop(couvercle, 9) * (1 - ramp(frame, expres - 6, expres));
  const sit = usePop(expres, 10);
  return (
    <Scene bg="#81D4FA">
      <Jungle frame={frame} />
      <Place x={POT.x} y={POT.y} scale={pot}>
        <Pitcher frame={frame} height={POT.h} face="happy" />
      </Place>
      {/* cuvette : contour en pointillés */}
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: bowl}}>
        <ellipse cx={POT.x} cy={POT.y + 80} rx={190} ry={280} fill="none" stroke="#FFEB3B" strokeWidth={12} strokeDasharray="30 18" />
      </svg>
      <Arrow x1={880} y1={1000} x2={RIM.x + 100} y2={RIM.y} s={rim} />
      <div style={{position: 'absolute', left: 760, top: 920, transform: `scale(${rim})`}}>
        <Badge size={52}>REBORD</Badge>
      </div>
      <Arrow x1={200} y1={760} x2={LID.x - 40} y2={LID.y} s={lid} />
      <div style={{position: 'absolute', left: 60, top: 690, transform: `scale(${lid})`}}>
        <Badge size={52}>COUVERCLE</Badge>
      </div>
      <Place x={RIM.x + 70} y={RIM.y - 70} scale={sit} flip>
        <Treeshrew frame={frame} width={240} sitting />
      </Place>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${title})`}}>
        <Badge size={66} color="#FF8A80">
          DES TOILETTES… CARNIVORES
        </Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${name})`}}>
        <Badge size={80} color="#A5D6A7">
          NÉPENTHÈS
        </Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', transform: `scale(${sit})`}}>
        <Badge size={62}>FAIT POUR LUI !</Badge>
      </div>
    </Scene>
  );
};
