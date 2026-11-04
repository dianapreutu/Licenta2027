// service-worker.js
// Păstrează în cache fișierele aplicației pe măsură ce sunt încărcate,
// ca aplicația să se poată deschide și fără internet.

const CACHE_NAME = 'scar-monitor-v1';

// La activare: șterge versiunile vechi ale cache-ului
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)))
    )
  );
});

// La fiecare cerere: încearcă întâi internetul și salvează răspunsul în cache;
// dacă nu există internet, folosește varianta din cache.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
