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
  const { width } = useVideoConfig();
  const [x0, y] = project(o.at);
  const p = soft(clamp(local / 0.7));
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

/* Titre révélé lettre par lettre */
const Title: React.FC<{ o: O.TitleO } & P> = ({ o, local, alpha }) => {
  const n = o.text.length;
  const lp = clamp((local - 0.15) / 0.5);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: o.y ?? 270, textAlign: "center", opacity: alpha }}>
      <div style={{ fontFamily: STYLE.display, fontWeight: 600, fontSize: 112, letterSpacing: 16, color: "#fff", paddingLeft: 16,
        textShadow: "0 4px 18px rgba(0,0,0,0.75)" }}>
        {o.text.split("").map((c, i) => {
          const a = clamp((local - (i / n) * 0.7) / 0.35);
          return <span key={i} style={{ opacity: a, display: "inline-block", transform: `translateY(${(1 - out(a)) * 18}px)`, filter: `blur(${(1 - a) * 6}px)` }}>{c}</span>;
        })}
      </div>
      <div style={{ margin: "10px auto 0", height: 3, width: 420 * out(lp), background: STYLE.kal, boxShadow: `0 0 12px ${STYLE.kal}` }} />
      {o.caption && <div style={{ marginTop: 14, fontFamily: STYLE.display, fontWeight: 400, fontSize: 32, letterSpacing: 8, color: "rgba(255,255,255,0.85)",
        opacity: clamp((local - 0.6) / 0.4), textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{o.caption}</div>}
    </div>
  );
};

/* Carte chiffre (population…) */
const Stat: React.FC<{ o: O.StatO } & P> = ({ o, local, alpha }) => {
  const p = out(clamp(local / 0.6));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: o.y ?? 230, display: "flex", justifyContent: "center", opacity: p * alpha }}>
      <div style={{ transform: `translateY(${(1 - p) * 16}px)`, textAlign: "center", padding: "14px 34px 16px", borderTop: `3px solid ${STYLE.kal}`,
        background: "linear-gradient(180deg, rgba(5,10,20,0.62), rgba(5,10,20,0.35))", backdropFilter: "blur(3px)" }}>
        <div style={{ fontFamily: STYLE.display, fontWeight: 600, fontSize: 84, letterSpacing: 2, color: "#fff", lineHeight: 1 }}>{o.value}</div>
        <div style={{ marginTop: 8, fontFamily: STYLE.sans, fontWeight: 700, fontSize: 26, letterSpacing: 1.5, color: "rgba(255,255,255,0.82)" }}>{o.caption}</div>
      </div>
    </div>
  );
};

/* Mesure animée : ligne + compteur de kilomètres */
const Measure: React.FC<{ o: O.MeasureO } & P> = ({ o, t, local, alpha }) => {
  const { project } = useMap();
  const dur = Math.max(0.5, T(o.until) - T(o.from));
  const p = soft(clamp(local / dur));
  const [ax, ay] = project(o.a), [bx, by] = project(o.b);
  const ex = ax + (bx - ax) * p, ey = ay + (by - ay) * p;
  const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
  const km = Math.round(o.km * p);
  const cap = out(clamp((local - dur) / 0.5));
  const lx = (ax + ex) / 2, ly = (ay + ey) / 2;
  return (
    <>
      <svg style={{ position: "absolute", inset: 0, opacity: alpha, overflow: "visible" }} width="100%" height="100%">
        <line x1={ax} y1={ay} x2={ex} y2={ey} stroke={STYLE.kal} strokeWidth={4} strokeDasharray="14 9" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${STYLE.kal})` }} />
        <line x1={ax - 12 * Math.sin(ang * Math.PI / 180)} y1={ay + 12 * Math.cos(ang * Math.PI / 180)} x2={ax + 12 * Math.sin(ang * Math.PI / 180)} y2={ay - 12 * Math.cos(ang * Math.PI / 180)} stroke="#fff" strokeWidth={3} />
        <circle cx={ex} cy={ey} r={7} fill="#fff" stroke={STYLE.kal} strokeWidth={3} />
        {p >= 0.999 && <circle cx={bx} cy={by} r={9 + 3 * Math.sin(t * 5)} fill="none" stroke={STYLE.russia} strokeWidth={3} />}
      </svg>
      <div style={{ position: "absolute", left: lx, top: ly, transform: `translate(-50%,-50%) rotate(${ang}deg) translateY(-56px)`, opacity: alpha * clamp(local / 0.3),
        fontFamily: STYLE.display, fontWeight: 600, fontSize: 66, color: "#fff", whiteSpace: "nowrap", textShadow: "0 0 12px rgba(0,0,0,0.85), 0 3px 4px rgba(0,0,0,0.9)" }}>
        {km} <span style={{ fontSize: 40, fontWeight: 500 }}>km</span>
      </div>
      <div style={{ position: "absolute", left: lx, top: ly, transform: `translate(-50%,-50%) rotate(${ang}deg) translateY(34px)`, opacity: alpha * cap,
        fontFamily: STYLE.sans, fontWeight: 700, fontSize: 25, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}>
        {o.caption}
      </div>
    </>
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
