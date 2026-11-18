// Analyse de la trajectoire de caméra : vitesse à l'écran et accélération, image par image.
import { cameraSpline } from "../src/camera";
import { CAMERA } from "../src/config/scenes";
import { FPS, TOTAL_FRAMES } from "../src/timeline";
const mx = (l: number) => (l + 180) / 360;
const my = (la: number) => (1 - Math.log(Math.tan(Math.PI / 4 + (la * Math.PI) / 360)) / Math.PI) / 2;
const rows: number[][] = [];
for (let f = 0; f < TOTAL_FRAMES; f++) rows.push([f, ...Object.values(cameraSpline(CAMERA, f / FPS)) as number[]]);
const sp: number[] = [];
for (let i = 1; i < rows.length; i++) {
  const [, l0, a0, z0, p0, b0] = rows[i - 1], [, l1, a1, z1, p1, b1] = rows[i];
  const world = 512 * 2 ** ((z0 + z1) / 2);
  const pan = Math.hypot(mx(l1) - mx(l0), my(a1) - my(a0)) * world;      // px/image
  const zoom = Math.abs(z1 - z0) * 1080 * Math.LN2 / 2;                    // px/image équivalents au bord
  const rot = (Math.abs(b1 - b0) + Math.abs(p1 - p0)) * Math.PI / 180 * 540;
  sp.push(pan + zoom + rot);
}
const acc = sp.slice(1).map((v, i) => Math.abs(v - sp[i]));
const pct = (a: number[], q: number) => [...a].sort((x, y) => x - y)[Math.floor(q * (a.length - 1))];
console.log(`vitesse écran (px/image) : min ${Math.min(...sp).toFixed(2)} · médiane ${pct(sp, 0.5).toFixed(1)} · max ${Math.max(...sp).toFixed(1)}`);
console.log(`variation de vitesse d'une image à l'autre (px) : médiane ${pct(acc, 0.5).toFixed(2)} · 99e centile ${pct(acc, 0.99).toFixed(2)} · max ${Math.max(...acc).toFixed(2)} à l'image ${acc.indexOf(Math.max(...acc)) + 1}`);
console.log("images quasi immobiles (< 0,3 px/image) :", sp.filter((v) => v < 0.3).length);
console.log("profil (1 valeur / 0,5 s) :", sp.filter((_, i) => i % 15 === 0).map((v) => v.toFixed(1)).join(" "));
