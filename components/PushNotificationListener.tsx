'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  BUYER_NOTIFICATIONS_PAGE_SIZE,
  useGetBuyerNotificationsQuery,
} from '@/app/buyer/store/buyerNotificationsAPI';
import { getNotificationPermission, onForegroundMessage, type PushMessage } from '@/lib/fcm';
import {
  handleIncomingBuyerInboxItem,
  handleIncomingBuyerPush,
} from '@/lib/pushNotifications';
import { useBuyerRealtime } from '@/lib/useBuyerRealtime';

function payloadToPushMessage(payload: unknown): PushMessage | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as { type?: string; message?: PushMessage };
  if (data.type !== 'WHCAN_PUSH' && data.type !== 'WHOCAN_PUSH') return null;
  if (!data.message) return null;

  return {
    title: data.message.title || 'WhoCan',
    body: data.message.body || '',
    data: data.message.data ?? {},
  };
}

export default function PushNotificationListener() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const lastNotificationIdRef = useRef<number | null>(null);

  useBuyerRealtime();

  const { data: notificationsResponse } = useGetBuyerNotificationsQuery(
    { page: 1, limit: BUYER_NOTIFICATIONS_PAGE_SIZE },
    {
      skip: !token,
      pollingInterval: token ? 15000 : 0,
    },
  );

  useEffect(() => {
    console.warn('[WHCAN_NOTIFY] listener mounted', {
      hasToken: Boolean(token),
      permission: getNotificationPermission(),
    });
  }, [token]);

  useEffect(() => {
    const latest = notificationsResponse?.data?.notifications?.[0];
    const unreadCount = notificationsResponse?.data?.unreadCount;
    if (!latest) return;

    if (lastNotificationIdRef.current == null) {
      lastNotificationIdRef.current = latest.id;
      console.warn('[WHCAN_NOTIFY] notifications loaded', {
        latestId: latest.id,
        unreadCount,
        title: latest.title,
      });
      return;
    }

    if (latest.id === lastNotificationIdRef.current) return;

    lastNotificationIdRef.current = latest.id;
    console.warn('[WHCAN_NOTIFY] new notification from API', latest);
    void handleIncomingBuyerInboxItem(dispatch, latest);
  }, [dispatch, notificationsResponse]);

  useEffect(() => {
    const handlePush = (message: PushMessage) => {
      console.warn('[WHCAN_NOTIFY] incoming push', message);
      void handleIncomingBuyerPush(dispatch, message);
    };

    const onWorkerMessage = (event: MessageEvent) => {
      const message = payloadToPushMessage(event.data);
      if (!message) return;
      handlePush(message);
    };

    navigator.serviceWorker?.addEventListener('message', onWorkerMessage);

    void navigator.serviceWorker
      ?.register('/firebase-messaging-sw.js')
      .then((registration) => {
        void registration.update();
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      })
      .catch((error) => {
        console.warn('[WHCAN_NOTIFY] failed to refresh service worker', error);
      });

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    if (token) {
      onForegroundMessage((message) => {
        handlePush(message);
      }).then((off) => {
        console.warn('[WHCAN_NOTIFY] fcm listener ready');
        if (cancelled) off();
        else unsubscribe = off;
      });
    } else {
      console.warn('[WHCAN_NOTIFY] skip firebase onMessage, no auth token');
    }

    return () => {
      cancelled = true;
      navigator.serviceWorker?.removeEventListener('message', onWorkerMessage);
      unsubscribe?.();
    };
  }, [dispatch, token]);

  return null;
}
