// Service Worker do Firebase Cloud Messaging — recebe push com o app FECHADO
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyBf-n2LxXfYGh3Mz989Liq2mSs5C4zYfwg",
  authDomain:        "votoratyautomaticsystem.firebaseapp.com",
  projectId:         "votoratyautomaticsystem",
  storageBucket:     "votoratyautomaticsystem.firebasestorage.app",
  messagingSenderId: "73851236449",
  appId:             "1:73851236449:web:54b28cfc6cc27a31fa7a20"
});

const messaging = firebase.messaging();

// Notificação recebida com o app em segundo plano / fechado
messaging.onBackgroundMessage(function(payload){
  const n = payload.notification || {};
  self.registration.showNotification(n.title || 'Votoraty Academy', {
    body: n.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'votoraty-fcm',
    data: payload.data || {}
  });
});

// Ao tocar na notificação, abre/foca o app
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(function(list){
    for(const c of list){ if('focus' in c) return c.focus(); }
    if(clients.openWindow) return clients.openWindow('/');
  }));
});
