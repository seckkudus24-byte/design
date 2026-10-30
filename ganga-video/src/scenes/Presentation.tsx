import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GangaVideo';
import {useCue} from '../cue';
import {Ganga} from '../characters/Ganga';
import {Desert} from '../characters/Desert';
import {Badge} from '../characters/Props';
import {StickMan} from '../characters/StickMan';
import {Bubble, Place, Scene, ramp, usePop} from '../ui';

export const Presentation: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const chaudes = useCue('chaudes');
  const seches = useCue('seches');
  const secret = useCue('secret');
  const walk = ramp(frame, 0, 45);
  const label = usePop(40, 9);
  const hot = usePop(chaudes, 8);
  const cracks = ramp(frame, seches, seches + 20);
  return (
    <Scene bg="#FFCA28">
      <Desert frame={frame} sunY={760 - hot * 30} />
      {/* soleil qui chauffe encore plus */}
      <div style={{position: 'absolute', left: 860 - 170, top: 760 - 30 - 170, width: 340, height: 340, borderRadius: 170, background: 'radial-gradient(#FF6F00aa, #FF6F0000 70%)', transform: `scale(${hot * (1 + Math.sin(frame * 0.3) * 0.08)})`}} />
      {/* sol craquelé */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[
          'M100 1500 l60 30 l40 -20 l70 40 l30 -30',
          'M600 1600 l50 -30 l60 20 l40 -40 l80 10',
          'M300 1720 l70 10 l30 40 l90 -20',
          'M780 1420 l40 40 l70 -10 l50 30',
        ].map((d, i) => (
          <path key={i} d={d} stroke="#8D6E63" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${cracks} 1`} />
        ))}
      </svg>
      <Place x={interpolate(walk, [0, 1], [-250, 470])} y={1270}>
        <Ganga frame={frame} width={560} walking={walk < 1} />
      </Place>
      <div style={{position: 'absolute', left: 300, top: 860, transform: `scale(${label})`}}>
        <Badge size={80}>LE GANGA</Badge>
      </div>
      <Place x={920} y={1300}>
        <StickMan frame={frame} pose={frame >= secret ? 'surprised' : 'point'} height={260} style={{transform: 'scaleX(-1)'}} />
      </Place>
      {frame >= secret ? <Bubble text="UN SECRET…" x={560} y={1010} size={60} tail="right" delay={secret} /> : null}
    </Scene>
  );
};
