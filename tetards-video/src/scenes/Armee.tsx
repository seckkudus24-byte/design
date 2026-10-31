import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../TetardsVideo';
import {useCue} from '../cue';
import {Eggs, Pond, Swarm} from '../characters/Pond';
import {Zzz} from '../characters/Icons';
import {Place, Scene, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const Armee: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const etang = useCue('etang');
  const centaines = useCue('centaines');
  const regroupent = useCue('regroupent');
  const dizaines = useCue('dizaines');
  const manger = useCue('manger');
  const dormir = useCue('dormir');
  const grandir = useCue('grandir');
  const title = usePop(4, 9) * (1 - ramp(frame, etang - 6, etang));
  const eggs = usePop(etang, 9) * (1 - ramp(frame, centaines, centaines + 15));
  const count = interpolate(frame, [centaines, regroupent, dizaines + 20], [0, 12, 70], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const spread = interpolate(frame, [regroupent, dizaines + 20], [150, 300], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const big = usePop(dizaines, 9) * (1 - ramp(frame, manger - 6, manger));
  const prog = [usePop(manger, 9), usePop(dormir, 9), usePop(grandir, 9)];
  return (
    <Scene bg="#8FD3F7">
      <Pond frame={frame} warm={0.5} />
      <Place x={540} y={950} scale={eggs}>
        <Eggs size={300} />
      </Place>
      <Swarm frame={frame} cx={540} cy={980} count={count} spread={spread} size={44} />
      <TopBadge s={title} color="#A5D6A7">
        UNE ARMÉE DE TÊTARDS
      </TopBadge>
      <TopBadge s={big} size={56}>
        DES DIZAINES DE MILLIERS !
      </TopBadge>
      {/* programme : manger, dormir, grandir */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'center', gap: 26}}>
        {['MANGER', 'DORMIR', 'GRANDIR'].map((label, i) => (
          <div key={label} style={{transform: `scale(${prog[i]})`, background: ['#C5E1A5', '#B39DDB', '#FFE082'][i], border: '9px solid #16121F', borderRadius: 30, padding: '10px 22px 2px', fontFamily: 'LuckiestGuy', fontSize: 48, boxShadow: '0 10px 0 rgba(0,0,0,0.3)', position: 'relative'}}>
            {label}
            {i === 1 && prog[1] > 0.5 ? (
              <div style={{position: 'absolute', right: -30, top: -70}}>
                <Zzz frame={frame} size={70} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Scene>
  );
};
