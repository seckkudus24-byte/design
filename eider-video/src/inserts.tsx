import React, {useContext} from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {SceneCtx, useCue} from './cue';
import {SCENE_IDS} from './timeline';
import {Duckling, Eider, Gull, Nest, Quilt, Fox} from './characters/Arctic';
import {ColdThermo, Cross, Zzz} from './characters/Icons';
import {Hearts, Star} from './characters/Icons2';
import {StickMan} from './characters/StickMan';
import {FONT, Place} from './ui';
import {TopBadge} from './scenes/common';

// ---------------------------------------------------------------------------
// Plans d'insert : toutes les 3 à 5 s, un nouveau tableau plein écran (fond, cadrage
// et illustration différents) vient couvrir la scène principale, puis on y revient.
// ---------------------------------------------------------------------------

const INK = '#2B2420';
type P = {t: number; len: number};
const pop = (t: number, d = 0, damping = 10) => spring({frame: t - d, fps: 30, config: {damping, stiffness: 160, mass: 0.7}});
const rp = (t: number, a: number, b: number) => interpolate(t, [a, Math.max(a + 1, b)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x * (3 - 2 * x)});

// Fond BD : dégradé radial + rayons qui tournent doucement.
const Burst: React.FC<{t: number; a: string; b: string; rays?: boolean}> = ({t, a, b, rays = true}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 62%, ${a} 0%, ${b} 75%)`}} />
    {rays ? (
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.13}}>
        <g transform={`translate(540 1190) rotate(${t * 0.3})`}>
          {Array.from({length: 16}, (_, i) => (
            <path key={i} d="M0 0 L-90 -1500 L90 -1500 Z" fill="#FFFFFF" transform={`rotate(${i * 22.5})`} />
          ))}
        </g>
      </svg>
    ) : null}
  </>
);

const Snow: React.FC<{t: number; n?: number}> = ({t, n = 26}) => (
  <svg width={1080} height={1920} style={{position: 'absolute'}}>
    {Array.from({length: n}, (_, i) => {
      const x = (i * 197) % 1080;
      const y = ((i * 311 + t * (3 + (i % 3))) % 1500) + 450;
      return <circle key={i} cx={x + Math.sin(t * 0.05 + i) * 20} cy={y} r={6 + (i % 3) * 3} fill="#FFFFFF" opacity={0.85} />;
    })}
  </svg>
);

const BigText: React.FC<{y: number; s: number; size?: number; color?: string; children: React.ReactNode}> = ({y, s, size = 120, color = '#FFFFFF', children}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: FONT, fontSize: size, color, WebkitTextStroke: `${size / 7}px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${s})`}}>
    {children}
  </div>
);

const Calendar: React.FC<{t: number; days: number; speed: number; label: string}> = ({t, days, speed, label}) => {
  const crossed = Math.min(days, Math.floor(Math.max(0, t - 10) / speed));
  const cols = 7;
  return (
    <svg viewBox="0 0 700 640" width={760} style={{overflow: 'visible'}}>
      <rect x={10} y={30} width={680} height={600} rx={40} fill="#FFFFFF" stroke={INK} strokeWidth={12} />
      <path d="M10 70 Q10 30 50 30 H650 Q690 30 690 70 V150 H10 Z" fill="#E53935" stroke={INK} strokeWidth={12} />
      <text x={350} y={125} textAnchor="middle" fontFamily={FONT} fontSize={70} fill="#FFFFFF">{label}</text>
      {[150, 550].map((x) => (
        <rect key={x} x={x - 14} y={0} width={28} height={70} rx={14} fill="#90A4AE" stroke={INK} strokeWidth={8} />
      ))}
      {Array.from({length: days}, (_, i) => {
        const cx = 70 + (i % cols) * 94;
        const cy = 200 + Math.floor(i / cols) * 100;
        return (
          <g key={i}>
            <rect x={cx - 34} y={cy - 34} width={68} height={68} rx={12} fill="#FFF8E1" stroke="#BCAAA4" strokeWidth={4} />
            {i < crossed ? <path d={`M${cx - 24} ${cy - 24} L${cx + 24} ${cy + 24} M${cx + 24} ${cy - 24} L${cx - 24} ${cy + 24}`} stroke="#E53935" strokeWidth={10} strokeLinecap="round" /> : null}
          </g>
        );
      })}
    </svg>
  );
};

const Plate: React.FC<{size?: number}> = ({size = 300}) => (
  <svg viewBox="0 0 300 200" width={size} style={{overflow: 'visible'}}>
    <ellipse cx={150} cy={110} rx={140} ry={70} fill="#FFFFFF" stroke={INK} strokeWidth={10} />
    <ellipse cx={150} cy={110} rx={90} ry={42} fill="#ECEFF1" stroke="#B0BEC5" strokeWidth={5} />
    <path d="M10 20 v60 M0 20 v30 q10 10 20 0 v-30" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" transform="translate(-30 40)" />
  </svg>
);

// ---------- les inserts, scène par scène ----------

const MoisSansManger: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFCC80" b="#FB8C00" />
    <Place x={540} y={1050} scale={pop(t, 0)}>
      <Calendar t={t} days={28} speed={1.6} label="1 MOIS" />
    </Place>
    <Place x={540} y={1560} scale={pop(t, 12)}>
      <Plate size={360} />
    </Place>
    <Place x={540} y={1560} scale={pop(t, 22) * 0.9}>
      <Cross size={240} draw={rp(t, 22, 36)} />
    </Place>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">SANS MANGER !</TopBadge>
  </>
);

const Ennemis: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#EF9A9A" b="#C62828" />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1420, height: 500, background: '#8C8577', borderTop: `10px solid ${INK}`}} />
    <Place x={290} y={1360} scale={pop(t, 0)}>
      <Nest width={360} />
    </Place>
    <Place x={300} y={1260} scale={pop(t, 0)}>
      <Eider frame={t} width={340} pose="sit" />
    </Place>
    <Place x={790} y={1290} scale={pop(t, 10)} flip>
      <Gull frame={t} width={380} flying={false} />
    </Place>
    <BigText y={900} s={pop(t, 18)} size={150} color="#FFEB3B">⚡</BigText>
    <TopBadge s={pop(t, 4)} color="#FFE082">À CÔTÉ DE SES ENNEMIS !</TopBadge>
  </>
);

const Portrait: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E0F7FA" b="#4DB6AC" />
    <Place x={520 + Math.sin(t * 0.04) * 10} y={1180} scale={0.9 + pop(t, 0) * 0.2}>
      <Eider frame={t} width={760} pose="stand" />
    </Place>
    {[0, 1, 2, 3].map((i) => (
      <Place key={i} x={200 + i * 230} y={760 + (i % 2) * 120 - Math.sin(t * 0.15 + i) * 20} scale={pop(t, 8 + i * 4) * 0.45}>
        <Star size={120} />
      </Place>
    ))}
    <TopBadge s={pop(t, 4)} color="#FFFFFF" size={90}>L'EIDER</TopBadge>
  </>
);

const Carte: React.FC<P> = ({t}) => {
  const pin = pop(t, 14, 7);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: '#4FC3F7'}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {Array.from({length: 10}, (_, i) => (
          <path key={i} d={`M${((i * 230 + t * 1.2) % 1300) - 150} ${700 + (i % 5) * 230} q 25 -12 50 0 t 50 0`} stroke="#FFFFFF" strokeWidth={6} fill="none" opacity={0.5} />
        ))}
        <g transform={`translate(540 1150) scale(${pop(t, 0)})`}>
          <path d="M-330 -60 Q -300 -170 -180 -160 Q -120 -240 -20 -190 Q 60 -250 160 -200 Q 280 -230 330 -120 Q 380 -20 300 60 Q 260 170 120 160 Q 20 220 -100 170 Q -230 180 -280 90 Q -380 40 -330 -60 Z" fill="#FFF3E0" stroke={INK} strokeWidth={10} />
          <path d="M-120 -40 l60 -70 l50 60 l50 -50 l60 70" stroke="#B0BEC5" strokeWidth={10} fill="none" strokeLinejoin="round" />
        </g>
        <path d={`M-20 ${880} Q 540 ${840} 1100 ${880}`} stroke="#FFFFFF" strokeWidth={10} strokeDasharray="30 20" fill="none" strokeDashoffset={-t * 3} opacity={rp(t, 6, 16)} />
        <g transform={`translate(${420} ${1110 - (1 - pin) * 200})`} opacity={pin}>
          <path d="M0 0 C -50 -60 -50 -120 0 -120 C 50 -120 50 -60 0 0 Z" fill="#E53935" stroke={INK} strokeWidth={8} />
          <circle cx={0} cy={-80} r={18} fill="#FFFFFF" />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', fontFamily: FONT, fontSize: 48, color: '#FFFFFF', WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill', opacity: rp(t, 8, 16)}}>
        CERCLE POLAIRE
      </div>
      <BigText y={1420} s={pop(t, 20)} size={110}>ISLANDE</BigText>
    </>
  );
};

const PleinFroid: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#B3E5FC" b="#0277BD" rays={false} />
    <Snow t={t} />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <path d="M100 1920 L 420 1330 L 700 1330 L 1000 1920 Z" fill="#6D6A5E" stroke={INK} strokeWidth={10} />
      <path d="M420 1330 L 700 1330" stroke="#FFFFFF" strokeWidth={24} strokeLinecap="round" />
    </svg>
    <Place x={560} y={1300}>
      <Nest width={380} />
    </Place>
    <Place x={570 + Math.sin(t * 1.2) * 3} y={1200}>
      <Eider frame={t} width={400} pose="sit" sleepy />
    </Place>
    <Place x={900} y={1000} scale={pop(t, 10)}>
      <ColdThermo size={380} level={rp(t, 10, 40)} frame={t} />
    </Place>
    <TopBadge s={pop(t, 4)} color="#E1F5FE">EN PLEIN FROID !</TopBadge>
  </>
);

const Pourquoi: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#CE93D8" b="#6A1B9A" />
    <Place x={420} y={1250} scale={pop(t, 0)}>
      <Eider frame={t} width={620} pose="sit" />
    </Place>
    {[0, 1, 2].map((i) => (
      <BigText key={i} y={760 + i * 70 - Math.abs(Math.sin(t * 0.2 + i)) * 40} s={pop(t, 6 + i * 6)} size={170 - i * 30} color="#FFEB3B">
        <span style={{position: 'relative', left: 140 + i * 180 - 200}}>?</span>
      </BigText>
    ))}
    <TopBadge s={pop(t, 2)} color="#FFFFFF" size={90}>POURQUOI ?</TopBadge>
  </>
);

const Voisins: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFF59D" b="#F9A825" />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1380, height: 600, background: '#9CCC65', borderTop: `10px solid ${INK}`}} />
    <Place x={280} y={1340} scale={pop(t, 0)}>
      <Nest width={330} />
    </Place>
    <Place x={290} y={1250} scale={pop(t, 0)}>
      <Eider frame={t} width={320} pose="sit" />
    </Place>
    <Place x={800} y={1340} scale={pop(t, 8)}>
      <Nest width={300} down={0} eggs={3} />
    </Place>
    <Place x={810} y={1190} scale={pop(t, 8)} flip>
      <Gull frame={t} width={340} flying={false} />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: rp(t, 16, 24)}}>
      <path d="M430 1000 L 650 1000 M430 1000 l30 -24 M430 1000 l30 24 M650 1000 l-30 -24 M650 1000 l-30 24" stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <path d="M430 1000 L 650 1000 M430 1000 l30 -24 M430 1000 l30 24 M650 1000 l-30 -24 M650 1000 l-30 24" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
    </svg>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">VOISINS !</TopBadge>
  </>
);

const Shield: React.FC<{size?: number}> = ({size = 260}) => (
  <svg viewBox="0 0 200 240" width={size} style={{overflow: 'visible'}}>
    <path d="M100 10 L 185 45 Q 190 160 100 230 Q 10 160 15 45 Z" fill="#42A5F5" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
    <path d="M60 120 L 90 150 L 145 85" stroke="#FFFFFF" strokeWidth={20} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Protection: React.FC<P> = ({t, len}) => {
  const run = rp(t, 14, len);
  return (
    <>
      <Burst t={t} a="#C5E1A5" b="#2E7D32" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1420, height: 600, background: '#8C8577', borderTop: `10px solid ${INK}`}} />
      <Place x={300} y={1380}>
        <Nest width={330} />
      </Place>
      <Place x={310} y={1290}>
        <Eider frame={t} width={320} pose="sit" />
      </Place>
      <Place x={560} y={900 + Math.sin(t * 0.2) * 20} scale={pop(t, 4)}>
        <Gull frame={t} width={300} />
      </Place>
      <Place x={590} y={1200} scale={pop(t, 10)}>
        <Shield size={220} />
      </Place>
      <Place x={850 + run * 400} y={1360} flip={run > 0.05}>
        <Fox frame={t} width={300} />
      </Place>
      <TopBadge s={pop(t, 4)} color="#FFFFFF" size={60}>PROTECTION GRATUITE</TopBadge>
    </>
  );
};

const Danger: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FF8A80" b="#B71C1C" />
    <Place x={720} y={980 + Math.sin(t * 0.1) * 10} scale={pop(t, 0)} flip>
      <Gull frame={t} width={560} flying={false} />
    </Place>
    {[0, 1, 2].map((i) => (
      <Place key={i} x={180 + i * 130} y={1450 + Math.sin(t * 0.6 + i) * 6} scale={pop(t, 8 + i * 3)}>
        <Duckling frame={t + i * 5} size={140} />
      </Place>
    ))}
    <BigText y={1100} s={pop(t, 14, 6)} size={220} color="#FFEB3B">!</BigText>
    <TopBadge s={pop(t, 4)} color="#FFE082">GARE AUX PETITS !</TopBadge>
  </>
);

const Arrache: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#F8BBD0" b="#C2185B" />
    <Place x={480} y={1180} scale={0.95 + pop(t, 0) * 0.1}>
      <Eider frame={t} width={820} pose="sit" plucking />
    </Place>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {Array.from({length: 10}, (_, i) => {
        const k = ((t + i * 9) % 70) / 70;
        return <ellipse key={i} cx={720 + (i % 4) * 40 - k * 320} cy={1180 - k * 520 + (i % 3) * 30} rx={24} ry={15} fill="#FFFFFF" stroke="#B0BEC5" strokeWidth={3} opacity={1 - k} transform={`rotate(${i * 40 + t * 3} ${720 + (i % 4) * 40 - k * 320} ${1180 - k * 520 + (i % 3) * 30})`} />;
      })}
    </svg>
    <TopBadge s={pop(t, 4)} color="#FFFFFF" size={60}>LE DUVET DE SON VENTRE</TopBadge>
  </>
);

const Isolant: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#283593" b="#0D1442" rays={false} />
    <Snow t={t} n={34} />
    <div style={{position: 'absolute', left: 290, top: 1010, width: 500, height: 380, borderRadius: '50% 50% 20% 20%', background: 'radial-gradient(#FFB74D, #FFF3E0 70%)', border: `12px solid ${INK}`, transform: `scale(${pop(t, 0)})`}} />
    {Array.from({length: 12}, (_, i) => {
      const a = (i / 11) * Math.PI;
      return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * 270 - 45, top: 1260 - Math.sin(a) * 250 - 40, width: 90, height: 80, borderRadius: '50%', background: '#FFFFFF', border: `6px solid #B0BEC5`, transform: `scale(${pop(t, 4 + i)})`}} />;
    })}
    <Place x={540} y={1300} scale={pop(t, 10)}>
      <Nest width={320} down={0} eggs={4} />
    </Place>
    <BigText y={1450} s={pop(t, 16)} size={90} color="#FFB74D">38 °C</BigText>
    <BigText y={720} s={pop(t, 22)} size={70} color="#B3E5FC">-10 °C DEHORS</BigText>
    <TopBadge s={pop(t, 4)} color="#B3E5FC">SUPER ISOLANT</TopBadge>
  </>
);

