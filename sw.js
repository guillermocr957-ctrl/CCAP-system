// ══════════════════════════════════════════════════════════════════════════════
// SERVICE WORKER - EconomiaCap PWA
// Maneja: caché, notificaciones push, funcionamiento offline
// ══════════════════════════════════════════════════════════════════════════════

const CACHE_VERSION = 'economiacap-v71';
const ASSETS_TO_CACHE = [
  './',
  './EconomiaCap_v2-33.html',
  './manifest.json',
  './assets/logos/efectivo-soles.png',
  './assets/logos/efectivo-dolares.png',
  './assets/logos/efectivo-euros.png',
  './assets/logos/BCP.png',
  './assets/logos/BCP.svg',
  './assets/logos/Efectivo%20soles.png',
  './assets/logos/Efectivo%20d%C3%B3lares.png',
  './assets/logos/Efectivo%20Euros.png',
  './assets/logos/Interbank.png',
  './assets/logos/PLIN.png',
  './assets/logos/SCOTIABANK.png',
  './assets/logos/Scotiabank.svg',
  './assets/logos/YAPE.svg'
];

// ──────────────────────────────────────────────────────────────────────────────
// INSTALAR - Cachear archivos básicos
// ──────────────────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando service worker...');
  
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        console.log('[SW] Cacheando archivos críticos');
        return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
          console.warn('[SW] Algunos archivos no pudieron cachearse:', err);
          // No falla la instalación si hay error en caché
        });
      })
      .then(() => {
        console.log('[SW] Instalación completada');
      })
  );
  
  self.skipWaiting();
});

// ──────────────────────────────────────────────────────────────────────────────
// ACTIVAR - Limpiar cachés antiguos
// ──────────────────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_VERSION)
          .map((cacheName) => {
            console.log('[SW] Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  self.clients.claim();
});

// ──────────────────────────────────────────────────────────────────────────────
// FETCH - Estrategia Network First con Offline Fallback
// ──────────────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo cachear GET
  if (request.method !== 'GET') {
    return;
  }

  // Evitar interceptar esquemas no-http (file:, data:, chrome-extension:, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Navegación principal: network-first, fallback al app shell cacheado
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put('./EconomiaCap_v2-33.html', responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedShell = await caches.match('./EconomiaCap_v2-33.html');
          if (cachedShell) return cachedShell;
          return new Response(
            '<html><body style="font-family:sans-serif;padding:20px;text-align:center;color:#666">' +
            '<h1>📡 Sin conexión</h1>' +
            '<p>No hay conexión a internet y el contenido no está disponible en caché.</p>' +
            '<p>Intenta más tarde.</p>' +
            '</body></html>',
            {
              status: 503,
              statusText: 'Servicio no disponible',
              headers: new Headers({
                'Content-Type': 'text/html; charset=utf-8'
              })
            }
          );
        })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Si la red funciona y es una respuesta válida, cachear
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, usar caché
        return caches.match(request).then((response) => {
          if (response) {
            return response;
          }
          
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// ──────────────────────────────────────────────────────────────────────────────
// PUSH - Recibir notificaciones push
// ──────────────────────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  console.log('[SW] Notificación push recibida');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%232563eb" width="192" height="192"/><text x="96" y="110" font-size="100" font-weight="900" fill="%23fff" text-anchor="middle">EC</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="%232563eb"/></svg>',
    tag: 'economiacap-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    sound: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
    actions: [
      { action: 'close', title: 'Cerrar' },
      { action: 'view', title: 'Ver' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🔔 EconomiaCap', options)
  );
});

// ──────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONCLICK - Manejar clicks en notificación
// ──────────────────────────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Click en notificación:', event.action);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Buscar ventana existente
      for (const client of clientList) {
        if (client.url.includes('EconomiaCap') && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            data: event.notification.data
          });
          return client.focus();
        }
      }
      
      // Si no existe, abrir nueva ventana
      if (clients.openWindow) return clients.openWindow('./EconomiaCap_v2-33.html');
    })
  );
});

// ──────────────────────────────────────────────────────────────────────────────
// SYNC - Sincronización en background (reservado)
// ──────────────────────────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  event.waitUntil(Promise.resolve());
});

console.log('[SW] Service Worker cargado y listo');
