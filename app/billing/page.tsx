'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import { useGetBuyerBillingHistoryQuery } from '@/app/buyer/store/buyerBillingAPI';
import type { BuyerBillingTransaction } from '@/app/buyer/store/buyerBillingTypes';
import {
  useCreateStripeSetupIntentMutation,
  useGetBuyerStripeCardsQuery,
  useRemoveBuyerStripeCardMutation,
} from '@/app/buyer/store/buyerStripeAPI';
import type { StripeCard } from '@/app/buyer/store/buyerStripeTypes';
import { useAppSelector } from '@/store/hooks';
import { confirmAction, showSuccess } from '@/lib/swal';
import { showToast } from '@/lib/toast';

const AddPaymentMethodModal = dynamic(
  () => import('@/components/AddPaymentMethodModal'),
  { ssr: false },
);

const BRAND = '#A54AFF';
const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const PILL  = '9999px';
const PLACEHOLDER_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format&q=80';
const BILLING_HISTORY_LIMIT = 20;

type BillingStatus = 'Paid' | 'Pending' | 'Failed' | 'Canceled';

type Transaction = {
  id: number;
  invoice: string;
  amount: string;
  date: string;
  status: BillingStatus;
  refNumber: string;
  seller: string;
  sellerAvatar: string;
};

function formatInvoiceDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatInvoiceMonthYear(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatAmount(amount: string, currency: string): string {
  const value = Number(amount);
  const code = (currency || 'usd').toUpperCase();
  if (!Number.isFinite(value)) return amount;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(value);
  } catch {
    return `${code} ${value.toFixed(2)}`;
  }
}

function mapBillingStatus(status: string): BillingStatus {
  const key = status.toLowerCase();
  if (key === 'success' || key === 'paid' || key === 'completed') return 'Paid';
  if (key === 'canceled' || key === 'cancelled') return 'Canceled';
  if (key === 'pending' || key === 'processing') return 'Pending';
  return 'Failed';
}

function toBillingTransaction(item: BuyerBillingTransaction): Transaction {
  const title = item.Favor?.title || 'Booking';
  const monthYear = formatInvoiceMonthYear(item.createdAt);
  return {
    id: item.id,
    invoice: monthYear ? `${title} – ${monthYear}` : title,
    amount: formatAmount(item.totalAmount, item.currency),
    date: formatInvoiceDate(item.createdAt),
    status: mapBillingStatus(item.status || item.paymentStatus),
    refNumber: item.referenceNumber,
    seller: item.seller?.fullName || 'Seller',
    sellerAvatar: item.seller?.profileImage || PLACEHOLDER_AVATAR,
  };
}

const RECEIPT_ASCII_REPLACEMENTS: Record<string, string> = {
  '\u2013': '-',
  '\u2014': '-',
  '\u2018': "'",
  '\u2019': "'",
  '\u201C': '"',
  '\u201D': '"',
  '\u2022': '-',
  '\u00A0': ' ',
};

function toReceiptAscii(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, (char) => RECEIPT_ASCII_REPLACEMENTS[char] ?? '');
}