const Luxe: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFE082" b="#6A1B9A" />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <rect x={160} y={1150} width={760} height={260} rx={30} fill="#8D6E63" stroke={INK} strokeWidth={12} />
      <rect x={140} y={950} width={80} height={520} rx={20} fill="#6D4C41" stroke={INK} strokeWidth={12} />
      <rect x={860} y={1080} width={70} height={390} rx={20} fill="#6D4C41" stroke={INK} strokeWidth={12} />
      <ellipse cx={330} cy={1120} rx={110} ry={55} fill="#FFFFFF" stroke={INK} strokeWidth={10} />
    </svg>
    <Place x={600} y={1150} scale={pop(t, 4) * 2.2}>
      <Quilt size={260} />
    </Place>
    {[0, 1, 2].map((i) => (
      <Place key={i} x={260 + i * 280} y={820 - Math.abs(Math.sin(t * 0.15 + i)) * 40} scale={pop(t, 10 + i * 4) * 0.7}>
        <Star size={130} />
      </Place>
    ))}
    <BigText y={1520} s={pop(t, 16)} size={100} color="#FFD54F">TRÈS CHER !</BigText>
    <TopBadge s={pop(t, 2)} color="#FFD54F">COUETTES DE LUXE</TopBadge>
  </>
);

const Semaines: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#B2DFDB" b="#00796B" />
    <Place x={540} y={1110} scale={pop(t, 0)}>
      <Calendar t={t} days={28} speed={2.6} label="4 SEMAINES" />
    </Place>
    <Place x={820} y={1580} scale={pop(t, 14)}>
      <Eider frame={t} width={300} pose="sit" sleepy />
    </Place>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">SANS QUITTER SES ŒUFS</TopBadge>
  </>
);

