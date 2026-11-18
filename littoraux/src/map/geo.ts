// Géométries Natural Earth extraites par `npm run data` (public/geo).
import COG from "../../public/geo/COG.json";
import COD from "../../public/geo/COD.json";
import GMB from "../../public/geo/GMB.json";
import SEN from "../../public/geo/SEN.json";
import TGO from "../../public/geo/TGO.json";
import BEN from "../../public/geo/BEN.json";
import GHA from "../../public/geo/GHA.json";
import GAZ from "../../public/geo/GAZ.json";
import WEB from "../../public/geo/WEB.json";
import AGO from "../../public/geo/AGO.json";
import ISR from "../../public/geo/ISR.json";
import AFRICA from "../../public/geo/AFRICA.json";
import cCOG from "../../public/geo/coast_COG.json";
import cCOD from "../../public/geo/coast_COD.json";
import cGMB from "../../public/geo/coast_GMB.json";
import cTGO from "../../public/geo/coast_TGO.json";
import cGAZ from "../../public/geo/coast_GAZ.json";
import type { Project } from "./MapStage";

type Pos = [number, number];
type Poly = Pos[][];

function polys(g: any): Poly[] {
  if (g.type === "FeatureCollection") return g.features.flatMap((f: any) => polys(f));
  if (g.type === "Feature") return polys(g.geometry);
  if (g.type === "Polygon") return [g.coordinates];
  if (g.type === "MultiPolygon") return g.coordinates;
  return [];
}

export const GEO = { COG, COD, GMB, SEN, TGO, BEN, GHA, GAZ, WEB, AGO, ISR, AFRICA };
export type GeoId = keyof typeof GEO;
export const COAST: Record<string, Pos[]> = { COG: cCOG, COD: cCOD, GMB: cGMB, TGO: cTGO, GAZ: cGAZ } as any;

const cache = new Map<string, Poly[]>();
export const getPolys = (id: GeoId) => {
  if (!cache.has(id)) cache.set(id, polys(GEO[id]));
  return cache.get(id)!;
};

/** Chemin SVG d'un pays projeté à l'écran (sommets < 0,8 px fusionnés). */
export function countryPath(id: GeoId, project: Project) {
  let d = "";
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const poly of getPolys(id)) {
    for (const ring of poly) {
      let px = NaN, py = NaN, n = 0;
      for (const p of ring) {
        const [x, y] = project(p);
        if (n && Math.abs(x - px) < 0.8 && Math.abs(y - py) < 0.8) continue;
        d += (n ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
        px = x; py = y; n++;
        if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y;
      }
      d += "Z";
    }
  }
  return { d, box: { x: minX, y: minY, w: maxX - minX, h: maxY - minY } };
}

/** Tronçons de côte (éventuellement limités à un rectangle lng/lat) projetés. */
export function coastPaths(id: string, project: Project, clip?: [number, number, number, number]) {
  const pts = COAST[id];
  const runs: [number, number][][] = [];
  let cur: [number, number][] = [];
  for (const p of pts) {
    const inside = !clip || (p[0] >= clip[0] && p[1] >= clip[1] && p[0] <= clip[2] && p[1] <= clip[3]);
    if (inside) cur.push(project(p));
    else if (cur.length) { runs.push(cur); cur = []; }
  }
  if (cur.length) runs.push(cur);
  return runs;
}

export const toD = (pts: [number, number][]) => pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("");
