import React, {useContext} from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {SceneCtx, useCue} from './cue';
import {SCENE_IDS} from './timeline';
import {PLAN} from './inserts';
import type {Spec} from './shotkit';

// Plans d'insert : toutes les 3 à 5 s, un nouveau tableau plein écran vient couvrir la scène
// principale (avec une transition), puis on y revient.
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
