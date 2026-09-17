export const ALL_MARKETPLACE_CATEGORY_ID = 'all';

export type MarketplaceCategoryId = string;

export const MARKETPLACE_CONDITIONS = [
  'Brand New',
  'Like New',
  'Good',
  'Fair',
] as const;

export type MarketplaceCondition = (typeof MARKETPLACE_CONDITIONS)[number];

export const MARKETPLACE_LISTING_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'used_like_new', label: 'Like New' },
  { value: 'used_good', label: 'Good' },
  { value: 'used_fair', label: 'Fair' },
] as const;

export type MarketplaceListingCondition =
  (typeof MARKETPLACE_LISTING_CONDITIONS)[number]['value'];

export const MAX_MARKETPLACE_LISTING_IMAGES = 8;

export const MARKETPLACE_SORTS = ['newest', 'price_asc', 'price_desc'] as const;

export type MarketplaceSort = (typeof MARKETPLACE_SORTS)[number];

export const MARKETPLACE_MY_LISTING_STATUSES = ['active', 'sold', 'inactive'] as const;

export type MarketplaceMyListingStatus = (typeof MARKETPLACE_MY_LISTING_STATUSES)[number];

export type MarketplaceSeller = {
  id: string;
  name: string;
  avatar: string;
  memberSince: string;
  phoneNumber?: string;
};

export type MarketplaceListing = {
  id: string;
  title: string;
  price: number;
  currency: 'USD';
  negotiable: boolean;
  condition: string;
  status: string;
  featured: boolean;
  categoryId: string;
  categoryName: string;
  location: string;
  postedAt: string;
  postedLabel: string;
  imageCount: number;
  viewCount: number;
  images: string[];
  description: string;
  seller: MarketplaceSeller;
  isFavorite: boolean;
  lat?: number | null;
  lng?: number | null;
  city?: string;
  state?: string;
  zipCode?: string;
  ownerId?: string;
  showPhoneNumber: boolean;
  shareUrl?: string;
  isOwner?: boolean;
  distanceMiles?: number | null;
};

export type MarketplaceFilters = {
  categoryId: MarketplaceCategoryId;
  query: string;
  condition: MarketplaceListingCondition | 'all';
  featuredOnly: boolean;
  negotiableOnly: boolean;
  minPrice: string;
  maxPrice: string;
  sort: MarketplaceSort;
};

export type MarketplaceCategory = {
  id: MarketplaceCategoryId;
  label: string;
  slug?: string;
  icon?: string | null;
  colorCode?: string | null;
};
