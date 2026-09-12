import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  CreateMarketplaceListingRequest,
  CreateMarketplaceListingResponse,
  CreatedMarketplaceListing,
  GetMarketplaceListingResponse,
  GetMarketplaceListingsParams,
  GetMarketplaceListingsResponse,
  GetMyMarketplaceListingsParams,
  GetSavedMarketplaceListingsParams,
  MarketplaceListingActionResponse,
  MarketplaceListingsPagination,
  UpdateMarketplaceListingRequest,
  UpdateMarketplaceListingStatusRequest,
} from './marketplaceListingsTypes';
import { axiosBaseQuery } from '@/lib/axiosBaseQuery';
import {
  extractMarketplaceListingList,
  normalizeMarketplaceListing,
  unwrapMarketplaceListing,
} from '@/lib/marketplace/listings';
import type { MarketplaceListing } from '@/lib/marketplace/types';

export const MARKETPLACE_LISTINGS_LIST_PARAMS = {
  page: 1,
  limit: 20,
} as const;

export const MARKETPLACE_MY_LISTINGS_PARAMS = {
  page: 1,
  limit: 10,
  status: 'active',
} as const;

export const MARKETPLACE_SAVED_LISTINGS_PARAMS = {
  page: 1,
  limit: 20,
} as const;

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asId = (value: unknown): string | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
};

export function marketplaceListingIdFromResponse(
  response: CreateMarketplaceListingResponse | unknown,
): string | null {
  const payload = asRecord(response);
  const nested = asRecord(payload?.data) ?? payload;
  if (!nested) return null;

  const listing = asRecord(nested.listing) ?? nested;
  return asId(listing.id ?? listing.listingId ?? listing.listing_id);
}

const buildCreateListingFormData = (payload: CreateMarketplaceListingRequest): FormData => {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('description', payload.description);
  formData.append('price', payload.price);
  formData.append('categoryId', payload.categoryId);
  formData.append('condition', payload.condition);
  formData.append('lat', String(payload.lat));
  formData.append('lng', String(payload.lng));
  formData.append('city', payload.city);
  formData.append('state', payload.state);
  formData.append('zipCode', payload.zipCode);
  formData.append('locationLabel', payload.locationLabel);
  payload.images.forEach((file) => formData.append('images', file));
  return formData;
};

const buildUpdateListingFormData = (payload: UpdateMarketplaceListingRequest): FormData => {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('description', payload.description);
  formData.append('price', payload.price);
  formData.append('categoryId', payload.categoryId);
  formData.append('condition', payload.condition);
  formData.append('lat', String(payload.lat));
  formData.append('lng', String(payload.lng));
  formData.append('city', payload.city);
  formData.append('state', payload.state);
  formData.append('zipCode', payload.zipCode);
  formData.append('locationLabel', payload.locationLabel);
  formData.append('keepImages', JSON.stringify(payload.keepImages));
  payload.images.forEach((file) => formData.append('images', file));
  return formData;
};

const transformCreateResponse = (
  response: CreateMarketplaceListingResponse | CreatedMarketplaceListing | unknown,
  fallbackMessage = 'Listing created successfully',
): CreateMarketplaceListingResponse => {
  const payload = asRecord(response);
  const nested = asRecord(payload?.data);
  const data = (nested ??
    (payload && 'id' in payload ? payload : null)) as CreatedMarketplaceListing | null;

  return {
    success: typeof payload?.success === 'boolean' ? payload.success : true,
    status: Number(payload?.status) || 200,
    message:
      typeof payload?.message === 'string' && payload.message.trim()
        ? payload.message
        : fallbackMessage,
    data,
  };
};

