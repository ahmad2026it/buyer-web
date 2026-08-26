'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import FavorImage, { pickFavorImage } from '@/components/FavorImage';
import {
  useAcceptBuyerCustomFavorRequestMutation,
  useDeleteBuyerCustomFavorMutation,
  useGetBuyerCustomFavorByIdQuery,
  useRejectBuyerCustomFavorRequestMutation,
} from '@/app/buyer/store/buyerCustomFavorsAPI';
import {
  formatCustomFavorBudget,
  formatCustomFavorCategory,
  formatCustomFavorDueDate,
  formatCustomFavorTime,
  getCustomFavorLocationLabel,
  resolveCustomFavorStatus,
  type BuyerCustomFavor,
  type BuyerCustomFavorRequest,
} from '@/app/buyer/store/buyerCustomFavorsTypes';
import { useGetBuyerChargePreviewQuery } from '@/app/buyer/store/buyerBillingAPI';
import type { BuyerChargePreviewAddOn } from '@/app/buyer/store/buyerBillingTypes';
import {
  useCreateStripeSetupIntentMutation,
  useGetBuyerStripeCardsQuery,
} from '@/app/buyer/store/buyerStripeAPI';
import { useAppSelector } from '@/store/hooks';
import { confirmDelete, showSuccess } from '@/lib/swal';
import { showToast } from '@/lib/toast';

const AddPaymentMethodModal = dynamic(
  () => import('@/components/AddPaymentMethodModal'),
  { ssr: false },
);

const BRAND = '#A54AFF';
const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const PILL  = '9999px';
const FONT  = 'Poppins, sans-serif';

type FavorView = {
  id: number;
  title: string;
  category: string;
  budget: string;
  dueDate: string;
  time: string;
  location: string;
  description: string;
  image: string | null;
  photos: string[];
};

type RequestAddOn = {
  label: string;
  price: number;
};

type RequestItem = {
  id: number;
  sellerId: number;
  name: string;
  avatar: string | null;
  badge?: 'Pro' | 'Team';
  distance?: string;
  shortText: string;
  fullText: string;
  price: number;
  sellerAmount: number;
  platformFee: number;
  totalPrice: number;
  boostDiscount: number;
  addOns: RequestAddOn[];
  selectedAddOnIndices: number[];
};

const readMoney = (...values: unknown[]): number => {
  for (const value of values) {
    if (value === undefined || value === null || value === '') continue;
    const amount = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
    if (Number.isFinite(amount)) return amount;
  }
  return 0;
};

const formatMoney = (value: number): string =>
  Number.isFinite(value) ? `$${value.toFixed(2)}` : '$0.00';

const parseRequestAddOns = (items: unknown[] | undefined): RequestAddOn[] => {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => {
    if (typeof item === 'string') return { label: item, price: 0 };
    if (typeof item === 'number') return { label: `Add-on ${index + 1}`, price: item };
    if (item && typeof item === 'object') {
      const addon = item as Record<string, unknown>;
      return {
        label: String(addon.label || addon.name || addon.title || addon.description || `Add-on ${index + 1}`),
        price: readMoney(addon.price, addon.amount),
      };
    }
    return { label: `Add-on ${index + 1}`, price: 0 };
  });
};

const parseSelectedAddOnIndices = (items: unknown[] | undefined): number[] => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const indices: number[] = [];
  for (const item of items) {
    if (typeof item === 'number' && Number.isInteger(item) && item >= 0) {
      indices.push(item);
      continue;
    }
    if (item && typeof item === 'object') {
      const rec = item as Record<string, unknown>;
      const raw = rec.index ?? rec.addOnIndex ?? rec.add_on_index;
      const parsed = typeof raw === 'number' ? raw : Number(raw);
      if (Number.isInteger(parsed) && parsed >= 0) {
        indices.push(parsed);
        continue;
      }
    }
    return [];
  }
  return indices;
};

const previewAddOnLabel = (item: BuyerChargePreviewAddOn, index: number): string =>
  item.name || item.title || item.description || item.label || `Add-on ${index + 1}`;

function toFavorView(favor: BuyerCustomFavor): FavorView {
  const photos = (favor.images ?? []).filter(Boolean);
  return {
    id: favor.id,
    title: favor.title,
    category: formatCustomFavorCategory(favor.type),
    budget: formatCustomFavorBudget(favor.budget),
    dueDate: formatCustomFavorDueDate(favor.dateTime),
    time: formatCustomFavorTime(favor.dateTime),
    location: getCustomFavorLocationLabel(favor),
    description: favor.description || 'No description provided.',
    image: pickFavorImage(photos),
    photos,
  };
}

