import { buyerBookingsAPI } from '@/app/buyer/store/buyerBookingsAPI';
import type {
  GetBuyerBookingByIdResponse,
  GetBuyerBookingsResponse,
} from '@/app/buyer/store/buyerBookingsTypes';
import type {
  BuyerNotification,
  BuyerNotificationActor,
  GetBuyerNotificationsResponse,
} from '@/app/buyer/store/buyerNotificationsTypes';
import type { PushMessage } from '@/lib/fcm';
import { refreshBuyerBookings, refreshBuyerInbox } from '@/lib/conversationCache';
import {
  getIncomingEventTargetPath,
  getNotificationTargetPath,
} from '@/lib/notificationRoutes';
import { getAppStore, getAuthToken } from '@/lib/storeAccess';
import { showToastOnce } from '@/lib/toast';
import type { AppDispatch, RootState } from '@/store';

const BOOKING_KEYS = new Set([
  'buyer_seller_custom_favor_request',
  'buyer_new_custom_request',
  'buyer_accepted',
  'buyer_rejected',
  'buyer_canceled_seller',
  'buyer_in-progress',
  'buyer_in_progress',
  'buyer_completed',
  'buyer_booking_reported',
  'buyer_dispute_resolved',
]);

const BOOKING_EVENT_KEYS = new Set([
  'accepted',
  'rejected',
  'canceled',
  'cancelled',
  'in-progress',
  'in_progress',
  'inprogress',
  'completed',
  'reported',
]);

const shownNotificationIds = new Set<string>();
const SHOWN_ID_CAP = 80;

type QueryCacheEntry = {
  endpointName?: string;
  data?: unknown;
};

