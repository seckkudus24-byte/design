import type { TimeRef } from "../timeline";
import type { GeoId } from "../map/geo";
type LngLat = [number, number];
type Life = { from: TimeRef; to?: TimeRef; fadeOut?: number };

export type RegionO = Life & { type: "region"; id: GeoId; fill: string; opacity: number; stroke?: string; strokeWidth?: number; glow?: boolean; draw?: number };
export type BordersO = Life & { type: "borders"; opacity?: number };
export type LabelO = Life & { type: "label"; text: string; at: LngLat; kind: "country" | "sea" | "place"; color?: string; size?: number };
export type TitleO = Life & { type: "title"; text: string; caption?: string; y?: number };
export type LinkO = Life & { type: "link"; a: LngLat; b: LngLat; mark?: string };
export type MeasureO = Life & { type: "measure"; a: LngLat; b: LngLat; km: number; until: TimeRef; caption: string };
export type StatO = Life & { type: "stat"; value: string; caption: string; y?: number };
export type Overlay = RegionO | BordersO | LabelO | TitleO | LinkO | MeasureO | StatO;
