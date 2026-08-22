import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  GetBuyerFavorByIdResponse,
  GetBuyerFavoritesParams,
  GetBuyerFavoritesResponse,
  GetBuyerFavorsParams,
  GetBuyerFavorsResponse,
  MarkBuyerFavoriteResponse,
} from "./buyerFavorsTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const BUYER_FAVORITES_LIST_PARAMS: Required<GetBuyerFavoritesParams> = {
  page: 1,
  limit: 20,
};

const compactParams = (params: GetBuyerFavorsParams) => {
  const out: Record<string, string | number | boolean> = {};

  (Object.entries(params) as [keyof GetBuyerFavorsParams, unknown][]).forEach(
    ([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (value === false) return;
      out[key] = value as string | number | boolean;
    },
  );

  return out;
};

export const buyerFavorsAPI = createApi({
  reducerPath: "buyerFavorsAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerFavors", "BuyerFavorites"],
  endpoints: (builder) => ({
    getBuyerFavors: builder.query<GetBuyerFavorsResponse, GetBuyerFavorsParams>({
      query: (params) => ({
        url: "/api/buyer/favors",
        method: "GET",
        params: compactParams(params),
        skipErrorToast: true,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        const { page: _page, ...rest } = queryArgs;
        return JSON.stringify(rest);
      },
      merge: (currentCache, incoming, { arg }) => {
        const page = arg.page ?? 1;
        if (!currentCache || page <= 1) return incoming;

        const existingIds = new Set(
          currentCache.data.favors.map((item) => item.id),
        );

        return {
          ...incoming,
          data: {
            ...incoming.data,
            favors: [
              ...currentCache.data.favors,
              ...incoming.data.favors.filter((item) => !existingIds.has(item.id)),
            ],
          },
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: ["BuyerFavors"],
    }),
    getBuyerFavorById: builder.query<GetBuyerFavorByIdResponse, number>({
      query: (id) => ({
        url: `/api/buyer/favors/${id}`,
        method: "GET",
        skipErrorToast: true,
      }),
      providesTags: (_result, _error, id) => [{ type: "BuyerFavors", id }],
    }),
    getBuyerFavorites: builder.query<
      GetBuyerFavoritesResponse,
      GetBuyerFavoritesParams | void
    >({
      query: (params) => ({
        url: "/api/buyer/favorites",
        method: "GET",
        params: {
          page: params?.page ?? BUYER_FAVORITES_LIST_PARAMS.page,
          limit: params?.limit ?? BUYER_FAVORITES_LIST_PARAMS.limit,
        },
        skipErrorToast: true,
      }),
      transformResponse: (response: GetBuyerFavoritesResponse) => {
        const nested = response?.data;
        const favors = Array.isArray(nested?.favors) ? nested.favors : [];
        const pagination = nested?.pagination ?? {
          total: favors.length,
          page: BUYER_FAVORITES_LIST_PARAMS.page,
          limit: BUYER_FAVORITES_LIST_PARAMS.limit,
          totalPages: 1,
        };

        return {
          success: response?.success ?? true,
          status: response?.status ?? 200,
          message: response?.message ?? "",
          data: { favors, pagination },
        };
      },
      keepUnusedDataFor: 0,
      providesTags: (result) =>
        result?.data?.favors
          ? [
              ...result.data.favors.map((favor) => ({
                type: "BuyerFavorites" as const,
                id: favor.id,
              })),
              { type: "BuyerFavorites", id: "LIST" },
            ]
          : [{ type: "BuyerFavorites", id: "LIST" }],
    }),
    markBuyerFavorite: builder.mutation<MarkBuyerFavoriteResponse, number>({
      query: (favorId) => ({
        url: "/api/buyer/favorites",
        method: "POST",
        body: { favor_id: favorId },
      }),
      async onQueryStarted(favorId, { dispatch, queryFulfilled }) {
        const detailPatch = dispatch(
          buyerFavorsAPI.util.updateQueryData(
            "getBuyerFavorById",
            favorId,
            (draft) => {
              if (draft.data?.favor) draft.data.favor.isFavorite = true;
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          detailPatch.undo();
        }
      },
      invalidatesTags: (_result, _error, favorId) => [
        "BuyerFavors",
        { type: "BuyerFavors", id: favorId },
        { type: "BuyerFavorites", id: "LIST" },
      ],
    }),
    unmarkBuyerFavorite: builder.mutation<MarkBuyerFavoriteResponse, number>({
      query: (favorId) => ({
        url: "/api/buyer/favorites",
        method: "POST",
        body: { favor_id: favorId },
      }),
      async onQueryStarted(favorId, { dispatch, queryFulfilled }) {
        const detailPatch = dispatch(
          buyerFavorsAPI.util.updateQueryData(
            "getBuyerFavorById",
            favorId,
            (draft) => {
              if (draft.data?.favor) draft.data.favor.isFavorite = false;
            },
          ),
        );
        const listPatch = dispatch(
          buyerFavorsAPI.util.updateQueryData(
            "getBuyerFavorites",
            BUYER_FAVORITES_LIST_PARAMS,
            (draft) => {
              if (!draft.data?.favors) return;
              draft.data.favors = draft.data.favors.filter(
                (item) => item.id !== favorId,
              );
              if (draft.data.pagination) {
                draft.data.pagination.total = Math.max(
                  0,
                  draft.data.pagination.total - 1,
                );
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          detailPatch.undo();
          listPatch.undo();
        }
      },
      invalidatesTags: (_result, _error, favorId) => [
        "BuyerFavors",
        { type: "BuyerFavors", id: favorId },
        { type: "BuyerFavorites", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetBuyerFavorsQuery,
  useGetBuyerFavorByIdQuery,
  useGetBuyerFavoritesQuery,
  useMarkBuyerFavoriteMutation,
  useUnmarkBuyerFavoriteMutation,
} = buyerFavorsAPI;
