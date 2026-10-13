// FitPulse • Service Worker (PWA & iOS Web Push Notifications)
const CACHE_NAME = 'fitpulse-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Bildirime tıklandığında uygulamayı öne getir
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});

// Arka plan Push mesajı geldiğinde tetiklenir
self.addEventListener('push', (event) => {
  let data = {
    title: 'FitPulse • Koçundan Bildirim',
    body: 'Yeni bir mesajın var!',
    icon: 'assets/icon.png'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'Koçundan yeni bir uyarı/motivasyon mesajı var!',
    icon: 'assets/icon.png',
    badge: 'assets/favicon.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'FitPulse', options)
  );
});
