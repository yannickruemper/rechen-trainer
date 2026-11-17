// Handgeschriebener Service Worker (kein Build-Schritt, kein Workbox): macht den
// Rechen-Trainer installierbar und offlinefähig. Strategie: "Netzwerk zuerst" –
// online gibt es immer die aktuelle Version, offline greift der Cache.
//
// Wichtig: Beim Ändern von Dateien CACHE_VERSION hochzählen, damit alte Clients
// den neuen Cache bekommen (activate räumt alte Versionen automatisch auf).
const CACHE_VERSION = 'mal-trainer-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/app.js',
  './js/ui.js',
  './js/visualizer.js',
  './js/progressStore.js',
  './js/shared/numberUtils.js',
  './js/operations/index.js',
  './js/operations/multiplication/taskGenerator.js',
  './js/operations/multiplication/strategies.js',
  './js/operations/multiplication/writtenMethod.js',
  './js/operations/multiplication/errorAnalysis.js',
  './js/operations/addition/taskGenerator.js',
  './js/operations/addition/strategies.js',
  './js/operations/addition/writtenMethod.js',
  './js/operations/addition/errorAnalysis.js',
  './js/operations/subtraction/taskGenerator.js',
  './js/operations/subtraction/strategies.js',
  './js/operations/subtraction/writtenMethod.js',
  './js/operations/subtraction/errorAnalysis.js',
  './js/operations/division/taskGenerator.js',
  './js/operations/division/strategies.js',
  './js/operations/division/writtenMethod.js',
  './js/operations/division/errorAnalysis.js',
  './js/operations/fractions/taskGenerator.js',
  './js/operations/fractions/strategies.js',
  './js/operations/fractions/errorAnalysis.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Nur Anfragen an den eigenen Ursprung behandeln – externe Requests unangetastet lassen.
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
