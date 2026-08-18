import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  GetBuyerCategoriesParams,
  GetBuyerCategoriesResponse,
  GetBuyerSubCategoriesResponse,
} from "./buyerCategoriesTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const buyerCategoriesAPI = createApi({
  reducerPath: "buyerCategoriesAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerCategories", "BuyerSubCategories"],
  endpoints: (builder) => ({
    getBuyerCategories: builder.query<
      GetBuyerCategoriesResponse,
      GetBuyerCategoriesParams | void
    >({
      query: (params) => ({
        url: "/api/buyer/categories",
        method: "GET",
        params: {
          search: params?.search ?? "",
        },
        skipErrorToast: true,
      }),
      providesTags: ["BuyerCategories"],
    }),
    getBuyerSubCategories: builder.query<GetBuyerSubCategoriesResponse, number>({
      query: (categoryId) => ({
        url: `/api/buyer/categories/${categoryId}/subcategories`,
        method: "GET",
        skipErrorToast: true,
      }),
      providesTags: (_result, _error, categoryId) => [
        { type: "BuyerSubCategories", id: categoryId },
      ],
    }),
  }),
});

export const {
  useGetBuyerCategoriesQuery,
  useGetBuyerSubCategoriesQuery,
} = buyerCategoriesAPI;
