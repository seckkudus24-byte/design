import React from 'react';
import {interpolate} from 'remotion';
import {INK, Kangaroo, Leaf, Pebble, Quokka} from './characters/Quokka';
import {StickMan} from './characters/StickMan';
import {Cross} from './characters/Icons';
import {Clock, Hearts, Star} from './characters/Icons2';
import {FONT, Place} from './ui';
import {TopBadge} from './scenes/common';
import {BigText, Burst, P, Spec, pop, rp} from './shotkit';

// ---------------------------------------------------------------------------
// Inserts plein écran : un nouveau tableau toutes les 3 à 5 s.
// ---------------------------------------------------------------------------

const Ground: React.FC<{y: number; color?: string}> = ({y, color = '#C5A86A'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, bottom: 0, background: color, borderTop: `10px solid ${INK}`}} />
);

const Label: React.FC<{x: number; y: number; s: number; size?: number; color?: string; children: React.ReactNode}> = ({x, y, s, size = 60, color = '#FFFFFF', children}) => (
  <div style={{position: 'absolute', left: x - 320, width: 640, top: y, textAlign: 'center', fontFamily: FONT, fontSize: size, color, WebkitTextStroke: `${size / 7}px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${s})`}}>{children}</div>
);

const qOn = (y: number, w: number) => y - 0.56 * w;

// --- titre ---
const PlusHeureux: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF59D" b="#FF8F00" />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {Array.from({length: 24}, (_, i) => {
        const x = (i * 137) % 1080;
        const y = ((i * 211 + t * (4 + (i % 3))) % 1300) + 500;
        return <rect key={i} x={x} y={y} width={18} height={30} fill={['#E91E63', '#03A9F4', '#8BC34A', '#FFEB3B'][i % 4]} transform={`rotate(${i * 30 + t * 5} ${x} ${y})`} />;
      })}
      <path d="M380 1500 L 420 1340 L 660 1340 L 700 1500 Z" fill="#FFD54F" stroke={INK} strokeWidth={10} />
      <text x={540} y={1460} textAnchor="middle" fontFamily={FONT} fontSize={110} fill={INK}>1</text>
    </svg>
    <Place x={540} y={qOn(1350, 380)} scale={pop(t, 0)}>
      <Quokka frame={t} width={380} mood="huge" pose="cheer" crown />
    </Place>
    <TopBadge s={pop(t, 4)} color="#FFFFFF" size={56}>L'ANIMAL LE PLUS HEUREUX DU MONDE</TopBadge>
  </>
);

// --- lundi ---
const ToutelAnnee: React.FC<P> = ({t}) => {
  const months = ['JANV', 'MARS', 'MAI', 'JUIL', 'SEPT', 'NOV', 'DÉC'];
  const m = months[Math.min(months.length - 1, Math.floor(t / 10))];
  return (
    <>
      <Burst t={t} a="#B2EBF2" b="#00838F" />
      <div style={{position: 'absolute', left: 620, top: 720, width: 330, height: 300, borderRadius: 24, background: '#FFFFFF', border: `10px solid ${INK}`, fontFamily: FONT, textAlign: 'center', transform: `scale(${pop(t, 0)}) rotate(4deg)`, overflow: 'hidden'}}>
        <div style={{background: '#43A047', color: '#fff', fontSize: 64, padding: '16px 0 4px'}}>{m}</div>
        <svg viewBox="0 0 100 100" width={150} style={{marginTop: 10}}><circle cx={50} cy={50} r={44} fill="#FFD54F" stroke={INK} strokeWidth={6} /><circle cx={35} cy={40} r={6} fill={INK} /><circle cx={65} cy={40} r={6} fill={INK} /><path d="M28 60 Q50 84 72 60" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" /></svg>
      </div>
      <Place x={380} y={qOn(1600, 520)} scale={pop(t, 4)}>
        <Quokka frame={t} width={520} mood="huge" pose="wave" />
      </Place>
      <TopBadge s={pop(t, 4)} color="#FFE082">LUI : SOURIRE TOUTE L'ANNÉE</TopBadge>
    </>
  );
};

// --- roi ---
const Portrait: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF8E1" b="#8D6E63" />
    <Place x={540} y={1180} scale={0.9 + pop(t, 0) * 0.2}>
      <Quokka frame={t} width={640} mood="smile" />
    </Place>
    <Label x={540} y={1570} s={pop(t, 30)} size={64} color="#FFEB3B">PETIT MARSUPIAL</Label>
    <TopBadge s={pop(t, 4)} color="#FFFFFF" size={84}>LE QUOKKA</TopBadge>
  </>
);

