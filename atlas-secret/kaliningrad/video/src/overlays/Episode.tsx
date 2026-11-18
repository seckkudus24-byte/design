import React from "react";
import { Easing, Img, staticFile, useVideoConfig } from "remotion";
import { useMap } from "../map/MapStage";
import { ringsPath, visibility } from "../map/geo";
import { EPOLY, ELINES } from "../map/geoEpisode";
import { STYLE } from "../config/style";
import { T } from "../timeline";
import type * as O from "./episodeTypes";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const out = Easing.bezier(0.16, 1, 0.3, 1);
const soft = Easing.bezier(0.45, 0, 0.25, 1);
type P = { t: number; local: number; alpha: number; uid: string; exit: number };
type XY = [number, number];
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const SHADOW = "0 2px 8px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)";

function useProj() {
  const { project, camera } = useMap();
  const vis = visibility(camera);
  const pts = (ll: XY[]) => ll.filter(vis).map(project);
  const d = (xy: XY[]) => xy.map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("");
  return { project, vis, pts, d };
}
/** Coupe une polyligne écran à la fraction p de sa longueur. */
function cut(xy: XY[], p: number): XY[] {
  if (xy.length < 2) return xy;
  const L: number[] = [0];
  for (let i = 1; i < xy.length; i++) L.push(L[i - 1] + Math.hypot(xy[i][0] - xy[i - 1][0], xy[i][1] - xy[i - 1][1]));
  const target = L[L.length - 1] * p, res: XY[] = [xy[0]];
  for (let i = 1; i < xy.length; i++) {
    if (L[i] <= target) res.push(xy[i]);
    else { const f = (target - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]); res.push([xy[i - 1][0] + (xy[i][0] - xy[i - 1][0]) * f, xy[i - 1][1] + (xy[i][1] - xy[i - 1][1]) * f]); break; }
  }
  return res;
}
/** Lissage Catmull-Rom (écran). */
function smooth(xy: XY[], n = 8): XY[] {
  if (xy.length < 3) return xy;
  const r: XY[] = [];
  for (let i = 0; i < xy.length - 1; i++) {
    const p0 = xy[Math.max(0, i - 1)], p1 = xy[i], p2 = xy[i + 1], p3 = xy[Math.min(xy.length - 1, i + 2)];
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
      r.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)) as XY); }
  }
  r.push(xy[xy.length - 1]);
  return r;
}
const head = (tip: XY, prev: XY, size: number, color: string, stroke = "rgba(0,0,0,0.6)") => {
  const a = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
  const q = [[tip[0] + Math.cos(a) * size, tip[1] + Math.sin(a) * size], [tip[0] + Math.cos(a + 2.5) * size, tip[1] + Math.sin(a + 2.5) * size], [tip[0] + Math.cos(a - 2.5) * size, tip[1] + Math.sin(a - 2.5) * size]];
  return <polygon points={q.map((v) => v.join(",")).join(" ")} fill={color} stroke={stroke} strokeWidth={1.5} />;
};

/* ── Tampon de date ── */
const DateStamp: React.FC<{ o: O.DateO } & P> = ({ o, local, alpha }) => {
  const n1 = Math.round(o.date.length * clamp(local / 0.35)), n2 = Math.round(o.text.length * clamp((local - 0.25) / 0.7));
  const a = soft(clamp(local / 0.3)) * alpha;
  return (
    <div style={{ position: "absolute", left: STYLE.safeSide, top: 232 + (o.slot ?? 0) * 92, opacity: a, display: "flex", gap: 14, alignItems: "stretch" }}>
      <div style={{ width: 4, background: STYLE.kal, boxShadow: `0 0 8px ${STYLE.kal}` }} />
      <div style={{ textShadow: SHADOW }}>
        <div style={{ fontFamily: STYLE.display, fontWeight: 600, fontSize: 40, letterSpacing: 3, color: STYLE.kal, lineHeight: 1.05 }}>{o.date.slice(0, n1)}<span style={{ opacity: 0 }}>{o.date.slice(n1)}</span></div>
        <div style={{ fontFamily: STYLE.sans, fontWeight: 600, fontSize: 25, color: "rgba(255,255,255,0.92)", marginTop: 4, maxWidth: 760 }}>{o.text.slice(0, n2)}<span style={{ opacity: 0 }}>{o.text.slice(n2)}</span></div>
      </div>
    </div>
  );
};

