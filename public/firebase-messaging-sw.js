// Give the service worker access to Firebase Messaging.
// Note: These URLs must be correct and compatible with the Firebase version you use.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyAAUdbLbamL9vhWEDPGD5PM5maBLpQsihk",
    authDomain: "rapi-flete.firebaseapp.com",
    projectId: "rapi-flete",
    storageBucket: "rapi-flete.firebasestorage.app",
    messagingSenderId: "848936151778",
    appId: "1:848936151778:web:443c40cf7a1583bf59ccbb"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title || 'RapiFletes Alerta';
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/imagenes/1.jpg', // Ensure this icon exists
        data: payload.data,
        vibrate: [200, 100, 200, 100, 200],
        tag: 'trip-alert', // To prevent multiple notifications for the same alert
        renotify: true,
        requireInteraction: true // Keeps the notification visible until user clicks it
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
