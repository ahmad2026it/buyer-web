import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  CreateBuyerLocationRequest,
  CreateBuyerLocationResponse,
  DeleteBuyerLocationResponse,
  GetBuyerLocationResponse,
  GetBuyerLocationsResponse,
  UpdateBuyerLocationRequest,
  UpdateBuyerLocationResponse,
} from "./buyerLocationsTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const buyerLocationsAPI = createApi({
  reducerPath: "buyerLocationsAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerLocations", "BuyerLocation"],
  endpoints: (builder) => ({
    getBuyerLocations: builder.query<GetBuyerLocationsResponse, void>({
      query: () => ({
        url: "/api/buyer/locations",
        method: "GET",
      }),
      providesTags: ["BuyerLocations"],
    }),
    getBuyerLocation: builder.query<GetBuyerLocationResponse, number>({
      query: (id) => ({
        url: `/api/buyer/locations/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "BuyerLocation", id }],
    }),
    createBuyerLocation: builder.mutation<
      CreateBuyerLocationResponse,
      CreateBuyerLocationRequest
    >({
      query: (body) => ({
        url: "/api/buyer/locations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BuyerLocations"],
    }),
    updateBuyerLocation: builder.mutation<
      UpdateBuyerLocationResponse,
      UpdateBuyerLocationRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/api/buyer/locations/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "BuyerLocations",
        { type: "BuyerLocation", id },
      ],
    }),
    deleteBuyerLocation: builder.mutation<DeleteBuyerLocationResponse, number>({
      query: (id) => ({
        url: `/api/buyer/locations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        "BuyerLocations",
        { type: "BuyerLocation", id },
      ],
    }),
  }),
});

export const {
  useGetBuyerLocationsQuery,
  useGetBuyerLocationQuery,
  useCreateBuyerLocationMutation,
  useUpdateBuyerLocationMutation,
  useDeleteBuyerLocationMutation,
} = buyerLocationsAPI;
