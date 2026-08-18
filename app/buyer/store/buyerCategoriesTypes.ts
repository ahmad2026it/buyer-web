export type BuyerCategory = {
  id: number;
  name: string;
  icon: string;
  colorCode: string;
  createdAt: string;
  updatedAt: string;
};

export type GetBuyerCategoriesParams = {
  search?: string;
};

export type GetBuyerCategoriesResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    categories: BuyerCategory[];
  };
};

export type BuyerSubCategory = {
  id: number;
  categoryId: number;
  name: string;
  icon: string | null;
  colorCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetBuyerSubCategoriesResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    subCategories: BuyerSubCategory[];
  };
};
