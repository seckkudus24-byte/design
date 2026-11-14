"""Inpainting vidéo par propagation guidée par flux optique, bidirectionnelle.

Fonctionne sur CPU. Principe (même famille que FGVC / ProPainter, sans réseau
de neurones vidéo) :

1. Flux optique (DIS) entre l'image t et ses voisines. Dans la zone du texte,
   le flux est inconnu : on le complète par interpolation lisse depuis le
   contour (les sous-titres sont des bandes fines, le mouvement derrière se
   déduit bien de celui autour).
2. Observations directes : on récupère les VRAIS pixels de l'arrière-plan
   dans les images voisines (±1…±12) et lointaines (±20…±60) qui ne sont pas
   couverts par du texte à cet endroit. Chaque tuile n'accepte une source que
   si l'alignement est validé sur l'anneau de pixels connus qui l'entoure
   (avec correction de luminosité).
3. Propagation avant puis arrière : le contenu reconstruit est transporté
   image par image le long du flux, avec un « âge » par pixel (nombre de pas
   depuis une vraie observation). Le résultat final mélange les deux sens en
   favorisant l'information la plus récente → pas de dérive, pas de
   scintillement.
4. Ce qui n'a jamais été visible est créé par un modèle d'image (LaMa) une
   seule fois, puis propagé (stable dans le temps).
"""
from __future__ import annotations

import cv2
import numpy as np

from .base import ImageInpainter
from .clip import ClipInpainter


def harmonic_fill(img: np.ndarray, hole: np.ndarray, iters: int = 40) -> np.ndarray:
    """Remplit `hole` d'une image float 1 canal par interpolation lisse."""
    hole = hole > 0
    if not hole.any():
        return img
    known = (~hole).astype(np.float32)
    val = img * known
    est = img.copy()
    todo = hole.copy()
    k = 3
    while todo.any() and k < 4 * max(img.shape):
        num = cv2.blur(val, (k, k))
        den = cv2.blur(known, (k, k))
        ok = todo & (den > 1e-3)
        est[ok] = num[ok] / den[ok]
        todo &= ~ok
        k = k * 2 + 1
    for _ in range(iters):
        avg = cv2.blur(est, (3, 3))
        est[hole] = avg[hole]
    return est


