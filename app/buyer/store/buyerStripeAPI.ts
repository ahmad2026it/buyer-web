import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  CreateStripeSetupIntentResponse,
  GetBuyerStripeCardsResponse,
  RemoveBuyerStripeCardRequest,
  RemoveBuyerStripeCardResponse,
} from "./buyerStripeTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const buyerStripeAPI = createApi({
  reducerPath: "buyerStripeAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerPaymentMethods"],
  endpoints: (builder) => ({
    getBuyerStripeCards: builder.query<GetBuyerStripeCardsResponse, void>({
      query: () => ({
        url: "/api/buyer/stripe/cards",
        method: "GET",
      }),
      providesTags: ["BuyerPaymentMethods"],
    }),
    createStripeSetupIntent: builder.mutation<
      CreateStripeSetupIntentResponse,
      void
    >({
      query: () => ({
        url: "/api/buyer/stripe/setup-intent",
        method: "POST",
      }),
    }),
    removeBuyerStripeCard: builder.mutation<
      RemoveBuyerStripeCardResponse,
      RemoveBuyerStripeCardRequest
    >({
      query: (body) => ({
        url: "/api/buyer/stripe/remove-card",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BuyerPaymentMethods"],
    }),
  }),
});

export const {
  useGetBuyerStripeCardsQuery,
  useCreateStripeSetupIntentMutation,
  useRemoveBuyerStripeCardMutation,
} = buyerStripeAPI;
