const CACHE_NAME = 'aurex-wellness-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/crm.html',
  '/plan10k.html',
  '/transformacion.html',
  '/herramientas.html',
  '/networking.html',
  '/logo-aurex-wellness.jpeg'
];

// Instalar y cachear assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// Activar y limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Notificaciones push
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'AUREX Wellness';
  const options = {
    body: data.body || 'Tienes seguimientos pendientes hoy',
    icon: '/logo-aurex-wellness.jpeg',
    badge: '/logo-aurex-wellness.jpeg',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/crm.html' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// Click en notificación — abrir la app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/crm.html';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
