'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BUYER_CONVERSATION_MESSAGES_LIMIT,
  buyerConversationsAPI,
  useSendBuyerConversationMessageMutation,
} from '@/app/buyer/store/buyerConversationsAPI';
import type { BuyerConversationMessage } from '@/app/buyer/store/buyerConversationsTypes';
import { selectAuthToken } from '@/app/auth/store/authSlice';
import { getAxiosErrorMessage } from '@/lib/axios';
import { getBuyerSocket } from '@/lib/buyerSocket';
import {
  removeOptimisticBuyerMessage,
  touchBuyerConversationPreview,
  upsertBuyerConversationMessage,
} from '@/lib/conversationCache';
import {
  CONVERSATION_EVENTS,
  INCOMING_MESSAGE_EVENTS,
  bindSocketEvents,
  createClientMsgId,
  normalizeIncomingMessage,
  setActiveBuyerConversationId,
  toNumericId,
  type ConversationAck,
  type ConversationReadPayload,
  type ConversationTypingPayload,
} from '@/lib/conversationSocketTypes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

type UseConversationRealtimeArgs = {
  enabled: boolean;
  conversationId: number | null | undefined;
  myUserId: number | null | undefined;
};

type SendResult = {
  ok: boolean;
  message?: BuyerConversationMessage;
  error?: string;
};

function isTypingPayloadActive(payload: ConversationTypingPayload): boolean {
  if (typeof payload.is_typing === 'boolean') return payload.is_typing;
  if (typeof payload.typing === 'boolean') return payload.typing;
  return true;
}

