import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../OrnithoVideo';
import {useCue} from '../cue';
import {Creek, GROUND_Y, INK, Platypus} from '../characters/Platypus';
import {StickMan} from '../characters/StickMan';
import {Star} from '../characters/Icons2';
import {FONT, Place, Scene, prog, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const platOn = (y: number, w: number) => y - 0.208 * w;

export const Bird: React.FC<{size?: number}> = ({size = 220}) => (
  <svg viewBox="0 0 200 160" width={size} style={{overflow: 'visible'}}>
    <path d="M60 140 v 16 M90 140 v 16" stroke="#FF8F00" strokeWidth={6} strokeLinecap="round" />
    <ellipse cx={80} cy={96} rx={60} ry={44} fill="#4FC3F7" stroke={INK} strokeWidth={6} />
    <path d="M40 90 Q 80 70 110 96 Q 70 120 40 104 Z" fill="#0288D1" stroke={INK} strokeWidth={5} />
    <circle cx={140} cy={56} r={32} fill="#4FC3F7" stroke={INK} strokeWidth={6} />
    <path d="M168 50 L 198 60 L 168 70 Z" fill="#FFB300" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={148} cy={50} r={6} fill={INK} />
  </svg>
);

export const Lizard: React.FC<{size?: number}> = ({size = 260}) => (
  <svg viewBox="0 0 260 120" width={size} style={{overflow: 'visible'}}>
    <path d="M60 70 Q 0 70 4 100" stroke={INK} strokeWidth={18} fill="none" strokeLinecap="round" />
    <path d="M60 70 Q 0 70 4 100" stroke="#7CB342" strokeWidth={10} fill="none" strokeLinecap="round" />
    {[80, 160].map((x) => (
      <path key={x} d={`M${x} 80 l -10 30 M${x + 20} 80 l 10 30`} stroke={INK} strokeWidth={8} strokeLinecap="round" />
    ))}
    <ellipse cx={130} cy={70} rx={80} ry={26} fill="#8BC34A" stroke={INK} strokeWidth={6} />
    <ellipse cx={220} cy={62} rx={38} ry={22} fill="#8BC34A" stroke={INK} strokeWidth={6} />
    <circle cx={230} cy={54} r={5} fill={INK} />
  </svg>
);

// ---------- 1. Titre ----------
export const Titre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const bizarre = useCue('bizarre');
  return (
    <Scene first bg="#81D4FA">
      <Creek frame={frame} />
      <Place x={540} y={platOn(GROUND_Y - 40, 700)}>
        <Platypus frame={frame} width={700} walking mood={frame > bizarre ? 'surprised' : 'happy'} />
      </Place>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontSize: 180, color: '#FFEB3B', WebkitTextStroke: `18px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${usePop(bizarre, 7)}) rotate(${Math.sin(frame * 0.1) * 8}deg)`}}>?</div>
      <TopBadge s={usePop(bizarre, 9)} color="#FFE082" size={62}>
        UN ANIMAL TROP BIZARRE !
      </TopBadge>
    </Scene>
  );
};

