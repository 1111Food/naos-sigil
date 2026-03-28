const CACHE_NAME = 'naos-v3';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    
    // 1. COMPLETELY IGNORE ALL API CALLS
    if (url.includes('/api/') || event.request.method !== 'GET') {
        return;
    }

    // 2. ONLY HANDLE STATIC ASSETS (GET requests to non-API endoints)
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request)
                .then((networkResponse) => {
                    // Cache matching assets if needed, but for now just return
                    return networkResponse;
                })
                .catch(() => {
                    // Return a generic offline response to avoid Response-conversion errors
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/plain' }
                    });
                });
        })
    );
});
