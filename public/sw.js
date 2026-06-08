self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title || 'Spektar', {
      body: data.body || '',
      icon: data.icon || '/spektarLogo.png',
      badge: '/spektarLogo.png',
      data: data.data || {},
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notifData = event.notification.data || {};
  let url = '/';

  if (notifData.type === 'friend_request' || notifData.type === 'friend_accepted') {
    url = '/';
  } else if (notifData.type === 'post_vote' || notifData.type === 'post_comment' || notifData.type === 'comment_reply') {
    url = notifData.entityId ? `/post/${notifData.entityId}` : '/';
  } else if (notifData.type === 'chat_invite') {
    url = '/chat';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
