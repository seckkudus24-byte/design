import React from 'react';
import {interpolate} from 'remotion';
import {BloodDrop, Booby, Finch, INK, Parasite, Seeds} from './characters/Galapagos';
import {StickMan} from './characters/StickMan';
import {Check, Cross} from './characters/Icons';
import {Hearts, Star} from './characters/Icons2';
import {FONT, Place} from './ui';
import {TopBadge} from './scenes/common';
import {BigText, Burst, P, Spec, pop, rp} from './shotkit';

// ---------------------------------------------------------------------------
// Inserts plein écran : un nouveau tableau toutes les 3 à 5 s.
// ---------------------------------------------------------------------------

const Ground: React.FC<{y: number; color?: string}> = ({y, color = '#5D5551'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, bottom: 0, background: color, borderTop: `10px solid ${INK}`}} />
);

const Label: React.FC<{x: number; y: number; s: number; size?: number; color?: string; children: React.ReactNode}> = ({x, y, s, size = 60, color = '#FFFFFF', children}) => (
  <div style={{position: 'absolute', left: x - 320, width: 640, top: y, textAlign: 'center', fontFamily: FONT, fontSize: size, color, WebkitTextStroke: `${size / 7}px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${s})`}}>{children}</div>
);

const bOn = (y: number, w: number) => y - 0.382 * w;
const fOn = (y: number, w: number) => y - 0.373 * w;

// --- titre ---
const Taille: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E3F2FD" b="#1976D2" />
    <Ground y={1500} />
    <Place x={640} y={bOn(1510, 760)} scale={pop(t, 0)}>
      <Booby frame={t} width={760} />
    </Place>
    <Place x={170} y={fOn(1510, 150)} scale={pop(t, 6)}>
      <Finch frame={t} width={150} />
    </Place>
    <Label x={300} y={820} s={pop(t, 12, 6)} size={150} color="#FFEB3B">× 10</Label>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">10 FOIS PLUS GRAND !</TopBadge>
  </>
);

const PasDeReaction: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF8E1" b="#FFA000" />
    <Place x={540} y={1180} scale={0.95 + pop(t, 0) * 0.1}>
      <Booby frame={t} width={900} mood="relaxed" />
    </Place>
    <Label x={540} y={720} s={pop(t, 8)} size={90}>…</Label>
    <TopBadge s={pop(t, 2)} color="#FF8A80">ET IL NE RÉAGIT PAS ?!</TopBadge>
  </>
);

// --- horreur ---
const IlePerdue: React.FC<P> = ({t}) => {
  const zoom = 0.6 + rp(t, 0, 120) * 0.5;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: '#0277BD'}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {Array.from({length: 16}, (_, i) => (
          <path key={i} d={`M${((i * 160 + t * 1.5) % 1300) - 100} ${600 + (i % 8) * 170} q 25 -12 50 0 t 50 0`} stroke="#FFFFFF" strokeWidth={6} fill="none" opacity={0.5} />
        ))}
        <g transform={`translate(540 1200) scale(${zoom})`}>
          <path d="M-160 20 Q -140 -60 -40 -70 Q 40 -130 120 -60 Q 190 -20 170 30 Q 60 70 -40 60 Q -150 60 -160 20 Z" fill="#6D6A66" stroke={INK} strokeWidth={10} />
          <path d="M-30 -70 L 20 -140 L 60 -80" fill="#5D5551" stroke={INK} strokeWidth={8} />
        </g>
      </svg>
      <Label x={540} y={1450} s={pop(t, 10)} size={70}>AU MILIEU DE L'OCÉAN</Label>
      <TopBadge s={pop(t, 2)} color="#FFFFFF">UNE PETITE ÎLE PERDUE</TopBadge>
    </>
  );
};

// --- vampire ---
const PortraitPinson: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#ECEFF1" b="#455A64" />
    <Place x={520} y={1180} scale={0.9 + pop(t, 0) * 0.2}>
      <Finch frame={t} width={760} mood="happy" />
    </Place>
    <Label x={540} y={1550} s={pop(t, 30)} size={70} color="#FFEB3B">UN PETIT PINSON</Label>
    <TopBadge s={pop(t, 2)} color="#FFFFFF" size={74}>LE GÉOSPIZE VAMPIRE</TopBadge>
  </>
);

