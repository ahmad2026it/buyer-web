import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  BuyerSeller,
  GetBuyerSellerByIdResponse,
  GetBuyerSellersParams,
  GetBuyerSellersResponse,
} from "./buyerSellersTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const BUYER_SELLERS_LIST_PARAMS = {
  page: 1,
  limit: 16,
} as const;

const asSellers = (value: unknown): BuyerSeller[] =>
  Array.isArray(value) ? (value as BuyerSeller[]) : [];

const compactSellerParams = (params?: GetBuyerSellersParams | void) => {
  if (!params) return undefined;
  const out: Record<string, string | number> = {};
  if (params.page != null) out.page = params.page;
  if (params.limit != null) out.limit = params.limit;
  const search = params.search?.trim();
  if (search) out.search = search;
  return Object.keys(out).length ? out : undefined;
};

export const buyerSellersAPI = createApi({
  reducerPath: "buyerSellersAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerSellers"],
  endpoints: (builder) => ({
    getBuyerSellers: builder.query<
      GetBuyerSellersResponse,
      GetBuyerSellersParams | void
    >({
      query: (params) => ({
        url: "/api/buyer/sellers",
        method: "GET",
        params: compactSellerParams(params),
        skipErrorToast: true,
      }),
      transformResponse: (response: GetBuyerSellersResponse | BuyerSeller[]) => {
        if (Array.isArray(response)) {
          return {
            success: true,
            status: 200,
            message: "",
            data: { sellers: response },
          };
        }

        const nested = response?.data;
        const sellers = asSellers(
          nested && typeof nested === "object" && "sellers" in nested
            ? nested.sellers
            : nested,
        );

        return {
          success: response?.success ?? true,
          status: response?.status ?? 200,
          message: response?.message ?? "",
          data: {
            sellers,
            pagination:
              nested && typeof nested === "object" ? nested.pagination : undefined,
          },
        };
      },
      serializeQueryArgs: ({ queryArgs }) => {
        if (!queryArgs) return "default";
        const { page: _page, ...rest } = queryArgs;
        return JSON.stringify(rest);
      },
      merge: (currentCache, incoming, { arg }) => {
        const page = arg && typeof arg === "object" ? arg.page ?? 1 : 1;
        if (!currentCache || page <= 1) return incoming;

        const existingIds = new Set(
          currentCache.data.sellers.map((item) => item.sellerId ?? item.id),
        );

        return {
          ...incoming,
          data: {
            ...incoming.data,
            sellers: [
              ...currentCache.data.sellers,
              ...incoming.data.sellers.filter(
                (item) => !existingIds.has(item.sellerId ?? item.id),
              ),
            ],
          },
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        const currPage =
          currentArg && typeof currentArg === "object" ? currentArg.page : 1;
        const prevPage =
          previousArg && typeof previousArg === "object" ? previousArg.page : 1;
        return currPage !== prevPage;
      },
      providesTags: ["BuyerSellers"],
    }),
    getBuyerSellerById: builder.query<GetBuyerSellerByIdResponse, number>({
      query: (id) => ({
        url: `/api/buyer/sellers/${id}`,
        method: "GET",
        skipErrorToast: true,
      }),
      providesTags: (_result, _error, id) => [{ type: "BuyerSellers", id }],
    }),
  }),
});

export const { useGetBuyerSellersQuery, useGetBuyerSellerByIdQuery } =
  buyerSellersAPI;
