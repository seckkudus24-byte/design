"""Images d'archives : téléchargement direct des vignettes standard de Wikimedia Commons
(l'API et les originaux sont limités depuis cet environnement). Les licences ont été vérifiées
via l'API Commons (extmetadata) lors de la sélection ; elles sont recopiées ici.
→ public/archives/<id>.jpg, public/archives/credits.json, src/generated/archives.json"""
import hashlib, json, subprocess, time, urllib.parse
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/archives"; OUT.mkdir(parents=True, exist_ok=True)
UA = "AtlasSecretResearch/1.0 (documentary research; contact via repo)"
CHOIX = {
  "chateau":  ("Königsberg Castle.jpg", 1280, "Public domain", "Auteur inconnu (photochrome)", "entre 1894 et 1900"),
  "kant":     ("Immanuel Kant - Gemaelde 1.jpg", 960, "Public domain", "Johann Gottlieb Becker", "1768"),
  "ruines":   ("Zerstörung Königsbergs.jpg", 500, "Public domain", "Fritz Krauskopf (1882–1945)", "août 1944"),
  "potsdam":  ("Attlee, Truman and Stalin at Potsdam.jpg", 1280, "Public domain", "Photographe officiel (US)", "1er août 1945"),
  "kalinine": ("Калинин М. И. (1920) (cropped).jpg", 500, "Public domain", "Auteur inconnu", "années 1920"),
  "iskander": ("CombatLaunching2018-08.jpg", 1280, "CC BY 4.0", "Алексей Иванов (mil.ru)", "2 mars 2018"),
}
def thumb(name, w):
    n = name.replace(" ", "_"); h = hashlib.md5(n.encode()).hexdigest(); q = urllib.parse.quote(n)
    return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{w}px-{q}"
LEGENDES = {"chateau": "Château de Königsberg, vers 1900", "kant": "Emmanuel Kant, portrait de 1768", "ruines": "Königsberg après les raids, août 1944", "potsdam": "Attlee, Truman et Staline à Potsdam, 1945", "kalinine": "Mikhaïl Kalinine, années 1920", "iskander": "Lanceur Iskander-M (exercice de 2018, lieu non précisé)"}
credits = {}
for key, (name, w, lic, art, date) in CHOIX.items():
    dst = OUT / f"{key}.jpg"
    if not dst.exists():
        for k in range(8):
            r = subprocess.run(["curl", "-sS", "-m", "60", "-A", UA, "-o", str(dst) + ".tmp", "-w", "%{http_code}", thumb(name, w)], capture_output=True, text=True)
            if r.stdout == "200": break
            time.sleep(20 * (k + 1))
        else:
            print("✗", key, r.stdout); continue
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(dst) + ".tmp", "-q:v", "3", str(dst)], check=True)
        (Path(str(dst) + ".tmp")).unlink()
        time.sleep(4)
    credits[key] = {"titre": "File:" + name, "page": "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(name.replace(" ", "_")),
                    "LicenseShortName": lic, "Artist": art, "DateTimeOriginal": date, "largeur_vignette": w, "legende": LEGENDES[key]}
    print("✓", key, lic, "|", art)
(OUT / "credits.json").write_text(json.dumps(credits, ensure_ascii=False, indent=1))
(ROOT / "src/generated/archives.json").write_text(json.dumps(credits, ensure_ascii=False, indent=1))
