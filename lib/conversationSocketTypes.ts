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

export const NOTIFICATION_EVENTS = [
  'notification:new',
  'notification:created',
  'notifications:new',
  'user:notification',
  'buyer:notification',
] as const;

type IncomingMessageRaw = Partial<BuyerConversationMessage> & {
  message?: BuyerConversationMessage;
  conversation_id?: number;
  sender_user_id?: number;
  client_msg_id?: string;
  created_at?: string;
  updated_at?: string;
};

let activeBuyerConversationId: number | null = null;

export function setActiveBuyerConversationId(id: number | null): void {
  activeBuyerConversationId = id;
}

export function getActiveBuyerConversationId(): number | null {
  return activeBuyerConversationId;
}

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

export function normalizeIncomingMessage(raw: unknown): BuyerConversationMessage | null {
  if (!raw || typeof raw !== 'object') return null;
  const msg = raw as IncomingMessageRaw;

  if (msg.message && typeof msg.message === 'object') {
    return normalizeIncomingMessage(msg.message);
  }

  const id = toNumericId(msg.id);
  const conversationId = toNumericId(msg.conversationId ?? msg.conversation_id);
  const senderUserId = toNumericId(msg.senderUserId ?? msg.sender_user_id);
  if (id == null || conversationId == null || senderUserId == null) return null;

  const createdAt = msg.createdAt ?? msg.created_at ?? new Date().toISOString();

  return {
    id,
    conversationId,
    senderUserId,
    body: typeof msg.body === 'string' ? msg.body : '',
    attachments: Array.isArray(msg.attachments) ? msg.attachments : [],
    clientMsgId: msg.clientMsgId ?? msg.client_msg_id ?? '',
    createdAt,
    updatedAt: msg.updatedAt ?? msg.updated_at ?? createdAt,
  };
}
