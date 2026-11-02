import React from 'react';
import {interpolate} from 'remotion';
import {Bush, Chimp, Colobus, Desk, DNA, Meat, Phone, Pizza, Whistle, INK} from './characters/Chimp';
import {StickMan} from './characters/StickMan';
import {Cross} from './characters/Icons';
import {Clock, Star} from './characters/Icons2';
import {FONT, Place} from './ui';
import {TopBadge} from './scenes/common';
import {BigText, Burst, P, Spec, pop, rp} from './shotkit';
import {Office} from './scenes/Scenes';

// ---------------------------------------------------------------------------
// Inserts plein écran : un nouveau tableau toutes les 3 à 5 s.
// ---------------------------------------------------------------------------

const Ground: React.FC<{y: number; color?: string}> = ({y, color = '#7CB342'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, bottom: 0, background: color, borderTop: `10px solid ${INK}`}} />
);

const Plate: React.FC<{size?: number}> = ({size = 300}) => (
  <svg viewBox="0 0 300 160" width={size} style={{overflow: 'visible'}}>
    <ellipse cx={150} cy={80} rx={140} ry={66} fill="#FFFFFF" stroke={INK} strokeWidth={10} />
    <ellipse cx={150} cy={80} rx={90} ry={40} fill="#ECEFF1" stroke="#B0BEC5" strokeWidth={5} />
  </svg>
);

const Bubble: React.FC<{w: number; h: number; s: number; children: React.ReactNode; tail?: 'left' | 'right'}> = ({w, h, s, children, tail = 'left'}) => (
  <div style={{position: 'relative', width: w, height: h, borderRadius: 60, background: '#FFFFFF', border: `10px solid ${INK}`, transform: `scale(${s})`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20}}>
    {children}
    <div style={{position: 'absolute', bottom: -46, [tail]: 80, width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderTop: `50px solid ${INK}`}} />
  </div>
);

// --- titre ---
const PasLeDroit: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFAB91" b="#D84315" />
    <Ground y={1500} color="#8D6E63" />
    <Place x={380} y={1290} scale={pop(t, 0)}>
      <Chimp frame={t} width={400} sit mood="sad" pose="beg" />
    </Place>
    <Place x={780} y={1480} scale={pop(t, 8)}>
      <Plate size={320} />
    </Place>
    <Place x={780} y={1470} scale={pop(t, 16) * 0.7}>
      <Cross size={240} draw={rp(t, 16, 30)} />
    </Place>
    <TopBadge s={pop(t, 4)} color="#FFFFFF" size={60}>PAS LE DROIT DE MANGER !</TopBadge>
  </>
);

// --- collègue ---
const SaPart: React.FC<P> = ({t, len}) => {
  const run = rp(t, 4, len * 0.6);
  return (
    <>
      <Office frame={t} />
      <Place x={720} y={1330}>
        <Desk width={420} frame={t} screen="#FFD54F" />
      </Place>
      <Place x={720} y={1150} scale={pop(t, 2) * 1.2}>
        <Pizza size={220} />
      </Place>
      <Place x={interpolate(run, [0, 1], [-100, 420])} y={1280}>
        <StickMan frame={t} pose={run < 1 ? 'idle' : 'cheer'} height={360} walking={run < 1} />
      </Place>
      {[0, 1].map((i) => (
        <Place key={i} x={880 + i * 120} y={1280 + i * 30} scale={0.85}>
          <StickMan frame={t + i * 5} pose="surprised" height={300} />
        </Place>
      ))}
      <BigText y={780} s={pop(t, 20, 6)} size={140} color="#FF5252">?!</BigText>
      <TopBadge s={pop(t, 4)} color="#FFE082">IL VEUT SA PART !</TopBadge>
    </>
  );
};

const VentreVide: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#CFD8DC" b="#546E7A" />
    <Ground y={1560} color="#8D6E63" />
    <Place x={540 + Math.sin(t * 0.9) * (t % 30 < 10 ? 4 : 0)} y={1220} scale={0.9 + pop(t, 0) * 0.15}>
      <Chimp frame={t} width={520} mood="sad" />
    </Place>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{position: 'absolute', left: 640 + i * 40, top: 1280 - i * 50, fontFamily: FONT, fontSize: 50 + i * 12, color: '#FFFFFF', WebkitTextStroke: `7px ${INK}`, paintOrder: 'stroke fill', opacity: ((t + i * 8) % 30) / 30 > 0.3 ? 1 : 0}}>
        GRR
      </div>
    ))}
    <TopBadge s={pop(t, 4)} color="#FFFFFF">LE VENTRE VIDE</TopBadge>
  </>
);

