import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {SceneProps} from '../PinsonVideo';
import {useCue} from '../cue';
import {BloodDrop, Booby, Finch, GROUND_Y, INK, IslandBg} from '../characters/Galapagos';
import {StickMan} from '../characters/StickMan';
import {FONT, Place, Scene, prog, ramp, usePop} from '../ui';
import {TopBadge} from './common';

export const boobyOn = (y: number, w: number) => y - 0.382 * w;
export const finchOn = (y: number, w: number) => y - 0.373 * w;

// Le fou (à droite) et le pinson qui pique la base de sa queue (à gauche).
export const Duo: React.FC<{frame: number; drink?: boolean; fangs?: boolean; mood?: 'calm' | 'relaxed' | 'annoyed' | 'tired' | 'love'; bx?: number; towel?: boolean; tailUp?: boolean}> = ({
  frame,
  drink = true,
  fangs = false,
  mood = 'calm',
  bx = 640,
  towel = false,
  tailUp = false,
}) => {
  const w = 640;
  const s = w / 440;
  const by = boobyOn(GROUND_Y + 40, w);
  const tailX = bx + (60 - 180) * s;
  return (
    <>
      <Place x={bx} y={by}>
        <Booby frame={frame} width={w} mood={mood} tailUp={tailUp} />
      </Place>
      <Place x={tailX - 70} y={finchOn(GROUND_Y + 40, 250)}>
        <Finch frame={frame} width={250} peck={drink} fangs={fangs} towel={towel} mood={drink ? 'hungry' : 'happy'} />
      </Place>
      {drink
        ? [0, 1].map((i) => {
            const k = ((frame + i * 20) % 40) / 40;
            return (
              <Place key={i} x={tailX - 10 + i * 14} y={by + 120 + k * 90} scale={0.5 * (1 - k)}>
                <BloodDrop size={60} />
              </Place>
            );
          })
        : null}
    </>
  );
};

// ---------- 1. Titre ----------
export const Titre: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const sang = useCue('sang');
  return (
    <Scene first bg="#4FC3F7">
      <IslandBg frame={frame} />
      <Duo frame={frame} drink={frame > sang} />
      <TopBadge s={usePop(sang, 9)} color="#FF8A80">
        IL BOIT SON SANG ?!
      </TopBadge>
    </Scene>
  );
};

// ---------- 2. Film d'horreur ----------
export const Horreur: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const flash = frame % 45 < 3 ? 1 : 0;
  return (
    <Scene bg="#1A0F2E">
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, #4A148C, #0D0618 70%)'}} />
      <div style={{position: 'absolute', left: 640, top: 620, width: 260, height: 260, borderRadius: '50%', background: '#FFF9C4', boxShadow: '0 0 80px #FFF9C4'}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M-20 1500 Q 300 1380 540 1460 Q 800 1380 1100 1500 L 1100 1940 L -20 1940 Z" fill="#0D0618" />
      </svg>
      <Place x={540} y={1130} scale={0.9 + usePop(4, 9) * 0.2}>
        <Finch frame={frame} width={520} fangs cape mood="sneaky" />
      </Place>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1400, textAlign: 'center', fontFamily: FONT, fontSize: 110, color: '#E53935', WebkitTextStroke: `12px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${usePop(10, 9)})`}}>
        HORREUR
      </div>
      <div style={{position: 'absolute', inset: 0, background: '#FFFFFF', opacity: flash * 0.6}} />
      <TopBadge s={usePop(4, 9)} color="#FFFFFF">
        UN FILM D'HORREUR ?
      </TopBadge>
    </Scene>
  );
};

// ---------- 3. Le vampire des Galápagos ----------
export const Vampire: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const plus = useCue('plus');
  const laisse = useCue('laisse');
  const late = frame > plus - 10;
  return (
    <Scene bg="#4FC3F7">
      <IslandBg frame={frame} dusk={late ? 0 : 0.7} />
      {late ? (
        <Duo frame={frame} fangs mood="calm" />
      ) : (
        <Place x={540} y={finchOn(GROUND_Y + 60, 460)}>
          <Finch frame={frame} width={460} fangs cape mood="sneaky" />
        </Place>
      )}
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, plus - 16, plus - 10))} color="#CE93D8" size={60}>
        LE VAMPIRE DES GALÁPAGOS
      </TopBadge>
      <TopBadge s={usePop(laisse, 9)} color="#FFFFFF">
        ET IL LE LAISSE FAIRE !
      </TopBadge>
    </Scene>
  );
};

