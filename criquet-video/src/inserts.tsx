import React from 'react';
import {interpolate} from 'remotion';
import {Chick, Cricket, INK, Nest, Quelea, Stink} from './characters/Bugs';
import {StickMan} from './characters/StickMan';
import {Cross} from './characters/Icons';
import {Star} from './characters/Icons2';
import {FONT, Place} from './ui';
import {TopBadge} from './scenes/common';
import {BigText, Burst, P, Spec, pop, rp} from './shotkit';

// ---------------------------------------------------------------------------
// Inserts plein écran : un nouveau tableau toutes les 3 à 5 s.
// ---------------------------------------------------------------------------

const Ground: React.FC<{y: number; color?: string}> = ({y, color = '#D4B36A'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, bottom: 0, background: color, borderTop: `10px solid ${INK}`}} />
);

const Label: React.FC<{x: number; y: number; s: number; size?: number; color?: string; children: React.ReactNode}> = ({x, y, s, size = 60, color = '#FFFFFF', children}) => (
  <div style={{position: 'absolute', left: x - 300, width: 600, top: y, textAlign: 'center', fontFamily: FONT, fontSize: size, color, WebkitTextStroke: `${size / 7}px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${s})`}}>{children}</div>
);

const ChicksInNest: React.FC<{t: number; x: number; y: number; scale?: number; scared?: boolean}> = ({t, x, y, scale = 1, scared = false}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `scale(${scale})`}}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{position: 'absolute', left: -140 + i * 70, top: -90 - (i % 2) * 10}}>
        <Chick frame={t + i * 7} size={90} scared={scared} />
      </div>
    ))}
    <div style={{position: 'absolute', left: -145, top: -55}}>
      <Nest width={290} />
    </div>
  </div>
);

// Balance à deux plateaux. tilt : -1..1.
const Scale: React.FC<{tilt: number; left: React.ReactNode; right: React.ReactNode}> = ({tilt, left, right}) => {
  const a = tilt * 14;
  const dy = Math.sin((a * Math.PI) / 180) * 300;
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M540 1100 L 470 1560 H 610 Z" fill="#8D6E63" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
        <rect x={380} y={1550} width={320} height={40} rx={12} fill="#6D4C41" stroke={INK} strokeWidth={10} />
        <g transform={`rotate(${a} 540 1100)`}>
          <rect x={220} y={1086} width={640} height={28} rx={14} fill="#A1887F" stroke={INK} strokeWidth={10} />
        </g>
        <circle cx={540} cy={1100} r={22} fill="#FFD54F" stroke={INK} strokeWidth={8} />
        {[
          [240, 1100 - dy],
          [840, 1100 + dy],
        ].map(([x, y], i) => (
          <g key={i}>
            <path d={`M${x} ${y} L ${x - 110} ${y + 180} M${x} ${y} L ${x + 110} ${y + 180}`} stroke={INK} strokeWidth={6} />
            <path d={`M${x - 140} ${y + 180} Q ${x} ${y + 250} ${x + 140} ${y + 180} Z`} fill="#FFD54F" stroke={INK} strokeWidth={10} />
          </g>
        ))}
      </svg>
      <div style={{position: 'absolute', left: 240 - 150, top: 1100 - dy + 30, width: 300, display: 'flex', justifyContent: 'center'}}>{left}</div>
      <div style={{position: 'absolute', left: 840 - 150, top: 1100 + dy + 30, width: 300, display: 'flex', justifyContent: 'center'}}>{right}</div>
    </>
  );
};

// --- titre ---
const Menace: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFAB91" b="#BF360C" />
    <ChicksInNest t={t} x={780} y={1320} scale={1.3} scared />
    <Place x={330} y={1180} scale={0.9 + pop(t, 0) * 0.15}>
      <Cricket frame={t} width={560} mood="hungry" jaws />
    </Place>
    <TopBadge s={pop(t, 4)} color="#FFE082">DES BÉBÉS OISEAUX ?!</TopBadge>
  </>
);

