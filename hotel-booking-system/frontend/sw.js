// Service Worker for Sinan Han Hotel Booking System
// Handles caching, offline support, and update notifications

const CACHE_NAME = 'sinan-han-v1.7.0';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/js/api.min.js',
  '/js/main.min.js',
  '/js/analytics.min.js',
  '/manifest.json',
  '/languages/en.json',
  '/languages/bs.json',
  '/languages/de.json',
  'https://cdn.tailwindcss.com',
  // Room Images
  '/Rooms/Standard Double Room/390594090.jpg',
  '/Rooms/Standard Double Room/396531572.jpg',
  '/Rooms/Superior Suite/396552722.jpg',
  '/Rooms/Superior Suite/396532009.jpg',
  '/Rooms/Double Room/396531596.jpg',
  '/Rooms/Double Room/396531928.jpg',
  '/Rooms/queen standard room/706475810.jpg',
  '/Rooms/queen standard room/706475998.jpg',
  '/Rooms/Superior Apartment/714582257.jpg',
  '/Rooms/Superior Apartment/713093570.jpg',
  '/Rooms/Deluxe Suit/390516235.jpg',
  '/Rooms/Deluxe Suit/390594090.jpg',
  '/Rooms/Deluxe Suit/390515926.jpg',
  '/Rooms/Deluxe Suit/390516298.jpg'
];

// Install event - cache static assets with prefetch strategy
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Caching static assets and languages...');

      // Cache each asset individually so one failure doesn't block others
      return Promise.all(
        STATIC_ASSETS.map((asset) => {
          return cache.add(asset).catch((error) => {
            console.warn(`⚠️ Failed to cache ${asset}:`, error.message);
            // Continue caching other assets even if one fails
          });
        })
      ).then(() => {
        console.log('✅ Asset caching complete');
      });
    })
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches aggressively
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Only keep current CACHE_NAME, delete ALL others
      const cacheWhitelist = [CACHE_NAME];

      return Promise.all(
        cacheNames
          .filter(name => !cacheWhitelist.includes(name))
          .map((cacheName) => {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );

  // Claim control of all clients immediately
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        version: CACHE_NAME
      });
    });
  });
});

// Fetch event - network first for CSS/JS, cache first for images
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external domains except CDN
  if (url.origin !== self.location.origin && !url.hostname.includes('cdn.')) {
    return;
  }

  // Strategy 1: Network first for CSS and JS (always get latest)
  if (request.url.includes('/js/') ||
      request.url.includes('/css/') ||
      request.url.endsWith('.css') ||
      request.url.endsWith('.js')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache if not successful
          if (!response || response.status !== 200) {
            return response;
          }

          // Clone and cache the fresh response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Fall back to cache if offline
          return caches.match(request) ||
            new Response(
              '<h1>Offline</h1><p>You are offline. Please check your connection.</p>',
              {
                headers: { 'Content-Type': 'text/html' },
                status: 503
              }
            );
        })
    );
    return;
  }

  // Strategy 2: Cache first for static assets (images, etc)
  if (request.url.includes('/languages/') ||
      request.url.includes('/images/') ||
      request.url.includes('cdn.tailwindcss.com') ||
      request.url.endsWith('.html') ||
      request.url.endsWith('.json') ||
      request.url.endsWith('.svg') ||
      request.url.endsWith('.png') ||
      request.url.endsWith('.jpg') ||
      request.url.endsWith('.jpeg') ||
      request.url.endsWith('.gif') ||
      request.url.endsWith('.webp')) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(request).then((response) => {
          // Don't cache if not successful
          if (!response || response.status !== 200) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        }).catch(() => {
          // Return cached version, a placeholder for images, or offline message
          return caches.match(request) ||
            (request.destination === 'image' ?
              new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect fill="#f0f0f0"/></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              ) :
              new Response(
                '<h1>Offline</h1><p>You are offline. Please check your connection.</p>',
                {
                  headers: { 'Content-Type': 'text/html' },
                  status: 503
                }
              )
            );
        });
      })
    );
  }

  // Strategy 2: Network first for API calls
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache non-200 responses
          if (!response || response.status !== 200) {
            return response;
          }

          // Clone and cache successful responses
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Fall back to cached version if offline
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            // Return error response for APIs
            return new Response(
              JSON.stringify({
                error: 'You are offline - please check your connection',
                offline: true,
                success: false
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
  }
});

// Message handler for communication with clients
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker loaded successfully');