const AvantApres: React.FC<P> = ({t}) => {
  const thin = rp(t, 16, 50);
  return (
    <>
      <Burst t={t} a="#FFE0B2" b="#E64A19" />
      <div style={{position: 'absolute', left: 538, top: 700, width: 6, height: 1100, background: INK, opacity: 0.4}} />
      <Place x={280} y={1180} scale={pop(t, 0)}>
        <Eider frame={t} width={420} pose="stand" />
      </Place>
      <Place x={800} y={1180} scale={pop(t, 8)}>
        <Eider frame={t + 20} width={420} pose="stand" thin={thin} sleepy />
      </Place>
      <div style={{position: 'absolute', left: 520, top: 1480, width: 560, textAlign: 'center', fontFamily: FONT, fontSize: 70, color: '#FFFFFF', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${pop(t, 10)})`}}>APRÈS</div>
      <div style={{position: 'absolute', left: 0, width: 560, top: 1480, textAlign: 'center', fontFamily: FONT, fontSize: 70, color: '#FFFFFF', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${pop(t, 4)})`}}>AVANT</div>
      <BigText y={1620} s={pop(t, 30, 6)} size={130} color="#FF5252">-40 %</BigText>
      <TopBadge s={pop(t, 4)} color="#FFFFFF">RÉSULTAT :</TopBadge>
    </>
  );
};

