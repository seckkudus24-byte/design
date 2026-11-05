import React from 'react';
import {interpolate} from 'remotion';
import {Creek, Egg, INK, Platypus} from './characters/Platypus';
import {StickMan} from './characters/StickMan';
import {Check, Cross} from './characters/Icons';
import {Star} from './characters/Icons2';
import {FONT, Place} from './ui';
import {TopBadge} from './scenes/common';
import {BigText, Burst, P, Spec, pop, rp} from './shotkit';
import {DuckBill} from './scenes/Scenes';

// ---------------------------------------------------------------------------
// Inserts plein écran : un nouveau tableau toutes les 3 à 5 s.
// ---------------------------------------------------------------------------

const Ground: React.FC<{y: number; color?: string}> = ({y, color = '#A1887F'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, bottom: 0, background: color, borderTop: `10px solid ${INK}`}} />
);

const Label: React.FC<{x: number; y: number; s: number; size?: number; color?: string; children: React.ReactNode}> = ({x, y, s, size = 60, color = '#FFFFFF', children}) => (
  <div style={{position: 'absolute', left: x - 320, width: 640, top: y, textAlign: 'center', fontFamily: FONT, fontSize: size, color, WebkitTextStroke: `${size / 7}px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${s})`}}>{children}</div>
);

const pOn = (y: number, w: number) => y - 0.208 * w;

// Savant : bonhomme bâton en blouse blanche.
const Savant: React.FC<{frame: number; x: number; y: number; pose?: 'idle' | 'point' | 'surprised' | 'cheer' | 'worried' | 'thumbs' | 'wave'; height?: number}> = ({frame, x, y, pose = 'idle', height = 440}) => (
  <>
    <div style={{position: 'absolute', left: x - height * 0.13, top: y - height * 0.15, width: height * 0.26, height: height * 0.36, borderRadius: '20px 20px 6px 6px', background: '#FFFFFF', border: `6px solid ${INK}`}} />
    <Place x={x} y={y}>
      <StickMan frame={frame} pose={pose} height={height} />
    </Place>
  </>
);

// --- titre ---
const Blague: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF9C4" b="#FBC02D" />
    <Ground y={1520} color="#E0E0E0" />
    {[0, 1, 2].map((i) => (
      <Savant key={i} frame={t + i * 4} x={220 + i * 320} y={1300 - Math.abs(Math.sin(t * 0.4 + i)) * 20} pose="cheer" height={420} />
    ))}
    {['HA', 'HA', 'HA'].map((h, i) => (
      <Label key={i} x={220 + i * 320} y={820 - (i % 2) * 60} s={pop(t, 4 + i * 4)} size={80} color="#FFFFFF">{h}</Label>
    ))}
    <TopBadge s={pop(t, 2)} color="#FF8A80">UNE BLAGUE ?!</TopBadge>
  </>
);