export function useConversationRealtime({
  enabled,
  conversationId,
  myUserId,
}: UseConversationRealtimeArgs) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);
  const [sendBuyerMessage] = useSendBuyerConversationMessageMutation();
  const [sending, setSending] = useState(false);
  const [joined, setJoined] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const conversationIdRef = useRef<number | null>(null);
  const myUserIdRef = useRef<number | null>(null);
  const typingStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingEmittedRef = useRef(false);

  conversationIdRef.current = conversationId ?? null;
  myUserIdRef.current = myUserId ?? null;

  useEffect(() => {
    setActiveBuyerConversationId(enabled ? conversationId ?? null : null);
    return () => setActiveBuyerConversationId(null);
  }, [conversationId, enabled]);

  useEffect(() => {
    if (!enabled || !conversationId || !token) {
      setJoined(false);
      setOtherUserTyping(false);
      return;
    }

    const socket = getBuyerSocket(token);
    if (!socket) return;

    let cancelled = false;
    setOtherUserTyping(false);

    const handleNewMessage = (...args: unknown[]) => {
      const message = normalizeIncomingMessage(args[0]);
      if (!message || message.conversationId !== conversationIdRef.current) return;

      upsertBuyerConversationMessage(dispatch, message);

      const isOwn = myUserIdRef.current != null && message.senderUserId === myUserIdRef.current;
      touchBuyerConversationPreview(dispatch, {
        conversationId: message.conversationId,
        preview: message.body,
        at: message.createdAt,
        senderUserId: message.senderUserId,
        incrementUnread: !isOwn,
        lastReadMessageId: isOwn ? undefined : message.id,
      });

      if (!isOwn && message.id > 0) {
        socket.emit(CONVERSATION_EVENTS.messageRead, {
          conversationId: message.conversationId,
          messageId: message.id,
        });
      }
    };

    const handleTyping = (payload: ConversationTypingPayload) => {
      const payloadConversationId = toNumericId(
        payload.conversation_id ?? payload.conversationId,
      );
      if (payloadConversationId !== conversationIdRef.current) return;

      const senderUserId = toNumericId(payload.sender_user_id ?? payload.senderUserId);
      if (senderUserId != null && senderUserId === myUserIdRef.current) return;

      setOtherUserTyping(isTypingPayloadActive(payload));
    };

    const handleRead = (_payload: ConversationReadPayload) => {
      // Receipt UI can be wired later; event is acknowledged by presence in room.
    };

    const joinConversation = () => {
      socket.emit(
        CONVERSATION_EVENTS.join,
        { conversationId },
        (ack?: ConversationAck) => {
          if (cancelled) return;
          setJoined(Boolean(ack?.success ?? true));
          if (ack && ack.success === false) {
            console.error('Failed to join conversation', ack);
          }
        },
      );
    };

    const unbindIncomingMessages = bindSocketEvents(
      socket,
      INCOMING_MESSAGE_EVENTS,
      handleNewMessage,
    );
    socket.on(CONVERSATION_EVENTS.typing, handleTyping);
    socket.on(CONVERSATION_EVENTS.messageRead, handleRead);
    socket.on('connect', joinConversation);

    if (socket.connected) {
      joinConversation();
    } else {
      socket.connect();
    }

    return () => {
      cancelled = true;
      unbindIncomingMessages();
      socket.off(CONVERSATION_EVENTS.typing, handleTyping);
      socket.off(CONVERSATION_EVENTS.messageRead, handleRead);
      socket.off('connect', joinConversation);
      setJoined(false);
      setOtherUserTyping(false);

      if (typingStopTimerRef.current) {
        clearTimeout(typingStopTimerRef.current);
        typingStopTimerRef.current = null;
      }
      if (isTypingEmittedRef.current) {
        socket.emit(CONVERSATION_EVENTS.typingStop, { conversationId });
        isTypingEmittedRef.current = false;
      }
    };
  }, [conversationId, dispatch, enabled, token]);

  const stopTyping = useCallback(() => {
    const activeConversationId = conversationIdRef.current;
    if (!activeConversationId || !token || !isTypingEmittedRef.current) return;

    const socket = getBuyerSocket(token);
    socket?.emit(CONVERSATION_EVENTS.typingStop, { conversationId: activeConversationId });
    isTypingEmittedRef.current = false;

    if (typingStopTimerRef.current) {
      clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }
  }, [token]);

  const notifyTyping = useCallback(() => {
    const activeConversationId = conversationIdRef.current;
    if (!activeConversationId || !token) return;

    const socket = getBuyerSocket(token);
    if (!socket) return;

    if (!isTypingEmittedRef.current) {
      socket.emit(CONVERSATION_EVENTS.typingStart, { conversationId: activeConversationId });
      isTypingEmittedRef.current = true;
    }

    if (typingStopTimerRef.current) {
      clearTimeout(typingStopTimerRef.current);
    }
    typingStopTimerRef.current = setTimeout(() => {
      stopTyping();
    }, 1500);
  }, [stopTyping, token]);

  const sendTextMessage = useCallback(
    async (body: string): Promise<SendResult> => {
      const activeConversationId = conversationIdRef.current;
      if (!activeConversationId || !token) {
        return { ok: false, error: 'Not ready to send' };
      }

      const trimmed = body.trim();
      if (!trimmed) return { ok: false, error: 'Message is empty' };

      stopTyping();
      setSending(true);

      const clientMsgId = createClientMsgId();
      const now = new Date().toISOString();
      const optimistic: BuyerConversationMessage = {
        id: -Date.now(),
        conversationId: activeConversationId,
        senderUserId: myUserIdRef.current ?? 0,
        body: trimmed,
        attachments: [],
        clientMsgId,
        createdAt: now,
        updatedAt: now,
      };

      upsertBuyerConversationMessage(dispatch, optimistic);
      touchBuyerConversationPreview(dispatch, {
        conversationId: activeConversationId,
        preview: trimmed,
        at: now,
        senderUserId: optimistic.senderUserId,
      });

      try {
        const response = await sendBuyerMessage({
          conversationId: activeConversationId,
          body: trimmed,
          clientMsgId,
        }).unwrap();

        const message =
          normalizeIncomingMessage(response.data?.message) ??
          normalizeIncomingMessage(response.data);

        if (message) {
          upsertBuyerConversationMessage(dispatch, message);
          touchBuyerConversationPreview(dispatch, {
            conversationId: message.conversationId,
            preview: message.body,
            at: message.createdAt,
            senderUserId: message.senderUserId,
          });
        } else {
          void dispatch(
            buyerConversationsAPI.endpoints.getBuyerConversationMessages.initiate(
              {
                conversationId: activeConversationId,
                limit: BUYER_CONVERSATION_MESSAGES_LIMIT,
              },
              { forceRefetch: true, subscribe: false },
            ),
          );
        }

        return { ok: true, message: message ?? optimistic };
      } catch (error) {
        removeOptimisticBuyerMessage(dispatch, activeConversationId, clientMsgId);
        return {
          ok: false,
          error: getAxiosErrorMessage(error) || 'Failed to send message',
        };
      } finally {
        setSending(false);
      }
    },
    [dispatch, sendBuyerMessage, stopTyping, token],
  );

  return {
    sending,
    joined,
    otherUserTyping,
    sendTextMessage,
    notifyTyping,
    stopTyping,
  };
}
