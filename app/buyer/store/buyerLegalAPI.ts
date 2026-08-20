import { createApi } from "@reduxjs/toolkit/query/react";
import type { GetBuyerPrivacyPolicyResponse } from "./buyerLegalTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const buyerLegalAPI = createApi({
  reducerPath: "buyerLegalAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerPrivacyPolicy"],
  endpoints: (builder) => ({
    getBuyerPrivacyPolicy: builder.query<GetBuyerPrivacyPolicyResponse, void>({
      query: () => ({
        url: "/api/buyer/legal/privacy-policy",
        method: "GET",
        skipErrorToast: true,
      }),
      providesTags: ["BuyerPrivacyPolicy"],
    }),
  }),
});

export const { useGetBuyerPrivacyPolicyQuery } = buyerLegalAPI;
