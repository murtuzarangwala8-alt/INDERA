const CACHE_NAME = 'indera-pwa-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Empty fetch handler to pass PWA installation criteria.
  // Optionally, we could cache the offline page or static assets here.
});
