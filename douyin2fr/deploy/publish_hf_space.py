"""Publie (ou met à jour) l'application sur Hugging Face Spaces.

  HF_TOKEN=<jeton écriture> python deploy/publish_hf_space.py <compte>/<nom-du-space> [--private]

Le jeton d'accès de l'application (D2F_TOKEN) se règle ensuite dans
Settings → Variables and secrets du Space (ou avec --set-app-token).
"""
import argparse
import os
import secrets
import shutil
import tempfile

from huggingface_hub import HfApi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repo_id")
    ap.add_argument("--private", action="store_true")
    ap.add_argument("--set-app-token", action="store_true",
                    help="génère un D2F_TOKEN aléatoire, l'enregistre comme secret du Space et l'affiche")
    a = ap.parse_args()
    api = HfApi()
    api.create_repo(a.repo_id, repo_type="space", space_sdk="docker", private=a.private, exist_ok=True)
    tok = None
    if a.set_app_token:  # avant l'envoi : l'application refuse de démarrer exposée sans jeton
        tok = secrets.token_urlsafe(18)
        api.add_space_secret(a.repo_id, "D2F_TOKEN", tok)
    with tempfile.TemporaryDirectory() as tmp:
        for d in ("d2f", "server"):
            shutil.copytree(os.path.join(ROOT, d), os.path.join(tmp, d),
                            ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
        shutil.copy(os.path.join(ROOT, "requirements.txt"), tmp)
        shutil.copy(os.path.join(ROOT, "deploy", "hf-space", "Dockerfile"), tmp)
        shutil.copy(os.path.join(ROOT, "deploy", "hf-space", "README.md"), tmp)
        api.upload_folder(repo_id=a.repo_id, repo_type="space", folder_path=tmp,
                          commit_message="Mise à jour de l'application", delete_patterns=["d2f/**", "server/**"])
    if tok:
        print("D2F_TOKEN =", tok)
    owner, name = a.repo_id.split("/")
    print(f"https://huggingface.co/spaces/{a.repo_id}")
    print(f"https://{owner.lower()}-{name.lower().replace('_', '-')}.hf.space")


if __name__ == "__main__":
    main()
