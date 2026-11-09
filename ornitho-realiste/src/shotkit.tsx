import React from 'react';
import {interpolate, spring} from 'remotion';
import {FONT} from './ui';

// Outils communs pour les plans d'insert.
export const INK = '#2B2420';
export type P = {t: number; len: number};
export const pop = (t: number, d = 0, damping = 10) => spring({frame: t - d, fps: 30, config: {damping, stiffness: 160, mass: 0.7}});
export const rp = (t: number, a: number, b: number) => interpolate(t, [a, Math.max(a + 1, b)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x * (3 - 2 * x)});

// Fond BD : dégradé radial + rayons qui tournent doucement.
export const Burst: React.FC<{t: number; a: string; b: string; rays?: boolean}> = ({t, a, b, rays = true}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 62%, ${a} 0%, ${b} 75%)`}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 55%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.28) 100%)'}} />
    {rays ? (
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.09}}>
        <g transform={`translate(540 1190) rotate(${t * 0.3})`}>
          {Array.from({length: 16}, (_, i) => (
            <path key={i} d="M0 0 L-90 -1500 L90 -1500 Z" fill="#FFFFFF" transform={`rotate(${i * 22.5})`} />
          ))}
        </g>
      </svg>
    ) : null}
  </>
);

export const Snow: React.FC<{t: number; n?: number}> = ({t, n = 26}) => (
  <svg width={1080} height={1920} style={{position: 'absolute'}}>
    {Array.from({length: n}, (_, i) => {
      const x = (i * 197) % 1080;
      const y = ((i * 311 + t * (3 + (i % 3))) % 1500) + 450;
      return <circle key={i} cx={x + Math.sin(t * 0.05 + i) * 20} cy={y} r={6 + (i % 3) * 3} fill="#FFFFFF" opacity={0.85} />;
    })}
  </svg>
);

export const BigText: React.FC<{y: number; s: number; size?: number; color?: string; children: React.ReactNode}> = ({y, s, size = 120, color = '#FFFFFF', children}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: FONT, fontSize: size, color, WebkitTextStroke: `${size / 7}px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${s})`}}>
    {children}
  </div>
);


export type W = [string, number?];
export type Spec = {from: W; to?: W; C: React.FC<P>};