const Cousin: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFE0B2" b="#E65100" />
    <Ground y={1480} />
    <Place x={330} y={qOn(1490, 300)} scale={pop(t, 0)}>
      <Quokka frame={t} width={300} mood="huge" pose="wave" look={1} />
    </Place>
    <Place x={770} y={1150} scale={pop(t, 8)}>
      <Kangaroo frame={t} width={420} />
    </Place>
    <Label x={540} y={760} s={pop(t, 14)} size={70} color="#FFFFFF">COUSINS !</Label>
    <TopBadge s={pop(t, 4)} color="#FFE082">COUSIN DU KANGOUROU</TopBadge>
  </>
);

const Toujours: React.FC<P> = ({t}) => {
  const panels = [
    {bg: 'linear-gradient(#90A4AE, #CFD8DC)', label: 'PLUIE', rain: true},
    {bg: 'linear-gradient(#1A237E, #3949AB)', label: 'NUIT', rain: false},
    {bg: 'linear-gradient(#4FC3F7, #FFF59D)', label: 'SOLEIL', rain: false},
  ];
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: '#263238'}} />
      {panels.map((p, i) => (
        <div key={i} style={{position: 'absolute', left: 30, right: 30, top: 640 + i * 420, height: 390, borderRadius: 30, background: p.bg, border: `10px solid ${INK}`, overflow: 'hidden', transform: `translateX(${(1 - pop(t, i * 6)) * (i % 2 ? 1200 : -1200)}px)`}}>
          {p.rain
            ? Array.from({length: 12}, (_, k) => <div key={k} style={{position: 'absolute', left: (k * 83) % 1000, top: ((k * 61 + t * 14) % 400) - 20, width: 6, height: 30, background: '#E3F2FD'}} />)
            : null}
          <div style={{position: 'absolute', left: 60, top: 140, fontFamily: FONT, fontSize: 80, color: '#fff', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>{p.label}</div>
          <div style={{position: 'absolute', right: 80, top: 30}}>
            <Quokka frame={t + i * 9} width={280} mood="huge" />
          </div>
        </div>
      ))}
      <TopBadge s={pop(t, 4)} color="#FFE082" dy={-20}>TOUJOURS LE SOURIRE</TopBadge>
    </>
  );
};

const Internet: React.FC<P> = ({t}) => {
  const likes = Math.floor(rp(t, 6, 90) * 999);
  return (
    <>
      <Burst t={t} a="#F8BBD0" b="#AD1457" />
      <div style={{position: 'absolute', left: 250, top: 700, width: 580, height: 980, borderRadius: 60, background: INK, transform: `scale(${pop(t, 0)}) rotate(-4deg)`}}>
        <div style={{position: 'absolute', left: 24, top: 70, right: 24, bottom: 70, borderRadius: 20, background: 'linear-gradient(#4FC3F7, #FFE0B2)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 70, top: 120}}>
            <Quokka frame={t} width={390} mood="huge" pose="wave" />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontFamily: FONT, fontSize: 58, color: '#E91E63', WebkitTextStroke: `8px #fff`, paintOrder: 'stroke fill'}}>{likes} K LIKES</div>
        </div>
      </div>
      <Hearts frame={t} amount={rp(t, 10, 20)} x={850} y={1000} />
      <Hearts frame={t + 20} amount={rp(t, 14, 24)} x={180} y={1100} />
      <TopBadge s={pop(t, 4)} color="#FFFFFF">LA STAR D'INTERNET</TopBadge>
    </>
  );
};

// --- manger ---
const PasDePanique: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#C8E6C9" b="#388E3C" />
    <Ground y={1500} />
    <Place x={760} y={1300}>
      <StickMan frame={t} pose={t < 30 ? 'surprised' : 'thumbs'} height={460} />
    </Place>
    <Place x={340} y={qOn(1530, 340)} scale={pop(t, 0)}>
      <Quokka frame={t} width={340} pose="beg" mood="smile" look={1} />
    </Place>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">PAS DE PANIQUE !</TopBadge>
  </>
);