const Eclosion: React.FC<P> = ({t}) => {
  const crack = rp(t, 6, 26);
  const out = pop(t, 30, 8);
  return (
    <>
      <Burst t={t} a="#FFF9C4" b="#FBC02D" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(540 1250) rotate(${crack < 1 ? Math.sin(t * 1.3) * 6 * crack : 0})`}>
          <path d={`M-170 ${-40 + out * 200} Q -180 -260 0 -280 Q 180 -260 170 ${-40 + out * 200}`} fill="#A5B48A" stroke={INK} strokeWidth={12} opacity={1 - out} transform={`translate(0 ${-out * 300})`} />
          <path d="M-175 -20 Q -170 230 0 240 Q 170 230 175 -20 L 120 20 L 60 -30 L 0 20 L -60 -30 L -120 20 Z" fill="#A5B48A" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
          <path d="M-60 -200 l30 50 l-20 30 l40 40" stroke={INK} strokeWidth={8} fill="none" pathLength={1} strokeDasharray={`${crack} 1`} />
        </g>
      </svg>
      <Place x={540} y={1150 - out * 60} scale={out * 3}>
        <Duckling frame={t} size={100} />
      </Place>
      <TopBadge s={pop(t, 30)} color="#FFFFFF">ÉCLOSION !</TopBadge>
    </>
  );
};

const Kilometres: React.FC<P> = ({t, len}) => {
  const k = rp(t, 6, len);
  const path = (u: number) => ({x: 180 + u * 700 + Math.sin(u * 7) * 60, y: 800 + u * 800});
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: '#AED581'}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M600 1920 Q 800 1500 1100 1450 L 1100 1920 Z" fill="#2F6E8F" stroke={INK} strokeWidth={10} />
        <path d="M-20 600 L 300 640 Q 340 820 -20 900 Z" fill="#6D6A5E" stroke={INK} strokeWidth={10} />
        {[[400, 900], [760, 1000], [300, 1300], [700, 1250]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={50} fill="#8BC34A" stroke="#558B2F" strokeWidth={6} />
        ))}
        <path d={Array.from({length: 41}, (_, i) => `${i ? 'L' : 'M'}${path(i / 40).x} ${path(i / 40).y}`).join(' ')} stroke="#FFFFFF" strokeWidth={12} strokeDasharray="24 20" fill="none" />
      </svg>
      {[0, 1, 2].map((i) => {
        const p = path(Math.max(0, k - i * 0.04));
        return (
          <Place key={i} x={p.x} y={p.y - 40}>
            <Duckling frame={t + i * 6} size={90} walking />
          </Place>
        );
      })}
      <TopBadge s={pop(t, 4)} color="#FFFFFF">PLUSIEURS KM !</TopBadge>
    </>
  );
};

const Amorti: React.FC<P> = ({t}) => {
  const fall = rp(t, 4, 30);
  const bounce = t > 30 ? Math.abs(Math.sin((t - 30) * 0.18)) * 160 * Math.exp(-(t - 30) / 30) : 0;
  const squash = t > 30 && bounce < 20 ? 0.8 : 1;
  return (
    <>
      <Burst t={t} a="#E1F5FE" b="#4FC3F7" />
      <div style={{position: 'absolute', left: 240, top: 1430, width: 600, height: 170, borderRadius: '50%', background: '#FFFFFF', border: `10px solid ${INK}`, transform: `scaleY(${t > 28 && t < 40 ? 0.8 : 1})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1560, height: 400, background: '#2F6E8F', borderTop: `10px solid ${INK}`}} />
      <Place x={540} y={interpolate(fall, [0, 1], [600, 1360]) - bounce} rotate={fall < 1 ? fall * 360 : 0} scale={2.2}>
        <div style={{transform: `scaleY(${squash})`}}>
          <Duckling frame={t} size={100} />
        </div>
      </Place>
      <BigText y={1170} s={pop(t, 32, 6)} size={90} color="#FFEB3B">BOING !</BigText>
      <TopBadge s={pop(t, 4)} color="#A5D6A7" size={60}>OS SOUPLES + DUVET</TopBadge>
    </>
  );
};