// --- rôles ---
const Inverses: React.FC<P> = ({t}) => {
  const k = (t % 60) / 60;
  const a = k * Math.PI * 2;
  return (
    <>
      <Burst t={t} a="#E1BEE7" b="#6A1B9A" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`rotate(${t * 2} 540 1180)`} opacity={rp(t, 0, 10)}>
          <path d="M540 900 A 280 280 0 0 1 820 1180" stroke="#FFEB3B" strokeWidth={26} fill="none" strokeLinecap="round" />
          <path d="M820 1180 l -40 -50 M820 1180 l 46 -40" stroke="#FFEB3B" strokeWidth={26} strokeLinecap="round" />
          <path d="M540 1460 A 280 280 0 0 1 260 1180" stroke="#FFEB3B" strokeWidth={26} fill="none" strokeLinecap="round" />
          <path d="M260 1180 l 40 50 M260 1180 l -46 40" stroke="#FFEB3B" strokeWidth={26} strokeLinecap="round" />
        </g>
      </svg>
      <Place x={540 + Math.cos(a) * 280} y={1180 + Math.sin(a) * 280} flip={Math.sin(a) < 0}>
        <Quelea frame={t} width={240} flying />
      </Place>
      <Place x={540 + Math.cos(a - 0.9) * 280} y={1180 + Math.sin(a - 0.9) * 280} flip={Math.sin(a - 0.9) < 0}>
        <Cricket frame={t} width={240} mood="hungry" walking jaws />
      </Place>
      <TopBadge s={pop(t, 4)} color="#FFFFFF">RÔLES INVERSÉS !</TopBadge>
    </>
  );
};

// --- cambrioleur ---
const Portrait: React.FC<P> = ({t}) => {
  const arrows = rp(t, 60, 72);
  return (
    <>
      <Burst t={t} a="#F0F4C3" b="#827717" />
      <Place x={520} y={1180} scale={0.9 + pop(t, 0) * 0.2}>
        <Cricket frame={t} width={780} mood="sneaky" />
      </Place>
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: arrows}}>
        {[
          [470, 900, 560, 1010],
          [700, 860, 650, 990],
        ].map(([x1, y1, x2, y2], i) => (
          <g key={i}>
            <path d={`M${x1} ${y1} L ${x2} ${y2}`} stroke={INK} strokeWidth={20} strokeLinecap="round" />
            <path d={`M${x1} ${y1} L ${x2} ${y2}`} stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" />
          </g>
        ))}
      </svg>
      <Label x={590} y={770} s={arrows} size={64} color="#FFEB3B">ÉPINES !</Label>
      <TopBadge s={pop(t, 4)} color="#FFFFFF" size={74}>LE CRIQUET CUIRASSÉ</TopBadge>
    </>
  );
};

