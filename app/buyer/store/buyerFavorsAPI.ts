import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  GetBuyerFavorByIdResponse,
  GetBuyerFavorsParams,
  GetBuyerFavorsResponse,
} from "./buyerFavorsTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

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
  tagTypes: ["BuyerFavors"],
  endpoints: (builder) => ({
    getBuyerFavors: builder.query<GetBuyerFavorsResponse, GetBuyerFavorsParams>({
      query: (params) => ({
        url: "/api/buyer/favors",
        method: "GET",
        params: compactParams({
          ...params,
          page: params.page ?? 1,
          limit: params.limit ?? 15,
        }),
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
  }),
});

export const { useGetBuyerFavorsQuery, useGetBuyerFavorByIdQuery } = buyerFavorsAPI;
