import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {WORDS} from './timeline';
import {FONT} from './ui';

// Mots mis en valeur (jaune) : chiffres et mots-clés de l'histoire.
const KEYWORDS = /^(eponge|eponges|plumes-eponges|ganga|gangas|desert|45|degres|soleil|eau|poussins|petits|kilometres|dizaines|centaines|predateurs|secret|spirale|poitrine|25|millilitres|15|minutes|4|biberon|goutte|vie|survie|infatigable|abonne-toi)$/;

const clean = (w: string) =>
  w
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]/g, '');

// Sous-titres mot par mot : un seul mot à l'écran, qui « rebondit » à chaque nouveau mot.
export const Subtitles: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  let idx = -1;
  for (let i = 0; i < WORDS.length; i++) {
    const s = WORDS[i].s * k;
    const next = i + 1 < WORDS.length ? WORDS[i + 1].s * k : Infinity;
    // le mot reste affiché jusqu'au suivant, sauf pendant une longue pause
    const end = Math.min(next, WORDS[i].e * k + 0.6);
    if (t >= s && t < end) {
      idx = i;
      break;
    }
    if (s > t) break;
  }
  if (idx === -1) return null;
  const word = WORDS[idx];
  const text = word.w.replace(/[.,…]+$/, '').replace(/^« |»$/g, '').trim();
  const pop = spring({frame: frame - Math.round(word.s * k * fps), fps, config: {damping: 9, stiffness: 300, mass: 0.5}});
  const hl = KEYWORDS.test(clean(text));
  const size = Math.min(150, 960 / (Math.max(4, text.length) * 0.64));
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 260,
          left: 40,
          right: 40,
          height: 260,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
          fontSize: size,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          color: hl ? '#FFD600' : '#fff',
          WebkitTextStroke: `${Math.round(size * 0.16)}px #16121F`,
          paintOrder: 'stroke fill',
          textShadow: `0 ${Math.round(size * 0.09)}px 0 rgba(0,0,0,0.35)`,
          transform: `scale(${0.6 + pop * 0.4}) rotate(${(idx % 3) - 1}deg)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