const Carte: React.FC<P> = ({t}) => {
  const pin = pop(t, 10, 7);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: '#4FC3F7'}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(540 1150) scale(${pop(t, 0) * 1.25})`}>
          <path d="M-200 -380 Q -60 -420 60 -370 Q 160 -330 200 -250 Q 300 -200 330 -120 Q 260 -60 230 20 Q 200 120 120 200 Q 60 330 -20 360 Q -80 300 -90 200 Q -120 100 -150 0 Q -200 -60 -280 -110 Q -330 -200 -300 -280 Q -260 -360 -200 -380 Z" fill="#FFE0B2" stroke={INK} strokeWidth={10} />
          <path d="M-90 200 Q -120 100 -110 70 Q 20 60 180 70 Q 120 200 120 200 Q 60 330 -20 360 Q -80 300 -90 200 Z" fill="#FFB74D" stroke={INK} strokeWidth={6} opacity={rp(t, 8, 18)} />
        </g>
        <g transform={`translate(560 ${1420 - (1 - pin) * 200})`} opacity={pin}>
          <path d="M0 0 C -50 -60 -50 -120 0 -120 C 50 -120 50 -60 0 0 Z" fill="#E53935" stroke={INK} strokeWidth={8} />
          <circle cx={0} cy={-80} r={18} fill="#FFFFFF" />
        </g>
      </svg>
      <BigText y={1650} s={pop(t, 14)} size={80}>AFRIQUE AUSTRALE</BigText>
    </>
  );
};

const Grimpeur: React.FC<P> = ({t, len}) => {
  const up = rp(t, 30, len);
  return (
    <>
      <Burst t={t} a="#C5E1A5" b="#33691E" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect x={620} y={-20} width={200} height={2000} fill="#795548" stroke={INK} strokeWidth={10} />
        {[300, 700, 1100, 1500].map((y) => (
          <path key={y} d={`M660 ${y} q 30 -40 0 -80 M760 ${y + 160} q -30 -40 0 -80`} stroke="#5D4037" strokeWidth={8} fill="none" />
        ))}
      </svg>
      <Place x={300} y={950} scale={pop(t, 0) * (1 - rp(t, 26, 32))}>
        <div style={{position: 'relative'}}>
          <svg viewBox="0 0 200 120" width={340}>
            <path d="M20 90 Q 60 0 180 30 Q 120 70 20 90 Z" fill="#C8B560" stroke={INK} strokeWidth={8} />
          </svg>
          <div style={{position: 'absolute', left: 50, top: -40}}>
            <Cross size={220} draw={rp(t, 6, 18)} />
          </div>
        </div>
      </Place>
      <Label x={300} y={1150} s={pop(t, 8) * (1 - rp(t, 26, 32))} size={70}>PAS D'AILES !</Label>
      <Place x={720} y={interpolate(up, [0, 1], [1600, 820])} rotate={-90} scale={pop(t, 28)}>
        <Cricket frame={t} width={320} walking mood="happy" />
      </Place>
      <TopBadge s={pop(t, 30)} color="#A5D6A7">EXCELLENT GRIMPEUR</TopBadge>
    </>
  );
};

const Cible: React.FC<P> = ({t}) => {
  const lock = rp(t, 0, 20);
  return (
    <>
      <Burst t={t} a="#FFCDD2" b="#B71C1C" />
      <ChicksInNest t={t} x={540} y={1300} scale={1.6} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(540 1190) scale(${interpolate(lock, [0, 1], [2, 1])}) rotate(${(1 - lock) * 90})`} opacity={lock}>
          <circle r={260} fill="none" stroke="#FF1744" strokeWidth={14} />
          <circle r={140} fill="none" stroke="#FF1744" strokeWidth={10} />
          <path d="M-320 0 H -150 M150 0 H 320 M0 -320 V -150 M0 150 V 320" stroke="#FF1744" strokeWidth={12} />
        </g>
      </svg>
      <TopBadge s={pop(t, 4)} color="#FFFFFF">SA CIBLE PRÉFÉRÉE</TopBadge>
    </>
  );
};

const Travailleur: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF8E1" b="#FF8F00" />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <path d="M-20 1360 Q 540 1300 1100 1360" stroke={INK} strokeWidth={48} fill="none" strokeLinecap="round" />
      <path d="M-20 1360 Q 540 1300 1100 1360" stroke="#795548" strokeWidth={34} fill="none" strokeLinecap="round" />
    </svg>
    <Place x={480} y={1150} scale={0.9 + pop(t, 0) * 0.2}>
      <Quelea frame={t} width={620} />
    </Place>
    <Label x={760} y={1020} s={pop(t, 14)} size={64} color="#FF5252">BEC ROUGE</Label>
    <TopBadge s={pop(t, 4)} color="#FFFFFF" size={60}>LE TRAVAILLEUR À BEC ROUGE</TopBadge>
  </>
);

