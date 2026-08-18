import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  GetBuyerNotificationsParams,
  GetBuyerNotificationsResponse,
  MarkAllBuyerNotificationsReadResponse,
  MarkBuyerNotificationReadResponse,
} from "./buyerNotificationsTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

const PAGE_SIZE = 20;

const markNotificationsRead = (
  draft: GetBuyerNotificationsResponse,
  id?: number,
) => {
  const now = new Date().toISOString();
  let unreadDelta = 0;

  draft.data.notifications.forEach((item) => {
    if (item.isRead) return;
    if (id !== undefined && item.id !== id) return;
    item.isRead = true;
    item.readAt = now;
    unreadDelta += 1;
  });

  draft.data.unreadCount = id === undefined
    ? 0
    : Math.max(0, draft.data.unreadCount - unreadDelta);
};

export const buyerNotificationsAPI = createApi({
  reducerPath: "buyerNotificationsAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerNotifications"],
  endpoints: (builder) => ({
    getBuyerNotifications: builder.query<
      GetBuyerNotificationsResponse,
      GetBuyerNotificationsParams | void
    >({
      query: (params) => ({
        url: "/api/buyer/notifications",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? PAGE_SIZE,
        },
      }),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, incoming, { arg }) => {
        const page = arg?.page ?? 1;
        if (!currentCache || page <= 1) return incoming;

        const existingIds = new Set(
          currentCache.data.notifications.map((item) => item.id),
        );

        return {
          ...incoming,
          data: {
            ...incoming.data,
            notifications: [
              ...currentCache.data.notifications,
              ...incoming.data.notifications.filter(
                (item) => !existingIds.has(item.id),
              ),
            ],
          },
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: ["BuyerNotifications"],
    }),
    markBuyerNotificationRead: builder.mutation<
      MarkBuyerNotificationReadResponse,
      number
    >({
      query: (id) => ({
        url: `/api/buyer/notifications/${id}/read`,
        method: "PATCH",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          buyerNotificationsAPI.util.updateQueryData(
            "getBuyerNotifications",
            undefined,
            (draft) => markNotificationsRead(draft, id),
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    markAllBuyerNotificationsRead: builder.mutation<
      MarkAllBuyerNotificationsReadResponse,
      void
    >({
      query: () => ({
        url: "/api/buyer/notifications/read-all",
        method: "PATCH",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          buyerNotificationsAPI.util.updateQueryData(
            "getBuyerNotifications",
            undefined,
            (draft) => markNotificationsRead(draft),
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
  useGetBuyerNotificationsQuery,
  useMarkBuyerNotificationReadMutation,
  useMarkAllBuyerNotificationsReadMutation,
} = buyerNotificationsAPI;
