import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  GetBuyerBookingTermsResponse,
  GetBuyerPrivacyPolicyResponse,
  GetBuyerTermsAndConditionsResponse,
} from "./buyerLegalTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const buyerLegalAPI = createApi({
  reducerPath: "buyerLegalAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerPrivacyPolicy", "BuyerTermsAndConditions", "BuyerBookingTerms"],
  endpoints: (builder) => ({
    getBuyerPrivacyPolicy: builder.query<GetBuyerPrivacyPolicyResponse, void>({
      query: () => ({
        url: "/api/public/privacy-policy",
        method: "GET",
        params: { audience: "buyer" },
        skipErrorToast: true,
      }),
      providesTags: ["BuyerPrivacyPolicy"],
    }),
    getBuyerTermsAndConditions: builder.query<GetBuyerTermsAndConditionsResponse, void>({
      query: () => ({
        url: "/api/public/terms-and-conditions",
        method: "GET",
        skipErrorToast: true,
      }),
      providesTags: ["BuyerTermsAndConditions"],
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
  useGetBuyerTermsAndConditionsQuery,
  useGetBuyerBookingTermsQuery,
} = buyerLegalAPI;
