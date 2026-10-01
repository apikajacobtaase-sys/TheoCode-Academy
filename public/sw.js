// Service Worker for push notifications
self.addEventListener('install', (event) => {
  console.log('[SW] Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  event.waitUntil(self.clients.claim());
});

// Handle incoming push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.message || 'You have a new notification',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: data.link || '/',
        notificationId: data.id
      },
      vibrate: [200, 100, 200],
      tag: data.id, // Prevents duplicate notifications
      requireInteraction: false,
      actions: data.link ? [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ] : []
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'TheCode Academy', options)
    );
  } catch (error) {
    console.error('[SW] Push error:', error);
  }
});

// Handle notification click - open/focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If app is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Navigate to the specific page
          client.postMessage({ type: 'NAVIGATE', url: urlToOpen });
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification dismiss
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification dismissed');
});