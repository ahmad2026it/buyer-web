export type MarketplaceApiCategory = {
  id: string;
  label: string;
  slug: string;
  icon: string | null;
  colorCode: string | null;
};

export type MarketplaceCategoriesPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetMarketplaceCategoriesParams = {
  page?: number;
  limit?: number;
};

export type GetMarketplaceCategoriesResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    categories: MarketplaceApiCategory[];
    pagination: MarketplaceCategoriesPagination;
  };
};
