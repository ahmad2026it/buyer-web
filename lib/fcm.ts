"use client";

import { firebaseVapidKey, getFirebaseApp } from "@/lib/firebase";

export type FcmTokenResult = {
  token?: string;
  status: "ok" | "blocked" | "unsupported";
  reason?: string;
};

export type PushMessage = {
  title: string;
  body: string;
  data: Record<string, string>;
};

export function isEdgeBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Edg\//.test(navigator.userAgent);
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
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

export async function onForegroundMessage(
  handler: (message: PushMessage) => void,
): Promise<() => void> {
  if (typeof window === "undefined" || Notification.permission !== "granted") {
    return () => {};
  }

  try {
    const { getMessaging, onMessage } = await import("firebase/messaging");
    return onMessage(getMessaging(getFirebaseApp()), (payload) => {
      const data = (payload.data ?? {}) as Record<string, string>;
      handler({
        title: payload.notification?.title ?? data.title ?? "WhoCan",
        body: payload.notification?.body ?? data.body ?? "",
        data,
      });
    });
  } catch (error) {
    console.warn("Failed to subscribe to foreground push messages", error);
    return () => {};
  }
}

export async function getWebFcmToken(): Promise<FcmTokenResult> {
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
    return { status: "blocked", reason: "notification permission is denied" };
  }

  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { status: "blocked", reason: "notification permission was not granted" };
    }
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
      return { status: "blocked", reason: "Firebase returned an empty token" };
    }

    return { token, status: "ok" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown FCM error";
    const blocked =
      message.toLowerCase().includes("permission") ||
      message.toLowerCase().includes("registration failed") ||
      (error instanceof DOMException && error.name === "NotAllowedError");

    return {
      status: blocked ? "blocked" : "unsupported",
      reason: message,
    };
  }
}
