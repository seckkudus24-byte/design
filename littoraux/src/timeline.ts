import narration from "./config/narration.json";
import timings from "./generated/timings.json";

export const FPS = 30;
/** Silence avant la première phrase (s). */
export const LEAD = 0.25;

export type Line = { id: string; text: string; start: number; end: number };

export const LINES: Line[] = (() => {
  let t = LEAD;
  return narration.lines.map((l: any) => {
    const d = (timings as Record<string, number>)[l.id] ?? 2;
    const line = { id: l.id, text: l.text, start: t, end: t + d };
    t += d + (l.pauseAfter ?? narration.gapAfter);
    return line;
  });
})();

const last: any = narration.lines[narration.lines.length - 1];
export const TOTAL = LINES[LINES.length - 1].end + (last.pauseAfter ?? 0.5);
export const TOTAL_FRAMES = Math.ceil(TOTAL * FPS);

/**
 * Référence temporelle, en secondes ou relative à une phrase :
 *   "l05"        début de la phrase l05
 *   "l05:end"    fin de la phrase
 *   "l05@0.5"    à 50 % de la phrase
 *   "l05+0.3"    0,3 s après le début (combinable : "l05:end-0.2")
 */
export type TimeRef = number | string;
const byId = new Map(LINES.map((l) => [l.id, l]));
export function T(ref: TimeRef): number {
  if (typeof ref === "number") return ref;
  const m = ref.match(/^(\w+?)(:end|@([\d.]+))?([+-][\d.]+)?$/);
  if (!m || !byId.has(m[1])) throw new Error("Référence de temps invalide : " + ref);
  const l = byId.get(m[1])!;
  let t = l.start;
  if (m[2] === ":end") t = l.end;
  else if (m[3]) t = l.start + (l.end - l.start) * parseFloat(m[3]);
  if (m[4]) t += parseFloat(m[4]);
  return t;
}
