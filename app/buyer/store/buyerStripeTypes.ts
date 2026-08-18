export type CreateStripeSetupIntentResponse = {
  success: boolean;
  status?: number;
  message: string;
  data: {
    stripeCustomerId: string;
    client_secret: string;
    ephemeral_key: string;
    publishableKey?: string;
    publishable_key?: string;
  };
};

export type StripeCard = {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
};

export type GetBuyerStripeCardsResponse = {
  success: boolean;
  status?: number;
  message: string;
  data: {
    cards: StripeCard[];
  };
};

export type RemoveBuyerStripeCardRequest = {
  payment_method_id: string;
};

export type RemoveBuyerStripeCardResponse = {
  success: boolean;
  status?: number;
  message: string;
  data?: unknown;
};