/* ── Image d'archive épinglée ── */
const Card: React.FC<{ o: O.CardO } & P> = ({ o, local, alpha, exit }) => {
  const { project } = useMap();
  const [px, py] = project(o.pin);
  const inP = out(clamp(local / 0.7)), ex = soft(exit);
  const k = inP * (1 - ex);                         // 0 = replié sur l'épingle, 1 = déployé
  const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
  const s = 0.35 + 0.65 * k, tx = (px - cx) * (1 - k), ty = (py - cy) * (1 - k);
  const kb = 1.02 + 0.06 * clamp(local / 6);
  return (
    <>
      <svg style={{ position: "absolute", inset: 0, opacity: alpha * clamp(k * 1.5) }} width="100%" height="100%">
        <line x1={px} y1={py} x2={cx} y2={o.y + o.h} stroke="rgba(255,240,210,0.7)" strokeWidth={2} />
        <circle cx={px} cy={py} r={7} fill={STYLE.kal} stroke="#fff" strokeWidth={2} />
      </svg>
      <div style={{ position: "absolute", left: o.x, top: o.y, width: o.w, height: o.h, opacity: alpha * clamp(k * 1.4),
        transform: `translate(${tx}px, ${ty}px) scale(${s}) rotate(${(o.tilt ?? -1.5) * k}deg)`, transformOrigin: "50% 50%",
        padding: 12, background: "#e8dfca", boxShadow: "0 18px 40px rgba(0,0,0,0.65), 0 2px 6px rgba(0,0,0,0.5)" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#222" }}>
          <Img src={staticFile(o.src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${kb})`, filter: "sepia(0.35) contrast(1.05) brightness(0.95)" }} />
          <Img src={staticFile("fx/grain.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "overlay", opacity: 0.28 }} />
          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 60px rgba(40,25,10,0.55)" }} />
        </div>
        <div style={{ position: "absolute", left: 4, right: 4, bottom: -34, fontFamily: STYLE.sans, fontWeight: 600, fontSize: 17, color: "rgba(255,255,255,0.82)", textShadow: SHADOW, lineHeight: 1.2 }}>{o.credit}</div>
      </div>
    </>
  );
};

/* ── Nom de ville (écriture / désagrégation) ── */
const City: React.FC<{ o: O.CityO } & P> = ({ o, t, local, alpha }) => {
  const { project } = useMap();
  const [x, y0] = project(o.at);
  const y = y0 + (o.dy ?? -70);
  const past = o.style === "past";
  const dz = o.dissolveAt !== undefined ? t - T(o.dissolveAt) : -1;
  const n = o.text.length;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", whiteSpace: "nowrap", opacity: alpha,
      fontFamily: past ? STYLE.serif : STYLE.display, fontStyle: past ? "italic" : "normal", fontWeight: 600, fontSize: o.size ?? (past ? 78 : 64),
      letterSpacing: past ? 2 : 8, color: past ? "#F3E6C8" : "#fff", textShadow: "0 3px 14px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)" }}>
      {o.text.split("").map((c, i) => {
        const w = clamp((local - (i / n) * 0.6) / 0.35);
        let dx = 0, dy = (1 - out(w)) * 10, b = (1 - w) * 6, a = w;
        if (dz > 0) { const q = clamp((dz - hash(i) * 0.5) / 0.9); dx = (hash(i + 7) - 0.5) * 140 * q; dy = -(40 + hash(i + 3) * 90) * q; b = 10 * q; a *= 1 - q; }
        return <span key={i} style={{ display: "inline-block", opacity: a, transform: `translate(${dx}px, ${dy}px)`, filter: `blur(${b}px)` }}>{c === " " ? " " : c}</span>;
      })}
      {dz > 0 && dz < 1.6 && Array.from({ length: 26 }, (_, i) => {
        const q = clamp((dz - hash(i + 40) * 0.6) / 1.0);
        return <span key={"p" + i} style={{ position: "absolute", left: `${hash(i + 11) * 100}%`, top: "50%", width: 4, height: 4, borderRadius: 2, background: "#fff",
          opacity: (1 - q) * 0.8, transform: `translate(${(hash(i + 5) - 0.5) * 200 * q}px, ${-(30 + hash(i + 9) * 120) * q}px)` }} />;
      })}
    </div>
  );
};

/* ── Zone adoucie (frontières historiques simplifiées) ── */
const Zone: React.FC<{ o: O.ZoneO } & P> = ({ o, local, alpha, uid }) => {
  const { project, vis } = useProj();
  const { width, height } = useVideoConfig();
  const d = ringsPath(EPOLY[o.id].coordinates.flat(), project, true, vis);
  const land = o.landClip !== false ? ringsPath(EPOLY.LAND.coordinates.flat(), project, true, vis) : null;
  let rect: string | null = null;
  if (o.clip) { const [a, b, c, e] = o.clip; const ring: XY[] = [];
    for (let i = 0; i <= 10; i++) ring.push([a + (c - a) * (i / 10), b]); for (let i = 0; i <= 10; i++) ring.push([c, b + (e - b) * (i / 10)]);
    for (let i = 0; i <= 10; i++) ring.push([c - (c - a) * (i / 10), e]); for (let i = 0; i <= 10; i++) ring.push([a, e - (e - b) * (i / 10)]);
    rect = ring.map(project).map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("") + "Z"; }
  const p = soft(clamp(local / 1.0));
  const wipeY = o.wipe === "south" ? height * (1 - out(clamp(local / 1.4))) : -9999;
  const blur = o.blur ?? 5;
  let focus: { c: XY; r: number } | null = null;
  if (o.focus) {
    const c = project(o.focus.at), e = project([o.focus.at[0] + o.focus.km / (111.32 * Math.cos((o.focus.at[1] * Math.PI) / 180)), o.focus.at[1]]);
    focus = { c, r: Math.max(20, Math.hypot(e[0] - c[0], e[1] - c[1])) * out(clamp(local / 1.3)) };
  }
  return (
    <g opacity={alpha}>
      <defs>
        <filter id={`b${uid}`} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={blur} /></filter>
        {land && <clipPath id={`l${uid}`}><path d={land} fillRule="nonzero" /></clipPath>}
        {rect && <clipPath id={`r${uid}`}><path d={rect} /></clipPath>}
        {o.wipe && <clipPath id={`w${uid}`}><rect x={-100} y={wipeY} width={width + 200} height={height * 2} /></clipPath>}
        {focus && (
          <mask id={`m${uid}`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={width + 400} height={height + 400}>
            <radialGradient id={`g${uid}`} cx={focus.c[0]} cy={focus.c[1]} r={focus.r} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff" /><stop offset="0.55" stopColor="#fff" /><stop offset="1" stopColor="#000" />
            </radialGradient>
            <rect x={-200} y={-200} width={width + 400} height={height + 400} fill={`url(#g${uid})`} />
          </mask>
        )}
      </defs>
      <g clipPath={land ? `url(#l${uid})` : undefined}>
        <g clipPath={rect ? `url(#r${uid})` : undefined}>
          <g clipPath={o.wipe ? `url(#w${uid})` : undefined} mask={focus ? `url(#m${uid})` : undefined}>
            <path d={d} fill={o.fill} fillOpacity={o.opacity * p} fillRule="evenodd" filter={`url(#b${uid})`} />
            {o.edge && <path d={d} fill="none" stroke={o.edge} strokeOpacity={0.55 * p} strokeWidth={3} filter={`url(#b${uid})`} />}
          </g>
        </g>
      </g>
    </g>
  );
};

/* ── Lignes particulières ── */
const Lines: React.FC<{ o: O.LinesO } & P> = ({ o, t, local, alpha }) => {
  const { project, vis } = useProj();
  const d = ringsPath(ELINES[o.id].coordinates, project, false, vis);
  const p = soft(clamp(local / (o.draw ?? 1.0)));
  const solid = o.solidAt !== undefined ? soft(clamp((t - T(o.solidAt)) / 0.8)) : o.dash ? 0 : 1;
  const op = (o.opacity ?? 1) * alpha * p;
  const glow = o.glow ? { filter: `drop-shadow(0 0 6px ${o.color})` } : undefined;
  return (
    <g style={glow}>
      {o.dash && <path d={d} fill="none" stroke={o.color} strokeWidth={o.width} strokeDasharray={o.dash} strokeLinecap="round" opacity={op * (1 - solid)} />}
      <path d={d} fill="none" stroke={o.color} strokeWidth={o.width} strokeLinejoin="round" strokeLinecap="round" opacity={op * solid}
        pathLength={o.dash ? undefined : 1} strokeDasharray={o.dash ? undefined : "1 1"} strokeDashoffset={o.dash ? undefined : 1 - p} />
    </g>
  );
};

/* ── Flèches d'offensive ── */
const Offensive: React.FC<{ o: O.ArrowsO2 } & P> = ({ o, t, local, alpha }) => {
  const { project } = useMap();
  const dur = Math.max(0.5, T(o.until) - T(o.from));
  const w = o.width ?? 22;
  return (
    <g opacity={alpha} style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.6))" }}>
      {o.paths.map((path, i) => {
        const p = soft(clamp((local - i * 0.18) / (dur - 0.3)));
        if (p <= 0) return null;
        const xy = cut(smooth(path.map(project)), p);
        if (xy.length < 2) return null;
        const tip = xy[xy.length - 1], prev = xy[Math.max(0, xy.length - 4)];
        const d = xy.map((q, k) => (k ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("");
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="rgba(30,0,0,0.6)" strokeWidth={w + 5} strokeLinecap="round" strokeLinejoin="round" />
            <path d={d} fill="none" stroke={o.color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={0.92} />
            {head(tip, prev, w * 1.9, o.color)}
          </g>
        );
      })}
    </g>
  );
};

/* ── Anneau d'encerclement ── */
const Ring: React.FC<{ o: O.RingO } & P> = ({ o, local, alpha }) => {
  const { project } = useMap();
  const dur = Math.max(0.5, T(o.until) - T(o.from));
  const p = soft(clamp(local / dur));
  const R = 6371.0088, r = Math.PI / 180, d = o.km / R;
  const ring: XY[] = Array.from({ length: 121 }, (_, i) => { const b = (i * 3 - 90) * r, p1 = o.at[1] * r, l1 = o.at[0] * r;
    const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(b));
    return [(l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2))) / r, p2 / r] as XY; });
  const xy = cut(ring.map(project), p);
  const dd = xy.map((q, k) => (k ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("");
  return (
    <g opacity={alpha}>
      <path d={dd} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth={9} strokeLinecap="round" />
      <path d={dd} fill="none" stroke={o.color} strokeWidth={5} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${o.color})` }} />
    </g>
  );
};

/* ── Flux (déplacements de population) ── */
const Flow: React.FC<{ o: O.FlowO } & P> = ({ o, t, local, alpha }) => {
  const { project } = useMap();
  const a = soft(clamp(local / 0.8)) * alpha;
  return (
    <g opacity={a}>
      {o.lines.map((ln, i) => {
        const xy = smooth(ln.map(project), 6);
        const d = xy.map((q, k) => (k ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("");
        const ph = ((t * 0.45 + hash(i) * 0.7) % 1);
        const tip = cut(xy, Math.max(0.05, ph)), last = tip[tip.length - 1], prev = tip[Math.max(0, tip.length - 3)];
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={6} strokeLinecap="round" />
            <path d={d} fill="none" stroke={o.color} strokeOpacity={0.9} strokeWidth={3.4} strokeDasharray="10 8" strokeLinecap="round" strokeDashoffset={-t * 40} />
            {head(last, prev, 15, o.color, "rgba(0,0,0,0.6)")}
          </g>
        );
      })}
    </g>
  );
};

/* ── Itinéraires mer / air / rail ── */
const ICON: Record<string, React.ReactNode> = {
  ship: <path d="M-14 3 L14 3 L9 10 L-9 10 Z M-2 -12 L-2 3 M-2 -12 L9 -1 L-2 -1" fill="#fff" stroke="#fff" strokeWidth={2} strokeLinejoin="round" />,
  plane: <path d="M0 -14 L3 -3 L14 3 L14 6 L3 3 L2 10 L6 13 L6 15 L0 13 L-6 15 L-6 13 L-2 10 L-3 3 L-14 6 L-14 3 L-3 -3 Z" fill="#fff" />,
  train: <g fill="#fff"><rect x={-9} y={-12} width={18} height={20} rx={4} /><rect x={-6} y={-8} width={12} height={6} fill="#123" /><circle cx={-5} cy={4} r={2} fill="#123" /><circle cx={5} cy={4} r={2} fill="#123" /><path d="M-7 9 L-10 14 M7 9 L10 14" stroke="#fff" strokeWidth={2} /></g>,
};
const Route: React.FC<{ o: O.RouteO } & P> = ({ o, local, alpha }) => {
  const { project } = useMap();
  const dur = Math.max(0.5, T(o.until) - T(o.from));
  const p = soft(clamp(local / dur));
  const all = smooth(o.path.map(project), 10), xy = cut(all, p);
  if (xy.length < 2) return null;
  const tip = xy[xy.length - 1];
  const d = xy.map((q, k) => (k ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("");
  const dash = o.mode === "plane" ? "2 10" : o.mode === "ship" ? "14 9" : "22 6";
  return (
    <g opacity={alpha}>
      <path d={d} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth={7} strokeLinecap="round" strokeDasharray={dash} />
      <path d={d} fill="none" stroke={o.color} strokeWidth={3.6} strokeLinecap="round" strokeDasharray={dash} style={{ filter: `drop-shadow(0 0 5px ${o.color})` }} />
      {o.mode === "train" && <path d={d} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={1.2} />}
      <g transform={`translate(${tip[0]} ${tip[1]})`}>
        <circle r={22} fill={o.color} stroke="#fff" strokeWidth={2.5} style={{ filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.6))" }} />
        <g transform="scale(0.95)">{ICON[o.mode]}</g>
      </g>
      {o.label && p > 0.95 && <text x={tip[0] + 32} y={tip[1] + 9} fill="#fff" fontFamily={STYLE.display} fontWeight={500} fontSize={28} letterSpacing={2}
        style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.8)", strokeWidth: 5 }} opacity={soft(clamp((p - 0.95) / 0.05))}>{o.label}</text>}
    </g>
  );
};

/* ── Cercle de portée ── */
const Circle: React.FC<{ o: O.CircleO } & P> = ({ o, local, alpha }) => {
  const { project } = useMap();
  const { width } = useVideoConfig();
  const dur = Math.max(0.5, T(o.until) - T(o.from));
  const p = out(clamp(local / dur));
  const c = project(o.center);
  const xy = o.ring.map(project).map((q) => [c[0] + (q[0] - c[0]) * p, c[1] + (q[1] - c[1]) * p] as XY);
  const d = xy.map((q, k) => (k ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("") + "Z";
  const bottom = xy.reduce((a, q) => (q[1] > a[1] ? q : a), xy[0]);
  const cap = soft(clamp((local - dur * 0.6) / 0.6));
  return (
    <>
      <svg style={{ position: "absolute", inset: 0, opacity: alpha }} width="100%" height="100%">
        <path d={d} fill="rgba(242,169,59,0.05)" stroke="rgba(230,205,160,0.95)" strokeWidth={2.4} strokeDasharray="10 9" style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.8))" }} />
        <circle cx={c[0]} cy={c[1]} r={6} fill={STYLE.russia} stroke="#fff" strokeWidth={2} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center", opacity: alpha * cap, textShadow: SHADOW }}>
        <div style={{ fontFamily: STYLE.display, fontWeight: 500, fontSize: 32, letterSpacing: 6, paddingLeft: 6, color: "#fff" }}>{o.caption}</div>
      </div>
      <div style={{ position: "absolute", left: Math.max(260, Math.min(width - 260, bottom[0])), top: Math.min(1250, bottom[1] + 34), transform: "translateX(-50%)", opacity: alpha * cap,
        fontFamily: STYLE.sans, fontWeight: 600, fontSize: 23, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", textShadow: SHADOW }}>{o.note}</div>
    </>
  );
};

/* ── Bloc de texte éditorial ── */
const Block: React.FC<{ o: O.BlockO } & P> = ({ o, local, alpha }) => {
  const a = soft(clamp(local / 0.8)) * alpha;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: o.y ?? 300, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * 8}px)`, textShadow: SHADOW }}>
      {o.title && <div style={{ fontFamily: STYLE.serif, fontWeight: 600, fontSize: o.size ?? 64, color: "#fff", lineHeight: 1.05, fontVariantNumeric: "lining-nums" }}>{o.title}</div>}
      {o.title && <div style={{ margin: "14px auto 12px", height: 2, width: 220 * a, background: STYLE.kal }} />}
      {o.lines.map((l, i) => <div key={i} style={{ fontFamily: STYLE.display, fontWeight: 500, fontSize: 31, letterSpacing: 3, color: "rgba(255,255,255,0.92)", marginTop: 6,
        opacity: soft(clamp((local - 0.2 - i * 0.35) / 0.6)) }}>{l}</div>)}
    </div>
  );
};

