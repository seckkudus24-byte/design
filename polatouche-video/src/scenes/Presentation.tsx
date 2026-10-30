import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PolatoucheVideo';
import {useCue} from '../cue';
import {Forest} from '../characters/Forest';
import {Squirrel} from '../characters/Squirrel';
import {Badge} from '../characters/Props';
import {Hearts} from '../characters/Icons';
import {StickMan} from '../characters/StickMan';
import {Place, Scene, ramp, usePop} from '../ui';

export const Presentation: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const polatouche = useCue('polatouche');
  const yeux = useCue('yeux');
  const mignonne = useCue('mignonne');
  const dangereux = useCue('dangereux');
  const mourir = useCue('mourir');
  const enter = usePop(6, 11);
  const name = usePop(polatouche, 9) * (1 - ramp(frame, yeux - 6, yeux));
  const zoom = 1 + 0.18 * ramp(frame, yeux, yeux + 15);
  const hearts = ramp(frame, mignonne, mignonne + 10);
  const danger = usePop(dangereux, 8);
  const faint = ramp(frame, mourir, mourir + 15);
  return (
    <Scene bg="#4FC3F7">
      <Forest frame={frame} />
      {/* branche */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M-20 1360 Q 400 1330 820 1380" stroke="#6D4C41" strokeWidth={46} fill="none" strokeLinecap="round" />
        <path d="M600 1365 l90 -60" stroke="#6D4C41" strokeWidth={22} strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '520px 1100px'}}>
        <Place x={480} y={1180} scale={enter}>
          <Squirrel frame={frame} width={500} />
        </Place>
      </div>
      <Hearts frame={frame} amount={hearts} x={520} y={950} spread={600} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 650, display: 'flex', justifyContent: 'center', transform: `scale(${name})`}}>
        <Badge size={84}>POLATOUCHE</Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', transform: `scale(${danger}) rotate(${Math.sin(frame * 0.4) * 3}deg)`}}>
        <Badge size={62} color="#FF5252">
          DANGER :<br />TROP MIGNON !
        </Badge>
      </div>
      <Place x={900} y={1500} rotate={faint * -85}>
        <StickMan frame={frame} pose={frame >= mignonne ? 'surprised' : 'idle'} height={260} style={{transform: 'scaleX(-1)'}} />
      </Place>
    </Scene>
  );
};
