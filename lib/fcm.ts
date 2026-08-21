"use client";

import { firebaseVapidKey, getFirebaseApp } from "@/lib/firebase";

export type FcmTokenResult = {
  token?: string;
  status: "ok" | "blocked" | "unsupported" | "pending";
  reason?: string;
};

export type PushMessage = {
  title: string;
  body: string;
  data: Record<string, string>;
};

const FCM_TOKEN_CACHE_KEY = "whoCan_webFcmToken";

export function isEdgeBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Edg\//.test(navigator.userAgent);
}

export function isChromeBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Chrome\//.test(navigator.userAgent) && !/Edg\//.test(navigator.userAgent);
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Ask the browser for notification permission.
 * Edge often never resolves requestPermission() because it uses a quiet
 * address-bar bell instead of Chrome's popup / Windows "turn on" dialog.
 */
export async function requestNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }

  const requested = Notification.requestPermission()
    .then(() => Notification.permission)
    .catch(() => Notification.permission);

  if (!isEdgeBrowser()) {
    const permission = await requested;
    console.warn("[WHCAN_NOTIFY] notification permission", {
      permission,
      browser: "chrome-or-other",
    });
    return permission;
  }

  const permission = await Promise.race([requested, delay(3000).then(() => Notification.permission)]);
  console.warn("[WHCAN_NOTIFY] notification permission", {
    permission,
    browser: "edge",
    quietUi: permission === "default",
  });
  return permission;
}

export function getCachedWebFcmToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem(FCM_TOKEN_CACHE_KEY)?.trim();
  return token || null;
}

function cacheWebFcmToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) sessionStorage.setItem(FCM_TOKEN_CACHE_KEY, token);
  else sessionStorage.removeItem(FCM_TOKEN_CACHE_KEY);
}

const waitForActiveWorker = async (
  registration: ServiceWorkerRegistration,
): Promise<ServiceWorkerRegistration> => {
  const worker = registration.active ?? registration.installing ?? registration.waiting;
  if (worker?.state === "activated") return registration;

  if (worker) {
    await new Promise<void>((resolve) => {
      worker.addEventListener("statechange", () => {
        if (worker.state === "activated") resolve();
      });
    });
  }

  await navigator.serviceWorker.ready;
  return registration;
};

function isPushMessageEvent(payload: unknown): payload is { type: string; message: PushMessage } {
  if (!payload || typeof payload !== "object") return false;
  const data = payload as { type?: string; message?: PushMessage };
  return (data.type === "WHCAN_PUSH" || data.type === "WHOCAN_PUSH") && Boolean(data.message);
}

export async function onForegroundMessage(
  handler: (message: PushMessage) => void,
): Promise<() => void> {
  if (typeof window === "undefined") {
    return () => {};
  }

  const unsubscribers: Array<() => void> = [];

  const onWorkerMessage = (event: MessageEvent) => {
    const payload = event.data;
    if (!isPushMessageEvent(payload)) return;
    console.warn("[WHCAN_NOTIFY] service worker message", payload.message);
    const message = payload.message;
    handler({
      title: message.title || "WhoCan",
      body: message.body || "",
      data: message.data ?? {},
    });
  };

  navigator.serviceWorker?.addEventListener("message", onWorkerMessage);
  unsubscribers.push(() => {
    navigator.serviceWorker?.removeEventListener("message", onWorkerMessage);
  });

  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
      await waitForActiveWorker(registration);

      const { getMessaging, onMessage } = await import("firebase/messaging");
      const unsubscribe = onMessage(getMessaging(getFirebaseApp()), (payload) => {
        console.warn("[WHCAN_NOTIFY] firebase onMessage", payload);
        const data = (payload.data ?? {}) as Record<string, string>;
        handler({
          title: payload.notification?.title ?? data.title ?? "WhoCan",
          body: payload.notification?.body ?? data.body ?? "",
          data,
        });
      });
      unsubscribers.push(unsubscribe);
    } catch (error) {
      console.warn("Failed to subscribe to foreground push messages", error);
    }
  }

  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
}

export async function getWebFcmToken(options?: {
  requestPermission?: boolean;
}): Promise<FcmTokenResult> {
  if (typeof window === "undefined") {
    return { status: "unsupported", reason: "window unavailable" };
  }
  if (!window.isSecureContext) {
    return { status: "unsupported", reason: "page is not a secure context" };
  }
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return { status: "unsupported", reason: "notifications or service workers are unavailable" };
  }

  if (Notification.permission === "denied") {
    cacheWebFcmToken(null);
    return { status: "blocked", reason: "notification permission is denied" };
  }

  if (Notification.permission !== "granted") {
    if (!options?.requestPermission) {
      return {
        status: "blocked",
        reason: "notification permission has not been granted yet",
      };
    }

    const permission = await requestNotificationPermission();
    if (permission === "denied") {
      cacheWebFcmToken(null);
      return { status: "blocked", reason: "notification permission was not granted" };
    }
    if (permission !== "granted") {
      cacheWebFcmToken(null);
      return {
        status: "pending",
        reason: "Edge hid the prompt behind the address-bar bell",
      };
    }
  }

  const cached = getCachedWebFcmToken();
  if (cached && Notification.permission === "granted" && !options?.requestPermission) {
    return { token: cached, status: "ok" };
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );
    await waitForActiveWorker(registration);

    const { getMessaging, getToken } = await import("firebase/messaging");
    const messaging = getMessaging(getFirebaseApp());
    const token = await getToken(messaging, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      cacheWebFcmToken(null);
      return { status: "blocked", reason: "Firebase returned an empty token" };
    }

    cacheWebFcmToken(token);
    return { token, status: "ok" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown FCM error";
    const blocked =
      message.toLowerCase().includes("permission") ||
      message.toLowerCase().includes("registration failed") ||
      (error instanceof DOMException && error.name === "NotAllowedError");

    cacheWebFcmToken(null);
    return {
      status: blocked ? "blocked" : "unsupported",
      reason: message,
    };
  }
}