// --- attend ---
const Voleur: React.FC<P> = ({t, len}) => {
  const out = rp(t, 6, len - 10);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#3949AB, #7986CB)'}} />
      <div style={{position: 'absolute', left: 860, top: 640, width: 120, height: 120, borderRadius: '50%', background: '#FFF9C4'}} />
      <Ground y={1520} color="#558B2F" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M120 1050 L 420 800 L 720 1050 Z" fill="#E57373" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
        <rect x={160} y={1045} width={520} height={480} fill="#FFE0B2" stroke={INK} strokeWidth={10} />
        <rect x={360} y={1290} width={110} height={235} fill="#8D6E63" stroke={INK} strokeWidth={8} />
        <rect x={210} y={1110} width={110} height={100} fill={out < 0.9 ? '#FFEB3B' : '#455A64'} stroke={INK} strokeWidth={8} />
        <rect x={520} y={1110} width={110} height={100} fill={out < 0.9 ? '#FFEB3B' : '#455A64'} stroke={INK} strokeWidth={8} />
      </svg>
      {[0, 1].map((i) => (
        <Place key={i} x={interpolate(out, [0, 1], [415, 40 - i * 120])} y={1390}>
          <StickMan frame={t + i * 6} height={260} walking={out > 0 && out < 1} />
        </Place>
      ))}
      <Place x={880} y={1300 - pop(t, 30) * 60}>
        <Cricket frame={t} width={260} mask mood="sneaky" />
      </Place>
      <svg viewBox="0 0 360 200" width={360} style={{position: 'absolute', left: 700, top: 1330}}>
        {[[70, 120, 80], [180, 90, 100], [290, 120, 80]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#43A047' : '#2E7D32'} stroke={INK} strokeWidth={6} />
        ))}
      </svg>
      <TopBadge s={pop(t, 4)} color="#FFE082">COMME UN VOLEUR…</TopBadge>
    </>
  );
};

const SansDefense: React.FC<P> = ({t, len}) => {
  const up = rp(t, 0, len * 0.6);
  return (
    <>
      <Burst t={t} a="#B3E5FC" b="#0277BD" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M-20 1300 Q 540 1260 1100 1300" stroke={INK} strokeWidth={70} fill="none" />
        <path d="M-20 1300 Q 540 1260 1100 1300" stroke="#795548" strokeWidth={54} fill="none" />
      </svg>
      <ChicksInNest t={t} x={740} y={1250} scale={1.5} scared />
      <Place x={interpolate(up, [0, 1], [-200, 260])} y={1140}>
        <Cricket frame={t} width={420} walking={up < 1} mood="hungry" mask />
      </Place>
      <TopBadge s={pop(t, 4)} color="#FFFFFF">LES POUSSINS SANS DÉFENSE</TopBadge>
    </>
  );
};

