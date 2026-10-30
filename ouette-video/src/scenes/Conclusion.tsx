import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../OuetteVideo';
import {useCue} from '../cue';
import {River, Snowfall} from '../characters/Winter';
import {Goose} from '../characters/Goose';
import {SoftHeart} from '../characters/Bits';
import {Badge} from '../characters/Props';
import {Place, Scene, ramp, usePop} from '../ui';

export const Conclusion: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const lien = useCue('lien');
  const attachement = useCue("l'attachement");
  const pair = usePop(4, 14);
  const link = ramp(frame, lien, lien + 30);
  const big = usePop(attachement, 12);
  const float = Math.sin(frame * 0.05) * 15;
  return (
    <Scene bg="#6A5A9E">
      <River frame={frame} snow={1} ice={1} dusk={1} />
      <Snowfall frame={frame} amount={0.4} />
      {/* le couple réuni, comme un souvenir dans le ciel */}
      <div style={{position: 'absolute', inset: 0, opacity: 0.9}}>
        <Place x={380} y={1080 + float} scale={pair}>
          <Goose frame={frame} width={340} flying />
        </Place>
        <Place x={700} y={1060 - float} scale={pair} flip>
          <Goose frame={frame + 20} width={320} female flying />
        </Place>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M430 1060 Q 540 960 650 1050" stroke="#FF8A80" strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray="20 16" pathLength={1} opacity={link} />
      </svg>
      <div style={{position: 'absolute', left: 540 - 130, top: 700, transform: `scale(${big * (1 + Math.sin(frame * 0.15) * 0.05)})`}}>
        <SoftHeart size={260} glow={big} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', transform: `scale(${usePop(4, 10) * (1 - ramp(frame, lien - 6, lien))})`}}>
        <Badge size={70} color="#FFFFFF">
          CONCLUSION
        </Badge>
      </div>
    </Scene>
  );
};
