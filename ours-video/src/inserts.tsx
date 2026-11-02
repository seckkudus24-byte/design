import React from 'react';
import {interpolate} from 'remotion';
import {Backpack, Bear, HikerProne, INK} from './characters/Bear';
import {StickMan} from './characters/StickMan';
import {Check, Cross} from './characters/Icons';
import {Star} from './characters/Icons2';
import {FONT, Place} from './ui';
import {TopBadge} from './scenes/common';
import {BigText, Burst, P, Spec, pop, rp} from './shotkit';

// ---------------------------------------------------------------------------
// Inserts plein écran : un nouveau tableau toutes les 3 à 5 s.
// ---------------------------------------------------------------------------

const Ground: React.FC<{y: number; color?: string}> = ({y, color = '#8BC34A'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, bottom: 0, background: color, borderTop: `10px solid ${INK}`}} />
);

const Label: React.FC<{x: number; y: number; s: number; size?: number; color?: string; children: React.ReactNode}> = ({x, y, s, size = 60, color = '#FFFFFF', children}) => (
  <div style={{position: 'absolute', left: x - 320, width: 640, top: y, textAlign: 'center', fontFamily: FONT, fontSize: size, color, WebkitTextStroke: `${size / 7}px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${s})`}}>{children}</div>
);

const bOn = (y: number, w: number) => y - 0.341 * w;

const Lying: React.FC<{x: number; y: number; scale?: number}> = ({x, y, scale = 1}) => (
  <>
    <Place x={x} y={y - 60 * scale} rotate={90} scale={scale}>
      <StickMan frame={0} pose="idle" height={460} />
    </Place>
    <Place x={x - 20 * scale} y={y - 150 * scale} rotate={90} scale={scale * 0.7}>
      <Backpack size={220} />
    </Place>
  </>
);

const Plate: React.FC<{size?: number}> = ({size = 600}) => (
  <svg viewBox="0 0 600 200" width={size} style={{overflow: 'visible'}}>
    <ellipse cx={300} cy={100} rx={290} ry={90} fill="#FFFFFF" stroke={INK} strokeWidth={12} />
    <ellipse cx={300} cy={100} rx={200} ry={56} fill="#ECEFF1" stroke="#B0BEC5" strokeWidth={6} />
  </svg>
);

// --- titre ---
const Sauver: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#C8E6C9" b="#2E7D32" />
    <Ground y={1460} />
    <Lying x={540} y={1470} scale={1.15} />
    <Place x={540} y={980} scale={pop(t, 8)}>
      <Check size={220} draw={rp(t, 8, 20)} />
    </Place>
    <TopBadge s={pop(t, 2)} color="#A5D6A7">FAIRE LE MORT = SAUVÉ ?</TopBadge>
  </>
);

const Diner: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFCDD2" b="#B71C1C" />
    <Place x={540} y={1500} scale={pop(t, 0)}>
      <Plate size={760} />
    </Place>
    <Lying x={540} y={1460} scale={1} />
    <Place x={540} y={bOn(1150, 700)} scale={pop(t, 6)}>
      <Bear frame={t} kind="black" width={700} mood="hungry" napkin />
    </Place>
    <TopBadge s={pop(t, 2)} color="#FF8A80">…OU SON DÎNER ?!</TopBadge>
  </>
);