// --- assemblé ---
const Couture: React.FC<P> = ({t}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(#9575CD, #311B92)'}} />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <path d={`M300 640 l 40 120 l -30 0 l 50 140`} stroke="#FFEB3B" strokeWidth={14} fill="none" strokeLinejoin="round" opacity={t % 30 < 6 ? 1 : 0} />
      <rect x={120} y={1380} width={840} height={60} rx={14} fill="#78909C" stroke={INK} strokeWidth={10} />
    </svg>
    <Place x={540} y={1240} scale={0.9 + pop(t, 0) * 0.1}>
      <Platypus frame={t} width={860} stitches={1} mood="surprised" />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {[330, 700].map((x) => (
        <g key={x}>
          <path d={`M${x} 1110 l 0 170`} stroke="#E53935" strokeWidth={6} strokeDasharray="10 8" />
          {[1130, 1170, 1210, 1250].map((y) => (
            <path key={y} d={`M${x - 14} ${y} l 28 8`} stroke="#E53935" strokeWidth={5} strokeLinecap="round" />
          ))}
        </g>
      ))}
    </svg>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">ASSEMBLÉ AVEC DES RESTES ?</TopBadge>
  </>
);

// --- faux ---
const Portrait: React.FC<P> = ({t, len}) => (
  <>
    <Burst t={t} a="#FFF3E0" b="#8D6E63" />
    <Place x={540} y={1180} scale={0.9 + pop(t, 0) * 0.15}>
      <Platypus frame={t} width={900} />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: rp(t, len * 0.4, len * 0.5)}}>
      <g transform="translate(810 1500) scale(0.9)">
        <path d="M-150 -40 Q -120 -110 -30 -100 Q 0 -150 60 -110 Q 150 -110 170 -30 Q 190 60 110 110 Q 20 150 -40 110 Q -140 100 -160 30 Z" fill="#FFB74D" stroke={INK} strokeWidth={10} />
        <circle cx={120} cy={40} r={14} fill="#E53935" stroke={INK} strokeWidth={4} />
      </g>
    </svg>
    <Label x={500} y={1480} s={pop(t, len * 0.45)} size={70} color="#FFEB3B">AUSTRALIE</Label>
    <TopBadge s={pop(t, 2)} color="#FFFFFF" size={74}>L'ORNITHORYNQUE</TopBadge>
  </>
);

const Cousu: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E1F5FE" b="#0277BD" />
    <Ground y={1500} color="#BCAAA4" />
    <Savant frame={t} x={230} y={1290} pose="worried" height={460} />
    <Place x={680} y={pOn(1500, 700)}>
      <Platypus frame={t} width={700} stitches={rp(t, 6, 20)} mood="calm" />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <g transform={`translate(${790 + Math.sin(t * 0.4) * 20} ${1080 + Math.cos(t * 0.4) * 30}) rotate(-30)`}>
        <path d="M0 0 L 0 -120" stroke="#B0BEC5" strokeWidth={8} strokeLinecap="round" />
        <ellipse cx={0} cy={-110} rx={4} ry={10} fill="none" stroke={INK} strokeWidth={3} />
        <path d="M0 -110 Q 60 -160 120 -100" stroke="#E53935" strokeWidth={4} fill="none" />
      </g>
    </svg>
    <Label x={300} y={800} s={pop(t, 10)} size={70} color="#FFFFFF">UN BEC COUSU ?</Label>
    <TopBadge s={pop(t, 2)} color="#FFE082">ILS ONT CRU À UNE ARNAQUE</TopBadge>
  </>
);

const Ciseaux: React.FC<P> = ({t}) => {
  const snip = Math.abs(Math.sin(t * 0.5)) * 20;
  return (
    <>
      <Burst t={t} a="#FFEBEE" b="#C62828" />
      <Place x={480} y={1220} scale={1.1}>
        <Platypus frame={t} width={760} mood="surprised" />
      </Place>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform="translate(820 1040)">
          <g transform={`rotate(${-snip})`}>
            <path d="M0 0 L -200 30" stroke="#B0BEC5" strokeWidth={18} strokeLinecap="round" />
            <circle cx={40} cy={-10} r={34} fill="none" stroke="#E53935" strokeWidth={14} />
          </g>
          <g transform={`rotate(${snip})`}>
            <path d="M0 0 L -200 -30" stroke="#90A4AE" strokeWidth={18} strokeLinecap="round" />
            <circle cx={40} cy={10} r={34} fill="none" stroke="#E53935" strokeWidth={14} />
          </g>
          <circle cx={0} cy={0} r={10} fill={INK} />
        </g>
      </svg>
      <Label x={540} y={1480} s={pop(t, 12)} size={70}>CLIC… CLIC…</Label>
      <TopBadge s={pop(t, 2)} color="#FFFFFF" size={60}>À LA RECHERCHE DES COUTURES</TopBadge>
    </>
  );
};

