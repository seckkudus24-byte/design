import { Easing } from "remotion";
import type { Camera } from "./map/MapStage";
import { T, TimeRef } from "./timeline";

export type Key = Camera & {
  at: TimeRef;
  /** Courbe d'arrivée sur cette image-clé. */
  ease?: "inOut" | "out" | "in" | "linear" | "snap";
  /** Dézoom au milieu du trajet (vol « en cloche » entre deux régions). */
  arc?: number;
};

const EASE = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  linear: (x: number) => x,
  snap: Easing.bezier(0.85, 0, 0.15, 1),
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Caméra à l'instant t (s) d'après la liste d'images-clés. */
export function cameraAt(keys: Key[], t: number): Camera {
  const ks = keys.map((k) => ({ ...k, t: T(k.at) }));
  if (t <= ks[0].t) return ks[0];
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i], b = ks[i + 1];
    if (t <= b.t) {
      const p = EASE[b.ease ?? "inOut"]((t - a.t) / Math.max(1e-6, b.t - a.t));
      // Interpolation du zoom en échelle linéaire pour un mouvement régulier.
      const zoom = lerp(a.zoom, b.zoom, p) - (b.arc ?? 0) * Math.sin(Math.PI * p);
      return {
        lng: lerp(a.lng, b.lng, p),
        lat: lerp(a.lat, b.lat, p),
        zoom,
        pitch: lerp(a.pitch ?? 0, b.pitch ?? 0, p),
        bearing: lerp(a.bearing ?? 0, b.bearing ?? 0, p),
      };
    }
  }
  const z = ks[ks.length - 1];
  // Après la dernière clé : très lente poussée avant pour garder l'image vivante.
  return { ...z, zoom: z.zoom + 0.03 * (t - z.t) };
}