const PortraitFou: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E1F5FE" b="#0288D1" />
    <Place x={560} y={1180} scale={0.9 + pop(t, 0) * 0.15}>
      <Booby frame={t} width={860} />
    </Place>
    <Place x={150} y={1340} scale={pop(t, 20)}>
      <Finch frame={t} width={160} mood="sneaky" />
    </Place>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">LE FOU DE NAZCA</TopBadge>
  </>
);

const Queue: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFEBEE" b="#B71C1C" />
    {/* gros plan sur la queue (plumes) */}
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <path d="M1100 820 Q 700 860 640 1100 Q 600 1300 1100 1380 Z" fill="#FFFFFF" stroke={INK} strokeWidth={12} />
      <path d="M660 1150 L 300 1060 L 330 1180 L 280 1260 L 650 1220 Z" fill="#263238" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      <circle cx={660} cy={1180} r={22} fill="#EF9A9A" stroke={INK} strokeWidth={6} opacity={rp(t, 20, 30)} />
    </svg>
    <Place x={480} y={1360} scale={pop(t, 4)}>
      <Finch frame={t} width={380} peck fangs mood="hungry" />
    </Place>
    {[0, 1].map((i) => {
      const k = ((t + i * 18) % 36) / 36;
      return (
        <Place key={i} x={650 + i * 20} y={1210 + k * 160} scale={t > 24 ? 0.7 * (1 - k) : 0}>
          <BloodDrop size={60} />
        </Place>
      );
    })}
    <TopBadge s={pop(t, 2)} color="#FFFFFF" size={60}>À LA BASE DE LA QUEUE</TopBadge>
  </>
);

// --- pourquoi ---
const Avant: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#F1F8E9" b="#689F38" />
    <Ground y={1460} color="#8D6E63" />
    <Place x={400} y={fOn(1470, 440)} scale={pop(t, 0)}>
      <Finch frame={t} width={440} peck mood="happy" />
    </Place>
    <Place x={760} y={1440} scale={pop(t, 6)}>
      <Seeds size={260} />
    </Place>
    <Place x={820} y={1100} scale={pop(t, 12)}>
      <Parasite size={120} frame={t} />
    </Place>
    <TopBadge s={pop(t, 2)} color="#A5D6A7" size={60}>AVANT : GRAINES ET INSECTES</TopBadge>
  </>
);