const Reel: React.FC<P> = ({t, len}) => {
  const ok = t > len * 0.5;
  return (
    <>
      <Burst t={t} a={ok ? '#C8E6C9' : '#ECEFF1'} b={ok ? '#2E7D32' : '#546E7A'} />
      <Place x={540} y={1220}>
        <Platypus frame={t} width={760} mood="happy" />
      </Place>
      <svg width={1080} height={1920} style={{position: 'absolute', transform: `translateX(${Math.sin(t * 0.08) * 120}px)`}}>
        <circle cx={700} cy={1150} r={130} fill="rgba(255,255,255,0.25)" stroke={INK} strokeWidth={16} />
        <path d="M792 1242 l 100 100" stroke={INK} strokeWidth={36} strokeLinecap="round" />
        <path d="M792 1242 l 100 100" stroke="#8D6E63" strokeWidth={22} strokeLinecap="round" />
      </svg>
      <Label x={540} y={800} s={ok ? 0 : pop(t, 4)} size={70}>AUCUNE COUTURE</Label>
      <Label x={540} y={790} s={ok ? pop(t, len * 0.5, 6) : 0} size={110} color="#A5D6A7">BIEN RÉEL !</Label>
      <TopBadge s={pop(t, 2)} color="#FFFFFF">ET POURTANT…</TopBadge>
    </>
  );
};

// --- mammifère ---
const Bottle: React.FC<{size?: number}> = ({size = 200}) => (
  <svg viewBox="0 0 100 200" width={size * 0.5} style={{overflow: 'visible'}}>
    <rect x={30} y={10} width={40} height={30} rx={8} fill="#FFB74D" stroke={INK} strokeWidth={5} />
    <rect x={14} y={40} width={72} height={150} rx={20} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    <rect x={20} y={90} width={60} height={94} rx={14} fill="#FFF8E1" />
  </svg>
);

const Mammal: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF8E1" b="#FF8F00" />
    <Place x={480} y={1200} scale={pop(t, 0)}>
      <Platypus frame={t} width={760} />
    </Place>
    <Place x={870} y={1450} scale={pop(t, 30)}>
      <Bottle size={260} />
    </Place>
    {['DES POILS', 'DU LAIT'].map((w, i) => (
      <div key={w} style={{position: 'absolute', left: [90, 560][i], top: [860, 900][i], padding: '14px 26px 6px', borderRadius: 24, background: ['#FFFFFF', '#FFF9C4'][i], border: `8px solid ${INK}`, fontFamily: FONT, fontSize: 56, color: INK, transform: `scale(${pop(t, 10 + i * 28)}) rotate(${i ? 4 : -4}deg)`}}>
        {w}
      </div>
    ))}
    <TopBadge s={pop(t, 2)} color="#FFE082">C'EST UN MAMMIFÈRE</TopBadge>
  </>
);

const Oeufs: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E8F5E9" b="#43A047" />
    <Ground y={1460} color="#8D6E63" />
    <Place x={420} y={pOn(1460, 640)}>
      <Platypus frame={t} width={640} mood="surprised" />
    </Place>
    {[0, 1].map((i) => (
      <Place key={i} x={140 + i * 80} y={1420} scale={pop(t, 8 + i * 8)}>
        <Egg size={110} />
      </Place>
    ))}
    <Label x={760} y={820} s={pop(t, 16, 6)} size={130} color="#FFEB3B">?!</Label>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">MAIS IL POND DES ŒUFS !</TopBadge>
  </>
);

const PasDeTetines: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FCE4EC" b="#C2185B" />
    <Place x={540} y={1150} scale={pop(t, 0)}>
      <Bottle size={520} />
    </Place>
    <Place x={540} y={1150} scale={pop(t, 10)}>
      <Cross size={440} draw={rp(t, 10, 24)} />
    </Place>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">PAS DE TÉTINES !</TopBadge>
  </>
);

