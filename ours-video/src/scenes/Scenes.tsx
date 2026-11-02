import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps} from '../OursVideo';
import {useCue} from '../cue';
import {Backpack, Bear, GROUND_Y, INK, PineForest} from '../characters/Bear';
import {StickMan} from '../characters/StickMan';
import {FONT, Place, Scene, prog, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const bearOn = (y: number, w: number) => y - 0.341 * w;

// Randonneur allongé sur le côté (vu de profil), sac sur le dos.
export const HikerLying: React.FC<{frame: number; x: number; y: number; scale?: number}> = ({frame, x, y, scale = 1}) => (
  <>
    <Place x={x} y={y - 60 * scale} rotate={90} scale={scale}>
      <StickMan frame={0} pose="idle" height={460} />
    </Place>
    <Place x={x - 20 * scale} y={y - 150 * scale} rotate={90} scale={scale * 0.7}>
      <Backpack size={220} />
    </Place>
  </>
);

// ---------- 1. Titre ----------
export const Titre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const ours = useCue('ours');
  const roar = frame > ours && frame < ours + 40;
  return (
    <Scene first bg="#81D4FA">
      <PineForest frame={frame} />
      <Place x={260} y={GROUND_Y - 150}>
        <StickMan frame={frame} pose={roar ? 'surprised' : 'worried'} height={500} />
      </Place>
      <Place x={720} y={bearOn(GROUND_Y + 10, 702)} flip>
        <Bear frame={frame} width={702} pose={frame > ours ? 'stand' : 'walk'} roar={roar} mood="angry" />
      </Place>
      <TopBadge s={usePop(ours, 9)} color="#FFE082">
        FACE À UN OURS…
      </TopBadge>
    </Scene>
  );
};

// ---------- 2. Tout dépend de l'ours ----------
export const Technique: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const depend = useCue('depend');
  return (
    <Scene bg="#81D4FA">
      <PineForest frame={frame} />
      <Place x={230} y={bearOn(GROUND_Y + 20, 567)} scale={usePop(depend, 9)}>
        <Bear frame={frame} kind="grizzly" width={567} />
      </Place>
      <Place x={850} y={bearOn(GROUND_Y + 30, 486)} scale={usePop(depend + 8, 9)} flip>
        <Bear frame={frame + 9} kind="black" width={486} />
      </Place>
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', fontFamily: FONT, fontSize: 200, color: '#FFEB3B', WebkitTextStroke: `20px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${usePop(depend + 16, 7)}) rotate(${Math.sin(frame * 0.1) * 8}deg)`}}>?</div>
      <TopBadge s={usePop(depend, 9)} color="#FFFFFF">
        TOUT DÉPEND DE L'OURS !
      </TopBadge>
    </Scene>
  );
};

// ---------- 3. Comment les reconnaître ----------
export const Reconnaitre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const mx = 540 + Math.sin(frame * 0.06) * 260;
  return (
    <Scene bg="#81D4FA">
      <PineForest frame={frame} />
      <Place x={250} y={bearOn(GROUND_Y + 20, 567)}>
        <Bear frame={frame} kind="grizzly" width={567} />
      </Place>
      <Place x={820} y={bearOn(GROUND_Y + 30, 486)} flip>
        <Bear frame={frame + 9} kind="black" width={486} />
      </Place>
      <svg width={1080} height={1920} style={{position: 'absolute', transform: `scale(${usePop(6, 9)})`, transformOrigin: `${mx}px 1100px`}}>
        <circle cx={mx} cy={1080} r={110} fill="rgba(255,255,255,0.3)" stroke={INK} strokeWidth={16} />
        <path d={`M${mx + 78} ${1158} l 90 90`} stroke={INK} strokeWidth={34} strokeLinecap="round" />
        <path d={`M${mx + 78} ${1158} l 90 90`} stroke="#8D6E63" strokeWidth={20} strokeLinecap="round" />
      </svg>
      <TopBadge s={usePop(4, 9)} color="#FFE082">
        COMMENT LES RECONNAÎTRE ?
      </TopBadge>
    </Scene>
  );
};

// ---------- 4. Face à un grizzly : fais le mort ----------
export const Grizzly: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const si = useCue('bouges') - 10;
  const menace = useCue('menace');
  const partir = useCue('partir');
  const intro = frame < si;
  const approach = ramp(frame, si, menace);
  const leave = ramp(frame, partir - 20, partir + 40);
  return (
    <Scene bg="#81D4FA">
      <PineForest frame={frame} />
      {intro ? (
        <Place x={540} y={bearOn(GROUND_Y + 30, 756)}>
          <Bear frame={frame} kind="grizzly" width={756} pose="stand" roar={frame % 60 < 35} mood="angry" />
        </Place>
      ) : (
        <>
          <HikerLying frame={frame} x={360} y={GROUND_Y + 60} />
          <Place x={interpolate(leave, [0, 1], [interpolate(approach, [0, 1], [1000, 700]), 1300])} y={bearOn(GROUND_Y + 40, 594)} flip={leave === 0}>
            <Bear frame={frame} kind="grizzly" width={594} pose={leave > 0 ? 'walk' : 'sniff'} walking={approach < 1 || leave > 0} mood="calm" />
          </Place>
        </>
      )}
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, si - 6, si))} color="#FFB74D" size={62}>
        GRIZZLY : FAIS LE MORT !
      </TopBadge>
      <TopBadge s={usePop(si, 9) * (1 - ramp(frame, menace - 6, menace))} color="#FFFFFF">
        NE BOUGE PLUS…
      </TopBadge>
      <TopBadge s={usePop(menace, 9) * (1 - ramp(frame, partir - 6, partir))} color="#A5D6A7">
        PLUS UNE MENACE
      </TopBadge>
      <TopBadge s={usePop(partir, 9)} color="#A5D6A7">
        IL S'EN VA !
      </TopBadge>
    </Scene>
  );
};

