export const MARKETPLACE_CATEGORY_IDS = [
  'all',
  'mobiles',
  'vehicles',
  'electronics',
  'furniture',
  'fashion',
  'property',
] as const;

export type MarketplaceCategoryId = (typeof MARKETPLACE_CATEGORY_IDS)[number];

export const MARKETPLACE_CONDITIONS = [
  'Brand New',
  'Like New',
  'Good',
  'Fair',
] as const;

export type MarketplaceCondition = (typeof MARKETPLACE_CONDITIONS)[number];

export const MARKETPLACE_SORTS = ['newest', 'price_asc', 'price_desc'] as const;

export type MarketplaceSort = (typeof MARKETPLACE_SORTS)[number];

export type MarketplaceSeller = {
  id: string;
  name: string;
  avatar: string;
  memberSince: string;
};

export type MarketplaceListing = {
  id: string;
  title: string;
  price: number;
  currency: 'PKR';
  negotiable: boolean;
  condition: MarketplaceCondition;
  featured: boolean;
  categoryId: Exclude<MarketplaceCategoryId, 'all'>;
  location: string;
  postedAt: string;
  postedLabel: string;
  imageCount: number;
  images: string[];
  description: string;
  seller: MarketplaceSeller;
  isFavorite: boolean;
};

export type MarketplaceFilters = {
  categoryId: MarketplaceCategoryId;
  query: string;
  condition: MarketplaceCondition | 'all';
  featuredOnly: boolean;
  negotiableOnly: boolean;
  minPrice: string;
  maxPrice: string;
  sort: MarketplaceSort;
};

export type MarketplaceCategory = {
  id: MarketplaceCategoryId;
  label: string;
};