const compactListingParams = (params?: GetMarketplaceListingsParams | void) => {
  if (!params) {
    return {
      page: MARKETPLACE_LISTINGS_LIST_PARAMS.page,
      limit: MARKETPLACE_LISTINGS_LIST_PARAMS.limit,
    };
  }

  const out: Record<string, string | number | boolean> = {
    page: params.page ?? MARKETPLACE_LISTINGS_LIST_PARAMS.page,
    limit: params.limit ?? MARKETPLACE_LISTINGS_LIST_PARAMS.limit,
  };

  const search = params.search?.trim();
  if (search) out.search = search;
  if (params.category_id) {
    const categoryId = Number(params.category_id);
    out.category_id = Number.isFinite(categoryId) ? categoryId : params.category_id;
  }
  if (params.condition) out.condition = params.condition;
  if (params.min_price != null && String(params.min_price).trim() !== '') {
    out.min_price = params.min_price;
  }
  if (params.max_price != null && String(params.max_price).trim() !== '') {
    out.max_price = params.max_price;
  }
  if (params.lat != null) out.lat = params.lat;
  if (params.lng != null) out.lng = params.lng;
  if (params.radius_miles != null) out.radius_miles = params.radius_miles;
  if (params.sort) out.sort = params.sort;
  if (params.exclude_mine === true) out.exclude_mine = 'true';
  if (params.exclude_mine === false) out.exclude_mine = 'false';

  return out;
};

const compactMineListingParams = (params?: GetMyMarketplaceListingsParams | void) => {
  const out: Record<string, string | number> = {
    page: params?.page ?? MARKETPLACE_MY_LISTINGS_PARAMS.page,
    limit: params?.limit ?? MARKETPLACE_MY_LISTINGS_PARAMS.limit,
  };

  if (params?.status && params.status !== 'all') {
    out.status = params.status;
  } else if (!params?.status) {
    out.status = MARKETPLACE_MY_LISTINGS_PARAMS.status;
  }

  return out;
};

const normalizePagination = (
  value: unknown,
  fallback: { total: number; page: number; limit: number },
): MarketplaceListingsPagination => {
  const record = asRecord(value);
  const page = Number(record?.page) || fallback.page;
  const limit = Number(record?.limit) || fallback.limit;
  const total = Number(record?.total) || fallback.total;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) ||
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  return { page, limit, total, totalPages };
};

const asListings = (value: unknown): MarketplaceListing[] =>
  extractMarketplaceListingList(value)
    .map(normalizeMarketplaceListing)
    .filter((item): item is MarketplaceListing => item != null);

const transformListingsResponse = (
  response: unknown,
  arg: { page?: number; limit?: number } | void,
): GetMarketplaceListingsResponse => {
  const payload = asRecord(response);
  const nested = asRecord(payload?.data);
  const listings = asListings(response);
  const page = arg?.page ?? MARKETPLACE_LISTINGS_LIST_PARAMS.page;
  const limit = arg?.limit ?? MARKETPLACE_LISTINGS_LIST_PARAMS.limit;

  return {
    success: typeof payload?.success === 'boolean' ? payload.success : true,
    status: Number(payload?.status) || 200,
    message: typeof payload?.message === 'string' ? payload.message : '',
    data: {
      listings,
      pagination: normalizePagination(nested?.pagination ?? payload?.pagination, {
        total: listings.length,
        page,
        limit,
      }),
    },
  };
};

const transformListingResponse = (response: unknown): GetMarketplaceListingResponse => {
  const payload = asRecord(response);
  return {
    success: typeof payload?.success === 'boolean' ? payload.success : true,
    status: Number(payload?.status) || 200,
    message: typeof payload?.message === 'string' ? payload.message : '',
    data: unwrapMarketplaceListing(response),
  };
};

type QueryPatch = { undo: () => void };

