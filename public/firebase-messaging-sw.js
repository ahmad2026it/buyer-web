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
const PUSH_MESSAGE_TYPE = "WHCAN_PUSH";

function resolveTargetPath(data) {
  if (!data) return "/";
  if (data.url) return data.url;

  const type = String(data.type || data.key || data.source || data.eventKey || "").toLowerCase();
  const conversationId = data.conversationId || data.conversation_id;
  const bookingId = data.bookingId || data.booking_id;
  const sellerId = data.sellerId || data.seller_id;

  const isChat = /(message|chat|conversation|support)/.test(type);
  if (conversationId) return `/chat?id=${conversationId}`;
  if (isChat && bookingId) return `/chat?bookingId=${bookingId}`;
  if (isChat && sellerId) return `/chat?sellerId=${sellerId}`;
  if (isChat) return "/chat";

  if (bookingId) {
    return `/bookings/${bookingId}`;
  }
  if (data.disputeId && /dispute/.test(type)) return `/disputes/${data.disputeId}`;
  if (data.customFavorId) return `/custom-favors/${data.customFavorId}`;
  if (data.favorId) return `/favor/${data.favorId}`;

  if (/booking|completed/.test(type)) return "/bookings";
  if (/dispute/.test(type)) return "/disputes";
  if (/(bid|favor)/.test(type)) return "/custom-favors";

  return "/";
}

function parsePushPayload(event) {
  if (!event.data) return {};
  try {
    return event.data.json() || {};
  } catch {
    return { data: { body: event.data.text() } };
  }
}

function buildClientMessage(payload) {
  const data = payload.data || {};
  return {
    type: PUSH_MESSAGE_TYPE,
    message: {
      title: payload.notification?.title || data.title || "WhoCan",
      body: payload.notification?.body || data.body || "",
      data,
    },
  };
}

function notifyOpenClients(payload) {
  const message = buildClientMessage(payload);
  console.log("[WHCAN_NOTIFY] forwarding push to page", message);

  return self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clientList) => {
      clientList.forEach((client) => client.postMessage(message));
      return clientList.some((client) => client.visibilityState === "visible");
    });
}

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event);
  console.log("[WHCAN_NOTIFY] sw push", payload);

  event.waitUntil(
    notifyOpenClients(payload).then((hasVisibleClient) => {
      if (hasVisibleClient) return undefined;
      if (payload.notification) return undefined;

      const data = payload.data || {};
      return self.registration.showNotification(
        payload.notification?.title || data.title || "WhoCan",
        {
          body: payload.notification?.body || data.body || "",
          icon: "/hero.png",
          data: { ...data, path: resolveTargetPath(data) },
        },
      );
    }),
  );
});

messaging.onBackgroundMessage((payload) => {
  console.log("[WHCAN_NOTIFY] background fcm", payload);
  return notifyOpenClients(payload);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

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
