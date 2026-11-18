import type { GeoId } from "../map/geo";
import type { TimeRef } from "../timeline";
import type { FlagId } from "../flags";

type LngLat = [number, number];
type Life = { from: TimeRef; to?: TimeRef };

/** Pays : contour lumineux qui se dessine, puis drapeau (ou couleur) ondulant. */
export type CountryO = Life & {
  type: "country"; id: GeoId; flag?: FlagId; fill?: string; opacity?: number;
  outline?: string | false; draw?: number; fillDelay?: number; wave?: boolean;
  /** Décalage animé en pixels (ex. un voisin qui « pousse »). */
  shift?: { dx: number; dy: number; from: TimeRef; to: TimeRef };
};
/** Étiquette encadrée reliée au point par un trait. */
export type LabelO = Life & { type: "label"; text: string; at: LngLat; dx?: number; dy?: number; size?: number };
/** Littoral surligné (données calculées) + texte de mesure. */
export type CoastO = Life & { type: "coast"; id: string; clip?: [number, number, number, number]; text?: string; side?: 1 | -1; textOffset?: number; color?: string };
/** Flèches courbes rouge/bleu partant de points géographiques. */
export type ArrowsO = Life & { type: "arrows"; points: LngLat[]; dir: [number, number]; bend?: number };
/** Flèche de mesure horizontale avec texte (ex. « 500 km »). */
export type MeasureO = Life & { type: "measure"; a: LngLat; b: LngLat; text: string; dy?: number };
/** Cercle tracé à la main autour d'un point. */
export type ScribbleO = Life & { type: "scribble"; at: LngLat; r: number; color?: string };
/** Voile coloré sur tout l'écran sauf certains pays. */
export type MaskO = Life & { type: "mask"; except: GeoId[]; color: string; opacity?: number };
/** Visage expressif posé sur un pays. */
export type FaceO = Life & { type: "face"; at: LngLat; size: number; mood: "angry" | "cry" };

export type Overlay = CountryO | LabelO | CoastO | ArrowsO | MeasureO | ScribbleO | MaskO | FaceO;
