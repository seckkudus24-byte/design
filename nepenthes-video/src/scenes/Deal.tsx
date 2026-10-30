import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../NepenthesVideo';
import {useCue} from '../cue';
import {Candy, Jungle, Pellet, Pitcher, Treeshrew} from '../characters/Jungle';
import {Badge} from '../characters/Props';
import {POT, RIM} from '../layout';
import {Place, Scene, ramp, usePop} from '../ui';

export const Deal: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const nectar = useCue('nectar');
  const bonbon = useCue('bonbon');
  const installe = useCue("s'installe");
  const leche = useCue('leche');
  const besoins = useCue('besoins');
  const petitDej = useCue('petit-dej');
  const title = usePop(4, 9) * (1 - ramp(frame, nectar - 6, nectar));
  const sweet = ramp(frame, nectar, nectar + 20);
  const candy = usePop(bonbon, 9) * (1 - ramp(frame, installe - 6, installe));
  const sit = ramp(frame, installe - 10, installe + 20);
  const licking = frame >= leche;
  const drops = frame >= besoins;
  const combo = usePop(petitDej, 9);
  return (
    <Scene bg="#81D4FA">
      <Jungle frame={frame} />
      <Place x={POT.x} y={POT.y}>
        <Pitcher frame={frame} height={POT.h} nectar={sweet} face={drops ? 'yum' : 'happy'} />
      </Place>
      <Place x={RIM.x + 70 + (1 - sit) * 500} y={RIM.y - 70 + (1 - sit) * 380} flip>
        <Treeshrew frame={frame} width={240} sitting={sit >= 1} walking={sit > 0 && sit < 1} licking={licking} />
      </Place>
      {drops
        ? [0, 1, 2].map((i) => {
            const t = ((frame - besoins + i * 15) % 45) / 45;
            return (
              <Place key={i} x={RIM.x + 120 - t * 60} y={RIM.y - 20 + t * 220} scale={1 - t * 0.4}>
                <Pellet size={34} />
              </Place>
            );
          })
        : null}
      <div style={{position: 'absolute', left: 120, top: 760, transform: `scale(${candy}) rotate(-10deg)`}}>
        <Candy size={180} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${title})`}}>
        <Badge size={60}>LE DEAL LE PLUS BIZARRE</Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', transform: `scale(${combo})`}}>
        <Badge size={60}>PETIT-DÉJ + TOILETTES</Badge>
      </div>
    </Scene>
  );
};
