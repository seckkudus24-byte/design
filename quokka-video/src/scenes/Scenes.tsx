import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../QuokkaVideo';
import {useCue} from '../cue';
import {GROUND_Y, INK, Island, Quokka} from '../characters/Quokka';
import {StickMan} from '../characters/StickMan';
import {Star} from '../characters/Icons2';
import {FONT, Place, Scene, prog, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const quokkaOn = (y: number, w: number) => y - 0.56 * w;

const Sparkles: React.FC<{frame: number; x: number; y: number; s?: number}> = ({frame, x, y, s = 1}) => (
  <>
    {[0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2 + frame * 0.03;
      return (
        <Place key={i} x={x + Math.cos(a) * 260} y={y + Math.sin(a) * 160} scale={s * (0.3 + Math.abs(Math.sin(frame * 0.1 + i)) * 0.2)}>
          <Star size={120} />
        </Place>
      );
    })}
  </>
);

// ---------- 1. Titre ----------
export const Titre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const sourit = useCue('sourit');
  return (
    <Scene first bg="#4FC3F7">
      <Island frame={frame} />
      <Sparkles frame={frame} x={540} y={1050} s={usePop(sourit, 9)} />
      <Place x={540} y={quokkaOn(GROUND_Y + 60, 460)}>
        <Quokka frame={frame} width={460} mood={frame > sourit ? 'huge' : 'smile'} pose="wave" />
      </Place>
      <TopBadge s={usePop(sourit, 9)} color="#FFE082" size={60}>
        IL SOURIT TOUT LE TEMPS !
      </TopBadge>
    </Scene>
  );
};

// ---------- 2. Le lundi matin ----------
export const Bureau: React.FC<{frame: number; gloomy?: boolean}> = ({frame, gloomy = true}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: gloomy ? 'linear-gradient(#90A4AE, #CFD8DC)' : 'linear-gradient(#FFE0B2, #FFCC80)'}} />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <rect x={640} y={640} width={320} height={280} rx={14} fill={gloomy ? '#78909C' : '#B3E5FC'} stroke={INK} strokeWidth={10} />
      <path d="M800 640 V 920 M640 780 H 960" stroke={INK} strokeWidth={8} />
      {gloomy
        ? Array.from({length: 8}, (_, i) => <path key={i} d={`M${660 + ((i * 41) % 280)} ${660 + ((i * 53 + frame * 8) % 240)} l-6 24`} stroke="#E3F2FD" strokeWidth={5} strokeLinecap="round" />)
        : null}
      <rect x={-20} y={1480} width={1120} height={460} fill="#8D6E63" stroke={INK} strokeWidth={8} />
    </svg>
  </>
);

