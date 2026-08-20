'use client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import {
  useAddBuyerBookingReviewMutation,
  useApproveBuyerBookingCompleteMutation,
  useCancelBuyerBookingMutation,
  useGetBuyerBookingByIdQuery,
  useReportBuyerBookingMutation,
  useWithdrawBuyerBookingMutation,
} from '@/app/buyer/store/buyerBookingsAPI';
import {
  newClientMsgId,
  useSendBuyerConversationMessageMutation,
  useStartBuyerConversationByBookingMutation,
} from '@/app/buyer/store/buyerConversationsAPI';
import { showToast } from '@/lib/toast';
import type {
  BuyerBooking,
  BuyerBookingAddOn,
  BuyerBookingReview,
} from '@/app/buyer/store/buyerBookingsTypes';
import { isAwaitingCompleteBookingStatus, isFinishedBookingStatus } from '@/app/buyer/store/buyerBookingsTypes';
import { useAppSelector } from '@/store/hooks';
import FavorImage, { pickFavorImage } from '@/components/FavorImage';

const LiveLocationMap = dynamic(() => import('@/components/LiveLocationMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 210, borderRadius: 16, background: '#F2F4F7' }} />
  ),
});

const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const BRAND = '#A54AFF';
const PILL  = '9999px';

/* ─── Types ─────────────────────────────────────────────── */
type Status = 'InProgress' | 'Upcoming' | 'Pending' | 'Declined' | 'Cancelled' | 'Complete' | 'Completed';

interface StatusUpdate { time: string; text: string; type: 'arrival' | 'working' | 'update'; }
interface Requirement  { q: string; a: string; }
interface Addon        { label: string; price: number; }

interface DetailedBooking {
  id: string; status: Status;
  title: string; category: string; image: string | null; price: number;
  date: string; dateIso: string; time: string; location: string; address: string;
  lat: number | null; lng: number | null;
  isTeam: boolean;
  sellerName: string; sellerAvatar: string; sellerBadge: 'Pro' | 'Team'; sellerDistance?: number;
  teamName?: string; teamLogo?: string;
  providerName?: string; providerAvatar?: string; providerDistance?: number;
  plan?: string;
  requirements: Requirement[];
  addons: Addon[];
  note: string; media: string[];
  statusUpdates?: StatusUpdate[];
  rating?: number; review?: string;
  cancelledReason?: string; refundAmount?: number;
  platformFee: number;
  sellerAmount: number;
  boostDiscount: number;
}

const PLACEHOLDER_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format&q=80';

function normalizeStatus(status: string): string {
  return status.toLowerCase().replace(/[-_\s]/g, '');
}

function mapApiStatus(status: string): Status {
  const key = normalizeStatus(status);
  if (['inprogress', 'started', 'active', 'ongoing', 'working'].includes(key)) return 'InProgress';
  if (['upcoming', 'accepted', 'confirmed', 'scheduled', 'approved'].includes(key)) return 'Upcoming';
  if (['pending', 'request', 'requested'].includes(key)) return 'Pending';
  if (['declined', 'rejected'].includes(key)) return 'Declined';
  if (['cancelled', 'canceled'].includes(key)) return 'Cancelled';
  if (isFinishedBookingStatus(status)) return 'Completed';
  if (isAwaitingCompleteBookingStatus(status)) return 'Complete';
  return 'Pending';
}

