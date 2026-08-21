import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  GetBuyerBookingTermsResponse,
  GetBuyerPrivacyPolicyResponse,
} from "./buyerLegalTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const buyerLegalAPI = createApi({
  reducerPath: "buyerLegalAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerPrivacyPolicy", "BuyerBookingTerms"],
  endpoints: (builder) => ({
    getBuyerPrivacyPolicy: builder.query<GetBuyerPrivacyPolicyResponse, void>({
      query: () => ({
        url: "/api/buyer/legal/privacy-policy",
        method: "GET",
        skipErrorToast: true,
      }),
      providesTags: ["BuyerPrivacyPolicy"],
    }),
    getBuyerBookingTerms: builder.query<GetBuyerBookingTermsResponse, void>({
      query: () => ({
        url: "/api/buyer/legal/booking-terms",
        method: "GET",
        skipErrorToast: true,
      }),
      providesTags: ["BuyerBookingTerms"],
    }),
  }),
});

export const {
  useGetBuyerPrivacyPolicyQuery,
  useGetBuyerBookingTermsQuery,
} = buyerLegalAPI;
