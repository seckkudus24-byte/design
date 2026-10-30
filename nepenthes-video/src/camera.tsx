import React, {useContext} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {SceneCtx} from './cue';
import {FPS, SCENE_IDS, WORDS} from './timeline';

// ---------- 1. Changements de plan à l'intérieur d'une scène ----------

type Framing = {s: number; fx: number; fy: number; dx: number; dy: number; r: number};

// Cadrages (point de mire vers le haut de l'illustration pour garder les badges sous les sous-titres).
const FRAMINGS: Framing[] = [
  {s: 1, fx: 540, fy: 1000, dx: 0, dy: 0, r: 0}, // plan large
  {s: 1.3, fx: 540, fy: 1000, dx: 0, dy: 0, r: 0}, // plan moyen
  {s: 1.45, fx: 470, fy: 960, dx: 0, dy: 0, r: 0}, // gros plan gauche
  {s: 1.25, fx: 540, fy: 1000, dx: 0, dy: 0, r: -3}, // plan penché
  {s: 1.45, fx: 640, fy: 960, dx: 0, dy: 0, r: 0}, // gros plan droite
  {s: 1.3, fx: 540, fy: 1080, dx: 0, dy: 0, r: 2}, // contre-plongée
];

type Move = 'smooth' | 'whip' | 'punch';
const MOVES: Move[] = ['smooth', 'whip', 'punch'];
const MOVE_FRAMES = 9;
const MIN_SHOT = 50; // ~1,7 s
const MAX_SHOT = 95; // ~3,2 s

// Débuts de plan (frames relatives à la scène) : après chaque ponctuation, avec un plan
// toutes les ~3 s au maximum si la phrase est longue.
const shotStarts = (id: string, start: number, k: number, dur: number): number[] => {
  const cuts = WORDS.filter((w, i) => w.scene === id && i > 0 && /[.,!?…:;]$/.test(WORDS[i - 1].w) && WORDS[i - 1].scene === id)
    .map((w) => Math.round(w.s * k * FPS) - start)
    .filter((f) => f > 0 && f < dur - 20);
  const out = [0];
  for (const c of cuts) if (c - out[out.length - 1] >= MIN_SHOT) out.push(c);
  // complète les trous trop longs
  const filled = [0];
  for (let i = 1; i <= out.length; i++) {
    const next = i < out.length ? out[i] : dur;
    let last = filled[filled.length - 1];
    while (next - last > MAX_SHOT + MIN_SHOT) {
      last += MAX_SHOT;
      filled.push(last);
    }
    if (i < out.length) filled.push(next);
  }
  return filled;
};

const toCss = (f: Framing, drift: number) => {
  const s = f.s * (1 + drift * 0.03);
  return {transformOrigin: `${f.fx}px ${f.fy}px`, transform: `translate(${f.dx}px, ${f.dy}px) rotate(${f.r}deg) scale(${s})`, s, r: f.r};
};

export const Camera: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const frame = useCurrentFrame();
  const {id, start, k} = useContext(SceneCtx);
  const sceneIndex = SCENE_IDS.indexOf(id as (typeof SCENE_IDS)[number]);
  const starts = shotStarts(id, start, k, dur);
  let i = 0;
  while (i + 1 < starts.length && frame >= starts[i + 1]) i++;
  const pick = (n: number) => FRAMINGS[(n + sceneIndex * 2) % FRAMINGS.length];
  const cur = pick(i);
  const prev = pick(Math.max(0, i - 1));
  const shotLen = (i + 1 < starts.length ? starts[i + 1] : dur) - starts[i];
  const t = frame - starts[i];
  const drift = Math.min(1, t / Math.max(1, shotLen));
  const move = MOVES[(i + sceneIndex) % MOVES.length];
  const p = i === 0 ? 1 : interpolate(t, [0, MOVE_FRAMES], [0, 1], {extrapolateRight: 'clamp', easing: Easing.bezier(0.65, 0, 0.35, 1)});
  // interpolation entre l'ancien cadrage et le nouveau
  const lerp = (a: number, b: number) => a + (b - a) * p;
  const f: Framing = {
    s: lerp(prev.s, cur.s) * (move === 'punch' ? 1 + Math.sin(p * Math.PI) * 0.05 : 1),
    fx: lerp(prev.fx, cur.fx),
    fy: lerp(prev.fy, cur.fy),
    dx: lerp(prev.dx, cur.dx) + (move === 'whip' ? Math.sin(p * Math.PI) * (i % 2 ? 160 : -160) : 0),
    dy: lerp(prev.dy, cur.dy),
    r: lerp(prev.r, cur.r),
  };
  const blur = move === 'whip' && p < 1 ? Math.sin(p * Math.PI) * 10 : 0;
  const css = toCss(f, drift);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: css.transform, transformOrigin: css.transformOrigin, filter: blur ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 2. Transitions entre les scènes ----------

export const TRANSITION_FRAMES = 14;
type Kind = 'circle' | 'wipe' | 'slide' | 'diagonal' | 'zoom';
const KINDS: Kind[] = ['circle', 'wipe', 'slide', 'diagonal', 'zoom'];

// La scène entrante apparaît par-dessus la précédente (qui continue de jouer dessous).
export const Reveal: React.FC<{index: number; children: React.ReactNode}> = ({index, children}) => {
  const frame = useCurrentFrame();
  if (index === 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = interpolate(frame, [0, TRANSITION_FRAMES], [0, 1], {extrapolateRight: 'clamp', easing: Easing.bezier(0.7, 0, 0.3, 1)});
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const kind = KINDS[(index - 1) % KINDS.length];
  let style: React.CSSProperties = {};
  if (kind === 'circle') style = {clipPath: `circle(${p * 125}% at 50% 58%)`};
  if (kind === 'wipe') style = {clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`};
  if (kind === 'slide') style = {transform: `translateY(${(1 - p) * 100}%)`, boxShadow: '0 -30px 60px rgba(0,0,0,0.35)'};
  if (kind === 'diagonal') {
    const x = -60 + p * 220;
    style = {clipPath: `polygon(0 0, ${x}% 0, ${x - 60}% 100%, 0 100%)`};
  }
  if (kind === 'zoom') style = {transform: `scale(${0.4 + p * 0.6}) rotate(${(1 - p) * -8}deg)`, opacity: Math.min(1, p * 2), borderRadius: (1 - p) * 80, overflow: 'hidden'};
  return (
    <AbsoluteFill style={style}>
      {children}
      {/* liseré de couleur qui suit le bord du volet */}
      {kind === 'wipe' ? <div style={{position: 'absolute', top: 0, bottom: 0, left: `${(1 - p) * 100}%`, width: 18, background: '#FFD600'}} /> : null}
    </AbsoluteFill>
  );
};