export const Lundi: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const lundi = useCue('lundi');
  return (
    <Scene bg="#90A4AE">
      <Bureau frame={frame} />
      <div style={{position: 'absolute', left: 130, top: 680, width: 300, height: 300, borderRadius: 24, background: '#FFFFFF', border: `10px solid ${INK}`, transform: `scale(${usePop(lundi, 9)})`, fontFamily: FONT, textAlign: 'center', overflow: 'hidden'}}>
        <div style={{background: '#E53935', color: '#fff', fontSize: 60, padding: '16px 0 4px'}}>LUNDI</div>
        <div style={{fontSize: 140, color: INK, marginTop: 10}}>8H</div>
      </div>
      <Place x={540} y={1310}>
        <StickMan frame={frame} pose="worried" height={400} />
      </Place>
      {/* petit nuage de pluie au-dessus de la tête */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(540 ${1010 + Math.sin(frame * 0.1) * 6})`}>
          <ellipse cx={0} cy={0} rx={110} ry={40} fill="#607D8B" stroke={INK} strokeWidth={6} />
          <ellipse cx={-40} cy={-24} rx={56} ry={40} fill="#607D8B" stroke={INK} strokeWidth={6} />
          <ellipse cx={40} cy={-30} rx={64} ry={46} fill="#607D8B" stroke={INK} strokeWidth={6} />
          <ellipse cx={0} cy={4} rx={104} ry={34} fill="#607D8B" />
          {[-50, 0, 50].map((x, i) => (
            <path key={x} d={`M${x} ${50 + ((frame * 4 + i * 20) % 60)} l-4 18`} stroke="#81D4FA" strokeWidth={6} strokeLinecap="round" />
          ))}
        </g>
      </svg>
      <TopBadge s={usePop(4, 9)} color="#FFFFFF">
        NOUS, LE LUNDI MATIN…
      </TopBadge>
    </Scene>
  );
};

// ---------- 3. Le roi du sourire ----------
export const Roi: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <Scene bg="#4FC3F7">
      <Island frame={frame} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M330 1500 L 360 1330 L 720 1330 L 750 1500 Z" fill="#9E9E9E" stroke={INK} strokeWidth={8} />
      </svg>
      <Sparkles frame={frame} x={540} y={1000} s={usePop(10, 9)} />
      <Place x={540} y={quokkaOn(1340, 400)}>
        <Quokka frame={frame} width={400} crown mood="huge" pose="cheer" />
      </Place>
      <TopBadge s={usePop(4, 9)} color="#FFD600">
        LE ROI DU SOURIRE
      </TopBadge>
    </Scene>
  );
};

// ---------- 4. Tu as quelque chose à manger ? ----------
export const Manger: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <Scene bg="#4FC3F7">
      <Island frame={frame} />
      <Place x={540} y={quokkaOn(GROUND_Y + 80, 460)}>
        <Quokka frame={frame} width={460} pose="beg" mood="curious" />
      </Place>
      <div style={{position: 'absolute', left: 500, top: 740, transform: `scale(${usePop(14, 9)})`, transformOrigin: '0 100%'}}>
        <div style={{position: 'relative', background: '#FFFFFF', border: `10px solid ${INK}`, borderRadius: 50, padding: '28px 36px 18px', fontFamily: FONT, fontSize: 66, color: INK, width: 460, textAlign: 'center'}}>
          UN PETIT TRUC À MANGER ?
          <div style={{position: 'absolute', left: 40, bottom: -46, width: 0, height: 0, borderLeft: '24px solid transparent', borderRight: '24px solid transparent', borderTop: `46px solid ${INK}`}} />
        </div>
      </div>
      <TopBadge s={usePop(4, 9)} color="#FFE082" size={64}>
        LE ROI DU « T'AS À MANGER ? »
      </TopBadge>
    </Scene>
  );
};

// ---------- 5. Plus sociable que certains humains ----------
export const Sociable: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const approche = useCue("s'approche");
  const come = ramp(frame, approche - 10, approche + 50);
  return (
    <Scene bg="#4FC3F7">
      <Island frame={frame} />
      <Place x={800} y={GROUND_Y - 60}>
        <StickMan frame={frame} pose={come > 0.8 ? 'surprised' : 'idle'} height={420} />
      </Place>
      <Place x={interpolate(come, [0, 1], [180, 560])} y={quokkaOn(GROUND_Y + 90, 300)}>
        <Quokka frame={frame} width={300} hop={come > 0 && come < 1} mood="smile" look={1} />
      </Place>
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, approche - 16, approche - 10))} color="#FFFFFF" size={58}>
        PLUS SOCIABLE QUE NOUS ?
      </TopBadge>
      <TopBadge s={usePop(approche - 10, 9)} color="#A5D6A7" size={58}>
        IL S'APPROCHE TOUT SEUL
      </TopBadge>
    </Scene>
  );
};

// ---------- 6. Un petit curieux ----------
export const Curieux: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const look = Math.sin(frame * 0.06);
  return (
    <Scene bg="#4FC3F7">
      <Island frame={frame} />
      <Place x={540 + look * 40} y={quokkaOn(GROUND_Y + 80, 440)}>
        <Quokka frame={frame} width={440} mood="curious" look={look} />
      </Place>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: 260 + i * 220, top: 860 + (i % 2) * 70 - Math.abs(Math.sin(frame * 0.12 + i)) * 30, fontFamily: FONT, fontSize: 120 - i * 10, color: '#FFEB3B', WebkitTextStroke: `14px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${usePop(8 + i * 5, 9)})`}}>
          ?
        </div>
      ))}
      <TopBadge s={usePop(4, 9)} color="#FFFFFF">
        UN PETIT CURIEUX
      </TopBadge>
    </Scene>
  );
};

// ---------- 7. Attention quand même ----------
export const Attention: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <Scene bg="#4FC3F7">
      <Island frame={frame} />
      <svg width={1080} height={1920} style={{position: 'absolute', transform: `scale(${usePop(6, 8)})`, transformOrigin: '780px 1300px'}}>
        <rect x={770} y={1080} width={22} height={360} fill="#8D6E63" stroke={INK} strokeWidth={6} />
        <path d="M781 820 L 950 1110 L 612 1110 Z" fill="#FFD600" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
        <text x={781} y={1080} textAnchor="middle" fontFamily={FONT} fontSize={190} fill={INK}>
          !
        </text>
      </svg>
      <Place x={330} y={quokkaOn(GROUND_Y + 80, 380)}>
        <Quokka frame={frame} width={380} mood="smile" look={1} />
      </Place>
      <TopBadge s={usePop(4, 9)} color="#FFD600">
        ATTENTION QUAND MÊME !
      </TopBadge>
    </Scene>
  );
};

// ---------- 8. Conclusion ----------
export const Conclusion: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const sourit = useCue('sourit');
  const k = ramp(frame, 0, dur);
  return (
    <Scene bg="#4FC3F7">
      <Island frame={frame} dusk={k * 0.8} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M100 1100 Q 540 400 980 1100" stroke="#FFFFFF" strokeWidth={8} strokeDasharray="20 20" fill="none" opacity={0.6} />
        <circle cx={interpolate(k, [0, 1], [140, 940])} cy={1100 - Math.sin(k * Math.PI) * 560} r={60} fill="#FFEB3B" stroke="#FFA000" strokeWidth={8} />
      </svg>
      <Place x={540} y={quokkaOn(GROUND_Y + 80, 440)}>
        <Quokka frame={frame} width={440} mood="huge" />
      </Place>
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, sourit - 6, sourit))} color="#FFFFFF">
        CONCLUSION
      </TopBadge>
      <TopBadge s={usePop(sourit, 9)} color="#FFE082" size={56}>
        LE SOURIRE TOUTE LA JOURNÉE
      </TopBadge>
    </Scene>
  );
};

// ---------- 9. Et toi ? ----------
export const Question: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <Scene bg="#FFF3E0">
      <Island frame={frame} />
      <Place x={300} y={GROUND_Y - 80}>
        <StickMan frame={frame} pose="cheer" height={440} />
      </Place>
      <Place x={720} y={quokkaOn(GROUND_Y + 80, 400)}>
        <Quokka frame={frame} width={400} mood="huge" pose="cheer" />
      </Place>
      <TopBadge s={usePop(4, 9)} color="#FFFFFF" size={84}>
        ET TOI ?
      </TopBadge>
    </Scene>
  );
};

// ---------- 10. Abonne-toi ----------
export const Abonne: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const cta = usePop(4, 8);
  const pulse = 1 + Math.max(0, Math.sin(frame * 0.25)) * 0.06;
  const click = prog(frame, dur, 0.55, 0.62) - prog(frame, dur, 0.66, 0.72);
  const subscribed = frame / dur > 0.66;
  return (
    <Scene bg="#4FC3F7">
      <Island frame={frame} />
      <Place x={540} y={quokkaOn(GROUND_Y + 80, 420)}>
        <Quokka frame={frame} width={420} pose="wave" mood="huge" />
      </Place>
      <div style={{position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${cta})`, fontFamily: FONT}}>
        <div
          style={{
            transform: `scale(${pulse * (1 - click * 0.08)})`,
            background: subscribed ? '#9E9E9E' : '#FE2C55',
            color: '#fff',
            fontSize: 96,
            padding: '24px 56px 12px',
            borderRadius: 34,
            border: '12px solid #16121F',
            boxShadow: '0 16px 0 rgba(0,0,0,0.3)',
            position: 'relative',
          }}
        >
          {subscribed ? 'ABONNÉ !' : 'ABONNE-TOI !'}
          <svg width={120} height={140} viewBox="0 0 110 130" style={{position: 'absolute', right: -100, bottom: -90, transform: `translate(${(1 - click) * 20}px, ${(1 - click) * 20}px)`}}>
            <path d="M30 10 q12 -8 20 4 v40 q10 -6 18 2 q10 -4 16 6 q10 -2 14 8 v30 q0 26 -30 32 h-20 q-22 -4 -32 -30 l-14 -30 q-2 -12 12 -10 l12 14 z" fill="#fff" stroke="#16121F" strokeWidth={7} strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{marginTop: 60, fontSize: 56, color: '#fff', WebkitTextStroke: '12px #16121F', paintOrder: 'stroke fill', textAlign: 'center'}}>+ DE SECRETS DU MONDE ANIMAL</div>
      </div>
    </Scene>
  );
};