function displayCategory(type: string): string {
  if (!type) return 'Favor';
  return type.replace(/\b\w/g, ch => ch.toUpperCase());
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

function formatUsd(value: number | string | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '$0.00';
  return `$${n.toFixed(2)}`;
}

function parseCoord(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeAddOns(items: unknown[] | undefined): Addon[] {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => {
    if (typeof item === 'string') return { label: item, price: 0 };
    if (typeof item === 'number') return { label: `Add-on ${index + 1}`, price: item };
    if (item && typeof item === 'object') {
      const addon = item as BuyerBookingAddOn;
      return {
        label: addon.label || addon.name || addon.title || addon.description || `Add-on ${index + 1}`,
        price: Number(addon.price) || 0,
      };
    }
    return { label: `Add-on ${index + 1}`, price: 0 };
  });
}

function toDetailedBooking(item: BuyerBooking, review: BuyerBookingReview): DetailedBooking {
  const favorType = item.favor?.favorType?.toLowerCase() ?? '';
  const isTeam = favorType.includes('team');
  const reviewText = review?.comment || review?.text || review?.review || '';
  const rating = Number(review?.rating);
  const hasReview = Boolean(reviewText) || (Number.isFinite(rating) && rating > 0);
  const mappedStatus = mapApiStatus(item.status);
  return {
    id: String(item.id),
    status: mappedStatus === 'Complete' && hasReview ? 'Completed' : mappedStatus,
    title: item.favor?.title || 'Booking',
    category: displayCategory(item.favor?.type || ''),
    image: pickFavorImage(item.favor?.images, item.favor?.favorImage, item.images),
    price: Number(item.totalPrice) || 0,
    date: formatFavorDate(item.favorDate),
    dateIso: item.favorDate,
    time: formatFavorTime(item.favorTime),
    location: item.isBuyerComing ? 'Work' : 'Home',
    address: item.address || 'Address not provided',
    lat: parseCoord(item.lat) ?? parseCoord(item.favor?.lat),
    lng: parseCoord(item.lng) ?? parseCoord(item.favor?.lng),
    isTeam,
    sellerName: item.seller?.fullName || 'Seller',
    sellerAvatar: item.seller?.profileImage || PLACEHOLDER_AVATAR,
    sellerBadge: isTeam ? 'Team' : 'Pro',
    teamName: isTeam ? item.seller?.fullName : undefined,
    teamLogo: isTeam ? (item.seller?.profileImage || PLACEHOLDER_AVATAR) : undefined,
    providerName: isTeam ? item.seller?.fullName : undefined,
    providerAvatar: isTeam ? (item.seller?.profileImage || PLACEHOLDER_AVATAR) : undefined,
    plan: favorType && favorType !== 'normal' && favorType !== 'team' ? displayCategory(favorType) : undefined,
    requirements: (item.questionAnswers ?? []).map((qa) => ({
      q: qa.question,
      a: qa.answer?.trim() ? qa.answer : '—',
    })),
    addons: normalizeAddOns(item.selectedAddOns),
    note: item.details?.trim() && item.details.trim() !== 'Booking request' ? item.details.trim() : '',
    media: item.images ?? [],
    rating: Number.isFinite(rating) && rating > 0 ? rating : undefined,
    review: reviewText || undefined,
    cancelledReason: item.cancelReason || undefined,
    platformFee: Number(item.platformFeeAmount) || 0,
    sellerAmount: Number(item.sellerAmount) || 0,
    boostDiscount: Number(item.boostDiscountAmount) || 0,
  };
}

/* ─── Helpers ───────────────────────────────────────────── */
function getDaysUntil(dateStr: string) {
  const iso = dateStr.includes('T') || /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
    ? (dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`)
    : dateStr;
  const d = new Date(iso), now = new Date();
  if (Number.isNaN(d.getTime())) return 0;
  now.setHours(0,0,0,0); d.setHours(0,0,0,0);
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}
function getCalDays(y: number, m: number): (number|null)[] {
  const first = new Date(y,m,1).getDay(), total = new Date(y,m+1,0).getDate();
  const days: (number|null)[] = Array(first).fill(null);
  for (let d=1;d<=total;d++) days.push(d);
  return days;
}
function isPast(y:number,m:number,d:number){const n=new Date();n.setHours(0,0,0,0);return new Date(y,m,d)<n;}
function isToday(y:number,m:number,d:number){const n=new Date();n.setHours(0,0,0,0);return new Date(y,m,d).getTime()===n.getTime();}
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const CANCEL_REASONS = ['Service not started on time','Seller is not responding','Emergency on my end','Changed plans','Not satisfied with the service','Other'];
const WITHDRAW_REASONS = ['Plans changed','No longer needed','Booked by mistake','Found another option','Other'];

/* ─── StatusMessages ─────────────────────────────────────── */
function StatusMessages({ updates }: { updates: StatusUpdate[] }) {
  const cfg = {
    arrival: { bg: '#EEF0FF', color: '#3538CD', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#3538CD" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="#3538CD" strokeWidth="2"/></svg> },
    working:  { bg: '#ECFDF3', color: '#079455', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#079455" strokeWidth="2"/><path d="M8 12l3 3 5-5" stroke="#079455" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    update:   { bg: '#F4EBFF', color: '#A54AFF', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#A54AFF" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#A54AFF" strokeWidth="2" strokeLinecap="round"/></svg> },
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {updates.map((u, i) => {
        const { bg, color, icon } = cfg[u.type];
        return (
          <div key={i} style={{ background: bg, borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            {icon}
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color, fontWeight: 500, flex: 1 }}>{u.text}</span>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 11, color: '#98A2B3', flexShrink: 0 }}>{u.time}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Shared UI primitives ───────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #F2F4F7' }}>
        <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: '#101828', margin: 0 }}>{title}</p>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function StarDisplay({ rating, size=18 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <polygon fill={i<=rating?'#F79009':'#E4E7EC'} stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

function MilesAway({ miles }: { miles?: number }) {
  if (miles == null || !Number.isFinite(miles)) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#98A2B3" strokeWidth="1.8"/><circle cx="12" cy="10" r="3" stroke="#98A2B3" strokeWidth="1.8"/></svg>
      <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:'#98A2B3' }}>{miles} miles away</span>
    </div>
  );
}

function PlanLabel({ plan }: { plan?: string }) {
  if (!plan) return null;
  return (
    <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:13, color:'#667085' }}>Plan: {plan}</span>
  );
}

/* ─── ModalSelect ─────────────────────────────────────────── */
function ModalSelect({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) {
      setMenuPos(null);
      return;
    }
    const rect = btnRef.current.getBoundingClientRect();
    const gap = 6;
    const estimated = options.length * 40 + 8;
    const spaceBelow = window.innerHeight - rect.bottom - gap - 16;
    const spaceAbove = rect.top - gap - 16;
    const openUp = spaceBelow < Math.min(estimated, 180) && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(estimated, openUp ? spaceAbove : spaceBelow, 280));
    setMenuPos({
      top: openUp ? rect.top - gap - maxHeight : rect.bottom + gap,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  }, [open, options.length]);

  return (
    <div style={{ position: 'relative' }}>
      <button ref={btnRef} type="button" onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', fontFamily: 'Poppins,sans-serif', fontSize: 14, color: value ? '#344054' : '#98A2B3', background: '#fff', border: `1px solid ${open ? BRAND : '#D0D5DD'}`, borderRadius: PILL, padding: '11px 40px 11px 16px', cursor: 'pointer', boxSizing: 'border-box', boxShadow: open ? '0 0 0 4px rgba(165,74,255,0.12)' : 'none', transition: 'border-color 0.15s, box-shadow 0.15s', outline: 'none', position: 'relative' }}>
        {value || placeholder || 'Select one'}
        <svg style={{ position: 'absolute', right: 14, top: '50%', transform: `translateY(-50%) rotate(${open ? '180deg' : '0deg'})`, transition: 'transform 0.15s', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && menuPos && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10040 }} onClick={() => setOpen(false)}/>
          <div style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, width: menuPos.width, maxHeight: menuPos.maxHeight, overflowY: 'auto', background: '#fff', border: '1px solid #D0D5DD', borderRadius: 12, boxShadow: '0 8px 24px rgba(16,24,40,0.14)', zIndex: 10050 }}>
            {options.map(o => (
              <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); }}
                style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontFamily: 'Poppins,sans-serif', fontSize: 13, color: o === value ? BRAND : '#344054', background: o === value ? '#F4EBFF' : 'transparent', fontWeight: o === value ? 600 : 400, border: 'none', cursor: 'pointer', display: 'block', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (o !== value) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                onMouseLeave={e => { if (o !== value) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                {o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Shared modal shell helpers ─────────────────────────── */
const MODAL_OVERLAY: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.52)', zIndex: 9999,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
};
const MODAL_SHADOW = '0 20px 24px -4px rgba(16,24,40,0.08), 0 8px 8px -4px rgba(16,24,40,0.03)';

function ModalCloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: '#F2F4F7', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#667085" strokeWidth="2.5" strokeLinecap="round"/></svg>
    </button>
  );
}

function MessageButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: BRAND, background: '#F4EBFF', border: '1.5px solid rgba(165,74,255,0.25)', borderRadius: PILL, padding: '8px 16px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, transition: 'all 0.15s', flexShrink: 0 }}
      onMouseEnter={e => { if (disabled) return; const el = e.currentTarget as HTMLElement; el.style.background='#EDD9FF'; el.style.borderColor='rgba(165,74,255,0.5)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='#F4EBFF'; el.style.borderColor='rgba(165,74,255,0.25)'; }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      {label}
    </button>
  );
}

/* ─── ThreeDotMenu ───────────────────────────────────────── */
function ThreeDotMenu({ onReport }: { onReport: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1.5px solid #EAECF0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='#D0D5DD'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='#EAECF0'; }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill="#667085"/><circle cx="12" cy="12" r="1.5" fill="#667085"/><circle cx="12" cy="19" r="1.5" fill="#667085"/></svg>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setOpen(false)}/>
          <div style={{ position: 'absolute', top: 40, right: 0, background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 12, padding: 6, minWidth: 180, boxShadow: '0 8px 28px rgba(16,24,40,0.14)', zIndex: 10 }}>
            <button onClick={() => { onReport(); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#D92D20', background: 'none', border: 'none', cursor: 'pointer', padding: '9px 12px', borderRadius: 8 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#FEF3F2'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='none'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#D92D20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="#D92D20" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="#D92D20" strokeWidth="2" strokeLinecap="round"/></svg>
              Report Seller
            </button>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#344054', background: 'none', border: 'none', cursor: 'pointer', padding: '9px 12px', borderRadius: 8 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#F9FAFB'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='none'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#667085" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="#667085" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Get Help
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── UpcomingActionsMenu ────────────────────────────────── */
function UpcomingActionsMenu({ onEdit, onCancel }: { onEdit: () => void; onCancel: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1.5px solid #EAECF0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='#D0D5DD'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='#EAECF0'; }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill="#667085"/><circle cx="12" cy="12" r="1.5" fill="#667085"/><circle cx="12" cy="19" r="1.5" fill="#667085"/></svg>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setOpen(false)}/>
          <div style={{ position: 'absolute', top: 42, right: 0, background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 12, padding: 6, minWidth: 190, boxShadow: '0 8px 28px rgba(16,24,40,0.14)', zIndex: 10 }}>
            <button onClick={() => { onEdit(); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#344054', background: 'none', border: 'none', cursor: 'pointer', padding: '9px 12px', borderRadius: 8 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#F9FAFB'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='none'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Edit Booking
            </button>
            <button onClick={() => { onCancel(); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#D92D20', background: 'none', border: 'none', cursor: 'pointer', padding: '9px 12px', borderRadius: 8 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#FEF3F2'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='none'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#D92D20" strokeWidth="2" strokeLinecap="round"/></svg>
              Cancel Booking
            </button>
          </div>
        </>
      )}
    </div>
  );
}

type ReviewMediaItem = { file: File; url: string };

type CompleteReviewPayload = {
  rating: number;
  comment: string;
  images: File[];
  videos: File[];
};

/* ─── MarkCompleteModal ──────────────────────────────────── */
function MarkCompleteModal({
  onClose,
  onDone,
  onReport,
  isSubmitting,
}: {
  booking: DetailedBooking;
  onClose: () => void;
  onDone: (review: CompleteReviewPayload) => Promise<boolean>;
  onReport: () => void;
  isSubmitting: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<ReviewMediaItem[]>([]);
  const [rating, setRating] = useState(0);
  const [hover,  setHover]  = useState(0);
  const [review, setReview] = useState('');
  const [media, setMedia] = useState<ReviewMediaItem[]>([]);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(() => {
    return () => {
      mediaRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const addMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setMedia((prev) => [
      ...prev,
      ...files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
    e.target.value = '';
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }} style={MODAL_OVERLAY}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: MODAL_SHADOW }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, color: '#101828', margin: 0 }}>Mark favor completed</h2>
            <ModalCloseBtn onClose={isSubmitting ? () => undefined : onClose} />
          </div>
          <div style={{ height: 1, background: '#EAECF0', margin: '0 -24px' }}/>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', lineHeight: 1.6, marginBottom: 24 }}>
            Please provide your valuable feedback about the seller and the service.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            {[1,2,3,4,5].map(i => (
              <button key={i} type="button" disabled={isSubmitting} onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
                style={{ background: 'none', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', padding: 2, lineHeight: 0 }}>
                <svg width="40" height="40" viewBox="0 0 24 24">
                  <polygon fill={(hover||rating)>=i?'#F79009':'#E4E7EC'} stroke={(hover||rating)>=i?'#F79009':'#D0D5DD'} strokeWidth="0.5" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 8 }}>How was your experience? (optional)</p>
            <textarea value={review} disabled={isSubmitting} onChange={e => setReview(e.target.value)} placeholder="Type here"
              style={{ width: '100%', minHeight: 96, fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#101828', border: '1px solid #D0D5DD', borderRadius: 12, padding: '12px 14px', outline: 'none', resize: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s', display: 'block' }}
              onFocus={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = BRAND; el.style.boxShadow = '0 0 0 4px rgba(165,74,255,0.12)'; }}
              onBlur={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#D0D5DD'; el.style.boxShadow = 'none'; }}/>
          </div>

          <div>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 10 }}>Attach photos/videos (optional)</p>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={addMedia} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {media.map((item, i) => (
                <div key={item.url} style={{ position: 'relative', width: 68, height: 68 }}>
                  {item.file.type.startsWith('video/') ? (
                    <video src={item.url} muted style={{ width: 68, height: 68, borderRadius: 10, objectFit: 'cover', border: '1px solid #EAECF0', background: '#101828' }} />
                  ) : (
                    <img src={item.url} alt="" style={{ width: 68, height: 68, borderRadius: 10, objectFit: 'cover', border: '1px solid #EAECF0' }}/>
                  )}
                  <button type="button" onClick={() => removeMedia(i)} disabled={isSubmitting}
                    style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#344054', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
              <button type="button" disabled={isSubmitting} onClick={() => fileRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 600, color: BRAND, background: 'none', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round"/></svg>
                Upload
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, borderTop: '1px solid #EAECF0', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            disabled={isSubmitting || rating < 1}
            onClick={async () => {
              if (rating < 1) {
                showToast('Please rate the seller before marking complete.', 'warning');
                return;
              }
              const ok = await onDone({
                rating,
                comment: review.trim(),
                images: media.filter((item) => item.file.type.startsWith('image/')).map((item) => item.file),
                videos: media.filter((item) => item.file.type.startsWith('video/')).map((item) => item.file),
              });
              if (!ok) return;
            }}
            style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '13px', cursor: (isSubmitting || rating < 1) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || rating < 1) ? 0.6 : 1, transition: 'opacity 0.15s' }}
          >
            {isSubmitting ? 'Marking complete...' : 'Mark complete'}
          </button>
          <button type="button" onClick={onReport} disabled={isSubmitting}
            style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 600, color: '#D92D20', background: 'none', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', textAlign: 'center', padding: '4px 0', opacity: isSubmitting ? 0.6 : 1 }}>
            Report favor
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CompletedSuccessModal ──────────────────────────────── */
function CompletedSuccessModal({ onClose }: { onClose: () => void }) {
  const dots = [
    { x:-52, y:-46, s:9, c:'#F79009' },{ x:48, y:-52, s:7, c:'#F04438' },
    { x:-64, y:-8,  s:6, c:'#17B26A' },{ x:60, y:-4,  s:8, c:'#A54AFF' },
    { x:-52, y:28,  s:5, c:'#2E90FA' },{ x:56, y:34,  s:7, c:'#FEC84B' },
    { x:-24, y:56,  s:6, c:'#F04438' },{ x:28, y:60,  s:5, c:'#17B26A' },
  ];
  return (
    <div style={{ ...MODAL_OVERLAY, zIndex: 110 }}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 360, width: '100%', padding: '40px 28px 32px', textAlign: 'center', boxShadow: MODAL_SHADOW }}>
        <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 24px' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#17B26A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {dots.map((d,i) => (
            <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: d.s, height: d.s, borderRadius: '50%', background: d.c, transform: `translate(calc(-50% + ${d.x}px), calc(-50% + ${d.y}px))` }}/>
          ))}
        </div>
        <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 20, color: '#101828', marginBottom: 8 }}>Favor completed!</h2>
        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', marginBottom: 28 }}>Thanks for your feedback. Your review has been submitted.</p>
        <button onClick={onClose}
          style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '13px', cursor: 'pointer', transition: 'opacity 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
          Done
        </button>
      </div>
    </div>
  );
}

/* ─── InProgressCancelModal ──────────────────────────────── */
function InProgressCancelModal({
  onClose,
  onConfirm,
  onDone,
  isSubmitting,
  variant = 'cancel',
}: {
  booking: DetailedBooking;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<boolean>;
  onDone: () => void;
  isSubmitting: boolean;
  variant?: 'cancel' | 'reject';
}) {
  const [done, setDone] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const DEMO_PHOTOS = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&auto=format&q=75',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop&auto=format&q=75',
  ];
  const cancelReason = reason === 'Other' ? (note.trim() || 'Other') : reason;
  const canSubmit = Boolean(reason) && (reason !== 'Other' || Boolean(note.trim())) && !isSubmitting;
  const isReject = variant === 'reject';
  const successTitle = isReject ? 'Completion rejected' : 'Favor cancelled!';
  const successCopy = isReject
    ? 'This completion request was rejected and the booking has been cancelled. You can find it in History.'
    : 'This booking has been cancelled. You can find it in History.';
  const submitLabel = isReject ? 'Reject Complete' : 'Cancel Booking';
  const submittingLabel = isReject ? 'Rejecting...' : 'Cancelling...';
  const keepLabel = isReject ? 'Keep booking' : "Don't Cancel";

  /* ── Confirmed / success card ──────────────────────────── */
  if (done) return (
    <div style={MODAL_OVERLAY}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 380, width: '100%', padding: '40px 28px 32px', textAlign: 'center', boxShadow: MODAL_SHADOW }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F4EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 20, color: '#101828', marginBottom: 8 }}>{successTitle}</h2>
        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', lineHeight: 1.6, marginBottom: 28 }}>
          {successCopy}
        </p>
        <button onClick={onDone}
          style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '13px', cursor: 'pointer', marginBottom: 10, transition: 'opacity 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
          Back to bookings
        </button>
        <button onClick={onDone}
          style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: '#344054', background: '#fff', border: '1px solid #D0D5DD', borderRadius: PILL, padding: '12px', cursor: 'pointer' }}>
          Close
        </button>
      </div>
    </div>
  );

  /* ── Form ──────────────────────────────────────────────── */
  return (
    <div onClick={e => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }} style={MODAL_OVERLAY}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: MODAL_SHADOW }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 17, color: '#101828', margin: 0, lineHeight: 1.3 }}>
              {isReject ? <>Tell us why you want to<br/>reject this completion</> : <>Tell us why you want to<br/>cancel this favor</>}
            </h2>
            <ModalCloseBtn onClose={isSubmitting ? () => undefined : onClose} />
          </div>
          <div style={{ height: 1, background: '#EAECF0', margin: '0 -24px' }}/>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', lineHeight: 1.65, marginBottom: 24 }}>
            {isReject
              ? "Please tell us why you're rejecting this completion. Payment will be withheld on both sides and will release after review within 72h. For further assistance, contact our "
              : "Please tell us why you're cancelling this favor. Try adding photos/videos to proof your case. Payment will be withheld on both sides and will release after review within 72h. For further assistance, contact our "}
            <span style={{ color: BRAND, fontWeight: 600, cursor: 'pointer' }}>support team</span>.
          </p>

          <div style={{ marginBottom: 18 }}>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 8 }}>Select reason</p>
            <ModalSelect value={reason} onChange={setReason} options={CANCEL_REASONS} placeholder="Select one" />
          </div>

          <div style={{ marginBottom: 18 }}>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 8 }}>Type your reason below</p>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Type here"
              style={{ width: '100%', minHeight: 90, fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#101828', border: '1px solid #D0D5DD', borderRadius: 12, padding: '12px 14px', outline: 'none', resize: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s', display: 'block' }}
              onFocus={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = BRAND; el.style.boxShadow = '0 0 0 4px rgba(165,74,255,0.12)'; }}
              onBlur={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#D0D5DD'; el.style.boxShadow = 'none'; }}/>
          </div>

          <div>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 10 }}>Attach photos/videos (optional)</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {photos.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 68, height: 68 }}>
                  <img src={src} alt="" style={{ width: 68, height: 68, borderRadius: 10, objectFit: 'cover', border: '1px solid #EAECF0' }}/>
                  <button onClick={() => setPhotos(p => p.filter((_,j) => j !== i))}
                    style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#344054', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
              <button onClick={() => { const next = DEMO_PHOTOS[photos.length % DEMO_PHOTOS.length]; setPhotos(p => [...p, next]); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 600, color: BRAND, background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round"/></svg>
                Upload
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, borderTop: '1px solid #EAECF0', padding: '16px 24px 24px', display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ flex: 1, fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: '#344054', background: '#fff', border: '1px solid #D0D5DD', borderRadius: PILL, padding: '12px 16px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1, transition: 'background 0.15s' }}
            onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
          >
            {keepLabel}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!canSubmit) return;
              const ok = await onConfirm(cancelReason);
              if (ok) setDone(true);
            }}
            disabled={!canSubmit}
            style={{ flex: 1, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '12px 16px', cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.5, transition: 'opacity 0.15s' }}
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── ReportModal ────────────────────────────────────────── */
const REPORT_REASONS: { label: string; code: string }[] = [
  { label: 'I feel unsafe', code: 'feel_unsafe' },
  { label: 'Unprofessional behavior', code: 'unprofessional_behavior' },
  { label: "Didn't complete the work", code: 'didnt_complete_work' },
  { label: 'Damaged property', code: 'damaged_property' },
  { label: 'No-show', code: 'no_show' },
  { label: 'Other', code: 'other' },
];

type ReportBookingPayload = {
  reason_code: string;
  message: string;
  images: File[];
  videos: File[];
};

function ReportModal({
  onClose,
  onCancelBooking,
  onSubmit,
  isSubmitting,
  canCancelBooking = true,
}: {
  sellerName: string;
  onClose: () => void;
  onCancelBooking?: () => void;
  onSubmit: (payload: ReportBookingPayload) => Promise<boolean>;
  isSubmitting: boolean;
  canCancelBooking?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<ReviewMediaItem[]>([]);
  const [done, setDone] = useState(false);
  const [reasonCode, setReasonCode] = useState('');
  const [message, setMessage] = useState('');
  const [media, setMedia] = useState<ReviewMediaItem[]>([]);
  const reasonLabel = REPORT_REASONS.find((item) => item.code === reasonCode)?.label ?? '';

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(() => {
    return () => {
      mediaRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const addMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setMedia((prev) => [
      ...prev,
      ...files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
    e.target.value = '';
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

  /* ── Confirmation card ─────────────────────────────────── */
  if (done) return (
    <div style={MODAL_OVERLAY}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 400, width: '100%', padding: '36px 28px 28px', boxShadow: MODAL_SHADOW }}>
        <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 20, color: '#101828', marginBottom: 12 }}>Thanks for reporting</h2>
        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', lineHeight: 1.65, marginBottom: 28 }}>
          Your feedback helps us improve our platform and make it safe for the users. Our team will review the case and take necessary actions{canCancelBooking ? '. Do you want to cancel the booking or continue?' : '.'}
        </p>
        {canCancelBooking && (
          <button onClick={() => { onCancelBooking?.(); onClose(); }}
            style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 15, color: '#D92D20', background: '#FEF3F2', border: '1.5px solid #FECDCA', borderRadius: PILL, padding: '13px', cursor: 'pointer', marginBottom: 12, transition: 'background 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEE4E2'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FEF3F2'; }}>
            Cancel booking
          </button>
        )}
        <button onClick={onClose}
          style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 15, color: BRAND, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', padding: '8px 0' }}>
          {canCancelBooking ? 'Keep going' : 'Done'}
        </button>
      </div>
    </div>
  );

  /* ── Form ──────────────────────────────────────────────── */
  return (
    <div onClick={e => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }} style={MODAL_OVERLAY}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: MODAL_SHADOW }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, color: '#101828', margin: 0 }}>Report</h2>
            <ModalCloseBtn onClose={isSubmitting ? () => undefined : onClose} />
          </div>
          <div style={{ height: 1, background: '#EAECF0', margin: '0 -24px' }}/>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', marginBottom: 20 }}>
            Why you want to report this favor?
          </p>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 8 }}>Select reason</p>
            <ModalSelect
              value={reasonLabel}
              onChange={(label) => setReasonCode(REPORT_REASONS.find((item) => item.label === label)?.code ?? '')}
              options={REPORT_REASONS.map((item) => item.label)}
              placeholder="Select one"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 8 }}>Tell us more (optional)</p>
            <textarea
              value={message}
              disabled={isSubmitting}
              onChange={e => setMessage(e.target.value)}
              placeholder="Seller behaved inappropriately"
              style={{ width: '100%', minHeight: 90, fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#101828', border: '1px solid #D0D5DD', borderRadius: 12, padding: '12px 14px', outline: 'none', resize: 'none', boxSizing: 'border-box', display: 'block' }}
            />
          </div>

          <div>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 10 }}>Attach photos/videos as a proof (optional)</p>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={addMedia} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {media.map((item, i) => (
                <div key={item.url} style={{ position: 'relative', width: 68, height: 68 }}>
                  {item.file.type.startsWith('video/') ? (
                    <video src={item.url} muted style={{ width: 68, height: 68, borderRadius: 10, objectFit: 'cover', border: '1px solid #EAECF0', background: '#101828' }} />
                  ) : (
                    <img src={item.url} alt="" style={{ width: 68, height: 68, borderRadius: 10, objectFit: 'cover', border: '1px solid #EAECF0' }}/>
                  )}
                  <button type="button" onClick={() => removeMedia(i)} disabled={isSubmitting}
                    style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#344054', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
              <button type="button" disabled={isSubmitting} onClick={() => fileRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 600, color: BRAND, background: 'none', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round"/></svg>
                Upload
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, borderTop: '1px solid #EAECF0', padding: '16px 24px 24px', display: 'flex', gap: 12 }}>
          <button type="button" onClick={onClose} disabled={isSubmitting}
            style={{ flex: 1, fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: '#344054', background: '#fff', border: '1px solid #D0D5DD', borderRadius: PILL, padding: '12px 16px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1, transition: 'background 0.15s' }}
            onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !reasonCode}
            onClick={async () => {
              if (!reasonCode) {
                showToast('Please select a reason.', 'warning');
                return;
              }
              const ok = await onSubmit({
                reason_code: reasonCode,
                message: message.trim() || reasonLabel,
                images: media.filter((item) => item.file.type.startsWith('image/')).map((item) => item.file),
                videos: media.filter((item) => item.file.type.startsWith('video/')).map((item) => item.file),
              });
              if (ok) setDone(true);
            }}
            style={{ flex: 1, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '12px 16px', cursor: (isSubmitting || !reasonCode) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || !reasonCode) ? 0.6 : 1, transition: 'opacity 0.15s' }}
          >
            {isSubmitting ? 'Reporting...' : 'Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── WithdrawModal (pending request) ────────────────────── */
function WithdrawModal({
  onConfirm,
  onClose,
  isSubmitting,
}: {
  onConfirm: (reason: string) => void;
  onClose: () => void;
  isSubmitting: boolean;
}) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const canSubmit = Boolean(reason) && !isSubmitting;
  const cancelReason = reason === 'Other' ? (note.trim() || 'Other') : reason;

  return (
    <div onClick={e => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }} style={MODAL_OVERLAY}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', overflow: 'visible', boxShadow: MODAL_SHADOW }}>
        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, color: '#101828', margin: 0 }}>Withdraw Request?</h2>
            <ModalCloseBtn onClose={isSubmitting ? () => undefined : onClose} />
          </div>
          <div style={{ height: 1, background: '#EAECF0', margin: '0 -24px' }}/>
        </div>

        <div style={{ padding: 24 }}>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', lineHeight: 1.6, marginBottom: 20 }}>
            This will cancel your pending booking request. The seller will no longer see it.
          </p>
          <div style={{ marginBottom: reason === 'Other' ? 18 : 0 }}>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 8 }}>Select reason</p>
            <ModalSelect value={reason} onChange={setReason} options={WITHDRAW_REASONS} placeholder="Select one" />
          </div>
          {reason === 'Other' && (
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
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
            onClick={() => { if (canSubmit) onConfirm(cancelReason); }}
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

/* ─── CancelModal (upcoming — 80% refund) ────────────────── */
function CancelModal({ booking, onConfirm, onClose }: { booking: DetailedBooking; onConfirm: () => void; onClose: () => void }) {
  const refund = Math.round(booking.price * 0.8 * 100) / 100;
  const fee    = Math.round(booking.price * 0.2 * 100) / 100;
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={MODAL_OVERLAY}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: MODAL_SHADOW }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, color: '#101828', margin: 0 }}>Cancel Booking?</h2>
            <ModalCloseBtn onClose={onClose} />
          </div>
          <div style={{ height: 1, background: '#EAECF0', margin: '0 -24px' }}/>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#667085', lineHeight: 1.6, marginBottom: 20 }}>
            This action cannot be undone. Per our cancellation policy, you will receive an 80% refund of your payment.
          </p>

          <div style={{ background: '#FEF3F2', border: '1px solid #FECDCA', borderRadius: 12, padding: '14px 16px', marginBottom: 4 }}>
            {[['Amount paid', `$${booking.price.toFixed(2)}`, '#344054'], ['Cancellation fee (20%)', `-$${fee.toFixed(2)}`, '#D92D20']].map(([l, v, c], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#667085' }}>{l}</span>
                <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: c }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #FECDCA', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: '#344054' }}>You will receive</span>
              <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: '#079455' }}>${refund.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, borderTop: '1px solid #EAECF0', padding: '16px 24px 24px', display: 'flex', gap: 12 }}>
          <button onClick={onClose}
            style={{ flex: 1, fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: '#344054', background: '#fff', border: '1px solid #D0D5DD', borderRadius: PILL, padding: '12px 16px', cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
            Keep Booking
          </button>
          <button onClick={onConfirm}
            style={{ flex: 1, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', background: 'linear-gradient(135deg,#F97066,#D92D20)', border: 'none', borderRadius: PILL, padding: '12px 16px', cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── EditModal ──────────────────────────────────────────── */
function EditModal({ booking, onClose }: { booking: DetailedBooking; onClose: () => void }) {
  const init  = new Date(booking.date);
  const [year,  setYear]  = useState(init.getFullYear());
  const [month, setMonth] = useState(init.getMonth());
  const [day,   setDay]   = useState(init.getDate());
  const [hour,  setHour]  = useState(parseInt(booking.time.split(':')[0]));
  const [ampm,  setAmpm]  = useState<'AM'|'PM'>(booking.time.includes('PM')?'PM':'AM');
  const [addr,  setAddr]  = useState(booking.address);
  const calDays = getCalDays(year, month);
  const selSt: React.CSSProperties = { fontFamily:'Poppins,sans-serif', fontSize:13, color:'#344054', background:'#fff', border:'1.5px solid #D0D5DD', borderRadius:PILL, padding:'8px 14px', outline:'none', cursor:'pointer' };
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position:'fixed', inset:0, background:'rgba(16,24,40,0.52)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:16, maxWidth:560, width:'100%', maxHeight:'90vh', overflow:'auto', boxShadow: MODAL_SHADOW }}>
        <div style={{ padding:'22px 24px 18px', borderBottom:'1px solid #EAECF0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:17, color:'#101828', margin:0 }}>Edit Booking</p>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1.5px solid #EAECF0', background:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#667085" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <button onClick={() => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }} style={{ width:30, height:30, borderRadius:'50%', border:'1.5px solid #EAECF0', background:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
            <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#101828' }}>{MONTHS[month]} {year}</span>
            <button onClick={() => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }} style={{ width:30, height:30, borderRadius:'50%', border:'1.5px solid #EAECF0', background:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} style={{ textAlign:'center', fontFamily:'Poppins,sans-serif', fontSize:11, color:'#98A2B3', fontWeight:600, padding:'4px 0' }}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:18 }}>
            {calDays.map((d,i) => {
              if(!d) return <div key={`n${i}`}/>;
              const past=isPast(year,month,d), today=isToday(year,month,d), sel=d===day&&!past;
              return <button key={d} onClick={() => { if(!past) setDay(d); }} disabled={past} style={{ aspectRatio:'1', borderRadius:'50%', border:'none', fontFamily:'Poppins,sans-serif', fontSize:13, cursor:past?'not-allowed':'pointer', background:sel?BRAND:today?'#F4EBFF':'transparent', color:sel?'#fff':past?'#D0D5DD':today?BRAND:'#344054', fontWeight:sel||today?700:400 }}>{d}</button>;
            })}
          </div>
          <div style={{ display:'flex', gap:10, marginBottom:18 }}>
            <select value={hour} onChange={e => setHour(Number(e.target.value))} style={selSt}>{Array.from({length:12},(_,i)=>i+1).map(h=><option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}</select>
            <select value={ampm} onChange={e => setAmpm(e.target.value as 'AM'|'PM')} style={selSt}><option>AM</option><option>PM</option></select>
          </div>
          <input value={addr} onChange={e => setAddr(e.target.value)} style={{ width:'100%', fontFamily:'Poppins,sans-serif', fontSize:14, color:'#101828', border:'1.5px solid #D0D5DD', borderRadius:PILL, padding:'10px 16px', outline:'none', boxSizing:'border-box', marginBottom:22, transition:'border-color 0.15s' }} onFocus={e=>{(e.currentTarget as HTMLElement).style.borderColor=BRAND;}} onBlur={e=>{(e.currentTarget as HTMLElement).style.borderColor='#D0D5DD';}}/>
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={onClose} style={{ flex:1, fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:14, color:'#344054', background:'#fff', border:'1.5px solid #D0D5DD', borderRadius:PILL, padding:'13px', cursor:'pointer' }}>Cancel</button>
            <button onClick={onClose} style={{ flex:1, fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:14, color:'#fff', background:GRAD, border:'none', borderRadius:PILL, padding:'13px', cursor:'pointer' }}>Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MessageDrawer ──────────────────────────────────────── */
function MessageDrawer({
  name,
  conversationId,
  canSend,
  onClose,
}: {
  name: string;
  conversationId: number;
  canSend: boolean;
  onClose: () => void;
}) {
  const [msg, setMsg] = useState('');
  const [sendMessage, { isLoading }] = useSendBuyerConversationMessageMutation();
  const canSubmit = canSend && Boolean(msg.trim()) && !isLoading;

  const handleSend = async () => {
    const body = msg.trim();
    if (!body || !canSend || isLoading) return;
    try {
      const response = await sendMessage({
        conversationId,
        body,
        clientMsgId: newClientMsgId(),
      }).unwrap();
      showToast(response.message || 'Message sent.', 'success');
      onClose();
    } catch {
      // axios interceptor already toasts API errors
    }
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget && !isLoading) onClose(); }} style={MODAL_OVERLAY}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: MODAL_SHADOW }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, color: '#101828', margin: 0 }}>Message {name}</h2>
            <ModalCloseBtn onClose={() => { if (!isLoading) onClose(); }} />
          </div>
          <div style={{ height: 1, background: '#EAECF0', margin: '0 -24px' }}/>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <textarea
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder={canSend ? 'Type your message...' : 'Messaging is unavailable for this booking.'}
            disabled={!canSend || isLoading}
            style={{ width: '100%', minHeight: 120, fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#101828', border: '1px solid #D0D5DD', borderRadius: 12, padding: '12px 14px', outline: 'none', resize: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s', display: 'block', opacity: canSend ? 1 : 0.7 }}
            onFocus={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = BRAND; el.style.boxShadow = '0 0 0 4px rgba(165,74,255,0.12)'; }}
            onBlur={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#D0D5DD'; el.style.boxShadow = 'none'; }}/>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, borderTop: '1px solid #EAECF0', padding: '16px 24px 24px' }}>
          <button
            type="button"
            onClick={() => { void handleSend(); }}
            disabled={!canSubmit}
            style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '13px', cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.5, transition: 'opacity 0.15s' }}>
            {isLoading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */
export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;
  const bookingId = Number(id);
  const token = useAppSelector((state) => state.auth.token);
  const skip = !token || !Number.isFinite(bookingId) || bookingId <= 0;

  const { data, isLoading, isError, refetch } = useGetBuyerBookingByIdQuery(bookingId, { skip });
  const [withdrawBooking, { isLoading: isWithdrawing }] = useWithdrawBuyerBookingMutation();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBuyerBookingMutation();
  const [approveComplete, { isLoading: isApproving }] = useApproveBuyerBookingCompleteMutation();
  const [addReview, { isLoading: isReviewing }] = useAddBuyerBookingReviewMutation();
  const [reportBooking, { isLoading: isReporting }] = useReportBuyerBookingMutation();
  const [startConversation, { isLoading: isStartingChat }] = useStartBuyerConversationByBookingMutation();
  const isSubmittingComplete = isApproving || isReviewing;
  const mapped = useMemo(() => {
    const item = data?.data?.booking;
    if (!item) return null;
    return toDetailedBooking(item, data?.data?.review ?? null);
  }, [data]);

  const [authOpen, setAuthOpen]       = useState(false);
  const [showEdit,        setShowEdit]        = useState(false);
  const [showPreCancel,   setShowPreCancel]   = useState(false);
  const [showLiveCancel,  setShowLiveCancel]  = useState(false);
  const [showMarkDone,    setShowMarkDone]    = useState(false);
  const [showDoneSuccess, setShowDoneSuccess] = useState(false);
  const [showReport,      setShowReport]      = useState(false);
  const [showMessage,     setShowMessage]     = useState<{ name: string; conversationId: number; canSend: boolean } | null>(null);
  const [showWithdraw,    setShowWithdraw]    = useState(false);

  const booking = mapped;

  if (!token) return (
    <>
      <Navbar />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Log in to view this booking."
        />
      )}
      <main style={{ minHeight:'100vh', background:'#F9FAFB', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center' }}>
        <h3 style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:18, color:'#101828', marginBottom:8 }}>Log in to view this booking</h3>
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#667085', maxWidth:320, lineHeight:1.65, marginBottom:20 }}>
          Sign in to see booking details, status, and seller information.
        </p>
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:14, color:'#fff', background:GRAD, border:'none', borderRadius:PILL, padding:'11px 22px', cursor:'pointer' }}
        >
          Log in
        </button>
      </main>
      <Footer />
    </>
  );

  if (isLoading) return (
    <>
      <Navbar />
      <main style={{ minHeight:'100vh', background:'#F9FAFB' }}>
        <div style={{ background:'#fff', borderBottom:'1px solid #EAECF0', paddingTop:104, paddingBottom:24 }}>
          <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>
            <div style={{ width:140, height:14, borderRadius:4, background:'#F2F4F7', marginBottom:16 }} />
            <div style={{ width:260, height:28, borderRadius:6, background:'#F2F4F7' }} />
          </div>
        </div>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
            <div style={{ background:'#fff', border:'1.5px solid #EAECF0', borderRadius:20, height:180 }} />
            <div style={{ background:'#fff', border:'1.5px solid #EAECF0', borderRadius:20, height:180 }} />
            <div style={{ background:'#fff', border:'1.5px solid #EAECF0', borderRadius:20, height:220 }} />
            <div style={{ background:'#fff', border:'1.5px solid #EAECF0', borderRadius:20, height:220 }} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );

  if (isError || !booking) return (
    <>
      <Navbar />
      <main style={{ minHeight:'100vh', background:'#F9FAFB', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center' }}>
        <h3 style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:18, color:'#101828', marginBottom:8 }}>
          {isError ? 'Could not load booking' : 'Booking not found'}
        </h3>
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#667085', maxWidth:320, lineHeight:1.65, marginBottom:16 }}>
          {isError ? 'Please try again in a moment.' : 'This booking may have been removed or the link is invalid.'}
        </p>
        {isError ? (
          <button
            type="button"
            onClick={() => { void refetch(); }}
            style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:14, color:BRAND, background:'none', border:'none', cursor:'pointer' }}
          >
            Try again
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push('/bookings')}
            style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:14, color:BRAND, background:'none', border:'none', cursor:'pointer' }}
          >
            Back to bookings
          </button>
        )}
      </main>
      <Footer />
    </>
  );

  const isLive    = booking.status === 'InProgress';
  const isAwaitingComplete = booking.status === 'Complete';
  const days      = getDaysUntil(booking.dateIso || booking.date);
  const canWithdraw = booking.status === 'Pending';

  const handleDoneSuccess = () => { setShowDoneSuccess(false); router.push('/bookings'); };
  const handlePreCancelConfirm = () => { setShowPreCancel(false); router.push('/bookings'); };
  const handleLiveCancelConfirm = () => { setShowLiveCancel(false); router.push('/bookings'); };
  const handleLiveCancel = async (cancelReason: string) => {
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
  const handleApproveComplete = async (review: CompleteReviewPayload) => {
    try {
      const response = await approveComplete({ booking_id: bookingId }).unwrap();
      try {
        await addReview({
          booking_id: bookingId,
          rating: review.rating,
          comment: review.comment,
          images: review.images.length ? review.images : undefined,
          videos: review.videos.length ? review.videos : undefined,
        }).unwrap();
      } catch {
        // Booking is already complete; interceptor toasts the review error.
      }
      setShowMarkDone(false);
      showToast(response.message || 'Booking marked complete.', 'success');
      setShowDoneSuccess(true);
      return true;
    } catch {
      return false;
    }
  };
  const handleReport = async (payload: ReportBookingPayload) => {
    try {
      const response = await reportBooking({
        booking_id: bookingId,
        reason_code: payload.reason_code,
        message: payload.message,
        images: payload.images.length ? payload.images : undefined,
        videos: payload.videos.length ? payload.videos : undefined,
      }).unwrap();
      showToast(response.message || 'Report submitted.', 'success');
      return true;
    } catch {
      return false;
    }
  };
  const handleWithdraw = async (cancelReason: string) => {
    try {
      const response = await withdrawBooking({
        booking_id: bookingId,
        cancel_reason: cancelReason,
      }).unwrap();
      setShowWithdraw(false);
      showToast(response.message || 'Request withdrawn.', 'success');
      router.push('/bookings');
    } catch {
      // axios interceptor already toasts API errors
    }
  };
  const handleOpenChat = async (fallbackName: string) => {
    try {
      const response = await startConversation(bookingId).unwrap();
      const conversation = response.data?.conversation;
      if (!conversation?.id) {
        showToast('Could not start this conversation. Please try again.', 'error');
        return;
      }
      setShowMessage({
        name: conversation.otherParticipant?.fullName || fallbackName,
        conversationId: conversation.id,
        canSend: conversation.canSend !== false,
      });
    } catch {
      // axios interceptor already toasts API errors
    }
  };

  const platformFee = booking.platformFee;
  const addonsTotal = booking.addons.reduce((s,a) => s + a.price, 0);
  const base        = booking.sellerAmount || (booking.price - addonsTotal - platformFee);
  const boostDiscount = booking.boostDiscount;

  /* Status pill (inline header) */
  function StatusPill() {
    const cfg: Record<Status, { bg: string; border: string; color: string; label: string }> = {
      InProgress: { bg:'#FFF4ED', border:'#F9DBAF', color:'#C4320A', label:'In Progress' },
      Upcoming:   { bg:'#ECFDF3', border:'#A9EFC5', color:'#079455', label:'Upcoming' },
      Pending:    { bg:'#FFFAEB', border:'#FEDF89', color:'#B54708', label:'Pending' },
      Declined:   { bg:'#FEF3F2', border:'#FECDCA', color:'#B42318', label:'Declined' },
      Cancelled:  { bg:'#F2F4F7', border:'#D0D5DD', color:'#667085', label:'Cancelled' },
      Complete:   { bg:'#F9F5FF', border:'#E9D7FE', color:'#6941C6', label:'Complete' },
      Completed:  { bg:'#EEF4FF', border:'#C7D7FE', color:'#3538CD', label:'Completed' },
    };
    const c = cfg[booking!.status];
    return (
      <span style={{ display:'inline-flex', alignItems:'center', background:c.bg, border:`1.5px solid ${c.border}`, borderRadius:9999, padding:'6px 14px', fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:13, color:c.color, flexShrink:0, whiteSpace:'nowrap' }}>
        {c.label}
      </span>
    );
  }

  /* Status banner */
  function StatusBanner() {
    const bk = booking!;
    if (isLive) return (
      <div style={{ background:'#FFF4ED', border:'1.5px solid #F9DBAF', borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ position:'relative', width:18, height:18, flexShrink:0 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:'#C4320A', position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:1 }}/>
          <div style={{ width:10, height:10, borderRadius:'50%', background:'#C4320A', position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', animation:'mapRing 1.6s ease-out infinite' }}/>
        </div>
        <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:14, color:'#C4320A', margin:0 }}>Favor is in progress</p>
      </div>
    );
    const CFG: Record<Status, { bg:string; border:string; color:string; text:string; iconPath:string; }> = {
      InProgress: { bg:'#FFF4ED', border:'#F9DBAF', color:'#C4320A', text:'', iconPath:'' },
      Upcoming:  { bg:'#ECFDF3', border:'#A9EFC5', color:'#079455', text: days>1?`Booking starts in ${days} days`:days===1?'Booking starts tomorrow':days===0?'Ready to start today':`Booking date has passed`, iconPath:'M8 12l3 3 5-5' },
      Pending:   { bg:'#FFFAEB', border:'#FEDF89', color:'#B54708', text:'Awaiting seller response', iconPath:'M12 8v4M12 16h.01' },
      Declined:  { bg:'#FEF3F2', border:'#FECDCA', color:'#B42318', text:'Your request was declined', iconPath:'M15 9l-6 6M9 9l6 6' },
      Cancelled: { bg:'#F2F4F7', border:'#D0D5DD', color:'#667085', text:bk.cancelledReason||'Booking was cancelled', iconPath:'M15 9l-6 6M9 9l6 6' },
      Complete:  { bg:'#F9F5FF', border:'#E9D7FE', color:'#6941C6', text:'Seller marked this favor complete. Approve or reject to finish.', iconPath:'M8 12l3 3 5-5' },
      Completed: { bg:'#EEF4FF', border:'#C7D7FE', color:'#3538CD', text:'Service completed', iconPath:'M8 12l3 3 5-5' },
    };
    const c = CFG[bk.status];
    return (
      <div style={{ background:c.bg, border:`1.5px solid ${c.border}`, borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', gap:12 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c.color} strokeWidth="2"/><path d={c.iconPath} stroke={c.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:14, color:c.color, margin:0, flex:1 }}>{c.text}</p>
        {bk.status==='Cancelled' && bk.refundAmount && (
          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#667085' }}>{formatUsd(bk.refundAmount)} refunded</span>
        )}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes mapRing { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
      `}</style>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F9FAFB' }}>

        {/* Header */}
        <div style={{ background:'#fff', borderBottom:'1px solid #EAECF0', paddingTop:104, paddingBottom:24 }}>
          <div style={{ maxWidth: isLive ? 1200 : 1100, margin:'0 auto', padding:'0 24px' }}>
            <button onClick={() => router.push('/bookings')}
              style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:500, color:'#667085', background:'none', border:'none', cursor:'pointer', marginBottom:14, padding:0, transition:'color 0.15s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=BRAND;}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='#667085';}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to bookings
            </button>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
              <h1 style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:22, color:'#101828', margin:0 }}>
                {isLive ? 'In Progress Booking' : isAwaitingComplete ? 'Complete Booking' : booking.status==='Upcoming' ? 'Upcoming Booking' : booking.status==='Pending' ? 'Booking Request' : booking.status==='Completed' ? 'Completed Booking' : booking.title}
              </h1>

              {/* ── InProgress: Cancel + three-dot ── */}
              {isLive && (
                <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                  <StatusPill />
                  <button onClick={() => setShowLiveCancel(true)}
                    style={{ display:'inline-flex', alignItems:'center', gap:7, fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:14, color:'#D92D20', background:'#fff', border:'1.5px solid #D92D20', borderRadius:PILL, padding:'10px 18px', cursor:'pointer', whiteSpace:'nowrap', transition:'background 0.15s' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='#FEF3F2';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='#fff';}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#D92D20" strokeWidth="2" strokeLinecap="round"/></svg>
                    Cancel Favor
                  </button>
                  <ThreeDotMenu onReport={() => setShowReport(true)} />
                </div>
              )}

              {/* ── Complete: Mark complete + Reject Complete ── */}
              {isAwaitingComplete && (
                <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                  <StatusPill />
                  <button
                    type="button"
                    onClick={() => setShowMarkDone(true)}
                    disabled={isApproving}
                    style={{ display:'inline-flex', alignItems:'center', gap:7, fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:14, color:'#fff', background:GRAD, border:'none', borderRadius:PILL, padding:'11px 18px', cursor: isApproving ? 'not-allowed' : 'pointer', whiteSpace:'nowrap', boxShadow:'0 3px 12px rgba(165,74,255,0.3)', opacity: isApproving ? 0.7 : 1, transition:'opacity 0.15s' }}
                    onMouseEnter={e=>{ if (!isApproving) (e.currentTarget as HTMLElement).style.opacity='0.9'; }}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.opacity= isApproving ? '0.7' : '1';}}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Mark complete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLiveCancel(true)}
                    style={{ display:'inline-flex', alignItems:'center', gap:7, fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:14, color:'#D92D20', background:'#fff', border:'1.5px solid #D92D20', borderRadius:PILL, padding:'10px 18px', cursor:'pointer', whiteSpace:'nowrap', transition:'background 0.15s' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='#FEF3F2';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='#fff';}}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#D92D20" strokeWidth="2" strokeLinecap="round"/></svg>
                    Reject Complete
                  </button>
                  <ThreeDotMenu onReport={() => setShowReport(true)} />
                </div>
              )}

              {/* ── Pending / history: status pill ── */}
              {!isLive && !isAwaitingComplete && booking.status !== 'Upcoming' && (
                <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                  <StatusPill />
                  <ThreeDotMenu onReport={() => setShowReport(true)} />
                </div>
              )}

              {/* ── Upcoming: days pill + three-dot ── */}
              {!isLive && booking.status==='Upcoming' && (
                <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                  {days > 0 && (
                    <div style={{ background:'#F4EBFF', border:'1px solid rgba(165,74,255,0.22)', borderRadius:PILL, padding:'10px 20px' }}>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:14, color:BRAND }}>
                        Favor will start in {days} {days===1?'day':'days'}
                      </span>
                    </div>
                  )}
                  <UpcomingActionsMenu onEdit={() => setShowEdit(true)} onCancel={() => setShowPreCancel(true)} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body ── InProgress ───────────────────────────────── */}
        {isLive && (
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px 48px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:24, alignItems:'flex-start' }}>

              {/* Left sticky details */}
              <div style={{ position:'sticky', top:104, display:'flex', flexDirection:'column', gap:20 }}>
                <Section title="Favor">
                  <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                    <FavorImage src={booking.image} alt={booking.title} style={{ width:100, height:72, borderRadius:12, objectFit:'cover', flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:16, color:'#101828', marginBottom:6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{booking.title}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:'#667085', background:'#F9F5FF', border:'1px solid #E9D7FE', borderRadius:PILL, padding:'3px 10px' }}>{booking.category}</span>
                        <PlanLabel plan={booking.plan} />
                      </div>
                    </div>
                    <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:22, color:BRAND, flexShrink:0 }}>{formatUsd(booking.price)}</span>
                  </div>
                </Section>

                <Section title={booking.isTeam ? 'Team' : 'Seller'}>
                  {booking.isTeam ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <img src={booking.teamLogo} alt={booking.teamName} style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(52,64,84,0.25)', flexShrink:0 }}/>
                        <div style={{ flex:1 }}>
                          <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#101828', marginBottom:4 }}>{booking.teamName}</p>
                          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:700, background:'#344054', color:'#fff', borderRadius:PILL, padding:'2px 8px' }}>Team</span>
                        </div>
                        <MessageButton label="Message team" onClick={() => { void handleOpenChat(booking.teamName!); }} disabled={isStartingChat} />
                      </div>
                      <div style={{ paddingTop:16, borderTop:'1px solid #EAECF0' }}>
                        <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:13, color:'#667085', marginBottom:12 }}>Your favor provider from the team</p>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <img src={booking.providerAvatar} alt={booking.providerName} style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', border:'2px solid #DFBAFF', flexShrink:0 }}/>
                          <div style={{ flex:1 }}>
                            <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#101828', marginBottom:3 }}>{booking.providerName}</p>
                            <MilesAway miles={booking.providerDistance} />
                          </div>
                          <MessageButton label="Message" onClick={() => { void handleOpenChat(booking.providerName!); }} disabled={isStartingChat} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <img src={booking.sellerAvatar} alt={booking.sellerName} style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover', border:'2px solid #DFBAFF', flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#101828', marginBottom:4 }}>{booking.sellerName}</p>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:700, background: booking.sellerBadge === 'Pro' ? '#A54AFF' : '#344054', color:'#fff', borderRadius:PILL, padding:'2px 8px' }}>{booking.sellerBadge}</span>
                          <MilesAway miles={booking.sellerDistance} />
                        </div>
                      </div>
                      <MessageButton label="Message" onClick={() => { void handleOpenChat(booking.sellerName); }} disabled={isStartingChat} />
                    </div>
                  )}
                </Section>

                <Section title="Date, Time & Location">
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {[
                      { icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke={BRAND} strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke={BRAND} strokeWidth="2" strokeLinecap="round"/></svg>, main:booking.date, sub:booking.time },
                      { icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={BRAND} strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke={BRAND} strokeWidth="2"/></svg>, main:booking.location, sub:booking.address },
                    ].map((row,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:'#F4EBFF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{row.icon}</div>
                        <div><p style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:14, color:'#101828', marginBottom:2 }}>{row.main}</p><p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#667085' }}>{row.sub}</p></div>
                      </div>
                    ))}
                  </div>
                </Section>

                {booking.requirements.length > 0 && (
                  <Section title="Requirements">
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      {booking.requirements.map((r,i) => (
                        <div key={i}>
                          <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:13, color:'#667085', marginBottom:5 }}>{r.q}</p>
                          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#101828', background:'#F9FAFB', borderRadius:10, padding:'10px 14px', margin:0 }}>{r.a}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {booking.addons.length > 0 && (
                  <Section title="Add-ons">
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {booking.addons.map((a,i) => (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#F9FAFB', borderRadius:10 }}>
                          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#344054', flex:1 }}>{a.label}</span>
                          <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:14, color:BRAND, flexShrink:0, marginLeft:12 }}>+{formatUsd(a.price)}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {(booking.note || booking.media.length > 0) && (
                  <Section title="Notes & Attachments">
                    {booking.note && <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#344054', background:'#F9FAFB', borderRadius:10, padding:'12px 14px', marginBottom:booking.media.length>0?14:0 }}>{booking.note}</p>}
                    {booking.media.length > 0 && (
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                        {booking.media.map((src,i) => <img key={i} src={src} alt="" style={{ width:80, height:80, borderRadius:10, objectFit:'cover', border:'1.5px solid #EAECF0' }}/>)}
                      </div>
                    )}
                  </Section>
                )}

                <Section title="Price Summary">
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#667085' }}>Base price</span>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#344054' }}>${base.toFixed(2)}</span>
                    </div>
                    {booking.addons.map((a,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#98A2B3', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', paddingRight:12 }}>Add-on: {a.label}</span>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#344054', flexShrink:0 }}>+{formatUsd(a.price)}</span>
                      </div>
                    ))}
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#667085' }}>Platform fee</span>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#344054' }}>${platformFee.toFixed(2)}</span>
                    </div>
                    {boostDiscount > 0 && (
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#667085' }}>Boost discount</span>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#079455' }}>-${boostDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ borderTop:'1px solid #EAECF0', paddingTop:12, display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#101828' }}>Total paid</span>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:16, color:BRAND }}>${booking.price.toFixed(2)}</span>
                    </div>
                  </div>
                </Section>
              </div>

              {/* Right: map + updates */}
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <Section title="Live Location">
                  <LiveLocationMap
                    lat={booking.lat}
                    lng={booking.lng}
                    sellerAvatar={booking.sellerAvatar}
                    sellerName={booking.sellerName}
                    address={booking.address}
                  />
                </Section>
                {booking.statusUpdates && booking.statusUpdates.length > 0 && (
                  <Section title="Updates">
                    <StatusMessages updates={booking.statusUpdates} />
                  </Section>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Body ── Upcoming / Pending ───────────────────────── */}
        {!isLive && (booking.status === 'Upcoming' || booking.status === 'Pending' || isAwaitingComplete) && (
          <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px 48px' }}>
            {isAwaitingComplete && (
              <div style={{ background:'#F9F5FF', border:'1.5px solid #E9D7FE', borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#6941C6" strokeWidth="2"/><path d="M8 12l3 3 5-5" stroke="#6941C6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:14, color:'#6941C6', margin:0 }}>
                  Seller marked this favor complete. Approve or reject to finish.
                </p>
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'flex-start' }}>

              {/* Left sticky */}
              <div style={{ position:'sticky', top:104, display:'flex', flexDirection:'column', gap:20 }}>
                <Section title="Favor">
                  <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                    <FavorImage src={booking.image} alt={booking.title} style={{ width:100, height:72, borderRadius:12, objectFit:'cover', flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:16, color:'#101828', marginBottom:6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{booking.title}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:'#667085', background:'#F9F5FF', border:'1px solid #E9D7FE', borderRadius:PILL, padding:'3px 10px' }}>{booking.category}</span>
                        <PlanLabel plan={booking.plan} />
                      </div>
                    </div>
                    <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:22, color:BRAND, flexShrink:0 }}>{formatUsd(booking.price)}</span>
                  </div>
                </Section>

                <Section title={booking.isTeam ? 'Team' : 'Seller'}>
                  {booking.isTeam ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <img src={booking.teamLogo} alt={booking.teamName} style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(52,64,84,0.25)', flexShrink:0 }}/>
                        <div style={{ flex:1 }}>
                          <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#101828', marginBottom:4 }}>{booking.teamName}</p>
                          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:700, background:'#344054', color:'#fff', borderRadius:PILL, padding:'2px 8px' }}>Team</span>
                        </div>
                        <MessageButton label="Message team" onClick={() => { void handleOpenChat(booking.teamName!); }} disabled={isStartingChat} />
                      </div>
                      <div style={{ paddingTop:16, borderTop:'1px solid #EAECF0' }}>
                        <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:13, color:'#667085', marginBottom:12 }}>Your favor provider from the team</p>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <img src={booking.providerAvatar} alt={booking.providerName} style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', border:'2px solid #DFBAFF', flexShrink:0 }}/>
                          <div style={{ flex:1 }}>
                            <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#101828', marginBottom:3 }}>{booking.providerName}</p>
                            <MilesAway miles={booking.providerDistance} />
                          </div>
                          <MessageButton label="Message" onClick={() => { void handleOpenChat(booking.providerName!); }} disabled={isStartingChat} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <img src={booking.sellerAvatar} alt={booking.sellerName} style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover', border:'2px solid #DFBAFF', flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#101828', marginBottom:4 }}>{booking.sellerName}</p>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:700, background: booking.sellerBadge === 'Pro' ? '#A54AFF' : '#344054', color:'#fff', borderRadius:PILL, padding:'2px 8px' }}>{booking.sellerBadge}</span>
                          <MilesAway miles={booking.sellerDistance} />
                        </div>
                      </div>
                      <MessageButton label="Message" onClick={() => { void handleOpenChat(booking.sellerName); }} disabled={isStartingChat} />
                    </div>
                  )}
                </Section>

                <Section title="Date, Time & Location">
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {[
                      { icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke={BRAND} strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke={BRAND} strokeWidth="2" strokeLinecap="round"/></svg>, main:booking.date, sub:booking.time },
                      { icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={BRAND} strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke={BRAND} strokeWidth="2"/></svg>, main:booking.location, sub:booking.address },
                    ].map((row,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:'#F4EBFF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{row.icon}</div>
                        <div><p style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:14, color:'#101828', marginBottom:2 }}>{row.main}</p><p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#667085' }}>{row.sub}</p></div>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>

              {/* Right: details + price */}
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {booking.requirements.length > 0 && (
                  <Section title="Requirements">
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      {booking.requirements.map((r,i) => (
                        <div key={i}>
                          <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:13, color:'#667085', marginBottom:5 }}>{r.q}</p>
                          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#101828', background:'#F9FAFB', borderRadius:10, padding:'10px 14px', margin:0 }}>{r.a}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {booking.addons.length > 0 && (
                  <Section title="Add-ons">
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {booking.addons.map((a,i) => (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#F9FAFB', borderRadius:10 }}>
                          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#344054', flex:1 }}>{a.label}</span>
                          <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:14, color:BRAND, flexShrink:0, marginLeft:12 }}>+{formatUsd(a.price)}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {(booking.note || booking.media.length > 0) && (
                  <Section title="Notes & Attachments">
                    {booking.note && <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#344054', background:'#F9FAFB', borderRadius:10, padding:'12px 14px', marginBottom:booking.media.length>0?14:0 }}>{booking.note}</p>}
                    {booking.media.length > 0 && (
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                        {booking.media.map((src,i) => <img key={i} src={src} alt="" style={{ width:80, height:80, borderRadius:10, objectFit:'cover', border:'1.5px solid #EAECF0' }}/>)}
                      </div>
                    )}
                  </Section>
                )}

                <Section title="Price Summary">
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#667085' }}>Base price</span>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#344054' }}>${base.toFixed(2)}</span>
                    </div>
                    {booking.addons.map((a,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#98A2B3', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', paddingRight:12 }}>Add-on: {a.label}</span>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#344054', flexShrink:0 }}>+{formatUsd(a.price)}</span>
                      </div>
                    ))}
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#667085' }}>Platform fee</span>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#344054' }}>${platformFee.toFixed(2)}</span>
                    </div>
                    {boostDiscount > 0 && (
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#667085' }}>Boost discount</span>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#079455' }}>-${boostDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ borderTop:'1px solid #EAECF0', paddingTop:12, display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#101828' }}>Total paid</span>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:16, color:BRAND }}>${booking.price.toFixed(2)}</span>
                    </div>
                  </div>
                </Section>

                {booking.status === 'Pending' && canWithdraw && (
                  <button
                    type="button"
                    onClick={() => setShowWithdraw(true)}
                    style={{ width:'100%', fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:14, color:'#B54708', background:'#fff', border:'1.5px solid #FEC84B', borderRadius:PILL, padding:'14px', cursor:'pointer', transition:'background 0.15s' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='#FFFAEB';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='#fff';}}>
                    Withdraw Request
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Body ── Completed / Cancelled / Declined ─────────── */}
        {!isLive && booking.status !== 'Upcoming' && booking.status !== 'Pending' && !isAwaitingComplete && (
          <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px 48px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'flex-start' }}>

              {/* Left: core details */}
              <div style={{ position:'sticky', top:104, display:'flex', flexDirection:'column', gap:20 }}>
                <Section title="Favor">
                  <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                    <FavorImage src={booking.image} alt={booking.title} style={{ width:100, height:72, borderRadius:12, objectFit:'cover', flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:16, color:'#101828', marginBottom:6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{booking.title}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:'#667085', background:'#F9F5FF', border:'1px solid #E9D7FE', borderRadius:PILL, padding:'3px 10px' }}>{booking.category}</span>
                        <PlanLabel plan={booking.plan} />
                      </div>
                    </div>
                    <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:22, color:BRAND, flexShrink:0 }}>{formatUsd(booking.price)}</span>
                  </div>
                </Section>

                <Section title={booking.isTeam ? 'Team' : 'Seller'}>
                  {booking.isTeam ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <img src={booking.teamLogo} alt={booking.teamName} style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(52,64,84,0.25)', flexShrink:0 }}/>
                        <div style={{ flex:1 }}>
                          <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#101828', marginBottom:4 }}>{booking.teamName}</p>
                          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:700, background:'#344054', color:'#fff', borderRadius:PILL, padding:'2px 8px' }}>Team</span>
                        </div>
                        <MessageButton label="Message team" onClick={() => { void handleOpenChat(booking.teamName!); }} disabled={isStartingChat} />
                      </div>
                      <div style={{ paddingTop:16, borderTop:'1px solid #EAECF0' }}>
                        <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:13, color:'#667085', marginBottom:12 }}>Your favor provider from the team</p>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <img src={booking.providerAvatar} alt={booking.providerName} style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', border:'2px solid #DFBAFF', flexShrink:0 }}/>
                          <div style={{ flex:1 }}>
                            <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#101828', marginBottom:3 }}>{booking.providerName}</p>
                            <MilesAway miles={booking.providerDistance} />
                          </div>
                          <MessageButton label="Message" onClick={() => { void handleOpenChat(booking.providerName!); }} disabled={isStartingChat} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <img src={booking.sellerAvatar} alt={booking.sellerName} style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover', border:'2px solid #DFBAFF', flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#101828', marginBottom:4 }}>{booking.sellerName}</p>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:700, background: booking.sellerBadge === 'Pro' ? '#A54AFF' : '#344054', color:'#fff', borderRadius:PILL, padding:'2px 8px' }}>{booking.sellerBadge}</span>
                          <MilesAway miles={booking.sellerDistance} />
                        </div>
                      </div>
                      <MessageButton label="Message" onClick={() => { void handleOpenChat(booking.sellerName); }} disabled={isStartingChat} />
                    </div>
                  )}
                </Section>

                <Section title="Date, Time & Location">
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {[
                      { icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke={BRAND} strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke={BRAND} strokeWidth="2" strokeLinecap="round"/></svg>, main:booking.date, sub:booking.time },
                      { icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={BRAND} strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke={BRAND} strokeWidth="2"/></svg>, main:booking.location, sub:booking.address },
                    ].map((row,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:'#F4EBFF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{row.icon}</div>
                        <div><p style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:14, color:'#101828', marginBottom:2 }}>{row.main}</p><p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#667085' }}>{row.sub}</p></div>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>

              {/* Right: feedback, add-ons, notes, price */}
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {booking.status === 'Completed' && (
                  <Section title="Your Feedback">
                    <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
                      <img src={booking.sellerAvatar} alt={booking.sellerName} style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', flexShrink:0, border:'2px solid #DFBAFF' }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                          <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:14, color:'#101828', margin:0 }}>{booking.sellerName}</p>
                          {booking.rating && <StarDisplay rating={booking.rating} />}
                        </div>
                        {booking.review && <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#344054', lineHeight:1.65, margin:0 }}>"{booking.review}"</p>}
                      </div>
                    </div>
                  </Section>
                )}

                {booking.requirements.length > 0 && (
                  <Section title="Requirements">
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      {booking.requirements.map((r,i) => (
                        <div key={i}>
                          <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:13, color:'#667085', marginBottom:5 }}>{r.q}</p>
                          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#101828', background:'#F9FAFB', borderRadius:10, padding:'10px 14px', margin:0 }}>{r.a}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {booking.addons.length > 0 && (
                  <Section title="Add-ons">
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {booking.addons.map((a,i) => (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#F9FAFB', borderRadius:10 }}>
                          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#344054', flex:1 }}>{a.label}</span>
                          <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:14, color:BRAND, flexShrink:0, marginLeft:12 }}>+{formatUsd(a.price)}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {(booking.note || booking.media.length > 0) && (
                  <Section title="Notes & Attachments">
                    {booking.note && <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#344054', background:'#F9FAFB', borderRadius:10, padding:'12px 14px', marginBottom:booking.media.length>0?14:0 }}>{booking.note}</p>}
                    {booking.media.length > 0 && (
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                        {booking.media.map((src,i) => <img key={i} src={src} alt="" style={{ width:80, height:80, borderRadius:10, objectFit:'cover', border:'1.5px solid #EAECF0' }}/>)}
                      </div>
                    )}
                  </Section>
                )}

                <Section title="Price Summary">
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#667085' }}>Base price</span>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#344054' }}>${base.toFixed(2)}</span>
                    </div>
                    {booking.addons.map((a,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#98A2B3', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', paddingRight:12 }}>Add-on: {a.label}</span>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#344054', flexShrink:0 }}>+{formatUsd(a.price)}</span>
                      </div>
                    ))}
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#667085' }}>Platform fee</span>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#344054' }}>${platformFee.toFixed(2)}</span>
                    </div>
                    {boostDiscount > 0 && (
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#667085' }}>Boost discount</span>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#079455' }}>-${boostDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ borderTop:'1px solid #EAECF0', paddingTop:12, display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:15, color:'#101828' }}>Total paid</span>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:16, color:BRAND }}>${booking.price.toFixed(2)}</span>
                    </div>
                  </div>
                </Section>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── Modals ──────────────────────────────────────────── */}
      {showEdit       && <EditModal booking={booking} onClose={() => setShowEdit(false)}/>}
      {showPreCancel  && <CancelModal booking={booking} onConfirm={handlePreCancelConfirm} onClose={() => setShowPreCancel(false)}/>}
      {showWithdraw   && (
        <WithdrawModal
          onConfirm={handleWithdraw}
          onClose={() => { if (!isWithdrawing) setShowWithdraw(false); }}
          isSubmitting={isWithdrawing}
        />
      )}
      {showLiveCancel && (
        <InProgressCancelModal
          booking={booking}
          variant={isAwaitingComplete ? 'reject' : 'cancel'}
          onClose={() => { if (!isCancelling) setShowLiveCancel(false); }}
          onConfirm={handleLiveCancel}
          onDone={handleLiveCancelConfirm}
          isSubmitting={isCancelling}
        />
      )}
      {showMarkDone   && (
        <MarkCompleteModal
          booking={booking}
          onClose={() => { if (!isSubmittingComplete) setShowMarkDone(false); }}
          onDone={handleApproveComplete}
          onReport={() => { setShowMarkDone(false); setShowReport(true); }}
          isSubmitting={isSubmittingComplete}
        />
      )}
      {showDoneSuccess && <CompletedSuccessModal onClose={handleDoneSuccess}/>}
      {showReport && (
        <ReportModal
          sellerName={booking.sellerName}
          onClose={() => { if (!isReporting) setShowReport(false); }}
          onCancelBooking={() => { setShowReport(false); setShowLiveCancel(true); }}
          onSubmit={handleReport}
          isSubmitting={isReporting}
          canCancelBooking={booking.status === 'InProgress' || booking.status === 'Complete' || booking.status === 'Upcoming'}
        />
      )}
      {showMessage    && (
        <MessageDrawer
          name={showMessage.name}
          conversationId={showMessage.conversationId}
          canSend={showMessage.canSend}
          onClose={() => setShowMessage(null)}
        />
      )}

      <Footer />
    </>
  );
}