function patchMarketplaceListingFavorite(
  dispatch: (action: unknown) => QueryPatch,
  getState: () => unknown,
  listingId: string,
  isFavorite: boolean,
): QueryPatch[] {
  const patches: QueryPatch[] = [
    dispatch(
      marketplaceListingsAPI.util.updateQueryData(
        'getMarketplaceListing',
        listingId,
        (draft) => {
          if (draft.data) draft.data.isFavorite = isFavorite;
        },
      ),
    ),
  ];

  const browseArgs = marketplaceListingsAPI.util.selectCachedArgsForQuery(
    getState() as never,
    'getMarketplaceListings',
  );
  for (const args of browseArgs) {
    patches.push(
      dispatch(
        marketplaceListingsAPI.util.updateQueryData(
          'getMarketplaceListings',
          args,
          (draft) => {
            const item = draft.data?.listings.find((listing) => listing.id === listingId);
            if (item) item.isFavorite = isFavorite;
          },
        ),
      ),
    );
  }

  const savedArgs = marketplaceListingsAPI.util.selectCachedArgsForQuery(
    getState() as never,
    'getSavedMarketplaceListings',
  );
  for (const args of savedArgs) {
    patches.push(
      dispatch(
        marketplaceListingsAPI.util.updateQueryData(
          'getSavedMarketplaceListings',
          args,
          (draft) => {
            if (!draft.data?.listings) return;
            if (!isFavorite) {
              draft.data.listings = draft.data.listings.filter((item) => item.id !== listingId);
              if (draft.data.pagination) {
                draft.data.pagination.total = Math.max(0, draft.data.pagination.total - 1);
              }
              return;
            }
            const item = draft.data.listings.find((listing) => listing.id === listingId);
            if (item) item.isFavorite = true;
          },
        ),
      ),
    );
  }

  return patches;
}

