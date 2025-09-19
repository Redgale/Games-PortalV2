const CACHE_NAME = 'red-portal-cache-v1';
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  '/components.js',
  '/games.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event: cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_ASSETS))
  );
});

// Activate event: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
});

// Fetch event: serve cached content if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(res => res || fetch(event.request))
  );
});
