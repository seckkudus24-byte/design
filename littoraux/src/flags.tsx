import React from "react";

// Drapeaux dessinés en SVG (viewBox 300×200, étirés sur la forme du pays).
const star = (cx: number, cy: number, r: number, rot = -90) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = ((rot + i * 36) * Math.PI) / 180, rr = i % 2 ? r * 0.382 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
};

export const FLAGS: Record<string, React.ReactNode> = {
  // République du Congo
  COG: (<>
    <rect width="300" height="200" fill="#FBDE4A" />
    <polygon points="0,0 200,0 0,200" fill="#009543" />
    <polygon points="300,0 300,200 100,200" fill="#DC241F" />
  </>),
  // République démocratique du Congo
  COD: (<>
    <rect width="300" height="200" fill="#007FFF" />
    <polygon points="0,170 255,0 300,0 300,30 45,200 0,200" fill="#F7D618" />
    <polygon points="0,185 277,0 300,0 300,15 23,200 0,200" fill="#CE1021" />
    <polygon points={star(55, 50, 32)} fill="#F7D618" />
  </>),
  GMB: (<>
    <rect width="300" height="200" fill="#3A7728" />
    <rect width="300" height="66.7" fill="#CE1126" />
    <rect y="66.7" width="300" height="66.6" fill="#fff" />
    <rect y="77.8" width="300" height="44.4" fill="#0C1C8C" />
  </>),
  SEN: (<>
    <rect width="100" height="200" fill="#00853F" />
    <rect x="100" width="100" height="200" fill="#FDEF42" />
    <rect x="200" width="100" height="200" fill="#E31B23" />
    <polygon points={star(150, 100, 34)} fill="#00853F" />
  </>),
  TGO: (<>
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} y={i * 40} width="300" height="40" fill={i % 2 ? "#FFCE00" : "#006A4E"} />)}
    <rect width="120" height="120" fill="#D21034" />
    <polygon points={star(60, 60, 34)} fill="#fff" />
  </>),
  BEN: (<>
    <rect width="300" height="100" fill="#FCD116" />
    <rect y="100" width="300" height="100" fill="#E8112D" />
    <rect width="120" height="200" fill="#008751" />
  </>),
  PSE: (<>
    <rect width="300" height="67" fill="#000" />
    <rect y="66.5" width="300" height="67" fill="#fff" />
    <rect y="133" width="300" height="67" fill="#007A3D" />
    <polygon points="0,0 115,100 0,200" fill="#CE1126" />
  </>),
};
export type FlagId = keyof typeof FLAGS;
