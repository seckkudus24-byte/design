import React from "react";
import { Easing, useVideoConfig } from "remotion";
import { useMap } from "../map/MapStage";
import { countryPath, coastPaths, toD } from "../map/geo";
import { FLAGS } from "../flags";
import { T } from "../timeline";
import { STYLE } from "../config/style";
import type * as O from "./types";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const out = Easing.bezier(0.16, 1, 0.3, 1);
const back = Easing.bezier(0.34, 1.56, 0.64, 1);
const FADE = 0.4;

type P = { t: number; local: number; alpha: number; uid: string };

/* ---------- Pays ---------- */
const Country: React.FC<{ o: O.CountryO } & P> = ({ o, t, local, alpha, uid }) => {
  const { project } = useMap();
  const { d, box } = countryPath(o.id, project);
  const drawDur = o.draw ?? 0.6;
  const drawP = out(clamp(local / drawDur));
  const fillP = out(clamp((local - (o.fillDelay ?? drawDur * 0.6)) / 0.5));
  const outline = o.outline === undefined ? STYLE.glow : o.outline;
  const sh = o.shift ? out(clamp((t - T(o.shift.from)) / Math.max(0.01, T(o.shift.to) - T(o.shift.from)))) : 0;
  const tx = (o.shift?.dx ?? 0) * sh, ty = (o.shift?.dy ?? 0) * sh;
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const sc = 1 + 0.05 * (1 - fillP);
  const pad = 0.08;
  const fb = { x: box.x - box.w * pad, y: box.y - box.h * pad, w: box.w * (1 + 2 * pad), h: box.h * (1 + 2 * pad) };
  const period = Math.max(120, Math.min(box.w, box.h) * 0.9);
  const phase = (t * period * 0.45) % (period * 2);
  const wave = o.wave ?? !!o.flag;
  return (
    <g opacity={alpha} transform={`translate(${tx} ${ty})`}>
      <defs>
        <clipPath id={`c${uid}`}><path d={d} fillRule="evenodd" /></clipPath>
        <filter id={`w${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency={`${(3 / Math.max(fb.w, 50)).toFixed(4)} ${(6 / Math.max(fb.h, 50)).toFixed(4)}`} numOctaves={2} seed={4} />
          <feDisplacementMap in="SourceGraphic" scale={wave ? Math.min(fb.w, fb.h) * (0.05 + 0.03 * Math.sin(t * 2.4)) : 0} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id={`b${uid}`} gradientUnits="userSpaceOnUse" x1={fb.x} y1={fb.y} x2={fb.x + period} y2={fb.y + period * 0.55}
          spreadMethod="repeat" gradientTransform={`translate(${phase} 0)`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.32" />
          <stop offset="0.25" stopColor="#000" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="0.75" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </linearGradient>
      </defs>
      {(o.flag || o.fill) && fillP > 0 && (
        <g opacity={fillP * (o.opacity ?? 0.97)} style={{ filter: "drop-shadow(0 10px 8px rgba(0,0,0,0.55))" }}>
          <g clipPath={`url(#c${uid})`}>
            <g transform={`translate(${cx} ${cy}) scale(${sc}) translate(${-cx} ${-cy})`}>
              <g filter={wave ? `url(#w${uid})` : undefined}>
                {o.flag ? (
                  <svg x={fb.x} y={fb.y} width={fb.w} height={fb.h} viewBox="0 0 300 200" preserveAspectRatio="none">{FLAGS[o.flag]}</svg>
                ) : (
                  <rect x={fb.x} y={fb.y} width={fb.w} height={fb.h} fill={o.fill} />
                )}
              </g>
              {wave && <rect x={fb.x} y={fb.y} width={fb.w} height={fb.h} fill={`url(#b${uid})`} style={{ mixBlendMode: "overlay" }} />}
            </g>
          </g>
        </g>
      )}
      {outline && (
        <path d={d} fill="none" stroke={outline} strokeWidth={STYLE.outlineWidth} strokeLinejoin="round" pathLength={1}
          strokeDasharray="1 1" strokeDashoffset={1 - drawP}
          style={{ filter: `drop-shadow(0 0 5px ${outline}) drop-shadow(0 0 14px ${outline})` }} />
      )}
    </g>
  );
};

