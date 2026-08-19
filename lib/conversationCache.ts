import {
  BUYER_CONVERSATION_MESSAGES_LIMIT,
  BUYER_CONVERSATIONS_LIST_PARAMS,
  buyerConversationsAPI,
} from '@/app/buyer/store/buyerConversationsAPI';
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
        if (!draft.data?.messages) return;

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
