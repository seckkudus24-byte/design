import React from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const FONT = 'LuckiestGuy';

const fontHandle = delayRender('Chargement de la police');
const fontFace = new FontFace(FONT, `url(${staticFile('fonts/LuckiestGuy.woff2')}) format('woff2')`);
fontFace
  .load()
  .then(() => {
    document.fonts.add(fontFace);
    continueRender(fontHandle);
  })
  .catch((err) => {
    console.error(err);
    continueRender(fontHandle);
  });

export const usePop = (delay = 0, damping = 11) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, stiffness: 160, mass: 0.7}});
};

// Phrase clé en gros. Les mots entre *étoiles* sont surlignés.
export const Caption: React.FC<{
  text: string;
  size?: number;
  top?: number;
  delay?: number;
  highlight?: string;
  color?: string;
}> = ({text, size = 96, top = 170, delay = 6, highlight = '#FFD600', color = '#fff'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 60,
        right: 60,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: size * 0.28,
        rowGap: size * 0.05,
        fontFamily: FONT,
        fontSize: size,
        lineHeight: 1.12,
        textAlign: 'center',
        textTransform: 'uppercase',
      }}
    >
      {words.map((w, i) => {
        const hl = w.includes('*');
        const clean = w.replace(/\*/g, '');
        const s = spring({frame: frame - delay - i * 3, fps, config: {damping: 10, stiffness: 180, mass: 0.6}});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              color: hl ? highlight : color,
              WebkitTextStroke: `${Math.round(size * 0.16)}px #16121F`,
              paintOrder: 'stroke fill',
              textShadow: `0 ${size * 0.09}px 0 rgba(0,0,0,0.35)`,
              transform: `scale(${s}) rotate(${hl ? Math.sin(frame * 0.15 + i) * 3 : 0}deg)`,
              opacity: Math.min(1, s * 2),
            }}
          >
            {clean}
          </span>
        );
      })}
    </div>
  );
};

// Conteneur de scène : entrée "punch" + flash blanc.
export const Scene: React.FC<{bg: string; children: React.ReactNode; first?: boolean}> = ({bg, children, first = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const scale = first ? 1 : interpolate(s, [0, 1], [1.12, 1]);
  const flash = first ? 0 : interpolate(frame, [0, 7], [0.85, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${scale})`}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};

// Bulle de BD.
export const Bubble: React.FC<{text: string; x: number; y: number; delay?: number; size?: number; tail?: 'left' | 'right'}> = ({
  text,
  x,
  y,
  delay = 0,
  size = 64,
  tail = 'left',
}) => {
  const s = usePop(delay, 9);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${s})`,
        transformOrigin: tail === 'left' ? '10% 100%' : '90% 100%',
        background: '#fff',
        border: '8px solid #16121F',
        borderRadius: 40,
        padding: '18px 34px',
        fontFamily: FONT,
        fontSize: size,
        color: '#16121F',
        whiteSpace: 'nowrap',
        boxShadow: '0 10px 0 rgba(0,0,0,0.25)',
      }}
    >
      {text}
      <div
        style={{
          position: 'absolute',
          bottom: -34,
          [tail === 'left' ? 'left' : 'right']: 40,
          width: 0,
          height: 0,
          borderLeft: '20px solid transparent',
          borderRight: '20px solid transparent',
          borderTop: '34px solid #16121F',
        }}
      />
    </div>
  );
};

// Positionne un élément (centre) en pixels.
export const Place: React.FC<{x: number; y: number; children: React.ReactNode; scale?: number; flip?: boolean; rotate?: number}> = ({
  x,
  y,
  children,
  scale = 1,
  flip = false,
  rotate = 0,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${flip ? -scale : scale}, ${scale}) rotate(${rotate}deg)`,
    }}
  >
    {children}
  </div>
);

// Bandeau d'eau (rivière) avec vaguelettes animées, en SVG plein écran.
export const Water: React.FC<{top: number; color?: string; opacity?: number; frame: number}> = ({
  top,
  color = '#29B6F6',
  opacity = 1,
  frame,
}) => {
  const x0 = -180 + ((frame * 2) % 90);
  let d = `M ${x0} ${top}`;
  for (let i = 0; i < 16; i++) {
    const x = x0 + i * 90;
    d += ` Q ${x + 22} ${top - 16} ${x + 45} ${top} T ${x + 90} ${top}`;
  }
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <path d={`${d} L 1300 1920 L ${x0} 1920 Z`} fill={color} opacity={opacity} />
      <path d={d} stroke="#fff" strokeWidth={8} fill="none" opacity={0.6 * opacity} />
    </svg>
  );
};

// Progression 0..1 entre deux fractions de la scène (adoucie).
export const prog = (frame: number, dur: number, a: number, b: number) =>
  interpolate(frame / dur, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => t * t * (3 - 2 * t),
  });

export const Sun: React.FC<{x: number; y: number; r?: number; frame: number}> = ({x, y, r = 80, frame}) => (
  <svg width={r * 3} height={r * 3} style={{position: 'absolute', left: x - r * 1.5, top: y - r * 1.5, overflow: 'visible'}}>
    <g transform={`rotate(${frame * 1.2} ${r * 1.5} ${r * 1.5})`}>
      {Array.from({length: 10}, (_, i) => (
        <rect key={i} x={r * 1.5 - 8} y={r * 0.05} width={16} height={r * 0.35} rx={8} fill="#FFD54F" transform={`rotate(${i * 36} ${r * 1.5} ${r * 1.5})`} />
      ))}
    </g>
    <circle cx={r * 1.5} cy={r * 1.5} r={r} fill="#FFEB3B" stroke="#F9A825" strokeWidth={8} />
  </svg>
);

export const Moon: React.FC<{x: number; y: number; r?: number; bg: string}> = ({x, y, r = 70, bg}) => (
  <svg width={r * 2} height={r * 2} style={{position: 'absolute', left: x - r, top: y - r, overflow: 'visible'}}>
    <circle cx={r} cy={r} r={r} fill="#FFF9C4" />
    <circle cx={r * 1.45} cy={r * 0.7} r={r * 0.85} fill={bg} />
  </svg>
);
