import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../GangaVideo';
import {useCue} from '../cue';
import {Ganga, Hawk, Jackal} from '../characters/Ganga';
import {Desert} from '../characters/Desert';
import {Badge} from '../characters/Props';
import {Place, Scene, ramp, usePop} from '../ui';

const FLOCK = Array.from({length: 34}, (_, i) => ({
  x: (i % 7) * 150 + random(`fx${i}`) * 90,
  y: 620 + Math.floor(i / 7) * 120 + random(`fy${i}`) * 60,
  s: 0.7 + random(`fs${i}`) * 0.5,
}));

export const Vol: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const dizaines = useCue('dizaines');
  const retour = useCue('aller-retour');
  const jour = useCue('jour');
  const seul = useCue('seul');
  const pred = useCue('autour'); // « …autour des points d'eau, les prédateurs attendent »

  // Phase 1 : le père vole seul, le compteur de km grimpe
  const km = Math.round(interpolate(ramp(frame, dizaines, retour + 15), [0, 1], [0, 100]));
  const kmBadge = usePop(dizaines - 5, 9) * (1 - ramp(frame, seul - 8, seul));
  const daily = usePop(jour, 9) * (1 - ramp(frame, seul - 8, seul));
  const solo = frame < seul;
  // Phase 2 : la grande nuée vers l'eau
  const flock = ramp(frame, seul, Math.min(dur, seul + (pred - seul) * 1.4));
  const predIn = usePop(pred, 9);
  const scroll = frame * 9;
  return (
    <Scene bg="#FFB300">
      <Desert frame={frame} scroll={solo ? scroll : scroll * 0.4} sunX={180} sunY={720} river={!solo} />
      {solo ? (
        <Place x={540 + Math.sin(frame * 0.05) * 60} y={1000 + Math.sin(frame * 0.12) * 30}>
          <Ganga frame={frame} width={460} flying />
        </Place>
      ) : (
        <>
          {/* point d'eau et prédateurs */}
          <svg width={1080} height={1920} style={{position: 'absolute'}}>
            <ellipse cx={800} cy={1460} rx={260} ry={70} fill="#4FC3F7" stroke="#0288D1" strokeWidth={8} />
          </svg>
          <Place x={980} y={1340} scale={predIn} flip>
            <Jackal frame={frame} width={240} />
          </Place>
          <Place x={760 + Math.cos(frame * 0.05) * 160} y={760 + Math.sin(frame * 0.05) * 50} scale={predIn}>
            <Hawk frame={frame} width={200} />
          </Place>
          {FLOCK.map((b, i) => {
            const x = interpolate(flock, [0, 1], [b.x - 1300, b.x + 120]) + Math.sin(frame * 0.07 + i) * 12;
            return (
              <Place key={i} x={x} y={b.y + Math.sin(frame * 0.1 + i) * 15} scale={b.s}>
                <Ganga frame={frame + i * 5} width={150} flying />
              </Place>
            );
          })}
          {predIn > 0.1
            ? [
                [930, 1180],
                [900, 640],
              ].map(([x, y], i) => (
                <div key={i} style={{position: 'absolute', left: x, top: y, transform: `scale(${predIn * (1 + Math.sin(frame * 0.4) * 0.1)})`}}>
                  <Badge size={70} color="#FF5252" rotate={8}>
                    !
                  </Badge>
                </div>
              ))
            : null}
        </>
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', transform: `scale(${kmBadge})`}}>
        <Badge size={92}>{km} KM</Badge>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1400, display: 'flex', justifyContent: 'center', transform: `scale(${daily})`}}>
        <Badge size={64} rotate={3} color="#FFFFFF">
          CHAQUE JOUR !
        </Badge>
      </div>
    </Scene>
  );
};
