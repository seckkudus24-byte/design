import React from "react";
import { Easing } from "remotion";
import { LINES } from "./timeline";
import { STYLE } from "./config/style";

const clamp = (x: number) => Math.max(0, Math.min(1, x));

/** Sous-titres synchronisés : une phrase à la fois, **mot** = surligné. */
export const Subtitles: React.FC<{ t: number }> = ({ t }) => {
  const i = LINES.findIndex((l, k) => t >= l.start - 0.05 && t < (LINES[k + 1]?.start ?? Infinity) - 0.05 && t < l.end + 0.6);
  if (i < 0) return null;
  const l = LINES[i];
  const p = Easing.bezier(0.34, 1.56, 0.64, 1)(clamp((t - l.start + 0.05) / 0.18));
  const parts = l.text.split(/(\*\*[^*]+\*\*)/).filter(Boolean);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: `${STYLE.subtitleY * 100}%`, display: "flex", justifyContent: "center" }}>
      <div style={{
        transform: `translateY(-50%) scale(${0.92 + 0.08 * p})`, opacity: clamp(p * 1.5), textAlign: "center", maxWidth: STYLE.subtitleMaxWidth,
        fontFamily: STYLE.subtitleFont, fontWeight: 800, fontSize: STYLE.subtitleSize, lineHeight: 1.2, color: "#fff", textWrap: "balance" as any,
        WebkitTextStroke: "7px rgba(0,0,0,0.92)", paintOrder: "stroke fill", textShadow: "0 3px 10px rgba(0,0,0,0.7)", letterSpacing: 0.3,
      }}>
        {parts.map((s, k) => s.startsWith("**")
          ? <span key={k} style={{ color: STYLE.accent }}>{s.slice(2, -2)}</span>
          : <span key={k}>{s}</span>)}
      </div>
    </div>
  );
};
