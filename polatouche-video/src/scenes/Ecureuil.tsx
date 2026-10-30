import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PolatoucheVideo';
import {useCue} from '../cue';
import {Forest} from '../characters/Forest';
import {Birch, Rat, Squirrel} from '../characters/Squirrel';
import {Badge} from '../characters/Props';
import {Check, Cross} from '../characters/Icons';
import {Place, Scene, ramp, usePop} from '../ui';

export const Ecureuil: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const rat = useCue('rat');
  const bien = useCue('bien');
  const famille = useCue('famille');
  const arbres = useCue('arbres');
  const sol = useCue('descend');

  const ratIn = usePop(rat, 9) * (1 - ramp(frame, famille - 6, famille));
  const cross = ramp(frame, bien, bien + 12);
  const check = usePop(bien + 6, 9);
  const fam = usePop(famille, 9) * (1 - ramp(frame, arbres - 6, arbres));
  const tree = ramp(frame, arbres - 6, arbres + 10);
  const climb = ramp(frame, arbres, arbres + 30);
  const solX = usePop(sol, 9);
  return (
    <Scene bg="#4FC3F7">
      <Forest frame={frame} />
      {/* rat volant ? -> non, écureuil ! */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${ratIn})`, transformOrigin: '540px 1150px'}}>
        <Place x={300} y={1150}>
          <Rat width={360} />
        </Place>
        <div style={{position: 'absolute', left: 120, top: 1260}}>
          <Badge size={54} color="#FFFFFF">RAT VOLANT ?</Badge>
        </div>
        {cross > 0 ? (
          <Place x={300} y={1150}>
            <Cross size={300} draw={cross} />
          </Place>
        ) : null}
        <Place x={780} y={1180} scale={check}>
          <Squirrel frame={frame} width={340} />
        </Place>
        <Place x={900} y={940} scale={check}>
          <Check size={130} />
        </Place>
      </div>
      {/* même famille */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${fam})`, transformOrigin: '540px 1150px'}}>
        <Place x={330} y={1200}>
          <Squirrel frame={frame} width={340} />
        </Place>
        <Place x={760} y={1200} flip>
          <div style={{filter: 'sepia(1) saturate(3.5) hue-rotate(-18deg) brightness(0.95)'}}>
            <Squirrel frame={frame + 20} width={340} />
          </div>
        </Place>
        <div style={{position: 'absolute', left: 0, right: 0, top: 720, display: 'flex', justifyContent: 'center'}}>
          <Badge size={70}>MÊME FAMILLE</Badge>
        </div>
      </div>
      {/* dans les arbres, rarement au sol */}
      <div style={{position: 'absolute', inset: 0, opacity: tree}}>
        <div style={{position: 'absolute', left: 440, top: 520}}>
          <Birch height={1000} />
        </div>
        <Place x={640} y={1300 - climb * 600} rotate={-80 * (1 - climb) + 0}>
          <Squirrel frame={frame} width={240} />
        </Place>
        <div style={{position: 'absolute', left: 60, top: 1560, transform: `scale(${solX})`}}>
          <Badge size={56} color="#FF8A80" rotate={-3}>
            AU SOL : RAREMENT
          </Badge>
        </div>
      </div>
    </Scene>
  );
};
