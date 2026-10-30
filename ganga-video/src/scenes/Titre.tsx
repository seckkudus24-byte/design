import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GangaVideo';
import {useCue} from '../cue';
import {TEXT} from '../texts';
import {Ganga, Chick} from '../characters/Ganga';
import {Desert} from '../characters/Desert';
import {Sponge} from '../characters/Props';
import {StickMan} from '../characters/StickMan';
import {Bubble, Caption, FONT, Place, Scene, usePop} from '../ui';

export const Titre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const eponge = useCue('éponge');
  const petits = useCue('petits');
  const sponge = usePop(eponge, 8);
  const chicks = usePop(petits, 9);
  const enter = usePop(8, 12);
  return (
    <Scene first bg="#FFCA28">
      <Desert frame={frame} />
      <Place x={interpolate(enter, [0, 1], [-300, 360])} y={1250}>
        <Ganga frame={frame} width={480} wet={sponge * 0.35} />
      </Place>
      {/* oiseau = éponge ? */}
      <div style={{position: 'absolute', left: 640, top: 1120, transform: `scale(${sponge}) rotate(${Math.sin(frame * 0.2) * 6}deg)`}}>
        <Sponge size={240} />
      </div>
      <div style={{position: 'absolute', left: 600, top: 1000, fontFamily: FONT, fontSize: 130, color: '#fff', WebkitTextStroke: '14px #16121F', paintOrder: 'stroke fill', transform: `scale(${sponge})`}}>
        = ?
      </div>
      {[0, 1, 2].map((i) => (
        <Place key={i} x={580 + i * 170} y={1540 - (i % 2) * 20} scale={chicks}>
          <Chick frame={frame + i * 9} size={170} />
        </Place>
      ))}
      <Place x={130} y={980}>
        <StickMan frame={frame} pose={frame >= eponge ? 'surprised' : 'idle'} height={260} />
      </Place>
      {frame >= eponge ? <Bubble text="?!" x={170} y={720} size={76} delay={eponge} /> : null}
      <Caption text={TEXT.titre} size={88} top={140} />
    </Scene>
  );
};
