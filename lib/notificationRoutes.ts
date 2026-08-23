import type { BuyerNotification } from '@/app/buyer/store/buyerNotificationsTypes';

function toPositiveId(value: unknown): string | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return String(Math.trunc(n));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parsePayload(payload: unknown): Record<string, unknown> | null {
  if (typeof payload === 'string') {
    try {
      return asRecord(JSON.parse(payload));
    } catch {
      return null;
    }
  }
  return asRecord(payload);
}

function pickId(record: Record<string, unknown> | null, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const id = toPositiveId(record[key]);
    if (id) return id;
  }
  return null;
}

function firstId(
  records: Array<Record<string, unknown> | null>,
  keys: string[],
): string | null {
  for (const record of records) {
    const id = pickId(record, keys);
    if (id) return id;
  }
  return null;
}

function chatPath(params: Record<string, string | null>): string {
  const query = Object.entries(params)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return query ? `/chat?${query}` : '/chat';
}

export function getChatConversationPath(conversationId: number | string): string {
  return chatPath({ id: String(conversationId) });
}

export function getIncomingEventTargetPath(data: Record<string, unknown>): string | null {
  const actor = asRecord(data.actor);
  const actorId =
    toPositiveId(data.actorUserId) ??
    toPositiveId(data.actor_user_id) ??
    toPositiveId(data.sellerId) ??
    toPositiveId(data.seller_id) ??
    pickId(actor, ['id']);

  return getNotificationTargetPath({
    id: Number(toPositiveId(data.notificationId ?? data.notification_id ?? data.id) ?? 0),
    title: typeof data.title === 'string' ? data.title : '',
    description: typeof data.description === 'string' ? data.description : typeof data.body === 'string' ? data.body : '',
    message: typeof data.message === 'string' ? data.message : typeof data.body === 'string' ? data.body : '',
    key: typeof data.key === 'string' ? data.key : typeof data.eventKey === 'string' ? String(data.eventKey) : '',
    payload: data,
    isRead: false,
    readAt: null,
    createdAt: '',
    updatedAt: '',
    actorUserId: actorId ? Number(actorId) : null,
    actor: actor
      ? {
          id: Number(pickId(actor, ['id']) ?? 0) || undefined,
          fullName: typeof actor.fullName === 'string' ? actor.fullName : undefined,
          name: typeof actor.name === 'string' ? actor.name : undefined,
          profileImage: typeof actor.profileImage === 'string' ? actor.profileImage : null,
        }
      : null,
    visualType: typeof data.visualType === 'string' ? data.visualType : typeof data.type === 'string' ? data.type : '',
  });
}

function isCustomFavorRequest(type: string): boolean {
  return /(custom[_\s-]?favor[_\s-]?request|buyer_new_custom_request)/.test(type);
}

export function getNotificationTargetPath(notification: BuyerNotification): string | null {
  const payload = parsePayload(notification.payload);
  const nestedData = asRecord(payload?.data);
  const nestedBooking = asRecord(payload?.booking);
  const nestedConversation = asRecord(payload?.conversation) ?? asRecord(nestedData?.conversation);
  const sources = [payload, nestedData, nestedBooking, nestedConversation];
  const type = [
    notification.key,
    notification.visualType,
    notification.title,
    notification.description,
    payload?.source,
    payload?.type,
    payload?.event,
    payload?.eventKey,
    payload?.event_key,
    payload?.favorType,
    payload?.favor_type,
    nestedData?.type,
    nestedData?.source,
    nestedData?.eventKey,
    nestedData?.event_key,
    nestedData?.favorType,
    nestedData?.favor_type,
  ]
    .filter((value) => typeof value === 'string' && value.trim())
    .join(' ')
    .toLowerCase();
  const looksLikeBooking =
    /(booking|booked|accepted|declined|cancelled|canceled|completed|in-progress|in_progress|inprogress)/.test(
      type,
    );
  const isChat =
    /(message|chat|conversation|support)/.test(type) ||
    (Boolean(notification.actorUserId || notification.actor?.id) &&
      !looksLikeBooking &&
      !/(dispute|bid|favor|offer)/.test(type));
  const customFavorRequest = isCustomFavorRequest(type);

  const explicitUrl = payload?.url ?? payload?.path ?? nestedData?.url ?? nestedData?.path;
  if (typeof explicitUrl === 'string' && explicitUrl.startsWith('/')) return explicitUrl;

  const bookingId =
    firstId(sources, ['bookingId', 'booking_id', 'favorBookingId', 'favor_booking_id']) ??
    pickId(nestedBooking, ['id']) ??
    (/booking/.test(type) && !isChat && !customFavorRequest ? pickId(payload, ['id']) : null);
  const disputeId =
    firstId(sources, ['disputeId', 'dispute_id']) ??
    pickId(asRecord(payload?.dispute), ['id']);
  const favorId = firstId(sources, ['favorId', 'favor_id']);
  const customFavorId =
    firstId(sources, ['customFavorId', 'custom_favor_id', 'customFavor_id']) ??
    (customFavorRequest ? favorId : null);
  const conversationId =
    firstId(sources, ['conversationId', 'conversation_id', 'chatId', 'chat_id', 'threadId', 'thread_id']) ??
    pickId(nestedConversation, ['id']) ??
    (isChat ? pickId(payload, ['id']) : null);
  const sellerId =
    toPositiveId(notification.actorUserId) ??
    toPositiveId(notification.actor?.id) ??
    firstId(sources, ['sellerId', 'seller_id', 'sellerUserId', 'seller_user_id']);

  if (isChat || conversationId) {
    return chatPath({
      id: conversationId,
      bookingId: conversationId ? null : bookingId,
      sellerId: conversationId || bookingId ? null : sellerId,
    });
  }

  if (customFavorId) return `/custom-favors/${customFavorId}`;
  if (customFavorRequest) return '/custom-favors';
  if (bookingId) return `/bookings/${bookingId}`;
  if (disputeId) return `/disputes/${disputeId}`;
  if (favorId) return `/favor/${favorId}`;

  if (/booking/.test(type)) return '/bookings';
  if (/dispute/.test(type)) return '/disputes';
  if (/(bid|custom.?favor)/.test(type)) return '/custom-favors';

  return null;
}
