'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import {
  useCancelBuyerBookingMutation,
  useGetBuyerBookingsQuery,
  useWithdrawBuyerBookingMutation,
} from '@/app/buyer/store/buyerBookingsAPI';
import {
  formatBuyerBookingStatusLabel,
  isActiveListingBookingStatus,
  mapBuyerBookingUiStatus,
  mergeBuyerBookings,
  type BuyerBooking,
  type BuyerBookingListTab,
  type BuyerBookingUiStatus,
} from '@/app/buyer/store/buyerBookingsTypes';
import { useAppSelector } from '@/store/hooks';
import FavorImage, { pickFavorImage } from '@/components/FavorImage';
import { showToast } from '@/lib/toast';

const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const BRAND = '#A54AFF';
const PILL  = '9999px';

type Status = BuyerBookingUiStatus;

interface Booking {
  id: string;
  title: string;
  image: string | null;
  seller: string;
  sellerAvatar: string;
  badge?: 'Pro' | 'Team';
  price: number;
  date: string;
  time: string;
  location: string;
  address: string;
  status: Status;
  isCustom: boolean;
  rating?: number;
}

const PLACEHOLDER_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format&q=80';
const PAGE_SIZE = 10;
const CANCEL_REASONS = [
  'Plans changed',
  'No longer needed',
  'Booked by mistake',
  'Found another option',
  'Emergency on my end',
  'Seller is not responding',
  'Other',
];
const WITHDRAW_REASONS = [
  'Plans changed',
  'No longer needed',
  'Booked by mistake',
  'Found another option',
  'Other',
];
const MODAL_OVERLAY: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.52)', zIndex: 9999,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
};
const MODAL_SHADOW = '0 20px 24px -4px rgba(16,24,40,0.08), 0 8px 8px -4px rgba(16,24,40,0.03)';

function mapApiStatus(item: BuyerBooking, tab: BuyerBookingListTab): Status {
  return mapBuyerBookingUiStatus(item.status, {
    tab,
    booking: item,
  });
}

function formatFavorDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFavorTime(value: string): string {
  const [hoursRaw, minutesRaw] = value.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function toBookingCard(item: BuyerBooking, tab: BuyerBookingListTab): Booking {
  const favorType = item.favor?.favorType?.toLowerCase() ?? '';
  return {
    id: String(item.id),
    title: item.favor?.title || 'Booking',
    image: pickFavorImage(item.images, item.favor?.images, item.favor?.favorImage),
    seller: item.seller?.fullName || 'Seller',
    sellerAvatar: item.seller?.profileImage || PLACEHOLDER_AVATAR,
    badge: favorType.includes('team') ? 'Team' : 'Pro',
    price: Number(item.totalPrice) || 0,
    date: formatFavorDate(item.favorDate),
    time: formatFavorTime(item.favorTime),
    location: item.isBuyerComing ? 'Work' : 'Home',
    address: item.address || 'Address not provided',
    status: mapApiStatus(item, tab),
    isCustom: favorType.includes('custom'),
  };
}

const STATUS_CFG: Record<Status, { bg: string; color: string }> = {
  InProgress:         { bg: '#FFF4ED', color: '#C4320A' },
  Upcoming:           { bg: '#ECFDF3', color: '#079455' },
  Pending:            { bg: '#FFFAEB', color: '#B54708' },
  DeclinedBySeller:   { bg: '#FEF3F2', color: '#B42318' },
  CancelledByBuyer:   { bg: '#F2F4F7', color: '#667085' },
  CancelledBySeller:  { bg: '#F2F4F7', color: '#667085' },
  Cancelled:          { bg: '#F2F4F7', color: '#667085' },
  Complete:           { bg: '#F9F5FF', color: '#6941C6' },
  Completed:          { bg: '#EEF4FF', color: '#3538CD' },
};

function StatusBadge({ status }: { status: Status }) {
  const { bg, color } = STATUS_CFG[status];
  return (
    <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, fontWeight: 600, background: bg, color, borderRadius: PILL, padding: '4px 12px' }}>
      {formatBuyerBookingStatusLabel(status)}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24">
          <polygon fill={i <= rating ? '#F79009' : '#E4E7EC'} stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function BriefcaseIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="#98A2B3" strokeWidth="1.8"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="#98A2B3" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function HomeIconSmall() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#98A2B3" strokeWidth="1.8"/><polyline points="9 22 9 12 15 12 15 22" stroke="#98A2B3" strokeWidth="1.8"/></svg>;
}

