import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PhacochereVideo';
import {useCue} from '../cue';
import {Lion, Mongoose, Savanna, Warthog} from '../characters/Savanna';
import {Badge} from '../characters/Props';
import {SPOTS, hogPoint} from '../spots';
import {Bubble, Place, Scene, ramp, usePop} from '../ui';

export const Garde: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const debarrasse = useCue('debarrasse');
  const garde = useCue('garde');
  const predateur = useCue('predateur');
  const alerte = useCue("l'alerte");
  const clean = usePop(debarrasse, 9) * (1 - ramp(frame, garde - 6, garde));
  const sentinel = usePop(garde, 9);
  const lion = ramp(frame, predateur - 5, predateur + 30);
  const alarm = frame >= alerte;
  const p = hogPoint(SPOTS[1].x, SPOTS[1].y, 420, 1250, 620, 1);
  return (
    <Scene bg="#FFB74D">
      <Savanna frame={frame} />
      <Place x={420} y={1250}>
        <Warthog frame={frame} width={620} lying={1} blissful={!alarm} wary={alarm} />
      </Place>
      <Place x={p.x - 30} y={p.y - 60} rotate={-10}>
        <Mongoose frame={frame} width={180} eating />
      </Place>
      {frame < garde ? <Bubble text="AHHH…" x={340} y={940} size={66} delay={4} /> : null}
      {/* sentinelle sur une termitière */}
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: sentinel}}>
        <path d="M800 1420 Q 820 1250 860 1240 Q 900 1250 920 1420 Z" fill="#A1887F" stroke="#2B1E14" strokeWidth={7} />
      </svg>
      <Place x={860} y={1130} scale={sentinel}>
        <Mongoose frame={frame} width={260} standing alarm={alarm} />
      </Place>
      <Place x={interpolate(lion, [0, 1], [1350, 1000])} y={1560}>
        <Lion frame={frame} width={280} scared={alarm} />
      </Place>
      {alarm ? <Bubble text="ALERTE !" x={560} y={900} size={70} tail="right" delay={alerte} /> : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${clean})`}}>
        <Badge size={70}>ZÉRO EFFORT</Badge>
      </div>
      <div style={{position: 'absolute', left: 620, top: 700, transform: `scale(${sentinel * (1 - (alarm ? 1 : 0))})`}}>
        <Badge size={58} color="#FFFFFF">
          SENTINELLE
        </Badge>
      </div>
    </Scene>
  );
};