function toPdfString(value: string): string {
  const escaped = toReceiptAscii(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
  return `(${escaped})`;
}

function downloadPaymentReceipt(tx: Transaction): void {
  const rows: Array<[string, string]> = [
    ['Service', tx.invoice],
    ['Amount', tx.amount],
    ['Status', tx.status],
    ['Reference number', tx.refNumber],
    ['Payment date', tx.date],
    ['Service provider', tx.seller],
  ];

  const content = [
    'BT',
    '/F2 20 Tf',
    '0.647 0.29 1 rg',
    `50 740 Td ${toPdfString('WhoCan')} Tj`,
    '0 0 0 rg',
    '/F2 16 Tf',
    `0 -28 Td ${toPdfString('Payment Receipt')} Tj`,
    '/F1 11 Tf',
    '0.4 0.44 0.52 rg',
    `0 -18 Td ${toPdfString('Thank you for your payment.')} Tj`,
    '0.06 0.09 0.16 rg',
  ];

  rows.forEach(([label, value], index) => {
    content.push('/F1 10 Tf');
    content.push('0.4 0.44 0.52 rg');
    content.push(`${index === 0 ? '0 -36' : '0 -22'} Td ${toPdfString(label)} Tj`);
    content.push('/F2 12 Tf');
    content.push('0.06 0.09 0.16 rg');
    content.push(`0 -16 Td ${toPdfString(value)} Tj`);
  });
  content.push('ET');

  const stream = content.join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >> endobj',
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    '6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeRef = toReceiptAscii(tx.refNumber).replace(/[^\w.-]+/g, '-') || 'receipt';
  link.href = url;
  link.download = `receipt-${safeRef}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function StatusBadge({ status }: { status: BillingStatus }) {
  const map = {
    Paid:     { bg: '#ECFDF3', border: '#ABEFC6', color: '#067647', icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#067647" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    Pending:  { bg: '#FFFAEB', border: '#FEDF89', color: '#B54708', icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#B54708" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#B54708" strokeWidth="2" strokeLinecap="round"/></svg> },
    Failed:   { bg: '#FEF3F2', border: '#FECDCA', color: '#D92D20', icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#D92D20" strokeWidth="2.5" strokeLinecap="round"/></svg> },
    Canceled: { bg: '#F2F4F7', border: '#E4E7EC', color: '#475467', icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#475467" strokeWidth="2.5" strokeLinecap="round"/></svg> },
  };
  const s = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: PILL, padding: '2px 8px 2px 6px' }}>
      {s.icon}
      <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', fontWeight: 500, color: s.color }}>{status}</span>
    </span>
  );
}

function ReceiptModal({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const handleDownload = () => {
    try {
      downloadPaymentReceipt(tx);
    } catch {
      showToast('Could not download the receipt. Please try again.', 'error');
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 20px 64px rgba(16,24,40,0.18)', width: '100%', maxWidth: '440px', overflow: 'hidden' }}>

        {/* Modal header */}
        <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F4EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F2F4F7', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#667085" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ padding: '16px 24px 28px' }}>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '18px', color: '#101828', marginBottom: '4px' }}>Payment Receipt</h2>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085', marginBottom: '24px' }}>{tx.invoice}</p>

          {/* Amount block */}
          <div style={{ textAlign: 'center', padding: '20px', background: '#F9FAFB', borderRadius: '16px', marginBottom: '20px' }}>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#98A2B3', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tx.status === 'Paid' ? 'Total paid' : 'Amount'}</p>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '34px', color: '#101828', marginBottom: '10px' }}>{tx.amount}</p>
            <StatusBadge status={tx.status} />
          </div>

          {/* Detail rows */}
          {[
            { label: 'Reference number', value: tx.refNumber },
            { label: 'Payment date',     value: tx.date },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid #F2F4F7' : 'none' }}>
              <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085' }}>{row.label}</span>
              <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '13px', color: '#101828' }}>{row.value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F2F4F7' }}>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085' }}>Service provider</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={tx.sellerAvatar} alt={tx.seller} style={{ width: '24px', height: '24px', borderRadius: PILL, objectFit: 'cover' }} />
              <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '13px', color: '#101828' }}>{tx.seller}</span>
            </div>
          </div>

          {/* Download button */}
          <button
            type="button"
            onClick={handleDownload}
            style={{ marginTop: '20px', width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(165,74,255,0.25)', transition: 'opacity 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Download receipt
          </button>
        </div>
      </div>
    </div>
  );
}

type SetupIntentSession = {
  clientSecret: string;
  publishableKey?: string;
};

const CARD_BRAND_LABELS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  american_express: 'American Express',
  discover: 'Discover',
  diners: 'Diners Club',
  jcb: 'JCB',
  unionpay: 'UnionPay',
};

function formatCardBrand(brand: string) {
  const key = brand.toLowerCase();
  if (CARD_BRAND_LABELS[key]) return CARD_BRAND_LABELS[key];
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}

function formatCardExpiry(month: number, year: number) {
  return `${String(month).padStart(2, '0')}/${year}`;
}

function CardBrandMark({ brand }: { brand: string }) {
  const key = brand.toLowerCase();
  const mark =
    key === 'visa' ? { label: 'VISA', color: '#1A1F71', size: '13px' }
    : key === 'mastercard' || key === 'master' ? { label: 'MC', color: '#EB001B', size: '13px' }
    : key === 'amex' || key === 'american_express' ? { label: 'AMEX', color: '#006FCF', size: '11px' }
    : key === 'discover' ? { label: 'DISC', color: '#FF6000', size: '11px' }
    : { label: formatCardBrand(brand).slice(0, 4).toUpperCase(), color: '#344054', size: '11px' };

  return (
    <div style={{ background: '#fff', border: '1px solid #F2F4F7', borderRadius: '8px', width: '58px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 4px rgba(16,24,40,0.06)' }}>
      <span style={{ fontFamily: 'Arial,sans-serif', fontWeight: 900, fontSize: mark.size, color: mark.color, letterSpacing: '-0.02em' }}>{mark.label}</span>
    </div>
  );
}

function SavedCardRow({
  card,
  isRemoving,
  isDisabled,
  onRemove,
}: {
  card: StripeCard;
  isRemoving: boolean;
  isDisabled: boolean;
  onRemove: (card: StripeCard) => void;
}) {
  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid #F2F4F7', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
      <CardBrandMark brand={card.brand} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px', color: '#344054' }}>
            {formatCardBrand(card.brand)} ending in {card.last4}
          </p>
          {card.is_default && (
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '11px', fontWeight: 600, color: '#027A48', background: '#ECFDF3', border: '1px solid #ABEFC6', borderRadius: PILL, padding: '1px 8px' }}>Default</span>
          )}
        </div>
        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085' }}>
          Expiry {formatCardExpiry(card.exp_month, card.exp_year)}
        </p>
      </div>
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => onRemove(card)}
        style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '13px', color: isDisabled ? '#98A2B3' : '#D92D20', background: '#fff', border: '1px solid #FECDCA', borderRadius: PILL, padding: '8px 16px', cursor: isDisabled ? 'not-allowed' : 'pointer', flexShrink: 0, boxShadow: '0 1px 2px rgba(16,24,40,0.05)', transition: 'all 0.15s', opacity: isDisabled ? 0.7 : 1 }}
        onMouseEnter={e => { if (!isDisabled) { const el = e.currentTarget as HTMLElement; el.style.background = '#FEF3F2'; } }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#fff'; }}
      >
        {isRemoving ? 'Removing…' : 'Remove'}
      </button>
    </div>
  );
}

function SavedCardSkeleton() {
  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid #F2F4F7', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '58px', height: '40px', borderRadius: '8px', background: '#F2F4F7', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '160px', height: '14px', borderRadius: '4px', background: '#F2F4F7', marginBottom: '8px' }} />
        <div style={{ width: '90px', height: '12px', borderRadius: '4px', background: '#F2F4F7' }} />
      </div>
    </div>
  );
}

function BillingRowSkeleton() {
  return (
    <div className="billing-row" style={{ display: 'grid', gridTemplateColumns: '1fr 110px 140px 100px 52px', padding: '0 24px', borderBottom: '1px solid #F2F4F7' }}>
      <div className="billing-invoice" style={{ padding: '18px 0', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '220px', height: '14px', borderRadius: '4px', background: '#F2F4F7' }} />
      </div>
      <div className="billing-amount" style={{ padding: '18px 0', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '56px', height: '14px', borderRadius: '4px', background: '#F2F4F7' }} />
      </div>
      <div className="billing-date" style={{ padding: '18px 0', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '88px', height: '14px', borderRadius: '4px', background: '#F2F4F7' }} />
      </div>
      <div className="billing-status" style={{ padding: '18px 0', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '58px', height: '22px', borderRadius: PILL, background: '#F2F4F7' }} />
      </div>
      <div className="billing-action" style={{ padding: '18px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#F2F4F7' }} />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [setupSession, setSetupSession] = useState<SetupIntentSession | null>(null);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [createSetupIntent, { isLoading: isCreatingIntent }] = useCreateStripeSetupIntentMutation();
  const [removeCard] = useRemoveBuyerStripeCardMutation();
  const [removingCardId, setRemovingCardId] = useState<string | null>(null);
  const {
    data: cardsResponse,
    isLoading: isLoadingCards,
    isError: isCardsError,
    refetch: refetchCards,
  } = useGetBuyerStripeCardsQuery(undefined, { skip: !token });
  const {
    data: billingResponse,
    isLoading: isLoadingBilling,
    isError: isBillingError,
    refetch: refetchBilling,
  } = useGetBuyerBillingHistoryQuery(
    { page: 1, limit: BILLING_HISTORY_LIMIT },
    { skip: !token },
  );

  const cards = [...(cardsResponse?.data?.cards ?? [])].sort(
    (a, b) => Number(b.is_default) - Number(a.is_default),
  );
  const transactions = useMemo(
    () => (billingResponse?.data?.transactions ?? []).map(toBillingTransaction),
    [billingResponse],
  );
  const transactionTotal = billingResponse?.data?.pagination?.total ?? 0;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('redirect_status');
    if (!status) return;

    if (status === 'succeeded') {
      showToast('Payment method saved.', 'success');
      void refetchCards();
    } else if (status === 'failed') {
      showToast('Could not save the payment method. Please try again.', 'error');
    }

    window.history.replaceState({}, '', window.location.pathname);
  }, [refetchCards]);

  const handleAddPaymentMethod = async () => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }

    try {
      const response = await createSetupIntent().unwrap();
      const clientSecret = response.data?.client_secret;
      if (!response.success || !clientSecret) {
        showToast(response.message || 'Could not start card setup. Please try again.', 'error');
        return;
      }

      setSetupSession({
        clientSecret,
        publishableKey: response.data.publishableKey || response.data.publishable_key,
      });
    } catch {
      // axios interceptor already toasts API errors
    }
  };

  const handleCardSaved = async () => {
    setSetupSession(null);
    await refetchCards();
    await showSuccess('Card added', 'Your payment method has been saved.');
  };

  const handleRemoveCard = async (card: StripeCard) => {
    const label = `${formatCardBrand(card.brand)} ending in ${card.last4}`;
    const confirmed = await confirmAction({
      title: 'Remove card?',
      confirmText: 'Remove',
      text: `Are you sure you want to remove ${label}? This action cannot be undone.`,
    });
    if (!confirmed) return;

    setRemovingCardId(card.id);
    try {
      const response = await removeCard({ payment_method_id: card.id }).unwrap();
      if (!response.success) {
        showToast(response.message || 'Could not remove this card. Please try again.', 'error');
        return;
      }
      showToast('Card removed.', 'success');
    } catch {
      // axios interceptor already toasts API errors
    } finally {
      setRemovingCardId(null);
    }
  };

  return (
    <>
      <Navbar />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Log in to add a payment method."
        />
      )}
      {setupSession && (
        <AddPaymentMethodModal
          clientSecret={setupSession.clientSecret}
          publishableKey={setupSession.publishableKey}
          billingName={user?.fullName || undefined}
          billingEmail={user?.email || undefined}
          onClose={() => setSetupSession(null)}
          onSuccess={handleCardSaved}
        />
      )}
      {receiptTx && <ReceiptModal tx={receiptTx} onClose={() => setReceiptTx(null)} />}

      <main className="app-page" style={{ minHeight: '100dvh', background: '#F9FAFB' }}>

        {/* Header band */}
        <div className="app-page-band" style={{ background: '#fff', borderBottom: '1px solid #EAECF0', paddingTop: '104px', paddingBottom: '32px' }}>
          <div className="app-page-inner" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 500, color: '#667085', textDecoration: 'none', marginBottom: '16px', transition: 'color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = BRAND; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#667085'; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back
            </a>
            <div className="app-page-head" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 className="app-page-title" style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '28px', color: '#101828', marginBottom: '4px' }}>Billing & Payments</h1>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '15px', color: '#667085' }}>Manage your billing and payment details.</p>
              </div>
              <button
                type="button"
                disabled={isCreatingIntent}
                onClick={() => { void handleAddPaymentMethod(); }}
                style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '11px 22px', cursor: isCreatingIntent ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(165,74,255,0.25)', transition: 'opacity 0.15s', opacity: isCreatingIntent ? 0.75 : 1 }}
                onMouseEnter={e => { if (!isCreatingIntent) (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = isCreatingIntent ? '0.75' : '1'; }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
                {isCreatingIntent ? 'Starting…' : 'Add payment method'}
              </button>
            </div>
          </div>
        </div>

        <div className="app-page-body" style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* ── Payment Methods ── */}
          <div style={{ background: '#fff', border: '1px solid #EAECF0', borderRadius: '16px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)', overflow: 'hidden' }}>
            <div className="app-panel-pad" style={{ padding: '20px 24px', borderBottom: '1px solid #EAECF0' }}>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '17px', color: '#101828', marginBottom: '2px' }}>Payment methods</h2>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085' }}>Cards saved to your account.</p>
            </div>

            {!token ? (
              <div style={{ padding: '28px 24px', borderBottom: '1px solid #F2F4F7' }}>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#667085', margin: 0 }}>
                  Log in to view your saved cards.
                </p>
              </div>
            ) : isLoadingCards ? (
              <>
                <SavedCardSkeleton />
                <SavedCardSkeleton />
              </>
            ) : isCardsError ? (
              <div style={{ padding: '28px 24px', borderBottom: '1px solid #F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#667085', margin: 0 }}>
                  Could not load your payment methods.
                </p>
                <button
                  type="button"
                  onClick={() => { void refetchCards(); }}
                  style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '13px', color: BRAND, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Try again
                </button>
              </div>
            ) : cards.length === 0 ? (
              <div style={{ padding: '28px 24px', borderBottom: '1px solid #F2F4F7' }}>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#667085', margin: 0 }}>
                  No cards saved yet.
                </p>
              </div>
            ) : (
              cards.map((card) => (
                <SavedCardRow
                  key={card.id}
                  card={card}
                  isRemoving={removingCardId === card.id}
                  isDisabled={removingCardId !== null}
                  onRemove={(selected) => { void handleRemoveCard(selected); }}
                />
              ))
            )}

            {/* Add another */}
            <div style={{ padding: '16px 24px' }}>
              <button
                type="button"
                disabled={isCreatingIntent}
                onClick={() => { void handleAddPaymentMethod(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px', color: BRAND, background: 'none', border: 'none', cursor: isCreatingIntent ? 'not-allowed' : 'pointer', padding: 0, transition: 'opacity 0.15s', opacity: isCreatingIntent ? 0.6 : 1 }}
                onMouseEnter={e => { if (!isCreatingIntent) (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = isCreatingIntent ? '0.6' : '1'; }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round"/></svg>
                {isCreatingIntent ? 'Starting…' : 'Add payment method'}
              </button>
            </div>
          </div>

          {/* ── Billing History ── */}
          <div style={{ background: '#fff', border: '1px solid #EAECF0', borderRadius: '16px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)', overflow: 'hidden' }}>
            <div className="app-panel-pad" style={{ padding: '20px 24px', borderBottom: '1px solid #EAECF0' }}>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '17px', color: '#101828', marginBottom: '2px' }}>Billing history</h2>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085' }}>
                {!token
                  ? 'Log in to view your transactions'
                  : isLoadingBilling
                    ? 'Loading transactions…'
                    : `${transactionTotal} ${transactionTotal === 1 ? 'transaction' : 'transactions'}`}
              </p>
            </div>

            {/* Table header */}
            <div className="billing-table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 110px 140px 100px 52px', background: '#F9FAFB', borderBottom: '1px solid #EAECF0', padding: '0 24px' }}>
              {['Invoice', 'Amount', 'Date', 'Status', ''].map(h => (
                <div key={h} style={{ padding: '11px 0', fontFamily: 'Poppins,sans-serif', fontSize: '12px', fontWeight: 500, color: '#475467' }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {!token ? (
              <div style={{ padding: '28px 24px' }}>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#667085', margin: 0 }}>
                  Log in to view your billing history.
                </p>
              </div>
            ) : isLoadingBilling ? (
              <>
                <BillingRowSkeleton />
                <BillingRowSkeleton />
                <BillingRowSkeleton />
              </>
            ) : isBillingError ? (
              <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#667085', margin: 0 }}>
                  Could not load your billing history.
                </p>
                <button
                  type="button"
                  onClick={() => { void refetchBilling(); }}
                  style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '13px', color: BRAND, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Try again
                </button>
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ padding: '28px 24px' }}>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#667085', margin: 0 }}>
                  No transactions yet.
                </p>
              </div>
            ) : (
              transactions.map(tx => (
              <div key={tx.id}
                className="billing-row"
                onClick={() => setReceiptTx(tx)}
                style={{ display: 'grid', gridTemplateColumns: '1fr 110px 140px 100px 52px', padding: '0 24px', borderBottom: '1px solid #F2F4F7', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <div className="billing-invoice" style={{ padding: '18px 0', fontFamily: 'Poppins,sans-serif', fontWeight: 500, fontSize: '14px', color: '#101828', display: 'flex', alignItems: 'center' }}>{tx.invoice}</div>
                <div className="billing-amount" style={{ padding: '18px 0', fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#475467', display: 'flex', alignItems: 'center' }}>{tx.amount}</div>
                <div className="billing-date" style={{ padding: '18px 0', fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#475467', display: 'flex', alignItems: 'center' }}>{tx.date}</div>
                <div className="billing-status" style={{ padding: '18px 0', display: 'flex', alignItems: 'center' }}><StatusBadge status={tx.status} /></div>
                <div className="billing-action" style={{ padding: '18px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button onClick={e => { e.stopPropagation(); setReceiptTx(tx); }}
                    style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F4EBFF'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