// ---------- 5. Face à un ours noir : bats-toi ----------
export const Noir: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <Scene bg="#81D4FA">
      <PineForest frame={frame} />
      <Place x={260} y={GROUND_Y - 160}>
        <StickMan frame={frame} pose="cheer" height={550} />
      </Place>
      <Place x={650} y={bearOn(GROUND_Y + 20, 594)} flip>
        <Bear frame={frame} kind="black" width={594} pose="stand" roar={frame % 50 < 25} mood="angry" />
      </Place>
      <TopBadge s={usePop(4, 9)} color="#FF8A80" size={62}>
        OURS NOIR : BATS-TOI !
      </TopBadge>
    </Scene>
  );
};

// ---------- 6. Conclusion ----------
export const Conclusion: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const calme = useCue('calme');
  return (
    <Scene bg="#81D4FA">
      <PineForest frame={frame} dusk={0.5} />
      <div style={{position: 'absolute', left: 536, top: 640, width: 8, height: 1300, background: INK, opacity: 0.5}} />
      <HikerLying frame={frame} x={190} y={GROUND_Y + 80} scale={0.6} />
      <Place x={400} y={bearOn(GROUND_Y + 40, 300)}>
        <Bear frame={frame} kind="grizzly" width={300} pose="sit" mood="calm" />
      </Place>
      <Place x={700} y={GROUND_Y - 150}>
        <StickMan frame={frame} pose="cheer" height={475} />
      </Place>
      <Place x={940 + ramp(frame, calme, calme + 60) * 200} y={bearOn(GROUND_Y + 40, 300)} flip>
        <Bear frame={frame} kind="black" width={300} mood="scared" walking />
      </Place>
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, calme - 6, calme))} color="#FFFFFF">
        CONCLUSION
      </TopBadge>
      <TopBadge s={usePop(calme, 9)} color="#FFE082" size={60}>
        UN OURS, DEUX TECHNIQUES
      </TopBadge>
    </Scene>
  );
};

// ---------- 7. Et toi ? ----------
export const Question: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const mort = useCue('mort');
  const battrais = useCue('battrais');
  const hiL = frame >= mort && frame < battrais ? 1 : 0;
  const hiR = frame >= battrais ? 1 : 0;
  const card = (x: number, hi: number, color: string, label: string, child: React.ReactNode) => (
    <div style={{position: 'absolute', left: x, top: 720, width: 470, height: 880, borderRadius: 40, background: color, border: `10px solid ${INK}`, transform: `scale(${1 + hi * 0.06}) rotate(${hi * (x < 500 ? -2 : 2)}deg)`, opacity: hi || (!hiL && !hiR) ? 1 : 0.55, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', fontFamily: FONT, fontSize: 56, color: '#fff', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill'}}>{label}</div>
      {child}
    </div>
  );
  return (
    <Scene bg="#FFF3E0">
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(#FFF3E0, #FFB74D)'}} />
      {card(
        50,
        hiL,
        '#8D6E63',
        'FAIRE LE MORT',
        <>
          <div style={{position: 'absolute', left: 235, top: 560, transform: 'translate(-50%, -50%) rotate(90deg)'}}>
            <StickMan frame={0} pose="idle" height={300} />
          </div>
          <div style={{position: 'absolute', left: 70, top: 300}}>
            <Bear frame={frame} kind="grizzly" width={330} pose="sniff" />
          </div>
        </>,
      )}
      {card(
        560,
        hiR,
        '#E53935',
        'SE BATTRE',
        <>
          <div style={{position: 'absolute', left: 30, top: 300}}>
            <StickMan frame={frame} pose="cheer" height={380} />
          </div>
          <div style={{position: 'absolute', left: 170, top: 420, transform: 'scaleX(-1)'}}>
            <Bear frame={frame} kind="black" width={280} mood="scared" />
          </div>
        </>,
      )}
      <TopBadge s={usePop(4, 9)} color="#FFFFFF" size={84}>
        ET TOI ?
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
      <PineForest frame={frame} />
      <Place x={300} y={bearOn(GROUND_Y + 20, 400)}>
        <Bear frame={frame} kind="grizzly" width={400} pose="sit" />
      </Place>
      <Place x={800} y={bearOn(GROUND_Y + 30, 340)} flip>
        <Bear frame={frame + 9} kind="black" width={340} pose="sit" />
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
