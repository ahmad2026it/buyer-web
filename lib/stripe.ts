import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;
let loadedKey = "";

export const getStripePublishableKey = (override?: string): string =>
  override?.trim() || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || "";

export const getStripe = (publishableKey?: string): Promise<Stripe | null> => {
  const key = getStripePublishableKey(publishableKey);
  if (!key) return Promise.resolve(null);

  if (!stripePromise || loadedKey !== key) {
    loadedKey = key;
    stripePromise = loadStripe(key, {
      developerTools: {
        assistant: { enabled: false },
      },
    });
  }

  return stripePromise;
};
