import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../HippoVideo';
import {Hippo} from '../characters/Hippo';
import {StickMan} from '../characters/StickMan';
import {Bubble, Caption, FONT, Moon, Place, Scene, prog, usePop} from '../ui';

export const Digestion: React.FC<SceneProps> = ({dur, text}) => {
  const frame = useCurrentFrame();
  const mouth = (Math.sin(frame * 0.5) + 1) / 2;
  const kg = Math.round(interpolate(prog(frame, dur, 0.15, 0.75), [0, 1], [0, 40]));
  const badge = usePop(Math.round(dur * 0.12), 9);
  const tuft = interpolate(prog(frame, dur, 0.1, 0.85), [0, 1], [1, 0.25]);
  return (
    <Scene bg="linear-gradient(#311B92 0%, #5E35B1 70%)">
      <Moon x={900} y={700} r={65} bg="#3B1FA0" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, bottom: 0, background: '#43A047', borderTop: '10px solid #1B5E20'}} />
      <Place x={510} y={1140}>
        <Hippo frame={frame} width={720} mouthOpen={mouth} />
      </Place>
      {/* herbe qui disparaît */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(930 1310) scale(${tuft}) translate(-930 -1310)`}>
          {Array.from({length: 9}, (_, i) => (
            <path key={i} d={`M${860 + i * 16} 1310 q ${(i - 4) * 6} -90 ${(i - 4) * 14} -${130 + (i % 3) * 30}`} stroke="#9CCC65" strokeWidth={14} fill="none" strokeLinecap="round" />
          ))}
        </g>
        {/* brins qui volent vers la bouche */}
        {Array.from({length: 5}, (_, i) => {
          const t = ((frame + i * 7) % 35) / 35;
          const x = interpolate(t, [0, 1], [930, 820]);
          const y = interpolate(t, [0, 1], [1220, 1140]) - Math.sin(t * Math.PI) * 60;
          return <rect key={i} x={x} y={y} width={30} height={9} rx={4} fill="#C5E1A5" transform={`rotate(${t * 300} ${x + 15} ${y + 4})`} opacity={tuft > 0.3 ? 1 : 0} />;
        })}
      </svg>
      {/* compteur */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 720,
          transform: `scale(${badge}) rotate(-6deg)`,
          background: '#FFD600',
          border: '10px solid #16121F',
          borderRadius: 36,
          padding: '14px 36px',
          fontFamily: FONT,
          fontSize: 120,
          color: '#16121F',
          boxShadow: '0 12px 0 rgba(0,0,0,0.3)',
        }}
      >
        {kg} KG
      </div>
      <Place x={130} y={1470}>
        <StickMan frame={frame} pose="surprised" height={260} />
      </Place>
      {frame / dur > 0.6 ? <Bubble text="CROUNCH !" x={600} y={820} size={66} delay={Math.round(dur * 0.6)} /> : null}
      <Caption text={text} size={100} top={150} />
    </Scene>
  );
};