// ---------- 2. Assemblé avec des restes ----------
export const Assemble: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const bec = useCue('bec');
  const corps = useCue('corps');
  const queue = useCue('queue');
  const labels: [string, number, number, string][] = [
    ['CANARD', bec, 830, '#FFE082'],
    ['LOUTRE', corps, 420, '#BCAAA4'],
    ['CASTOR', queue, 120, '#A1887F'],
  ];
  return (
    <Scene bg="#1E88E5">
      <div style={{position: 'absolute', inset: 0, background: '#1E88E5', backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.15) 2px, transparent 2px)', backgroundSize: '60px 60px'}} />
      <Place x={540} y={1150}>
        <Platypus frame={frame} width={900} bill={usePop(bec, 9)} body={usePop(corps, 9)} tail={usePop(queue, 9)} />
      </Place>
      {labels.map(([txt, at, x, color]) => (
        <div key={txt} style={{position: 'absolute', left: x - 120, top: 1380, width: 300, textAlign: 'center', fontFamily: FONT, fontSize: 60, color, WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${usePop(at + 4, 9)})`}}>
          {txt}
        </div>
      ))}
      <TopBadge s={usePop(bec, 9)} color="#FFFFFF">
        UN ANIMAL EN KIT ?
      </TopBadge>
    </Scene>
  );
};

// ---------- 3. Le « faux » animal ----------
export const Faux: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <Scene bg="#81D4FA">
      <Creek frame={frame} />
      <Place x={540} y={platOn(GROUND_Y - 40, 680)}>
        <Platypus frame={frame} width={680} mood="calm" />
      </Place>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontSize: 130, color: '#FF5252', WebkitTextStroke: `14px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${usePop(10, 8)}) rotate(-6deg)`}}>« FAUX » ?</div>
      <TopBadge s={usePop(4, 9)} color="#FFFFFF">
        LE « FAUX » ANIMAL
      </TopBadge>
    </Scene>
  );
};

// ---------- 4. Ni oiseau, ni reptile ----------
export const Mammifere: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const reptile = useCue('reptile');
  const deux = useCue('deux');
  return (
    <Scene bg="#81D4FA">
      <Creek frame={frame} />
      <Place x={220} y={GROUND_Y - 120} scale={usePop(4, 9)}>
        <Bird size={260} />
      </Place>
      <Place x={860} y={GROUND_Y - 80} scale={usePop(reptile, 9)}>
        <Lizard size={300} />
      </Place>
      <Place x={540} y={platOn(GROUND_Y + 60, 520)} scale={usePop(deux - 10, 9)}>
        <Platypus frame={frame} width={520} />
      </Place>
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, deux - 16, deux - 10))} color="#FFFFFF">
        NI OISEAU, NI REPTILE…
      </TopBadge>
      <TopBadge s={usePop(deux - 10, 9)} color="#FFE082">
        UN PEU DES DEUX !
      </TopBadge>
    </Scene>
  );
};

// ---------- 5. Encore plus bizarre ----------
export const Bizarre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <Scene bg="#81D4FA">
      <Creek frame={frame} dusk={0.5} />
      <Place x={540} y={platOn(GROUND_Y - 40, 680)}>
        <Platypus frame={frame} width={680} mood="surprised" />
      </Place>
      {[0, 1, 2].map((i) => (
        <Place key={i} x={300 + i * 240} y={900 - Math.abs(Math.sin(frame * 0.12 + i)) * 40} scale={usePop(6 + i * 5, 9) * 0.6}>
          <Star size={140} />
        </Place>
      ))}
      <TopBadge s={usePop(4, 9)} color="#FFE082">
        ENCORE PLUS BIZARRE !
      </TopBadge>
    </Scene>
  );
};

// ---------- 6. Conclusion ----------
export const Conclusion: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <Scene bg="#81D4FA">
      <Creek frame={frame} dusk={0.3} />
      <Place x={540} y={platOn(GROUND_Y - 40, 680)}>
        <Platypus frame={frame} width={680} />
      </Place>
      <TopBadge s={usePop(4, 9)} color="#FFFFFF">
        CONCLUSION
      </TopBadge>
    </Scene>
  );
};

// ---------- 7. Et toi ? ----------
export const DuckBill: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <svg viewBox="0 0 120 60" width={120 * s} style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
    <path d="M0 14 Q 70 0 110 18 Q 120 36 100 44 Q 60 54 0 42 Z" fill="#3E4A52" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

export const Question: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const celui = useCue('celui');
  const hi = ramp(frame, celui, celui + 12);
  return (
    <Scene bg="#FFF3E0">
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(#FFF3E0, #FFB74D)'}} />
      <div style={{position: 'absolute', left: 70, top: 700, width: 940, height: 820, borderRadius: 20, background: '#FFFDE7', border: `24px solid #8D6E63`, boxShadow: `0 0 0 8px ${INK}`}}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{position: 'absolute', left: 60 + i * 210, top: 140, transform: i === 2 ? `scale(${1 + hi * 0.12})` : undefined}}>
            <StickMan frame={frame + i * 5} pose={i === 2 ? 'wave' : 'idle'} height={460} />
            {i === 2 ? <DuckBill x={110} y={40} s={1.1} /> : null}
          </div>
        ))}
        {hi > 0 ? <div style={{position: 'absolute', left: 440, top: 100, width: 260, height: 560, borderRadius: '50%', border: `10px solid #E53935`, opacity: hi}} /> : null}
      </div>
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, celui - 6, celui))} color="#FFFFFF" size={60}>
        ET TOI, DANS TA FAMILLE ?
      </TopBadge>
      <TopBadge s={usePop(celui, 9)} color="#FFE082" size={56}>
        CELUI QUI NE RESSEMBLE À PERSONNE
      </TopBadge>
    </Scene>
  );
};

// ---------- 8. Abonne-toi ----------
export const Abonne: React.FC<SceneProps> = ({dur}) => {
  const frame = useCurrentFrame();
  const cta = usePop(4, 8);
  const pulse = 1 + Math.max(0, Math.sin(frame * 0.25)) * 0.06;
  const click = prog(frame, dur, 0.55, 0.62) - prog(frame, dur, 0.66, 0.72);
  const subscribed = frame / dur > 0.66;
  return (
    <Scene bg="#81D4FA">
      <Creek frame={frame} />
      <Place x={540} y={platOn(GROUND_Y - 40, 640)}>
        <Platypus frame={frame} width={640} walking />
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
