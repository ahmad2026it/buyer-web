import { createApi } from "@reduxjs/toolkit/query/react";
import type { AppDispatch } from "@/store";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { createClientMsgId, toNumericId } from "@/lib/conversationSocketTypes";
import type {
  GetBuyerDisputeSupportMessagesParams,
  GetBuyerDisputeSupportMessagesResponse,
  MarkBuyerDisputeSupportReadRequest,
  MarkBuyerDisputeSupportReadResponse,
  SendBuyerDisputeSupportMessageRequest,
  SendBuyerDisputeSupportMessageResponse,
  BuyerDisputeSupportMessage,
  BuyerDisputeSupportParticipant,
  DisputeSupportSenderType,
} from "./buyerDisputeSupportTypes";
import { BUYER_DISPUTE_SUPPORT_MESSAGES_LIMIT } from "./buyerDisputeSupportTypes";

export { BUYER_DISPUTE_SUPPORT_MESSAGES_LIMIT, createClientMsgId as newDisputeSupportClientMsgId };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function normalizeSenderType(value: unknown): DisputeSupportSenderType {
  const raw = pickString(value).toLowerCase().replace(/[\s-]+/g, "_");
  if (raw === "buyer" || raw === "user" || raw === "customer") return "buyer";
  if (raw === "admin") return "admin";
  if (raw === "support" || raw === "agent" || raw === "staff") return "support";
  if (raw === "system") return "system";
  return "unknown";
}

function normalizeAttachments(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string" && item.trim()) return item.trim();
      const record = asRecord(item);
      return pickString(record?.url, record?.src, record?.path);
    })
    .filter(Boolean);
}

function normalizeParticipant(raw: unknown): BuyerDisputeSupportParticipant | null {
  const record = asRecord(raw);
  if (!record) return null;
  const name = pickString(record.fullName, record.full_name, record.name, "Support");
  return {
    id: toNumericId(record.id),
    name,
    image: pickString(record.profileImage, record.profile_image, record.image) || null,
    senderType: normalizeSenderType(record.userType ?? record.user_type ?? record.role ?? record.type),
  };
}

export function normalizeDisputeSupportMessage(
  raw: unknown,
  disputeId: number,
): BuyerDisputeSupportMessage | null {
  const record = asRecord(raw);
  if (!record) return null;

  const nested = asRecord(record.message);
  const msg = nested ?? record;
  const sender = asRecord(msg.sender) ?? asRecord(msg.user) ?? asRecord(msg.author);

  const id = toNumericId(msg.id);
  if (id == null) return null;

  const createdAt = pickString(msg.createdAt, msg.created_at) || new Date().toISOString();
  const senderType = normalizeSenderType(
    msg.senderType ??
      msg.sender_type ??
      msg.role ??
      msg.from ??
      sender?.userType ??
      sender?.user_type ??
      sender?.role,
  );

  return {
    id,
    disputeId: toNumericId(msg.disputeId ?? msg.dispute_id ?? msg.reportId ?? msg.report_id) ?? disputeId,
    threadId: toNumericId(msg.threadId ?? msg.thread_id),
    senderUserId: toNumericId(
      msg.senderUserId ?? msg.sender_user_id ?? msg.userId ?? msg.user_id ?? sender?.id,
    ),
    senderType,
    senderName: pickString(
      sender?.fullName,
      sender?.full_name,
      sender?.name,
      senderType === "buyer" ? "You" : "Support",
    ),
    senderImage: pickString(sender?.profileImage, sender?.profile_image, sender?.image) || null,
    body: pickString(msg.body, msg.message, msg.content, msg.text),
    attachments: normalizeAttachments(msg.attachments ?? msg.files ?? msg.media),
    clientMsgId: pickString(msg.clientMsgId, msg.client_msg_id),
    createdAt,
    updatedAt: pickString(msg.updatedAt, msg.updated_at) || createdAt,
  };
}

function extractMessagesPayload(payload: unknown): Record<string, unknown> | null {
  const root = asRecord(payload);
  if (Array.isArray(root?.data)) return { messages: root.data };
  const data = asRecord(root?.data);
  if (data && (Array.isArray(data.messages) || asRecord(data.data) || Array.isArray(data.data))) {
    return Array.isArray(data.data) ? { ...data, messages: data.data } : data;
  }
  if (root && Array.isArray(root.messages)) return root;
  return data ?? root;
}

export function normalizeDisputeSupportMessagesResponse(
  payload: unknown,
  disputeId: number,
): GetBuyerDisputeSupportMessagesResponse {
  const root = asRecord(payload);
  const data = extractMessagesPayload(payload);
  const nestedData = asRecord(data?.data);
  const messagesRaw = asArray(data?.messages ?? data?.items ?? nestedData?.messages ?? nestedData?.items ?? data);

  const messages = messagesRaw
    .map((item) => normalizeDisputeSupportMessage(item, disputeId))
    .filter((item): item is BuyerDisputeSupportMessage => item != null)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const otherParticipant =
    normalizeParticipant(data?.otherParticipant ?? data?.other_participant) ??
    normalizeParticipant(data?.support) ??
    normalizeParticipant(data?.agent) ??
    null;

  return {
    success: root?.success !== false,
    status: typeof root?.status === "number" ? root.status : undefined,
    message: typeof root?.message === "string" ? root.message : undefined,
    data: {
      disputeId: toNumericId(data?.disputeId ?? data?.dispute_id ?? data?.reportId ?? data?.report_id) ?? disputeId,
      threadId: toNumericId(data?.threadId ?? data?.thread_id ?? asRecord(data?.thread)?.id),
      canSend: data?.canSend !== false && data?.can_send !== false,
      otherParticipant,
      messages,
      hasMore: Boolean(data?.hasMore ?? data?.has_more),
      nextCursor:
        typeof (data?.nextCursor ?? data?.next_cursor) === "string"
          ? String(data?.nextCursor ?? data?.next_cursor)
          : null,
    },
  };
}

