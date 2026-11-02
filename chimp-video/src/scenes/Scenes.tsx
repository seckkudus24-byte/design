import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../ChimpVideo';
import {useCue} from '../cue';
import {Bush, Chimp, Colobus, Desk, Forest, GROUND_Y, BRANCH_Y, Meat, INK} from '../characters/Chimp';
import {StickMan} from '../characters/StickMan';
import {Zzz} from '../characters/Icons';
import {FONT, Place, Scene, prog, ramp, usePop} from '../ui';
import {TopBadge} from './common';

// Centre vertical d'un chimpanzé (largeur w) dont les pieds touchent y.
export const chimpOn = (y: number, w: number, sit = false) => y - (sit ? 0.5 : 0.553) * w;
export const colobusOn = (y: number, w: number) => y - 0.409 * ((w * 220) / 380);

// ---------- 1. Titre ----------
export const Titre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const equipe = useCue('equipe');
  return (
    <Scene first bg="#9BD8F2">
      <Forest frame={frame} />
      {[0, 1, 2].map((i) => (
        <Place key={i} x={260 + i * 270 - frame * 1.2} y={chimpOn(GROUND_Y + 30 + (i % 2) * 40, 300)}>
          <Chimp frame={frame + i * 9} width={300} walking mood="angry" look={-1} captain={i === 0} />
        </Place>
      ))}
      <TopBadge s={usePop(equipe, 9)} color="#FFE082">
        CHASSE EN ÉQUIPE !
      </TopBadge>
    </Scene>
  );
};

// ---------- 2. Le collègue ----------
export const Office: React.FC<{frame: number}> = ({frame}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#FFE0B2, #FFCC80)'}} />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <rect x={620} y={640} width={340} height={300} rx={14} fill="#B3E5FC" stroke={INK} strokeWidth={10} />
      <path d="M790 640 V 940 M620 790 H 960" stroke={INK} strokeWidth={8} />
      <circle cx={880} cy={720} r={36} fill="#FFEB3B" />
      <rect x={120} y={660} width={220} height={150} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
      <path d={`M150 770 L 200 ${740 + Math.sin(frame * 0.05) * 4} L 250 750 L 310 690`} stroke="#43A047" strokeWidth={10} fill="none" strokeLinecap="round" />
      <rect x={-20} y={1480} width={1120} height={460} fill="#8D6E63" stroke={INK} strokeWidth={8} />
    </svg>
  </>
);

export const Collegue: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const collegue = useCue('collegue');
  const rien = useCue('rien');
  return (
    <Scene bg="#FFE0B2">
      <Office frame={frame} />
      {[0, 1].map((i) => (
        <React.Fragment key={i}>
          <Place x={200 + i * 300} y={1280}>
            <StickMan frame={frame + i * 7} pose="point" height={320} />
          </Place>
          <Place x={260 + i * 300} y={1380}>
            <Desk width={300} frame={frame + i * 11} />
          </Place>
        </React.Fragment>
      ))}
      <Place x={880} y={1300} rotate={-12}>
        <StickMan frame={0} pose="idle" height={320} />
      </Place>
      <Place x={960} y={1060} scale={usePop(rien, 9)}>
        <Zzz size={170} frame={frame} />
      </Place>
      <TopBadge s={usePop(collegue, 9)} color="#FFFFFF">
        CE COLLÈGUE…
      </TopBadge>
      <TopBadge s={usePop(rien, 9)} color="#FF8A80" dy={110} size={56}>
        QUI NE FAIT RIEN
      </TopBadge>
    </Scene>
  );
};

