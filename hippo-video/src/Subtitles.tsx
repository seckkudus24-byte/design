import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import words from './subtitles.json';
import {FONT} from './ui';

type Word = {w: string; s: number; e: number};

const MAX_WORDS = 3;
const MAX_CHARS = 16;

// Regroupe les mots en petits blocs de sous-titres (coupés après la ponctuation).
const chunks: Word[][] = [];
let cur: Word[] = [];
for (const word of words as Word[]) {
  const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + word.w.length;
  if (cur.length && (cur.length >= MAX_WORDS || len > MAX_CHARS)) {
    chunks.push(cur);
    cur = [];
  }
  cur.push(word);
  if (/[.,:;!?…]$/.test(word.w)) {
    chunks.push(cur);
    cur = [];
  }
}
if (cur.length) chunks.push(cur);

// Sous-titres façon TikTok : un petit bloc à la fois, le mot prononcé passe en jaune.
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = chunks.findIndex((c, i) => {
    const next = chunks[i + 1];
    const end = next && next[0].s - c[c.length - 1].e < 0.6 ? next[0].s : c[c.length - 1].e + 0.4;
    return t >= c[0].s && t < end;
  });
  if (idx === -1) return null;
  const chunk = chunks[idx];
  const enter = spring({frame: frame - Math.round(chunk[0].s * fps), fps, config: {damping: 12, stiffness: 220, mass: 0.6}});
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 250,
          left: 50,
          right: 50,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          rowGap: 4,
          fontFamily: FONT,
          fontSize: 104,
          lineHeight: 1.1,
          textTransform: 'uppercase',
          transform: `scale(${0.75 + enter * 0.25}) rotate(${(idx % 2 ? 1 : -1) * 1.5}deg)`,
          opacity: Math.min(1, enter * 4),
        }}
      >
        {chunk.map((w, i) => {
          const active = t >= w.s && (t < w.e || i === chunk.length - 1 || t < chunk[i + 1].s);
          const pop = spring({frame: frame - Math.round(w.s * fps), fps, config: {damping: 10, stiffness: 260, mass: 0.5}});
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                margin: '0 22px',
                whiteSpace: 'nowrap',
                color: active ? '#FFD600' : '#fff',
                WebkitTextStroke: '17px #16121F',
                paintOrder: 'stroke fill',
                textShadow: '0 9px 0 rgba(0,0,0,0.35)',
                transform: `scale(${active ? 1 + 0.08 * pop : 1})`,
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