/* ── Frise chronologique ── */
const Frise: React.FC<{ o: O.FriseO } & P> = ({ o, t, local, alpha }) => {
  const { width } = useVideoConfig();
  const y = o.y ?? 1160, x0 = 170, x1 = width - 170, n = o.items.length;
  const a = soft(clamp(local / 0.6)) * alpha;
  const lit = o.items.map((it) => soft(clamp((t - T(it.at)) / 0.5)));
  const lastLit = lit.reduce((m, v, i) => (v > 0.5 ? i : m), -1);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <div style={{ position: "absolute", left: x0, width: x1 - x0, top: y, height: 2, background: "rgba(255,255,255,0.35)" }} />
      <div style={{ position: "absolute", left: x0, width: (x1 - x0) * Math.max(0, lastLit) / (n - 1), top: y, height: 2, background: STYLE.kal }} />
      {o.items.map((it, i) => {
        const x = x0 + ((x1 - x0) * i) / (n - 1), on = lit[i], cur = i === lastLit;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: "translateX(-50%)", textAlign: "center", width: 210 }}>
            <div style={{ margin: "-8px auto 0", width: 18, height: 18, borderRadius: 9, background: on > 0.5 ? STYLE.kal : "rgba(255,255,255,0.35)", boxShadow: cur ? `0 0 14px ${STYLE.kal}` : undefined, border: "2px solid #fff" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, fontFamily: STYLE.display, fontWeight: 600, fontSize: 26, color: cur ? STYLE.kal : "#fff", opacity: 0.35 + 0.65 * on, textShadow: SHADOW, whiteSpace: "nowrap" }}>{it.date}</div>
            <div style={{ marginTop: 12, fontFamily: STYLE.sans, fontWeight: 600, fontSize: 21, lineHeight: 1.2, color: "rgba(255,255,255,0.9)", opacity: on, textShadow: SHADOW }}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Badge ── */
const Badge: React.FC<{ o: O.BadgeO } & P> = ({ o, local, alpha }) => (
  <div style={{ position: "absolute", right: STYLE.safeSide + 70, top: 156, opacity: soft(clamp(local / 0.4)) * alpha, padding: "6px 16px", border: `2px solid ${STYLE.kal}`,
    fontFamily: STYLE.display, fontWeight: 600, fontSize: 24, letterSpacing: 5, color: STYLE.kal, background: "rgba(5,10,20,0.45)" }}>{o.text}</div>
);

/* ── Lieu ponctuel ── */
const Place: React.FC<{ o: O.PlaceO } & P> = ({ o, local, alpha }) => {
  const { project } = useMap();
  const [x, y] = project(o.at);
  const a = soft(clamp(local / 0.6)) * alpha, left = o.side === "left";
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: a }}>
      <div style={{ position: "absolute", left: -7, top: -7, width: 14, height: 14, borderRadius: 7, background: o.color ?? "#fff", border: "2px solid rgba(0,0,0,0.6)" }} />
      <div style={{ position: "absolute", top: -22, [left ? "right" : "left"]: 16, fontFamily: STYLE.display, fontWeight: 500, fontSize: 32, letterSpacing: 3, color: "#fff", whiteSpace: "nowrap", textShadow: SHADOW } as any}>{o.text}</div>
    </div>
  );
};

