import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  GetBuyerBillingHistoryParams,
  GetBuyerBillingHistoryResponse,
  GetBuyerChargePreviewParams,
  GetBuyerChargePreviewResponse,
} from "./buyerBillingTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const buyerBillingAPI = createApi({
  reducerPath: "buyerBillingAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerBillingHistory", "BuyerChargePreview"],
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
    getBuyerChargePreview: builder.query<
      GetBuyerChargePreviewResponse,
      GetBuyerChargePreviewParams
    >({
      query: ({ favorId, selectedAddOnIndices }) => ({
        url: `/api/buyer/billing/charge-preview/${favorId}`,
        method: "GET",
        params:
          selectedAddOnIndices && selectedAddOnIndices.length > 0
            ? { selectedAddOnIndices: JSON.stringify(selectedAddOnIndices) }
            : undefined,
        skipErrorToast: true,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "BuyerChargePreview", id: arg.favorId },
      ],
    }),
  }),
});

export const {
  useGetBuyerBillingHistoryQuery,
  useGetBuyerChargePreviewQuery,
} = buyerBillingAPI;