/* ---------- Étiquette ---------- */
const Label: React.FC<{ o: O.LabelO } & P> = ({ o, local, alpha }) => {
  const { project } = useMap();
  const [x, y] = project(o.at);
  const bx = x + (o.dx ?? 0), by = y + (o.dy ?? -180);
  const lp = out(clamp(local / 0.3)), bp = out(clamp((local - 0.18) / 0.35));
  const size = o.size ?? 56;
  const chars = Math.round(o.text.length * clamp((local - 0.2) / 0.4));
  return (
    <>
      <svg style={{ position: "absolute", inset: 0, overflow: "visible", opacity: alpha }} width="100%" height="100%">
        <circle cx={x} cy={y} r={7 * lp} fill="#fff" />
        <line x1={x} y1={y} x2={x + (bx - x) * lp} y2={y + (by - y) * lp} stroke="#fff" strokeWidth={3} />
      </svg>
      <div style={{
        position: "absolute", left: bx, top: by, transform: `translate(-50%, -100%) scale(${0.8 + 0.2 * bp})`, transformOrigin: "50% 100%",
        opacity: bp * alpha, padding: "6px 22px 10px", border: "3px solid #fff", background: "rgba(8,12,20,0.38)",
        fontFamily: STYLE.labelFont, fontWeight: 600, fontSize: size, color: "#fff", whiteSpace: "nowrap", lineHeight: 1.1,
        textShadow: "0 2px 6px rgba(0,0,0,0.7)", boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
      }}>
        <span>{o.text.slice(0, chars)}</span><span style={{ opacity: 0 }}>{o.text.slice(chars)}</span>
      </div>
    </>
  );
};

/* ---------- Littoral ---------- */
const Coast: React.FC<{ o: O.CoastO } & P> = ({ o, t, local, alpha }) => {
  const { project } = useMap();
  const runs = coastPaths(o.id, project, o.clip);
  const p = out(clamp(local / 0.9));
  const color = o.color ?? STYLE.coast;
  const w = STYLE.coastWidth * (1 + 0.12 * Math.sin(t * 6));
  const longest = runs.reduce((a, r) => (r.length > a.length ? r : a), [] as [number, number][]);
  let label = null;
  if (o.text && longest.length > 1) {
    const a = longest[0], b = longest[longest.length - 1], m = longest[Math.floor(longest.length / 2)];
    let ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
    const n = ((ang + 90) * Math.PI) / 180, off = (o.textOffset ?? 70) * (o.side ?? 1);
    const tp = out(clamp((local - 0.6) / 0.4));
    label = (
      <div style={{
        position: "absolute", left: m[0] + Math.cos(n) * off, top: m[1] + Math.sin(n) * off,
        transform: `translate(-50%,-50%) rotate(${ang}deg) scale(${0.6 + 0.4 * back(tp)})`, opacity: tp * alpha,
        fontFamily: STYLE.labelFont, fontWeight: 700, fontSize: 64, color: "#fff", whiteSpace: "nowrap",
        textShadow: "0 0 10px rgba(0,0,0,.8), 0 3px 4px rgba(0,0,0,.9)",
      }}>{o.text}</div>
    );
  }
  return (
    <>
      <svg style={{ position: "absolute", inset: 0, opacity: alpha }} width="100%" height="100%">
        {runs.map((r, i) => (
          <g key={i}>
            <path d={toD(r)} fill="none" stroke="#fff" strokeWidth={w + 8} strokeLinecap="round" strokeLinejoin="round" opacity={0.55}
              pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} style={{ filter: "blur(4px)" }} />
            <path d={toD(r)} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"
              pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
          </g>
        ))}
      </svg>
      {label}
    </>
  );
};

