"""Recherche d'images sur Wikimedia Commons avec leur licence (aide à la sélection, pas utilisé au rendu)."""
import json, subprocess, sys, urllib.parse
def api(params):
    q = urllib.parse.urlencode({**params, "format": "json"})
    import time
    for k in range(8):
        out = subprocess.run(["curl", "-sS", "-m", "40", "-A", "AtlasSecretResearch/1.0 (documentary research; contact via repo)", "https://commons.wikimedia.org/w/api.php?" + q], capture_output=True, text=True).stdout
        try:
            return json.loads(out)
        except json.JSONDecodeError:
            time.sleep(15 * (k + 1))
    raise SystemExit("Commons indisponible (429)")
import time
for term in sys.argv[1:]:
    time.sleep(4)
    r = api({"action": "query", "generator": "search", "gsrnamespace": 6, "gsrsearch": term, "gsrlimit": 8,
             "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiextmetadatafilter": "LicenseShortName|Artist|DateTimeOriginal|ObjectName"})
    print("###", term)
    for p in sorted(r.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0)):
        ii = p["imageinfo"][0]; m = ii.get("extmetadata", {})
        g = lambda k: (m.get(k, {}).get("value") or "")[:60].replace("\n", " ")
        print(f"  {p['title'][:80]} | {ii['width']}x{ii['height']} | {g('LicenseShortName')} | {g('DateTimeOriginal')} | {g('Artist')}")
