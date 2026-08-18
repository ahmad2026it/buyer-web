'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { getStripe, getStripePublishableKey } from '@/lib/stripe';

const BRAND = '#A54AFF';
const GRAD = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const PILL = '9999px';

type AddPaymentMethodModalProps = {
  clientSecret: string;
  publishableKey?: string;
  billingName?: string;
  billingEmail?: string;
  onClose: () => void;
  onSuccess: () => void;
};

const appearance: StripeElementsOptions['appearance'] = {
  theme: 'stripe',
  variables: {
    colorPrimary: BRAND,
    colorText: '#101828',
    colorTextSecondary: '#667085',
    colorDanger: '#D92D20',
    fontFamily: 'Poppins, sans-serif',
    borderRadius: '12px',
    spacingUnit: '4px',
  },
};

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="#667085" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke={BRAND} strokeWidth="2" />
      <path d="M2 10h20" stroke={BRAND} strokeWidth="2" />
    </svg>
  );
}

function AddCardForm({
  billingName,
  billingEmail,
  onClose,
  onSuccess,
}: Omit<AddPaymentMethodModalProps, 'clientSecret' | 'publishableKey'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || submitting) return;

    setFormError('');
    setSubmitting(true);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/billing`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setFormError(error.message || 'Could not save this card. Please try again.');
      setSubmitting(false);
      return;
    }

    if (setupIntent && (setupIntent.status === 'succeeded' || setupIntent.status === 'processing')) {
      onSuccess();
      return;
    }

    setFormError('Could not save this card. Please try again.');
    setSubmitting(false);
  };

  const canSubmit = Boolean(stripe && elements && ready) && !submitting;

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ minHeight: 120, position: 'relative' }}>
        {!ready && (
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#667085', marginBottom: 12 }}>
            Loading secure card form…
          </p>
        )}
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            layout: 'tabs',
            wallets: { applePay: 'never', googlePay: 'never' },
            defaultValues: {
              billingDetails: {
                name: billingName,
                email: billingEmail,
              },
            },
          }}
        />
      </div>

      {formError && (
        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#D92D20', marginTop: 12 }}>
          {formError}
        </p>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          style={{
            flex: 1,
            fontFamily: 'Poppins,sans-serif',
            fontWeight: 600,
            fontSize: 14,
            color: '#344054',
            background: '#fff',
            border: '1px solid #D0D5DD',
            borderRadius: PILL,
            padding: 12,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            flex: 1,
            fontFamily: 'Poppins,sans-serif',
            fontWeight: 700,
            fontSize: 14,
            color: '#fff',
            background: GRAD,
            border: 'none',
            borderRadius: PILL,
            padding: 12,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            opacity: canSubmit ? 1 : 0.65,
            boxShadow: '0 4px 12px rgba(165,74,255,0.25)',
          }}
        >
          {submitting ? 'Saving…' : 'Save card'}
        </button>
      </div>
    </form>
  );
}

export default function AddPaymentMethodModal({
  clientSecret,
  publishableKey,
  billingName,
  billingEmail,
  onClose,
  onSuccess,
}: AddPaymentMethodModalProps) {
  const key = getStripePublishableKey(publishableKey);
  const options = useMemo<StripeElementsOptions>(
    () => ({ clientSecret, appearance }),
    [clientSecret],
  );

  return (
    <div
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(16,24,40,0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={event => event.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 20px 64px rgba(16,24,40,0.18)',
          width: '100%',
          maxWidth: 440,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#F4EBFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CardIcon />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#F2F4F7',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={{ padding: '16px 24px 28px' }}>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 4 }}>
            Add payment method
          </h2>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#667085', marginBottom: 20 }}>
            Card details are encrypted and sent directly to Stripe.
          </p>

          {key ? (
            <Elements stripe={getStripe(key)} options={options}>
              <AddCardForm
                billingName={billingName}
                billingEmail={billingEmail}
                onClose={onClose}
                onSuccess={onSuccess}
              />
            </Elements>
          ) : (
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#D92D20' }}>
              Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