const Four: React.FC<P> = ({t}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(#FFCC80, #E65100)'}} />
    <svg width={1080} height={1920} style={{position: 'absolute', transform: `scale(${pop(t, 0)})`, transformOrigin: '540px 1150px'}}>
      <rect x={160} y={760} width={760} height={760} rx={40} fill="#ECEFF1" stroke={INK} strokeWidth={14} />
      <rect x={220} y={880} width={640} height={560} rx={24} fill="#3E2723" stroke={INK} strokeWidth={10} />
      <rect x={220} y={880} width={640} height={560} rx={24} fill="#FF7043" opacity={0.4 + Math.sin(t * 0.3) * 0.15} />
      {[260, 420, 580, 740].map((x) => (
        <circle key={x} cx={x + 30} cy={815} r={22} fill="#90A4AE" stroke={INK} strokeWidth={6} />
      ))}
      <path d="M300 1330 Q 400 1260 540 1300 Q 680 1250 780 1330 L 780 1400 L 300 1400 Z" fill="#6D6A66" stroke={INK} strokeWidth={8} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${400 + i * 120} ${1230 - ((t * 3 + i * 30) % 120)} q 15 -20 0 -40 q -15 -20 0 -40`} stroke="#FFE0B2" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />
      ))}
    </svg>
    <TopBadge s={pop(t, 2)} color="#FFE082">UN VÉRITABLE FOUR !</TopBadge>
  </>
);

const PasDePluie: React.FC<P> = ({t}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#FFB74D, #FFE0B2)'}} />
    <Ground y={1460} color="#A1887F" />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <g transform={`translate(540 1000) scale(${pop(t, 0)})`}>
        <ellipse cx={0} cy={0} rx={220} ry={80} fill="#B0BEC5" stroke={INK} strokeWidth={10} />
        <ellipse cx={-80} cy={-50} rx={110} ry={80} fill="#B0BEC5" stroke={INK} strokeWidth={10} />
        <ellipse cx={80} cy={-60} rx={130} ry={90} fill="#B0BEC5" stroke={INK} strokeWidth={10} />
        <ellipse cx={0} cy={10} rx={210} ry={66} fill="#B0BEC5" />
      </g>
      {Array.from({length: 7}, (_, i) => (
        <path key={i} d={`M${1460 > 0 ? 100 + i * 140 : 0} 1470 l 30 30 l -20 40 l 30 30`} stroke="#5D4037" strokeWidth={6} fill="none" />
      ))}
    </svg>
    <Place x={540} y={1000} scale={pop(t, 10)}>
      <Cross size={440} draw={rp(t, 10, 22)} />
    </Place>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">PRESQUE PAS DE PLUIE</TopBadge>
  </>
);

const Grillent: React.FC<P> = ({t, len}) => {
  const dry = rp(t, 0, len * 0.7);
  return (
    <>
      <Burst t={t} a="#FFE0B2" b="#BF360C" />
      <Ground y={1460} color="#8D6E63" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[260, 540, 820].map((x, i) => (
          <g key={x} transform={`rotate(${dry * (i % 2 ? 25 : -25)} ${x} 1460)`}>
            <path d={`M${x} 1460 V 1160`} stroke={dry > 0.5 ? '#8D6E63' : '#558B2F'} strokeWidth={14} strokeLinecap="round" />
            {[0, 1, 2].map((k) => (
              <ellipse key={k} cx={x + (k % 2 ? 40 : -40)} cy={1200 + k * 70} rx={44} ry={20} fill={interpolateColor(dry)} stroke={INK} strokeWidth={5} />
            ))}
          </g>
        ))}
      </svg>
      <Place x={540} y={1560} scale={1 - dry}>
        <Seeds size={280} />
      </Place>
      <TopBadge s={pop(t, 2)} color="#FFE082" size={62}>LES GRAINES DISPARAISSENT</TopBadge>
    </>
  );
};
const interpolateColor = (k: number) => (k < 0.33 ? '#7CB342' : k < 0.66 ? '#C0A050' : '#8D6E63');

const TropPetit: React.FC<P> = ({t}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#81D4FA 0%, #0277BD 45%)'}} />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {Array.from({length: 14}, (_, i) => (
        <path key={i} d={`M${((i * 170 + t * 1.5) % 1300) - 100} ${900 + (i % 7) * 110} q 25 -12 50 0 t 50 0`} stroke="#FFFFFF" strokeWidth={6} fill="none" opacity={0.5} />
      ))}
      <path d="M-20 1560 Q 300 1500 540 1560 L 540 1940 L -20 1940 Z" fill="#5D5551" stroke={INK} strokeWidth={10} />
    </svg>
    <Place x={300} y={fOn(1540, 200)}>
      <Finch frame={t} width={200} mood="sad" />
    </Place>
    <Label x={760} y={1020} s={pop(t, 10)} size={64}>TROP LOIN…</Label>
    <TopBadge s={pop(t, 2)} color="#FFFFFF" size={62}>TROP PETIT POUR PARTIR</TopBadge>
  </>
);

const Idee: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF9C4" b="#F9A825" />
    <Place x={540} y={1240} scale={0.9 + pop(t, 0) * 0.15}>
      <Finch frame={t} width={620} mood="idea" />
    </Place>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">UNE AUTRE SOLUTION…</TopBadge>
  </>
);

// --- service ---
const Parasites: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#F3E5F5" b="#7B1FA2" />
    <Place x={540} y={1180} scale={0.95 + pop(t, 0) * 0.1}>
      <Booby frame={t} width={880} itchy mood="annoyed" />
    </Place>
    {[
      [300, 1150],
      [420, 1250],
      [560, 1180],
      [380, 1340],
      [660, 1300],
    ].map(([x, y], i) => (
      <Place key={i} x={x + Math.sin(t * 0.3 + i) * 10} y={y} scale={pop(t, 6 + i * 3)}>
        <Parasite size={70} frame={t + i * 5} />
      </Place>
    ))}
    <TopBadge s={pop(t, 2)} color="#FFFFFF">PLEIN DE PARASITES !</TopBadge>
  </>
);

const BecTropLoin: React.FC<P> = ({t}) => {
  const r = 0.55 + Math.sin(t * 0.2) * 0.1;
  return (
    <>
      <Burst t={t} a="#E1F5FE" b="#0277BD" />
      <Place x={560} y={1220}>
        <Booby frame={t} width={760} reach={r} mood="annoyed" />
      </Place>
      <Place x={270} y={1300}>
        <Parasite size={80} frame={t} />
      </Place>
      <Label x={540} y={760} s={pop(t, 8)} size={80} color="#FF5252">PAS ATTEIGNABLE !</Label>
      <TopBadge s={pop(t, 2)} color="#FFFFFF" size={62}>SON BEC N'Y ARRIVE PAS</TopBadge>
    </>
  );
};

const Nettoyage: React.FC<P> = ({t}) => {
  const k = (t % 24) / 24;
  return (
    <>
      <Burst t={t} a="#E8F5E9" b="#2E7D32" />
      <Place x={620} y={1180}>
        <Booby frame={t} width={720} mood="relaxed" />
      </Place>
      <Place x={290} y={1120} scale={1}>
        <Finch frame={t} width={240} peck mood="happy" />
      </Place>
      <Place x={350 + k * 60} y={1050 - k * 200} scale={k < 0.8 ? 1 : 0}>
        <Parasite size={60} frame={t} />
      </Place>
      <TopBadge s={pop(t, 2)} color="#A5D6A7">LES PINSONS NETTOIENT</TopBadge>
    </>
  );
};

const Massage: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FCE4EC" b="#AD1457" />
    <Ground y={1500} color="#F8BBD0" />
    <Place x={600} y={bOn(1510, 720)}>
      <Booby frame={t} width={720} mood="relaxed" tailUp />
    </Place>
    <Place x={230 + Math.sin(t * 0.5) * 10} y={fOn(1510, 240)}>
      <Finch frame={t} width={240} towel mood="happy" />
    </Place>
    <Hearts frame={t} amount={rp(t, 6, 14)} x={700} y={960} />
    <Label x={540} y={760} s={pop(t, 6)} size={70} color="#FFFFFF">AAAH…</Label>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">COMME UN MASSAGE</TopBadge>
  </>
);

const GagnantGagnant: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF8E1" b="#FFA000" />
    <Place x={330} y={1250} scale={pop(t, 0)}>
      <Finch frame={t} width={380} mood="happy" />
    </Place>
    <Place x={760} y={1150} scale={pop(t, 4)}>
      <Booby frame={t} width={520} mood="love" />
    </Place>
    {[300, 760].map((x, i) => (
      <Place key={x} x={x} y={880} scale={pop(t, 8 + i * 4)}>
        <Check size={170} />
      </Place>
    ))}
    <TopBadge s={pop(t, 2)} color="#A5D6A7">GAGNANT-GAGNANT</TopBadge>
  </>
);

// --- dérapé ---
const Retire: React.FC<P> = ({t}) => {
  const pull = rp(t, 10, 40);
  return (
    <>
      <Burst t={t} a="#E8EAF6" b="#3949AB" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M1100 840 Q 700 880 640 1100 Q 600 1300 1100 1380 Z" fill="#FFFFFF" stroke={INK} strokeWidth={12} />
      </svg>
      <Place x={430} y={1220}>
        <Finch frame={t} width={420} peck={pull < 1} mood="happy" />
      </Place>
      <Place x={interpolate(pull, [0, 1], [650, 500])} y={interpolate(pull, [0, 1], [1120, 900])}>
        <Parasite size={90} frame={t} />
      </Place>
      <TopBadge s={pop(t, 2)} color="#FFFFFF">UN JOUR…</TopBadge>
    </>
  );
};

const Gout: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFEBEE" b="#C62828" />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <path d="M1100 840 Q 700 880 640 1100 Q 600 1300 1100 1380 Z" fill="#FFFFFF" stroke={INK} strokeWidth={12} />
    </svg>
    <Place x={430} y={1220}>
      <Finch frame={t} width={420} peck mood="wow" />
    </Place>
    <Place x={640} y={1150} scale={pop(t, 8) * 0.8}>
      <BloodDrop size={70} />
    </Place>
    <Label x={420} y={820} s={pop(t, 16, 6)} size={180} color="#FFEB3B">!</Label>
    <TopBadge s={pop(t, 2)} color="#FF8A80">IL GOÛTE LE SANG…</TopBadge>
  </>
);

const Tresor: React.FC<P> = ({t}) => {
  const open = rp(t, 4, 18);
  return (
    <>
      <Burst t={t} a="#FFF8E1" b="#FFA000" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect x={290} y={1240} width={500} height={300} rx={20} fill="#8D6E63" stroke={INK} strokeWidth={12} />
        <rect x={290} y={1340} width={500} height={30} fill="#FFD54F" stroke={INK} strokeWidth={6} />
        <g transform={`rotate(${-open * 70} 290 1240)`}>
          <path d="M290 1240 Q 540 1100 790 1240 Z" fill="#A1887F" stroke={INK} strokeWidth={12} />
        </g>
      </svg>
      {['EAU', 'PROTÉINES', 'FER'].map((w, i) => (
        <div key={w} style={{position: 'absolute', left: [110, 360, 700][i], top: 900 + (i % 2) * 90 - open * 40, padding: '14px 26px 6px', borderRadius: 24, background: ['#B3E5FC', '#FFCDD2', '#CFD8DC'][i], border: `8px solid ${INK}`, fontFamily: FONT, fontSize: 52, color: INK, transform: `scale(${pop(t, 14 + i * 10)})`}}>
          {w}
        </div>
      ))}
      <TopBadge s={pop(t, 2)} color="#FFE082">UN VRAI TRÉSOR !</TopBadge>
    </>
  );
};

const Meilleur: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#ECEFF1" b="#546E7A" />
    <div style={{position: 'absolute', left: 60, top: 860, width: 440, height: 560, borderRadius: 30, background: '#FFF8E1', border: `10px solid ${INK}`, transform: `scale(${pop(t, 0)})`}}>
      <div style={{position: 'absolute', left: 90, top: 200}}>
        <Seeds size={260} />
      </div>
      <div style={{position: 'absolute', left: 100, top: 100}}>
        <Cross size={240} draw={rp(t, 10, 20)} />
      </div>
    </div>
    <div style={{position: 'absolute', left: 580, top: 860, width: 440, height: 560, borderRadius: 30, background: '#FFEBEE', border: `10px solid ${INK}`, transform: `scale(${pop(t, 6)})`}}>
      <div style={{position: 'absolute', left: 150, top: 160}}>
        <BloodDrop size={140} />
      </div>
      <div style={{position: 'absolute', left: 140, top: 380}}>
        <Star size={160} />
      </div>
    </div>
    <TopBadge s={pop(t, 2)} color="#FFFFFF" size={60}>MIEUX QUE LES GRAINES SÈCHES</TopBadge>
  </>
);

const Transformation: React.FC<P> = ({t}) => {
  const v = t > 22;
  return (
    <>
      <Burst t={t} a={v ? '#E1BEE7' : '#C8E6C9'} b={v ? '#4A148C' : '#2E7D32'} />
      <Place x={540} y={1200} scale={v ? pop(t, 22, 7) : 1}>
        <Finch frame={t} width={640} towel={!v} cape={v} fangs={v} mood={v ? 'sneaky' : 'happy'} />
      </Place>
      <Label x={540} y={1560} s={1} size={80} color={v ? '#CE93D8' : '#A5D6A7'}>{v ? 'VAMPIRE !' : 'MASSEUR'}</Label>
      <TopBadge s={pop(t, 2)} color="#FFFFFF">PETIT À PETIT…</TopBadge>
    </>
  );
};

// --- réagit ---
const GentilVoisin: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E8F5E9" b="#43A047" />
    <Place x={400} y={1300}>
      <Booby frame={t} width={640} mood="relaxed" />
    </Place>
    <div style={{position: 'absolute', left: 520, top: 700, width: 470, height: 380, borderRadius: '50%', background: '#FFFFFF', border: `10px solid ${INK}`, transform: `scale(${pop(t, 8)})`}}>
      <div style={{position: 'absolute', left: 120, top: 70}}>
        <Finch frame={t} width={220} towel mood="happy" />
      </div>
      <div style={{position: 'absolute', left: 330, top: 60}}>
        <Hearts frame={t} amount={1} x={0} y={60} />
      </div>
    </div>
    {[0, 1].map((i) => (
      <div key={i} style={{position: 'absolute', left: 560 - i * 60, top: 1090 + i * 60, width: 50 - i * 16, height: 50 - i * 16, borderRadius: '50%', background: '#FFFFFF', border: `8px solid ${INK}`, transform: `scale(${pop(t, 4)})`}} />
    ))}
    <TopBadge s={pop(t, 2)} color="#A5D6A7">LE « GENTIL VOISIN »</TopBadge>
  </>
);

const PerteFaible: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFEBEE" b="#E57373" />
    <div style={{position: 'absolute', left: 140, top: 1000, width: 800, height: 120, borderRadius: 60, background: '#FFFFFF', border: `10px solid ${INK}`, overflow: 'hidden', transform: `scale(${pop(t, 0)})`}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${100 - rp(t, 6, 30) * 6}%`, background: '#E53935'}} />
    </div>
    <Label x={540} y={1180} s={pop(t, 10)} size={80} color="#FFFFFF">JUSTE UN PEU…</Label>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">UNE PETITE PERTE</TopBadge>
  </>
);

