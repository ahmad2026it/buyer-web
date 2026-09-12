import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  GetMarketplaceCategoriesParams,
  GetMarketplaceCategoriesResponse,
} from './marketplaceCategoriesTypes';
import { axiosBaseQuery } from '@/lib/axiosBaseQuery';
import {
  ALL_MARKETPLACE_CATEGORY_ID,
  toMarketplaceCategory,
  transformMarketplaceCategoriesResponse,
  withAllMarketplaceCategory,
} from '@/lib/marketplace/categories';
import { MARKETPLACE_CATEGORIES } from '@/lib/marketplace/data';
import type { MarketplaceCategory } from '@/lib/marketplace/types';

export const MARKETPLACE_CATEGORIES_LIST_PARAMS = {
  page: 1,
  limit: 50,
} as const;

export const marketplaceCategoriesAPI = createApi({
  reducerPath: 'marketplaceCategoriesAPI',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['MarketplaceCategories'],
  endpoints: (builder) => ({
    getMarketplaceCategories: builder.query<
      GetMarketplaceCategoriesResponse,
      GetMarketplaceCategoriesParams | void
    >({
      query: (params) => ({
        url: '/api/buyer/marketplace/categories',
        method: 'GET',
        params: {
          page: params?.page ?? MARKETPLACE_CATEGORIES_LIST_PARAMS.page,
          limit: params?.limit ?? MARKETPLACE_CATEGORIES_LIST_PARAMS.limit,
        },
        skipErrorToast: true,
      }),
      transformResponse: (response: unknown, _meta, arg) =>
        transformMarketplaceCategoriesResponse(response, {
          page: arg?.page ?? MARKETPLACE_CATEGORIES_LIST_PARAMS.page,
          limit: arg?.limit ?? MARKETPLACE_CATEGORIES_LIST_PARAMS.limit,
        }),
      providesTags: ['MarketplaceCategories'],
    }),
  }),
});

export const { useGetMarketplaceCategoriesQuery } = marketplaceCategoriesAPI;

export function useMarketplaceCategories() {
  const query = useGetMarketplaceCategoriesQuery(MARKETPLACE_CATEGORIES_LIST_PARAMS);
  const remote = (query.data?.data.categories ?? []).map(toMarketplaceCategory);
  const categories: MarketplaceCategory[] =
    remote.length > 0
      ? withAllMarketplaceCategory(remote)
      : query.isLoading
        ? []
        : MARKETPLACE_CATEGORIES;

  return {
    ...query,
    categories,
    postableCategories: categories.filter((category) => category.id !== ALL_MARKETPLACE_CATEGORY_ID),
  };
}
