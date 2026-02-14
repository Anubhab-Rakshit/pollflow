
const CACHE_NAME = 'pollflow-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Simple pass-through for now to satisfy PWA requirements
    // In a real production app, we would cache assets here
    event.respondWith(fetch(event.request));
});
