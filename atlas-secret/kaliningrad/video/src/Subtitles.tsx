import React from "react";
import { Easing } from "remotion";
import { SEGS } from "./timeline";
import { STYLE } from "./config/style";
const clamp = (x: number) => Math.max(0, Math.min(1, x));

/** Sous-titres : un segment de voix à la fois, **mot** surligné en ambre. */
export const Subtitles: React.FC<{ t: number }> = ({ t }) => {
  const i = SEGS.findIndex((s, k) => t >= s.start - 0.05 && t < Math.min((SEGS[k + 1]?.start ?? Infinity) - 0.05, s.end + 0.7));
  if (i < 0) return null;
  const s = SEGS[i];
  const p = Easing.bezier(0.16, 1, 0.3, 1)(clamp((t - s.start + 0.05) / 0.22));
  const parts = s.text.split(/(\*\*[^*]+\*\*)/).filter(Boolean);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: `${STYLE.subtitleY * 100}%`, display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `translateY(-50%) translateY(${(1 - p) * 10}px)`, opacity: p, maxWidth: STYLE.subtitleMaxWidth, textAlign: "center",
        fontFamily: STYLE.sans, fontWeight: 700, fontSize: STYLE.subtitleSize, lineHeight: 1.28, color: "#fff", textWrap: "balance" as any, letterSpacing: 0.2,
        WebkitTextStroke: "3px rgba(0,0,0,0.55)", paintOrder: "stroke fill", textShadow: "0 2px 3px rgba(0,0,0,0.9), 0 0 18px rgba(0,0,0,0.75)" }}>
        {parts.map((x, k) => x.startsWith("**") ? <span key={k} style={{ color: STYLE.kal }}>{x.slice(2, -2)}</span> : <span key={k}>{x}</span>)}
      </div>
    </div>
  );
};
