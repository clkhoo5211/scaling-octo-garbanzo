// Service Worker for PWA
// This file will be served from /sw.js
// CRITICAL: Must be plain JavaScript (no TypeScript syntax)

const CACHE_NAME = 'web3news-v1';
const STATIC_CACHE_NAME = 'web3news-static-v1';
const ARTICLES_CACHE_NAME = 'web3news-articles-v1';
const MAX_ARTICLES_CACHED = 100;

// CRITICAL: Use relative paths - Service Worker scope determines basePath
// Don't hardcode paths that might not exist
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/apple-icon.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      // Try to cache assets, but don't fail if some are missing
      return Promise.allSettled(
        STATIC_ASSETS.map((url) => 
          fetch(url).then((response) => {
            if (response.ok) {
              return cache.put(url, response);
            }
          }).catch(() => {
            // Silently fail for missing assets
            console.warn(`Failed to cache ${url}`);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE_NAME && name !== ARTICLES_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Cache static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Cache article pages
  if (url.pathname.startsWith('/article/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(ARTICLES_CACHE_NAME).then(async (cache) => {
              // Limit cached articles to MAX_ARTICLES_CACHED
              const keys = await cache.keys();
              if (keys.length >= MAX_ARTICLES_CACHED) {
                // Remove oldest article (first key)
                await cache.delete(keys[0]);
              }
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first strategy for other requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(syncOfflineQueue());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Web3News';
  const options = {
    body: data.body || 'New content available',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: data.tag || 'default',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

async function syncOfflineQueue() {
  try {
    // Get offline queue from IndexedDB
    const db = await openIndexedDB();
    const queue = await getOfflineQueue(db);
    
    for (const item of queue) {
      try {
        // Process each queued action
        await processQueuedAction(item);
        // Remove from queue after successful processing
        await removeFromQueue(db, item.id);
      } catch (error) {
        console.error('Failed to process queued action:', error);
        // Keep in queue for retry
      }
    }
  } catch (error) {
    console.error('Sync offline queue failed:', error);
  }
}

async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('web3news', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineQueue')) {
        db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getOfflineQueue(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineQueue'], 'readonly');
    const store = transaction.objectStore('offlineQueue');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

async function processQueuedAction(item) {
  // Process different action types
  switch (item.type) {
    case 'like':
      return fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      });
    case 'bookmark':
      return fetch('/api/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      });
    case 'comment':
      return fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      });
    default:
      throw new Error(`Unknown action type: ${item.type}`);
  }
}

async function removeFromQueue(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
