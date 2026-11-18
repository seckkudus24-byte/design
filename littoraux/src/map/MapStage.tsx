import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { AbsoluteFill, continueRender, delayRender, useVideoConfig } from "remotion";
import { MAP } from "../config/carte";

export type Camera = { lng: number; lat: number; zoom: number; pitch?: number; bearing?: number };
export type Project = (lnglat: [number, number]) => [number, number];

type Ctx = { project: Project; camera: Camera; ready: boolean };
const MapCtx = createContext<Ctx>({ project: () => [0, 0], camera: { lng: 0, lat: 0, zoom: 0 }, ready: false });
export const useMap = () => useContext(MapCtx);

/**
 * Carte satellite MapLibre pilotée image par image.
 * Chaque image : jumpTo(camera) puis attente de l'événement "idle"
 * (toutes les tuiles chargées et dessinées) avant la capture.
 */
export const MapStage: React.FC<{ camera: Camera; children?: React.ReactNode }> = ({ camera, children }) => {
  const { width, height } = useVideoConfig();
  const el = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [initHandle] = useState(() => delayRender("Chargement de la carte"));

  useEffect(() => {
    const m = new maplibregl.Map({
      container: el.current!,
      style: {
        version: 8,
        projection: { type: "globe" },
        sky: MAP.sky as any,
        sources: {
          sat: { type: "raster", tiles: [MAP.tileUrl], tileSize: 256, maxzoom: MAP.maxTileZoom, attribution: "" },
        },
        layers: [
          { id: "bg", type: "background", paint: { "background-color": MAP.space } },
          { id: "sat", type: "raster", source: "sat", paint: { "raster-saturation": MAP.saturation, "raster-contrast": MAP.contrast, "raster-brightness-min": MAP.brightnessMin, "raster-brightness-max": MAP.brightnessMax, "raster-fade-duration": 0 } },
        ],
      },
      center: [camera.lng, camera.lat],
      zoom: camera.zoom,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
      pixelRatio: 1,
      maxPitch: 85,
      canvasContextAttributes: { preserveDrawingBuffer: true, antialias: true },
    } as any);
    m.once("load", () => { setMap(m); continueRender(initHandle); });
    return () => m.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Positionne la caméra de façon synchrone pour que les calques projettent juste.
  if (map) {
    map.jumpTo({ center: [camera.lng, camera.lat], zoom: camera.zoom, pitch: camera.pitch ?? 0, bearing: camera.bearing ?? 0 });
  }

  useLayoutEffect(() => {
    if (!map) return;
    const h = delayRender("Tuiles");
    let done = false;
    const finish = () => { if (!done) { done = true; continueRender(h); } };
    map.once("idle", finish);
    map.triggerRepaint();
    return finish;
  }, [map, camera.lng, camera.lat, camera.zoom, camera.pitch, camera.bearing]);

  const project: Project = (p) => {
    if (!map) return [0, 0];
    const pt = map.project(p);
    return [pt.x, pt.y];
  };

  return (
    <AbsoluteFill style={{ background: MAP.space }}>
      <div ref={el} style={{ position: "absolute", width, height }} />
      <MapCtx.Provider value={{ project, camera, ready: !!map }}>{map ? children : null}</MapCtx.Provider>
    </AbsoluteFill>
  );
};