// --- technique ---
const Cles: React.FC<P> = ({t}) => {
  const k1 = rp(t, 6, 24);
  const k2 = rp(t, 40, 58);
  const lock = (x: number, open: boolean, color: string) => (
    <g transform={`translate(${x} 1200)`}>
      <path d={open ? 'M-60 -40 V -110 Q -60 -170 0 -170 Q 60 -170 60 -110 V -80' : 'M-60 -40 V -110 Q -60 -170 0 -170 Q 60 -170 60 -110 V -40'} stroke={INK} strokeWidth={26} fill="none" />
      <rect x={-100} y={-50} width={200} height={170} rx={24} fill={color} stroke={INK} strokeWidth={10} />
      <circle cx={0} cy={20} r={20} fill={INK} />
      <rect x={-8} y={20} width={16} height={50} fill={INK} />
    </g>
  );
  return (
    <>
      <Burst t={t} a="#FFF8E1" b="#FFA000" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {lock(300, k1 >= 1, '#8D6E63')}
        {lock(780, false, '#424242')}
        <g transform={`translate(${t < 34 ? interpolate(k1, [0, 1], [300, 300]) : interpolate(k2, [0, 1], [300, 780])} ${1400 - 60 * Math.min(1, t / 10)})`}>
          <circle cx={0} cy={0} r={40} fill="none" stroke="#FFD600" strokeWidth={16} />
          <rect x={-8} y={36} width={16} height={110} fill="#FFD600" stroke={INK} strokeWidth={4} />
          <rect x={8} y={100} width={30} height={14} fill="#FFD600" stroke={INK} strokeWidth={4} />
        </g>
      </svg>
      <Place x={780} y={1220} scale={k2 >= 1 ? pop(t, 58) : 0}>
        <Cross size={260} />
      </Place>
      <TopBadge s={pop(t, 4)} color="#FFFFFF" size={56}>PAS LA MÊME TECHNIQUE POUR TOUS</TopBadge>
    </>
  );
};

// --- reconnaître ---
const Couleur: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#ECEFF1" b="#546E7A" />
    {['#3E2723', '#6D4C41', '#A1887F', '#212121'].map((c, i) => (
      <div key={c} style={{position: 'absolute', left: 120 + (i % 2) * 450, top: 820 + Math.floor(i / 2) * 420, width: 390, height: 360, borderRadius: 30, background: c, border: `10px solid ${INK}`, transform: `scale(${pop(t, i * 3)})`}} />
    ))}
    <Place x={540} y={1250} scale={pop(t, 14)}>
      <Cross size={520} draw={rp(t, 14, 26)} />
    </Place>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">PAS LA COULEUR !</TopBadge>
  </>
);

const Epaules: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E3F2FD" b="#1565C0" />
    <Place x={520} y={1250} scale={1.3}>
      <Bear frame={t} kind="grizzly" width={620} />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute', transform: `scale(${pop(t, 4)})`, transformOrigin: '470px 1000px'}}>
      <circle cx={470} cy={1000} r={150} fill="rgba(255,255,255,0.25)" stroke={INK} strokeWidth={18} />
      <path d="M576 1106 l 110 110" stroke={INK} strokeWidth={40} strokeLinecap="round" />
      <path d="M576 1106 l 110 110" stroke="#8D6E63" strokeWidth={24} strokeLinecap="round" />
    </svg>
    <TopBadge s={pop(t, 2)} color="#FFE082">REGARDE LES ÉPAULES</TopBadge>
  </>
);

const Bosse: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFE0B2" b="#8D6E63" />
    <Ground y={1460} />
    <Place x={520} y={bOn(1470, 760)} scale={0.9 + pop(t, 0) * 0.1}>
      <Bear frame={t} kind="grizzly" width={760} />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: rp(t, 14, 22)}}>
      <path d="M560 840 L 520 1000" stroke={INK} strokeWidth={26} strokeLinecap="round" />
      <path d="M560 840 L 520 1000" stroke="#FFEB3B" strokeWidth={14} strokeLinecap="round" />
      <path d="M520 1010 l -36 -40 M520 1010 l 34 -30" stroke={INK} strokeWidth={26} strokeLinecap="round" />
      <path d="M520 1010 l -36 -40 M520 1010 l 34 -30" stroke="#FFEB3B" strokeWidth={14} strokeLinecap="round" />
    </svg>
    <Label x={600} y={740} s={pop(t, 16)} size={80} color="#FFEB3B">LA BOSSE !</Label>
    <TopBadge s={pop(t, 2)} color="#FFB74D">GRIZZLY = OURS BRUN</TopBadge>
  </>
);