/* ── Noms empilés (conclusion) ── */
const Names: React.FC<{ o: O.NamesO } & P> = ({ o, t, alpha }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: o.y ?? 250, textAlign: "center", opacity: alpha }}>
    {o.items.map((it, i) => {
      const a = soft(clamp((t - T(it.at)) / 0.7));
      const font = it.font === "serif" ? { fontFamily: STYLE.serif, fontStyle: "italic" as const, fontWeight: 600 } : it.font === "display" ? { fontFamily: STYLE.display, fontWeight: 600, letterSpacing: 8 } : { fontFamily: STYLE.serif, fontWeight: 600 };
      return (
        <div key={i} style={{ opacity: a, transform: `translateY(${(1 - a) * 12}px)`, marginBottom: 26, textShadow: SHADOW }}>
          <div style={{ ...font, fontSize: 74, color: i === 1 ? STYLE.kal : "#fff", lineHeight: 1.05 }}>{it.name}</div>
          <div style={{ fontFamily: STYLE.display, fontWeight: 400, fontSize: 26, letterSpacing: 5, color: "rgba(255,255,255,0.8)", marginTop: 6 }}>{it.sub}</div>
        </div>
      );
    })}
  </div>
);

/* ── Écran de fin ── */
const End: React.FC<{ o: O.EndO } & P> = ({ local }) => {
  const a = soft(clamp(local / 0.8));
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(3,7,15,${0.92 * a})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: soft(clamp((local - 0.3) / 0.6)), display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 7, height: 64, background: STYLE.kal, boxShadow: `0 0 14px ${STYLE.kal}` }} />
        <div style={{ fontFamily: STYLE.display, fontWeight: 600, fontSize: 76, letterSpacing: 16, color: "#fff" }}>{STYLE.brand}</div>
      </div>
      <div style={{ marginTop: 22, opacity: soft(clamp((local - 0.6) / 0.6)), fontFamily: STYLE.display, fontWeight: 400, fontSize: 28, letterSpacing: 8, color: "rgba(255,255,255,0.75)" }}>ÉPISODE 1 · KALININGRAD</div>
    </div>
  );
};