const Leche: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF8E1" b="#FFB300" />
    <Ground y={1460} color="#8D6E63" />
    <Place x={540} y={pOn(1460, 720)}>
      <Platypus frame={t} width={720} mood="happy" eyesClosed />
    </Place>
    {Array.from({length: 6}, (_, i) => {
      const k = ((t + i * 9) % 40) / 40;
      return <div key={i} style={{position: 'absolute', left: 380 + i * 50, top: 1300 + k * 80, width: 22, height: 30, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#FFFDE7', border: `4px solid ${INK}`, opacity: 1 - k}} />;
    })}
    {[0, 1].map((i) => (
      <Place key={i} x={300 + i * 420} y={pOn(1470, 220)} scale={pop(t, 6 + i * 6)} flip={i === 1}>
        <Platypus frame={t + i * 7} width={220} mood="happy" />
      </Place>
    ))}
    <TopBadge s={pop(t, 2)} color="#FFFFFF" size={60}>LE LAIT SORT DE SA PEAU</TopBadge>
  </>
);

// --- encore plus bizarre ---
const Estomac: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFEBEE" b="#D32F2F" />
    <svg width={1080} height={1920} style={{position: 'absolute', transform: `scale(${pop(t, 0)})`, transformOrigin: '540px 1150px'}}>
      <path d="M440 900 Q 400 1000 460 1080 Q 520 1160 640 1120 Q 760 1080 720 1240 Q 680 1380 520 1360 Q 380 1340 400 1220" fill="#F48FB1" stroke={INK} strokeWidth={14} strokeLinejoin="round" />
    </svg>
    <Place x={560} y={1140} scale={pop(t, 6)}>
      <Cross size={480} draw={rp(t, 6, 16)} />
    </Place>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">PAS D'ESTOMAC !</TopBadge>
  </>
);

const Ergot: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#F3E5F5" b="#6A1B9A" />
    <Place x={600} y={1150} scale={1.25}>
      <Platypus frame={t} width={760} spur={rp(t, 4, 12)} />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: rp(t, 8, 16)}}>
      <path d="M180 1450 L 330 1330" stroke={INK} strokeWidth={24} strokeLinecap="round" />
      <path d="M180 1450 L 330 1330" stroke="#FFEB3B" strokeWidth={12} strokeLinecap="round" />
    </svg>
    <Label x={300} y={1470} s={pop(t, 12)} size={64} color="#CE93D8">VENIMEUX !</Label>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">UN ERGOT CHEZ LE MÂLE</TopBadge>
  </>
);

const KO: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF3E0" b="#E65100" />
    <Ground y={1460} color="#BCAAA4" />
    <Place x={420} y={1380} rotate={90}>
      <StickMan frame={0} pose="worried" height={420} />
    </Place>
    {[0, 1, 2].map((i) => {
      const a = t * 0.15 + (i * Math.PI * 2) / 3;
      return (
        <Place key={i} x={260 + Math.cos(a) * 80} y={1300 + Math.sin(a) * 26} scale={0.5}>
          <Star size={100} />
        </Place>
      );
    })}
    <div style={{position: 'absolute', left: 640, top: 820, width: 340, height: 300, borderRadius: 24, background: '#FFFFFF', border: `10px solid ${INK}`, fontFamily: FONT, textAlign: 'center', overflow: 'hidden', transform: `scale(${pop(t, 6)})`}}>
      <div style={{background: '#E53935', color: '#fff', fontSize: 56, padding: '12px 0 2px'}}>KO</div>
      <div style={{fontSize: 90, color: INK, marginTop: 20}}>J+{1 + Math.min(4, Math.floor(t / 15))}</div>
    </div>
    <TopBadge s={pop(t, 2)} color="#FF8A80" size={62}>KO PLUSIEURS JOURS !</TopBadge>
  </>
);

