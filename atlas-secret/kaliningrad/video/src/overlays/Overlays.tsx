import React from "react";
import { Easing, useVideoConfig } from "remotion";
import { useMap } from "../map/MapStage";
import { bordersPath, regionPath, visibility } from "../map/geo";
import { STYLE } from "../config/style";
import { T } from "../timeline";
import type * as O from "./types";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const out = Easing.bezier(0.16, 1, 0.3, 1);
const soft = Easing.bezier(0.45, 0, 0.25, 1);
type P = { t: number; local: number; alpha: number; uid: string };

/* Région colorée par transparence (le terrain reste visible) + contour fin lumineux */
const Region: React.FC<{ o: O.RegionO } & P> = ({ o, local, alpha, uid }) => {
  const { project, camera } = useMap();
  const d = regionPath(o.id, project, visibility(camera));
  const draw = o.draw ?? 1.2;
  const pd = out(clamp(local / draw));
  const pf = soft(clamp((local - draw * 0.35) / (draw * 0.9)));
  const sw = o.strokeWidth ?? 2;
  return (
    <g opacity={alpha}>
      <defs><clipPath id={`c${uid}`}><path d={d} fillRule="evenodd" /></clipPath></defs>
      <path d={d} fill={o.fill} fillOpacity={o.opacity * pf} fillRule="evenodd" />
      {/* lueur intérieure douce le long du bord */}
      {o.glow && <path d={d} fill="none" stroke={o.stroke ?? o.fill} strokeOpacity={0.55 * pf} strokeWidth={sw * 7} clipPath={`url(#c${uid})`} style={{ filter: "blur(6px)" }} />}
      {o.stroke && (
        <path d={d} fill="none" stroke={o.stroke} strokeWidth={sw} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pd}
          style={o.glow ? { filter: `drop-shadow(0 0 5px ${o.stroke})` } : undefined} />
      )}
    </g>
  );
};

/* Frontières terrestres officielles */
const Borders: React.FC<{ o: O.BordersO } & P> = ({ o, local, alpha }) => {
  const { project, camera } = useMap();
  return <path d={bordersPath(project, visibility(camera))} fill="none" stroke={STYLE.border} strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round"
    opacity={(o.opacity ?? 0.8) * alpha * soft(clamp(local / 0.8))} style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.6))" }} />;
};