const Grammes: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFE0B2" b="#E64A19" />
    <Place x={540} y={1050} scale={pop(t, 0)}>
      <Cricket frame={t} width={560} mood="hungry" jaws />
    </Place>
    <div style={{position: 'absolute', left: 340, top: 1340, width: 400, height: 170, borderRadius: 24, background: '#ECEFF1', border: `10px solid ${INK}`, transform: `scale(${pop(t, 8)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 110, color: '#263238'}}>
      25 G
    </div>
    <BigText y={1600} s={pop(t, 30, 6)} size={90} color="#FFEB3B">2 POUSSINS D'UN COUP</BigText>
    <TopBadge s={pop(t, 4)} color="#FF8A80">UN PETIT MONSTRE</TopBadge>
  </>
);

// --- maman ---
const MemePoids: React.FC<P> = ({t}) => {
  const tilt = Math.sin(t * 0.15) * Math.max(0, 1 - t / 60);
  return (
    <>
      <Burst t={t} a="#E8F5E9" b="#2E7D32" />
      <Scale
        tilt={tilt}
        left={<Quelea frame={t} width={230} />}
        right={
          <div style={{transform: 'scaleX(-1)'}}>
            <Cricket frame={t} width={250} mood="angry" />
          </div>
        }
      />
      <BigText y={1650} s={pop(t, 50, 6)} size={110} color="#FFEB3B">= MÊME POIDS !</BigText>
      <TopBadge s={pop(t, 4)} color="#FFFFFF">COUP DE CHANCE…</TopBadge>
    </>
  );
};

const Carapace: React.FC<P> = ({t}) => {
  const k = (t % 20) / 20;
  const hit = Math.sin(k * Math.PI);
  return (
    <>
      <Burst t={t} a="#FFF59D" b="#F57F17" />
      <Place x={360} y={1200}>
        <Cricket frame={t} width={520} mood="angry" />
      </Place>
      <Place x={760 - hit * 120} y={1000 + hit * 50} flip>
        <Quelea frame={t} width={400} angry peck={hit} />
      </Place>
      {k > 0.4 && k < 0.7 ? (
        <>
          <Place x={560} y={1040}>
            <Star size={140} />
          </Place>
          <Label x={560} y={840} s={1} size={90} color="#FFFFFF">TOC !</Label>
        </>
      ) : null}
      <TopBadge s={pop(t, 4)} color="#FFFFFF">LA CARAPACE ENCAISSE</TopBadge>
    </>
  );
};

// --- arme ---
const Sang: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#F0F4C3" b="#9E9D24" />
    <Place x={330} y={1200}>
      <Cricket frame={t} width={560} mood="angry" squirt={rp(t, 8, 14)} />
    </Place>
    <Place x={840 + rp(t, 14, 30) * 80} y={1040} flip>
      <Quelea frame={t} width={360} disgust={t > 14} />
    </Place>
    <Place x={760} y={820}>
      <Stink frame={t} width={300} amount={rp(t, 14, 24)} />
    </Place>
    <Label x={760} y={1350} s={pop(t, 20)} size={90} color="#C0CA33">BEURK !</Label>
    <TopBadge s={pop(t, 4)} color="#DCE775" size={64}>IL PROJETTE SON SANG !</TopBadge>
  </>
);

const Mere: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FCE4EC" b="#C2185B" />
    <ChicksInNest t={t} x={300} y={1420} scale={1.1} />
    <Place x={680} y={1120} scale={0.9 + pop(t, 0) * 0.15} flip>
      <Quelea frame={t} width={560} angry />
    </Place>
    <TopBadge s={pop(t, 4)} color="#FFFFFF" size={60}>UNE MÈRE NE RECULE PAS !</TopBadge>
  </>
);

const Chute: React.FC<P> = ({t, len}) => {
  const fall = rp(t, 6, len - 20);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#81D4FA, #FFE0B2)'}} />
      <Ground y={1700} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M120 1700 V 640" stroke={INK} strokeWidth={10} />
        {Array.from({length: 11}, (_, i) => (
          <path key={i} d={`M120 ${1700 - i * 106} h ${i % 5 === 0 ? 60 : 34}`} stroke={INK} strokeWidth={8} />
        ))}
        <path d="M880 640 Q 1000 620 1100 640" stroke="#795548" strokeWidth={40} fill="none" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${560 - i * 40} ${interpolate(fall, [0, 1], [700, 1500]) - 120 - i * 40} v -80`} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={fall > 0 && fall < 1 ? 0.8 : 0} />
        ))}
      </svg>
      <Place x={interpolate(fall, [0, 1], [860, 600])} y={interpolate(fall, [0, 1], [580, 1620])} rotate={fall * 540}>
        <Cricket frame={t} width={320} mood="scared" />
      </Place>
      <Place x={950} y={560} flip>
        <Quelea frame={t} width={200} angry />
      </Place>
      <Label x={280} y={1020} s={pop(t, 12)} size={90} color="#FFEB3B">10 M</Label>
      <TopBadge s={pop(t, 4)} color="#FFFFFF">LA GRANDE CHUTE !</TopBadge>
    </>
  );
};

// --- amis ---
const Survit: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF8E1" b="#FFA000" />
    <Ground y={1460} />
    <Place x={540} y={1300}>
      <Cricket frame={t} width={500} mood="hurt" dizzy />
    </Place>
    <TopBadge s={pop(t, 4)} color="#A5D6A7">IL SURVIT !</TopBadge>
  </>
);

