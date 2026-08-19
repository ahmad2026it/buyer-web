import type { BuyerConversationMessage } from '@/app/buyer/store/buyerConversationsTypes';

export type ConversationAck<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export type ConversationSendAckData = {
  message?: BuyerConversationMessage;
};

export type ConversationTypingPayload = {
  conversationId?: number;
  conversation_id?: number;
  is_typing?: boolean;
  typing?: boolean;
  senderUserId?: number;
  sender_user_id?: number;
};

export type ConversationReadPayload = {
  conversationId?: number;
  conversation_id?: number;
  messageId?: number;
  message_id?: number;
};

export const CONVERSATION_EVENTS = {
  join: 'conversation:join',
  leave: 'conversation:leave',
  messageSend: 'conversation:message:send',
  messageNew: 'conversation:message:new',
  messageRead: 'conversation:message:read',
  typing: 'conversation:typing',
  typingStart: 'conversation:typing:start',
  typingStop: 'conversation:typing:stop',
  ready: 'ready',
} as const;

export function createClientMsgId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `buyer-msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function toNumericId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}