// ---------- 3. Pas du cannibalisme ----------
export const Cannibale: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const partagent = useCue('partagent');
  const title = usePop(4, 9) * (1 - ramp(frame, partagent - 6, partagent));
  const pos = [
    [260, 0],
    [540, 30],
    [820, 0],
  ];
  return (
    <Scene bg="#9BD8F2">
      <Forest frame={frame} />
      {pos.map(([x, dy], i) => (
        <Place key={i} x={x} y={chimpOn(GROUND_Y + 40 + dy, 300, true)}>
          <Chimp frame={frame + i * 13} width={300} sit pose={frame > partagent && i !== 1 ? 'eat' : 'hold'} mood={frame > partagent ? 'chew' : 'happy'} />
        </Place>
      ))}
      {[0, 2].map((i) => (
        <Place key={i} x={pos[i][0] + 70} y={GROUND_Y - 180 - (frame > partagent ? 60 : 0)} scale={0.7}>
          <Meat size={130} />
        </Place>
      ))}
      <Place x={540} y={GROUND_Y - 150} scale={0.8}>
        <Meat size={140} />
      </Place>
      <TopBadge s={title} color="#FFE082">
        PAS DU CANNIBALISME
      </TopBadge>
      <TopBadge s={usePop(partagent, 9)} color="#FFFFFF" size={60}>
        ILS PARTAGENT LEUR PRISE
      </TopBadge>
    </Scene>
  );
};

// ---------- 4. Une proie impossible ----------
export const Proie: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const haut = useCue('haut');
  const seul = useCue('seul', 1);
  const chance = useCue('chance');
  const title = usePop(4, 9) * (1 - ramp(frame, haut - 6, haut));
  const climb = ramp(frame, seul, chance + 20);
  const slip = frame > chance + 20 ? ramp(frame, chance + 20, chance + 34) : 0;
  const hop = Math.abs(Math.sin(frame * 0.12)) * 30;
  return (
    <Scene bg="#9BD8F2">
      <Forest frame={frame} />
      <Place x={790 + Math.sin(frame * 0.04) * 80} y={colobusOn(BRANCH_Y - 140, 240) - hop} flip={Math.cos(frame * 0.04) < 0}>
        <Colobus frame={frame} width={240} />
      </Place>
      <Place x={frame < seul ? 540 : 230} y={chimpOn(GROUND_Y + 30, 300) - (climb - slip) * 380} >
        <Chimp frame={frame} width={300} pose={frame < seul ? 'point' : 'climb'} mood={frame > chance ? 'sad' : 'surprised'} look={1} />
      </Place>
      <TopBadge s={title} color="#FFE082" size={60}>
        UNE PROIE IMPOSSIBLE
      </TopBadge>
      <TopBadge s={usePop(haut, 9) * (1 - ramp(frame, seul - 6, seul))} color="#B3E5FC" size={60}>
        TOUT EN HAUT DES ARBRES
      </TopBadge>
      <TopBadge s={usePop(chance, 9)} color="#FF8A80">
        AUCUNE CHANCE SEUL
      </TopBadge>
    </Scene>
  );
};