/* ---------- Flèches ---------- */
const Arrows: React.FC<{ o: O.ArrowsO } & P> = ({ o, local, alpha }) => {
  const { project } = useMap();
  return (
    <svg style={{ position: "absolute", inset: 0, opacity: alpha, overflow: "visible" }} width="100%" height="100%">
      {o.points.map((pt, i) => {
        const p = out(clamp((local - i * 0.14) / 0.7));
        const [sx, sy] = project(pt);
        const ex = sx + o.dir[0], ey = sy + o.dir[1];
        const len = Math.hypot(o.dir[0], o.dir[1]);
        const nx = -o.dir[1] / len, ny = o.dir[0] / len, bend = o.bend ?? len * 0.35;
        const cxp = (sx + ex) / 2 + nx * bend, cyp = (sy + ey) / 2 + ny * bend;
        const ang = Math.atan2(ey - cyp, ex - cxp);
        const head = (dx: number, dy: number, c: string) => {
          const s = 30 * back(clamp((p - 0.8) / 0.2));
          const hx = ex + dx, hy = ey + dy;
          const pts = [[hx + Math.cos(ang) * s, hy + Math.sin(ang) * s], [hx + Math.cos(ang + 2.4) * s, hy + Math.sin(ang + 2.4) * s], [hx + Math.cos(ang - 2.4) * s, hy + Math.sin(ang - 2.4) * s]];
          return <polygon points={pts.map((q) => q.join(",")).join(" ")} fill={c} stroke="#fff" strokeWidth={2} />;
        };
        const curve = (dx: number, dy: number) => `M${sx + dx} ${sy + dy} Q${cxp + dx} ${cyp + dy} ${ex + dx} ${ey + dy}`;
        const off = 13;
        return (
          <g key={i} style={{ filter: "drop-shadow(0 4px 4px rgba(0,0,0,.5))" }}>
            <path d={curve(nx * off, ny * off)} fill="none" stroke={STYLE.arrowB} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
            <path d={curve(0, 0)} fill="none" stroke={STYLE.arrowA} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
            {head(nx * off, ny * off, STYLE.arrowB)}
            {head(0, 0, STYLE.arrowA)}
          </g>
        );
      })}
    </svg>
  );
};

/* ---------- Mesure ---------- */
const Measure: React.FC<{ o: O.MeasureO } & P> = ({ o, local, alpha }) => {
  const { project } = useMap();
  const [ax, ay] = project(o.a), [bx0, by0] = project(o.b);
  const dy = o.dy ?? -120, y = Math.min(ay, by0) + dy;
  const p = out(clamp(local / 0.8));
  const bx = ax + (bx0 - ax) * p;
  const tp = out(clamp((local - 0.5) / 0.4));
  return (
    <>
      <svg style={{ position: "absolute", inset: 0, opacity: alpha, overflow: "visible" }} width="100%" height="100%">
        <line x1={ax} y1={y} x2={bx - 20} y2={y} stroke="#fff" strokeWidth={10} strokeLinecap="round" style={{ filter: "drop-shadow(0 3px 4px rgba(0,0,0,.6))" }} />
        <polygon points={`${bx + 26},${y} ${bx - 24},${y - 24} ${bx - 24},${y + 24}`} fill={STYLE.coast} stroke="#fff" strokeWidth={3} />
      </svg>
      <div style={{
        position: "absolute", left: (ax + bx0) / 2, top: y - 18, transform: `translate(-50%,-100%) scale(${0.6 + 0.4 * back(tp)})`, opacity: tp * alpha,
        fontFamily: STYLE.labelFont, fontWeight: 700, fontSize: 84, color: "#fff", textShadow: "0 0 12px rgba(0,0,0,.7), 0 4px 4px rgba(0,0,0,.9)",
      }}>{o.text}</div>
    </>
  );
};

/* ---------- Cercle à main levée ---------- */
const Scribble: React.FC<{ o: O.ScribbleO } & P> = ({ o, local, alpha }) => {
  const { project } = useMap();
  const [x, y] = project(o.at);
  const p = out(clamp(local / 0.7));
  const pts: string[] = [];
  for (let i = 0; i <= 140; i++) {
    const a = (i / 140) * Math.PI * 2 * 2.2 - 1.2;
    const r = o.r * (1 + 0.12 * Math.sin(a * 1.7 + 1) + 0.05 * Math.sin(a * 5));
    pts.push(`${(x + Math.cos(a) * r * 1.15).toFixed(1)} ${(y + Math.sin(a) * r * 0.85).toFixed(1)}`);
  }
  const c = o.color ?? "#fff";
  return (
    <svg style={{ position: "absolute", inset: 0, opacity: alpha }} width="100%" height="100%">
      <path d={"M" + pts.join("L")} fill="none" stroke={c} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p}
        style={{ filter: `drop-shadow(0 0 6px ${c}) drop-shadow(0 2px 3px rgba(0,0,0,.6))` }} />
    </svg>
  );
};

