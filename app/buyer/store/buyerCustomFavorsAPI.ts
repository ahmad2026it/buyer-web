import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  AcceptBuyerCustomFavorRequestRequest,
  AcceptBuyerCustomFavorRequestResponse,
  CreateBuyerCustomFavorRequest,
  CreateBuyerCustomFavorResponse,
  DeleteBuyerCustomFavorResponse,
  GetBuyerCustomFavorByIdResponse,
  GetBuyerCustomFavorsParams,
  GetBuyerCustomFavorsResponse,
  RejectBuyerCustomFavorRequestRequest,
  RejectBuyerCustomFavorRequestResponse,
  UpdateBuyerCustomFavorRequest,
  UpdateBuyerCustomFavorResponse,
} from "./buyerCustomFavorsTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const BUYER_CUSTOM_FAVORS_LIST_PARAMS: Required<GetBuyerCustomFavorsParams> = {
  status: "active",
  page: 1,
  limit: 10,
};

const appendIfPresent = (
  formData: FormData,
  key: string,
  value: string | number | undefined | null,
) => {
  if (value === undefined || value === null || value === "") return;
  formData.append(key, String(value));
};

const buildCustomFavorFormData = (
  payload: CreateBuyerCustomFavorRequest,
): FormData => {
  const formData = new FormData();

  formData.append("type", payload.type);
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("budget", String(payload.budget));
  formData.append("dateTime", payload.dateTime);
  formData.append("lat", String(payload.lat));
  formData.append("lng", String(payload.lng));
  formData.append("locationId", String(payload.locationId));
  appendIfPresent(formData, "location", payload.location);
  appendIfPresent(formData, "locationDetail", payload.locationDetail);

  if (payload.addOns?.length) {
    formData.append("addOns", JSON.stringify(payload.addOns));
  }

  if (payload.questions?.length) {
    formData.append("questions", JSON.stringify(payload.questions));
  }

  payload.invitedSellerIds?.forEach((id) => {
    formData.append("invitedSellerIds[]", String(id));
  });

  payload.images?.forEach((file) => formData.append("images", file));
  payload.videos?.forEach((file) => formData.append("videos", file));
  appendIfPresent(formData, "sellersRequired", payload.sellersRequired);

  return formData;
};

