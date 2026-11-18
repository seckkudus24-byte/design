// Géométries Natural Earth 1:10M extraites par `npm run data` (public/geo).
import KAL from "../../public/geo/KAL.json";
import RUS_MAIN from "../../public/geo/RUS_MAIN.json";
import POL from "../../public/geo/POL.json";
import LTU from "../../public/geo/LTU.json";
import LVA from "../../public/geo/LVA.json";
import BLR from "../../public/geo/BLR.json";
import EST from "../../public/geo/EST.json";
import BORDERS from "../../public/geo/BORDERS.json";
import MEASURE from "../../public/geo/measure.json";
import type { Project } from "./MapStage";

type Pos = [number, number];
export const GEO = { KAL, RUS_MAIN, POL, LTU, LVA, BLR, EST } as unknown as Record<string, { coordinates: Pos[][][] }>;
export type GeoId = keyof typeof GEO | "KAL" | "RUS_MAIN" | "POL" | "LTU" | "LVA" | "BLR" | "EST";
export const MEASURE_KAL_RUS = MEASURE as unknown as { km: number; from: Pos; to: Pos };

/**
 * Visibilité : sur le globe, un point trop éloigné du centre de la vue (derrière l'horizon)
 * se projette n'importe où. On coupe donc les tracés au-delà d'un rayon lié au zoom.
 */
export type Visible = (p: Pos) => boolean;
export function visibility(cam: { lng: number; lat: number; zoom: number }): Visible {
  const r = Math.PI / 180, widthDeg = (360 * 1080) / (512 * 2 ** cam.zoom);
  const maxDeg = Math.min(70, Math.max(4, widthDeg * 2.4));
  const cosMax = Math.cos(maxDeg * r), la = cam.lat * r, lo = cam.lng * r, sl = Math.sin(la), cl = Math.cos(la);
  return (p) => sl * Math.sin(p[1] * r) + cl * Math.cos(p[1] * r) * Math.cos(p[0] * r - lo) >= cosMax;
}

/** Chemin SVG d'une liste d'anneaux projetés (sommets < 0,7 px fusionnés, points cachés exclus). */
function ringsPath(rings: Pos[][], project: Project, close: boolean, vis?: Visible) {
  let d = "";
  for (const ring of rings) {
    let px = NaN, py = NaN, n = 0;
    for (const p of ring) {
      if (vis && !vis(p)) { if (!close) n = 0; continue; }
      const [x, y] = project(p);
      if (n && Math.abs(x - px) < 0.7 && Math.abs(y - py) < 0.7) continue;
      d += (n ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
      px = x; py = y; n++;
    }
    if (close) d += "Z";
  }
  return d;
}
export const regionPath = (id: GeoId, project: Project, vis?: Visible) => ringsPath(GEO[id].coordinates.flat(), project, true, vis);
export const bordersPath = (project: Project, vis?: Visible) => ringsPath((BORDERS as any).coordinates, project, false, vis);