const OursNoir: React.FC<P> = ({t, len}) => {
  const climb = rp(t, len * 0.45, len);
  return (
    <>
      <Burst t={t} a="#CFD8DC" b="#263238" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect x={760} y={-20} width={140} height={1960} fill="#6D4C41" stroke={INK} strokeWidth={10} />
        <path d="M620 700 L 760 760" stroke="#6D4C41" strokeWidth={40} />
      </svg>
      <Ground y={1560} />
      <Place x={interpolate(climb, [0, 1], [420, 720])} y={interpolate(climb, [0, 1], [bOn(1570, 640), 1000])} rotate={-climb * 70}>
        <Bear frame={t} kind="black" width={640} walking={climb > 0} />
      </Place>
      <Label x={360} y={760} s={pop(t, 8) * (1 - rp(t, len * 0.4, len * 0.45))} size={70} color="#FFFFFF">PAS DE BOSSE</Label>
      <Label x={360} y={760} s={pop(t, len * 0.45)} size={70} color="#A5D6A7">GRIMPEUR !</Label>
      <TopBadge s={pop(t, 2)} color="#FFFFFF">L'OURS NOIR</TopBadge>
    </>
  );
};

// --- grizzly ---
const PlatVentre: React.FC<P> = ({t}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: '#8BC34A'}} />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {Array.from({length: 40}, (_, i) => (
        <path key={i} d={`M${(i * 131) % 1080} ${600 + ((i * 197) % 1300)} l 6 -24 l 6 24`} stroke="#558B2F" strokeWidth={5} fill="none" />
      ))}
    </svg>
    <Place x={540} y={1250} scale={pop(t, 0) * 1.3}>
      <HikerProne width={420} backpack={false} />
    </Place>
    {[
      ['MAINS SUR LA NUQUE', 760, 0],
      ['À PLAT VENTRE', 1180, 18],
      ['JAMBES ÉCARTÉES', 1640, 36],
    ].map(([txt, y, d], i) => (
      <div key={i} style={{position: 'absolute', left: i === 1 ? 60 : 560, top: y as number, padding: '14px 26px 6px', borderRadius: 24, background: '#FFFFFF', border: `8px solid ${INK}`, fontFamily: FONT, fontSize: 46, color: INK, transform: `scale(${pop(t, d as number)})`}}>
        {txt}
      </div>
    ))}
    <TopBadge s={pop(t, 2)} color="#FFE082">VUE DU CIEL</TopBadge>
  </>
);

const Retourner: React.FC<P> = ({t}) => {
  const push = Math.sin(t * 0.25);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: '#8BC34A'}} />
      <Place x={480} y={1280} scale={1.1}>
        <HikerProne width={380} flipped={Math.max(0, push) * 0.3} />
      </Place>
      <Place x={830} y={1150} rotate={90}>
        <Bear frame={t} kind="grizzly" width={520} pose="sniff" />
      </Place>
      <Label x={540} y={800} s={pop(t, 10)} size={70} color="#FFFFFF">IMPOSSIBLE !</Label>
      <TopBadge s={pop(t, 2)} color="#A5D6A7" size={58}>IL NE PEUT PAS TE RETOURNER</TopBadge>
    </>
  );
};

const Sac: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#DCEDC8" b="#33691E" />
    <Place x={540} y={1180} scale={0.9 + pop(t, 0) * 0.3}>
      <Backpack size={460} />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: rp(t, 10, 20)}}>
      <path d="M320 860 L 540 780 L 760 860 L 760 1080 Q 760 1300 540 1400 Q 320 1300 320 1080 Z" fill="none" stroke="#FFEB3B" strokeWidth={18} strokeDasharray="40 22" />
    </svg>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">TON SAC PROTÈGE TON DOS</TopBadge>
  </>
);