/* Pointillé lumineux entre deux points, avec un signe au milieu */
const Link: React.FC<{ o: O.LinkO } & P> = ({ o, t, local, alpha }) => {
  const { project } = useMap();
  const [ax, ay] = project(o.a), [bx, by] = project(o.b);
  const p = soft(clamp(local / 1.0));
  const ex = ax + (bx - ax) * p, ey = ay + (by - ay) * p;
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  const mp = out(clamp((local - 0.8) / 0.4));
  return (
    <>
      <svg style={{ position: "absolute", inset: 0, opacity: alpha }} width="100%" height="100%">
        <line x1={ax} y1={ay} x2={ex} y2={ey} stroke="#fff" strokeWidth={3} strokeDasharray="4 12" strokeLinecap="round"
          strokeDashoffset={-t * 30} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }} />
        <circle cx={ax} cy={ay} r={6} fill={STYLE.kal} /><circle cx={bx} cy={by} r={6 * p} fill={STYLE.russia} stroke="#fff" strokeWidth={1.5} />
      </svg>
      {o.mark && <div style={{ position: "absolute", left: mx, top: my - 30, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * mp})`, opacity: mp * alpha,
        fontFamily: STYLE.display, fontWeight: 600, fontSize: 64, color: "#fff", textShadow: "0 0 14px rgba(0,0,0,0.8)" }}>{o.mark}</div>}
    </>
  );
};

/* Étiquette cartographique (pays, mer, lieu) */
const Label: React.FC<{ o: O.LabelO } & P> = ({ o, local, alpha }) => {
  const { project } = useMap();
  const { width, height } = useVideoConfig();
  const [x0, y] = project(o.at);
  // Une étiquette dont le lieu sort du cadre s'efface (elle ne se colle pas au bord de l'écran).
  const inFrame = Math.min(clamp((x0 + 40) / 120), clamp((width + 40 - x0) / 120), clamp((y - 40) / 120), clamp((height * 0.66 - y) / 120));
  const p = soft(clamp(local / 0.7)) * inFrame;
  const base: React.CSSProperties = o.kind === "sea"
    ? { fontFamily: STYLE.serif, fontStyle: "italic", fontWeight: 400, fontSize: o.size ?? 40, letterSpacing: 4, color: "rgba(214,232,255,0.92)" }
    : o.kind === "country"
      ? { fontFamily: STYLE.display, fontWeight: 500, fontSize: o.size ?? 40, letterSpacing: 7, color: o.color ?? "rgba(255,255,255,0.95)" }
      : { fontFamily: STYLE.display, fontWeight: 600, fontSize: o.size ?? 38, letterSpacing: 3, color: o.color ?? STYLE.kal };
  const est = (o.text.length * (base.fontSize as number) * 0.62) / 2 + 10;
  const x = Math.max(est + STYLE.safeSide, Math.min(width - est - STYLE.safeSide, x0));
  return (
    <div style={{ position: "absolute", left: x, top: Math.max(STYLE.safeTop, y), transform: `translate(-50%,-50%) translateY(${(1 - p) * 10}px)`,
      opacity: p * alpha, whiteSpace: "nowrap", textShadow: "0 2px 8px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)", ...base }}>{o.text}</div>
  );
};

/* Titre : fondu sobre, l'espacement des lettres se resserre lentement */
const Title: React.FC<{ o: O.TitleO } & P> = ({ o, local, alpha }) => {
  const a = soft(clamp(local / 1.1));
  const rule = out(clamp((local - 0.35) / 0.9));
  const cap = soft(clamp((local - 0.7) / 0.8));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: o.y ?? 250, textAlign: "center", opacity: alpha }}>
      <div style={{ fontFamily: STYLE.serif, fontWeight: 600, fontSize: 92, letterSpacing: 26 - 12 * a, paddingLeft: 26 - 12 * a, color: "#fff", opacity: a,
        textShadow: "0 4px 22px rgba(0,0,0,0.8)" }}>{o.text}</div>
      <div style={{ margin: "14px auto 0", height: 2, width: 360 * rule, background: `linear-gradient(90deg, transparent, ${STYLE.kal}, transparent)` }} />
      {o.caption && <div style={{ marginTop: 14, fontFamily: STYLE.display, fontWeight: 400, fontSize: 28, letterSpacing: 9, paddingLeft: 9, color: "rgba(255,255,255,0.82)",
        opacity: cap, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{o.caption}</div>}
    </div>
  );
};

/* Chiffre clé : typographie éditoriale, sans cadre */
const Stat: React.FC<{ o: O.StatO } & P> = ({ o, local, alpha }) => {
  const a = soft(clamp(local / 0.8));
  const rule = out(clamp((local - 0.25) / 0.8));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: o.y ?? 215, textAlign: "center", opacity: a * alpha, transform: `translateY(${(1 - a) * 10}px)` }}>
      <div style={{ fontFamily: STYLE.serif, fontWeight: 600, fontSize: 96, color: "#fff", lineHeight: 1, textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>{o.value}</div>
      <div style={{ margin: "14px auto 10px", height: 2, width: 220 * rule, background: STYLE.kal }} />
      <div style={{ fontFamily: STYLE.display, fontWeight: 400, fontSize: 28, letterSpacing: 8, paddingLeft: 8, color: "rgba(255,255,255,0.85)", textShadow: "0 2px 8px rgba(0,0,0,0.85)" }}>{o.caption}</div>
    </div>
  );
};

/* Point du grand cercle entre a et b (fraction f) : la ligne suit la vraie géodésique */
function slerp(a: [number, number], b: [number, number], f: number): [number, number] {
  const r = Math.PI / 180, v = (p: [number, number]) => [Math.cos(p[1] * r) * Math.cos(p[0] * r), Math.cos(p[1] * r) * Math.sin(p[0] * r), Math.sin(p[1] * r)];
  const A = v(a), B = v(b), om = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])), s = Math.sin(om);
  const k1 = Math.sin((1 - f) * om) / s, k2 = Math.sin(f * om) / s, P = [0, 1, 2].map((i) => k1 * A[i] + k2 * B[i]);
  return [Math.atan2(P[1], P[0]) / r, Math.atan2(P[2], Math.hypot(P[0], P[1])) / r];
}

/* Mesure : géodésique animée + compteur de kilomètres + précision « à vol d'oiseau » */
const Measure: React.FC<{ o: O.MeasureO } & P> = ({ o, t, local, alpha }) => {
  const { project } = useMap();
  const { width } = useVideoConfig();
  const dur = Math.max(0.5, T(o.until) - T(o.from));
  const p = soft(clamp(local / dur));
  const N = 48, pts: [number, number][] = [];
  for (let i = 0; i <= Math.ceil(N * p); i++) pts.push(project(slerp(o.a, o.b, Math.min(p, i / N))));
  const [ax, ay] = project(o.a), [bx, by] = project(o.b);
  const [ex, ey] = pts[pts.length - 1];
  const d = pts.map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("");
  const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
  const km = Math.round(o.km * p);
  const cap = soft(clamp((local - dur) / 0.7));
  const [mxp, myp] = project(slerp(o.a, o.b, 0.5));
  const cx = Math.max(220, Math.min(width - 220, mxp));
  return (
    <>
      <svg style={{ position: "absolute", inset: 0, opacity: alpha, overflow: "visible" }} width="100%" height="100%">
        <path d={d} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth={7} strokeLinecap="round" />
        <path d={d} fill="none" stroke={STYLE.kal} strokeWidth={3.2} strokeDasharray="12 8" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 5px ${STYLE.kal})` }} />
        <circle cx={ax} cy={ay} r={6} fill={STYLE.kal} stroke="#fff" strokeWidth={2} />
        <circle cx={ex} cy={ey} r={6} fill="#fff" stroke={STYLE.kal} strokeWidth={2.5} />
        {p >= 0.999 && <circle cx={bx} cy={by} r={10 + 2 * Math.sin(t * 4)} fill="none" stroke={STYLE.russia} strokeWidth={2.5} />}
      </svg>
      <div style={{ position: "absolute", left: cx, top: myp, transform: `translate(-50%,-50%) rotate(${ang}deg) translateY(-50px)`, opacity: alpha * clamp(local / 0.35),
        fontFamily: STYLE.serif, fontWeight: 600, fontSize: 60, color: "#fff", whiteSpace: "nowrap", textShadow: "0 0 14px rgba(0,0,0,0.9), 0 3px 4px rgba(0,0,0,0.9)" }}>
        {km} <span style={{ fontFamily: STYLE.display, fontSize: 34, fontWeight: 500, letterSpacing: 2 }}>km</span>
      </div>
      {/* Précision de lecture, à l'horizontale en haut de l'écran : bien lisible, ne gêne pas la carte */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", opacity: alpha * cap, transform: `translateY(${(1 - cap) * 8}px)`,
        textShadow: "0 2px 8px rgba(0,0,0,0.95)" }}>
        <div style={{ fontFamily: STYLE.display, fontWeight: 500, fontSize: 34, letterSpacing: 10, paddingLeft: 10, color: "#fff" }}>{o.caption}</div>
        <div style={{ margin: "12px auto 10px", height: 2, width: 200 * cap, background: STYLE.kal }} />
        {o.note && <div style={{ marginTop: 8, fontFamily: STYLE.sans, fontWeight: 600, fontSize: 22, color: "rgba(255,255,255,0.75)" }}>{o.note}</div>}
      </div>
    </>
  );
};

