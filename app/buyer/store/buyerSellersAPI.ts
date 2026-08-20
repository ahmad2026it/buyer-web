import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  BuyerSeller,
  GetBuyerSellerByIdResponse,
  GetBuyerSellersResponse,
} from "./buyerSellersTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

const asSellers = (value: unknown): BuyerSeller[] =>
  Array.isArray(value) ? (value as BuyerSeller[]) : [];

export const buyerSellersAPI = createApi({
  reducerPath: "buyerSellersAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerSellers"],
  endpoints: (builder) => ({
    getBuyerSellers: builder.query<GetBuyerSellersResponse, void>({
      query: () => ({
        url: "/api/buyer/sellers",
        method: "GET",
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
            pagination: nested && typeof nested === "object" ? nested.pagination : undefined,
          },
        };
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

export const { useGetBuyerSellersQuery, useGetBuyerSellerByIdQuery } = buyerSellersAPI;