const Defense: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFE0B2" b="#E65100" />
    <Ground y={1500} />
    <Place x={420} y={bOn(1510, 600)}>
      <Bear frame={t} kind="grizzly" width={600} roar={t % 50 < 30} mood="scared" />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute', transform: `scale(${pop(t, 8)})`, transformOrigin: '860px 1000px'}}>
      <path d="M760 860 L 860 820 L 960 860 L 960 980 Q 960 1080 860 1130 Q 760 1080 760 980 Z" fill="#42A5F5" stroke={INK} strokeWidth={10} />
    </svg>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">IL ATTAQUE POUR SE DÉFENDRE</TopBadge>
  </>
);

// --- noir ---
const PasLeMort: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFCDD2" b="#C62828" />
    <Ground y={1460} />
    <Lying x={540} y={1470} scale={1.15} />
    <Place x={540} y={1300} scale={pop(t, 6)}>
      <Cross size={520} draw={rp(t, 6, 18)} />
    </Place>
    <TopBadge s={pop(t, 2)} color="#FF8A80">SURTOUT PAS LE MORT !</TopBadge>
  </>
);

const Assiette: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF3E0" b="#6D4C41" />
    <Place x={540} y={1500} scale={pop(t, 0)}>
      <Plate size={800} />
    </Place>
    <Lying x={540} y={1460} scale={1} />
    <Place x={560} y={bOn(1150, 680)} scale={pop(t, 6)}>
      <Bear frame={t} kind="black" width={680} mood="hungry" napkin />
    </Place>
    <Label x={540} y={760} s={pop(t, 12, 6)} size={80} color="#FFEB3B">BON APPÉTIT ?!</Label>
    <TopBadge s={pop(t, 2)} color="#FFFFFF" size={60}>SERVI DANS UNE ASSIETTE</TopBadge>
  </>
);

const FaisToiGrand: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF59D" b="#F57F17" />
    <Ground y={1560} />
    <Place x={420} y={1240} scale={1 + pop(t, 0) * 0.35}>
      <StickMan frame={t} pose="cheer" height={480} />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {[0, 1, 2].map((i) => {
        const k = ((t + i * 8) % 24) / 24;
        return <path key={i} d={`M${560 + k * 200} ${900 - k * 60} q ${40 + k * 40} ${70} 0 ${150 + k * 60}`} stroke="#FFFFFF" strokeWidth={14} fill="none" opacity={1 - k} strokeLinecap="round" />;
      })}
    </svg>
    <Place x={900} y={bOn(1570, 420)} flip>
      <Bear frame={t} kind="black" width={420} mood="scared" />
    </Place>
    <Label x={680} y={700} s={pop(t, 4, 6)} size={110} color="#FFFFFF">OUSTE !</Label>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">FAIS-TOI GRAND, CRIE FORT !</TopBadge>
  </>
);

const Museau: React.FC<P> = ({t}) => {
  const k = (t % 24) / 24;
  const hit = k > 0.4 && k < 0.6;
  return (
    <>
      <Burst t={t} a="#FFE0B2" b="#BF360C" />
      <Ground y={1560} />
      <Place x={280} y={1300}>
        <StickMan frame={t} pose="point" height={460} />
      </Place>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`rotate(${-40 + Math.sin(k * Math.PI) * 70} 360 1210)`}>
          <rect x={350} y={1000} width={26} height={240} rx={10} fill="#8D6E63" stroke={INK} strokeWidth={6} />
        </g>
      </svg>
      <Place x={760 + (hit ? 20 : 0)} y={bOn(1570, 560)} flip>
        <Bear frame={t} kind="black" width={560} mood={hit ? 'dizzy' : 'angry'} roar={!hit} />
      </Place>
      {hit ? (
        <>
          <Place x={590} y={1180}>
            <Star size={150} />
          </Place>
          <Label x={600} y={880} s={1} size={100} color="#FFEB3B">BONK !</Label>
        </>
      ) : null}
      <TopBadge s={pop(t, 2)} color="#FF8A80" size={62}>FRAPPE LE MUSEAU !</TopBadge>
    </>
  );
};