/* ---------- Voile ---------- */
const Mask: React.FC<{ o: O.MaskO } & P> = ({ o, local, alpha }) => {
  const { project } = useMap();
  const { width, height } = useVideoConfig();
  const holes = o.except.map((id) => countryPath(id, project).d).join("");
  const p = out(clamp(local / 0.6));
  return (
    <svg style={{ position: "absolute", inset: 0 }} width="100%" height="100%">
      <path d={`M-50 -50H${width + 50}V${height + 50}H-50Z${holes}`} fillRule="evenodd" fill={o.color} opacity={(o.opacity ?? 0.8) * p * alpha} style={{ mixBlendMode: "multiply" }} />
      <path d={`M-50 -50H${width + 50}V${height + 50}H-50Z${holes}`} fillRule="evenodd" fill={o.color} opacity={0.35 * p * alpha} />
    </svg>
  );
};

/* ---------- Visage ---------- */
const Face: React.FC<{ o: O.FaceO } & P> = ({ o, t, local, alpha }) => {
  const { project } = useMap();
  const [x, y] = project(o.at);
  const s = (o.size / 100) * back(clamp(local / 0.45));
  const cry = o.mood === "cry";
  const tears = cry ? [0, 1, 2].map((k) => ((t * 1.3 + k / 3) % 1)) : [];
  return (
    <svg style={{ position: "absolute", inset: 0, opacity: alpha, overflow: "visible" }} width="100%" height="100%">
      <g transform={`translate(${x} ${y}) scale(${s})`} style={{ filter: "drop-shadow(0 3px 3px rgba(0,0,0,.5))" }} strokeLinecap="round">
        {[-1, 1].map((side) => (
          <g key={side}>
            <ellipse cx={side * 26} cy={-8} rx={16} ry={cry ? 12 : 15} fill="#fff" stroke="#111" strokeWidth={4} />
            <circle cx={side * 26 + (cry ? 0 : -side * 3)} cy={cry ? -4 : -6} r={6.5} fill="#111" />
            <path d={cry ? `M${side * 12} -30 L${side * 40} -36` : `M${side * 10} -32 L${side * 42} -22`} stroke="#111" strokeWidth={6} />
          </g>
        ))}
        {cry ? <path d="M-22 40 Q0 22 22 40" fill="none" stroke="#111" strokeWidth={6} />
          : <path d="M-24 28 Q0 12 24 28 L18 44 Q0 36 -18 44 Z" fill="#b3121b" stroke="#111" strokeWidth={4} />}
        {tears.map((p, k) => [-1, 1].map((side) => (
          <path key={`${k}${side}`} transform={`translate(${side * 30} ${8 + p * 90})`} opacity={1 - p}
            d="M0 -9 Q7 2 0 7 Q-7 2 0 -9Z" fill="#7fd0ff" stroke="#fff" strokeWidth={1.5} />
        )))}
      </g>
    </svg>
  );
};

/* ---------- Rendu de tous les calques ---------- */
export const Overlays: React.FC<{ items: O.Overlay[]; t: number }> = ({ items, t }) => {
  const { width, height } = useVideoConfig();
  const shapes: React.ReactNode[] = [];
  const rest: React.ReactNode[] = [];
  items.forEach((o, i) => {
    const from = T(o.from), to = o.to !== undefined ? T(o.to) : Infinity;
    if (t < from || t > to + FADE) return;
    const p: P = { t, local: t - from, alpha: t > to ? 1 - clamp((t - to) / FADE) : 1, uid: `${o.type}${i}` };
    switch (o.type) {
      case "country": shapes.push(<Country key={i} o={o} {...p} />); break;
      case "mask": rest.push(<Mask key={i} o={o} {...p} />); break;
      case "label": rest.push(<Label key={i} o={o} {...p} />); break;
      case "coast": rest.push(<Coast key={i} o={o} {...p} />); break;
      case "arrows": rest.push(<Arrows key={i} o={o} {...p} />); break;
      case "measure": rest.push(<Measure key={i} o={o} {...p} />); break;
      case "scribble": rest.push(<Scribble key={i} o={o} {...p} />); break;
      case "face": rest.push(<Face key={i} o={o} {...p} />); break;
    }
  });
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width={width} height={height}>{shapes}</svg>
      {rest}
    </div>
  );
};
