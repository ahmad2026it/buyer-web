export type BuyerFavorSeller = {
  id: number;
  fullName: string;
  profileImage: string | null;
  profileImageUrl?: string | null;
  isOnline: boolean;
};

export type BuyerFavorDetailUser = {
  id: number;
  fullName: string;
  profileImage: string | null;
  profileImageUrl?: string | null;
  phoneNumber?: string | null;
  isAway?: boolean;
  lastSeen?: string | null;
};

export type BuyerFavorDetailSeller = {
  id: number;
  fullName: string;
  profileImage: string | null;
  profileImageUrl?: string | null;
  phoneNumber?: string | null;
  isOnline: boolean;
  distanceMiles: number | null;
};

export type BuyerFavorLocation = {
  id: number;
  userId?: number;
  location: string;
  lat: string | number;
  lng: string | number;
  locationDetail: string | null;
  floor: string | null;
  label: string | null;
  isSelected: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BuyerFavorSubCategory = {
  id: number;
  categoryId: number;
  name: string;
  icon: string | null;
  colorCode: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BuyerFavorAddOn = {
  id?: number | string;
  name?: string;
  title?: string;
  label?: string;
  description?: string;
  price?: string | number;
};

export type BuyerFavorQuestion = {
  id?: number | string;
  question?: string;
  text?: string;
  title?: string;
  label?: string;
  type?: string;
  options?: string[];
  placeholder?: string;
};

export type BuyerFavorReviewer = {
  id?: number;
  fullName?: string;
  profileImage?: string | null;
  profileImageUrl?: string | null;
};

export type BuyerFavorReview = {
  id?: number;
  rating?: number;
  comment?: string | null;
  text?: string;
  review?: string;
  createdAt?: string;
  date?: string;
  author?: string;
  avatar?: string | null;
  reviewer?: BuyerFavorReviewer | null;
  user?: BuyerFavorReviewer | null;
};

export type BuyerFavorDetail = {
  id: number;
  favorType: string;
  userId: number;
  locationId: number | null;
  invitedSellerIds: number[];
  type: string;
  title: string;
  description: string;
  budget: string | number;
  dateTime: string | null;
  lat: string | number | null;
  lng: string | number | null;
  images: string[];
  videos: string[];
  addOns: BuyerFavorAddOn[];
  questions: Array<string | BuyerFavorQuestion>;
  categoryId: number | null;
  subCategoryIds: number[];
  isHidden: boolean;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
  user: BuyerFavorDetailUser | null;
  favorLocation: BuyerFavorLocation | null;
  averageRating: number | null;
  totalReviews: number;
  favorImage: string | null;
  distanceMiles: number | null;
  location: {
    id: number;
    location: string;
    lat: number;
    lng: number;
    locationDetail: string | null;
    floor: string | null;
    label: string | null;
    isSelected: boolean;
  } | null;
  reviews: BuyerFavorReview[];
  subCategories: BuyerFavorSubCategory[];
  seller: BuyerFavorDetailSeller | null;
  isFavorite: boolean;
};

export type BuyerRelatedFavor = {
  id: number;
  title: string;
  budget?: string | number;
  images?: string[];
  favorImage?: string | null;
  averageRating?: number | null;
  reviewCount?: number;
  totalReviews?: number;
  type?: string;
  seller?: {
    id?: number;
    fullName?: string;
    profileImage?: string | null;
    profileImageUrl?: string | null;
    isOnline?: boolean;
  } | null;
  user?: {
    id?: number;
    fullName?: string;
    profileImage?: string | null;
    profileImageUrl?: string | null;
  } | null;
};

export type BuyerFavor = {
  id: number;
  userId: number;
  type: string;
  title: string;
  description: string;
  budget: string | number;
  dateTime: string | null;
  lat: string | number | null;
  lng: string | number | null;
  locationId: number | null;
  favorType: string;
  images: string[];
  videos: string[];
  addOns: unknown[];
  questions: unknown[];
  subCategoryIds: number[];
  createdAt: string;
  updatedAt: string;
  reviewCount: number;
  totalReviews?: number;
  averageRating: number | null;
  distanceMiles: number | null;
  isFavorite: boolean;
  favorImage?: string | null;
  seller: BuyerFavorSeller | null;
};

export type BuyerFavorsPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetBuyerFavorsParams = {
  type?: string;
  search?: string;
  minBudget?: number;
  maxBudget?: number;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  page?: number;
  limit?: number;
  distance?: number;
  rating?: number;
  onlineOnly?: boolean;
  subCategoryIds?: string;
  userId?: number;
};

export type GetBuyerFavorsResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    favors: BuyerFavor[];
    pagination: BuyerFavorsPagination;
  };
};

export type GetBuyerFavorByIdResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    favor: BuyerFavorDetail;
    relatedFavors: {
      sellerOtherFavors: BuyerRelatedFavor[];
      sameTypeOtherSellerFavor: BuyerRelatedFavor | BuyerRelatedFavor[] | null;
    };
  };
};

export type MarkBuyerFavoriteResponse = {
  success: boolean;
  status?: number;
  message?: string;
  data?: unknown;
};

export type GetBuyerFavoritesParams = {
  page?: number;
  limit?: number;
};

export type GetBuyerFavoritesResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    favors: BuyerFavor[];
    pagination: BuyerFavorsPagination;
  };
};

export type FavorBudgetOption = "Any" | "Under $50" | "$50 – $150" | "$150 – $500" | "$500+";
export type FavorRatingOption =
  | "Any rating"
  | "Upto 4 stars"
  | "4 stars & above"
  | "4.5 stars & above"
  | "5 stars only";
export type FavorSortOption =
  | "Recommended"
  | "Price: Low to High"
  | "Price: High to Low"
  | "Highest Rated"
  | "Most Reviews";

export type AppliedFavorFilters = {
  onlineOnly: boolean;
  categoryNames: string[];
  subCategoryIds: number[];
  sort: FavorSortOption;
  sellerType: string;
  rating: FavorRatingOption;
  budget: FavorBudgetOption;
  distLow: number;
  distHigh: number;
};

export const DEFAULT_FAVOR_FILTERS: AppliedFavorFilters = {
  onlineOnly: false,
  categoryNames: [],
  subCategoryIds: [],
  sort: "Recommended",
  sellerType: "Any",
  rating: "Any rating",
  budget: "Any",
  distLow: 1,
  distHigh: 50,
};

export const isFavorFiltersActive = (filters: AppliedFavorFilters): boolean =>
  filters.onlineOnly !== DEFAULT_FAVOR_FILTERS.onlineOnly ||
  filters.categoryNames.length > 0 ||
  filters.subCategoryIds.length > 0 ||
  filters.sort !== DEFAULT_FAVOR_FILTERS.sort ||
  filters.sellerType !== DEFAULT_FAVOR_FILTERS.sellerType ||
  filters.rating !== DEFAULT_FAVOR_FILTERS.rating ||
  filters.budget !== DEFAULT_FAVOR_FILTERS.budget ||
  filters.distLow !== DEFAULT_FAVOR_FILTERS.distLow ||
  filters.distHigh !== DEFAULT_FAVOR_FILTERS.distHigh;

const budgetRange = (budget: FavorBudgetOption): { minBudget?: number; maxBudget?: number } => {
  if (budget === "Under $50") return { maxBudget: 50 };
  if (budget === "$50 – $150") return { minBudget: 50, maxBudget: 150 };
  if (budget === "$150 – $500") return { minBudget: 150, maxBudget: 500 };
  if (budget === "$500+") return { minBudget: 500 };
  return {};
};

const ratingValue = (rating: FavorRatingOption): number | undefined => {
  if (rating === "Upto 4 stars") return 4;
  if (rating === "4 stars & above") return 4;
  if (rating === "4.5 stars & above") return 4.5;
  if (rating === "5 stars only") return 5;
  return undefined;
};

const sortValue = (sort: FavorSortOption, pageSort?: "relevance" | "price"): string | undefined => {
  if (sort === "Price: Low to High") return "price_asc";
  if (sort === "Price: High to Low") return "price_desc";
  if (sort === "Highest Rated") return "rating";
  if (sort === "Most Reviews") return "reviews";
  if (pageSort === "price") return "price";
  return undefined;
};

export const toBuyerFavorsParams = ({
  filters,
  search,
  category,
  pageSort,
  page,
  limit,
}: {
  filters: AppliedFavorFilters;
  search?: string;
  category?: string;
  pageSort?: "relevance" | "price";
  page?: number;
  limit?: number;
}): GetBuyerFavorsParams => {
  const typeSource = filters.categoryNames.length === 1
    ? filters.categoryNames[0]
    : category && category !== "All"
      ? category
      : undefined;

  return {
    type: typeSource ? typeSource.toLowerCase() : undefined,
    search: search?.trim() || undefined,
    ...budgetRange(filters.budget),
    sort: sortValue(filters.sort, pageSort),
    page: page ?? 1,
    limit: limit ?? 15,
    distance: filters.distHigh !== DEFAULT_FAVOR_FILTERS.distHigh ? filters.distHigh : undefined,
    rating: ratingValue(filters.rating),
    onlineOnly: filters.onlineOnly || undefined,
    subCategoryIds: filters.subCategoryIds.length
      ? filters.subCategoryIds.join(",")
      : undefined,
  };
};
