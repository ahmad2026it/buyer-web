export type BuyerSellerDetail = {
  sellerId: number;
  profileImageUrl: string | null;
  name: string;
  isPro: boolean;
  isTeam: boolean;
  averageRating: number | null;
  totalReviews: number;
  distanceAway: string | null;
  distanceMiles: number;
  favorsCompleted: number;
  location: string | null;
  responseTime: string | null;
  isOnline: boolean;
};

export type BuyerSellerFavor = {
  favorId: number;
  favorImageUrl: string | null;
  title: string;
  averageRating: number | null;
  totalReviews: number;
  startingPrice: string | number;
};

export type BuyerBestProvider = {
  providerId: number;
  profileImageUrl: string | null;
  isOnline: boolean;
  isTeam: boolean;
  isPro: boolean;
  name: string;
  averageRating: number | null;
  totalReviews: number;
  distanceAway: string | null;
  distanceMiles: number;
};

export type BuyerRecommendedFavorSeller = {
  sellerId: number;
  profileImageUrl: string | null;
  name: string;
  isTeam: boolean;
};

export type BuyerRecommendedFavor = {
  favorId: number;
  favorImageUrl: string | null;
  title: string;
  sellerInfo: BuyerRecommendedFavorSeller | null;
  averageRating: number | null;
  totalReviews: number;
  distanceAway: string | null;
  distanceMiles: number;
  startingPrice: string | number;
};

export type BuyerSeller = {
  id?: number;
  sellerId?: number;
  name?: string;
  fullName?: string;
  profileImage?: string | null;
  profileImageUrl?: string | null;
  isPro?: boolean;
  isTeam?: boolean;
  averageRating?: number | null;
  totalReviews?: number;
  reviewCount?: number;
  favorsCompleted?: number;
  isOnline?: boolean;
};

export type GetBuyerSellersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type BuyerSellersPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetBuyerSellersResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    sellers: BuyerSeller[];
    pagination?: BuyerSellersPagination;
  };
};

export type GetBuyerSellerByIdResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    seller: BuyerSellerDetail;
    sellerFavors: BuyerSellerFavor[];
    bestProviders: BuyerBestProvider[];
    recommendedFavors: BuyerRecommendedFavor[];
  };
};
