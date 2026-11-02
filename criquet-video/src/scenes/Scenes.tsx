import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../CriquetVideo';
import {useCue} from '../cue';
import {BRANCH_Y, Chick, Cricket, GROUND_Y, INK, NEST, Nest, Quelea, Savanna, Stink, nestChicks} from '../characters/Bugs';
import {StickMan} from '../characters/StickMan';
import {FONT, Place, Scene, prog, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const cricketOn = (y: number, w: number) => y - 0.289 * w;
export const queleaOn = (y: number, w: number) => y - 0.417 * w;

// Nid + poussins sur la branche.
export const NestWithChicks: React.FC<{frame: number; scared?: boolean; n?: number}> = ({frame, scared = false, n = 3}) => (
  <>
    {nestChicks(frame, scared, n).map((c) => (
      <Place key={c.key} x={c.x} y={c.y}>
        <Chick frame={c.frame} size={86} scared={c.scared} />
      </Place>
    ))}
    <Place x={NEST.x} y={NEST.y}>
      <Nest width={290} />
    </Place>
  </>
);

// Position du criquet qui grimpe le long du tronc puis avance sur la branche (u : 0..1).
const climbPath = (u: number) => {
  if (u < 0.6) {
    const k = u / 0.6;
    return {x: 250, y: interpolate(k, [0, 1], [GROUND_Y - 80, BRANCH_Y - 120]), rot: -90};
  }
  const k = (u - 0.6) / 0.4;
  return {x: interpolate(k, [0, 1], [290, NEST.x - 230]), y: BRANCH_Y - 120, rot: 0};
};

// ---------- 1. Titre ----------
export const Titre: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const afrique = useCue('afrique');
  const p = climbPath(ramp(frame, 0, dur) * 0.75);
  return (
    <Scene first bg="#81D4FA">
      <Savanna frame={frame} />
      <NestWithChicks frame={frame} />
      <Place x={p.x} y={p.y} rotate={p.rot}>
        <Cricket frame={frame} width={240} walking mood="hungry" />
      </Place>
      <TopBadge s={usePop(afrique, 9)} color="#FFE082">
        EN AFRIQUE…
      </TopBadge>
    </Scene>
  );
};

// ---------- 2. Rôles ----------
export const Roles: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const mangent = useCue('mangent');
  const grab = usePop(mangent, 9);
  return (
    <Scene bg="#81D4FA">
      <Savanna frame={frame} tree={false} ground={1400} />
      <Place x={360} y={queleaOn(1380, 480)}>
        <Quelea frame={frame} width={480} peck={grab * 0.4} />
      </Place>
      {/* petit insecte (sauterelle normale) que l'oiseau attrape */}
      <Place x={interpolate(grab, [0, 1], [820, 620])} y={cricketOn(1380, 180) - grab * 90} rotate={grab * 30}>
        <Cricket frame={frame} width={180} mood="scared" tint="#8BC34A" walking={grab < 0.5} />
      </Place>
      <TopBadge s={usePop(4, 9)} color="#FFFFFF">
        NORMALEMENT…
      </TopBadge>
      <TopBadge s={grab} color="#A5D6A7" dy={110} size={56}>
        L'OISEAU MANGE L'INSECTE
      </TopBadge>
    </Scene>
  );
};

// ---------- 3. Le cambrioleur blindé ----------
export const Cambrioleur: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <Scene bg="#81D4FA">
      <Savanna frame={frame} />
      <NestWithChicks frame={frame} />
      <Place x={420 + Math.sin(frame * 0.05) * 20} y={cricketOn(BRANCH_Y - 70, 300)}>
        <Cricket frame={frame} width={300} mask mood="sneaky" walking />
      </Place>
      <TopBadge s={usePop(4, 9)} color="#FFE082">
        LE CAMBRIOLEUR BLINDÉ
      </TopBadge>
    </Scene>
  );
};

