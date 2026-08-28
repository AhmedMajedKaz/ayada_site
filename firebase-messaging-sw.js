// firebase-messaging-sw.js
// Place this file at the ROOT of your Flutter web folder (web/firebase-messaging-sw.js)
// so it ends up at build/web/firebase-messaging-sw.js after `flutter build web`.

importScripts('https://www.gstatic.com/firebasejs/10.7.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.2/firebase-messaging-compat.js');

// Replace with your actual Firebase web config (same values as in your Dart
// FirebaseOptions / firebase_options.dart). messagingSenderId must be exact.
firebase.initializeApp({
  apiKey: "AIzaSyA45Na6fGPM-aewMn7LYBlbymK7wWRCkZQ",
  authDomain: "ayadaplus.firebaseapp.com",
  projectId: "ayadaplus",
  storageBucket: "ayadaplus.firebasestorage.app",
  messagingSenderId: "457250759134",
  appId: "1:457250759134:web:25a7eff217ed72ee06fd4f",
});

// Take control of the page immediately. Without this, a newly deployed
// version of this file can sit "waiting" while an old (possibly broken)
// version keeps handling pushes until the user fully closes every tab.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// -----------------------------------------------------------------------
// IMPORTANT: we deliberately do NOT call firebase.messaging() /
// onBackgroundMessage() here.
//
// Firebase's built-in handler checks whether a window of your app is
// currently open and focused. If it finds one, it silently skips showing
// a system notification and instead forwards the message to that page's
// foreground onMessage listener — which is exactly why notifications only
// showed up sometimes when your site was open.
//
// Listening to the raw 'push' event ourselves bypasses that check
// entirely. This fires on every single push the browser delivers,
// regardless of whether the tab is open, focused, backgrounded, or the
// browser is closed — so the notification always shows.
// -----------------------------------------------------------------------
self.addEventListener('push', (event) => {
    console.log("New Push Event");
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { notification: { title: 'New message', body: event.data.text() } };
  }

  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title || data.title || 'New notification';
  const options = {
    body: notification.body || data.body || '',
    icon: notification.icon || '/icons/Icon-192.png',
    badge: '/icons/Icon-192.png',
    data: {
      click_action: notification.click_action || data.click_action || '/',
      ...data,
    },
    // Give pushes the same tag if you want a new one to replace the last
    // (e.g. chat messages from the same thread) instead of stacking up.
    // tag: data.tag,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle the user clicking the notification: focus an existing tab if one
// matches, otherwise open a new one.
self.addEventListener('notificationclick', (event) => {
    
    console.log("New Click Event");
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.click_action) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});