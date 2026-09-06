// Service worker for Arogya Intellect.
//
// TEMPORARY, per the React migration plan: this is the original static
// prototype's hand-written service worker, kept only so the manifest/SW
// wiring keeps working while the rest of the app migrates. It will be
// replaced by vite-plugin-pwa in a follow-up pass.
//
// NOTE: the original PRECACHE_URLS pointed at the old static file layout
// (./src/js/welcome.js, ./assets/logo.png, etc). Those paths no longer
// exist once Vite bundles/hashes the app's JS, CSS, and images, so the
// list below has been trimmed to only the files that still exist verbatim
// in the built `public/` output. Everything else is served from the
// network (see the fetch handler below) until vite-plugin-pwa takes over
// precaching properly.

const CACHE_VERSION = 'arogya-shell-v1';

const PRECACHE_URLS = [
  './',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Cache-first for the precached shell, with a network fallback for
// everything else (and a fresh network copy replacing the cache when it
// succeeds, so the shell can self-update on the next visit).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