function PulsingDot() {
  return (
    <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C4320A', position: 'absolute', zIndex: 1 }} />
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C4320A', position: 'absolute', animation: 'bkDotPulse 1.6s ease-out infinite' }} />
    </div>
  );
}

function KebabMenu({ status, isCustom, onWithdraw, onCancel, onViewDetails }: { status: Status; isCustom?: boolean; onWithdraw: () => void; onCancel: () => void; onViewDetails: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        style={{ width: 32, height: 32, borderRadius: '50%', background: 'none', border: '1.5px solid #EAECF0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EAECF0'; }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill="#667085"/><circle cx="12" cy="12" r="1.5" fill="#667085"/><circle cx="12" cy="19" r="1.5" fill="#667085"/></svg>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: 36, right: 0, background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 12, padding: 6, minWidth: 180, boxShadow: '0 8px 24px rgba(16,24,40,0.12)', zIndex: 10 }}>
            {status === 'InProgress' && (
              <button onClick={() => { onCancel(); setOpen(false); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#D92D20', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 8 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF3F2'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}>
                Cancel booking
              </button>
            )}
            {status === 'Pending' && !isCustom && (
              <button onClick={() => { onWithdraw(); setOpen(false); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#B54708', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 8 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FFFAEB'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}>
                Withdraw request
              </button>
            )}
            <button
              onClick={() => { onViewDetails(); setOpen(false); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#344054', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 8 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}>
              View details
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CancelBookingModal({
  onClose,
  onConfirm,
  isSubmitting,
}: {
  booking: Booking;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<boolean>;
  isSubmitting: boolean;
}) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const cancelReason = reason === 'Other' ? (note.trim() || 'Other') : reason;
  const canSubmit = Boolean(reason) && (reason !== 'Other' || Boolean(note.trim())) && !isSubmitting;

  if (done) {
    return (
      <div style={MODAL_OVERLAY}>
        <div style={{ background: '#fff', borderRadius: 16, maxWidth: 380, width: '100%', padding: '40px 28px 32px', textAlign: 'center', boxShadow: MODAL_SHADOW }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F4EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 20, color: '#101828', marginBottom: 8 }}>Booking cancelled</h2>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', lineHeight: 1.6, marginBottom: 28 }}>
            This booking has been cancelled. You can find it in History.
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '13px', cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }} style={MODAL_OVERLAY}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: MODAL_SHADOW }}>
        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, color: '#101828', margin: 0 }}>Cancel Booking?</h2>
            <button
              type="button"
              onClick={isSubmitting ? undefined : onClose}
              disabled={isSubmitting}
              style={{ width: 36, height: 36, borderRadius: '50%', background: '#F2F4F7', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#667085" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div style={{ height: 1, background: '#EAECF0', margin: '0 -24px' }} />
        </div>

        <div style={{ padding: 24 }}>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', lineHeight: 1.6, marginBottom: 20 }}>
            Please tell us why you&apos;re cancelling this booking. Your reason helps us process the request smoothly.
          </p>

          <div style={{ marginBottom: reason === 'Other' ? 18 : 16 }}>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 8 }}>Select reason</p>
            <select
              value={reason}
              disabled={isSubmitting}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontSize: 14, color: reason ? '#344054' : '#98A2B3', background: '#fff', border: '1px solid #D0D5DD', borderRadius: PILL, padding: '11px 16px', outline: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', boxSizing: 'border-box' }}
            >
              <option value="">Select one</option>
              {CANCEL_REASONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {reason === 'Other' && (
            <textarea
              value={note}
              disabled={isSubmitting}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tell us why you're cancelling"
              style={{ width: '100%', minHeight: 90, fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#101828', border: '1px solid #D0D5DD', borderRadius: 12, padding: '12px 14px', outline: 'none', resize: 'none', boxSizing: 'border-box', display: 'block', marginBottom: 16 }}
            />
          )}

          <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#D92D20', lineHeight: 1.55, margin: 0 }}>
            Note: Only 80% of the money you can refund from your payment according to our policy.
          </p>
        </div>

        <div style={{ flexShrink: 0, borderTop: '1px solid #EAECF0', padding: '16px 24px 24px', display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ flex: 1, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '12px 16px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}
          >
            Don&apos;t Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!canSubmit) return;
              const ok = await onConfirm(cancelReason);
              if (ok) setDone(true);
            }}
            disabled={!canSubmit}
            style={{ flex: 1, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: canSubmit ? '#344054' : '#98A2B3', background: '#fff', border: '1px solid #D0D5DD', borderRadius: PILL, padding: '12px 16px', cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.6 }}
          >
            {isSubmitting ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}

function WithdrawRequestModal({
  onClose,
  onConfirm,
  isSubmitting,
}: {
  onClose: () => void;
  onConfirm: (reason: string) => Promise<boolean>;
  isSubmitting: boolean;
}) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const cancelReason = reason === 'Other' ? (note.trim() || 'Other') : reason;
  const canSubmit = Boolean(reason) && (reason !== 'Other' || Boolean(note.trim())) && !isSubmitting;

  if (done) {
    return (
      <div style={MODAL_OVERLAY}>
        <div style={{ background: '#fff', borderRadius: 16, maxWidth: 380, width: '100%', padding: '40px 28px 32px', textAlign: 'center', boxShadow: MODAL_SHADOW }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F4EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 20, color: '#101828', marginBottom: 8 }}>Request withdrawn</h2>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', lineHeight: 1.6, marginBottom: 28 }}>
            This request has been withdrawn. The seller will no longer see it.
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '13px', cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }} style={MODAL_OVERLAY}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: MODAL_SHADOW }}>
        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, color: '#101828', margin: 0 }}>Withdraw Request?</h2>
            <button
              type="button"
              onClick={isSubmitting ? undefined : onClose}
              disabled={isSubmitting}
              style={{ width: 36, height: 36, borderRadius: '50%', background: '#F2F4F7', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#667085" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div style={{ height: 1, background: '#EAECF0', margin: '0 -24px' }} />
        </div>

        <div style={{ padding: 24 }}>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', lineHeight: 1.6, marginBottom: 20 }}>
            This will cancel your pending booking request. The seller will no longer see it.
          </p>

          <div style={{ marginBottom: reason === 'Other' ? 18 : 0 }}>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 8 }}>Select reason</p>
            <select
              value={reason}
              disabled={isSubmitting}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontSize: 14, color: reason ? '#344054' : '#98A2B3', background: '#fff', border: '1px solid #D0D5DD', borderRadius: PILL, padding: '11px 16px', outline: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', boxSizing: 'border-box' }}
            >
              <option value="">Select one</option>
              {WITHDRAW_REASONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {reason === 'Other' && (
            <textarea
              value={note}
              disabled={isSubmitting}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tell us why you're withdrawing"
              style={{ width: '100%', minHeight: 90, fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#101828', border: '1px solid #D0D5DD', borderRadius: 12, padding: '12px 14px', outline: 'none', resize: 'none', boxSizing: 'border-box', display: 'block' }}
            />
          )}
        </div>

        <div style={{ flexShrink: 0, borderTop: '1px solid #EAECF0', padding: '16px 24px 24px', display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ flex: 1, fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: '#344054', background: '#fff', border: '1px solid #D0D5DD', borderRadius: PILL, padding: '12px 16px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}
          >
            Keep Request
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!canSubmit) return;
              const ok = await onConfirm(cancelReason);
              if (ok) setDone(true);
            }}
            disabled={!canSubmit}
            style={{ flex: 1, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', background: 'linear-gradient(135deg,#F97066,#D92D20)', border: 'none', borderRadius: PILL, padding: '12px 16px', cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.5 }}
          >
            {isSubmitting ? 'Withdrawing...' : 'Withdraw Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancel, onWithdraw }: { booking: Booking; onCancel: () => void; onWithdraw: () => void }) {
  const router    = useRouter();
  const isActive  = booking.status === 'InProgress';

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-nomove]')) return;
    router.push(`/bookings/${booking.id}`);
  };

  return (
    <div onClick={handleCardClick}
      style={{
        background: '#fff',
        border: isActive ? '1.5px solid rgba(165,74,255,0.45)' : '1.5px solid #EAECF0',
        borderRadius: 20, padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'box-shadow 0.2s, border-color 0.2s', cursor: 'pointer',
        boxShadow: isActive ? '0 4px 20px rgba(165,74,255,0.12)' : 'none',
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 4px 16px rgba(16,24,40,0.08)'; if (!isActive) el.style.borderColor = 'rgba(165,74,255,0.25)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = isActive ? '0 4px 20px rgba(165,74,255,0.12)' : 'none'; if (!isActive) el.style.borderColor = '#EAECF0'; }}>

      {/* Top: image + info + kebab */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <FavorImage src={booking.image} alt={booking.title}
          style={{ width: 82, height: 68, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 5 }}>
            {booking.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <img src={booking.sellerAvatar} alt={booking.seller} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #DFBAFF', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: '#344054', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{booking.seller}</span>
            {booking.badge && (
              <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 10, fontWeight: 700, background: booking.badge === 'Pro' ? '#A54AFF' : '#344054', color: '#fff', borderRadius: PILL, padding: '1px 7px', flexShrink: 0 }}>{booking.badge}</span>
            )}
          </div>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 16, color: BRAND }}>
            {`$${Number(booking.price).toFixed(2)}`}
          </p>
        </div>
        <div data-nomove>
          <KebabMenu
            status={booking.status}
            isCustom={booking.isCustom}
            onWithdraw={onWithdraw}
            onCancel={onCancel}
            onViewDetails={() => router.push(`/bookings/${booking.id}`)}
          />
        </div>
      </div>

      {/* Date / location */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingTop: 12, borderTop: '1px solid #EAECF0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#98A2B3" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#98A2B3" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#344054' }}>{booking.date} – {booking.time}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {booking.location === 'Work' ? <BriefcaseIcon /> : <HomeIconSmall />}
          <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#344054', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{booking.address}</span>
        </div>
      </div>

      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isActive && <PulsingDot />}
          <StatusBadge status={booking.status} />
          {booking.status === 'Completed' && booking.rating && <StarRating rating={booking.rating} />}
        </div>
      </div>
    </div>
  );
}

