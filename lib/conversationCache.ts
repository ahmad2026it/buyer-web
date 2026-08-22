import {
  BUYER_CONVERSATION_MESSAGES_LIMIT,
  BUYER_CONVERSATIONS_LIST_PARAMS,
  buyerConversationsAPI,
} from '@/app/buyer/store/buyerConversationsAPI';
import { buyerBookingsAPI } from '@/app/buyer/store/buyerBookingsAPI';
import {
  BUYER_NOTIFICATIONS_PAGE_SIZE,
  buyerNotificationsAPI,
} from '@/app/buyer/store/buyerNotificationsAPI';
import type { BuyerConversationMessage } from '@/app/buyer/store/buyerConversationsTypes';
import type { AppDispatch } from '@/store';

export function upsertBuyerConversationMessage(
  dispatch: AppDispatch,
  message: BuyerConversationMessage,
): void {
  dispatch(
    buyerConversationsAPI.util.updateQueryData(
      'getBuyerConversationMessages',
      { conversationId: message.conversationId, limit: BUYER_CONVERSATION_MESSAGES_LIMIT },
      (draft) => {
        if (!draft.data) return;
        if (!Array.isArray(draft.data.messages)) {
          draft.data.messages = [];
        }

        const byClient = message.clientMsgId
          ? draft.data.messages.findIndex((item) => item.clientMsgId === message.clientMsgId)
          : -1;
        const byId =
          message.id > 0
            ? draft.data.messages.findIndex((item) => item.id === message.id)
            : -1;
        const index = byClient >= 0 ? byClient : byId;

        if (index >= 0) {
          draft.data.messages[index] = {
            ...draft.data.messages[index],
            ...message,
          };
          return;
        }

        draft.data.messages.push(message);
      },
    ),
  );
}

export function removeOptimisticBuyerMessage(
  dispatch: AppDispatch,
  conversationId: number,
  clientMsgId: string,
): void {
  dispatch(
    buyerConversationsAPI.util.updateQueryData(
      'getBuyerConversationMessages',
      { conversationId, limit: BUYER_CONVERSATION_MESSAGES_LIMIT },
      (draft) => {
        if (!draft.data?.messages) return;
        draft.data.messages = draft.data.messages.filter(
          (item) => item.clientMsgId !== clientMsgId,
        );
      },
    ),
  );
}

export function touchBuyerConversationPreview(
  dispatch: AppDispatch,
  args: {
    conversationId: number;
    preview: string;
    at: string;
    senderUserId: number;
    incrementUnread?: boolean;
    lastReadMessageId?: number;
  },
): void {
  dispatch(
    buyerConversationsAPI.util.updateQueryData(
      'getBuyerConversations',
      BUYER_CONVERSATIONS_LIST_PARAMS,
      (draft) => {
        const conv = draft.data?.conversations?.find((item) => item.id === args.conversationId);
        if (!conv) return;

        conv.lastMessage = {
          at: args.at,
          preview: args.preview,
          senderUserId: args.senderUserId,
        };
        conv.updatedAt = args.at;

        if (typeof args.lastReadMessageId === 'number') {
          conv.myLastReadMessageId = args.lastReadMessageId;
          conv.unreadCount = 0;
        } else if (args.incrementUnread) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
      },
    ),
  );
}

export function applyIncomingBuyerMessage(
  dispatch: AppDispatch,
  message: BuyerConversationMessage,
  incrementUnread: boolean,
): boolean {
  upsertBuyerConversationMessage(dispatch, message);

  let found = false;
  dispatch(
    buyerConversationsAPI.util.updateQueryData(
      'getBuyerConversations',
      BUYER_CONVERSATIONS_LIST_PARAMS,
      (draft) => {
        const conv = draft.data?.conversations?.find((item) => item.id === message.conversationId);
        if (!conv) return;

        found = true;
        conv.lastMessage = {
          at: message.createdAt,
          preview: message.body,
          senderUserId: message.senderUserId,
        };
        conv.updatedAt = message.createdAt;

        if (incrementUnread) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
      },
    ),
  );

  if (!found) {
    dispatch(
      buyerConversationsAPI.util.invalidateTags([{ type: 'BuyerConversations', id: 'LIST' }]),
    );
  }

  return found;
}

export function refreshBuyerNotifications(dispatch: AppDispatch): void {
  void dispatch(
    buyerNotificationsAPI.endpoints.getBuyerNotifications.initiate(
      { page: 1, limit: BUYER_NOTIFICATIONS_PAGE_SIZE },
      { forceRefetch: true, subscribe: false },
    ),
  );
}

export function refreshBuyerBookings(dispatch: AppDispatch, bookingId?: number): void {
  const tags: Array<'BuyerBookings' | { type: 'BuyerBookings'; id: number }> = ['BuyerBookings'];
  if (bookingId && Number.isFinite(bookingId) && bookingId > 0) {
    tags.push({ type: 'BuyerBookings', id: bookingId });
  }
  dispatch(buyerBookingsAPI.util.invalidateTags(tags));
}

export function refreshBuyerInbox(
  dispatch: AppDispatch,
  options?: { bookings?: boolean; bookingId?: number },
): void {
  refreshBuyerNotifications(dispatch);
  dispatch(
    buyerConversationsAPI.util.invalidateTags([{ type: 'BuyerConversations', id: 'LIST' }]),
  );
  if (options?.bookings) {
    refreshBuyerBookings(dispatch, options.bookingId);
  }
}
