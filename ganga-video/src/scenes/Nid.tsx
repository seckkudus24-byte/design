import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GangaVideo';
import {useCue} from '../cue';
import {Chick, Egg, Ganga, Nest, Thermometer} from '../characters/Ganga';
import {Desert} from '../characters/Desert';
import {Badge, Drop, NoTree, Seeds} from '../characters/Props';
import {FONT, Place, Scene, ramp, usePop} from '../ui';

export const Nid: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const arbre = useCue('arbre');
  const pond = useCue('pond');
  const abri = useCue('abri');
  const deg = useCue('45');
  const poussins = useCue('poussins');
  const desseche = useCue('dessecher');
  const nourriture = useCue('nourriture');

  const tree = usePop(arbre, 9) * (1 - ramp(frame, pond, pond + 8));
  const cross = ramp(frame, arbre + 8, arbre + 22);
  const nest = usePop(pond, 10);
  const rays = ramp(frame, abri, abri + 15);
  const thermo = usePop(deg - 6, 9) * (1 - ramp(frame, nourriture - 10, nourriture));
  const level = ramp(frame, deg - 6, deg + 30);
  const hatch = ramp(frame, poussins - 10, poussins + 6);
  const compare = usePop(nourriture, 9);
  const temp = Math.round(interpolate(level, [0, 1], [20, 45]));
  return (
    <Scene bg="#FFB300">
      <Desert frame={frame} river={false} sunX={540} sunY={720} />
      {/* rayons brûlants sur le nid */}
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: rays * (0.55 + Math.sin(frame * 0.25) * 0.15)}}>
        {[-1, 0, 1].map((i) => (
          <polygon key={i} points={`${540 + i * 40},800 ${540 + i * 40 + 30},800 ${540 + i * 260 + 120},1500 ${540 + i * 260 - 60},1500`} fill="#FFF59D" />
        ))}
      </svg>
      <div style={{position: 'absolute', left: 720, top: 980, transform: `scale(${tree})`}}>
        <NoTree size={240} cross={cross} />
      </div>
      <Place x={200} y={1370}>
        <Ganga frame={frame} width={440} />
      </Place>
      <Place x={600} y={1520} scale={nest}>
        <Nest width={520} />
      </Place>
      {[0, 1, 2].map((i) =>
        hatch < 1 ? (
          <Place key={i} x={490 + i * 110} y={1490} scale={nest * (1 - hatch * 0.2)}>
            <Egg size={95} crack={hatch * 1.5} />
          </Place>
        ) : (
          <Place key={i} x={480 + i * 120} y={1460 - (i % 2) * 15}>
            <Chick frame={frame + i * 7} size={150} thirsty={frame >= desseche} />
          </Place>
        ),
      )}
      {/* thermomètre au-dessus du nid */}
      <div style={{position: 'absolute', left: 470, top: 830, transform: `scale(${thermo})`, transformOrigin: '30% 100%'}}>
        <Thermometer level={level} label={`${temp} °C`} height={460} frame={frame} />
      </div>
      {/* l'eau compte plus que la nourriture */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, transform: `scale(${compare})`}}>
        <div style={{textAlign: 'center'}}>
          <Drop size={170} />
          <div><Badge size={44}>EAU</Badge></div>
        </div>
        <div style={{fontFamily: FONT, fontSize: 160, color: '#fff', WebkitTextStroke: '16px #16121F', paintOrder: 'stroke fill'}}>&gt;</div>
        <div style={{textAlign: 'center'}}>
          <Seeds size={130} />
          <div><Badge size={44} rotate={4}>NOURRITURE</Badge></div>
        </div>
      </div>
    </Scene>
  );
};
