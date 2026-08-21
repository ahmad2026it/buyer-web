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

export type BuyerBookingTerms = {
  title: string;
  intro: string;
  points: string[];
  footer: string;
  version: string;
  accepted: boolean;
  needsAcceptance: boolean;
  acceptedAt: string | null;
  acceptedTermsVersion: string | null;
  currentTermsVersion: string;
};

export type GetBuyerBookingTermsResponse = {
  success: boolean;
  status?: number;
  message?: string;
  data: BuyerBookingTerms;
};
