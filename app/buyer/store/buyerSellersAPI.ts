import { createApi } from "@reduxjs/toolkit/query/react";
import type { GetBuyerSellerByIdResponse } from "./buyerSellersTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const buyerSellersAPI = createApi({
  reducerPath: "buyerSellersAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerSellers"],
  endpoints: (builder) => ({
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

export const { useGetBuyerSellerByIdQuery } = buyerSellersAPI;