function buildSendMessageFormData(body: string, clientMsgId: string): FormData {
  const formData = new FormData();
  formData.append("body", body);
  formData.append("client_msg_id", clientMsgId);
  return formData;
}

export function isOwnDisputeSupportMessage(
  message: BuyerDisputeSupportMessage,
  myUserId: number | null | undefined,
): boolean {
  if (message.senderType === "buyer") return true;
  if (
    message.senderType === "admin" ||
    message.senderType === "support" ||
    message.senderType === "system"
  ) {
    return false;
  }
  return myUserId != null && message.senderUserId === myUserId;
}

function emptyMessagesResponse(disputeId: number): GetBuyerDisputeSupportMessagesResponse {
  return {
    success: true,
    data: {
      disputeId,
      threadId: null,
      canSend: true,
      otherParticipant: null,
      messages: [],
      hasMore: false,
      nextCursor: null,
    },
  };
}

export const buyerDisputeSupportAPI = createApi({
  reducerPath: "buyerDisputeSupportAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerDisputeSupportMessages"],
  endpoints: (builder) => ({
    getBuyerDisputeSupportMessages: builder.query<
      GetBuyerDisputeSupportMessagesResponse,
      GetBuyerDisputeSupportMessagesParams
    >({
      async queryFn(arg, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: `/api/buyer/dispute-support/${arg.disputeId}/messages`,
          method: "GET",
          params: {
            limit: arg.limit ?? BUYER_DISPUTE_SUPPORT_MESSAGES_LIMIT,
            ...(arg.cursor ? { cursor: arg.cursor } : {}),
          },
          skipErrorToast: true,
        });

        if (result.error) {
          const status = (result.error as { status?: number }).status;
          if (status === 404) {
            return { data: emptyMessagesResponse(arg.disputeId) };
          }
          return { error: result.error };
        }

        return {
          data: normalizeDisputeSupportMessagesResponse(result.data, arg.disputeId),
        };
      },
      providesTags: (_result, _error, arg) => [
        { type: "BuyerDisputeSupportMessages", id: arg.disputeId },
        { type: "BuyerDisputeSupportMessages", id: "LIST" },
      ],
    }),
    sendBuyerDisputeSupportMessage: builder.mutation<
      SendBuyerDisputeSupportMessageResponse,
      SendBuyerDisputeSupportMessageRequest
    >({
      query: ({ disputeId, body, clientMsgId }) => ({
        url: `/api/buyer/dispute-support/${disputeId}/messages`,
        method: "POST",
        body: buildSendMessageFormData(body, clientMsgId),
      }),
      transformResponse: (response: unknown, _meta, arg) => {
        const root = asRecord(response);
        const data = asRecord(root?.data);
        const message =
          normalizeDisputeSupportMessage(data?.message ?? data, arg.disputeId) ??
          normalizeDisputeSupportMessage(root, arg.disputeId);

        return {
          success: root?.success !== false,
          status: typeof root?.status === "number" ? root.status : undefined,
          message: typeof root?.message === "string" ? root.message : undefined,
          data: message ? { message } : undefined,
        };
      },
      async onQueryStarted({ disputeId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const message = data.data?.message;
          if (message) {
            upsertBuyerDisputeSupportMessage(dispatch, message);
          }
        } catch {
          // axios interceptor already toasts API errors
        }
      },
    }),
    markBuyerDisputeSupportRead: builder.mutation<
      MarkBuyerDisputeSupportReadResponse,
      MarkBuyerDisputeSupportReadRequest
    >({
      query: ({ disputeId }) => ({
        url: `/api/buyer/dispute-support/${disputeId}/read`,
        method: "POST",
        skipErrorToast: true,
      }),
    }),
  }),
});

export function upsertBuyerDisputeSupportMessage(
  dispatch: AppDispatch,
  message: BuyerDisputeSupportMessage,
): void {
  dispatch(
    buyerDisputeSupportAPI.util.updateQueryData(
      "getBuyerDisputeSupportMessages",
      { disputeId: message.disputeId, limit: BUYER_DISPUTE_SUPPORT_MESSAGES_LIMIT },
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
            pending: message.pending ?? false,
          };
          return;
        }

        draft.data.messages.push(message);
      },
    ),
  );
}

export function removeOptimisticDisputeSupportMessage(
  dispatch: AppDispatch,
  disputeId: number,
  clientMsgId: string,
): void {
  dispatch(
    buyerDisputeSupportAPI.util.updateQueryData(
      "getBuyerDisputeSupportMessages",
      { disputeId, limit: BUYER_DISPUTE_SUPPORT_MESSAGES_LIMIT },
      (draft) => {
        if (!draft.data?.messages) return;
        draft.data.messages = draft.data.messages.filter(
          (item) => item.clientMsgId !== clientMsgId,
        );
      },
    ),
  );
}

export function refreshBuyerDisputeSupport(dispatch: AppDispatch, disputeId?: number): void {
  dispatch(
    buyerDisputeSupportAPI.util.invalidateTags(
      disputeId
        ? [{ type: "BuyerDisputeSupportMessages", id: disputeId }]
        : [{ type: "BuyerDisputeSupportMessages", id: "LIST" }],
    ),
  );
}

export const {
  useGetBuyerDisputeSupportMessagesQuery,
  useSendBuyerDisputeSupportMessageMutation,
  useMarkBuyerDisputeSupportReadMutation,
} = buyerDisputeSupportAPI;
