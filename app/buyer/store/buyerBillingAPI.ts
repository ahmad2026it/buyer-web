import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  GetBuyerBillingHistoryParams,
  GetBuyerBillingHistoryResponse,
} from "./buyerBillingTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const buyerBillingAPI = createApi({
  reducerPath: "buyerBillingAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerBillingHistory"],
  endpoints: (builder) => ({
    getBuyerBillingHistory: builder.query<
      GetBuyerBillingHistoryResponse,
      GetBuyerBillingHistoryParams | void
    >({
      query: (params) => ({
        url: "/api/buyer/billing/history",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.dateFrom ? { dateFrom: params.dateFrom } : {}),
          ...(params?.dateTo ? { dateTo: params.dateTo } : {}),
        },
        skipErrorToast: true,
      }),
      providesTags: ["BuyerBillingHistory"],
    }),
  }),
});

export const { useGetBuyerBillingHistoryQuery } = buyerBillingAPI;
