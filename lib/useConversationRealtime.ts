'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BuyerConversationMessage } from '@/app/buyer/store/buyerConversationsTypes';
import { getBuyerSocket } from '@/lib/buyerSocket';
import {
  removeOptimisticBuyerMessage,
  touchBuyerConversationPreview,
  upsertBuyerConversationMessage,
} from '@/lib/conversationCache';
import {
  CONVERSATION_EVENTS,
  createClientMsgId,
  normalizeIncomingMessage,
  setActiveBuyerConversationId,
  toNumericId,
  type ConversationAck,
  type ConversationReadPayload,
  type ConversationSendAckData,
  type ConversationTypingPayload,
} from '@/lib/conversationSocketTypes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthToken } from '@/app/auth/store/authSlice';

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

    const handleNewMessage = (raw: unknown) => {
      const message = normalizeIncomingMessage(raw);
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

    socket.on(CONVERSATION_EVENTS.messageNew, handleNewMessage);
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
      socket.off(CONVERSATION_EVENTS.messageNew, handleNewMessage);
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
        return { ok: false, error: 'Socket is not ready' };
      }

      const trimmed = body.trim();
      if (!trimmed) return { ok: false, error: 'Message is empty' };

      const socket = getBuyerSocket(token);
      if (!socket) return { ok: false, error: 'Socket is not ready' };

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

      return new Promise((resolve) => {
        let settled = false;

        const finish = (result: SendResult) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          setSending(false);
          resolve(result);
        };

        const timeout = setTimeout(() => {
          removeOptimisticBuyerMessage(dispatch, activeConversationId, clientMsgId);
          finish({ ok: false, error: 'Failed to send message' });
        }, 15000);

        socket.emit(
          CONVERSATION_EVENTS.messageSend,
          { conversationId: activeConversationId, body: trimmed, clientMsgId },
          (ack?: ConversationAck<ConversationSendAckData>) => {
            if (!ack?.success) {
              removeOptimisticBuyerMessage(dispatch, activeConversationId, clientMsgId);
              finish({
                ok: false,
                error: ack?.message || 'Failed to send message',
              });
              return;
            }

            const message = ack.data?.message
              ? normalizeIncomingMessage(ack.data.message)
              : null;
            if (message) {
              upsertBuyerConversationMessage(dispatch, message);
              touchBuyerConversationPreview(dispatch, {
                conversationId: message.conversationId,
                preview: message.body,
                at: message.createdAt,
                senderUserId: message.senderUserId,
              });
            }

            finish({ ok: true, message: message ?? undefined });
          },
        );
      });
    },
    [dispatch, stopTyping, token],
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
