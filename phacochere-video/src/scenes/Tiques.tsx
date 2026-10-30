import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PhacochereVideo';
import {useCue} from '../cue';
import {Lion, Savanna, Tick, Warthog} from '../characters/Savanna';
import {Badge} from '../characters/Props';
import {SPOTS} from '../spots';
import {Bubble, Place, Scene, ramp, usePop} from '../ui';

export const Tiques: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const tiques = useCue('tiques');
  const crochets = useCue('crochets');
  const sang = useCue('sang');
  const jours = useCue('jours');
  const nombreux = useCue('nombreux');
  const affaiblir = useCue("l'affaiblir");
  const lent = useCue('lent');
  const boue = useCue('boue');

  const scratch = frame < tiques ? Math.sin(frame * 1.2) * 4 : 0;
  const lens = usePop(crochets, 9) * (1 - ramp(frame, jours, jours + 8));
  const full = ramp(frame, sang, sang + 30);
  const days = usePop(jours, 9) * (1 - ramp(frame, nombreux - 4, nombreux + 4));
  const count = frame >= nombreux ? SPOTS.length : 3;
  const pale = ramp(frame, affaiblir, affaiblir + 30);
  const slow = frame >= lent && frame < boue;
  const lion = usePop(lent + 10, 9) * (1 - ramp(frame, boue, boue + 10));
  const mud = ramp(frame, boue, boue + 15);
  const roll = frame >= boue + 10 ? Math.sin((frame - boue) * 0.25) * 25 : 0;
  const ticks = SPOTS.map((p, i) => ({...p, s: i < count ? popTick(frame, i < 3 ? tiques + i * 6 : nombreux + (i - 3) * 4) : 0, full: full * 0.7}));
  return (
    <Scene bg="#FFB74D">
      <Savanna frame={frame} mud={mud} />
      <Place x={slow ? 440 + (frame - lent) * 0.6 : 540} y={1250} rotate={roll}>
        <div style={{transform: `translate(${scratch}px, 0)`}}>
          <Warthog frame={frame} width={640} pale={pale} walking={slow} ticks={ticks} />
        </div>
      </Place>
      {frame < tiques ? <Bubble text="GRATTE GRATTE !" x={420} y={960} size={56} delay={6} /> : null}
      {/* loupe sur une tique et ses crochets */}
      <div style={{position: 'absolute', left: 540 - 190, top: 620, width: 380, height: 380, borderRadius: 190, background: '#F3D9C6', border: '14px solid #16121F', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${lens})`, overflow: 'hidden'}}>
        <Tick size={300} hooks full={full} frame={frame} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1030, display: 'flex', justifyContent: 'center', transform: `scale(${lens * (frame >= sang ? 1 : 0)})`}}>
        <Badge size={52} color="#FF8A80">
          ELLE BOIT SON SANG
        </Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${days})`}}>
        <Badge size={74}>PENDANT DES JOURS</Badge>
      </div>
      <Place x={interpolate(lion, [0, 1], [1300, 900])} y={1450}>
        <Lion frame={frame} width={300} />
      </Place>
      {frame >= boue + 10 ? <Bubble text="SPLOTCH !" x={560} y={960} size={60} delay={boue + 10} /> : null}
    </Scene>
  );
};

// Apparition « pop » d'une tique (sans hook React, utilisable dans une boucle).
const popTick = (frame: number, at: number) => {
  const t = Math.max(0, Math.min(1, (frame - at) / 8));
  return t < 1 ? t * 1.15 : 1;
};
