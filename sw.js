// Service Worker for Sardecoffeshop Order System
// Version: 2.0.0

const CACHE_NAME = 'sardecoffeshop-v2';
const STATIC_CACHE = 'sardecoffeshop-static-v2';
const DYNAMIC_CACHE = 'sardecoffeshop-dynamic-v2';

// Files to cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/kitchen.html',
  '/order.html',
  '/style.css',
  '/script.js',
  '/kitchen.js',
  '/manifest.json',
  '/404.html',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Poppins:wght@300;400;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css',
  'https://cdn.jsdelivr.net/npm/toastify-js'
];

// Security: Validate URLs
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Security: Sanitize cache key
function sanitizeCacheKey(url) {
  return url.replace(/[^a-zA-Z0-9]/g, '_');
}

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated successfully');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('Service Worker activation failed:', error);
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Security: Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Security: Only handle same-origin requests and trusted CDNs
  const isSameOrigin = url.origin === self.location.origin;
  const isTrustedCDN = url.hostname === 'fonts.googleapis.com' || 
                       url.hostname === 'fonts.gstatic.com' ||
                       url.hostname === 'cdn.jsdelivr.net' ||
                       url.hostname === 'api.qrserver.com';
  
  if (!isSameOrigin && !isTrustedCDN) {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'document') {
    event.respondWith(handleDocumentRequest(request));
  } else if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(handleStaticRequest(request));
  } else if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Handle document requests (HTML files)
async function handleDocumentRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // Return 404 page for failed requests
    return caches.match('/404.html');
  } catch (error) {
    console.error('Document request failed:', error);
    return caches.match('/404.html');
  }
}

// Handle static requests (CSS, JS)
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Static resource not found');
  } catch (error) {
    console.error('Static request failed:', error);
    return new Response('', { status: 404 });
  }
}

// Handle image requests
async function handleImageRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Image not found');
  } catch (error) {
    console.error('Image request failed:', error);
    return new Response('', { status: 404 });
  }
}

// Handle dynamic requests (API calls, etc.)
async function handleDynamicRequest(request) {
  try {
    // Try network first for dynamic content
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw new Error('Dynamic resource not found');
  } catch (error) {
    console.error('Dynamic request failed:', error);
    return new Response('', { status: 404 });
  }
}

// Background sync for offline orders
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

// Sync orders when back online
async function syncOrders() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_ORDERS',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error('Order sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  console.log('Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'طلب جديد!',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍽️</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍽️</text></svg>',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'عرض الطلب',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">👁️</text></svg>'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">❌</text></svg>'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Sardecoffeshop', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('/kitchen.html')
    );
  }
});

// Handle message events from main thread
self.addEventListener('message', event => {
  console.log('Message received in SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_ITEMS') {
    event.waitUntil(cacheItems(event.data.items));
  }
});

// Cache additional items
async function cacheItems(items) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const promises = items.map(item => cache.add(item));
    await Promise.all(promises);
    console.log('Items cached successfully');
  } catch (error) {
    console.error('Failed to cache items:', error);
  }
}

// Periodic cache cleanup
self.addEventListener('periodicsync', event => {
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupCache());
  }
});

// Clean up old cache entries
async function cleanupCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    const now = Date.now();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const date = response.headers.get('date');
      
      if (date) {
        const age = now - new Date(date).getTime();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (age > maxAge) {
          await cache.delete(request);
        }
      }
    }
    
    console.log('Cache cleanup completed');
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}

// Error handling
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker loaded successfully'); 