const FermeTout: React.FC<P> = ({t}) => (
  <>
    <Creek frame={t} underwater />
    <Place x={540} y={1150}>
      <Platypus frame={t} width={760} swim eyesClosed />
    </Place>
    {['YEUX', 'OREILLES', 'NEZ'].map((w, i) => (
      <div key={w} style={{position: 'absolute', left: 90 + i * 320, top: 1450, padding: '14px 22px 6px', borderRadius: 24, background: '#FFFFFF', border: `8px solid ${INK}`, fontFamily: FONT, fontSize: 46, color: INK, transform: `scale(${pop(t, 8 + i * 12)})`}}>
        {w} <svg viewBox="0 0 20 20" width={30} style={{verticalAlign: 'middle'}}><path d="M3 3 L17 17 M17 3 L3 17" stroke="#E53935" strokeWidth={5} strokeLinecap="round" /></svg>
      </div>
    ))}
    <TopBadge s={pop(t, 2)} color="#FFFFFF">SOUS L'EAU, IL FERME TOUT</TopBadge>
  </>
);

const Shrimp: React.FC<{size?: number}> = ({size = 120}) => (
  <svg viewBox="0 0 120 80" width={size} style={{overflow: 'visible'}}>
    <path d="M10 50 Q 30 10 80 20 Q 110 30 104 56 Q 70 40 40 66 Z" fill="#FF8A65" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M100 26 q 20 -20 14 -26" stroke={INK} strokeWidth={3} fill="none" />
    <circle cx={92} cy={32} r={4} fill={INK} />
  </svg>
);

const Electricite: React.FC<P> = ({t}) => (
  <>
    <Creek frame={t} underwater />
    <Place x={360} y={1150}>
      <Platypus frame={t} width={640} swim eyesClosed />
    </Place>
    <Place x={880 + Math.sin(t * 0.1) * 30} y={1250}>
      <Shrimp size={150} />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {[0, 1, 2].map((i) => {
        const k = ((t + i * 10) % 30) / 30;
        return <path key={i} d={`M${860 - k * 200} ${1180 + i * 40} l -20 -20 l -20 20 l -20 -20 l -20 20`} stroke="#FFEB3B" strokeWidth={8} fill="none" strokeLinejoin="round" opacity={1 - k} />;
      })}
    </svg>
    <Label x={760} y={880} s={pop(t, 10, 6)} size={90} color="#FFEB3B">BZZZ !</Label>
    <TopBadge s={pop(t, 2)} color="#FFFFFF" size={62}>SON BEC SENT L'ÉLECTRICITÉ</TopBadge>
  </>
);

// --- conclusion ---
const Annees: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E8EAF6" b="#3949AB" />
    <Ground y={1500} color="#E0E0E0" />
    <Savant frame={t} x={300} y={1290} pose="worried" height={460} />
    <div style={{position: 'absolute', left: 560, top: 820, width: 400, height: 380, borderRadius: 24, background: '#FFFFFF', border: `10px solid ${INK}`, fontFamily: FONT, textAlign: 'center', overflow: 'hidden', transform: `scale(${pop(t, 4)})`}}>
      <div style={{background: '#3949AB', color: '#fff', fontSize: 56, padding: '14px 0 4px'}}>ANNÉE</div>
      <div style={{fontSize: 130, color: INK, marginTop: 30}}>{1799 + Math.floor(rp(t, 0, 60) * 85)}</div>
    </div>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">DES ANNÉES À COMPRENDRE</TopBadge>
  </>
);

