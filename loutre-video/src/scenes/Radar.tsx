import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../LoutreVideo';
import {useCue} from '../cue';
import {Amazon, Fish, Otter} from '../characters/River';
import {SURFACE} from './helpers';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Radar: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const trouble = useCue('trouble');
  const moustaches = useCue('moustaches');
  const vibrations = useCue('vibrations');
  const title = usePop(4, 9) * (1 - ramp(frame, trouble - 6, trouble));
  const murk = 0.4 + ramp(frame, trouble - 6, trouble + 20) * 0.6;
  const radar = ramp(frame, moustaches, moustaches + 15);
  const vib = frame >= vibrations;
  return (
    <Scene bg="#81D4FA">
      <Amazon frame={frame} surface={SURFACE} murk={murk} />
      {/* brouillard d'eau boueuse */}
      <div style={{position: 'absolute', left: 0, right: 0, top: SURFACE, bottom: 0, background: '#6D5A30', opacity: 0.35 * murk}} />
      <Place x={380} y={SURFACE + 260}>
        <Otter frame={frame} width={560} radar={radar} />
      </Place>
      {[0, 1].map((i) => (
        <Place key={i} x={830 + i * 60} y={SURFACE + 160 + i * 180} scale={0.9}>
          <div style={{opacity: 0.4 + (vib ? 0.5 : 0)}}>
            <Fish frame={frame + i * 8} size={130} color="#B0BEC5" />
            {vib ? (
              <svg width={160} height={80} style={{position: 'absolute', left: -20, top: -10, overflow: 'visible'}}>
                {[0, 1].map((k) => {
                  const t = ((frame + k * 10 + i * 5) % 20) / 20;
                  return <ellipse key={k} cx={60} cy={35} rx={60 + t * 40} ry={30 + t * 20} fill="none" stroke="#FFEB3B" strokeWidth={4} opacity={1 - t} />;
                })}
              </svg>
            ) : null}
          </div>
        </Place>
      ))}
      <TopBadge s={title} color="#FFE082">
        UN RADAR SOUS L'EAU
      </TopBadge>
      <TopBadge s={usePop(moustaches, 9)} color="#FFFFFF" size={60}>
        DES MOUSTACHES-RADAR
      </TopBadge>
    </Scene>
  );
};