const Seule: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#8E5A5A" b="#3E1212" />
    <div style={{position: 'absolute', left: 340, top: 1230, width: 400, height: 220, borderRadius: '50%', background: 'radial-gradient(rgba(255,235,59,0.5), rgba(255,235,59,0) 70%)'}} />
    <Place x={540} y={1260}>
      <Eider frame={t} width={360} pose="stand" />
    </Place>
    {[0, 1].map((i) => (
      <Place key={i} x={500 + i * 90} y={1380}>
        <Duckling frame={t + i * 7} size={80} />
      </Place>
    ))}
    {[0, 1, 2].map((i) => {
      const a = t * 0.04 + (i * Math.PI * 2) / 3;
      return (
        <Place key={i} x={540 + Math.cos(a) * 380} y={1100 + Math.sin(a) * 260} flip={Math.sin(a) > 0}>
          <Gull frame={t + i * 5} width={230} />
        </Place>
      );
    })}
    <TopBadge s={pop(t, 4)} color="#FFFFFF">TOUTE SEULE…</TopBadge>
  </>
);

const Appel: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FFCC80" b="#EF6C00" />
    <Place x={330} y={1200} scale={pop(t, 0)}>
      <Eider frame={t} width={760} pose="sit" call />
    </Place>
    <BigText y={850} s={pop(t, 12, 6)} size={180} color="#FF5252">
      <span style={{position: 'relative', left: 180}}>SOS</span>
    </BigText>
    <TopBadge s={pop(t, 4)} color="#A5D6A7">UN APPEL À L'AIDE !</TopBadge>
  </>
);

