// Service Worker for Sinan Han Hotel
// Provides offline support and improved caching

const CACHE_NAME = 'sinan-han-v19';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/SinanHan.min.css',
    '/SiminHan.min.js',
    '/translations.json',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
];

const IMAGE_CACHE = 'sinan-han-images-v1';
const API_CACHE = 'sinan-han-api-v1';

// Install event - cache essential assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching app shell');
            return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                console.warn('Error caching assets:', err);
                // Continue even if some assets fail to cache
            });
        })
    );
    self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches aggressively
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Only keep current version, delete ALL old versions
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Control all clients immediately
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip non-HTTP(S) requests (chrome-extension, moz-extension, etc)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return;
    }

    // API calls - network first, fallback to cache
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response && response.status === 200) {
                        const clonedResponse = response.clone();
                        caches.open(API_CACHE).then(cache => {
                            cache.put(request, clonedResponse);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Return cached API response if available
                    return caches.match(request);
                })
        );
        return;
    }

    // Images - cache first, network fallback
    if (request.destination === 'image') {
        event.respondWith(
            caches.open(IMAGE_CACHE).then(cache => {
                return cache.match(request).then(response => {
                    return response || fetch(request).then(fetchResponse => {
                        if (fetchResponse && fetchResponse.status === 200) {
                            cache.put(request, fetchResponse.clone());
                        }
                        return fetchResponse;
                    }).catch(() => {
                        // Return placeholder if offline
                        return new Response(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">' +
                            '<rect fill="#ddd" width="400" height="300"/>' +
                            '<text x="50%" y="50%" font-size="20" fill="#999" text-anchor="middle" dominant-baseline="middle">' +
                            'Image Unavailable Offline</text></svg>',
                            { headers: { 'Content-Type': 'image/svg+xml' } }
                        );
                    });
                });
            })
        );
        return;
    }

    // HTML, JS, CSS - network first, fallback to cache (ensures fresh content)
    if (request.destination === 'document' ||
        url.pathname.endsWith('.html') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.json') ||
        url.pathname === '/') {
        event.respondWith(
            fetch(request)
                .then(fetchResponse => {
                    if (fetchResponse && fetchResponse.status === 200) {
                        const clonedResponse = fetchResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, clonedResponse);
                        });
                    }
                    return fetchResponse;
                })
                .catch(() => {
                    // Return cached version if offline
                    return caches.match(request).then(response => {
                        return response || caches.match('/index.html');
                    });
                })
        );
        return;
    }

    // Other assets - cache first, network fallback
    event.respondWith(
        caches.match(request).then(response => {
            return response || fetch(request).then(fetchResponse => {
                if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type === 'error') {
                    return fetchResponse;
                }

                const clonedResponse = fetchResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, clonedResponse);
                });

                return fetchResponse;
            }).catch(() => {
                // Return offline page if available
                return caches.match('/index.html');
            });
        })
    );
});

// Handle messages from clients
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