const Precieux: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF8E1" b="#FFA000" />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <rect x={340} y={1440} width={400} height={90} rx={16} fill="#B71C1C" stroke={INK} strokeWidth={10} />
      <rect x={300} y={1520} width={480} height={60} rx={16} fill="#8D6E63" stroke={INK} strokeWidth={10} />
    </svg>
    <Place x={540} y={pOn(1450, 620)} scale={pop(t, 0)}>
      <Platypus frame={t} width={620} />
    </Place>
    {[0, 1, 2, 3].map((i) => (
      <Place key={i} x={200 + i * 230} y={880 - Math.abs(Math.sin(t * 0.12 + i)) * 40} scale={pop(t, 8 + i * 4) * 0.5}>
        <Star size={130} />
      </Place>
    ))}
    <TopBadge s={pop(t, 2)} color="#FFE082" size={62}>PRÉCIEUX POUR L'ÉVOLUTION</TopBadge>
  </>
);

const Different: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#ECEFF1" b="#607D8B" />
    <Ground y={1500} color="#B0BEC5" />
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{position: 'absolute', left: 60 + i * 250, top: 1050}}>
        <StickMan frame={t + i * 3} pose={i === 2 ? 'wave' : 'idle'} height={420} />
        {i === 2 ? <DuckBill x={110} y={36} s={1} /> : null}
      </div>
    ))}
    <Label x={600} y={820} s={pop(t, 8)} size={70} color="#FFFFFF">BIZARRE…</Label>
    <TopBadge s={pop(t, 2)} color="#FFFFFF" size={50}>CEUX QUI NE RESSEMBLENT À PERSONNE</TopBadge>
  </>
);

const Unique: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF9C4" b="#F9A825" />
    <Ground y={1500} color="#FFE082" />
    <div style={{position: 'absolute', left: 330, top: 1000, transform: `scale(${1 + pop(t, 0) * 0.2})`}}>
      <StickMan frame={t} pose="cheer" height={460} />
      <DuckBill x={110} y={40} s={1.1} />
    </div>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <path d="M420 960 L 450 900 L 490 950 L 530 890 L 570 950 L 610 900 L 640 960 Z" fill="#FFD600" stroke={INK} strokeWidth={8} strokeLinejoin="round" opacity={pop(t, 8)} />
    </svg>
    <TopBadge s={pop(t, 2)} color="#A5D6A7" size={50}>…AVANT DE VOIR QU'ILS SONT UNIQUES</TopBadge>
  </>
);

// --- question ---
const Commentaire: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E1F5FE" b="#0288D1" />
    <div style={{position: 'absolute', left: 120, top: 760, width: 840, borderRadius: 40, background: '#FFFFFF', border: `10px solid ${INK}`, padding: 40, transform: `scale(${pop(t, 0)})`, fontFamily: FONT}}>
      {["C'EST MOI !", 'MON PETIT FRÈRE', '…'].map((txt, i) => (
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
  titre: [{from: ['les'], C: Blague}],
  assemble: [{from: ['on'], C: Couture}],
  faux: [
    {from: ['voici'], to: ['ils'], C: Portrait},
    {from: ['ils'], to: ["l'un"], C: Cousu},
    {from: ["l'un"], to: ['il', 1], C: Ciseaux},
    {from: ['il', 1], C: Reel},
  ],
  mammifere: [
    {from: ["l'ornithorynque"], to: ['mais', 1], C: Mammal},
    {from: ['mais', 1], to: ['et', 1], C: Oeufs},
    {from: ['et', 1], to: ['comme', 2], C: PasDeTetines},
    {from: ['comme', 2], C: Leche},
  ],
  bizarre: [
    {from: ['il'], to: ['le'], C: Estomac},
    {from: ['le'], to: ['assez'], C: Ergot},
    {from: ['assez'], to: ['et'], C: KO},
    {from: ['et'], to: ['il', 2], C: FermeTout},
    {from: ['il', 2], C: Electricite},
  ],
  conclusion: [
    {from: ['les'], to: ['mais'], C: Annees},
    {from: ['mais'], to: ['comme'], C: Precieux},
    {from: ['comme'], to: ['avant'], C: Different},
    {from: ['avant'], C: Unique},
  ],
  question: [{from: ['dis-le'], C: Commentaire}],
};