const Grignoter: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF9C4" b="#F9A825" />
    <Place x={420} y={qOn(1640, 520)} scale={pop(t, 0)}>
      <Quokka frame={t} width={520} pose="beg" mood="curious" look={1} />
    </Place>
    <div style={{position: 'absolute', left: 520, top: 700, width: 470, height: 340, borderRadius: '50%', background: '#FFFFFF', border: `10px solid ${INK}`, transform: `scale(${pop(t, 10)})`}}>
      <div style={{position: 'absolute', left: 80, top: 110}}>
        <Leaf size={150} />
      </div>
      <div style={{position: 'absolute', left: 250, top: 90, fontFamily: FONT, fontSize: 110, color: '#E53935'}}>?</div>
    </div>
    {[0, 1].map((i) => (
      <div key={i} style={{position: 'absolute', left: 560 - i * 60, top: 1060 + i * 60, width: 50 - i * 16, height: 50 - i * 16, borderRadius: '50%', background: '#FFFFFF', border: `8px solid ${INK}`, transform: `scale(${pop(t, 6)})`}} />
    ))}
    <TopBadge s={pop(t, 4)} color="#FFE082">UN PETIT GRIGNOTAGE ?</TopBadge>
  </>
);

const Croque: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#DCEDC8" b="#558B2F" />
    <Place x={540} y={1200} scale={0.95 + pop(t, 0) * 0.1}>
      <Quokka frame={t} width={680} pose="eat" mood="munch" leaf />
    </Place>
    {Array.from({length: 6}, (_, i) => {
      const k = ((t + i * 7) % 40) / 40;
      return <div key={i} style={{position: 'absolute', left: 540 + (i - 2.5) * 70 + k * (i - 2.5) * 60, top: 1080 + k * 300, width: 22, height: 14, background: '#7CB342', border: `3px solid ${INK}`, borderRadius: 6, opacity: 1 - k, transform: `rotate(${i * 50 + t * 6}deg)`}} />;
    })}
    <Label x={540} y={760} s={pop(t, 8, 6)} size={100} color="#FFEB3B">CROUNCH !</Label>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">AVEC TELLEMENT DE PLAISIR</TopBadge>
  </>
);

const Chips: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFECB3" b="#FF6F00" />
    <svg width={1080} height={1920} style={{position: 'absolute', transform: `scale(${pop(t, 0)}) rotate(-6deg)`, transformOrigin: '540px 1150px'}}>
      <path d="M330 800 L 750 800 L 720 1500 L 360 1500 Z" fill="#E53935" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
      <path d="M330 800 l 30 -30 l 30 30 l 30 -30 l 30 30 l 30 -30 l 30 30 l 30 -30 l 30 30 l 30 -30 l 30 30 l 30 -30 l 30 30 l 30 -30 l 30 30" fill="#E53935" stroke={INK} strokeWidth={10} />
      <text x={540} y={1000} textAnchor="middle" fontFamily={FONT} fontSize={110} fill="#FFEB3B" stroke={INK} strokeWidth={6}>CHIPS</text>
      <text x={540} y={1100} textAnchor="middle" fontFamily={FONT} fontSize={56} fill="#FFFFFF">SAVEUR FEUILLE</text>
    </svg>
    <Place x={540} y={1300} scale={pop(t, 8)}>
      <Leaf size={260} />
    </Place>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">COMME DES CHIPS !</TopBadge>
  </>
);

const Pote: React.FC<P> = ({t, len}) => {
  const walk = rp(t, 4, len * 0.7);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#FFE0B2, #FFCC80)'}} />
      <Ground y={1500} color="#8D6E63" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect x={80} y={860} width={300} height={640} fill="#6D4C41" stroke={INK} strokeWidth={10} />
        <circle cx={340} cy={1200} r={16} fill="#FFD54F" stroke={INK} strokeWidth={5} />
      </svg>
      <Place x={interpolate(walk, [0, 1], [230, 560])} y={1300}>
        <StickMan frame={t} pose={walk >= 1 ? 'wave' : 'idle'} height={420} walking={walk > 0 && walk < 1} />
      </Place>
      <Place x={830} y={1290}>
        <StickMan frame={t} pose="surprised" height={420} />
      </Place>
      <Label x={560} y={820} s={pop(t, 20)} size={80}>SALUT !</Label>
      <TopBadge s={pop(t, 4)} color="#FFE082">CE POTE QUI DÉBARQUE…</TopBadge>
    </>
  );
};

