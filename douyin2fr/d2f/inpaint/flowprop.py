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

import os
import threading
import time
from concurrent.futures import ThreadPoolExecutor

import cv2
import numpy as np

from .base import ImageInpainter
from .clip import ClipInpainter


def harmonic_fill(img: np.ndarray, hole: np.ndarray, iters: int = 40) -> np.ndarray:
    """Remplit `hole` d'une image float 1 canal par interpolation lisse
    (moyennes multi-échelles puis relaxation de Jacobi)."""
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


def complete_flow(fl: np.ndarray, hole: np.ndarray) -> np.ndarray:
    """Complète un champ de flux dans `hole`. Le flux étant lisse, on interpole à
    demi-résolution (4x moins de calcul) puis on affine à pleine résolution."""
    if not hole.any():
        return fl
    h, w = hole.shape
    out = fl.copy()
    if min(h, w) >= 32:
        hw, hh = (w + 1) // 2, (h + 1) // 2
        small = cv2.resize(fl, (hw, hh), interpolation=cv2.INTER_AREA)
        hs = cv2.resize(cv2.dilate(hole.astype(np.uint8), np.ones((3, 3), np.uint8)), (hw, hh),
                        interpolation=cv2.INTER_NEAREST)
        for c in range(2):
            small[..., c] = harmonic_fill(np.ascontiguousarray(small[..., c]), hs, iters=30)
        up = cv2.resize(small, (w, h), interpolation=cv2.INTER_LINEAR)
        out[hole > 0] = up[hole > 0]
        for c in range(2):  # quelques itérations pour raccorder au bord exact
            ch = np.ascontiguousarray(out[..., c])
            for _ in range(6):
                avg = cv2.blur(ch, (3, 3))
                ch[hole > 0] = avg[hole > 0]
            out[..., c] = ch
        return out
    for c in range(2):
        out[..., c] = harmonic_fill(np.ascontiguousarray(fl[..., c]), hole)
    return out


