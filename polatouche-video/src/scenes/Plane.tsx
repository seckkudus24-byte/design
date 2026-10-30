import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PolatoucheVideo';
import {useCue} from '../cue';
import {Forest} from '../characters/Forest';
import {Birch, Glider, Squirrel} from '../characters/Squirrel';
import {Badge} from '../characters/Props';
import {Place, Scene, ramp, usePop} from '../ui';

export const Plane: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const membrane = useCue('membrane');
  const saute = useCue('saute');
  const deploie = useCue('deploie');
  const dizaines = useCue('dizaines');
  const technique = useCue('technique');

  // 1) assis sur l'arbre de gauche  2) gros plan membrane  3) le saut et le vol plané
  const closeup = frame >= membrane && frame < saute;
  const spread = ramp(frame, membrane, membrane + 25);
  const flying = frame >= saute;
  const leg = ((frame - saute) % 75) / 75; // une traversée toutes les 2,5 s
  const open = frame >= deploie ? 1 : ramp(frame, saute, saute + 12) * 0.3;
  const gx = interpolate(leg, [0, 1], [170, 900]);
  const gy = interpolate(leg, [0, 1], [820, 1330]) - Math.sin(leg * Math.PI) * 80;
  const dist = usePop(dizaines, 9) * (1 - ramp(frame, technique - 6, technique));
  const perfect = usePop(technique, 9);
  return (
    <Scene bg="#4FC3F7">
      <Forest frame={frame} />
      <div style={{position: 'absolute', left: 80, top: 520}}>
        <Birch height={1000} />
      </div>
      <div style={{position: 'absolute', left: 820, top: 820}}>
        <Birch height={800} />
      </div>
      {!flying && !closeup ? (
        <Place x={300} y={800}>
          <Squirrel frame={frame} width={300} />
        </Place>
      ) : null}
      {closeup ? (
        <>
          <Place x={540} y={1050}>
            <Glider frame={frame} width={640} spread={spread} />
          </Place>
          <div style={{position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', transform: `scale(${Math.min(1, spread * 2)})`}}>
            <Badge size={80}>MEMBRANE</Badge>
          </div>
          <svg width={1080} height={1920} style={{position: 'absolute', opacity: spread}}>
            {[
              [380, 800, 300, 960],
              [700, 800, 780, 960],
            ].map(([x1, y1, x2, y2], i) => (
              <g key={i} stroke="#16121F" strokeWidth={12} strokeLinecap="round">
                <line x1={x1} y1={y1} x2={x2} y2={y2} />
                <path d={`M${x2} ${y2} l${i ? -30 : 30} -8 M${x2} ${y2} l${i ? 6 : -6} -30`} />
              </g>
            ))}
          </svg>
        </>
      ) : null}
      {flying ? (
        <Place x={gx} y={gy} rotate={60}>
          <Glider frame={frame} width={300} spread={open} />
        </Place>
      ) : null}
      {/* dizaines de mètres */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${dist})`, transformOrigin: '540px 1100px'}}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <path d="M200 1150 L880 1150" stroke="#16121F" strokeWidth={14} strokeDasharray="30 20" />
          <path d="M200 1150 l40 -26 M200 1150 l40 26 M880 1150 l-40 -26 M880 1150 l-40 26" stroke="#16121F" strokeWidth={14} strokeLinecap="round" />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1180, display: 'flex', justifyContent: 'center'}}>
          <Badge size={56}>DES DIZAINES DE MÈTRES</Badge>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, display: 'flex', justifyContent: 'center', transform: `scale(${perfect})`}}>
        <Badge size={66} rotate={3}>
          TECHNIQUE PARFAITE !
        </Badge>
      </div>
    </Scene>
  );
};
