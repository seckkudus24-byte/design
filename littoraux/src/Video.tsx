import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { MapStage } from "./map/MapStage";
import { Overlays } from "./overlays/Overlays";
import { Subtitles } from "./Subtitles";
import { cameraAt } from "./camera";
import { CAMERA, OVERLAYS, TRANSITIONS } from "./config/scenes";
import { FPS, LINES, T, TOTAL } from "./timeline";
import { STYLE } from "./config/style";

const Flash: React.FC<{ t: number }> = ({ t }) => {
  let a = 0;
  for (const ref of TRANSITIONS) {
    const d = t - (T(ref) + 0.05);
    if (d > -0.08 && d < 0.35) a = Math.max(a, d < 0 ? (d + 0.08) / 0.08 : 1 - d / 0.35);
  }
  return a > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: a * 0.45, mixBlendMode: "screen" }} /> : null;
};

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [fonts] = useState(() => delayRender("Polices"));
  useEffect(() => { document.fonts.ready.then(() => continueRender(fonts)); }, [fonts]);

  return (
    <AbsoluteFill style={{ background: "#02060f" }}>
      <MapStage camera={cameraAt(CAMERA, t)}>
        <Overlays items={OVERLAYS} t={t} />
      </MapStage>
      {/* étalonnage : vignette + légère dominante chaude */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
      <Flash t={t} />
      <Subtitles t={t} />
      {STYLE.watermark && (
        <div style={{ position: "absolute", left: 40, bottom: 120, fontFamily: STYLE.subtitleFont, fontWeight: 800, fontSize: 34, color: "#fff",
          borderLeft: "6px solid #ffb400", paddingLeft: 12, textShadow: "0 2px 6px #000" }}>{STYLE.watermark}</div>
      )}
      <div style={{ position: "absolute", right: 24, bottom: 14, fontFamily: STYLE.labelFont, fontSize: 17, color: "rgba(255,255,255,0.55)" }}>{STYLE.credits}</div>

      {/* Audio : voix phrase par phrase, musique, whooshes */}
      {LINES.map((l) => (
        <Sequence key={l.id} from={Math.round(l.start * FPS)} layout="none">
          <Audio src={staticFile(`voice/${l.id}.wav`)} />
        </Sequence>
      ))}
      <Audio src={staticFile("audio/music.wav")} volume={(f) => interpolate(f, [0, 20, TOTAL * FPS - 45, TOTAL * FPS], [0, 0.16, 0.16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {TRANSITIONS.map((ref) => (
        <Sequence key={ref} from={Math.max(0, Math.round((T(ref) - 0.35) * FPS))} layout="none">
          <Audio src={staticFile("audio/whoosh.wav")} volume={0.55} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