class FlowPropInpainter(ClipInpainter):
    name = "flowprop"

    def __init__(self, fallback: ImageInpainter, near=(1, 2, 3, 4, 6, 8, 12), far_step: int = 10,
                 far_max: int = 60, ring_thresh: float = 9.0, tau: float = 6.0, model_age: float = 30.0,
                 flow_scale: float | None = None, feather: float = 1.2, texture_k: float = 0.5,
                 workers: int | None = None):
        self.fallback = fallback
        self.near = sorted(set(near))
        self.far = [d for d in range(far_step, far_max + 1, far_step) if d > max(self.near)]
        self.ring_thresh, self.tau, self.model_age = ring_thresh, tau, model_age
        self.flow_scale, self.feather, self.texture_k = flow_scale, feather, texture_k
        # Parallélisme : OpenCV et NumPy libèrent le GIL, des threads suffisent.
        self.workers = max(1, workers or os.cpu_count() or 1)
        self._tls = threading.local()
        self._lock = threading.Lock()
        self.timing = {"prepare_s": 0.0, "direct_s": 0.0, "propagate_s": 0.0, "fuse_s": 0.0}
        self.stats = {"masked_frames": 0, "px_total": 0, "px_direct": 0, "px_propagated": 0,
                      "px_model": 0, "model_frames": 0}

    # ------------------------------------------------------------ préparation
    def _prepare(self, frames, masks):
        h, w = frames[0].shape[:2]
        self.h, self.w = h, w
        self.s = s = self.flow_scale or (0.5 if max(h, w) >= 900 else 1.0)
        self.sw, self.sh = max(8, int(round(w * s))), max(8, int(round(h * s)))
        self.M = [m > 0 for m in masks]

        def prep(i):
            f, m = frames[i], self.M[i]
            g = cv2.resize(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), (self.sw, self.sh), interpolation=cv2.INTER_AREA)
            hs = cv2.resize(m.astype(np.uint8), (self.sw, self.sh), interpolation=cv2.INTER_NEAREST)
            hs = cv2.dilate(hs, np.ones((3, 3), np.uint8))
            if hs.any():
                g = cv2.inpaint(g, hs, 3, cv2.INPAINT_TELEA)
            return np.ascontiguousarray(g), hs

        res = list(self._pool.map(prep, range(len(frames))))
        self.G = [r[0] for r in res]
        self.Hs = [r[1] for r in res]
        self.gy, self.gx = np.mgrid[0:h, 0:w].astype(np.float32)
        self.flows: dict = {}

    def _dis(self):
        d = getattr(self._tls, "dis", None)
        if d is None:
            d = self._tls.dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
        return d

    def _geometry(self, t):
        """Anneau de pixels connus autour du trou, découpage en tuiles (étiquettes),
        niveaux de gris et texture de l'image t. Calculé une fois par image."""
        Mt = self.M[t]
        n, _, st, _ = cv2.connectedComponentsWithStats(Mt.astype(np.uint8))
        hh = max(8, int(np.median(st[1:, cv2.CC_STAT_HEIGHT]))) if n > 1 else 8
        r = max(4, int(round(hh * 0.12)))
        dil = cv2.dilate(Mt.astype(np.uint8), np.ones((2 * r + 1, 2 * r + 1), np.uint8))
        ring = (dil > 0) & ~Mt
        tile = max(64, int(hh * 1.5))
        _, comp = cv2.connectedComponents(dil)
        zones = comp.astype(np.int64) * (self.w // tile + 1) + (np.arange(self.w) // tile)[None, :]
        zones[comp == 0] = -1
        lab = zones.astype(np.int32)  # -1 = hors zone
        nlab = int(lab.max()) + 1
        Gt = cv2.cvtColor(self.F[t], cv2.COLOR_BGR2GRAY).astype(np.float32)
        gx = cv2.Sobel(Gt, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(Gt, cv2.CV_32F, 0, 1, ksize=3)
        grad = (np.abs(gx) + np.abs(gy)) / 8.0
        # Tout ce qui concerne l'anneau est pré-extrait : _accept ne travaille que sur ces pixels.
        ridx = np.flatnonzero((ring & (lab >= 0)).ravel())
        r_lab = lab.ravel()[ridx]
        r_gray = Gt.ravel()[ridx]
        r_bgr = self.F[t].reshape(-1, 3)[ridx].astype(np.float32)
        r_grad = grad.ravel()[ridx]
        return (lab, nlab, ridx, r_lab, r_gray, r_bgr, r_grad)

    def _flow(self, t, s_, cache=False):
        """Flux t→s_ à pleine résolution du clip. Seuls les flux entre voisins
        immédiats sont gardés, en résolution réduite (mémoire)."""
        key = (t, s_)
        fl = self.flows.get(key)
        if fl is None:
            fl = self._dis().calc(self.G[t], self.G[s_], None)
            fl = complete_flow(fl, self.Hs[t])
            if cache:
                self.flows[key] = fl.astype(np.float16)
        else:
            fl = fl.astype(np.float32)
        return cv2.resize(fl, (self.w, self.h), interpolation=cv2.INTER_LINEAR) / self.s

    def _warp(self, img, fl, interp=cv2.INTER_CUBIC):
        mx, my = self.gx + fl[..., 0], self.gy + fl[..., 1]
        out = cv2.remap(img, mx, my, interp, borderMode=cv2.BORDER_REPLICATE)
        oob = (mx < 0) | (my < 0) | (mx > self.w - 1) | (my > self.h - 1)
        return out, oob, mx, my

    def _accept(self, geom, warped, bad, want):
        """Tuiles où la source est bien alignée (vérifié sur l'anneau de pixels connus),
        avec correction de luminosité par tuile. Renvoie (masque accepté, valeurs float Nx3)."""
        lab, nlab, ridx, r_lab, r_gray, r_bgr, r_grad = geom
        usable = want & ~bad
        if nlab <= 0 or not usable.any():
            return np.zeros_like(want), None
        keep = ~bad.ravel()[ridx]
        l = r_lab[keep]
        wr = warped.reshape(-1, 3)[ridx[keep]].astype(np.float32)
        wgray = wr @ np.array([0.114, 0.587, 0.299], np.float32)
        cnt = np.bincount(l, minlength=nlab).astype(np.float64)
        den = np.maximum(cnt, 1)
        mean_err = np.bincount(l, np.abs(wgray - r_gray[keep]), minlength=nlab) / den
        mean_grad = np.bincount(l, r_grad[keep], minlength=nlab) / den
        ok = (cnt >= 12) & (mean_err <= self.ring_thresh + self.texture_k * mean_grad)
        diff = r_bgr[keep] - wr
        off = np.stack([np.bincount(l, diff[:, c], minlength=nlab) for c in range(3)], 1) / den[:, None]
        off = np.clip(off, -25, 25).astype(np.float32)
        ok_ext = np.concatenate([[False], ok])
        acc = usable & ok_ext[lab + 1]
        if not acc.any():
            return acc, None
        vals = warped[acc].astype(np.float32) + off[lab[acc]]
        return acc, vals

    # ---------------------------------------------------------------- passes
    def inpaint_clip(self, frames, masks, known=0, progress=None, n_targets=None):
        """`n_targets` : nombre d'images à produire après les `known` premières ; les
        suivantes ne servent que de sources (gain de temps sur le chevauchement)."""
        N = len(frames)
        end = N if n_targets is None else min(N, known + n_targets)
        self._pool = ThreadPoolExecutor(self.workers)
        try:
            return self._run(frames, masks, known, end, progress)
        finally:
            self._pool.shutdown()
            self.flows = {}
            self.F = None

    def _direct(self, t, offsets):
        """Observations directes pour l'image t (exécuté en parallèle)."""
        F, N = self.F, len(self.F)
        Mt = self.M[t]
        geom = self._geometry(t)
        rem = Mt.copy()
        val = np.zeros(F[t].shape, np.uint8)
        for d in offsets:
            s_ = t + d
            if not (0 <= s_ < N) or not rem.any():
                continue
            fl = self._flow(t, s_, cache=abs(d) == 1)
            mx, my = self.gx + fl[..., 0], self.gy + fl[..., 1]
            # Test peu coûteux d'abord : la source voit-elle au moins un pixel encore manquant ?
            # (si son propre sous-titre recouvre tout, inutile de la déformer — résultat identique)
            wm = cv2.remap(self.M[s_].astype(np.uint8), mx, my, cv2.INTER_NEAREST,
                           borderMode=cv2.BORDER_CONSTANT, borderValue=1) > 0
            if not (rem & ~wm).any():
                continue
            warped = cv2.remap(F[s_], mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            oob = (mx < 0) | (my < 0) | (mx > self.w - 1) | (my > self.h - 1)
            acc, vals = self._accept(geom, warped, wm | oob, rem)
            if acc.any():
                val[acc] = np.clip(vals + 0.5, 0, 255).astype(np.uint8)
                rem &= ~acc
        return val, Mt & ~rem

    def _run(self, frames, masks, known, end, progress):
        N = len(frames)
        tic = time.perf_counter()
        self._prepare(frames, masks)
        self.timing["prepare_s"] += time.perf_counter() - tic
        tic = time.perf_counter()
        self.F = F = frames
        prog = (lambda p: progress(p)) if progress else (lambda p: None)
        todo = [t for t in range(N) if t < end and self.M[t].any()]
        if not todo:
            return list(frames)
        steps = 3 * len(todo)
        done = 0

        # 1) observations directes : vrais pixels de l'arrière-plan pris dans les autres images
        offsets = []
        for d in self.near + self.far:
            offsets += [-d, d]
        direct = {}
        for t, r in zip(todo, self._pool.map(lambda t: self._direct(t, offsets), todo)):
            direct[t] = r
            Mt = self.M[t]
            self.stats["px_total"] += int(Mt.sum())
            self.stats["px_direct"] += int(r[1].sum())
            self.stats["masked_frames"] += 1
            done += 1
            prog(done / steps)
        self.timing["direct_s"] += time.perf_counter() - tic
        tic = time.perf_counter()

        # 2) propagation avant / arrière avec « âge » par pixel
        def propagate(order, step, ref_out=None):
            nonlocal done
            outs, ages = {}, {}
            for t in order:
                Mt = self.M[t]
                if not Mt.any():
                    outs[t], ages[t] = F[t], None
                    continue
                val, got = direct[t]
                base = F[t].astype(np.float32)
                base[got] = val[got]
                age = np.zeros(Mt.shape, np.float32)
                rem = Mt & ~got
                p = t - step
                if rem.any() and p in outs:
                    fl = self._flow(t, p, cache=True)
                    warped, oob, mx, my = self._warp(outs[p], fl)
                    acc, vals = self._accept(self._geometry(t), warped, oob, rem)
                    if acc.any():
                        base[acc] = vals
                        pa = ages[p].astype(np.float32) if ages[p] is not None else np.zeros_like(age)
                        wa = cv2.remap(pa, mx, my, cv2.INTER_NEAREST, borderMode=cv2.BORDER_REPLICATE)
                        age[acc] = wa[acc] + 1
                        rem &= ~acc
                if rem.any():
                    if ref_out is not None:  # passe arrière : réutilise la passe avant (pas de 2e hallucination)
                        base[rem] = ref_out[0][t][rem]
                        age[rem] = ref_out[1][t][rem]
                    else:  # jamais visible : création par le modèle d'image, une seule fois
                        img = np.clip(base + 0.5, 0, 255).astype(np.uint8)
                        filled = self.fallback(img, rem.astype(np.uint8) * 255)
                        base[rem] = filled[rem]
                        age[rem] = self.model_age
                        self.stats["px_model"] += int(rem.sum())
                        self.stats["model_frames"] += 1
                outs[t] = np.clip(base + 0.5, 0, 255).astype(np.uint8)
                ages[t] = np.minimum(age, 60000).astype(np.float16)
                done += 1
                prog(done / steps)
            return outs, ages

        fwd = propagate(range(end), +1)
        bwd = propagate(range(end - 1, -1, -1), -1, ref_out=fwd)
        self.flows = {}
        self.timing["propagate_s"] += time.perf_counter() - tic
        tic = time.perf_counter()

        # 3) fusion pondérée par l'âge + fondu de bord (parallèle)
        def fuse(t):
            Mt = self.M[t]
            if t < known or t >= end or not Mt.any():
                return F[t]
            of, af = fwd[0][t].astype(np.float32), fwd[1][t].astype(np.float32)
            ob, ab = bwd[0][t].astype(np.float32), bwd[1][t].astype(np.float32)
            m = np.minimum(af, ab)
            wf = np.exp(-(af - m) / self.tau)[..., None]
            wb = np.exp(-(ab - m) / self.tau)[..., None]
            comp = (of * wf + ob * wb) / (wf + wb)
            a = Mt.astype(np.float32)
            if self.feather > 0:
                a = np.maximum(a, cv2.GaussianBlur(a, (0, 0), self.feather))
            res = comp * a[..., None] + F[t].astype(np.float32) * (1 - a[..., None])
            return np.clip(res + 0.5, 0, 255).astype(np.uint8)

        result = list(self._pool.map(fuse, range(N)))
        self.timing["fuse_s"] += time.perf_counter() - tic
        for t in todo:
            if known <= t < end:
                self.stats["px_propagated"] += int((self.M[t] & ~direct[t][1]).sum())
        return result