// ---------- 4. Pourquoi boire du sang ? ----------
export const Pourquoi: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <Scene bg="#4FC3F7">
      <IslandBg frame={frame} dry={0.3} />
      <Place x={540} y={finchOn(GROUND_Y + 60, 420)}>
        <Finch frame={frame} width={420} mood="sad" />
      </Place>
      <div style={{position: 'absolute', left: 0, right: 0, top: 850, textAlign: 'center', fontFamily: FONT, fontSize: 200, color: '#FFEB3B', WebkitTextStroke: `20px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${usePop(8, 7)}) rotate(${Math.sin(frame * 0.1) * 8}deg)`}}>?</div>
      <TopBadge s={usePop(4, 9)} color="#FFFFFF">
        POURQUOI BOIRE DU SANG ?
      </TopBadge>
    </Scene>
  );
};

// ---------- 5. Au début, c'était un service ----------
export const Service: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <Scene bg="#4FC3F7">
      <IslandBg frame={frame} />
      <Duo frame={frame} drink={false} towel mood="relaxed" tailUp />
      <TopBadge s={usePop(4, 9)} color="#A5D6A7">
        AU DÉBUT : UN SERVICE
      </TopBadge>
    </Scene>
  );
};

// ---------- 6. Puis tout a dérapé ----------
export const Derape: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <Scene bg="#4A148C">
      <IslandBg frame={frame} dusk={0.9} />
      <Duo frame={frame} drink={frame > 20} fangs={frame > 20} mood="calm" />
      <TopBadge s={usePop(4, 9)} color="#FF8A80">
        PUIS TOUT A DÉRAPÉ…
      </TopBadge>
    </Scene>
  );
};

// ---------- 7. Pourquoi il ne réagit pas ? ----------
export const Reagit: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const alors = useCue('alors');
  return (
    <Scene bg="#4FC3F7">
      <IslandBg frame={frame} />
      <Duo frame={frame} fangs mood={frame > alors ? 'relaxed' : 'calm'} />
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, alors - 6, alors))} color="#FFFFFF" size={60}>
        POURQUOI IL NE RÉAGIT PAS ?
      </TopBadge>
      <TopBadge s={usePop(alors, 9)} color="#FFE082">
        IL LE LAISSE FAIRE…
      </TopBadge>
    </Scene>
  );
};

// ---------- 8. Conclusion ----------
export const Conclusion: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <Scene bg="#4FC3F7">
      <IslandBg frame={frame} dusk={0.4} dry={0.5} />
      <Place x={540} y={finchOn(GROUND_Y + 60, 440)}>
        <Finch frame={frame} width={440} fangs mood="happy" />
      </Place>
      <TopBadge s={usePop(4, 9)} color="#FFFFFF">
        CONCLUSION
      </TopBadge>
    </Scene>
  );
};

// ---------- 9. Et toi ? ----------
export const Question: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const aider = useCue("t'aider");
  return (
    <Scene bg="#FFF3E0">
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#FFE0B2, #FFCC80)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1500, bottom: 0, background: '#A1887F', borderTop: `10px solid ${INK}`}} />
      <Place x={340} y={1280}>
        <StickMan frame={frame} pose="idle" height={460} />
      </Place>
      <Place x={720} y={1280}>
        <StickMan frame={frame + 5} pose={frame > aider ? 'thumbs' : 'wave'} height={460} />
      </Place>
      <div style={{position: 'absolute', left: 430, top: 1140, width: 200, height: 150, background: '#D7A86E', border: `8px solid ${INK}`, borderRadius: 10, transform: `scale(${usePop(aider, 9)})`}} />
      <TopBadge s={usePop(4, 9) * (1 - ramp(frame, aider - 6, aider))} color="#FFFFFF" size={84}>
        ET TOI ?
      </TopBadge>
      <TopBadge s={usePop(aider, 9)} color="#A5D6A7">
        IL T'A AIDÉ AU DÉBUT…
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
    <Scene bg="#4FC3F7">
      <IslandBg frame={frame} />
      <Duo frame={frame} drink={false} mood="relaxed" />
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