// ---------- 4. Il attend que les parents sortent ----------
export const Attend: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const part = useCue('part');
  const grimpe = useCue('grimpe');
  const away = ramp(frame, part, part + 40);
  const p = climbPath(0.45 + ramp(frame, part + 10, grimpe + 30) * 0.55);
  return (
    <Scene bg="#81D4FA">
      <Savanna frame={frame} />
      <NestWithChicks frame={frame} />
      <Place x={interpolate(away, [0, 1], [NEST.x + 200, 1300])} y={interpolate(away, [0, 1], [queleaOn(BRANCH_Y - 40, 220), 500])}>
        <Quelea frame={frame} width={220} flying={away > 0} />
      </Place>
      <Place x={p.x} y={p.y} rotate={p.rot}>
        <Cricket frame={frame} width={240} walking={frame > part} mask mood="sneaky" />
      </Place>
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, part - 6, part))} color="#FFFFFF" size={58}>
        IL ATTEND QUE LES PARENTS SORTENT
      </TopBadge>
      <TopBadge s={usePop(part, 9)} color="#A5D6A7">
        LA MAMAN EST PARTIE…
      </TopBadge>
    </Scene>
  );
};

// ---------- 5. La maman rentre ----------
export const Maman: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const attaquer = useCue('attaquer');
  const revient = useCue('revient');
  const personne = useCue('personne');
  const back = ramp(frame, revient - 10, revient + 25);
  const standoff = frame >= personne;
  return (
    <Scene bg="#81D4FA">
      <Savanna frame={frame} />
      <NestWithChicks frame={frame} scared={frame < revient + 20} />
      <Place x={NEST.x - 240 + (standoff ? -40 : 0)} y={cricketOn(BRANCH_Y - 70, 280)}>
        <Cricket frame={frame} width={280} mood={standoff ? 'angry' : 'hungry'} jaws={frame > attaquer && frame < revient + 20} />
      </Place>
      <Place
        x={interpolate(back, [0, 1], [1300, NEST.x + 200])}
        y={interpolate(back, [0, 1], [500, queleaOn(BRANCH_Y - 40, 240)])}
        flip
      >
        <Quelea frame={frame} width={240} flying={back < 1} angry={back >= 1} />
      </Place>
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, revient - 6, revient))} color="#FF8A80">
        IL VA ATTAQUER…
      </TopBadge>
      <TopBadge s={usePop(revient, 9) * (1 - ramp(frame, personne - 6, personne))} color="#A5D6A7">
        LA MAMAN REVIENT !
      </TopBadge>
      <TopBadge s={usePop(personne, 9)} color="#FFFFFF">
        MATCH NUL !
      </TopBadge>
    </Scene>
  );
};

// ---------- 6. L'arme dégoûtante ----------
export const Arme: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const malgre = useCue('malgre');
  const attaque = useCue('attaque');
  const k = frame > attaque ? (frame - attaque) % 24 : 0;
  const peck = frame > attaque ? Math.sin((k / 24) * Math.PI) : 0;
  return (
    <Scene bg="#81D4FA">
      <Savanna frame={frame} />
      <NestWithChicks frame={frame} scared />
      <Place x={NEST.x - 260 - peck * 14} y={cricketOn(BRANCH_Y - 70, 280)} rotate={-peck * 8}>
        <Cricket frame={frame} width={280} mood="scared" squirt={frame > malgre ? 0.6 : 0} />
      </Place>
      <Place x={NEST.x - 230} y={BRANCH_Y - 330}>
        <Stink frame={frame} width={260} amount={frame > malgre ? 0.8 : 0} />
      </Place>
      <Place x={NEST.x - 50 - peck * 90} y={queleaOn(BRANCH_Y - 40, 240) + peck * 10} flip>
        <Quelea frame={frame} width={240} angry peck={peck} />
      </Place>
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, malgre - 6, malgre))} color="#DCE775">
        L'ARME DÉGOÛTANTE
      </TopBadge>
      <TopBadge s={usePop(attaque, 9)} color="#FF8A80">
        ENCORE ET ENCORE !
      </TopBadge>
    </Scene>
  );
};