// Vue du ciel : les adultes (gros ronds bruns) se referment autour des canetons.
const VueDuCiel: React.FC<P> = ({t}) => {
  const close = rp(t, 6, 50);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: '#A9A190'}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {Array.from({length: 30}, (_, i) => (
          <circle key={i} cx={(i * 173) % 1080} cy={600 + ((i * 271) % 1300)} r={10 + (i % 4) * 6} fill="#8C8577" />
        ))}
        {Array.from({length: 9}, (_, i) => {
          const a = (i / 9) * Math.PI * 2 + t * 0.005;
          const r = interpolate(close, [0, 1], [520, 270]);
          const x = 540 + Math.cos(a) * r;
          const y = 1200 + Math.sin(a) * r;
          const head = a + Math.PI / 2;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${(head * 180) / Math.PI})`}>
              <ellipse cx={0} cy={0} rx={70} ry={50} fill="#8D6E52" stroke={INK} strokeWidth={7} />
              <circle cx={70} cy={0} r={28} fill="#8D6E52" stroke={INK} strokeWidth={6} />
              <path d="M95 -8 L120 0 L95 8 Z" fill="#7E8B6A" stroke={INK} strokeWidth={4} />
            </g>
          );
        })}
        {Array.from({length: 8}, (_, i) => (
          <g key={i} transform={`translate(${540 + ((i * 67) % 200) - 100 + Math.sin(t * 0.2 + i) * 6} ${1200 + ((i * 113) % 180) - 90})`}>
            <circle r={26} fill="#5D4A3A" stroke={INK} strokeWidth={5} />
            <circle cx={22} r={13} fill="#5D4A3A" stroke={INK} strokeWidth={4} />
          </g>
        ))}
      </svg>
      <TopBadge s={pop(t, 4)} color="#FFFFFF">VUE DU CIEL : UN CERCLE !</TopBadge>
    </>
  );
};

const Scientifique: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#E3F2FD" b="#1E88E5" />
    <svg width={1080} height={1920} style={{position: 'absolute', transform: `scale(${pop(t, 0)})`, transformOrigin: '700px 1050px'}}>
      <rect x={460} y={820} width={520} height={420} rx={20} fill="#FFFFFF" stroke={INK} strokeWidth={12} />
      <circle cx={720} cy={1030} r={130} fill="none" stroke="#8D6E52" strokeWidth={34} strokeDasharray="30 14" />
      {Array.from({length: 6}, (_, i) => (
        <circle key={i} cx={690 + (i % 3) * 30} cy={1010 + Math.floor(i / 3) * 40} r={12} fill="#5D4A3A" />
      ))}
      <path d="M520 1300 L 600 1240 M920 1300 L 840 1240" stroke={INK} strokeWidth={12} />
    </svg>
    <Place x={250} y={1250}>
      <StickMan frame={t} pose="point" height={560} />
    </Place>
    <BigText y={1450} s={pop(t, 14)} size={110} color="#FFEB3B">« CRÈCHE »</BigText>
    <TopBadge s={pop(t, 4)} color="#FFFFFF">LES SCIENTIFIQUES DISENT :</TopBadge>
  </>
);

const Mur: React.FC<P> = ({t}) => {
  const k = (t % 40) / 40;
  const y = 700 + Math.sin(k * Math.PI) * 480;
  return (
    <>
      <Burst t={t} a="#E1F5FE" b="#81D4FA" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1500, height: 500, background: '#8C8577', borderTop: `10px solid ${INK}`}} />
      {[0, 1, 2, 3].map((i) => (
        <Place key={i} x={130 + i * 270} y={1370 - (i % 2) * 20}>
          <Eider frame={t + i * 7} width={320} pose="stand" call={k > 0.4 && k < 0.6} />
        </Place>
      ))}
      <Place x={540 + (k - 0.5) * 300} y={y} flip={k > 0.5}>
        <Gull frame={t} width={300} dive={Math.sin(k * Math.PI)} />
      </Place>
      {k > 0.42 && k < 0.62 ? (
        <Place x={540} y={1150}>
          <Star size={120} />
        </Place>
      ) : null}
      <TopBadge s={pop(t, 4)} color="#FF8A80">AUCUNE OUVERTURE !</TopBadge>
    </>
  );
};

const Repos: React.FC<P> = ({t}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#FF8A65 0%, #FFCC80 50%, #FFE0B2 62%)'}} />
    <div style={{position: 'absolute', left: 390, top: 1040, width: 300, height: 300, borderRadius: '50%', background: '#FFEB3B', opacity: 0.85}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1200, bottom: 0, background: '#2F6E8F', borderTop: `10px solid ${INK}`}} />
    <Place x={540} y={1210 + Math.sin(t * 0.08) * 6}>
      <Eider frame={t} width={460} pose="swim" sleepy />
    </Place>
    <Place x={800} y={980}>
      <Zzz size={200} frame={t} />
    </Place>
    {[0, 1].map((i) => (
      <Place key={i} x={200 + i * 680} y={1260 + Math.sin(t * 0.1 + i) * 6}>
        <Duckling frame={t + i * 9} size={110} />
      </Place>
    ))}
    <TopBadge s={pop(t, 4)} color="#FFFFFF">ENFIN LE REPOS</TopBadge>
  </>
);

const Famille: React.FC<P> = ({t}) => (
  <>
    <Burst t={t} a="#FCE4EC" b="#EC407A" />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1380, bottom: 0, background: '#2F6E8F', borderTop: `10px solid ${INK}`}} />
    {[0, 1, 2].map((i) => (
      <Place key={i} x={200 + i * 340} y={1330 + Math.sin(t * 0.08 + i) * 6} scale={pop(t, i * 4)}>
        <Eider frame={t + i * 13} width={300} pose="swim" />
      </Place>
    ))}
    {Array.from({length: 7}, (_, i) => (
      <Place key={i} x={120 + i * 140} y={1460 + (i % 2) * 50 + Math.sin(t * 0.1 + i) * 6} scale={pop(t, 8 + i * 2)}>
        <Duckling frame={t + i * 5} size={90} />
      </Place>
    ))}
    <Hearts frame={t} amount={rp(t, 6, 14)} x={540} y={1100} />
    <Hearts frame={t + 20} amount={rp(t, 10, 18)} x={240} y={1150} />
    <Hearts frame={t + 30} amount={rp(t, 10, 18)} x={840} y={1150} />
    <TopBadge s={pop(t, 4)} color="#F8BBD0">L'ENTRAIDE !</TopBadge>
  </>
);

// ---------- programme des inserts ----------

type W = [string, number?];
type Spec = {from: W; to?: W; C: React.FC<P>};

const PLAN: Record<string, Spec[]> = {
  titre: [{from: ['mois'], C: MoisSansManger}],
  plumes: [{from: ['installer'], C: Ennemis}],
  nid: [
    {from: ['voici'], to: ['du'], C: Portrait},
    {from: ['du'], to: ['femelle'], C: Carte},
    {from: ["s'installe"], to: ['pourquoi'], C: PleinFroid},
    {from: ['pourquoi'], to: ['renards'], C: Pourquoi},
  ],
  voisin: [
    {from: ['pose'], to: ['les'], C: Voisins},
    {from: ["l'eider"], to: ['meme'], C: Protection},
    {from: ['meme'], to: ["c'est"], C: Danger},
  ],
  duvet: [
    {from: ['maman'], to: ['ce'], C: Arrache},
    {from: ['ce'], to: ['humains'], C: Isolant},
    {from: ['il'], C: Luxe},
  ],
  jeune: [
    {from: ['environ'], to: ['elle', 1], C: Semaines},
    {from: ['resultat'], C: AvantApres},
  ],
  saut: [
    {from: ['quand'], to: ['sur'], C: Eclosion},
    {from: ['ils'], to: ['pour'], C: Kilometres},
    {from: ['heureusement'], C: Amorti},
  ],
  cri: [
    {from: ['seule'], to: ['alors'], C: Seule},
    {from: ['ce'], to: ['et'], C: Appel},
  ],
  creche: [
    {from: ['ensemble'], to: ['scientifiques'], C: VueDuCiel},
    {from: ['scientifiques'], to: ['mur'], C: Scientifique},
    {from: ['goelands'], C: Mur},
  ],
  conclusion: [
    {from: ['maman'], to: ['elle'], C: Repos},
    {from: ['et'], C: Famille},
  ],
};

export const INSERT_PLAN = PLAN;

const IN = 12;
const OUT = 10;
type Kind = 'circle' | 'wipe' | 'slide' | 'zoom' | 'diag';
const KINDS: Kind[] = ['circle', 'wipe', 'zoom', 'slide', 'diag'];

const clipFor = (kind: Kind, p: number, out: boolean): React.CSSProperties => {
  const e = Easing.bezier(0.7, 0, 0.3, 1)(p);
  if (kind === 'circle') return {clipPath: `circle(${e * 125}% at 50% 60%)`};
  if (kind === 'wipe') return {clipPath: out ? `inset(0 0 0 ${(1 - e) * 100}%)` : `inset(0 ${(1 - e) * 100}% 0 0)`};
  if (kind === 'slide') return {transform: `translateY(${(out ? -1 : 1) * (1 - e) * 100}%)`};
  if (kind === 'zoom') return {transform: `scale(${0.3 + e * 0.7}) rotate(${(1 - e) * 10}deg)`, opacity: Math.min(1, e * 2), borderRadius: (1 - e) * 80, overflow: 'hidden'};
  const x = -60 + e * 220;
  return {clipPath: `polygon(0 0, ${x}% 0, ${x - 60}% 100%, 0 100%)`};
};

const Insert: React.FC<{spec: Spec; n: number; dur: number}> = ({spec, n, dur}) => {
  const frame = useCurrentFrame();
  const from = useCue(spec.from[0], spec.from[1] ?? 0) - 6;
  const toCue = useCue(spec.to ? spec.to[0] : spec.from[0], spec.to ? spec.to[1] ?? 0 : 0);
  const to = spec.to ? toCue - 6 : dur + 20;
  if (frame < from || frame >= to) return null;
  const t = frame - from;
  const kind = KINDS[n % KINDS.length];
  const pin = Math.min(1, t / IN);
  const pout = spec.to ? Math.min(1, (to - frame) / OUT) : 1;
  const style = pin < 1 ? clipFor(kind, pin, false) : pout < 1 ? clipFor(KINDS[(n + 2) % KINDS.length], pout, true) : {};
  const {C} = spec;
  return (
    <AbsoluteFill style={{...style, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${1 + t * 0.0006})`, transformOrigin: '50% 60%'}}>
        <C t={t} len={to - from} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Doux « fwip » à chaque changement de plan.
