// Service worker minimal : rend l'application installable et ouvre l'interface hors ligne.
// Ne met JAMAIS en cache l'API ni les vidéos (données privées et volumineuses).
const CACHE = "d2f-shell-v1";
const SHELL = ["/", "/index.html", "/style.css", "/app.js", "/manifest.json", "/icon-192.png", "/icon-512.png"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.pathname.startsWith("/api/")) return; // réseau direct
  // Réseau d'abord (toujours la dernière version), cache en secours hors ligne.
  e.respondWith(fetch(e.request).then((r) => {
    const copy = r.clone();
    if (r.ok && SHELL.includes(u.pathname)) caches.open(CACHE).then((c) => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request)));
});
