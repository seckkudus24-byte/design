import { Easing } from "remotion";
import type { Camera } from "./map/MapStage";
import { T, TimeRef } from "./timeline";

export type Key = Camera & {
  at: TimeRef;
  /** Courbe de vitesse pour arriver sur cette image-clé. */
  ease?: "inOut" | "out" | "in" | "linear" | "soft";
  /**
   * Ampleur du « vol » (0 = trajectoire droite, ~1.2 = vol cartographique classique).
   * La caméra prend de l'altitude d'elle-même en fonction de la distance (van Wijk & Nuij),
   * comme le flyTo des cartes interactives.
   */
  fly?: number;
};

const EASE = {
  inOut: Easing.bezier(0.45, 0, 0.25, 1),
  soft: Easing.bezier(0.33, 0, 0.2, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.5, 0, 0.75, 0),
  linear: (x: number) => x,
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Mercator normalisé [0,1]
const mx = (lng: number) => (lng + 180) / 360;
const my = (lat: number) => (1 - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / Math.PI) / 2;
const ilng = (x: number) => x * 360 - 180;
const ilat = (y: number) => (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI;
const VIEW = 1080 / 512; // largeur de vue en tuiles « monde » à zoom 0

/** Interpolation zoom+déplacement optimale (van Wijk & Nuij 2003, comme d3.interpolateZoom). */
function flight(a: Camera, b: Camera, rho: number) {
  const x0 = mx(a.lng), y0 = my(a.lat), w0 = VIEW / 2 ** a.zoom;
  const x1 = mx(b.lng), y1 = my(b.lat), w1 = VIEW / 2 ** b.zoom;
  const dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
  const r2 = rho * rho, r4 = r2 * r2;
  if (d2 < 1e-12 || rho < 1e-3) {
    // pas de vol : déplacement droit avec zoom exponentiel cohérent
    return (p: number) => ({ x: x0 + dx * p, y: y0 + dy * p, zoom: lerp(a.zoom, b.zoom, p) });
  }
  const d1 = Math.sqrt(d2);
  const b0 = (w1 * w1 - w0 * w0 + r4 * d2) / (2 * w0 * r2 * d1);
  const b1 = (w1 * w1 - w0 * w0 - r4 * d2) / (2 * w1 * r2 * d1);
  const rr0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  const rr1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const S = (rr1 - rr0) / rho;
  return (p: number) => {
    const s = p * S;
    const u = (w0 / (r2 * d1)) * (Math.cosh(rr0) * Math.tanh(rho * s + rr0) - Math.sinh(rr0));
    const w = (w0 * Math.cosh(rr0)) / Math.cosh(rho * s + rr0);
    return { x: x0 + u * dx, y: y0 + u * dy, zoom: Math.log2(VIEW / w) };
  };
}

/** Caméra à l'instant t (s) d'après la liste d'images-clés. */
export function cameraAt(keys: Key[], t: number): Camera {
  const ks = keys.map((k) => ({ ...k, t: T(k.at) }));
  if (t <= ks[0].t) return ks[0];
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i], b = ks[i + 1];
    if (t <= b.t) {
      const p = EASE[b.ease ?? "inOut"]((t - a.t) / Math.max(1e-6, b.t - a.t));
      const f = flight(a, b, b.fly ?? 0.9)(p);
      return {
        lng: ilng(f.x), lat: ilat(f.y), zoom: f.zoom,
        pitch: lerp(a.pitch ?? 0, b.pitch ?? 0, p),
        bearing: lerp(a.bearing ?? 0, b.bearing ?? 0, p),
      };
    }
  }
  const z = ks[ks.length - 1];
  return { ...z, zoom: z.zoom + 0.03 * (t - z.t) };
}

/**
 * Trajectoire continue (aucun arrêt aux images-clés) : interpolation cubique monotone
 * (Fritsch–Carlson) de chaque grandeur — position Mercator, zoom, inclinaison, rotation.
 * La vitesse varie sans à-coup ; le départ et l'arrivée sont adoucis.
 */
export function cameraSpline(keys: Key[], t: number): Camera {
  const ks = keys.map((k) => ({ t: T(k.at), v: [mx(k.lng), my(k.lat), k.zoom, k.pitch ?? 0, k.bearing ?? 0] }));
  const n = ks.length;
  if (t <= ks[0].t) return fromV(ks[0].v);
  if (t >= ks[n - 1].t) return fromV(ks[n - 1].v);
  const C = 5;
  // pentes par canal
  const m: number[][] = Array.from({ length: n }, () => Array(C).fill(0));
  for (let c = 0; c < C; c++) {
    const d = [] as number[];
    for (let i = 0; i < n - 1; i++) d.push((ks[i + 1].v[c] - ks[i].v[c]) / (ks[i + 1].t - ks[i].t));
    for (let i = 1; i < n - 1; i++) {
      if (d[i - 1] * d[i] <= 0) m[i][c] = 0;
      else {
        const h0 = ks[i].t - ks[i - 1].t, h1 = ks[i + 1].t - ks[i].t;
        const w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
        m[i][c] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
      }
    }
    m[0][c] = d[0] * 0.6; // la caméra est déjà en mouvement à la première image
    m[n - 1][c] = d[n - 2] * 0.5; // la caméra continue de glisser en fin de plan
  }
  let i = 0;
  while (t > ks[i + 1].t) i++;
  const h = ks[i + 1].t - ks[i].t, s = (t - ks[i].t) / h;
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
  const v = ks[i].v.map((a, c) => h00 * a + h10 * h * m[i][c] + h01 * ks[i + 1].v[c] + h11 * h * m[i + 1][c]);
  return fromV(v);
}
function fromV(v: number[]): Camera {
  return { lng: ilng(v[0]), lat: ilat(v[1]), zoom: v[2], pitch: v[3], bearing: v[4] };
}