const HeureRepas: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFCCBC" b="#D84315" />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <rect x={120} y={1360} width={840} height={40} rx={14} fill="#A1887F" stroke={INK} strokeWidth={10} />
      <rect x={180} y={1400} width={30} height={260} fill="#8D6E63" stroke={INK} strokeWidth={8} />
      <rect x={870} y={1400} width={30} height={260} fill="#8D6E63" stroke={INK} strokeWidth={8} />
      {[330, 750].map((x) => (
        <ellipse key={x} cx={x} cy={1350} rx={110} ry={26} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
      ))}
    </svg>
    <Place x={540} y={880} scale={pop(t, 0)}>
      <Clock size={300} turns={0} />
    </Place>
    {[330, 750].map((x, i) => (
      <Place key={x} x={x} y={1180}>
        <StickMan frame={t + i * 5} pose={i ? 'cheer' : 'idle'} height={330} />
      </Place>
    ))}
    <TopBadge s={pop(t, 4)} color="#FFFFFF">PILE À L'HEURE DU REPAS</TopBadge>
  </>
);

// --- sociable ---
const Calme: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E0F2F1" b="#26A69A" />
    <Place x={540} y={1260} scale={pop(t, 0)}>
      <Quokka frame={t} width={500} mood="sleepy" />
    </Place>
    {['CALME', 'DISCRET', 'PAS PEUR'].map((w, i) => (
      <div key={w} style={{position: 'absolute', left: [80, 640, 360][i], top: [820, 900, 1620][i], padding: '14px 28px 6px', borderRadius: 24, background: ['#FFFFFF', '#FFE082', '#A5D6A7'][i], border: `8px solid ${INK}`, fontFamily: FONT, fontSize: 56, color: INK, transform: `scale(${pop(t, 10 + i * 12)}) rotate(${(i - 1) * 5}deg)`}}>
        {w}
      </div>
    ))}
    <TopBadge s={pop(t, 4)} color="#FFFFFF">ZÉRO STRESS</TopBadge>
  </>
);

const Lechouille: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FCE4EC" b="#EC407A" />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <path d="M1100 1080 L 760 1110 Q 690 1120 690 1160 Q 690 1200 760 1200 L 1100 1220 Z" fill="#FFE0B2" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${700 + i * 10} ${1120 + i * 26} q -40 6 -40 20`} stroke={INK} strokeWidth={6} fill="none" />
      ))}
    </svg>
    <Place x={420} y={1300} scale={pop(t, 0)}>
      <Quokka frame={t} width={500} mood="lick" pose="beg" look={1} />
    </Place>
    <Hearts frame={t} amount={rp(t, 8, 16)} x={560} y={900} />
    <Label x={540} y={1600} s={pop(t, 12)} size={80} color="#FFFFFF">SLURP !</Label>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">COMME UN PETIT CHIEN</TopBadge>
  </>
);

const Sel: React.FC<P> = ({t, len}) => {
  const salt = t > len * 0.45;
  return (
    <>
      <Burst t={t} a={salt ? '#ECEFF1' : '#FCE4EC'} b={salt ? '#546E7A' : '#C2185B'} />
      {!salt ? (
        <>
          <Place x={540} y={1150} scale={pop(t, 0) * (1 + Math.sin(t * 0.3) * 0.05)}>
            <svg viewBox="0 0 260 240" width={420} style={{overflow: 'visible'}}>
              <path d="M130 220 C 30 150 0 100 20 60 C 40 15 105 15 130 65 C 155 15 220 15 240 60 C 260 100 230 150 130 220 Z" fill="#FF4081" stroke={INK} strokeWidth={12} />
            </svg>
          </Place>
          <Label x={540} y={1480} s={pop(t, 6)} size={80}>IL T'AIME BIEN…</Label>
        </>
      ) : (
        <>
          <svg width={1080} height={1920} style={{position: 'absolute', transform: `rotate(${150 + Math.sin(t * 0.8) * 10}deg)`, transformOrigin: '540px 1050px'}}>
            <path d="M440 900 L 640 900 L 620 1260 L 460 1260 Z" fill="#FFFFFF" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
            <path d="M440 900 Q 540 820 640 900 Z" fill="#B0BEC5" stroke={INK} strokeWidth={10} />
            <text x={540} y={1120} textAnchor="middle" fontFamily={FONT} fontSize={110} fill={INK}>S</text>
          </svg>
          {Array.from({length: 16}, (_, i) => (
            <div key={i} style={{position: 'absolute', left: 500 + ((i * 37) % 100), top: 760 - ((i * 53 + t * 10) % 300), width: 12, height: 12, background: '#FFFFFF', border: `2px solid ${INK}`}} />
          ))}
          <Label x={540} y={1450} s={pop(t, len * 0.45, 6)} size={80} color="#FFEB3B">TA PEAU EST SALÉE !</Label>
        </>
      )}
      <TopBadge s={pop(t, 4)} color="#FFFFFF">POURQUOI IL LÈCHE ?</TopBadge>
    </>
  );
};