const Odeur: React.FC<P> = ({t}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#FFD180, #D4B36A)'}} />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {[0, 1, 2, 3, 4].map((i) => {
        const r = ((t * 6 + i * 120) % 600) + 40;
        return <circle key={i} cx={540} cy={1250} r={r} fill="none" stroke="#9CCC65" strokeWidth={16} opacity={1 - r / 640} strokeDasharray="30 24" />;
      })}
      {Array.from({length: 10}, (_, i) => (
        <path key={i} d={`M${(i * 113) % 1080} ${700 + ((i * 197) % 1100)} l 8 -40 l 8 40 l 8 -30`} stroke="#A68A3E" strokeWidth={6} fill="none" strokeLinecap="round" />
      ))}
    </svg>
    <Place x={540} y={1250}>
      <Cricket frame={t} width={280} mood="hurt" />
    </Place>
    {[
      [160, 820, false],
      [920, 860, true],
      [140, 1650, false],
      [940, 1640, true],
    ].map(([x, y, f], i) => (
      <Place key={i} x={x as number} y={(y as number) - pop(t, 10 + i * 6) * 30} flip={f as boolean} scale={pop(t, 10 + i * 6)}>
        <Cricket frame={t + i * 5} width={200} mood="hungry" />
      </Place>
    ))}
    <TopBadge s={pop(t, 4)} color="#DCE775">SON ODEUR ATTIRE…</TopBadge>
  </>
);

const PourLAider: React.FC<P> = ({t}) => {
  const non = t > 20;
  return (
    <>
      <Burst t={t} a={non ? '#FFCDD2' : '#C8E6C9'} b={non ? '#C62828' : '#388E3C'} />
      <Ground y={1500} />
      {[0, 1].map((i) => (
        <Place key={i} x={250 + i * 580} y={1330} flip={i === 1}>
          <Cricket frame={t + i * 8} width={360} mood={non ? 'hungry' : 'happy'} jaws={non} />
        </Place>
      ))}
      <Label x={540} y={900} s={non ? 0 : pop(t, 0)} size={80}>POUR L'AIDER ?</Label>
      <Label x={540} y={880} s={non ? pop(t, 20, 6) : 0} size={170} color="#FF1744">NON !</Label>
      <TopBadge s={pop(t, 4)} color="#FFFFFF">DES « AMIS » ?</TopBadge>
    </>
  );
};

const Menu: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF3E0" b="#6D4C41" />
    <div style={{position: 'absolute', left: 190, top: 760, width: 700, height: 900, borderRadius: 30, background: '#FFF8E1', border: `12px solid ${INK}`, transform: `scale(${pop(t, 0)}) rotate(-3deg)`, fontFamily: FONT, textAlign: 'center'}}>
      <div style={{fontSize: 120, color: '#C62828', marginTop: 50}}>MENU</div>
      <div style={{fontSize: 52, color: INK, marginTop: 20}}>PLAT DU JOUR :</div>
      <div style={{position: 'absolute', left: 140, top: 360}}>
        <Cricket frame={t} width={420} mood="hurt" />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, fontSize: 64, color: '#2E7D32'}}>« REPAS » !</div>
    </div>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">CETTE ODEUR = REPAS</TopBadge>
  </>
);

// --- conclusion ---
const Devore: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#D7CCC8" b="#5D4037" />
    <Ground y={1460} />
    <div style={{position: 'absolute', left: 190, top: 1000, width: 700, height: 500, borderRadius: '50%', background: 'radial-gradient(#EFEBE9 30%, rgba(239,235,233,0) 70%)', transform: `scale(${pop(t, 0)}) rotate(${t * 3}deg)`}} />
    {Array.from({length: 6}, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + t * 0.2;
      return (
        <Place key={i} x={540 + Math.cos(a) * 280} y={1250 + Math.sin(a) * 120} flip={Math.cos(a) > 0}>
          <Cricket frame={t + i * 4} width={180} mood="hungry" jaws />
        </Place>
      );
    })}
    {[0, 1, 2].map((i) => (
      <Place key={i} x={460 + i * 80} y={1180 - Math.abs(Math.sin(t * 0.4 + i)) * 60}>
        <Star size={70} />
      </Place>
    ))}
    <TopBadge s={pop(t, 4)} color="#FF8A80" size={64}>DÉVORÉ PAR LES SIENS</TopBadge>
  </>
);