const TropEnergie: React.FC<P> = ({t}) => {
  const k = (t % 40) / 40;
  return (
    <>
      <Burst t={t} a="#FFF3E0" b="#EF6C00" />
      <Ground y={1460} />
      <Place x={300 + Math.sin(t * 0.15) * 40} y={bOn(1470, 520)}>
        <Booby frame={t} width={520} mood="tired" />
      </Place>
      <Place x={760 + Math.sin(t * 0.3) * 120} y={1360 - Math.abs(Math.sin(t * 0.3)) * 120}>
        <Finch frame={t} width={180} flying={k > 0.3} mood="happy" />
      </Place>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform="translate(720 760)">
          <rect x={0} y={0} width={240} height={110} rx={16} fill="#FFFFFF" stroke={INK} strokeWidth={10} />
          <rect x={240} y={34} width={20} height={42} fill={INK} />
          <rect x={14} y={14} width={Math.max(14, 210 * (1 - rp(t, 0, 90)))} height={82} rx={8} fill="#E53935" />
        </g>
      </svg>
      <TopBadge s={pop(t, 2)} color="#FFFFFF">TROP D'ÉNERGIE !</TopBadge>
    </>
  );
};

// --- conclusion ---
const Survivant: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFE0B2" b="#E65100" />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <path d="M380 1500 L 420 1340 L 660 1340 L 700 1500 Z" fill="#FFD54F" stroke={INK} strokeWidth={10} />
      <text x={540} y={1460} textAnchor="middle" fontFamily={FONT} fontSize={110} fill={INK}>1</text>
    </svg>
    <Place x={540} y={fOn(1350, 360)} scale={pop(t, 0)}>
      <Finch frame={t} width={360} mood="happy" />
    </Place>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">IL A SURVÉCU SANS EAU</TopBadge>
  </>
);