/* Isolement : la région gardée reste lumineuse, le reste s'assombrit légèrement (bords adoucis) */
const Spot: React.FC<{ o: O.SpotO } & P> = ({ o, local, alpha, uid }) => {
  const { project, camera } = useMap();
  const { width, height } = useVideoConfig();
  const holes = o.keep.map((id) => regionPath(id, project, visibility(camera))).join("");
  const a = soft(clamp(local / 1.0)) * alpha;
  return (
    <g>
      <defs><filter id={`f${uid}`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={18} /></filter></defs>
      <path d={`M-200 -200H${width + 200}V${height + 200}H-200Z${holes}`} fillRule="evenodd" fill="#02050c" opacity={o.opacity * a} filter={`url(#f${uid})`} />
    </g>
  );
};

const FADE = 0.45;
export const Overlays: React.FC<{ items: O.Overlay[]; t: number }> = ({ items, t }) => {
  const { width, height } = useVideoConfig();
  const shapes: React.ReactNode[] = [], rest: React.ReactNode[] = [];
  items.forEach((o, i) => {
    const from = T(o.from), to = o.to !== undefined ? T(o.to) : Infinity, fo = o.fadeOut ?? FADE;
    if (t < from || t > to + fo) return;
    const p: P = { t, local: t - from, alpha: t > to ? 1 - clamp((t - to) / fo) : 1, uid: `${o.type}${i}` };
    switch (o.type) {
      case "region": shapes.push(<Region key={i} o={o} {...p} />); break;
      case "spot": shapes.push(<Spot key={i} o={o} {...p} />); break;
      case "borders": shapes.push(<Borders key={i} o={o} {...p} />); break;
      case "link": rest.push(<Link key={i} o={o} {...p} />); break;
      case "label": rest.push(<Label key={i} o={o} {...p} />); break;
      case "title": rest.push(<Title key={i} o={o} {...p} />); break;
      case "stat": rest.push(<Stat key={i} o={o} {...p} />); break;
      case "measure": rest.push(<Measure key={i} o={o} {...p} />); break;
    }
  });
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width={width} height={height}>{shapes}</svg>
      {rest}
    </div>
  );
};