class FlowPropInpainter(ClipInpainter):
    name = "flowprop"

    def __init__(self, fallback: ImageInpainter, near=(1, 2, 3, 4, 6, 8, 12), far_step: int = 10,
                 far_max: int = 60, ring_thresh: float = 9.0, tau: float = 6.0, model_age: float = 30.0,
                 flow_scale: float | None = None, feather: float = 1.2, texture_k: float = 0.5):
        self.fallback = fallback
        self.near = sorted(set(near))
        self.far = [d for d in range(far_step, far_max + 1, far_step) if d > max(self.near)]
        self.ring_thresh, self.tau, self.model_age = ring_thresh, tau, model_age
        self.flow_scale, self.feather, self.texture_k = flow_scale, feather, texture_k
        self.dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
        self.stats = {"masked_frames": 0, "px_total": 0, "px_direct": 0, "px_propagated": 0,
                      "px_model": 0, "model_frames": 0}

    # ------------------------------------------------------------ préparation
    def _prepare(self, frames, masks):
        h, w = frames[0].shape[:2]
        self.h, self.w = h, w
        self.s = s = self.flow_scale or (0.5 if max(h, w) >= 900 else 1.0)
        self.sw, self.sh = max(8, int(round(w * s))), max(8, int(round(h * s)))
        self.M = [m > 0 for m in masks]
        self.G, self.Hs = [], []
        for f, m in zip(frames, self.M):
            g = cv2.resize(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), (self.sw, self.sh), interpolation=cv2.INTER_AREA)
            hs = cv2.resize(m.astype(np.uint8), (self.sw, self.sh), interpolation=cv2.INTER_NEAREST)
            hs = cv2.dilate(hs, np.ones((3, 3), np.uint8))
            if hs.any():
                g = cv2.inpaint(g, hs, 3, cv2.INPAINT_TELEA)
            self.G.append(np.ascontiguousarray(g))
            self.Hs.append(hs)
        self.gy, self.gx = np.mgrid[0:h, 0:w].astype(np.float32)
        self.flows: dict = {}
        self.geom: dict = {}

    def _geometry(self, t):
        """Anneau de pixels connus autour du trou et découpage en tuiles."""
        if t in self.geom:
            return self.geom[t]
        Mt = self.M[t]
        ys = np.nonzero(Mt.any(1))[0]
        hh = max(8, int(ys.max() - ys.min() + 1)) if len(ys) else 8
        # hauteur typique d'une ligne : médiane des hauteurs de composantes
        n, _, st, _ = cv2.connectedComponentsWithStats(Mt.astype(np.uint8))
        if n > 1:
            hh = max(8, int(np.median(st[1:, cv2.CC_STAT_HEIGHT])))
        r = max(4, int(round(hh * 0.12)))
        k = np.ones((2 * r + 1, 2 * r + 1), np.uint8)
        dil = cv2.dilate(Mt.astype(np.uint8), k)
        ring = (dil > 0) & ~Mt
        tile = max(64, int(hh * 1.5))
        _, comp = cv2.connectedComponents(dil)
        zones = comp * (self.w // tile + 1) + (np.arange(self.w) // tile)[None, :]
        zones[comp == 0] = -1
        zl = [(zones == z) for z in np.unique(zones[Mt])]
        self.geom[t] = (ring, zl)
        return self.geom[t]

    def _flow(self, t, s_):
        key = (t, s_)
        if key not in self.flows:
            fl = self.dis.calc(self.G[t], self.G[s_], None)
            if self.Hs[t].any():
                for c in range(2):
                    fl[..., c] = harmonic_fill(np.ascontiguousarray(fl[..., c]), self.Hs[t])
            fl = cv2.resize(fl, (self.w, self.h), interpolation=cv2.INTER_LINEAR) / self.s
            self.flows[key] = fl
        return self.flows[key]

    def _warp(self, img, fl, interp=cv2.INTER_CUBIC):
        mx, my = self.gx + fl[..., 0], self.gy + fl[..., 1]
        out = cv2.remap(img, mx, my, interp, borderMode=cv2.BORDER_REPLICATE)
        oob = (mx < 0) | (my < 0) | (mx > self.w - 1) | (my > self.h - 1)
        return out, oob, mx, my

    def _accept(self, t, Ft, Gt, warped, bad, want):
        """Tuiles où la source est bien alignée (vérifié sur l'anneau). Renvoie (masque, image corrigée)."""
        ring, zones = self._geometry(t)
        usable = want & ~bad
        acc = np.zeros_like(want)
        if not usable.any():
            return acc, None
        wf = warped.astype(np.float32)
        err = np.abs(cv2.cvtColor(warped, cv2.COLOR_BGR2GRAY).astype(np.float32) - Gt)
        ring_ok = ring & ~bad
        # Tolérance adaptée à la texture : un léger décalage sous-pixel coûte plus sur une foule que sur un mur.
        gx = cv2.Sobel(Gt, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(Gt, cv2.CV_32F, 0, 1, ksize=3)
        grad = (np.abs(gx) + np.abs(gy)) / 8.0
        out = wf
        for zm in zones:
            zu = usable & zm
            if not zu.any():
                continue
            zr = ring_ok & zm
            thr = self.ring_thresh + self.texture_k * float(grad[zr].mean()) if zr.any() else 0
            if int(zr.sum()) < 12 or float(err[zr].mean()) > thr:
                continue
            off = np.clip((Ft[zr] - wf[zr]).mean(0), -25, 25)
            out[zu] += off
            acc |= zu
        return acc, out

    # ---------------------------------------------------------------- passes
    def inpaint_clip(self, frames, masks, known=0, progress=None):
        N = len(frames)
        self._prepare(frames, masks)
        F = frames
        prog = (lambda p: progress(p)) if progress else (lambda p: None)
        todo = [t for t in range(N) if self.M[t].any()]
        if not todo:
            return list(frames)
        steps = 3 * len(todo)
        done = 0

        # 1) observations directes
        direct = {}
        offsets = []
        for d in self.near + self.far:
            offsets += [-d, d]
        for t in todo:
            Mt = self.M[t]
            Ft = F[t].astype(np.float32)
            Gt = cv2.cvtColor(F[t], cv2.COLOR_BGR2GRAY).astype(np.float32)
            rem = Mt.copy()
            val = np.zeros_like(Ft)
            for d in offsets:
                s_ = t + d
                if not (0 <= s_ < N) or not rem.any():
                    continue
                fl = self._flow(t, s_)
                warped, oob, mx, my = self._warp(F[s_], fl)
                wm = cv2.remap(self.M[s_].astype(np.uint8), mx, my, cv2.INTER_NEAREST,
                               borderMode=cv2.BORDER_CONSTANT, borderValue=1) > 0
                acc, wf = self._accept(t, Ft, Gt, warped, wm | oob, rem)
                if acc.any():
                    val[acc] = wf[acc]
                    rem &= ~acc
            got = Mt & ~rem
            direct[t] = (val, got)
            self.stats["px_total"] += int(Mt.sum())
            self.stats["px_direct"] += int(got.sum())
            self.stats["masked_frames"] += 1
            # on ne garde que les flux entre voisins immédiats (utiles aux passes suivantes)
            self.flows = {k: v for k, v in self.flows.items() if abs(k[0] - k[1]) == 1}
            done += 1
            prog(done / steps)

        # 2) propagation avant (avec création par le modèle si rien n'est disponible)
        def propagate(order, step, ref_out=None):
            outs, ages = {}, {}
            for t in order:
                Mt = self.M[t]
                if not Mt.any():
                    outs[t], ages[t] = F[t], None
                    continue
                Ft = F[t].astype(np.float32)
                Gt = cv2.cvtColor(F[t], cv2.COLOR_BGR2GRAY).astype(np.float32)
                val, got = direct[t]
                base = Ft.copy()
                base[got] = val[got]
                age = np.zeros(Mt.shape, np.float32)
                rem = Mt & ~got
                p = t - step
                if rem.any() and p in outs and 0 <= p < N:
                    fl = self._flow(t, p)
                    warped, oob, mx, my = self._warp(outs[p], fl)
                    acc, wf = self._accept(t, Ft, Gt, warped, oob, rem)
                    if acc.any():
                        base[acc] = wf[acc]
                        pa = ages[p] if ages[p] is not None else np.zeros_like(age)
                        wa = cv2.remap(pa, mx, my, cv2.INTER_NEAREST, borderMode=cv2.BORDER_REPLICATE)
                        age[acc] = wa[acc] + 1
                        rem &= ~acc
                if rem.any():
                    if ref_out is not None:  # passe arrière : réutilise la passe avant (pas de 2e hallucination)
                        base[rem] = ref_out[0][t][rem]
                        age[rem] = ref_out[1][t][rem]
                    else:
                        img = np.clip(base + 0.5, 0, 255).astype(np.uint8)
                        filled = self.fallback(img, rem.astype(np.uint8) * 255)
                        base[rem] = filled[rem]
                        age[rem] = self.model_age
                        self.stats["px_model"] += int(rem.sum())
                        self.stats["model_frames"] += 1
                outs[t] = np.clip(base + 0.5, 0, 255).astype(np.uint8)
                ages[t] = age
                nonlocal done
                done += 1
                prog(done / steps)
            return outs, ages

        fwd = propagate(range(N), +1)
        bwd = propagate(range(N - 1, -1, -1), -1, ref_out=fwd)

        # 3) fusion pondérée par l'âge + fondu de bord
        result = []
        for t in range(N):
            Mt = self.M[t]
            if t < known or not Mt.any():
                result.append(F[t])
                continue
            of, af = fwd[0][t].astype(np.float32), fwd[1][t]
            ob, ab = bwd[0][t].astype(np.float32), bwd[1][t]
            m = np.minimum(af, ab)
            wf = np.exp(-(af - m) / self.tau)[..., None]
            wb = np.exp(-(ab - m) / self.tau)[..., None]
            comp = (of * wf + ob * wb) / (wf + wb)
            self.stats["px_propagated"] += int((Mt & ~direct[t][1]).sum())
            a = Mt.astype(np.float32)
            if self.feather > 0:
                a = np.maximum(a, cv2.GaussianBlur(a, (0, 0), self.feather))
            ft = F[t].astype(np.float32)
            res = comp * a[..., None] + ft * (1 - a[..., None])
            result.append(np.clip(res + 0.5, 0, 255).astype(np.uint8))
        self.flows, self.geom = {}, {}
        return result
