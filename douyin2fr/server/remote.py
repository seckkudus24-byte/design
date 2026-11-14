"""Point d'entrée exécuté dans la fonction GPU distante (Modal).

Indépendant de Modal pour pouvoir être testé localement : `state` est un simple
dictionnaire partagé (modal.Dict en production), `commit` publie les fichiers
produits sur le volume partagé.
"""
from __future__ import annotations

import os
import time
import traceback

from .worker_core import execute


def process_job(data_dir: str, models_dir: str, jid: str, action: str, settings: dict, state,
                commit=lambda: None) -> dict:
    last = [0.0]

    def progress(stage, p, msg):
        if time.time() - last[0] >= 1.0 or p >= 1.0:
            last[0] = time.time()
            state[f"progress:{jid}"] = {"stage": stage, "progress": round(float(p), 4), "message": msg}

    def cancel():
        return bool(state.get(f"cancel:{jid}", False))

    try:
        upd = execute(os.path.join(data_dir, jid), models_dir, action, settings, progress, cancel)
        from d2f.device import describe
        dev = describe()  # trace : le GPU a-t-il vraiment servi ?
        label = "GPU" if dev["gpu"] else f"CPU ({dev['cpu_threads']} cœurs)"
        if action == "clean":
            upd["stats"]["device"] = label
        else:
            upd["timings"]["device"] = label
        return upd
    except InterruptedError:
        return {"error": "Traitement annulé", "cancelled": True}
    except Exception as e:  # noqa: BLE001
        traceback.print_exc()
        return {"error": f"{type(e).__name__}: {e}"}
    finally:
        commit()
        state.pop(f"progress:{jid}", None) if hasattr(state, "pop") else None
