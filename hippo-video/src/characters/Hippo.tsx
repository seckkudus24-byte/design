import React from 'react';

const INK = '#2E2346';
const BODY = '#A08CC8';
const BODY_DARK = '#8672B3';
const BELLY = '#C9B6E4';

type HippoProps = {
  frame: number;
  width?: number;
  walking?: boolean;
  // 0 = fermée, 1 = grande ouverte
  mouthOpen?: number;
  tailSpin?: boolean;
  happy?: boolean;
  style?: React.CSSProperties;
};

// Hippopotame cartoon vu de profil, tourné vers la droite.
export const Hippo: React.FC<HippoProps> = ({
  frame,
  width = 420,
  walking = false,
  mouthOpen = 0,
  tailSpin = false,
  happy = true,
  style,
}) => {
  const legSwing = (phase: number) =>
    walking ? Math.sin(frame * 0.35 + phase) * 16 : 0;
  const bob = walking ? Math.abs(Math.sin(frame * 0.35)) * -6 : Math.sin(frame * 0.08) * 2;
  const blink = frame % 75 < 4 ? 0.15 : 1;
  const tailAngle = tailSpin ? frame * 47 : Math.sin(frame * 0.2) * 22;

  const leg = (x: number, color: string, phase: number) => (
    <g transform={`rotate(${legSwing(phase)} ${x + 24} 195)`}>
      <rect x={x} y={180} width={50} height={80} rx={20} fill={color} stroke={INK} strokeWidth={6} />
      <path d={`M${x + 8} 252 h34`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    </g>
  );

  return (
    <svg viewBox="-20 -10 470 290" width={width} style={{overflow: 'visible', ...style}}>
      <g transform={`translate(0 ${bob})`}>
        {/* pattes du fond */}
        {leg(115, BODY_DARK, Math.PI)}
        {leg(265, BODY_DARK, 0)}

        {/* queue */}
        <g transform={`rotate(${tailAngle} 40 130)`}>
          <rect x={2} y={124} width={42} height={12} rx={6} fill={BODY} stroke={INK} strokeWidth={5} />
          <path d="M2 122 l-14 -8 M2 130 l-16 0 M2 138 l-14 8" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        </g>
        {tailSpin ? (
          <g opacity={0.7} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round">
            <path d="M-10 95 A45 45 0 0 0 -10 165" />
            <path d="M-28 82 A62 62 0 0 0 -28 178" strokeDasharray="14 12" />
          </g>
        ) : null}

        {/* corps */}
        <ellipse cx={180} cy={150} rx={145} ry={90} fill={BODY} stroke={INK} strokeWidth={6} />
        <ellipse cx={175} cy={200} rx={105} ry={30} fill={BELLY} />
        <ellipse cx={120} cy={110} rx={45} ry={18} fill="#fff" opacity={0.18} />

        {/* pattes de devant */}
        {leg(60, BODY, 0)}
        {leg(215, BODY, Math.PI)}

        {/* bouche + mâchoire */}
        <ellipse cx={352} cy={182} rx={48} ry={6 + mouthOpen * 30} fill="#8B1E3F" stroke={INK} strokeWidth={5} />
        <g transform={`rotate(${mouthOpen * 28} 300 172)`}>
          <ellipse cx={348} cy={190} rx={58} ry={24} fill={BODY} stroke={INK} strokeWidth={6} />
          <rect x={330} y={168} width={12} height={16} rx={3} fill="#fff" stroke={INK} strokeWidth={3} />
          <rect x={372} y={168} width={12} height={16} rx={3} fill="#fff" stroke={INK} strokeWidth={3} />
        </g>

        {/* tête */}
        <ellipse cx={305} cy={108} rx={62} ry={52} fill={BODY} stroke={INK} strokeWidth={6} />
        <ellipse cx={360} cy={148} rx={66} ry={46} fill={BODY} stroke={INK} strokeWidth={6} />
        <path d="M300 120 Q 320 165 300 178" fill={BODY} />
        <ellipse cx={333} cy={162} rx={14} ry={9} fill="#F48FB1" opacity={0.7} />

        {/* oreilles */}
        <g transform="rotate(-25 270 62)">
          <ellipse cx={270} cy={62} rx={11} ry={17} fill={BODY} stroke={INK} strokeWidth={5} />
          <ellipse cx={270} cy={64} rx={5} ry={9} fill="#F48FB1" />
        </g>

        {/* yeux */}
        {[300, 334].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={70} rx={17} ry={17 * blink} fill="#fff" stroke={INK} strokeWidth={5} />
            {blink > 0.5 ? <circle cx={x + 5} cy={72} r={7} fill={INK} /> : null}
            {blink > 0.5 ? <circle cx={x + 7} cy={69} r={2.5} fill="#fff" /> : null}
          </g>
        ))}
        {happy ? null : (
          <path d="M282 48 L314 58 M352 48 L322 58" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        )}

        {/* narines */}
        <ellipse cx={388} cy={118} rx={7} ry={5} fill={INK} />
        <ellipse cx={410} cy={126} rx={7} ry={5} fill={INK} />
      </g>
    </svg>
  );
};

// Tête d'hippo vue de face (pour les vues de dessus / gros plans).
export const HippoFace: React.FC<{frame: number; size?: number; style?: React.CSSProperties}> = ({
  frame,
  size = 200,
  style,
}) => {
  const blink = frame % 70 < 4 ? 0.15 : 1;
  return (
    <svg viewBox="0 0 200 200" width={size} style={{overflow: 'visible', ...style}}>
      <ellipse cx={45} cy={38} rx={14} ry={20} fill={BODY} stroke={INK} strokeWidth={5} />
      <ellipse cx={155} cy={38} rx={14} ry={20} fill={BODY} stroke={INK} strokeWidth={5} />
      <ellipse cx={100} cy={85} rx={68} ry={58} fill={BODY} stroke={INK} strokeWidth={6} />
      <ellipse cx={100} cy={138} rx={82} ry={50} fill={BODY} stroke={INK} strokeWidth={6} />
      {[72, 128].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={62} rx={15} ry={15 * blink} fill="#fff" stroke={INK} strokeWidth={5} />
          {blink > 0.5 ? <circle cx={x} cy={65} r={6} fill={INK} /> : null}
        </g>
      ))}
      <ellipse cx={75} cy={122} rx={9} ry={6} fill={INK} />
      <ellipse cx={125} cy={122} rx={9} ry={6} fill={INK} />
      <path d="M60 158 Q100 178 140 158" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      <circle cx={38} cy={140} r={10} fill="#F48FB1" opacity={0.7} />
      <circle cx={162} cy={140} r={10} fill="#F48FB1" opacity={0.7} />
    </svg>
  );
};