// --- cannibalisme ---
const ColobeRoux: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFE0B2" b="#E65100" />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <path d="M-20 1340 Q 540 1290 1100 1340" stroke={INK} strokeWidth={48} fill="none" strokeLinecap="round" />
      <path d="M-20 1340 Q 540 1290 1100 1340" stroke="#795548" strokeWidth={34} fill="none" strokeLinecap="round" />
    </svg>
    <Place x={540} y={1180} scale={0.9 + pop(t, 0) * 0.2}>
      <Colobus frame={t} width={680} />
    </Place>
    <TopBadge s={pop(t, 4)} color="#FFFFFF" size={84}>UN COLOBE ROUX</TopBadge>
  </>
);

const Cannibales: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E1BEE7" b="#7B1FA2" />
    <Ground y={1560} color="#9575CD" />
    {[0, 1].map((i) => (
      <Place key={i} x={260 + i * 220} y={1400} scale={pop(t, i * 4)}>
        <StickMan frame={t + i * 5} pose="surprised" height={330} />
      </Place>
    ))}
    <div style={{position: 'absolute', left: 430, top: 760}}>
      <Bubble w={560} h={380} s={pop(t, 10)}>
        <Chimp frame={t} width={190} mood="chew" pose="eat" />
        <div style={{fontFamily: FONT, fontSize: 90, color: '#E53935'}}>?</div>
      </Bubble>
    </div>
    <TopBadge s={pop(t, 4)} color="#FFE082">CANNIBALES ?!</TopBadge>
  </>
);