// ---------- 7. Les faux amis ----------
export const Amis: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const arrivent = useCue('arrivent');
  const celui = useCue('celui');
  const come = ramp(frame, arrivent - 30, arrivent + 30);
  const close = ramp(frame, celui, celui + 40);
  const cx = 540;
  const cy = 1330;
  return (
    <Scene bg="#81D4FA">
      <Savanna frame={frame} tree={false} dusk={0.3} ground={1400} />
      {Array.from({length: 6}, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const r = interpolate(come, [0, 1], [900, 360]) * (1 - close * 0.4);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * 120 - (Math.sin(a) < 0 ? 40 : 0);
        return (
          <Place key={i} x={x} y={cricketOn(y, 240)} flip={Math.cos(a) > 0}>
            <Cricket frame={frame + i * 5} width={240} walking={come < 1} mood="hungry" tint={i % 2 ? '#8E9A3E' : '#A3A84E'} jaws={close > 0} />
          </Place>
        );
      })}
      <Place x={cx} y={cricketOn(cy, 320)}>
        <Cricket frame={frame} width={320} mood="hurt" dizzy={close < 0.2} />
      </Place>
      {close > 0.5 ? (
        <div style={{position: 'absolute', left: cx - 300, top: cy - 280, width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(#D7CCC8, rgba(215,204,200,0) 70%)', opacity: (close - 0.5) * 2}} />
      ) : null}
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, arrivent - 36, arrivent - 30))} color="#FFFFFF">
        LES FAUX AMIS
      </TopBadge>
      <TopBadge s={usePop(arrivent - 30, 9) * (1 - ramp(frame, celui - 6, celui))} color="#FFE082" size={58}>
        DES DIZAINES DE CRIQUETS !
      </TopBadge>
      <TopBadge s={usePop(celui, 9)} color="#FF8A80" size={60}>
        LE BLESSÉ DEVIENT LA PROIE
      </TopBadge>
    </Scene>
  );
};

// ---------- 8. Conclusion ----------
const Sack: React.FC<{size?: number}> = ({size = 160}) => (
  <svg viewBox="0 0 160 170" width={size} style={{overflow: 'visible'}}>
    <path d="M40 40 Q 0 160 80 160 Q 160 160 120 40 Z" fill="#BCAAA4" stroke={INK} strokeWidth={7} />
    <path d="M45 40 Q 80 20 115 40" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
    <text x={80} y={125} textAnchor="middle" fontFamily={FONT} fontSize={50} fill={INK}>
      $
    </text>
  </svg>
);

export const Conclusion: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const voler = useCue('voler');
  return (
    <Scene bg="#81D4FA">
      <Savanna frame={frame} dusk={0.6} />
      <Place x={500 + Math.sin(frame * 0.05) * 30} y={cricketOn(BRANCH_Y - 70, 300)}>
        <Cricket frame={frame} width={300} mask mood="sneaky" walking />
      </Place>
      <Place x={330 + Math.sin(frame * 0.05) * 30} y={BRANCH_Y - 140} scale={usePop(voler, 9)}>
        <Sack size={150} />
      </Place>
      <TopBadge s={usePop(voler, 9)} color="#FFFFFF">
        IL VOULAIT VOLER…
      </TopBadge>
    </Scene>
  );
};

// ---------- 9. Et toi ? (les faux amis humains) ----------
export const Question: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const disparaissent = useCue('disparaissent');
  const besoin = useCue('besoin');
  const gone = ramp(frame, disparaissent, disparaissent + 20);
  const rain = frame > besoin - 6;
  return (
    <Scene bg="#B0BEC5">
      <div style={{position: 'absolute', inset: 0, background: rain ? 'linear-gradient(#78909C, #B0BEC5)' : 'linear-gradient(#81D4FA, #FFF3E0)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1500, bottom: 0, background: '#A5D6A7', borderTop: `10px solid ${INK}`}} />
      {rain ? (
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {Array.from({length: 36}, (_, i) => {
            const x = (i * 131) % 1080;
            const y = (((i * 263) % 1300) + frame * 24) % 1300 + 500;
            return <path key={i} d={`M${x} ${y} l-6 30`} stroke="#E3F2FD" strokeWidth={5} strokeLinecap="round" />;
          })}
        </svg>
      ) : null}
      <Place x={540} y={1330}>
        <StickMan frame={frame} pose={rain ? 'worried' : 'cheer'} height={380} />
      </Place>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: [150, 760, 880][i], top: 1170, opacity: 1 - gone, transform: `translateX(${gone * (i ? 300 : -300)}px)`}}>
          <StickMan frame={frame + i * 5} pose="cheer" height={320} />
        </div>
      ))}
      <TopBadge s={usePop(4, 9)} color="#FFFFFF" size={84}>
        ET TOI ?
      </TopBadge>
      <TopBadge s={usePop(disparaissent, 9)} color="#B3E5FC" dy={120} size={56}>
        ILS DISPARAISSENT…
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
    <Scene bg="#81D4FA">
      <Savanna frame={frame} />
      <NestWithChicks frame={frame} />
      <Place x={NEST.x + 210} y={queleaOn(BRANCH_Y - 40, 230)} flip>
        <Quelea frame={frame} width={230} carry />
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
