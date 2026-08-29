export type BuyerBillingTransactionFavor = {
  id: number;
  title: string;
  type: string;
};

export type BuyerBillingTransactionSeller = {
  id: number;
  fullName: string;
  profileImage: string | null;
  profileImageUrl?: string | null;
};

export type BuyerBillingTransaction = {
  id: number;
  bookingId: number;
  favorId: number;
  buyerUserId: number;
  sellerUserId: number;
  stripePaymentIntentId: string | null;
  stripePayoutId: string | null;
  transType: string;
  amount: string;
  totalAmount: string;
  applicationFeeAmount: string;
  currency: string;
  status: string;
  paymentStatus: string;
  referenceNumber: string;
  createdAt: string;
  updatedAt: string;
  Favor: BuyerBillingTransactionFavor | null;
  seller: BuyerBillingTransactionSeller | null;
};

export type BuyerBillingPagination = {
  total: number;
  page: number;
  limit: number;
};

export type GetBuyerBillingHistoryParams = {
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type GetBuyerBillingHistoryResponse = {
  success: boolean;
  status?: number;
  message?: string;
  data: {
    transactions: BuyerBillingTransaction[];
    pagination: BuyerBillingPagination;
  };
};

export type BuyerChargePreviewAddOn = {
  index?: number;
  name?: string;
  title?: string;
  description?: string;
  label?: string;
  price?: number | string;
  amount?: number | string;
};

export type BuyerChargePreview = {
  favorId: number;
  favorType: string;
  selectedAddOnIndices: number[];
  selectedAddOns: BuyerChargePreviewAddOn[];
  orderSubtotal: number;
  buyerExtraAmount: number;
  sellerProcessingFeeShare: number;
  stripeProcessingFeeTotal: number;
  buyerChargeAmount: number;
  boostDiscountAmount: number;
  boostDiscountPercent: number | null;
  platformFee: number;
  sellerAmount: number;
  currency: string;
};

export type GetBuyerChargePreviewParams = {
  favorId: number;
  selectedAddOnIndices?: number[];
};

export type GetBuyerChargePreviewResponse = {
  success: boolean;
  status?: number;
  message?: string;
  data: BuyerChargePreview;
};