const Faux: React.FC<P> = ({t}) => {
  const stamp = pop(t, 0, 7);
  const cols = rp(t, 26, 40);
  return (
    <>
      <Burst t={t} a="#E8F5E9" b="#43A047" />
      <div style={{position: 'absolute', inset: 0, opacity: cols}}>
        <div style={{position: 'absolute', left: 538, top: 700, width: 6, height: 1100, background: INK, opacity: 0.4}} />
        <Place x={270} y={1180}>
          <Colobus frame={t} width={400} />
        </Place>
        <Place x={810} y={1180}>
          <Chimp frame={t} width={380} mood="happy" />
        </Place>
        <div style={{position: 'absolute', left: 0, width: 540, top: 1460, textAlign: 'center', fontFamily: FONT, fontSize: 70, color: '#FFFFFF', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>SINGE</div>
        <div style={{position: 'absolute', left: 540, width: 540, top: 1460, textAlign: 'center', fontFamily: FONT, fontSize: 64, color: '#FFEB3B', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>GRAND SINGE</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', opacity: 1 - cols}}>
        <span style={{display: 'inline-block', fontFamily: FONT, fontSize: 240, color: '#E53935', border: `16px solid #E53935`, borderRadius: 40, padding: '30px 50px 0', transform: `scale(${stamp}) rotate(-10deg)`, background: 'rgba(255,255,255,0.8)'}}>FAUX !</span>
      </div>
      <TopBadge s={pop(t, 26)} color="#FFFFFF">PAS LA MÊME ESPÈCE</TopBadge>
    </>
  );
};

const ADN: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E3F2FD" b="#1565C0" />
    <Ground y={1560} color="#90CAF9" />
    <Place x={240} y={1370} scale={pop(t, 0)}>
      <StickMan frame={t} pose="wave" height={400} />
    </Place>
    <Place x={830} y={1290} scale={pop(t, 6)}>
      <Chimp frame={t} width={380} pose="point" mood="happy" look={-1} />
    </Place>
    <Place x={540} y={1050} scale={pop(t, 12)}>
      <DNA size={420} frame={t} />
    </Place>
    <BigText y={1600} s={pop(t, 20, 6)} size={130} color="#FFEB3B">98 % D'ADN</BigText>
    <TopBadge s={pop(t, 4)} color="#FFFFFF" size={54}>SON PLUS PROCHE PARENT : NOUS</TopBadge>
  </>
);

// --- proie ---
const Canopee: React.FC<P> = ({t}) => {
  const k = (t % 45) / 45;
  const x = interpolate(k, [0, 1], [180, 900]);
  const y = 1000 - Math.sin(k * Math.PI) * 260;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#81D4FA, #E1F5FE)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[180, 900].map((cx, i) => (
          <g key={cx}>
            <rect x={cx - 30} y={1100} width={60} height={900} fill="#6D4C41" stroke={INK} strokeWidth={8} />
            <ellipse cx={cx} cy={1120} rx={260} ry={120} fill={i ? '#43A047' : '#2E7D32'} stroke={INK} strokeWidth={8} />
            <ellipse cx={cx + 40} cy={1080} rx={140} ry={60} fill="#66BB6A" />
          </g>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${x - 140 - i * 30} ${y - 30 + i * 22} h ${-90 + i * 10}`} stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.85} />
        ))}
      </svg>
      <Place x={x} y={y} rotate={(k - 0.5) * 30}>
        <Colobus frame={t} width={300} leap />
      </Place>
      <TopBadge s={pop(t, 4)} color="#B3E5FC">À TOUTE VITESSE !</TopBadge>
    </>
  );
};

const Organisent: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF59D" b="#F57F17" />
    <Ground y={1520} color="#7CB342" />
    {[0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      return (
        <Place key={i} x={540 + Math.cos(a) * 270} y={1240 + Math.sin(a) * 110} scale={pop(t, i * 4)} flip={Math.cos(a) > 0}>
          <Chimp frame={t + i * 9} width={300} pose="point" mood="angry" captain={i === 0} look={1} />
        </Place>
      );
    })}
    <Place x={540} y={1120} scale={pop(t, 16) * 0.6}>
      <Star size={140} />
    </Place>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">ILS S'ORGANISENT !</TopBadge>
  </>
);

// --- équipe ---
const Chef: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF176" b="#FBC02D" />
    <Ground y={1600} color="#7CB342" />
    <Place x={430} y={1220} scale={0.9 + pop(t, 0) * 0.15}>
      <Chimp frame={t} width={560} pose="point" mood="angry" captain look={1} />
    </Place>
    <Place x={860} y={880} scale={pop(t, 10)} rotate={Math.sin(t * 0.6) * 8}>
      <Whistle size={220} />
    </Place>
    <BigText y={720} s={pop(t, 14, 6)} size={70} color="#FFFFFF">
      <span style={{position: 'relative', left: 300}}>TUUUT !</span>
    </BigText>
    <TopBadge s={pop(t, 4)} color="#FFD600">LE CHEF DIRIGE</TopBadge>
  </>
);

const Cachette: React.FC<P> = ({t}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(#2E7D32, #0B3D0E)'}} />
    {[0, 1].map((i) => (
      <Place key={i} x={290 + i * 500} y={1160 - pop(t, 6 + i * 6) * 120}>
        <Chimp frame={t + i * 9} width={300} pose="shh" mood="shh" look={i ? -1 : 1} />
      </Place>
    ))}
    {[0, 1].map((i) => (
      <Place key={i} x={290 + i * 500} y={1300}>
        <Bush width={460} />
      </Place>
    ))}
    <BigText y={1500} s={pop(t, 10)} size={110} color="#FFFFFF">CHUT…</BigText>
    <TopBadge s={pop(t, 4)} color="#A5D6A7">CACHÉS EN SILENCE</TopBadge>
  </>
);

const Bloqueurs: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#BBDEFB" b="#1E88E5" />
    <Ground y={1520} color="#7CB342" />
    <Place x={180} y={1220} scale={pop(t, 0)}>
      <Chimp frame={t} width={340} pose="block" mood="angry" look={1} />
    </Place>
    <Place x={900} y={1220} scale={pop(t, 4)} flip>
      <Chimp frame={t + 7} width={340} pose="block" mood="angry" look={1} />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: rp(t, 8, 16)}}>
      {[[380, -1], [700, 1]].map(([x, s]) => (
        <g key={x}>
          <path d={`M${x} 900 V 1500`} stroke="#E53935" strokeWidth={22} strokeDasharray="40 24" />
        </g>
      ))}
    </svg>
    <Place x={540} y={1260} scale={pop(t, 10)}>
      <Colobus frame={t} width={260} scared />
    </Place>
    <TopBadge s={pop(t, 4)} color="#FFFFFF" size={62}>ILS BLOQUENT LES CÔTÉS</TopBadge>
  </>
);

const Rabatteur: React.FC<P> = ({t, len}) => {
  const flee = rp(t, 14, len);
  return (
    <>
      <Burst t={t} a="#C8E6C9" b="#388E3C" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M-20 1100 Q 400 1060 1100 1120" stroke={INK} strokeWidth={46} fill="none" />
        <path d="M-20 1100 Q 400 1060 1100 1120" stroke="#795548" strokeWidth={32} fill="none" />
      </svg>
      <Place x={300} y={950} rotate={Math.sin(t * 1.2) * 6}>
        <Bush width={420} shake={Math.sin(t * 1.5) * 6} />
      </Place>
      <Place x={300 + Math.sin(t * 1.2) * 8} y={1260}>
        <Chimp frame={t} width={380} pose="shake" mood="angry" />
      </Place>
      {[0, 1].map((i) => (
        <Place key={i} x={620 + flee * 600 + i * 150} y={980 - i * 40 - Math.abs(Math.sin(t * 0.3 + i)) * 40}>
          <Colobus frame={t + i * 6} width={240} leap scared />
        </Place>
      ))}
      <BigText y={700} s={pop(t, 6)} size={80} color="#FFEB3B">SHAKE SHAKE !</BigText>
      <TopBadge s={pop(t, 4)} color="#FFFFFF">LE RABATTEUR</TopBadge>
    </>
  );
};

const PasDeWhatsapp: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#DCEDC8" b="#558B2F" />
    <Place x={540} y={1180} scale={pop(t, 0)} rotate={-6}>
      <Phone size={380} frame={t} />
    </Place>
    <Place x={540} y={1180} scale={pop(t, 12)}>
      <Cross size={420} draw={rp(t, 12, 26)} />
    </Place>
    <TopBadge s={pop(t, 4)} color="#FFFFFF" size={56}>SANS UN BRUIT, SANS RÉUNION</TopBadge>
  </>
);

// --- piège ---
const Fini: React.FC<P> = ({t, len}) => (
  <>
    <Burst t={t} a="#FFCDD2" b="#C62828" />
    <Place x={540} y={1150} scale={pop(t, 0) * 1.1}>
      <Clock size={420} turns={rp(t, 0, len) * 0.9} />
    </Place>
    <BigText y={1450} s={pop(t, 30, 6)} size={150} color="#FFEB3B">FINI !</BigText>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">EN QUELQUES SECONDES</TopBadge>
  </>
);

// --- partage ---
const ServisEnPremier: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF8E1" b="#FFA000" />
    <Ground y={1520} color="#7CB342" />
    {[0, 1, 2].map((i) => (
      <React.Fragment key={i}>
        <Place x={210 + i * 330} y={1240} scale={pop(t, i * 6)}>
          <Chimp frame={t + i * 9} width={300} pose="hold" mood="happy" captain={i === 1} />
        </Place>
        <Place x={210 + i * 330} y={1250} scale={pop(t, 10 + i * 6) * 0.9}>
          <Meat size={140} />
        </Place>
        <Place x={210 + i * 330} y={980} scale={pop(t, 14 + i * 6) * 0.55}>
          <Star size={140} />
        </Place>
      </React.Fragment>
    ))}
    <TopBadge s={pop(t, 4)} color="#FFFFFF" size={64}>LES CHASSEURS D'ABORD</TopBadge>
  </>
);

const Petits: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FCE4EC" b="#EC407A" />
    <Ground y={1540} color="#7CB342" />
    <Place x={430} y={1270} scale={pop(t, 0)}>
      <Chimp frame={t} width={420} sit pose="eat" mood="chew" />
    </Place>
    <Place x={720} y={1340} scale={pop(t, 8)}>
      <Chimp frame={t + 5} width={300} baby sit pose="eat" mood="chew" />
    </Place>
    <Place x={640} y={1460} scale={pop(t, 12) * 0.8}>
      <Meat size={140} />
    </Place>
    <TopBadge s={pop(t, 4)} color="#F8BBD0" size={56}>+ LES PETITS ET DES FEMELLES</TopBadge>
  </>
);

const SansRien: React.FC<P> = ({t, len}) => {
  const walk = rp(t, 0, len + 10);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#90A4AE, #CFD8DC)'}} />
      <Ground y={1500} color="#8D6E63" />
      <Place x={interpolate(walk, [0, 1], [700, 160])} y={1230} flip>
        <Chimp frame={t} width={360} walking mood="sad" pose="beg" />
      </Place>
      {[0, 1].map((i) => (
        <div key={i} style={{position: 'absolute', left: 880 + i * 60, top: 820 + ((t * 2 + i * 40) % 160), width: 6, height: 40, background: '#4FC3F7', borderRadius: 3}} />
      ))}
      <BigText y={1600} s={pop(t, 10)} size={100} color="#FFFFFF">0 MORCEAU</BigText>
      <TopBadge s={pop(t, 4)} color="#FFFFFF">REPART SANS RIEN…</TopBadge>
    </>
  );
};

// --- conclusion ---
const CommeNous: React.FC<P> = ({t}) => {
  const hi = rp(t, 4, 20);
  return (
    <>
      <Burst t={t} a="#FFF9C4" b="#FF7043" />
      <Ground y={1560} color="#7CB342" />
      <Place x={interpolate(hi, [0, 1], [150, 330])} y={1380}>
        <StickMan frame={t} pose="cheer" height={420} />
      </Place>
      <Place x={interpolate(hi, [0, 1], [930, 760])} y={1330} flip>
        <Chimp frame={t} width={400} pose="cheer" mood="happy" />
      </Place>
      <Place x={545} y={980} scale={hi > 0.95 ? pop(t, 20, 6) : 0}>
        <Star size={170} />
      </Place>
      <TopBadge s={pop(t, 4)} color="#FFFFFF">ILS NOUS RESSEMBLENT !</TopBadge>
    </>
  );
};

// --- question ---
const Commentaire: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E1F5FE" b="#0288D1" />
    <div style={{position: 'absolute', left: 120, top: 760, width: 840, borderRadius: 40, background: '#FFFFFF', border: `10px solid ${INK}`, padding: 40, transform: `scale(${pop(t, 0)})`, fontFamily: FONT}}>
      {['MOI JE SUIS LE CHASSEUR !', 'MOI LE CAPITAINE !', '…'].map((txt, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 30, opacity: rp(t, 8 + i * 10, 14 + i * 10)}}>
          <div style={{width: 90, height: 90, borderRadius: '50%', background: ['#FFB74D', '#81C784', '#BA68C8'][i], border: `6px solid ${INK}`}} />
          <div style={{fontSize: 46, color: INK}}>{txt}</div>
        </div>
      ))}
    </div>
    <Place x={540} y={1560 + Math.abs(Math.sin(t * 0.25)) * 30} scale={pop(t, 14, 6)}>
      <svg viewBox="0 0 200 240" width={200} style={{overflow: 'visible'}}>
        <path d="M60 10 H140 V120 H190 L100 230 L10 120 H60 Z" fill="#FFEB3B" stroke={INK} strokeWidth={14} strokeLinejoin="round" />
      </svg>
    </Place>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">DIS-LE EN COMMENTAIRE !</TopBadge>
  </>
);

// ---------- programme ----------
export const PLAN: Record<string, Spec[]> = {
  titre: [{from: ['et'], C: PasLeDroit}],
  collegue: [
    {from: ['mais'], to: ['chez'], C: SaPart},
    {from: ['chez'], C: VentreVide},
  ],
  cannibale: [
    {from: ['singe'], to: ['beaucoup'], C: ColobeRoux},
    {from: ['beaucoup'], to: ['faux'], C: Cannibales},
    {from: ['faux'], to: ['et'], C: Faux},
    {from: ['et'], C: ADN},
  ],
  proie: [
    {from: ['saute'], to: ['seul', 1], C: Canopee},
    {from: ['alors'], C: Organisent},
  ],
  equipe: [
    {from: ['chef'], to: ['certains'], C: Chef},
    {from: ['certains'], to: ["d'autres"], C: Cachette},
    {from: ["d'autres"], to: ['rabatteur'], C: Bloqueurs},
    {from: ['rabatteur'], to: ['tout'], C: Rabatteur},
    {from: ['tout'], C: PasDeWhatsapp},
  ],
  piege: [{from: ['en'], C: Fini}],
  partage: [
    {from: ['moment'], to: ['avec'], C: ServisEnPremier},
    {from: ['avec'], to: ['ceux', 1], C: Petits},
    {from: ['repartent'], C: SansRien},
  ],
  conclusion: [{from: ['les'], C: CommeNous}],
  question: [{from: ['dis-le'], C: Commentaire}],
};
