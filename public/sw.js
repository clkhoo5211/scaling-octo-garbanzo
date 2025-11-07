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

// Helper: Check if URL scheme is cacheable
function isCacheableScheme(url) {
  try {
    // Handle relative URLs (e.g., '/manifest.webmanifest')
    // Relative URLs are always cacheable (they'll be resolved to http/https)
    if (url.startsWith('/') || url.startsWith('./')) {
      return true;
    }
    
    const urlObj = new URL(url);
    // Only cache http:// and https:// URLs
    // Skip chrome-extension://, chrome://, file://, etc.
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    // If URL parsing fails, assume it's cacheable (might be relative)
    return true;
  }
}

// Helper: Safely cache a response
async function safeCachePut(cache, request, response) {
  try {
    // Check if request URL is cacheable
    if (!isCacheableScheme(request.url)) {
      return; // Silently skip unsupported schemes (chrome-extension://, etc.)
    }
    
    // Only cache successful responses
    if (response && response.status === 200 && response.type !== 'error') {
      await cache.put(request, response);
    }
  } catch (error) {
    // Silently fail - don't log errors for unsupported schemes
    if (error.message && !error.message.includes('chrome-extension') && !error.message.includes('unsupported')) {
      console.warn('Cache put failed:', error.message);
    }
  }
}

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      // Try to cache assets, but don't fail if some are missing
      return Promise.allSettled(
        STATIC_ASSETS.map(async (url) => {
          try {
            // Skip if URL is not cacheable
            if (!isCacheableScheme(url)) {
              return;
            }
            
            const response = await fetch(url);
            if (response && response.ok) {
              // Create a Request object for caching
              const request = new Request(url);
              await safeCachePut(cache, request, response);
            }
          } catch (error) {
            // Silently fail for missing assets (e.g., manifest.webmanifest might not exist)
            // Only log in development
            if (process.env.NODE_ENV === 'development') {
              console.warn(`Failed to cache ${url}:`, error.message);
            }
          }
        })
      );
    }).catch((error) => {
      // Don't fail installation if caching fails
      console.warn('Service Worker install error:', error.message);
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

  // Skip unsupported URL schemes (chrome-extension://, chrome://, etc.)
  if (!isCacheableScheme(request.url)) {
    return; // Let browser handle it normally
  }

  // Cache static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                safeCachePut(cache, request, responseToCache);
              });
            }
            return response;
          })
          .catch((error) => {
            // Network error - return cached version if available
            return caches.match(request).then((cachedResponse) => {
              return cachedResponse || new Response('Network error', { status: 408 });
            });
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
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(ARTICLES_CACHE_NAME).then(async (cache) => {
                try {
                  // Limit cached articles to MAX_ARTICLES_CACHED
                  const keys = await cache.keys();
                  if (keys.length >= MAX_ARTICLES_CACHED) {
                    // Remove oldest article (first key)
                    await cache.delete(keys[0]);
                  }
                  await safeCachePut(cache, request, responseToCache);
                } catch (error) {
                  // Silently fail - don't break article loading
                }
              });
            }
            return response;
          })
          .catch((error) => {
            // Network error - return cached version if available
            return caches.match(request).then((cachedResponse) => {
              return cachedResponse || new Response('Network error', { status: 408 });
            });
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
            safeCachePut(cache, request, responseToCache);
          });
        }
        return response;
      })
      .catch((error) => {
        // Fallback to cache if network fails
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || new Response('Network error', { status: 408 });
        });
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
