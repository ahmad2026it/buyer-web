self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

importScripts(
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyBGHt0HyQLzidZYCvOLTuDIV6SkWbnaf0w",
  authDomain: "whocan-provider.firebaseapp.com",
  projectId: "whocan-provider",
  storageBucket: "whocan-provider.firebasestorage.app",
  messagingSenderId: "936736633235",
  appId: "1:936736633235:web:b0d9503366d9322adef866",
});

const messaging = firebase.messaging();

// Maps an admin push payload to an in-app route. `data.url` always wins so the
// backend can link anywhere without a service worker change.
function resolveTargetPath(data) {
  if (!data) return "/";
  if (data.url) return data.url;

  const type = String(data.type || data.key || data.source || "").toLowerCase();
  const conversationId = data.conversationId || data.conversation_id;
  const bookingId = data.bookingId || data.booking_id;
  const sellerId = data.sellerId || data.seller_id;

  const isChat = /(message|chat|conversation|support)/.test(type);
  if (conversationId) return `/chat?id=${conversationId}`;
  if (isChat && bookingId) return `/chat?bookingId=${bookingId}`;
  if (isChat && sellerId) return `/chat?sellerId=${sellerId}`;
  if (isChat) return "/chat";

  if (data.bookingId && /booking/.test(type)) return `/bookings/${data.bookingId}`;
  if (data.disputeId && /dispute/.test(type)) return `/disputes/${data.disputeId}`;
  if (data.customFavorId) return `/custom-favors/${data.customFavorId}`;
  if (data.favorId) return `/favor/${data.favorId}`;

  if (/booking/.test(type)) return "/bookings";
  if (/dispute/.test(type)) return "/disputes";
  if (/(bid|favor)/.test(type)) return "/custom-favors";

  return "/";
}

messaging.onBackgroundMessage((payload) => {
  console.log("[push-sw] background message received", payload);
  const data = payload.data || {};
  const title = payload.notification?.title || data.title || "WhoCan";

  self.registration.showNotification(title, {
    body: payload.notification?.body || data.body || "",
    icon: "/hero.png",
    data: { ...data, path: resolveTargetPath(data) },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Notifications auto-displayed by FCM nest the original payload under FCM_MSG.
  const raw = event.notification.data || {};
  const data = raw.FCM_MSG ? raw.FCM_MSG.data || {} : raw;
  const path = raw.path || resolveTargetPath(data);
  const target = new URL(path, self.location.origin);

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (new URL(client.url).origin !== target.origin) continue;
          if ("navigate" in client) {
            return client.navigate(target.href).then((c) => c && c.focus());
          }
          return client.focus();
        }
        return self.clients.openWindow(target.href);
      }),
  );
});
