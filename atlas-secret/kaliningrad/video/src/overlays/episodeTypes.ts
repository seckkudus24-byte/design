import type { TimeRef } from "../timeline";
type LngLat = [number, number];
type Life = { from: TimeRef; to?: TimeRef; fadeOut?: number };
/** Tampon de date en haut à gauche (machine à écrire). slot = rang vertical. */
export type DateO = Life & { type: "date"; date: string; text: string; slot?: number };
/** Image d'archive dans un cadre épinglé à un lieu. */
export type CardO = Life & { type: "card"; src: string; pin: LngLat; x: number; y: number; w: number; h: number; credit: string; tilt?: number };
/** Nom de ville : écriture, puis éventuelle désagrégation (dissolve). */
export type CityO = Life & { type: "city"; text: string; at: LngLat; style: "present" | "past"; size?: number; dissolveAt?: TimeRef; dy?: number };
/** Zone (polygone) aux bords adoucis, découpée sur les terres ; clip = rectangle lng/lat optionnel ; wipe = révélation progressive. */
export type ZoneO = Life & { type: "zone"; id: string; fill: string; opacity: number; blur?: number; clip?: [number, number, number, number]; wipe?: "south" | "west"; landClip?: boolean; edge?: string;
  /** Mise en lumière diffuse : seul un disque flou autour de « at » (rayon en km) reste visible. */
  focus?: { at: LngLat; km: number } };
/** Lignes (frontières particulières) : style tireté, lumineux… ; solidAt = passage du tireté au trait plein. */
export type LinesO = Life & { type: "lines"; id: string; color: string; width: number; dash?: string; solidAt?: TimeRef; glow?: boolean; draw?: number; opacity?: number };
/** Flèches d'offensive (épaisses, effilées), chemins en lng/lat. */
export type ArrowsO2 = Life & { type: "offensive"; paths: LngLat[][]; color: string; until: TimeRef; width?: number };
/** Anneau qui se referme autour d'un point. */
export type RingO = Life & { type: "ring"; at: LngLat; km: number; until: TimeRef; color: string };
/** Flux fins (déplacements de population) avec têtes qui progressent. */
export type FlowO = Life & { type: "flow"; lines: LngLat[][]; color: string };
/** Itinéraire (mer, air, rail) avec pictogramme à l'extrémité. */
export type RouteO = Life & { type: "route"; path: LngLat[]; mode: "ship" | "plane" | "train"; color: string; until: TimeRef; label?: string; curve?: number };
/** Cercle géodésique (portée) avec légendes. */
export type CircleO = Life & { type: "circle"; ring: LngLat[]; center: LngLat; until: TimeRef; caption: string; note: string };
/** Bloc de texte éditorial (titre + ligne + sous-titre), centré. */
export type BlockO = Life & { type: "block"; title?: string; lines: string[]; y?: number; size?: number };
/** Frise chronologique (dates qui s'allument une à une). */
export type FriseO = Life & { type: "frise"; items: { date: string; label: string; at: TimeRef }[]; y?: number };
/** Badge « ANALYSE ». */
export type BadgeO = Life & { type: "badge"; text: string };
/** Point de lieu (petite pastille + nom). */
export type PlaceO = Life & { type: "place"; at: LngLat; text: string; color?: string; side?: "left" | "right" };
/** Noms empilés (conclusion). */
export type NamesO = Life & { type: "names"; items: { name: string; sub: string; font: "serif" | "display" | "sans"; at: TimeRef }[]; y?: number };
/** Écran de fin. */
export type EndO = Life & { type: "end" };
/** Mention de source discrète (bas d'écran, au-dessus des crédits). */
export type NoteO = Life & { type: "note"; text: string };
export type EpOverlay = DateO | CardO | CityO | ZoneO | LinesO | ArrowsO2 | RingO | FlowO | RouteO | CircleO | BlockO | FriseO | BadgeO | PlaceO | NamesO | EndO | NoteO;