const Proverbe: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF8E1" b="#FFB300" />
    <div style={{position: 'absolute', left: 120, top: 820, width: 840, padding: '70px 40px 50px', borderRadius: 30, background: '#FFF3E0', border: `12px solid ${INK}`, transform: `scaleY(${pop(t, 0, 9)})`, textAlign: 'center', fontFamily: FONT, fontSize: 100, lineHeight: 1.1, color: INK}}>
      BIEN MAL ACQUIS
      <div style={{color: '#E53935'}}>NE PROFITE</div>
      JAMAIS
    </div>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">COMME ON DIT :</TopBadge>
  </>
);

// --- question ---
const Pizza: React.FC<{size?: number}> = ({size = 200}) => (
  <svg viewBox="0 0 200 200" width={size} style={{overflow: 'visible'}}>
    <path d="M100 190 L 10 30 Q 100 -10 190 30 Z" fill="#FFCA28" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M10 30 Q 100 -10 190 30 L 180 48 Q 100 12 20 48 Z" fill="#E0A04A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[[80, 70], [125, 80], [100, 125], [70, 105]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={13} fill="#D84315" stroke={INK} strokeWidth={4} />
    ))}
  </svg>
);

const Reviennent: React.FC<P> = ({t}) => {
  const come = rp(t, 6, 30);
  return (
    <>
      <Burst t={t} a="#FFF9C4" b="#FFA000" />
      <Ground y={1500} color="#A5D6A7" />
      <Place x={540} y={1330}>
        <StickMan frame={t} pose="surprised" height={380} />
      </Place>
      <Place x={540} y={1000} scale={pop(t, 0)}>
        <Pizza size={220} />
      </Place>
      {[0, 1, 2].map((i) => (
        <Place key={i} x={interpolate(come, [0, 1], [[-200, 1300, 1400][i], [230, 830, 950][i]])} y={1350}>
          <StickMan frame={t + i * 5} pose="point" height={320} walking={come < 1} />
        </Place>
      ))}
      <TopBadge s={pop(t, 4)} color="#FFFFFF" size={60}>…ET REVIENNENT POUR PROFITER</TopBadge>
    </>
  );
};

const Commentaire: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E1F5FE" b="#0288D1" />
    <div style={{position: 'absolute', left: 120, top: 760, width: 840, borderRadius: 40, background: '#FFFFFF', border: `10px solid ${INK}`, padding: 40, transform: `scale(${pop(t, 0)})`, fontFamily: FONT}}>
      {['OUI, PLEIN DE FOIS !', 'LES VRAIS AMIS RESTENT', '…'].map((txt, i) => (
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
  titre: [{from: ['sauterelle'], C: Menace}],
  roles: [{from: ['mais'], C: Inverses}],
  cambrioleur: [
    {from: ['voici'], to: ['qui'], C: Portrait},
    {from: ['qui'], to: ['il'], C: Carte},
    {from: ['il'], to: ['cible'], C: Grimpeur},
    {from: ['cible'], to: ['travailleur'], C: Cible},
    {from: ['travailleur'], C: Travailleur},
  ],
  attend: [
    {from: ['comme'], to: ['patiente'], C: Voleur},
    {from: ['grimpe'], to: ['et'], C: SansDefense},
    {from: ['et'], C: Grammes},
  ],
  maman: [
    {from: ['coup'], to: ['elle', 1], C: MemePoids},
    {from: ['elle', 1], to: ['personne'], C: Carapace},
  ],
  arme: [
    {from: ['sort'], to: ['mais'], C: Sang},
    {from: ['mais'], to: ['malgre'], C: Mere},
    {from: ["jusqu'a"], C: Chute},
  ],
  amis: [
    {from: ['il'], to: ['mais'], C: Survit},
    {from: ['mais'], to: ['des'], C: Odeur},
    {from: ['pour'], to: ['chez'], C: PourLAider},
    {from: ['chez'], to: ['celui'], C: Menu},
  ],
  conclusion: [
    {from: ['et'], to: ['comme'], C: Devore},
    {from: ['comme'], C: Proverbe},
  ],
  question: [
    {from: ['reviennent'], to: ['dis-le'], C: Reviennent},
    {from: ['dis-le'], C: Commentaire},
  ],
};
