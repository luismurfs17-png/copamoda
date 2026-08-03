/* Workbox service worker. The CDN fallback keeps this file usable after Vite build. */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

if (self.workbox) {
  const { routing, strategies, expiration, backgroundSync } = workbox;
  routing.registerRoute(({ request }) => request.method === 'GET', new strategies.CacheFirst({
    cacheName: 'copamoda-get-v1', plugins: [new expiration.ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 86400 })]
  }));
  const queue = new backgroundSync.BackgroundSyncPlugin('copamoda-offline-requests', { maxRetentionTime: 24 * 60 });
  ['POST', 'PUT', 'PATCH'].forEach((method) => routing.registerRoute(
    ({ request }) => request.method === method,
    new strategies.NetworkFirst({ cacheName: 'copamoda-write-v1', plugins: [queue] }), method
  ));
}
