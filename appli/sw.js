// Cryptids (appli) : garde les fichiers déjà vus pour que l'appli s'ouvre vite et marche sans réseau
const CACHE = "cryptids-appli-1";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "manifest.webmanifest", "icone-192.png"])).catch(() => {})); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(l => Promise.all(l.filter(k => k.startsWith("cryptids-appli-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || r.headers.has("range") || !r.url.startsWith("http")) return;   // vidéos lues par morceaux : directement au réseau
  if (r.mode === "navigate") {   // la page : d'abord le réseau (pour avoir la dernière version), sinon celle gardée
    e.respondWith(fetch(r).then(rep => { const copie = rep.clone(); caches.open(CACHE).then(c => c.put(r, copie)); return rep; })
      .catch(() => caches.match(r, { ignoreSearch: true }).then(x => x || caches.match("./"))));
    return;
  }
  // le reste : tout de suite depuis le cache s'il y est, et mis à jour en douce
  e.respondWith(caches.open(CACHE).then(c => c.match(r).then(gardee => {
    const reseau = fetch(r).then(rep => { if (rep.ok || rep.type === "opaque") c.put(r, rep.clone()); return rep; });
    if (gardee) { e.waitUntil(reseau.catch(() => {})); return gardee; }
    return reseau;
  })));
});
