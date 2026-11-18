import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { MapStage } from "./map/MapStage";
import { Overlays } from "./overlays/Overlays";
import { EpisodeOverlays } from "./overlays/Episode";
import { Subtitles } from "./Subtitles";
import { cameraSpline } from "./camera";
import { CAMERA_EP, EP, GRADE, MODERN_EP, PROTO_EP } from "./config/episode";
import { FPS, SEGS, T } from "./timeline";
import { STYLE } from "./config/style";

const ramp = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const OVER = [...PROTO_EP, ...MODERN_EP];

/** Épisode complet. Jusqu'à la fin de la scène 2, identique à la composition « Prototype ». */
export const VideoEpisode: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [fonts] = useState(() => delayRender("Polices"));
  useEffect(() => { document.fonts.ready.then(() => continueRender(fonts)); }, [fonts]);
  // Étalonnage. p = désaturation de fin de scène 2 : appliquée à toute l'image comme dans le prototype
  // (jonction identique), puis transférée à la carte seule pendant la scène 3.
  // q = sépia « archives » (scènes 4–8) sur la CARTE seulement : les couleurs-codes restent justes.
  // Retour aux couleurs actuelles en 1991.
  const back = 1 - ramp(t, T(GRADE.out[0]), T(GRADE.out[1]));
  const p = ramp(t, T(GRADE.pFrom), T(GRADE.pFrom) + 0.7) * back;
  const toMap = ramp(t, T("s3a"), T("s3b"));
  const pw = p * (1 - toMap), pm = p * toMap;
  const q = ramp(t, T(GRADE.qIn[0]), T(GRADE.qIn[1])) * back;
  const filter = pw ? `saturate(${1 - 0.45 * pw}) sepia(${0.18 * pw})` : undefined;
  const mapFilter = pm || q ? `saturate(${1 - 0.45 * pm - 0.15 * q}) sepia(${0.18 * pm + 0.3 * q}) brightness(${1 + 0.08 * q}) contrast(${1 - 0.04 * q})` : undefined;
  return (
    <AbsoluteFill style={{ background: "#03070f" }}>
      <AbsoluteFill style={{ filter }}>
        <MapStage camera={cameraSpline(CAMERA_EP, t)} mapFilter={mapFilter}>
          <EpisodeOverlays items={EP} t={t} layer="map" />
          <Overlays items={OVER} t={t} />
          <EpisodeOverlays items={EP} t={t} layer="ui" />
        </MapStage>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.38) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,7,15,0.4) 0%, rgba(3,7,15,0) 16%, rgba(3,7,15,0) 60%, rgba(3,7,15,0.55) 100%)" }} />
      <Subtitles t={t} />
      <div style={{ position: "absolute", left: STYLE.safeSide, top: 160, display: "flex", alignItems: "center", gap: 12, opacity: 0.9 }}>
        <div style={{ width: 5, height: 30, background: STYLE.kal, boxShadow: `0 0 8px ${STYLE.kal}` }} />
        <div style={{ fontFamily: STYLE.display, fontWeight: 500, fontSize: 28, letterSpacing: 6, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}>{STYLE.brand}</div>
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, bottom: 16, textAlign: "center", fontFamily: STYLE.sans, fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{STYLE.credits}</div>
      {/* L'audio final est mixé à part (scripts/mixaudio.mjs) ; ces pistes servent à l'aperçu dans le Studio. */}
      {SEGS.map((s) => (
        <Sequence key={s.id} from={Math.round(s.start * FPS)} layout="none"><Audio src={staticFile(`voice/${s.id}.wav`)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
