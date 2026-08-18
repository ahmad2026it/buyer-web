export type BuyerBillingTransactionFavor = {
  id: number;
  title: string;
  type: string;
};

export type BuyerBillingTransactionSeller = {
  id: number;
  fullName: string;
  profileImage: string | null;
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
