import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {WORDS} from './timeline';
import {FONT} from './ui';

// Mots mis en valeur (jaune) : chiffres et mots-clés de l'histoire.
const KEYWORDS = /^(besoins|chaise|anglaise|vivante|jungle|insectes|rituel|secret|matin|borneo|toupaye|mini-ecureuil|toilettes|carnivores|carnivore|geante|nepenthes|cuvette|rebord|couvercle|expres|deal|bizarre|nectar|bonbon|petit-dej|tresor|pauvres|crottes|azote|engrais|regale|contrat|attention|pieges|mortels|fourmis|pluie|goutte|vibre|glisse|jamais|hotel|chauve-souris|chauves-souris|chambre|nuit|excrements|incroyables|extraordinaire|abonne-toi)$/;

const clean = (w: string) =>
  w
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]/g, '');

type W = (typeof WORDS)[number];

// Regroupe les mots en petites lignes de 1 à 3 mots, coupées après la ponctuation.
const LINES: W[][] = [];
{
  let cur: W[] = [];
  for (const w of WORDS) {
    if (!w.w) {
      if (cur.length) LINES.push(cur);
      cur = [];
      continue;
    }
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 18 || cur[0].scene !== w.scene)) {
      LINES.push(cur);
      cur = [];
    }
    cur.push(w);
    if (/[.,!?…:;]$/.test(w.w)) {
      LINES.push(cur);
      cur = [];
    }
  }
  if (cur.length) LINES.push(cur);
}

const tidy = (w: string) => w.replace(/[.,…]+$/, '').replace(/^« |»$/g, '').trim();

// Sous-titres en pastille (2-3 mots), placés dans le bas de l'image ; le mot prononcé est surligné en jaune.
export const Subtitles: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const li = LINES.findIndex((line, i) => {
    const next = LINES[i + 1];
    const last = line[line.length - 1];
    const end = next && next[0].s * k - last.e * k < 0.7 ? next[0].s * k : last.e * k + 0.5;
    return t >= line[0].s * k && t < end;
  });
  if (li === -1) return null;
  const line = LINES[li];
  const enter = spring({frame: frame - Math.round(line[0].s * k * fps), fps, config: {damping: 12, stiffness: 240, mass: 0.6}});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 30, right: 30, top: 1400, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            background: '#FFFFFF',
            border: '9px solid #16121F',
            borderRadius: 60,
            padding: '14px 26px 6px',
            boxShadow: '0 12px 0 rgba(0,0,0,0.25)',
            fontFamily: FONT,
            fontSize: 74,
            lineHeight: 1.05,
            color: '#16121F',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            transform: `scale(${0.7 + enter * 0.3})`,
            opacity: Math.min(1, enter * 3),
          }}
        >
          {line.map((w, i) => {
            const active = t >= w.s * k && (i === line.length - 1 || t < line[i + 1].s * k);
            const hl = KEYWORDS.test(clean(tidy(w.w)));
            return (
              <span
                key={i}
                style={{
                  padding: '2px 12px 0',
                  borderRadius: 18,
                  background: active ? '#FFD600' : 'transparent',
                  color: hl && !active ? '#E65100' : '#16121F',
                  transform: `scale(${active ? 1.06 : 1})`,
                  display: 'inline-block',
                }}
              >
                {tidy(w.w)}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
