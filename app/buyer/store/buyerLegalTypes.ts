export type BuyerLegalDocument = {
  title: string;
  lastUpdated: string;
  content: string;
};

export type GetBuyerPrivacyPolicyResponse = {
  success: boolean;
  status?: number;
  message?: string;
  data: BuyerLegalDocument;
};
