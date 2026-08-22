'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  BUYER_CONVERSATIONS_LIST_PARAMS,
  useGetBuyerConversationsQuery,
} from '@/app/buyer/store/buyerConversationsAPI';
import type { BuyerConversation } from '@/app/buyer/store/buyerConversationsTypes';
import { selectAuthToken, selectAuthUser } from '@/app/auth/store/authSlice';
import { getBuyerSocket } from '@/lib/buyerSocket';
import {
  applyIncomingBuyerMessage,
  refreshBuyerNotifications,
} from '@/lib/conversationCache';
import {
  CONVERSATION_EVENTS,
  INCOMING_MESSAGE_EVENTS,
  NOTIFICATION_EVENTS,
  bindSocketEvents,
  getActiveBuyerConversationId,
  normalizeIncomingMessage,
} from '@/lib/conversationSocketTypes';
import { getChatConversationPath } from '@/lib/notificationRoutes';
import { showToastOnce } from '@/lib/toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function useBuyerRealtime(): void {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);
  const myUserId = useAppSelector(selectAuthUser)?.id ?? null;
  const joinedIdsRef = useRef<Set<number>>(new Set());
  const conversationIdsRef = useRef<number[]>([]);
  const conversationsRef = useRef<BuyerConversation[]>([]);

  const { data: conversationsResponse } = useGetBuyerConversationsQuery(
    BUYER_CONVERSATIONS_LIST_PARAMS,
    { skip: !token, pollingInterval: token ? 30000 : 0 },
  );

  const conversationIdKey = useMemo(() => {
    return (conversationsResponse?.data?.conversations ?? [])
      .map((conversation) => conversation.id)
      .filter((id) => Number.isFinite(id) && id > 0)
      .sort((left, right) => left - right)
      .join(',');
  }, [conversationsResponse]);

  useEffect(() => {
    conversationsRef.current = conversationsResponse?.data?.conversations ?? [];
  }, [conversationsResponse]);

  useEffect(() => {
    conversationIdsRef.current = conversationIdKey
      ? conversationIdKey.split(',').map(Number)
      : [];
  }, [conversationIdKey]);

  useEffect(() => {
    if (!token) {
      console.warn('[WHCAN_NOTIFY] skip socket, no auth token');
      joinedIdsRef.current.clear();
      return;
    }

    const socket = getBuyerSocket(token);
    if (!socket) {
      console.warn('[WHCAN_NOTIFY] skip socket, getBuyerSocket returned null');
      return;
    }

    console.warn('[WHCAN_NOTIFY] socket listeners attached', {
      connected: socket.connected,
      id: socket.id,
    });

    let cancelled = false;
    let notificationRefreshTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleInboxRefresh = () => {
      refreshBuyerNotifications(dispatch);
      if (notificationRefreshTimer) clearTimeout(notificationRefreshTimer);
      notificationRefreshTimer = setTimeout(() => {
        refreshBuyerNotifications(dispatch);
      }, 1500);
    };

    const handleNewMessage = (...args: unknown[]) => {
      const raw = args[0];
      console.log('[notification] socket chat message', raw);
      const message = normalizeIncomingMessage(raw);
      if (!message) {
        scheduleInboxRefresh();
        return;
      }

      const isOwn = myUserId != null && message.senderUserId === myUserId;
      const isActive = getActiveBuyerConversationId() === message.conversationId;
      applyIncomingBuyerMessage(dispatch, message, Boolean(!isOwn && !isActive));

      if (isOwn || isActive) return;

      scheduleInboxRefresh();
      const conversation = conversationsRef.current.find((item) => item.id === message.conversationId);
      const senderName = conversation?.otherParticipant?.fullName?.trim() || 'New message';
      const preview = message.body.trim() || 'Sent you a message';
      showToastOnce(
        `chat:${message.conversationId}:${message.id}`,
        preview,
        'info',
        4000,
        senderName,
        getChatConversationPath(message.conversationId),
      );
    };

    const handleNotification = (payload: unknown, eventName?: string) => {
      console.log('[notification] socket notification', eventName ?? 'notification', payload);
      scheduleInboxRefresh();
    };

    const joinKnownConversations = () => {
      if (cancelled) return;
      joinedIdsRef.current.clear();
      conversationIdsRef.current.forEach((conversationId) => {
        joinedIdsRef.current.add(conversationId);
        socket.emit(CONVERSATION_EVENTS.join, { conversationId });
      });
    };

    const handleAnySocketEvent = (eventName: string, ...args: unknown[]) => {
      console.warn('[WHCAN_NOTIFY] realtime event', eventName, ...args);
    };

    const handleConnect = () => {
      console.log('[notification] socket connected');
      joinKnownConversations();
    };

    const handleNamedNotification = (eventName: string) => (payload: unknown) => {
      handleNotification(payload, eventName);
    };

    const notificationHandlers = NOTIFICATION_EVENTS.map((eventName) => ({
      eventName,
      handler: handleNamedNotification(eventName),
    }));

    const unbindIncomingMessages = bindSocketEvents(
      socket,
      INCOMING_MESSAGE_EVENTS,
      handleNewMessage,
    );
    socket.on(CONVERSATION_EVENTS.ready, joinKnownConversations);
    socket.on('connect', handleConnect);
    socket.onAny(handleAnySocketEvent);
    notificationHandlers.forEach(({ eventName, handler }) => {
      socket.on(eventName, handler);
    });

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    return () => {
      cancelled = true;
      if (notificationRefreshTimer) clearTimeout(notificationRefreshTimer);
      unbindIncomingMessages();
      socket.off(CONVERSATION_EVENTS.ready, joinKnownConversations);
      socket.off('connect', handleConnect);
      socket.offAny(handleAnySocketEvent);
      notificationHandlers.forEach(({ eventName, handler }) => {
        socket.off(eventName, handler);
      });
    };
  }, [dispatch, myUserId, token]);

  useEffect(() => {
    if (!token || !conversationIdKey) return;

    const socket = getBuyerSocket(token);
    if (!socket?.connected) return;

    conversationIdsRef.current.forEach((conversationId) => {
      if (joinedIdsRef.current.has(conversationId)) return;
      joinedIdsRef.current.add(conversationId);
      socket.emit(CONVERSATION_EVENTS.join, { conversationId });
    });
  }, [conversationIdKey, token]);
}
