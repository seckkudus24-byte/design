"""Télécharge les images d'archives choisies sur Wikimedia Commons et enregistre leur licence.
→ public/archives/<id>.jpg + public/archives/credits.json   (usage : python3 scripts/archives.py)"""
import json, re, subprocess, time, urllib.parse
from pathlib import Path
OUT = Path(__file__).resolve().parent.parent / "public/archives"; OUT.mkdir(parents=True, exist_ok=True)
UA = "AtlasSecretResearch/1.0 (documentary research; contact via repo)"
CHOIX = {
    "chateau": "File:Königsberg Castle.jpg",
    "kant": "File:Immanuel Kant - Gemaelde 1.jpg",
    "ruines": "File:Zerstörung Königsbergs.jpg",
    "potsdam": "File:Attlee, Truman and Stalin at Potsdam.jpg",
    "kalinine": "File:Калинин М. И. (1920) (cropped).jpg",
    "iskander": "File:CombatLaunching2018-08.jpg",
}
def get(url, binary=False):
    for k in range(14):
        r = subprocess.run(["curl", "-sS", "-m", "60", "-A", UA, "-w", "\n%{http_code}", url], capture_output=True)
        body, code = r.stdout.rsplit(b"\n", 1)
        if code == b"200":
            return body if binary else body.decode()
        time.sleep(min(650, 60 * (k + 1)))
    raise SystemExit(f"échec {url}")
strip = lambda s: re.sub(r"\s+", " ", re.sub("<[^>]+>", "", s or "")).strip()
credits = json.loads((OUT / "credits.json").read_text()) if (OUT / "credits.json").exists() else {}
for key, title in CHOIX.items():
    if key in credits and (OUT / f"{key}.jpg").exists():
        continue
    q = urllib.parse.urlencode({"action": "query", "titles": title, "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 1280, "format": "json"})
    p = next(iter(json.loads(get("https://commons.wikimedia.org/w/api.php?" + q))["query"]["pages"].values()))
    ii = p["imageinfo"][0]; m = ii["extmetadata"]
    meta = {k: strip(m.get(k, {}).get("value")) for k in ["LicenseShortName", "Artist", "DateTimeOriginal", "ImageDescription", "Credit", "LicenseUrl"]}
    # vignettes de taille standard (1280 / 960 px) : les fichiers originaux sont limités par Wikimedia
    w0 = ii.get("width", 0)
    url = ii.get("thumburl") or ii["url"]
    if w0 and w0 < 1280:
        url = ii["url"] if w0 < 960 else re.sub(r"/\d+px-", "/960px-", url)
    img = get(url, binary=True)
    (OUT / f"{key}.jpg").write_bytes(img)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(OUT / f"{key}.jpg"), "-q:v", "3", str(OUT / f"{key}.tmp.jpg")], check=True)
    (OUT / f"{key}.tmp.jpg").replace(OUT / f"{key}.jpg")
    credits[key] = {"titre": title, "page": ii["descriptionurl"], **meta}
    (OUT / "credits.json").write_text(json.dumps(credits, ensure_ascii=False, indent=1))
    (OUT.parent.parent / "src/generated/archives.json").write_text(json.dumps(credits, ensure_ascii=False, indent=1))
    print(f"✓ {key} | {meta['LicenseShortName']} | {meta['Artist'][:50]} | {meta['DateTimeOriginal'][:30]}")
    time.sleep(25)