export const buyerCustomFavorsAPI = createApi({
  reducerPath: "buyerCustomFavorsAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerCustomFavors"],
  endpoints: (builder) => ({
    getBuyerCustomFavors: builder.query<
      GetBuyerCustomFavorsResponse,
      GetBuyerCustomFavorsParams | void
    >({
      query: (params) => ({
        url: "/api/buyer/custom-favors/offers/list",
        method: "GET",
        params: {
          status: params?.status ?? BUYER_CUSTOM_FAVORS_LIST_PARAMS.status,
          page: params?.page ?? BUYER_CUSTOM_FAVORS_LIST_PARAMS.page,
          limit: params?.limit ?? BUYER_CUSTOM_FAVORS_LIST_PARAMS.limit,
        },
        skipErrorToast: true,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page: _page, ...rest } = queryArgs ?? {};
        return `${endpointName}-${JSON.stringify(rest)}`;
      },
      merge: (currentCache, incoming, { arg }) => {
        const page = arg?.page ?? 1;
        if (!currentCache || page <= 1) return incoming;

        const existingIds = new Set(
          currentCache.data.offers.map((item) => item.id),
        );

        return {
          ...incoming,
          data: {
            ...incoming.data,
            offers: [
              ...currentCache.data.offers,
              ...incoming.data.offers.filter((item) => !existingIds.has(item.id)),
            ],
          },
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?.status !== previousArg?.status
        );
      },
      providesTags: (result, _error, arg) =>
        result?.data?.offers
          ? [
              ...result.data.offers.map((favor) => ({
                type: "BuyerCustomFavors" as const,
                id: favor.id,
              })),
              {
                type: "BuyerCustomFavors",
                id: `LIST-${arg?.status ?? BUYER_CUSTOM_FAVORS_LIST_PARAMS.status}`,
              },
              { type: "BuyerCustomFavors", id: "LIST" },
            ]
          : [
              {
                type: "BuyerCustomFavors",
                id: `LIST-${arg?.status ?? BUYER_CUSTOM_FAVORS_LIST_PARAMS.status}`,
              },
              { type: "BuyerCustomFavors", id: "LIST" },
            ],
    }),
    getBuyerCustomFavorById: builder.query<GetBuyerCustomFavorByIdResponse, number>({
      query: (id) => ({
        url: `/api/buyer/custom-favors/${id}`,
        method: "GET",
        skipErrorToast: true,
      }),
      providesTags: (_result, _error, id) => [{ type: "BuyerCustomFavors", id }],
    }),
    acceptBuyerCustomFavorRequest: builder.mutation<
      AcceptBuyerCustomFavorRequestResponse,
      AcceptBuyerCustomFavorRequestRequest
    >({
      query: ({ favorId: _favorId, ...body }) => ({
        url: "/api/buyer/custom-favors/requests/accept",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "BuyerCustomFavors", id: "LIST" },
        { type: "BuyerCustomFavors", id: "LIST-active" },
        { type: "BuyerCustomFavors", id: "LIST-history" },
        ...(arg.favorId ? [{ type: "BuyerCustomFavors" as const, id: arg.favorId }] : []),
      ],
    }),
    rejectBuyerCustomFavorRequest: builder.mutation<
      RejectBuyerCustomFavorRequestResponse,
      RejectBuyerCustomFavorRequestRequest
    >({
      query: ({ favorId: _favorId, ...body }) => ({
        url: "/api/buyer/custom-favors/requests/reject",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "BuyerCustomFavors", id: "LIST" },
        { type: "BuyerCustomFavors", id: "LIST-active" },
        { type: "BuyerCustomFavors", id: "LIST-history" },
        ...(arg.favorId ? [{ type: "BuyerCustomFavors" as const, id: arg.favorId }] : []),
      ],
    }),
    createBuyerCustomFavor: builder.mutation<
      CreateBuyerCustomFavorResponse,
      CreateBuyerCustomFavorRequest
    >({
      query: (payload) => ({
        url: "/api/buyer/custom-favors",
        method: "POST",
        body: buildCustomFavorFormData(payload),
      }),
      invalidatesTags: [
        { type: "BuyerCustomFavors", id: "LIST" },
        { type: "BuyerCustomFavors", id: "LIST-active" },
      ],
    }),
    updateBuyerCustomFavor: builder.mutation<
      UpdateBuyerCustomFavorResponse,
      UpdateBuyerCustomFavorRequest
    >({
      query: ({ id, ...payload }) => ({
        url: `/api/buyer/custom-favors/${id}`,
        method: "PUT",
        body: buildCustomFavorFormData(payload),
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "BuyerCustomFavors", id: arg.id },
        { type: "BuyerCustomFavors", id: "LIST" },
        { type: "BuyerCustomFavors", id: "LIST-active" },
        { type: "BuyerCustomFavors", id: "LIST-history" },
      ],
    }),
    deleteBuyerCustomFavor: builder.mutation<DeleteBuyerCustomFavorResponse, number>({
      query: (id) => ({
        url: `/api/buyer/custom-favors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "BuyerCustomFavors", id },
        { type: "BuyerCustomFavors", id: "LIST" },
        { type: "BuyerCustomFavors", id: "LIST-active" },
        { type: "BuyerCustomFavors", id: "LIST-history" },
      ],
    }),
  }),
});

export const {
  useGetBuyerCustomFavorsQuery,
  useGetBuyerCustomFavorByIdQuery,
  useAcceptBuyerCustomFavorRequestMutation,
  useRejectBuyerCustomFavorRequestMutation,
  useCreateBuyerCustomFavorMutation,
  useUpdateBuyerCustomFavorMutation,
  useDeleteBuyerCustomFavorMutation,
} = buyerCustomFavorsAPI;