const Swish: React.FC<{at: number}> = ({at}) => (
  <Sequence from={Math.max(0, at)} durationInFrames={20} layout="none">
    <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.07} />
  </Sequence>
);

const InsertSounds: React.FC<{spec: Spec; dur: number}> = ({spec}) => {
  const from = useCue(spec.from[0], spec.from[1] ?? 0) - 6;
  const toCue = useCue(spec.to ? spec.to[0] : spec.from[0], spec.to ? spec.to[1] ?? 0 : 0);
  return (
    <>
      <Swish at={from} />
      {spec.to ? <Swish at={toCue - 6 - OUT} /> : null}
    </>
  );
};

export const Inserts: React.FC<{dur: number}> = ({dur}) => {
  const {id} = useContext(SceneCtx);
  const list = PLAN[id] ?? [];
  const base = SCENE_IDS.indexOf(id) * 3;
  return (
    <>
      {list.map((spec, i) => (
        <Insert key={i} spec={spec} n={base + i} dur={dur} />
      ))}
    </>
  );
};

export const InsertAudio: React.FC<{dur: number}> = ({dur}) => {
  const {id} = useContext(SceneCtx);
  const list = PLAN[id] ?? [];
  return (
    <>
      {list.map((spec, i) => (
        <InsertSounds key={i} spec={spec} dur={dur} />
      ))}
    </>
  );
};