/* ── Mention de source ── */
const Note: React.FC<{ o: O.NoteO } & P> = ({ o, local, alpha }) => (
  <div style={{ position: "absolute", left: 30, right: 30, bottom: 58, textAlign: "center", opacity: soft(clamp(local / 0.6)) * alpha, fontFamily: STYLE.sans, fontWeight: 600, fontSize: 18, color: "rgba(255,255,255,0.62)", textShadow: SHADOW }}>{o.text}</div>
);

const FADE = 0.5;
export const EpisodeOverlays: React.FC<{ items: O.EpOverlay[]; t: number; layer: "map" | "ui" }> = ({ items, t, layer }) => {
  const { width, height } = useVideoConfig();
  const svg: React.ReactNode[] = [], html: React.ReactNode[] = [];
  items.forEach((o, i) => {
    const from = T(o.from), to = o.to !== undefined ? T(o.to) : Infinity, fo = o.fadeOut ?? FADE;
    if (t < from || t > to + fo) return;
    const ex = t > to ? clamp((t - to) / fo) : 0;
    const p: P = { t, local: t - from, alpha: o.type === "card" ? 1 : 1 - ex, uid: `e${i}`, exit: ex };
    const mapLayer = ["zone", "lines", "offensive", "ring", "flow", "route"].includes(o.type);
    if ((layer === "map") !== mapLayer) return;
    switch (o.type) {
      case "zone": svg.push(<Zone key={i} o={o} {...p} />); break;
      case "lines": svg.push(<Lines key={i} o={o} {...p} />); break;
      case "offensive": svg.push(<Offensive key={i} o={o} {...p} />); break;
      case "ring": svg.push(<Ring key={i} o={o} {...p} />); break;
      case "flow": svg.push(<Flow key={i} o={o} {...p} />); break;
      case "route": svg.push(<Route key={i} o={o} {...p} />); break;
      case "date": html.push(<DateStamp key={i} o={o} {...p} />); break;
      case "card": html.push(<Card key={i} o={o} {...p} />); break;
      case "city": html.push(<City key={i} o={o} {...p} />); break;
      case "circle": html.push(<Circle key={i} o={o} {...p} />); break;
      case "block": html.push(<Block key={i} o={o} {...p} />); break;
      case "frise": html.push(<Frise key={i} o={o} {...p} />); break;
      case "badge": html.push(<Badge key={i} o={o} {...p} />); break;
      case "place": html.push(<Place key={i} o={o} {...p} />); break;
      case "names": html.push(<Names key={i} o={o} {...p} />); break;
      case "end": html.push(<End key={i} o={o} {...p} />); break;
      case "note": html.push(<Note key={i} o={o} {...p} />); break;
    }
  });
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {svg.length > 0 && <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width={width} height={height}>{svg}</svg>}
      {html}
    </div>
  );
};
