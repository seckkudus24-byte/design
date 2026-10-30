import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GangaVideo';
import {useCue} from '../cue';
import {TEXT} from '../texts';
import {Chick, Ganga, Nest} from '../characters/Ganga';
import {Desert} from '../characters/Desert';
import {Badge, Drop, Medal} from '../characters/Props';
import {Caption, Place, Scene, ramp, usePop} from '../ui';

export const Conclusion: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const recommence = useCue('recommence');
  const infatigable = useCue('infatigable');
  const goutte = useCue('goutte');

  const sunrise = ramp(frame, 0, recommence);
  const loop = usePop(recommence, 9) * (1 - ramp(frame, infatigable - 8, infatigable));
  const flyOff = ramp(frame, recommence, infatigable);
  const back = frame >= infatigable;
  const medal = usePop(infatigable, 8) * (1 - ramp(frame, goutte - 8, goutte));
  const drop = usePop(goutte, 10);
  const sky = `linear-gradient(${interpolate(sunrise, [0, 1], [0, 1]) > 0.5 ? '#FF8F00' : '#FF7043'} 0%, #FFCA28 45%, #FFE082 100%)`;
  return (
    <Scene bg="#FFB300">
      <Desert frame={frame} sky={sky} sunX={880} sunY={interpolate(sunrise, [0, 1], [1250, 760])} />
      <Place x={760} y={1560}>
        <Nest width={420} />
      </Place>
      {[0, 1, 2].map((i) => (
        <Place key={i} x={650 + i * 115} y={1520 - (i % 2) * 15}>
          <Chick frame={frame + i * 7} size={150} />
        </Place>
      ))}
      {back ? (
        <Place x={300} y={1360}>
          <Ganga frame={frame} width={440} />
        </Place>
      ) : (
        <Place x={interpolate(flyOff, [0, 1], [300, 1300])} y={interpolate(flyOff, [0, 1], [1360, 800])}>
          <Ganga frame={frame} width={440} flying={flyOff > 0} />
        </Place>
      )}
      {/* tout recommence chaque jour */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${loop})`}}>
        <svg width={220} height={220} viewBox="0 0 220 220" style={{transform: `rotate(${frame * 4}deg)`}}>
          <path d="M110 30 A 80 80 0 1 1 30 110" stroke="#16121F" strokeWidth={34} fill="none" strokeLinecap="round" />
          <path d="M110 30 A 80 80 0 1 1 30 110" stroke="#fff" strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d="M8 104 L30 140 L56 104 Z" fill="#fff" stroke="#16121F" strokeWidth={8} strokeLinejoin="round" />
        </svg>
        <Badge size={60}>CHAQUE JOUR</Badge>
      </div>
      {/* père infatigable */}
      <div style={{position: 'absolute', left: 260, top: 860, transform: `scale(${medal}) rotate(${Math.sin(frame * 0.2) * 6}deg)`}}>
        <Medal size={230} text="SUPER PAPA" />
      </div>
      {/* une goutte peut sauver une vie */}
      <div style={{position: 'absolute', left: 540 - 150, top: 720, transform: `scale(${drop * (1 + Math.sin(frame * 0.2) * 0.05)})`}}>
        <Drop size={300} heart glow={drop} />
      </div>
      <Caption text={TEXT.conclusion} size={96} top={150} />
    </Scene>
  );
};
