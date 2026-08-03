/* Workbox service worker. The CDN fallback keeps this file usable after Vite build. */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

if (self.workbox) {
  const { routing, strategies, expiration, backgroundSync } = workbox;
  self.skipWaiting();
  workbox.core.clientsClaim();
  routing.registerRoute(({ request }) => request.method === 'GET', new strategies.NetworkFirst({
    cacheName: 'copamoda-get-v2', networkTimeoutSeconds: 5,
    plugins: [new expiration.ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 86400 })]
  }));
  const queue = new backgroundSync.BackgroundSyncPlugin('copamoda-offline-requests', { maxRetentionTime: 24 * 60 });
  ['POST', 'PUT', 'PATCH'].forEach((method) => routing.registerRoute(
    ({ request }) => request.method === method,
    new strategies.NetworkOnly({ plugins: [queue] }), method
  ));
}