function BookingCardSkeleton() {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 82, height: 68, borderRadius: 12, background: '#F2F4F7', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: '70%', height: 14, borderRadius: 4, background: '#F2F4F7', marginBottom: 10 }} />
          <div style={{ width: '45%', height: 12, borderRadius: 4, background: '#F2F4F7', marginBottom: 10 }} />
          <div style={{ width: 52, height: 14, borderRadius: 4, background: '#F2F4F7' }} />
        </div>
      </div>
      <div style={{ paddingTop: 12, borderTop: '1px solid #EAECF0' }}>
        <div style={{ width: '55%', height: 12, borderRadius: 4, background: '#F2F4F7', marginBottom: 8 }} />
        <div style={{ width: '80%', height: 12, borderRadius: 4, background: '#F2F4F7' }} />
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: 'calendar' | 'request' | 'history'; title: string; description: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F4EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        {icon === 'calendar' && <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke={BRAND} strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke={BRAND} strokeWidth="2" strokeLinecap="round"/></svg>}
        {icon === 'request' && <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12l2 2 4-4" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        {icon === 'history' && <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 3v5h5M12 7v5l4 2" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>{title}</h3>
      <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', maxWidth: 320, lineHeight: 1.65 }}>{description}</p>
    </div>
  );
}

