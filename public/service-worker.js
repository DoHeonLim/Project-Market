self.addEventListener('push', function(event) {
  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png'
  };

  event.waitUntil(
    self.registration.showNotification('새 알림', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // 알림 클릭시 처리할 로직
}); 