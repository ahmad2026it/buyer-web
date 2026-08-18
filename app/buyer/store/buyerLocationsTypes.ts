export type BuyerLocation = {
  id: number;
  userId: number;
  location: string;
  lat: string | number | null;
  lng: string | number | null;
  locationDetail: string | null;
  floor: string | null;
  label: string | null;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GetBuyerLocationsResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    locations: BuyerLocation[];
  };
};

export type GetBuyerLocationResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    location: BuyerLocation;
  };
};

export type CreateBuyerLocationRequest = {
  location: string;
  lat: number;
  lng: number;
  locationDetail?: string;
  label: string;
  isSelected?: boolean;
};

export type CreateBuyerLocationResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    location: BuyerLocation;
  };
};

export type UpdateBuyerLocationRequest = {
  id: number;
  location: string;
  lat: number;
  lng: number;
  locationDetail?: string;
  label: string;
  isSelected?: boolean;
};

export type UpdateBuyerLocationResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    location: BuyerLocation;
  };
};

export type DeleteBuyerLocationResponse = {
  success: boolean;
  status: number;
  message: string;
  data?: unknown;
};
