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
  StartBuyerConversationRequest,
  StartBuyerConversationResponse,
} from "./buyerConversationsTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { normalizeConversationAttachments } from "@/lib/conversationSocketTypes";

export const BUYER_CONVERSATION_LIST_LIMIT = 20;

export const BUYER_BOOKING_CONVERSATIONS_LIST_PARAMS: GetBuyerConversationsParams = {
  page: 1,
  limit: BUYER_CONVERSATION_LIST_LIMIT,
  type: "booking",
};

export const BUYER_LISTING_CONVERSATIONS_LIST_PARAMS: GetBuyerConversationsParams = {
  page: 1,
  limit: BUYER_CONVERSATION_LIST_LIMIT,
  type: "listing",
};

export const BUYER_CONVERSATIONS_LIST_PARAMS = BUYER_BOOKING_CONVERSATIONS_LIST_PARAMS;

export const BUYER_CONVERSATION_LIST_CACHE_ARGS: GetBuyerConversationsParams[] = [
  BUYER_BOOKING_CONVERSATIONS_LIST_PARAMS,
  BUYER_LISTING_CONVERSATIONS_LIST_PARAMS,
];

export const BUYER_CONVERSATION_MESSAGES_LIMIT = 50;

export { createClientMsgId as newClientMsgId } from "@/lib/conversationSocketTypes";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

export function conversationIdFromResponse(response: unknown): number | null {
  const payload = asRecord(response);
  const nested = asRecord(payload?.data) ?? payload;
  if (!nested) return null;

  const conversation = asRecord(nested.conversation) ?? nested;
  const raw = conversation.id ?? conversation.conversationId ?? nested.conversationId;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? Math.trunc(id) : null;
}

export function conversationListingId(conversation: {
  listingId?: number | null;
  marketplaceListingId?: number | null;
  listing?: { id: number } | null;
  marketplaceListing?: { id: number } | null;
}): number | null {
  const raw =
    conversation.listingId ??
    conversation.marketplaceListingId ??
    conversation.listing?.id ??
    conversation.marketplaceListing?.id;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? Math.trunc(id) : null;
}

export function isListingConversation(conversation: {
  type?: string;
  listingId?: number | null;
  marketplaceListingId?: number | null;
  listing?: { id: number } | null;
  marketplaceListing?: { id: number } | null;
}): boolean {
  return (
    conversation.type === "listing" ||
    conversation.type === "marketplace" ||
    conversationListingId(conversation) != null
  );
}

export const buyerConversationsAPI = createApi({
  reducerPath: "buyerConversationsAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerConversations", "BuyerConversationMessages"],
  endpoints: (builder) => ({
    getBuyerConversations: builder.query<
      GetBuyerConversationsResponse,
      GetBuyerConversationsParams
    >({
      query: (params) => ({
        url: "/api/buyer/conversations",
        method: "GET",
        params: {
          page: params.page ?? BUYER_BOOKING_CONVERSATIONS_LIST_PARAMS.page,
          limit: params.limit ?? BUYER_BOOKING_CONVERSATIONS_LIST_PARAMS.limit,
          type: params.type,
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
      transformResponse: (response: GetBuyerConversationMessagesResponse) => {
        if (!Array.isArray(response?.data?.messages)) return response;
        return {
          ...response,
          data: {
            ...response.data,
            messages: response.data.messages.map((message) => ({
              ...message,
              attachments: normalizeConversationAttachments(message.attachments),
            })),
          },
        };
      },
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
    startBuyerConversation: builder.mutation<
      StartBuyerConversationResponse,
      StartBuyerConversationRequest
    >({
      query: ({ type, id, message }) => ({
        url: "/api/buyer/conversations",
        method: "POST",
        body: { type, id, message },
      }),
      invalidatesTags: [{ type: "BuyerConversations", id: "LIST" }],
    }),
    sendBuyerConversationMessage: builder.mutation<
      SendBuyerConversationMessageResponse,
      SendBuyerConversationMessageRequest
    >({
      query: ({ conversationId, body, clientMsgId, files }) => {
        const hasFiles = Boolean(files?.length);
        if (!hasFiles) {
          return {
            url: `/api/buyer/conversations/${conversationId}/messages`,
            method: "POST",
            body: { body, clientMsgId },
          };
        }

        const formData = new FormData();
        formData.append("body", body);
        formData.append("clientMsgId", clientMsgId);
        formData.append("client_msg_id", clientMsgId);
        files?.forEach((file) => {
          formData.append("attachments", file);
        });
        return {
          url: `/api/buyer/conversations/${conversationId}/messages`,
          method: "POST",
          body: formData,
        };
      },
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
        const patches = BUYER_CONVERSATION_LIST_CACHE_ARGS.map((listParams) =>
          dispatch(
            buyerConversationsAPI.util.updateQueryData(
              "getBuyerConversations",
              listParams,
              (draft) => {
                const conv = draft.data?.conversations?.find(
                  (item) => item.id === conversationId,
                );
                if (!conv) return;
                conv.unreadCount = 0;
                conv.myLastReadMessageId = messageId;
              },
            ),
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),
  }),
});

export const {
  useGetBuyerConversationsQuery,
  useGetBuyerConversationMessagesQuery,
  useStartBuyerConversationByBookingMutation,
  useStartBuyerConversationMutation,
  useSendBuyerConversationMessageMutation,
  useMarkBuyerConversationReadMutation,
} = buyerConversationsAPI;