const RendreService: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E8F5E9" b="#43A047" />
    <Place x={620} y={1200}>
      <Booby frame={t} width={680} mood="relaxed" />
    </Place>
    <Place x={250} y={1200}>
      <Finch frame={t} width={260} towel mood="happy" />
    </Place>
    <TopBadge s={pop(t, 2)} color="#A5D6A7">IL A RENDU SERVICE…</TopBadge>
  </>
);

const Confiance: React.FC<P> = ({t}) => {
  const crack = rp(t, 10, 30);
  return (
    <>
      <Burst t={t} a="#F3E5F5" b="#6A1B9A" />
      <svg width={1080} height={1920} style={{position: 'absolute', transform: `scale(${pop(t, 0)})`, transformOrigin: '540px 1150px'}}>
        <g transform={`translate(${-crack * 30} 0) rotate(${-crack * 8} 540 1300)`}>
          <path d="M540 1400 C 340 1270 300 1160 330 1080 C 360 1000 470 990 540 1080 L 510 1160 L 560 1230 L 520 1300 Z" fill="#FF4081" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
        </g>
        <g transform={`translate(${crack * 30} 0) rotate(${crack * 8} 540 1300)`}>
          <path d="M540 1400 C 740 1270 780 1160 750 1080 C 720 1000 610 990 540 1080 L 510 1160 L 560 1230 L 520 1300 Z" fill="#FF4081" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
        </g>
      </svg>
      <Place x={540} y={800} scale={pop(t, 12)}>
        <Finch frame={t} width={240} fangs cape mood="sneaky" />
      </Place>
      <TopBadge s={pop(t, 2)} color="#FFFFFF" size={60}>…ET A PROFITÉ DE SA CONFIANCE</TopBadge>
    </>
  );
};

