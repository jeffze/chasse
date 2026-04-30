// /sw.js
const CACHE = 'chasse-v2';
const HTML_PATH = '/Chasse/chasse.html'; // adapte si tu changes l'emplacement

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([HTML_PATH])));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Navigations (documents)
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(HTML_PATH, clone)).catch(()=>{});
        return res;
      }).catch(() => caches.match(HTML_PATH))
    );
    return;
  }

  // Autres requêtes (best-effort cache)
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(() => hit))
  );
});
