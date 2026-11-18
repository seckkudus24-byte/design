import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { MapStage } from "./map/MapStage";
import { Overlays } from "./overlays/Overlays";
import { Subtitles } from "./Subtitles";
import { cameraSpline } from "./camera";
import { CAMERA, FADE_TO_PAST, OVERLAYS, WHOOSH_AT } from "./config/scenes";
import { FPS, SEGS, T, TOTAL } from "./timeline";
import { STYLE } from "./config/style";

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [fonts] = useState(() => delayRender("Polices"));
  useEffect(() => { document.fonts.ready.then(() => continueRender(fonts)); }, [fonts]);
  const past = interpolate(t, [T(FADE_TO_PAST.from), T(FADE_TO_PAST.from) + 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#03070f" }}>
      <AbsoluteFill style={{ filter: past ? `saturate(${1 - 0.45 * past}) sepia(${0.18 * past})` : undefined }}>
        <MapStage camera={cameraSpline(CAMERA, t)}>
          <Overlays items={OVERLAYS} t={t} />
        </MapStage>
      </AbsoluteFill>
      {/* vignette cinéma + dégradé de lisibilité en haut et en bas */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.38) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,7,15,0.4) 0%, rgba(3,7,15,0) 16%, rgba(3,7,15,0) 60%, rgba(3,7,15,0.55) 100%)" }} />
      <Subtitles t={t} />
      {/* signature ATLAS SECRET */}
      <div style={{ position: "absolute", left: STYLE.safeSide, top: 160, display: "flex", alignItems: "center", gap: 12, opacity: 0.9 }}>
        <div style={{ width: 5, height: 30, background: STYLE.kal, boxShadow: `0 0 8px ${STYLE.kal}` }} />
        <div style={{ fontFamily: STYLE.display, fontWeight: 500, fontSize: 28, letterSpacing: 6, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}>{STYLE.brand}</div>
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, bottom: 16, textAlign: "center", fontFamily: STYLE.sans, fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{STYLE.credits}</div>

      {SEGS.map((s) => (
        <Sequence key={s.id} from={Math.round(s.start * FPS)} layout="none"><Audio src={staticFile(`voice/${s.id}.wav`)} /></Sequence>
      ))}
      <Audio src={staticFile("audio/music.wav")} volume={(f) => interpolate(f, [0, 15, TOTAL * FPS - 30, TOTAL * FPS], [0, 0.22, 0.22, 0.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <Sequence from={Math.round((T(WHOOSH_AT) - 0.6) * FPS)} layout="none"><Audio src={staticFile("audio/whoosh.wav")} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};