const Rappelle: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF9C4" b="#FBC02D" />
    <Place x={540} y={1300}>
      <StickMan frame={t} pose="worried" height={500} />
    </Place>
    <Label x={540} y={800} s={pop(t, 4, 6)} size={180} color="#FFFFFF">?</Label>
    <TopBadge s={pop(t, 2)} color="#FFFFFF">ÇA TE RAPPELLE QUELQU'UN ?</TopBadge>
  </>
);

// --- question ---
const SucerSang: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#F3E5F5" b="#4A148C" />
    <Place x={330} y={1300}>
      <StickMan frame={t} pose="worried" height={460} />
    </Place>
    <Place x={760} y={1300}>
      <StickMan frame={t + 4} pose="cheer" height={460} />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <path d="M660 1020 Q 760 1120 860 1020 L 880 1120 Q 760 1240 640 1120 Z" fill="#4A148C" stroke={INK} strokeWidth={8} />
      <path d="M740 1110 l 6 18 l 6 -18 M770 1110 l 6 18 l 6 -18" fill="#FFFFFF" stroke={INK} strokeWidth={3} />
      <path d="M760 1110 Q 560 1000 400 1100" stroke="#E53935" strokeWidth={10} fill="none" strokeDasharray="20 12" strokeDashoffset={-t * 3} />
    </svg>
    <TopBadge s={pop(t, 2)} color="#FF8A80">…PUIS TE « SUCE LE SANG »</TopBadge>
  </>
);

