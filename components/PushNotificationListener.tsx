'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { buyerNotificationsAPI } from '@/app/buyer/store/buyerNotificationsAPI';
import { onForegroundMessage } from '@/lib/fcm';
import { showToast } from '@/lib/toast';

export default function PushNotificationListener() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (!token) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    onForegroundMessage((message) => {
      console.log('[push] foreground message received', message);
      const { title, body } = message;
      showToast(body ? `${title}: ${body}` : title, 'info');
      dispatch(buyerNotificationsAPI.util.invalidateTags(['BuyerNotifications']));
    }).then((off) => {
      console.log('[push] listening for foreground messages');
      if (cancelled) off();
      else unsubscribe = off;
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [dispatch, token]);

  return null;
}
