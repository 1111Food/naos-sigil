// NAOS Service Worker ? launch-safe cleanup worker.
// Runtime caching is intentionally disabled to prevent stale hashed chunks
// from surviving application deployments.

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        const hadOldCaches = cacheNames.length > 0;

        await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
        );

        await self.clients.claim();

        // Existing users may currently be running an HTML/JS bundle that
        // references obsolete hashed chunks. Reload only when stale caches
        // were actually found and removed.
        if (hadOldCaches) {
            const windows = await self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            });

            await Promise.all(
                windows.map((client) => {
                    if ('navigate' in client) {
                        return client.navigate(client.url);
                    }
                    return Promise.resolve();
                })
            );
        }
    })());
});

// IMPORTANT:
// No fetch handler during launch.
// Browser/Vercel are authoritative for HTML and hashed application assets.