function toRequestItem(item: BuyerCustomFavorRequest): RequestItem {
  const details = item.details?.trim() || 'No additional details provided.';
  const rec = item as BuyerCustomFavorRequest & Record<string, unknown>;
  const sellerAmount = readMoney(rec.sellerAmount, rec.seller_amount);
  const platformFee = readMoney(rec.platformFeeAmount, rec.platform_fee_amount, rec.platformFee, rec.serviceFee);
  const totalPrice = readMoney(rec.totalPrice, rec.total_price);
  return {
    id: item.id,
    sellerId: item.seller?.id ?? item.sellerUserId,
    name: item.seller?.fullName || 'Seller',
    avatar: item.seller?.profileImage ?? null,
    shortText: details,
    fullText: details,
    price: totalPrice,
    sellerAmount,
    platformFee,
    totalPrice,
    boostDiscount: readMoney(rec.boostDiscountAmount, rec.boost_discount_amount),
    addOns: parseRequestAddOns(item.selectedAddOns),
    selectedAddOnIndices: parseSelectedAddOnIndices(item.selectedAddOns),
  };
}

function CardIcon({ brand }: { brand: string }) {
  const key = brand.toLowerCase();
  if (key === 'visa') {
    return (
      <div style={{ width: 38, height: 26, borderRadius: 5, background: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 11, color: '#fff', letterSpacing: '0.03em' }}>VISA</span>
      </div>
    );
  }
  if (key === 'mastercard' || key === 'master') {
    return (
      <div style={{ width: 38, height: 26, borderRadius: 5, background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#EB001B', position: 'absolute', left: 6 }} />
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#F79E1B', position: 'absolute', left: 16, opacity: 0.9 }} />
      </div>
    );
  }
  if (key === 'amex' || key === 'american_express') {
    return (
      <div style={{ width: 38, height: 26, borderRadius: 5, background: '#006FCF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 8, color: '#fff', letterSpacing: '0.02em' }}>AMEX</span>
      </div>
    );
  }
  return (
    <div style={{ width: 38, height: 26, borderRadius: 5, background: '#344054', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 8, color: '#fff' }}>{brand.slice(0, 4).toUpperCase()}</span>
    </div>
  );
}

function SellerAvatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
      />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#F2F4F7', border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size * 0.42} height={size * 0.42} viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="7" r="4" stroke="#98A2B3" strokeWidth="2"/>
      </svg>
    </div>
  );
}

function SectionCard({ title, children, style }: { title?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: 24, ...style }}>
      {title && <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: '#101828', marginBottom: 16 }}>{title}</h3>}
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #F2F4F7' }}>
      <span style={{ fontFamily: FONT, fontSize: 13, color: '#667085', flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#101828', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

/* ── Request card (in side panel) ── */
function RequestCard({ req, onView }: { req: RequestItem; onView: (r: RequestItem) => void }) {
  return (
    <div
      onClick={() => onView(req)}
      style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 16, padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = BRAND; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(165,74,255,0.12)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EAECF0'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <SellerAvatar src={req.avatar} name={req.name} size={44} />
          <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#22C55E', border: '1.5px solid #fff' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#101828' }}>{req.name}</span>
            {req.badge && (
              <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#fff', background: req.badge === 'Pro' ? '#A54AFF' : '#344054', borderRadius: PILL, padding: '2px 8px' }}>{req.badge}</span>
            )}
          </div>
          {req.distance && (
            <p style={{ fontFamily: FONT, fontSize: 12, color: '#DC6803', fontWeight: 500, marginTop: 2 }}>{req.distance}</p>
          )}
        </div>
      </div>
      {/* Text */}
      <p style={{ fontFamily: FONT, fontSize: 13, color: '#344054', lineHeight: 1.65, whiteSpace: 'pre-line', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {req.shortText}
      </p>
    </div>
  );
}

/* ── Request detail modal ── */
function RequestModal({ req, onClose, onHire, onDecline }: { req: RequestItem; onClose: () => void; onHire: (r: RequestItem) => void; onDecline: (r: RequestItem) => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(16,24,40,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(16,24,40,0.18)' }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
          <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 20, color: '#101828' }}>Request</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: '#F2F4F7', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#344054" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {/* Profile row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <SellerAvatar src={req.avatar} name={req.name} size={56} />
              <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: '#101828' }}>{req.name}</span>
                {req.badge && (
                  <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#fff', background: req.badge === 'Pro' ? '#A54AFF' : '#344054', borderRadius: PILL, padding: '2px 8px' }}>{req.badge}</span>
                )}
              </div>
              {req.distance && (
                <p style={{ fontFamily: FONT, fontSize: 13, color: '#DC6803', fontWeight: 500, marginTop: 3 }}>{req.distance}</p>
              )}
            </div>
          </div>

          <a href={`/seller/${req.sellerId}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontWeight: 700, fontSize: 15, color: BRAND, textDecoration: 'none', marginBottom: 18 }}>
            View profile
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7v10" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>

          {/* Divider */}
          <div style={{ height: 1, background: '#F2F4F7', marginBottom: 18 }} />

          {/* Full description */}
          <p style={{ fontFamily: FONT, fontSize: 14, color: '#344054', lineHeight: 1.75, whiteSpace: 'pre-line', marginBottom: 28 }}>
            {req.fullText}
          </p>

          {/* Price offered */}
          <div style={{ background: '#F9F5FF', border: '1px solid rgba(165,74,255,0.15)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: FONT, fontSize: 14, color: '#667085', fontWeight: 500 }}>Offered price</span>
            <span style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: BRAND }}>{formatMoney(req.totalPrice)}</span>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => onDecline(req)}
              style={{ flex: 1, fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#D92D20', background: '#FEF3F2', border: 'none', borderRadius: PILL, padding: 14, cursor: 'pointer', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              Decline
            </button>
            <button
              onClick={() => onHire(req)}
              style={{ flex: 1, fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(165,74,255,0.3)', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              Hire seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DECLINE_REASONS = ['Price too high', 'Seller not a good fit', 'Changed my mind', 'Other'];

function DeclineModal({
  req,
  favorId,
  onClose,
  onSuccess,
}: {
  req: RequestItem;
  favorId: number;
  onClose: () => void;
  onSuccess: (sellerName: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [rejectRequest, { isLoading: isRejecting }] = useRejectBuyerCustomFavorRequestMutation();
  const cancelReason = (reason === 'Other' ? note : reason).trim();
  const canSubmit = Boolean(cancelReason) && !isRejecting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      showToast('Please tell us why you are declining this request.', 'error');
      return;
    }

    try {
      const response = await rejectRequest({
        booking_id: req.id,
        cancel_reason: cancelReason,
        favorId,
      }).unwrap();

      if (response.success === false) {
        showToast(response.message || 'Could not decline this request. Please try again.', 'error');
        return;
      }

      onSuccess(req.name);
    } catch {
      // axios interceptor already toasts API errors
    }
  };

  return (
    <div
      onClick={() => { if (!isRejecting) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(16,24,40,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(16,24,40,0.18)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F2F4F7' }}>
          <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 20, color: '#101828' }}>Decline request</h2>
          <button
            onClick={onClose}
            disabled={isRejecting}
            style={{ width: 32, height: 32, borderRadius: '50%', background: '#F2F4F7', border: 'none', cursor: isRejecting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isRejecting ? 0.6 : 1 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#344054" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', lineHeight: 1.65, marginBottom: 18 }}>
            Tell {req.name} why you are declining this offer. This reason will be sent with the rejection.
          </p>

          <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 10 }}>Select reason</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {DECLINE_REASONS.map((item) => {
              const selected = reason === item;
              return (
                <button
                  key={item}
                  type="button"
                  disabled={isRejecting}
                  onClick={() => setReason(item)}
                  style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: selected ? '#fff' : '#344054', background: selected ? BRAND : '#F9FAFB', border: `1.5px solid ${selected ? BRAND : '#EAECF0'}`, borderRadius: PILL, padding: '8px 14px', cursor: isRejecting ? 'not-allowed' : 'pointer' }}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {reason === 'Other' && (
            <>
              <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 8 }}>Type your reason</p>
              <textarea
                value={note}
                disabled={isRejecting}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Price too high"
                style={{ width: '100%', minHeight: 90, fontFamily: FONT, fontSize: 14, color: '#101828', border: '1px solid #D0D5DD', borderRadius: 12, padding: '12px 14px', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 20, display: 'block' }}
                onFocus={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = BRAND; el.style.boxShadow = '0 0 0 4px rgba(165,74,255,0.12)'; }}
                onBlur={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#D0D5DD'; el.style.boxShadow = 'none'; }}
              />
            </>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isRejecting}
              style={{ flex: 1, fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#344054', background: '#fff', border: '1.5px solid #D0D5DD', borderRadius: PILL, padding: 14, cursor: isRejecting ? 'not-allowed' : 'pointer', opacity: isRejecting ? 0.6 : 1 }}
            >
              Keep request
            </button>
            <button
              type="button"
              onClick={() => { void handleSubmit(); }}
              disabled={!canSubmit}
              style={{ flex: 1, fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#fff', background: '#D92D20', border: 'none', borderRadius: PILL, padding: 14, cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.5 }}
            >
              {isRejecting ? 'Declining…' : 'Decline'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Payment modal ── */
function PaymentModal({
  req,
  favor,
  favorId,
  onClose,
  onSuccess,
}: {
  req: RequestItem;
  favor: FavorView;
  favorId: number;
  onClose: () => void;
  onSuccess: (sellerName: string) => void;
}) {
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const holderName = user?.fullName || 'Cardholder';

  const {
    data: chargePreviewResponse,
    isLoading: isLoadingChargePreview,
  } = useGetBuyerChargePreviewQuery(
    { favorId, selectedAddOnIndices: req.selectedAddOnIndices },
    { skip: !token || !Number.isFinite(favorId) || favorId <= 0 },
  );

  const chargePreview = chargePreviewResponse?.data;
  const sellerOffer = readMoney(chargePreview?.orderSubtotal, req.sellerAmount);
  const serviceFee = readMoney(chargePreview?.buyerExtraAmount, req.platformFee);
  const boostDiscount = readMoney(chargePreview?.boostDiscountAmount, req.boostDiscount);
  const total = readMoney(chargePreview?.buyerChargeAmount, req.totalPrice);
  const previewAddOns = chargePreview?.selectedAddOns ?? [];
  const addOns = previewAddOns.length
    ? previewAddOns.map((addon, index) => ({
        label: previewAddOnLabel(addon, index),
        price: readMoney(addon.price, addon.amount),
      }))
    : req.addOns;

  const [cardId, setCardId] = useState('');
  const [setupSession, setSetupSession] = useState<{ clientSecret: string; publishableKey?: string } | null>(null);

  const [createSetupIntent, { isLoading: isCreatingIntent }] = useCreateStripeSetupIntentMutation();
  const [acceptRequest, { isLoading: isHiring }] = useAcceptBuyerCustomFavorRequestMutation();
  const {
    data: cardsResponse,
    isLoading: isLoadingCards,
    isError: isCardsError,
    refetch: refetchCards,
  } = useGetBuyerStripeCardsQuery(undefined, { skip: !token });

  const cards = cardsResponse?.data?.cards ?? [];

  useEffect(() => {
    const list = cardsResponse?.data?.cards ?? [];
    if (!list.length) {
      setCardId('');
      return;
    }
    setCardId((current) => {
      if (current && list.some((card) => card.id === current)) return current;
      return (list.find((card) => card.is_default) ?? list[0]).id;
    });
  }, [cardsResponse]);

  const handleAddPaymentMethod = async () => {
    if (isHiring) return;
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

  const isPreviewPending = isLoadingChargePreview && !chargePreview;
  const confirmDisabled = isHiring || isLoadingCards || isPreviewPending;

  const handleConfirm = async () => {
    if (confirmDisabled) return;
    if (!cardId) {
      showToast('Please select a payment method.', 'error');
      return;
    }

    try {
      const response = await acceptRequest({
        booking_id: req.id,
        payment_method_id: cardId,
        favorId,
      }).unwrap();

      if (response.success === false) {
        showToast(response.message || 'Could not hire this seller. Please try again.', 'error');
        return;
      }

      onSuccess(req.name);
    } catch {
      // axios interceptor already toasts API errors
    }
  };

  return (
    <div
      onClick={() => { if (!isHiring) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(16,24,40,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 500, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(16,24,40,0.18)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F2F4F7' }}>
          <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 20, color: '#101828' }}>Confirm & Pay</h2>
          <button
            onClick={onClose}
            disabled={isHiring}
            style={{ width: 32, height: 32, borderRadius: '50%', background: '#F2F4F7', border: 'none', cursor: isHiring ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isHiring ? 0.6 : 1 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#344054" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 16px', background: '#F9FAFB', borderRadius: 14, border: '1px solid #EAECF0' }}>
            <SellerAvatar src={req.avatar} name={req.name} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#101828' }}>{req.name}</span>
                {req.badge && (
                  <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#fff', background: req.badge === 'Pro' ? '#A54AFF' : '#344054', borderRadius: PILL, padding: '2px 8px' }}>{req.badge}</span>
                )}
              </div>
              {req.distance && (
                <p style={{ fontFamily: FONT, fontSize: 12, color: '#DC6803', fontWeight: 500, marginTop: 2 }}>{req.distance}</p>
              )}
            </div>
          </div>

          <div style={{ background: '#FAFAFA', border: '1px solid #EAECF0', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #F2F4F7' }}>
              <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Favor details</p>
              {[
                { label: 'Title',    value: favor.title },
                { label: 'Date',     value: favor.dueDate },
                { label: 'Time',     value: favor.time },
                { label: 'Location', value: favor.location },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: FONT, fontSize: 13, color: '#667085', flexShrink: 0 }}>{r.label}</span>
                  <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#101828', textAlign: 'right', maxWidth: 270 }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '14px 16px' }}>
              <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Price summary</p>
              {isLoadingChargePreview && !chargePreview ? (
                <>
                  <div style={{ height: 14, width: '70%', borderRadius: 4, background: '#EAECF0', marginBottom: 10 }} />
                  <div style={{ height: 14, width: '62%', borderRadius: 4, background: '#EAECF0', marginBottom: 10 }} />
                  <div style={{ height: 1, background: '#EAECF0', margin: '12px 0' }} />
                  <div style={{ height: 18, width: '55%', borderRadius: 4, background: '#EAECF0' }} />
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontFamily: FONT, fontSize: 13, color: '#667085' }}>Seller's offer</span>
                    <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#344054' }}>{formatMoney(sellerOffer)}</span>
                  </div>
                  {addOns.map((addon, index) => (
                    <div key={`${addon.label}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontFamily: FONT, fontSize: 13, color: '#98A2B3', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
                        Add-on: {addon.label}
                      </span>
                      <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#344054', flexShrink: 0 }}>+{formatMoney(addon.price)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontFamily: FONT, fontSize: 13, color: '#667085' }}>Service fee</span>
                    <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#344054' }}>{formatMoney(serviceFee)}</span>
                  </div>
                  {boostDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontFamily: FONT, fontSize: 13, color: '#667085' }}>Boost discount</span>
                      <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#079455' }}>-{formatMoney(boostDiscount)}</span>
                    </div>
                  )}
                  <div style={{ height: 1, background: '#EAECF0', margin: '12px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#101828' }}>Total</span>
                    <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: BRAND }}>{formatMoney(total)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ border: '1.5px solid #EAECF0', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
            <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Payment method</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              {isLoadingCards ? (
                [0, 1].map((i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: '#F9FAFB', border: '1.5px solid #EAECF0', borderRadius: 12 }}>
                    <div style={{ width: 38, height: 26, borderRadius: 5, background: '#EAECF0', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ width: 120, height: 12, borderRadius: 4, background: '#EAECF0', marginBottom: 8 }} />
                      <div style={{ width: 90, height: 10, borderRadius: 4, background: '#EAECF0' }} />
                    </div>
                  </div>
                ))
              ) : isCardsError ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <p style={{ fontFamily: FONT, fontSize: 13, color: '#667085', margin: 0 }}>
                    Could not load your payment methods.
                  </p>
                  <button
                    type="button"
                    onClick={() => { void refetchCards(); }}
                    style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: BRAND, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Try again
                  </button>
                </div>
              ) : cards.length === 0 ? (
                <p style={{ fontFamily: FONT, fontSize: 13, color: '#667085', margin: 0 }}>
                  No cards saved yet. Add a payment method to continue.
                </p>
              ) : (
                cards.map((card) => {
                  const selected = cardId === card.id;
                  return (
                    <div
                      key={card.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => { if (!isHiring) setCardId(card.id); }}
                      onKeyDown={(e) => { if (!isHiring && (e.key === 'Enter' || e.key === ' ')) setCardId(card.id); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: selected ? '#F9F5FF' : '#F9FAFB', border: `1.5px solid ${selected ? BRAND : '#EAECF0'}`, borderRadius: 12, cursor: isHiring ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
                    >
                      <CardIcon brand={card.brand} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: '#101828', marginBottom: 2 }}>
                          {holderName}
                        </p>
                        <p style={{ fontFamily: FONT, fontSize: 12, color: '#667085', letterSpacing: '0.05em' }}>
                          {'•'.repeat(12)}{card.last4}
                        </p>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selected ? BRAND : '#D0D5DD'}`, background: selected ? BRAND : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                        {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button
              type="button"
              disabled={isCreatingIntent || isHiring}
              onClick={() => { void handleAddPaymentMethod(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontWeight: 600, fontSize: 13, color: BRAND, background: 'none', border: 'none', cursor: isCreatingIntent || isHiring ? 'not-allowed' : 'pointer', padding: '4px 0', opacity: isCreatingIntent || isHiring ? 0.6 : 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={BRAND} strokeWidth="2" strokeLinecap="round"/></svg>
              {isCreatingIntent ? 'Starting…' : 'Add payment method'}
            </button>
          </div>

          <button
            onClick={() => { void handleConfirm(); }}
            disabled={confirmDisabled}
            style={{ width: '100%', fontFamily: FONT, fontWeight: 700, fontSize: 16, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: 16, cursor: confirmDisabled ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(165,74,255,0.3)', transition: 'opacity 0.15s', marginBottom: 10, opacity: confirmDisabled ? 0.75 : 1 }}
            onMouseEnter={e => { if (!confirmDisabled) (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = confirmDisabled ? '0.75' : '1'; }}
          >
            {isHiring ? 'Hiring…' : isPreviewPending ? 'Loading total…' : `Confirm & Pay ${formatMoney(total)}`}
          </button>
          <p style={{ fontFamily: FONT, fontSize: 12, color: '#98A2B3', textAlign: 'center', lineHeight: 1.5 }}>
            By confirming you agree to our Terms of Service. Payment is held in escrow until the favor is completed.
          </p>
        </div>
      </div>

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
    </div>
  );
}

/* ── Main page ── */
export default function CustomFavorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');
  const favorId = Number(rawId);
  const skipId = !Number.isFinite(favorId) || favorId <= 0;
  const token = useAppSelector((state) => state.auth.token);
  const skip = skipId || !token;

  const { data, isLoading, isError, refetch } = useGetBuyerCustomFavorByIdQuery(favorId, { skip });
  const [deleteCustomFavor, { isLoading: isDeleting }] = useDeleteBuyerCustomFavorMutation();
  const apiFavor = data?.data?.favor;
  const favor = useMemo(() => (apiFavor ? toFavorView(apiFavor) : null), [apiFavor]);
  const canManage = Boolean(apiFavor && resolveCustomFavorStatus(apiFavor) === 'Active');
  const requests = useMemo(
    () =>
      (data?.data?.requests ?? [])
        .filter((item) => !['declined', 'rejected', 'cancelled', 'canceled'].includes((item.status ?? '').toLowerCase()))
        .map(toRequestItem),
    [data],
  );

  const [viewReq,    setViewReq]    = useState<RequestItem | null>(null);
  const [hireReq,    setHireReq]    = useState<RequestItem | null>(null);
  const [declineReq, setDeclineReq] = useState<RequestItem | null>(null);
  const [dotsOpen,   setDotsOpen]   = useState(false);
  const [closed,    setClosed]    = useState(false);
  const [closeConf, setCloseConf] = useState(false);
  const [authOpen,  setAuthOpen]  = useState(false);

  const handleHire = (req: RequestItem) => {
    setViewReq(null);
    setHireReq(req);
  };

  const handleDecline = (req: RequestItem) => {
    setViewReq(null);
    setDeclineReq(req);
  };

  const handleHireSuccess = (sellerName: string) => {
    setHireReq(null);
    showToast(`${sellerName} has been hired for your custom favor.`, 'success');
    router.push('/custom-favors');
  };

  const handleDeclineSuccess = (sellerName: string) => {
    setDeclineReq(null);
    showToast(`Request from ${sellerName} was declined.`, 'success');
  };

  const handleDeleteFavor = async () => {
    if (!favor || isDeleting) return;
    const confirmed = await confirmDelete(favor.title, {
      title: 'Delete custom favor?',
      entity: 'this custom favor',
    });
    if (!confirmed) return;
    try {
      const response = await deleteCustomFavor(favor.id).unwrap();
      showToast(response.message || 'Custom favor deleted.', 'success');
      router.push('/custom-favors');
    } catch {
      // axios interceptor already toasts API errors
    }
  };

  return (
    <>
      <Navbar />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Sign in to view this custom favor."
        />
      )}
      <main className="app-page app-page-flow" style={{ minHeight: '100dvh', background: '#F9FAFB', paddingTop: 96 }}>
        <div className="app-page-body" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>

          {/* Back + three-dot menu row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <button
              onClick={() => router.push('/custom-favors')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#667085', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#101828'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#667085'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              My Custom Favors
            </button>

            {/* Three-dot menu */}
            {!closed && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDotsOpen(o => !o)}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1.5px solid #EAECF0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                >
                  <svg width="16" height="4" viewBox="0 0 16 4" fill="none"><circle cx="2" cy="2" r="1.5" fill="#667085"/><circle cx="8" cy="2" r="1.5" fill="#667085"/><circle cx="14" cy="2" r="1.5" fill="#667085"/></svg>
                </button>
                {dotsOpen && (
                  <>
                    <div onClick={() => setDotsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
                    <div style={{ position: 'absolute', top: 44, right: 0, background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 12, boxShadow: '0 8px 24px rgba(16,24,40,0.12)', zIndex: 200, minWidth: 180, overflow: 'hidden' }}>
                      {canManage && (
                        <button
                          onClick={() => { setDotsOpen(false); router.push(`/custom-favors/new?id=${favorId}`); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#344054', transition: 'background 0.1s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Edit
                        </button>
                      )}
                      {canManage && (
                        <button
                          onClick={() => { setDotsOpen(false); void handleDeleteFavor(); }}
                          disabled={isDeleting}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: isDeleting ? 'not-allowed' : 'pointer', fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#D92D20', opacity: isDeleting ? 0.6 : 1, transition: 'background 0.1s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF3F2'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="#D92D20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" stroke="#D92D20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="#D92D20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {isDeleting ? 'Deleting…' : 'Delete'}
                        </button>
                      )}
                      <button
                        onClick={() => { setDotsOpen(false); setCloseConf(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#D92D20', transition: 'background 0.1s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF3F2'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#D92D20" strokeWidth="2.5" strokeLinecap="round"/></svg>
                        Close Job
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Closed badge */}
            {closed && (
              <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#667085', background: '#F2F4F7', border: '1px solid #EAECF0', borderRadius: PILL, padding: '5px 14px' }}>
                Job Closed
              </span>
            )}
          </div>

          {/* Close job confirmation modal */}
          {closeConf && (
            <div onClick={() => setCloseConf(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(16,24,40,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(16,24,40,0.18)' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FEF3F2', border: '2px solid #FECDCA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#D92D20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="#D92D20" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="#D92D20" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <h3 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 18, color: '#101828', textAlign: 'center', marginBottom: 10 }}>Close this job?</h3>
                <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
                  Closing the job will stop new requests and move it to your history. This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setCloseConf(false)} style={{ flex: 1, fontFamily: FONT, fontWeight: 600, fontSize: 14, color: '#344054', background: '#fff', border: '1.5px solid #D0D5DD', borderRadius: PILL, padding: 13, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => { setCloseConf(false); setClosed(true); }} style={{ flex: 1, fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#fff', background: '#D92D20', border: 'none', borderRadius: PILL, padding: 13, cursor: 'pointer' }}>Close Job</button>
                </div>
              </div>
            </div>
          )}

          {/* Two-column grid: 2fr | 1fr */}
          {skip && !token ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20 }}>
              <p style={{ fontFamily: FONT, fontSize: 15, color: '#667085', marginBottom: 20 }}>Sign in to view this custom favor.</p>
              <button
                onClick={() => setAuthOpen(true)}
                style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '12px 24px', cursor: 'pointer' }}
              >
                Sign in
              </button>
            </div>
          ) : isLoading ? (
            <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: 24 }}>
              <div style={{ height: 220, borderRadius: 16, background: '#F2F4F7', marginBottom: 20 }} />
              <div style={{ width: '60%', height: 22, borderRadius: 6, background: '#F2F4F7', marginBottom: 12 }} />
              <div style={{ width: '40%', height: 14, borderRadius: 6, background: '#F2F4F7' }} />
            </div>
          ) : isError || !favor ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20 }}>
              <p style={{ fontFamily: FONT, fontSize: 15, color: '#667085', marginBottom: 20 }}>Couldn’t load this custom favor. Please try again.</p>
              <button
                onClick={() => { void refetch(); }}
                style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '12px 24px', cursor: 'pointer' }}
              >
                Retry
              </button>
            </div>
          ) : (
          <div className="app-split" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28, alignItems: 'flex-start' }}>

            {/* ── Left: favor info ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Hero image */}
              <div style={{ borderRadius: 20, overflow: 'hidden', border: '1.5px solid #EAECF0', height: 260 }}>
                <FavorImage src={favor.image} alt={favor.title} />
              </div>

              {/* Title + budget */}
              <SectionCard>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: '#101828', lineHeight: 1.3, flex: 1, minWidth: 0 }}>{favor.title}</h1>
                  <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 26, color: BRAND, flexShrink: 0 }}>{favor.budget}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: BRAND, background: '#F4EBFF', borderRadius: PILL, padding: '4px 12px' }}>{favor.category}</span>
                  <span style={{ fontFamily: FONT, fontSize: 13, color: '#667085', background: '#F9FAFB', borderRadius: PILL, padding: '4px 12px' }}>Due: <strong style={{ color: '#DC6803' }}>{favor.dueDate}</strong></span>
                </div>
              </SectionCard>

              {/* Details */}
              <SectionCard title="Favor details">
                <InfoRow label="Date"     value={favor.dueDate} />
                <InfoRow label="Time"     value={favor.time} />
                <InfoRow label="Location" value={favor.location} />
                <InfoRow label="Category" value={favor.category} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontFamily: FONT, fontSize: 13, color: '#667085' }}>Budget</span>
                  <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: BRAND }}>{favor.budget}</span>
                </div>
              </SectionCard>

              {/* Description */}
              <SectionCard title="Description">
                <p style={{ fontFamily: FONT, fontSize: 14, color: '#344054', lineHeight: 1.75 }}>{favor.description}</p>
              </SectionCard>

              {/* Photos */}
              {favor.photos.length > 1 && (
                <SectionCard title="Attached photos">
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {favor.photos.slice(1).map((src, i) => (
                      <div key={`${src}-${i}`} style={{ width: 160, height: 120, borderRadius: 12, overflow: 'hidden', border: '1px solid #EAECF0', flexShrink: 0 }}>
                        <FavorImage src={src} alt="" />
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* ── Right: sticky requests panel ── */}
            <div className="app-split-sticky" style={{ position: 'sticky', top: 104 }}>
              <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, overflow: 'hidden' }}>
                {/* Panel header */}
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F2F4F7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: '#101828' }}>
                      Requests
                      {requests.length > 0 && (
                        <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, borderRadius: PILL, background: '#D92D20', color: '#fff', fontFamily: FONT, fontSize: 12, fontWeight: 700, padding: '0 6px' }}>
                          {requests.length}
                        </span>
                      )}
                    </h3>
                  </div>
                </div>

                {/* Scrollable requests list */}
                <div style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto', padding: requests.length > 0 ? '14px 16px' : '0' }}>
                  {requests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F4EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke={BRAND} strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#101828', marginBottom: 6 }}>No requests yet</p>
                      <p style={{ fontFamily: FONT, fontSize: 13, color: '#98A2B3', lineHeight: 1.5 }}>Sellers will apply once they see your favor.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {requests.map(req => (
                        <RequestCard key={req.id} req={req} onView={setViewReq} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Request detail modal */}
      {viewReq && (
        <RequestModal
          req={viewReq}
          onClose={() => setViewReq(null)}
          onHire={handleHire}
          onDecline={handleDecline}
        />
      )}

      {declineReq && (
        <DeclineModal
          req={declineReq}
          favorId={favorId}
          onClose={() => setDeclineReq(null)}
          onSuccess={handleDeclineSuccess}
        />
      )}

      {/* Payment modal */}
      {hireReq && favor && (
        <PaymentModal
          req={hireReq}
          favor={favor}
          favorId={favorId}
          onClose={() => setHireReq(null)}
          onSuccess={handleHireSuccess}
        />
      )}
    </>
  );
}
