import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  GetBuyerConversationMessagesParams,
  GetBuyerConversationMessagesResponse,
  GetBuyerConversationsParams,
  GetBuyerConversationsResponse,
  MarkBuyerConversationReadRequest,
  MarkBuyerConversationReadResponse,
  SendBuyerConversationMessageRequest,
  SendBuyerConversationMessageResponse,
  StartBuyerConversationByBookingResponse,
} from "./buyerConversationsTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const BUYER_CONVERSATIONS_LIST_PARAMS: GetBuyerConversationsParams = {
  page: 1,
  limit: 50,
};

export const BUYER_CONVERSATION_MESSAGES_LIMIT = 50;

export const newClientMsgId = (): string =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const buyerConversationsAPI = createApi({
  reducerPath: "buyerConversationsAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerConversations", "BuyerConversationMessages"],
  endpoints: (builder) => ({
    getBuyerConversations: builder.query<
      GetBuyerConversationsResponse,
      GetBuyerConversationsParams | void
    >({
      query: (params) => ({
        url: "/api/buyer/conversations",
        method: "GET",
        params: {
          page: params?.page ?? BUYER_CONVERSATIONS_LIST_PARAMS.page,
          limit: params?.limit ?? BUYER_CONVERSATIONS_LIST_PARAMS.limit,
        },
        skipErrorToast: true,
      }),
      providesTags: (result) =>
        result?.data?.conversations
          ? [
              ...result.data.conversations.map((conversation) => ({
                type: "BuyerConversations" as const,
                id: conversation.id,
              })),
              { type: "BuyerConversations", id: "LIST" },
            ]
          : [{ type: "BuyerConversations", id: "LIST" }],
    }),
    getBuyerConversationMessages: builder.query<
      GetBuyerConversationMessagesResponse,
      GetBuyerConversationMessagesParams
    >({
      query: ({ conversationId, limit, cursor }) => ({
        url: `/api/buyer/conversations/${conversationId}/messages`,
        method: "GET",
        params: {
          limit: limit ?? BUYER_CONVERSATION_MESSAGES_LIMIT,
          ...(cursor ? { cursor } : {}),
        },
        skipErrorToast: true,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "BuyerConversationMessages", id: arg.conversationId },
      ],
    }),
    startBuyerConversationByBooking: builder.mutation<
      StartBuyerConversationByBookingResponse,
      number
    >({
      query: (bookingId) => ({
        url: `/api/buyer/conversations/by-booking/${bookingId}`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "BuyerConversations", id: "LIST" }],
    }),
    sendBuyerConversationMessage: builder.mutation<
      SendBuyerConversationMessageResponse,
      SendBuyerConversationMessageRequest
    >({
      query: ({ conversationId, body, clientMsgId }) => ({
        url: `/api/buyer/conversations/${conversationId}/messages`,
        method: "POST",
        body: { body, clientMsgId },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "BuyerConversations", id: "LIST" },
        { type: "BuyerConversations", id: arg.conversationId },
      ],
    }),
    markBuyerConversationRead: builder.mutation<
      MarkBuyerConversationReadResponse,
      MarkBuyerConversationReadRequest
    >({
      query: ({ conversationId, messageId }) => ({
        url: `/api/buyer/conversations/${conversationId}/read`,
        method: "POST",
        body: { messageId },
        skipErrorToast: true,
      }),
      async onQueryStarted(
        { conversationId, messageId },
        { dispatch, queryFulfilled },
      ) {
        const patch = dispatch(
          buyerConversationsAPI.util.updateQueryData(
            "getBuyerConversations",
            BUYER_CONVERSATIONS_LIST_PARAMS,
            (draft) => {
              const conv = draft.data?.conversations?.find(
                (item) => item.id === conversationId,
              );
              if (!conv) return;
              conv.unreadCount = 0;
              conv.myLastReadMessageId = messageId;
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetBuyerConversationsQuery,
  useGetBuyerConversationMessagesQuery,
  useStartBuyerConversationByBookingMutation,
  useSendBuyerConversationMessageMutation,
  useMarkBuyerConversationReadMutation,
} = buyerConversationsAPI;
