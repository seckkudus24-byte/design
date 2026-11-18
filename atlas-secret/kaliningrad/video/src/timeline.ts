import narration from "./config/narration.json";
import timings from "./generated/timings.json";

export const FPS = 30;
export type Seg = { id: string; scene: number; text: string; start: number; end: number };

export const SEGS: Seg[] = (() => {
  let t = narration.lead;
  return narration.segments.map((s: any) => {
    const d = (timings as Record<string, number>)[s.id] ?? 2;
    const seg = { id: s.id, scene: s.scene, text: s.text, start: t, end: t + d };
    t += d + (s.pauseAfter ?? 0.3);
    return seg;
  });
})();
const lastPause = (narration.segments[narration.segments.length - 1] as any).pauseAfter ?? 0.5;
export const TOTAL = SEGS[SEGS.length - 1].end + lastPause;
export const TOTAL_FRAMES = Math.round(TOTAL * FPS);
export const sceneStart = (n: number) => SEGS.find((s) => s.scene === n)!.start;

/** Temps en s, ou relatif à un segment : "s2a", "s2a:end", "s2a@0.5", "s2a+0.3". */
export type TimeRef = number | string;
const byId = new Map(SEGS.map((s) => [s.id, s]));
export function T(ref: TimeRef): number {
  if (typeof ref === "number") return ref;
  if (ref === "end") return TOTAL;
  const m = ref.match(/^(\w+?)(:end|@([\d.]+))?([+-][\d.]+)?$/);
  if (!m || !byId.has(m[1])) throw new Error("Référence de temps invalide : " + ref);
  const s = byId.get(m[1])!;
  let t = m[2] === ":end" ? s.end : m[3] ? s.start + (s.end - s.start) * parseFloat(m[3]) : s.start;
  if (m[4]) t += parseFloat(m[4]);
  return t;
}