// --- curieux ---
const Imite: React.FC<P> = ({t}) => {
  const toss = Math.abs(Math.sin(t * 0.12));
  return (
    <>
      <Burst t={t} a="#E1F5FE" b="#039BE5" />
      <Ground y={1500} />
      <Place x={300} y={1300}>
        <StickMan frame={t} pose="point" height={460} />
      </Place>
      <Place x={420} y={1080 - toss * 200}>
        <Pebble size={90} />
      </Place>
      <Place x={760} y={qOn(1530, 380)} scale={pop(t, 0)}>
        <Quokka frame={t} width={380} pose="reach" mood="curious" look={-1} />
      </Place>
      <TopBadge s={pop(t, 4)} color="#FFFFFF">IL VEUT L'IMITER !</TopBadge>
    </>
  );
};

const Enfant: React.FC<P> = ({t}) => {
  const pose = Math.floor(t / 20) % 2 ? 'cheer' : 'wave';
  return (
    <>
      <Burst t={t} a="#FFF9C4" b="#FBC02D" />
      <Ground y={1500} color="#A5D6A7" />
      <Place x={300} y={1260}>
        <StickMan frame={t} pose={pose} height={520} />
      </Place>
      <Place x={760} y={1360} scale={pop(t, 0)}>
        <StickMan frame={t + 4} pose={pose} height={300} />
      </Place>
      <TopBadge s={pop(t, 4)} color="#FFFFFF">COMME UN ENFANT</TopBadge>
    </>
  );
};

// --- attention ---
const Loi: React.FC<P> = ({t}) => {
  const hit = t > 10 && t < 18;
  return (
    <>
      <Burst t={t} a="#D7CCC8" b="#4E342E" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect x={240} y={1400} width={600} height={60} rx={14} fill="#795548" stroke={INK} strokeWidth={10} />
        <g transform={`rotate(${t < 10 ? -30 + t * 3 : hit ? 0 : -10} 700 1100)`}>
          <rect x={560} y={1020} width={240} height={110} rx={20} fill="#8D6E63" stroke={INK} strokeWidth={10} />
          <rect x={660} y={1120} width={40} height={300} rx={10} fill="#A1887F" stroke={INK} strokeWidth={10} transform="rotate(-50 680 1130)" />
        </g>
        <path d="M300 820 L 420 760 L 540 820 L 540 960 Q 540 1060 420 1110 Q 300 1060 300 960 Z" fill="#42A5F5" stroke={INK} strokeWidth={10} />
        <path d="M360 940 l 40 40 l 80 -90" stroke="#FFFFFF" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Place x={420} y={qOn(1400, 260)} scale={pop(t, 4)}>
        <Quokka frame={t} width={260} mood="smile" />
      </Place>
      <TopBadge s={pop(t, 4)} color="#FFFFFF">PROTÉGÉ PAR LA LOI</TopBadge>
    </>
  );
};