// ---------- 5. Une vraie équipe de foot (tableau tactique) ----------
const ChimpToken: React.FC<{label: string; color: string}> = ({label, color}) => (
  <div style={{width: 130, height: 130, borderRadius: '50%', background: color, border: `8px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 40, color: '#fff', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>
    {label}
  </div>
);

export const Equipe: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const foot = useCue('foot');
  const chacun = useCue('chacun');
  const spots = [
    {label: 'C', color: '#FFD600', from: [540, 1700], to: [540, 1560]},
    {label: '1', color: '#E53935', from: [540, 1700], to: [300, 820]},
    {label: '2', color: '#E53935', from: [540, 1700], to: [780, 820]},
    {label: '3', color: '#1E88E5', from: [540, 1700], to: [180, 1180]},
    {label: '4', color: '#1E88E5', from: [540, 1700], to: [900, 1180]},
    {label: 'R', color: '#8E24AA', from: [540, 1700], to: [540, 1400]},
  ];
  return (
    <Scene bg="#2E7D32">
      <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(#43A047 0 140px, #388E3C 140px 280px)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect x={70} y={620} width={940} height={1220} fill="none" stroke="#FFFFFF" strokeWidth={10} />
        <path d="M70 1230 H 1010" stroke="#FFFFFF" strokeWidth={10} />
        <circle cx={540} cy={1230} r={130} fill="none" stroke="#FFFFFF" strokeWidth={10} />
        <rect x={330} y={620} width={420} height={180} fill="none" stroke="#FFFFFF" strokeWidth={10} />
        {/* le colobe = le ballon */}
        <circle cx={540} cy={700 + Math.sin(frame * 0.2) * 10} r={36} fill="#C1440E" stroke={INK} strokeWidth={6} />
      </svg>
      {spots.map((s, i) => {
        const p = ramp(frame, chacun + i * 5, chacun + i * 5 + 18);
        return (
          <Place key={i} x={interpolate(p, [0, 1], [s.from[0], s.to[0]])} y={interpolate(p, [0, 1], [s.from[1], s.to[1]])} scale={usePop(foot + i * 3, 9)}>
            <ChimpToken label={s.label} color={s.color} />
          </Place>
        );
      })}
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, chacun - 6, chacun))} color="#FFE082" size={62}>
        UNE VRAIE ÉQUIPE DE FOOT
      </TopBadge>
      <TopBadge s={usePop(chacun, 9)} color="#FFFFFF">
        CHACUN SON POSTE
      </TopBadge>
    </Scene>
  );
};

// ---------- 6. Le piège ----------
export const Piege: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const piege = useCue('piege');
  const run = ramp(frame, 0, piege + 6);
  const ambush = usePop(piege, 8);
  return (
    <Scene bg="#9BD8F2">
      <Forest frame={frame} />
      {[0, 1].map((i) => (
        <Place key={i} x={interpolate(run, [0, 1], [-200 - i * 160, 560 - i * 160])} y={colobusOn(BRANCH_Y + 20, 220) - Math.abs(Math.sin(frame * 0.3 + i)) * 40}>
          <Colobus frame={frame + i * 5} width={220} leap scared />
        </Place>
      ))}
      {[0, 1].map((i) => (
        <Place key={i} x={700 + i * 220} y={BRANCH_Y + 40 - ambush * 120} flip>
          <Chimp frame={frame + i * 7} width={240} pose="cheer" mood="angry" />
        </Place>
      ))}
      <Place x={760} y={BRANCH_Y + 60}>
        <Bush width={520} shake={ambush > 0.1 && ambush < 0.95 ? Math.sin(frame) * 4 : 0} />
      </Place>
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, piege - 6, piege))} color="#FFFFFF" size={58}>
        LES COLOBES S'ENFUIENT…
      </TopBadge>
      <TopBadge s={ambush} color="#FF8A80">
        DROIT DANS LE PIÈGE !
      </TopBadge>
    </Scene>
  );
};

// ---------- 7. Le partage ----------
export const Partage: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const ceux = useCue('ceux', 1);
  const regarde = useCue('regarde');
  const tournent = useCue('tournent');
  const circle = ramp(frame, ceux, ceux + 30);
  return (
    <Scene bg="#9BD8F2">
      <Forest frame={frame} branches={false} />
      {[0, 1, 2].map((i) => (
        <Place key={i} x={300 + i * 240} y={chimpOn(GROUND_Y + 60, 280, true)}>
          <Chimp frame={frame + i * 9} width={280} sit pose="eat" mood="chew" />
        </Place>
      ))}
      {[0, 1].map((i) => {
        const a = (frame - tournent) * 0.03 + i * Math.PI;
        const x = interpolate(circle, [0, 1], [i ? 1300 : -220, 540 + Math.cos(a) * 420]);
        const y = GROUND_Y + 220 + Math.sin(a) * 40;
        return (
          <Place key={i} x={x} y={chimpOn(y, 240)} flip={Math.sin(a) > 0}>
            <Chimp frame={frame + i * 5} width={240} walking pose="beg" mood="sad" look={i ? -1 : 1} />
          </Place>
        );
      })}
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, ceux - 6, ceux))} color="#FFE082" size={58}>
        PAS DE TRAVAIL, PAS DE REPAS
      </TopBadge>
      <TopBadge s={usePop(regarde, 9)} color="#FFFFFF">
        CEUX QUI ONT REGARDÉ…
      </TopBadge>
    </Scene>
  );
};

// ---------- 8. Conclusion ----------
export const Conclusion: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const travail = useCue('travail');
  const capitaine = useCue('capitaine');
  const recompense = useCue('recompense');
  return (
    <Scene bg="#9BD8F2">
      <Forest frame={frame} dusk={0.4} />
      {[0, 1, 2].map((i) => (
        <Place key={i} x={250 + i * 290} y={chimpOn(GROUND_Y + 40 - (i === 1 ? 30 : 0), i === 1 ? 340 : 280)}>
          <Chimp frame={frame + i * 7} width={i === 1 ? 340 : 280} pose={frame > recompense && i !== 1 ? 'hold' : 'cheer'} mood="happy" captain={i === 1} />
        </Place>
      ))}
      {[0, 2].map((i) => (
        <Place key={i} x={250 + i * 290} y={GROUND_Y - 200} scale={usePop(recompense, 9) * 0.8}>
          <Meat size={130} />
        </Place>
      ))}
      <TopBadge s={usePop(travail, 9) * (1 - ramp(frame, capitaine - 6, capitaine))} color="#FFFFFF">
        TRAVAIL D'ÉQUIPE
      </TopBadge>
      <TopBadge s={usePop(capitaine, 9) * (1 - ramp(frame, recompense - 6, recompense))} color="#FFD600">
        UN CAPITAINE
      </TopBadge>
      <TopBadge s={usePop(recompense, 9)} color="#A5D6A7">
        RÉCOMPENSE MÉRITÉE
      </TopBadge>
    </Scene>
  );
};

// ---------- 9. Et toi ? ----------
export const Question: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const chasseur = useCue('chasseur');
  const celui = useCue('celui');
  const hiL = frame >= chasseur && frame < celui ? 1 : 0;
  const hiR = frame >= celui ? 1 : 0;
  const card = (x: number, hi: number, color: string, label: string, child: React.ReactNode) => (
    <div style={{position: 'absolute', left: x, top: 720, width: 470, height: 900, borderRadius: 40, background: color, border: `10px solid ${INK}`, transform: `scale(${1 + hi * 0.06}) rotate(${hi * (x < 500 ? -2 : 2)}deg)`, opacity: hi || (!hiL && !hiR) ? 1 : 0.55, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', fontFamily: FONT, fontSize: 58, color: '#fff', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill'}}>{label}</div>
      {child}
    </div>
  );
  return (
    <Scene bg="#FFF3E0">
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(#FFF3E0, #FFB74D)'}} />
      {card(
        50,
        hiL,
        '#66BB6A',
        'LE CHASSEUR',
        <>
          <div style={{position: 'absolute', left: 85, top: 300}}>
            <Chimp frame={frame} width={300} pose="cheer" mood="happy" captain />
          </div>
          <div style={{position: 'absolute', left: 160, top: 700}}>
            <Meat size={150} />
          </div>
        </>,
      )}
      {card(
        560,
        hiR,
        '#90A4AE',
        'LE PROFITEUR',
        <>
          <div style={{position: 'absolute', left: 85, top: 330}}>
            <Chimp frame={frame} width={300} sit mood="sleepy" />
          </div>
          <div style={{position: 'absolute', left: 300, top: 240}}>
            <Zzz size={130} frame={frame} />
          </div>
        </>,
      )}
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
    <Scene bg="#9BD8F2">
      <Forest frame={frame} />
      <Place x={300} y={chimpOn(GROUND_Y + 40, 340)}>
        <Chimp frame={frame} width={340} pose="cheer" mood="happy" />
      </Place>
      <Place x={780} y={chimpOn(GROUND_Y + 60, 280, true)}>
        <Chimp frame={frame + 9} width={280} sit pose="point" mood="happy" look={-1} />
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
