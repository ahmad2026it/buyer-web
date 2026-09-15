import type {
  MarketplaceListing,
  MarketplaceListingCondition,
  MarketplaceMyListingStatus,
} from '@/lib/marketplace/types';

export type { MarketplaceListingCondition, MarketplaceMyListingStatus };

export type CreateMarketplaceListingRequest = {
  title: string;
  description: string;
  price: string;
  categoryId: string;
  condition: MarketplaceListingCondition;
  lat: number;
  lng: number;
  city: string;
  state: string;
  zipCode: string;
  locationLabel: string;
  images: File[];
  showPhoneNumber: boolean;
};

export type UpdateMarketplaceListingRequest = {
  id: string;
  title: string;
  description: string;
  price: string;
  categoryId: string;
  condition: MarketplaceListingCondition;
  lat: number;
  lng: number;
  city: string;
  state: string;
  zipCode: string;
  locationLabel: string;
  keepImages: string[];
  images: File[];
  showPhoneNumber: boolean;
};

export type CreatedMarketplaceListing = {
  id?: number | string;
  listing?: { id?: number | string };
};

export type CreateMarketplaceListingResponse = {
  success: boolean;
  status?: number;
  message: string;
  data?: CreatedMarketplaceListing | null;
};

export type MarketplaceListingsPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetMarketplaceListingsParams = {
  search?: string;
  category_id?: string;
  condition?: string;
  min_price?: string | number;
  max_price?: string | number;
  lat?: number;
  lng?: number;
  radius_miles?: number;
  sort?: string;
  exclude_mine?: boolean;
  page?: number;
  limit?: number;
};

export type GetMyMarketplaceListingsParams = {
  status?: MarketplaceMyListingStatus | 'all';
  page?: number;
  limit?: number;
};

export type GetSavedMarketplaceListingsParams = {
  page?: number;
  limit?: number;
};

export type GetMarketplaceListingsResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    listings: MarketplaceListing[];
    pagination: MarketplaceListingsPagination;
  };
};

export type GetMarketplaceListingResponse = {
  success: boolean;
  status: number;
  message: string;
  data: MarketplaceListing | null;
};

export type MarketplaceListingStatusUpdate = 'active' | 'sold';

export type UpdateMarketplaceListingStatusRequest = {
  id: string;
  status: MarketplaceListingStatusUpdate;
};

export type MarketplaceListingActionResponse = {
  success: boolean;
  status?: number;
  message: string;
};