const Vulnerable: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFCCBC" b="#D84315" />
    <div style={{position: 'absolute', left: 140, top: 820, width: 800, height: 760, borderRadius: 30, background: '#FFFFFF', border: `12px solid ${INK}`, transform: `scale(${pop(t, 0)})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: FONT, fontSize: 70, color: '#D84315'}}>LISTE ROUGE</div>
      <div style={{position: 'absolute', left: 250, top: 160}}>
        <Quokka frame={t} width={300} mood="smile" />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', fontFamily: FONT, fontSize: 64, color: INK}}>VULNÉRABLE</div>
    </div>
    <TopBadge s={pop(t, 4)} color="#FFE082">ESPÈCE VULNÉRABLE</TopBadge>
  </>
);

const PasToucher: React.FC<P> = ({t}) => {
  const reach = rp(t, 0, 20);
  return (
    <>
      <Burst t={t} a="#FFEBEE" b="#C62828" />
      <Place x={380} y={qOn(1560, 420)}>
        <Quokka frame={t} width={420} mood="smile" look={1} />
      </Place>
      <svg width={1080} height={1920} style={{position: 'absolute', transform: `translateX(${(1 - reach) * 400}px)`}}>
        <path d="M1100 1080 L 760 1110 Q 690 1120 690 1160 Q 690 1200 760 1200 L 1100 1220 Z" fill="#FFE0B2" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
        <g transform="translate(700 1000)">
          <path d="M0 20 Q 50 -20 110 20 Q 50 60 0 20 Z" fill="#7CB342" stroke={INK} strokeWidth={6} />
        </g>
      </svg>
      <Place x={700} y={1140} scale={pop(t, 20)}>
        <Cross size={360} draw={rp(t, 20, 34)} />
      </Place>
      <TopBadge s={pop(t, 4)} color="#FFFFFF" size={60}>NI LE TOUCHER, NI LE NOURRIR</TopBadge>
    </>
  );
};

const Amende: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF3E0" b="#E65100" />
    <div style={{position: 'absolute', left: 220, top: 760, width: 640, height: 820, borderRadius: 20, background: '#FFFDE7', border: `12px solid ${INK}`, transform: `scale(${pop(t, 0)}) rotate(-5deg)`, fontFamily: FONT, textAlign: 'center'}}>
      <div style={{fontSize: 90, color: '#C62828', marginTop: 50}}>AMENDE</div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{height: 14, background: '#CFD8DC', margin: '40px 60px 0', borderRadius: 7}} />
      ))}
      <div style={{fontSize: 130, color: INK, marginTop: 60}}>$$$</div>
    </div>
    <Label x={540} y={1650} s={pop(t, 14, 6)} size={90} color="#FFEB3B">AÏE !</Label>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">UNE GROSSE AMENDE !</TopBadge>
  </>
);

const Photo: React.FC<P> = ({t}) => {
  const flash = t % 40 > 34 ? 1 : 0;
  return (
    <>
      <Burst t={t} a="#E8F5E9" b="#43A047" />
      <Ground y={1500} />
      <Place x={300} y={1300}>
        <StickMan frame={t} pose="point" height={460} />
      </Place>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform="translate(400 1080)">
          <rect x={0} y={0} width={170} height={110} rx={16} fill="#37474F" stroke={INK} strokeWidth={8} />
          <circle cx={85} cy={56} r={34} fill="#90CAF9" stroke={INK} strokeWidth={8} />
          <rect x={20} y={-20} width={50} height={24} rx={6} fill="#37474F" stroke={INK} strokeWidth={6} />
        </g>
      </svg>
      <Place x={800} y={qOn(1530, 380)} scale={pop(t, 0)}>
        <Quokka frame={t} width={380} mood="huge" pose="wave" look={-1} />
      </Place>
      <div style={{position: 'absolute', inset: 0, background: '#FFFFFF', opacity: flash * 0.7}} />
      <TopBadge s={pop(t, 4)} color="#FFFFFF" size={64}>AVEC LES YEUX, PAS LES MAINS !</TopBadge>
    </>
  );
};

// --- conclusion ---
const NiNiNi: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#ECEFF1" b="#607D8B" />
    {[0, 1, 2].map((i) => (
      <div key={i} style={{position: 'absolute', left: 90 + i * 320, top: 980, width: 260, height: 260, borderRadius: 40, background: '#FFFFFF', border: `10px solid ${INK}`, transform: `scale(${pop(t, i * 8)})`}}>
        <svg viewBox="0 0 200 200" width={240} style={{position: 'absolute', left: 0, top: 0}}>
          {i === 0 ? <text x={100} y={150} textAnchor="middle" fontFamily={FONT} fontSize={150} fill="#43A047">$</text> : null}
          {i === 1 ? <rect x={65} y={30} width={70} height={140} rx={14} fill="#37474F" stroke={INK} strokeWidth={6} /> : null}
          {i === 2 ? <path d="M20 110 L 180 70 L 190 90 L 120 110 L 90 170 L 70 170 L 80 120 L 40 130 L 30 150 L 15 150 Z" fill="#42A5F5" stroke={INK} strokeWidth={6} strokeLinejoin="round" /> : null}
        </svg>
        <div style={{position: 'absolute', left: 20, top: 20}}>
          <Cross size={200} draw={rp(t, 10 + i * 8, 20 + i * 8)} />
        </div>
      </div>
    ))}
    <Label x={540} y={1340} s={pop(t, 8)} size={56}>ARGENT · TÉLÉPHONE · VACANCES</Label>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">NI… NI… NI…</TopBadge>
  </>
);

const Secret: React.FC<P> = ({t}) => {
  const open = rp(t, 10, 26);
  return (
    <>
      <Burst t={t} a="#FFF8E1" b="#FFA000" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect x={290} y={1180} width={500} height={300} rx={20} fill="#8D6E63" stroke={INK} strokeWidth={12} />
        <rect x={290} y={1280} width={500} height={30} fill="#FFD54F" stroke={INK} strokeWidth={6} />
        <g transform={`rotate(${-open * 70} 290 1180)`}>
          <path d="M290 1180 Q 540 1040 790 1180 Z" fill="#A1887F" stroke={INK} strokeWidth={12} />
        </g>
        <circle cx={540} cy={1250} r={200} fill="#FFF59D" opacity={open * 0.5} />
      </svg>
      {[0, 1, 2].map((i) => (
        <Place key={i} x={380 + i * 160} y={1150 - open * (160 + (i % 2) * 80)} scale={open}>
          {i === 1 ? <Leaf size={140} /> : <Star size={100} />}
        </Place>
      ))}
      <TopBadge s={pop(t, 4)} color="#FFFFFF">LE SECRET DU BONHEUR ?</TopBadge>
    </>
  );
};

const SimpleFeuille: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#F1F8E9" b="#7CB342" />
    <Place x={540} y={1200} scale={0.95 + pop(t, 0) * 0.1}>
      <Quokka frame={t} width={620} pose="hug" mood="huge" leaf />
    </Place>
    <Hearts frame={t} amount={rp(t, 4, 12)} x={540} y={850} />
    <TopBadge s={pop(t, 4)} color="#A5D6A7">UNE SIMPLE FEUILLE</TopBadge>
  </>
);

// --- question ---
const Commentaire: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E1F5FE" b="#0288D1" />
    <div style={{position: 'absolute', left: 120, top: 760, width: 840, borderRadius: 40, background: '#FFFFFF', border: `10px solid ${INK}`, padding: 40, transform: `scale(${pop(t, 0)})`, fontFamily: FONT}}>
      {['MON CHAT !', 'UNE BONNE PIZZA', '…'].map((txt, i) => (
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
  titre: [{from: ['au'], C: PlusHeureux}],
  lundi: [{from: ['lui'], C: ToutelAnnee}],
  roi: [
    {from: ['voici'], to: ['cousin'], C: Portrait},
    {from: ['cousin'], to: ['il'], C: Cousin},
    {from: ['il'], to: ["c'est"], C: Toujours},
    {from: ["c'est"], C: Internet},
  ],
  manger: [
    {from: ['si'], to: ['il'], C: PasDePanique},
    {from: ['il'], to: ['donne-lui'], C: Grignoter},
    {from: ['donne-lui'], to: ["qu'on"], C: Croque},
    {from: ["qu'on"], to: ['un', 3], C: Chips},
    {from: ['un', 3], to: ['pile'], C: Pote},
    {from: ['pile'], C: HeureRepas},
  ],
  sociable: [
    {from: ['le'], to: ['il'], C: Calme},
    {from: ["jusqu'a"], to: ['en'], C: Lechouille},
    {from: ['en'], C: Sel},
  ],
  curieux: [
    {from: ['quand'], to: ['comme'], C: Imite},
    {from: ['comme'], C: Enfant},
  ],
  attention: [
    {from: ['ce'], to: ['le'], C: Loi},
    {from: ['le'], to: ['et'], C: Vulnerable},
    {from: ['et'], to: ['peut'], C: PasToucher},
    {from: ['peut'], to: ['pour'], C: Amende},
    {from: ['pour'], C: Photo},
  ],
  conclusion: [
    {from: ['il'], to: ['et'], C: NiNiNi},
    {from: ['peut-etre'], to: ['meme'], C: Secret},
    {from: ['meme'], C: SimpleFeuille},
  ],
  question: [{from: ['dis-le'], C: Commentaire}],
};
