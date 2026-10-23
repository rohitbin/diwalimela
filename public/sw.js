// Service Worker for Diwali Mahotsav Mela PWA
// Auto-versioned on build to guarantee updates on mobile phone apps
const CACHE_NAME = 'diwali-mela-v1';

const STATIC_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/og_image.jpg'
];

// 1. Install Event: Skip waiting immediately so new updates take over right away
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('[SW] Precache issue:', err);
      });
    })
  );
});

// 2. Activate Event: Wipe all old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Message Event: Allow client to force skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. Fetch Event: Network-First for HTML so new code updates are loaded instantly!
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests and http/https schemes
  if (req.method !== 'GET' || !req.url.startsWith('http')) {
    return;
  }

  const url = new URL(req.url);

  // Strategy A: HTML & Navigation Requests -> ALWAYS Network-First
  // This guarantees that when you push code, the user's phone loads the fresh index.html
  // containing the new JavaScript bundle hash immediately!
  const isHtml =
    req.mode === 'navigate' ||
    req.headers.get('accept')?.includes('text/html') ||
    url.pathname === '/' ||
    url.pathname === '/index.html';

  if (isHtml) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // If completely offline, fall back to cached index.html
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // Strategy B: Hashed Vite Assets (/assets/*) -> Cache-First
  // Since Vite adds a unique content hash to filenames (e.g. index-abc123.js),
  // updated builds have new filenames, so they will automatically be fetched from network!
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // Strategy C: Other Static Assets (Images, Manifest, Audio) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
