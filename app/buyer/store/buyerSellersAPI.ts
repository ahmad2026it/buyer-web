import { createApi } from "@reduxjs/toolkit/query/react";
import { useSelector } from "react-redux";
import type {
  BuyerSeller,
  GetBuyerSellerByIdResponse,
  GetBuyerSellersParams,
  GetBuyerSellersResponse,
} from "./buyerSellersTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const BUYER_SELLERS_LIST_PARAMS = {
  page: 1,
  limit: 16,
} as const;

type AuthTokenState = {
  auth?: {
    token?: string | null;
  };
};

const asSellers = (value: unknown): BuyerSeller[] =>
  Array.isArray(value) ? (value as BuyerSeller[]) : [];

const compactSellerParams = (params?: GetBuyerSellersParams | void) => {
  if (!params) return undefined;
  const out: Record<string, string | number | boolean> = {};
  if (params.page != null) out.page = params.page;
  if (params.limit != null) out.limit = params.limit;
  const search = params.search?.trim();
  if (search) out.search = search;
  if (params.isCompany != null) out.is_company = params.isCompany;
  return Object.keys(out).length ? out : undefined;
};

const transformSellersResponse = (
  response: GetBuyerSellersResponse | BuyerSeller[],
): GetBuyerSellersResponse => {
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
      pagination:
        nested && typeof nested === "object" ? nested.pagination : undefined,
    },
  };
};

const serializeSellerListArgs = ({
  queryArgs,
}: {
  queryArgs: GetBuyerSellersParams | void;
}) => {
  if (!queryArgs) return "default";
  const { page: _page, ...rest } = queryArgs;
  return JSON.stringify(rest);
};

const mergeSellerPages = (
  currentCache: GetBuyerSellersResponse,
  incoming: GetBuyerSellersResponse,
  { arg }: { arg: GetBuyerSellersParams | void },
): GetBuyerSellersResponse => {
  const page = arg && typeof arg === "object" ? arg.page ?? 1 : 1;
  if (!currentCache || page <= 1) return incoming;

  const existingIds = new Set(
    currentCache.data.sellers.map((item) => item.sellerId ?? item.id),
  );

  return {
    ...incoming,
    data: {
      ...incoming.data,
      sellers: [
        ...currentCache.data.sellers,
        ...incoming.data.sellers.filter(
          (item) => !existingIds.has(item.sellerId ?? item.id),
        ),
      ],
    },
  };
};

const shouldForceSellerPageRefetch = ({
  currentArg,
  previousArg,
}: {
  currentArg: GetBuyerSellersParams | void;
  previousArg: GetBuyerSellersParams | void;
}) => {
  const currPage =
    currentArg && typeof currentArg === "object" ? currentArg.page : 1;
  const prevPage =
    previousArg && typeof previousArg === "object" ? previousArg.page : 1;
  return currPage !== prevPage;
};

export const buyerSellersAPI = createApi({
  reducerPath: "buyerSellersAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerSellers"],
  endpoints: (builder) => ({
    getBuyerSellers: builder.query<
      GetBuyerSellersResponse,
      GetBuyerSellersParams | void
    >({
      query: (params) => ({
        url: "/api/buyer/sellers",
        method: "GET",
        params: compactSellerParams(params),
        skipErrorToast: true,
      }),
      transformResponse: transformSellersResponse,
      serializeQueryArgs: serializeSellerListArgs,
      merge: mergeSellerPages,
      forceRefetch: shouldForceSellerPageRefetch,
      providesTags: ["BuyerSellers"],
    }),
    getPublicSellers: builder.query<
      GetBuyerSellersResponse,
      GetBuyerSellersParams | void
    >({
      query: (params) => ({
        url: "/api/public/sellers",
        method: "GET",
        params: compactSellerParams(params),
        skipErrorToast: true,
      }),
      transformResponse: transformSellersResponse,
      serializeQueryArgs: serializeSellerListArgs,
      merge: mergeSellerPages,
      forceRefetch: shouldForceSellerPageRefetch,
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

export const {
  useGetBuyerSellersQuery,
  useGetPublicSellersQuery,
  useGetBuyerSellerByIdQuery,
} = buyerSellersAPI;

export function useSellersListQuery(
  params?: GetBuyerSellersParams,
  options?: { skip?: boolean },
) {
  const token = useSelector((state: AuthTokenState) => state.auth?.token);
  const skip = options?.skip ?? false;
  const authenticated = useGetBuyerSellersQuery(params, {
    skip: skip || !token,
  });
  const publicList = useGetPublicSellersQuery(params, {
    skip: skip || Boolean(token),
  });

  return token ? authenticated : publicList;
}