// --- conclusion ---
const TenirTete: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFCCBC" b="#D84315" />
    <Ground y={1540} />
    <Place x={330} y={1260} scale={1.1}>
      <StickMan frame={t} pose="cheer" height={480} />
    </Place>
    <Place x={800 + rp(t, 10, 50) * 300} y={bOn(1550, 480)}>
      <Bear frame={t} kind="black" width={480} mood="scared" walking />
    </Place>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">L'AUTRE : TIENS-LUI TÊTE</TopBadge>
  </>
);

const Ignorer: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E1F5FE" b="#0277BD" />
    <Ground y={1540} color="#90CAF9" />
    <Place x={330} y={1300}>
      <StickMan frame={t} pose="idle" height={440} />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <path d="M270 1060 Q 330 990 390 1060" stroke={INK} strokeWidth={14} fill="none" />
      <rect x={250} y={1050} width={34} height={56} rx={12} fill="#E53935" stroke={INK} strokeWidth={6} />
      <rect x={376} y={1050} width={34} height={56} rx={12} fill="#E53935" stroke={INK} strokeWidth={6} />
    </svg>
    <Place x={780} y={1300}>
      <StickMan frame={t} pose="surprised" height={400} />
    </Place>
    <Label x={790} y={830} s={pop(t, 6)} size={60} color="#FFFFFF">BLA BLA BLA</Label>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">CERTAINS : ON IGNORE</TopBadge>
  </>
);

const Affronter: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFEBEE" b="#AD1457" />
    <Ground y={1540} color="#F48FB1" />
    <Place x={330} y={1260} scale={1.1}>
      <StickMan frame={t} pose="thumbs" height={460} />
    </Place>
    <Place x={780} y={1300}>
      <StickMan frame={t} pose="worried" height={400} />
    </Place>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">D'AUTRES : ON AFFRONTE</TopBadge>
  </>
);

// --- question ---
const Commentaire: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E1F5FE" b="#0288D1" />
    <div style={{position: 'absolute', left: 120, top: 760, width: 840, borderRadius: 40, background: '#FFFFFF', border: `10px solid ${INK}`, padding: 40, transform: `scale(${pop(t, 0)})`, fontFamily: FONT}}>
      {['MOI JE COURS !', 'JE FAIS LE MORT', '…'].map((txt, i) => (
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
  titre: [
    {from: ['faire'], to: ['ou', 1], C: Sauver},
    {from: ['ou', 1], C: Diner},
  ],
  technique: [{from: ["c'est"], C: Cles}],
  reconnaitre: [
    {from: ['ne'], to: ['regarde'], C: Couleur},
    {from: ['regarde'], to: ["l'ours"], C: Epaules},
    {from: ["l'ours"], to: ["l'ours", 1], C: Bosse},
    {from: ["l'ours", 1], C: OursNoir},
  ],
  grizzly: [
    {from: ["s'il"], to: ['pour'], C: PlatVentre},
    {from: ['pour'], to: ['garde'], C: Retourner},
    {from: ['garde'], to: ['grizzly', 1], C: Sac},
    {from: ['grizzly', 1], to: ['bouges'], C: Defense},
  ],
  noir: [
    {from: ['la'], to: ['ce'], C: PasLeMort},
    {from: ['ce'], to: ['fais-toi'], C: Assiette},
    {from: ['fais-toi'], to: ["s'il"], C: FaisToiGrand},
    {from: ["s'il"], C: Museau},
  ],
  conclusion: [
    {from: ["l'autre"], to: ['comme'], C: TenirTete},
    {from: ['comme'], to: ['et'], C: Ignorer},
    {from: ['et'], C: Affronter},
  ],
  question: [{from: ['dis-le'], C: Commentaire}],
};