function normalizeKey(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase().replace(/_/g, '-') : '';
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toPositiveId(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.trunc(n);
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export function actorDisplayName(actor: BuyerNotificationActor | undefined): string {
  if (!actor) return '';
  return pickString(
    actor.fullName,
    actor.name,
    [actor.firstName, actor.lastName].filter(Boolean).join(' '),
  );
}

export function isBuyerBookingPush(data: Record<string, string | undefined> | Record<string, unknown>): boolean {
  const key = pickString(data.key);
  const eventKey = pickString(data.eventKey, data.event_key);
  const normalized = normalizeKey(key);
  const normalizedEvent = normalizeKey(eventKey);

  if (normalized.includes('chat') || normalized.includes('message') || normalized.includes('dispute-support')) {
    return false;
  }

  if (BOOKING_KEYS.has(key) || BOOKING_KEYS.has(normalized) || BOOKING_KEYS.has(key.replace(/-/g, '_'))) {
    return true;
  }
  if (BOOKING_EVENT_KEYS.has(eventKey) || BOOKING_EVENT_KEYS.has(normalizedEvent)) {
    return true;
  }

  return Boolean(toPositiveId(data.bookingId ?? data.booking_id));
}

function sellerNameFromData(data: Record<string, unknown>): string {
  return pickString(
    data.sellerName,
    data.sellerFullName,
    data.seller_name,
    data.actorName,
    data.actor_name,
    data.createdByName,
    asRecord(data.seller)?.fullName,
    asRecord(data.actor)?.fullName,
  );
}

function sellerNameFromBooking(booking: { seller?: { fullName?: string } | null } | null | undefined): string {
  return pickString(booking?.seller?.fullName);
}

function findSellerNameInBookingsCache(state: RootState, bookingId: number): string {
  const queries = (state.buyerBookingsAPI?.queries ?? {}) as Record<string, QueryCacheEntry>;

  for (const entry of Object.values(queries)) {
    if (entry?.endpointName === 'getBuyerBookingById') {
      const booking = (entry.data as GetBuyerBookingByIdResponse | undefined)?.data?.booking;
      if (booking?.id === bookingId) {
        const name = sellerNameFromBooking(booking);
        if (name) return name;
      }
    }

    if (entry?.endpointName === 'getBuyerBookings') {
      const bookings = (entry.data as GetBuyerBookingsResponse | undefined)?.data?.bookings ?? [];
      const match = bookings.find((item) => item.id === bookingId);
      const name = sellerNameFromBooking(match);
      if (name) return name;
    }
  }

  return '';
}

function findSellerNameInNotificationsCache(
  state: RootState,
  args: { bookingId: number | null; notificationId: number | null },
): string {
  const queries = (state.buyerNotificationsAPI?.queries ?? {}) as Record<string, QueryCacheEntry>;

  for (const entry of Object.values(queries)) {
    if (entry?.endpointName !== 'getBuyerNotifications') continue;
    const notifications =
      (entry.data as GetBuyerNotificationsResponse | undefined)?.data?.notifications ?? [];

    for (const item of notifications) {
      if (args.notificationId && item.id === args.notificationId) {
        const name = actorDisplayName(item.actor);
        if (name) return name;
      }

      const payload = asRecord(item.payload);
      const payloadBookingId = toPositiveId(
        payload?.bookingId ?? payload?.booking_id ?? asRecord(payload?.booking)?.id,
      );
      if (args.bookingId && payloadBookingId === args.bookingId) {
        const name = actorDisplayName(item.actor);
        if (name) return name;
      }
    }
  }

  return '';
}

async function resolveSellerName(
  dispatch: AppDispatch,
  data: Record<string, unknown>,
  bookingId: number | null,
  notificationId: number | null,
): Promise<string> {
  const fromPayload = sellerNameFromData(data);
  if (fromPayload) return fromPayload;

  const state = getAppStore()?.getState();
  if (state) {
    const fromInbox = findSellerNameInNotificationsCache(state, { bookingId, notificationId });
    if (fromInbox) return fromInbox;
    if (bookingId) {
      const fromBookings = findSellerNameInBookingsCache(state, bookingId);
      if (fromBookings) return fromBookings;
    }
  }

  if (!bookingId) return '';

  try {
    const result = await dispatch(
      buyerBookingsAPI.endpoints.getBuyerBookingById.initiate(bookingId, {
        forceRefetch: false,
        subscribe: false,
      }),
    ).unwrap();
    return sellerNameFromBooking(result?.data?.booking);
  } catch {
    return '';
  }
}

function enrichBookingBody(data: Record<string, unknown>, fallbackBody: string, sellerName: string): string {
  const key = normalizeKey(data.key);
  const eventKey = normalizeKey(data.eventKey ?? data.event_key);
  const event = `${key} ${eventKey}`;
  const seller = sellerName || 'The seller';

  if (/in-?progress/.test(event)) {
    return `${seller} has started working on your booking.`;
  }
  if (event.includes('accepted')) {
    return `${seller} accepted your booking.`;
  }
  if (event.includes('completed')) {
    return `${seller} marked your booking as complete.`;
  }
  if (event.includes('rejected')) {
    return `${seller} declined your booking.`;
  }
  if (event.includes('canceled') || event.includes('cancelled')) {
    return `${seller} canceled your booking.`;
  }
  if (event.includes('custom-favor') || event.includes('custom_favor')) {
    return `${seller} sent an offer on your custom favor.`;
  }

  const body = fallbackBody.trim();
  if (sellerName && body) {
    if (body.toLowerCase().includes(sellerName.toLowerCase())) return body;
    return body
      .replace(/\bthe seller\b/gi, sellerName)
      .replace(/\ba seller\b/gi, sellerName)
      .replace(/\bseller\b/gi, sellerName);
  }

  return body;
}

function markNotificationShown(id: string): boolean {
  if (shownNotificationIds.has(id)) return false;
  shownNotificationIds.add(id);
  if (shownNotificationIds.size > SHOWN_ID_CAP) {
    const oldest = shownNotificationIds.values().next().value;
    if (oldest) shownNotificationIds.delete(oldest);
  }
  return true;
}

function showPushToast(title: string, body: string, toastKey: string, href?: string): void {
  const heading = title.trim() || 'WhoCan';
  const message = body.trim();
  console.warn('[WHCAN_NOTIFY] showing toast', { heading, message, key: toastKey, href });

  if (message && message !== heading) {
    showToastOnce(toastKey, message, 'info', 4000, heading, href);
    return;
  }

  showToastOnce(toastKey, heading, 'info', 4000, undefined, href);
}

export async function handleIncomingBuyerPush(
  dispatch: AppDispatch,
  message: PushMessage,
): Promise<void> {
  const data = (message.data ?? {}) as Record<string, unknown>;
  const bookingId = toPositiveId(data.bookingId ?? data.booking_id);
  const notificationId = toPositiveId(data.notificationId ?? data.notification_id);
  const bookingEvent = isBuyerBookingPush(data);

  if (getAuthToken()) {
    refreshBuyerInbox(dispatch, {
      bookings: bookingEvent,
      bookingId: bookingId ?? undefined,
    });
  }

  const toastId = notificationId ? `notif:${notificationId}` : `push:${message.title}:${message.body}`;
  if (notificationId && !markNotificationShown(toastId)) return;

  const sellerName = bookingEvent
    ? await resolveSellerName(dispatch, data, bookingId, notificationId)
    : '';
  const title = pickString(data.title, message.title, 'WhoCan');
  const rawBody = pickString(data.description, data.body, message.body);
  const body = bookingEvent ? enrichBookingBody(data, rawBody, sellerName) : rawBody;
  const href = getIncomingEventTargetPath({
    ...data,
    title,
    description: body,
  });

  showPushToast(title, body, toastId, href ?? undefined);
}

export async function handleIncomingBuyerInboxItem(
  dispatch: AppDispatch,
  notification: BuyerNotification,
): Promise<void> {
  const payload = asRecord(notification.payload) ?? {};
  const data: Record<string, unknown> = {
    ...payload,
    key: notification.key || pickString(payload.key),
    eventKey: pickString(payload.eventKey, payload.event_key),
    bookingId: payload.bookingId ?? payload.booking_id,
    title: notification.title,
    description: notification.message || notification.description,
  };
  const bookingId = toPositiveId(data.bookingId);
  const bookingEvent = isBuyerBookingPush(data);

  if (bookingEvent) {
    refreshBuyerBookings(dispatch, bookingId ?? undefined);
  }

  const toastId = `notif:${notification.id}`;
  if (!markNotificationShown(toastId)) return;

  const sellerName = bookingEvent
    ? actorDisplayName(notification.actor) ||
      (await resolveSellerName(dispatch, data, bookingId, notification.id))
    : actorDisplayName(notification.actor);
  const title = pickString(notification.title, 'WhoCan');
  const rawBody = pickString(notification.message, notification.description);
  const body = bookingEvent ? enrichBookingBody(data, rawBody, sellerName) : rawBody;
  const href = getNotificationTargetPath(notification);

  showPushToast(title, body, toastId, href ?? undefined);
}