const Commentaire: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E1F5FE" b="#0288D1" />
    <div style={{position: 'absolute', left: 120, top: 760, width: 840, borderRadius: 40, background: '#FFFFFF', border: `10px solid ${INK}`, padding: 40, transform: `scale(${pop(t, 0)})`, fontFamily: FONT}}>
      {['OUI, UN EX-AMI…', 'MON COLLÈGUE !', '…'].map((txt, i) => (
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
    {from: ['dix'], to: ['sans'], C: Taille},
    {from: ['sans'], C: PasDeReaction},
  ],
  horreur: [{from: ['et'], C: IlePerdue}],
  vampire: [
    {from: ['voici'], to: ['il'], C: PortraitPinson},
    {from: ['il'], to: ['lui'], C: PortraitFou},
    {from: ['lui'], to: ['le', 3], C: Queue},
  ],
  pourquoi: [
    {from: ["l'origine"], to: ['mais'], C: Avant},
    {from: ['mais'], to: ['pendant'], C: Four},
    {from: ['pendant'], to: ['les'], C: PasDePluie},
    {from: ['les'], to: ['trop'], C: Grillent},
    {from: ['trop'], to: ['il', 3], C: TropPetit},
    {from: ['il', 3], C: Idee},
  ],
  service: [
    {from: ['le'], to: ['et'], C: Parasites},
    {from: ['et'], to: ['les', 1], C: BecTropLoin},
    {from: ['les', 1], to: ['le', 4], C: Nettoyage},
    {from: ['le', 4], to: ['les', 3], C: Massage},
    {from: ['les', 3], C: GagnantGagnant},
  ],
  derape: [
    {from: ['un'], to: ['un', 2], C: Retire},
    {from: ['un', 2], to: ['et', 1], C: Gout},
    {from: ['et', 1], to: ['bien'], C: Tresor},
    {from: ['bien'], to: ['petit'], C: Meilleur},
    {from: ['petit'], C: Transformation},
  ],
  reagit: [
    {from: ['parce'], to: ['la'], C: GentilVoisin},
    {from: ['la'], to: ['poursuivre'], C: PerteFaible},
    {from: ['poursuivre'], to: ['alors'], C: TropEnergie},
  ],
  conclusion: [
    {from: ['le'], to: ['mais'], C: Survivant},
    {from: ['mais'], to: ['et'], C: RendreService},
    {from: ['et'], to: ['ca'], C: Confiance},
    {from: ['ca'], C: Rappelle},
  ],
  question: [
    {from: ['puis'], to: ['dis-le'], C: SucerSang},
    {from: ['dis-le'], C: Commentaire},
  ],
};