export default function BookingsPage() {
  const [tab, setTab] = useState<BuyerBookingListTab>('upcoming');
  const [authOpen, setAuthOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<Booking | null>(null);
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBuyerBookingMutation();
  const [withdrawBooking, { isLoading: isWithdrawing }] = useWithdrawBuyerBookingMutation();
  const token = useAppSelector((state) => state.auth.token);
  const skip = !token;

  const handleCancelBooking = async (cancelReason: string) => {
    if (!cancelTarget) return false;
    const bookingId = Number(cancelTarget.id);
    if (!Number.isFinite(bookingId) || bookingId <= 0) {
      showToast('Could not cancel this booking. Please try again.', 'error');
      return false;
    }
    try {
      const response = await cancelBooking({
        booking_id: bookingId,
        cancel_reason: cancelReason,
      }).unwrap();
      showToast(response.message || 'Booking cancelled.', 'success');
      return true;
    } catch {
      return false;
    }
  };

  const handleWithdrawBooking = async (cancelReason: string) => {
    if (!withdrawTarget) return false;
    const bookingId = Number(withdrawTarget.id);
    if (!Number.isFinite(bookingId) || bookingId <= 0) {
      showToast('Could not withdraw this request. Please try again.', 'error');
      return false;
    }
    try {
      const response = await withdrawBooking({
        booking_id: bookingId,
        cancel_reason: cancelReason,
      }).unwrap();
      showToast(response.message || 'Request withdrawn.', 'success');
      return true;
    } catch {
      return false;
    }
  };

  const upcomingQuery = useGetBuyerBookingsQuery(
    { page: 1, limit: PAGE_SIZE, status: 'upcoming' },
    { skip },
  );
  const inProgressQuery = useGetBuyerBookingsQuery(
    { page: 1, limit: PAGE_SIZE, status: 'in-progress' },
    { skip },
  );
  const completeQuery = useGetBuyerBookingsQuery(
    { page: 1, limit: PAGE_SIZE, status: 'completed' },
    { skip },
  );
  const requestsQuery = useGetBuyerBookingsQuery(
    { page: 1, limit: PAGE_SIZE, status: 'requests' },
    { skip },
  );
  const historyQuery = useGetBuyerBookingsQuery(
    { page: 1, limit: PAGE_SIZE, status: 'history' },
    { skip },
  );

  const upcomingItems = useMemo(
    () =>
      mergeBuyerBookings(
        inProgressQuery.data?.data?.bookings,
        completeQuery.data?.data?.bookings,
        upcomingQuery.data?.data?.bookings,
      ).filter((item) => isActiveListingBookingStatus(item.status)),
    [completeQuery.data, inProgressQuery.data, upcomingQuery.data],
  );

  const requestsItems = requestsQuery.data?.data?.bookings ?? [];
  const historyItems = historyQuery.data?.data?.bookings ?? [];

  const upcomingLoading = upcomingQuery.isLoading || inProgressQuery.isLoading || completeQuery.isLoading;
  const upcomingError = upcomingQuery.isError && inProgressQuery.isError && completeQuery.isError;

  const queries = {
    upcoming: {
      isLoading: upcomingLoading,
      isError: upcomingError,
      refetch: () => {
        void upcomingQuery.refetch();
        void inProgressQuery.refetch();
        void completeQuery.refetch();
      },
    },
    requests: requestsQuery,
    history: historyQuery,
  } as const;

  const activeQuery = queries[tab];
  const upcomingCount = upcomingItems.length;
  const requestsCount = requestsQuery.data?.data?.pagination?.total ?? 0;
  const historyCount = historyQuery.data?.data?.pagination?.total ?? 0;

  const current = useMemo(() => {
    if (tab === 'upcoming') return upcomingItems.map((item) => toBookingCard(item, tab));
    const items = tab === 'requests' ? requestsItems : historyItems;
    return items.map((item) => toBookingCard(item, tab));
  }, [historyItems, requestsItems, tab, upcomingItems]);

  const TABS = [
    { key: 'upcoming' as const, label: 'Upcoming', count: upcomingCount },
    { key: 'requests' as const, label: 'Requests', count: requestsCount },
    { key: 'history'  as const, label: 'History',  count: historyCount  },
  ];

  const emptyProps: Record<typeof tab, { icon: 'calendar'|'request'|'history'; title: string; description: string }> = {
    upcoming: { icon: 'calendar', title: 'No upcoming bookings',  description: 'Accepted bookings will appear here once a seller confirms your request.' },
    requests: { icon: 'request',  title: 'No booking requests',   description: 'Requests you send will appear here until a seller responds.' },
    history:  { icon: 'history',  title: 'No history yet',        description: 'Completed and cancelled bookings will appear here.' },
  };

  return (
    <>
      <style>{`@keyframes bkDotPulse{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.8);opacity:0}}`}</style>
      <Navbar />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Log in to view and manage your bookings."
        />
      )}
      <main className="app-page" style={{ minHeight: '100dvh', background: '#F9FAFB' }}>

        {/* Header */}
        <div className="app-page-band" style={{ background: '#fff', borderBottom: '1px solid #EAECF0', paddingTop: 104, paddingBottom: 32 }}>
          <div className="app-page-inner" style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
            <a href="/explore/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 500, color: '#667085', textDecoration: 'none', marginBottom: 16, transition: 'color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = BRAND; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#667085'; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to explore
            </a>
            <h1 className="app-page-title" style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 28, color: '#101828', marginBottom: 4 }}>My Bookings</h1>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085' }}>Track and manage your service bookings.</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', borderBottom: '1px solid #EAECF0' }}>
          <div className="app-page-inner app-tabs" style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', display: 'flex' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: tab === t.key ? BRAND : '#667085', background: 'none', border: 'none', borderBottom: `2.5px solid ${tab === t.key ? BRAND : 'transparent'}`, padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'color 0.15s', flexShrink: 0 }}>
                {t.label}
                {t.count > 0 && (
                  <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 11, fontWeight: 700, background: tab === t.key ? '#F4EBFF' : '#F2F4F7', color: tab === t.key ? BRAND : '#98A2B3', borderRadius: PILL, padding: '2px 8px' }}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="app-page-body" style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 80px' }}>
          {skip ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>Log in to view your bookings</h3>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', maxWidth: 320, lineHeight: 1.65, marginBottom: 20 }}>
                Sign in to track upcoming favors, requests, and history.
              </p>
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '11px 22px', cursor: 'pointer' }}
              >
                Log in
              </button>
            </div>
          ) : activeQuery.isLoading ? (
            <div className="app-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(400px,1fr))', gap: 20 }}>
              <BookingCardSkeleton />
              <BookingCardSkeleton />
              <BookingCardSkeleton />
              <BookingCardSkeleton />
            </div>
          ) : activeQuery.isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>Could not load bookings</h3>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', maxWidth: 320, lineHeight: 1.65, marginBottom: 16 }}>
                Please try again in a moment.
              </p>
              <button
                type="button"
                onClick={() => { void activeQuery.refetch(); }}
                style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: BRAND, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Try again
              </button>
            </div>
          ) : current.length === 0 ? (
            <EmptyState {...emptyProps[tab]} />
          ) : (
            <>
              <div className="app-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(400px,1fr))', gap: 20 }}>
                {current.map(b => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    onCancel={() => setCancelTarget(b)}
                    onWithdraw={() => setWithdrawTarget(b)}
                  />
                ))}
              </div>
              {tab === 'requests' && (
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#98A2B3', textAlign: 'center', marginTop: 32 }}>
                  Accepted requests move automatically to Upcoming.
                </p>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      {cancelTarget && (
        <CancelBookingModal
          booking={cancelTarget}
          isSubmitting={isCancelling}
          onClose={() => { if (!isCancelling) setCancelTarget(null); }}
          onConfirm={handleCancelBooking}
        />
      )}
      {withdrawTarget && (
        <WithdrawRequestModal
          isSubmitting={isWithdrawing}
          onClose={() => { if (!isWithdrawing) setWithdrawTarget(null); }}
          onConfirm={handleWithdrawBooking}
        />
      )}
    </>
  );
}
