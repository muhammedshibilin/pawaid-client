importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAKE1WChof2dlwR-vRXvEBDN7ibbK4myZM",
  authDomain: "pawaid-956b3.firebaseapp.com",
  projectId: "pawaid-956b3",
  storageBucket: "pawaid-956b3.firebasestorage.app",
  messagingSenderId: "332134958469",
  appId: "1:332134958469:web:749f0652705fc06c8370ec",
  measurementId: "G-BLN56L76YC"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message.',
    icon: '/assets/user/images/logo.png',
    data: {
      url: payload.data?.redirectUrl || '/' 
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification);

  const urlToOpen = event.notification.data?.url || '/';
  event.notification.close(); 

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen); 
    })
  );
});