export const marketplaceListingsAPI = createApi({
  reducerPath: 'marketplaceListingsAPI',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['MarketplaceListings'],
  endpoints: (builder) => ({
    getMarketplaceListings: builder.query<
      GetMarketplaceListingsResponse,
      GetMarketplaceListingsParams | void
    >({
      query: (params) => ({
        url: '/api/buyer/marketplace/listings',
        method: 'GET',
        params: compactListingParams(params),
        skipErrorToast: true,
      }),
      transformResponse: (response: unknown, _meta, arg) =>
        transformListingsResponse(response, arg),
      serializeQueryArgs: ({ queryArgs }) => {
        if (!queryArgs) return 'default';
        const { page: _page, ...rest } = queryArgs;
        return JSON.stringify(rest);
      },
      merge: (currentCache, incoming, { arg }) => {
        const page = arg && typeof arg === 'object' ? arg.page ?? 1 : 1;
        if (!currentCache || page <= 1) return incoming;

        const existingIds = new Set(currentCache.data.listings.map((item) => item.id));
        return {
          ...incoming,
          data: {
            ...incoming.data,
            listings: [
              ...currentCache.data.listings,
              ...incoming.data.listings.filter((item) => !existingIds.has(item.id)),
            ],
          },
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return JSON.stringify(currentArg ?? null) !== JSON.stringify(previousArg ?? null);
      },
      providesTags: (result) =>
        result?.data.listings
          ? [
              ...result.data.listings.map((listing) => ({
                type: 'MarketplaceListings' as const,
                id: listing.id,
              })),
              { type: 'MarketplaceListings', id: 'LIST' },
            ]
          : [{ type: 'MarketplaceListings', id: 'LIST' }],
    }),
    getMyMarketplaceListings: builder.query<
      GetMarketplaceListingsResponse,
      GetMyMarketplaceListingsParams | void
    >({
      query: (params) => ({
        url: '/api/buyer/marketplace/listings/mine',
        method: 'GET',
        params: compactMineListingParams(params),
        skipErrorToast: true,
      }),
      transformResponse: (response: unknown, _meta, arg) =>
        transformListingsResponse(response, arg),
      serializeQueryArgs: ({ queryArgs }) => {
        if (!queryArgs) return 'mine-default';
        const { page: _page, ...rest } = queryArgs;
        return `mine:${JSON.stringify(rest)}`;
      },
      merge: (currentCache, incoming, { arg }) => {
        const page = arg && typeof arg === 'object' ? arg.page ?? 1 : 1;
        if (!currentCache || page <= 1) return incoming;

        const existingIds = new Set(currentCache.data.listings.map((item) => item.id));
        return {
          ...incoming,
          data: {
            ...incoming.data,
            listings: [
              ...currentCache.data.listings,
              ...incoming.data.listings.filter((item) => !existingIds.has(item.id)),
            ],
          },
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return JSON.stringify(currentArg ?? null) !== JSON.stringify(previousArg ?? null);
      },
      providesTags: (result) =>
        result?.data.listings
          ? [
              ...result.data.listings.map((listing) => ({
                type: 'MarketplaceListings' as const,
                id: listing.id,
              })),
              { type: 'MarketplaceListings', id: 'MINE' },
            ]
          : [{ type: 'MarketplaceListings', id: 'MINE' }],
    }),
    getMarketplaceListing: builder.query<GetMarketplaceListingResponse, string>({
      query: (id) => ({
        url: `/api/buyer/marketplace/listings/${encodeURIComponent(id)}`,
        method: 'GET',
        skipErrorToast: true,
      }),
      transformResponse: transformListingResponse,
      providesTags: (_result, _error, id) => [{ type: 'MarketplaceListings', id }],
    }),
    createMarketplaceListing: builder.mutation<
      CreateMarketplaceListingResponse,
      CreateMarketplaceListingRequest
    >({
      query: (payload) => ({
        url: '/api/buyer/marketplace/listings',
        method: 'POST',
        body: buildCreateListingFormData(payload),
      }),
      transformResponse: transformCreateResponse,
      invalidatesTags: [
        { type: 'MarketplaceListings', id: 'LIST' },
        { type: 'MarketplaceListings', id: 'MINE' },
      ],
    }),
    updateMarketplaceListing: builder.mutation<
      CreateMarketplaceListingResponse,
      UpdateMarketplaceListingRequest
    >({
      query: (payload) => ({
        url: `/api/buyer/marketplace/listings/${encodeURIComponent(payload.id)}`,
        method: 'PUT',
        body: buildUpdateListingFormData(payload),
      }),
      transformResponse: (response: unknown) =>
        transformCreateResponse(response, 'Listing updated successfully'),
      invalidatesTags: (_result, _error, payload) => [
        { type: 'MarketplaceListings', id: payload.id },
        { type: 'MarketplaceListings', id: 'LIST' },
        { type: 'MarketplaceListings', id: 'MINE' },
      ],
    }),
    updateMarketplaceListingStatus: builder.mutation<
      MarketplaceListingActionResponse,
      UpdateMarketplaceListingStatusRequest
    >({
      query: ({ id, status }) => ({
        url: `/api/buyer/marketplace/listings/${encodeURIComponent(id)}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: unknown) => {
        const payload = asRecord(response);
        return {
          success: typeof payload?.success === 'boolean' ? payload.success : true,
          status: Number(payload?.status) || 200,
          message:
            typeof payload?.message === 'string' && payload.message.trim()
              ? payload.message
              : 'Listing status updated',
        };
      },
      invalidatesTags: (_result, _error, payload) => [
        { type: 'MarketplaceListings', id: payload.id },
        { type: 'MarketplaceListings', id: 'LIST' },
        { type: 'MarketplaceListings', id: 'MINE' },
      ],
    }),
    deleteMarketplaceListing: builder.mutation<MarketplaceListingActionResponse, string>({
      query: (id) => ({
        url: `/api/buyer/marketplace/listings/${encodeURIComponent(id)}`,
        method: 'DELETE',
      }),
      transformResponse: (response: unknown) => {
        const payload = asRecord(response);
        return {
          success: typeof payload?.success === 'boolean' ? payload.success : true,
          status: Number(payload?.status) || 200,
          message:
            typeof payload?.message === 'string' && payload.message.trim()
              ? payload.message
              : 'Listing deleted',
        };
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'MarketplaceListings', id },
        { type: 'MarketplaceListings', id: 'LIST' },
        { type: 'MarketplaceListings', id: 'MINE' },
      ],
    }),
    getSavedMarketplaceListings: builder.query<
      GetMarketplaceListingsResponse,
      GetSavedMarketplaceListingsParams | void
    >({
      query: (params) => ({
        url: '/api/buyer/marketplace/saved',
        method: 'GET',
        params: {
          page: params?.page ?? MARKETPLACE_SAVED_LISTINGS_PARAMS.page,
          limit: params?.limit ?? MARKETPLACE_SAVED_LISTINGS_PARAMS.limit,
        },
        skipErrorToast: true,
      }),
      transformResponse: (response: unknown, _meta, arg) => {
        const result = transformListingsResponse(response, {
          page: arg?.page ?? MARKETPLACE_SAVED_LISTINGS_PARAMS.page,
          limit: arg?.limit ?? MARKETPLACE_SAVED_LISTINGS_PARAMS.limit,
        });
        return {
          ...result,
          data: {
            ...result.data,
            listings: result.data.listings.map((listing) => ({
              ...listing,
              isFavorite: true,
            })),
          },
        };
      },
      serializeQueryArgs: ({ queryArgs }) => {
        if (!queryArgs) return 'saved-default';
        const { page: _page, ...rest } = queryArgs;
        return `saved:${JSON.stringify(rest)}`;
      },
      merge: (currentCache, incoming, { arg }) => {
        const page = arg && typeof arg === 'object' ? arg.page ?? 1 : 1;
        if (!currentCache || page <= 1) return incoming;

        const existingIds = new Set(currentCache.data.listings.map((item) => item.id));
        return {
          ...incoming,
          data: {
            ...incoming.data,
            listings: [
              ...currentCache.data.listings,
              ...incoming.data.listings.filter((item) => !existingIds.has(item.id)),
            ],
          },
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return JSON.stringify(currentArg ?? null) !== JSON.stringify(previousArg ?? null);
      },
      providesTags: (result) =>
        result?.data.listings
          ? [
              ...result.data.listings.map((listing) => ({
                type: 'MarketplaceListings' as const,
                id: listing.id,
              })),
              { type: 'MarketplaceListings', id: 'SAVED' },
            ]
          : [{ type: 'MarketplaceListings', id: 'SAVED' }],
    }),
    saveMarketplaceListing: builder.mutation<MarketplaceListingActionResponse, string>({
      query: (id) => ({
        url: `/api/buyer/marketplace/listings/${encodeURIComponent(id)}/save`,
        method: 'POST',
      }),
      transformResponse: (response: unknown) => {
        const payload = asRecord(response);
        return {
          success: typeof payload?.success === 'boolean' ? payload.success : true,
          status: Number(payload?.status) || 200,
          message:
            typeof payload?.message === 'string' && payload.message.trim()
              ? payload.message
              : 'Listing saved',
        };
      },
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const patches = patchMarketplaceListingFavorite(dispatch, getState, id, true);
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: [{ type: 'MarketplaceListings', id: 'SAVED' }],
    }),
    unsaveMarketplaceListing: builder.mutation<MarketplaceListingActionResponse, string>({
      query: (id) => ({
        url: `/api/buyer/marketplace/listings/${encodeURIComponent(id)}/save`,
        method: 'DELETE',
      }),
      transformResponse: (response: unknown) => {
        const payload = asRecord(response);
        return {
          success: typeof payload?.success === 'boolean' ? payload.success : true,
          status: Number(payload?.status) || 200,
          message:
            typeof payload?.message === 'string' && payload.message.trim()
              ? payload.message
              : 'Listing unsaved',
        };
      },
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const patches = patchMarketplaceListingFavorite(dispatch, getState, id, false);
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: [{ type: 'MarketplaceListings', id: 'SAVED' }],
    }),
  }),
});

export const {
  useGetMarketplaceListingsQuery,
  useGetMyMarketplaceListingsQuery,
  useGetMarketplaceListingQuery,
  useGetSavedMarketplaceListingsQuery,
  useCreateMarketplaceListingMutation,
  useUpdateMarketplaceListingMutation,
  useUpdateMarketplaceListingStatusMutation,
  useDeleteMarketplaceListingMutation,
  useSaveMarketplaceListingMutation,
  useUnsaveMarketplaceListingMutation,
} = marketplaceListingsAPI;
