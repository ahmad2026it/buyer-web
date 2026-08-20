'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import {
  useConfirmBuyerBookingPaymentMutation,
  useCreateBuyerBookingMutation,
} from '@/app/buyer/store/buyerBookingsAPI';
import { extractBookingId } from '@/app/buyer/store/buyerBookingsTypes';
import { useGetBuyerFavorByIdQuery } from '@/app/buyer/store/buyerFavorsAPI';
import type { BuyerFavorAddOn } from '@/app/buyer/store/buyerFavorsTypes';
import { useGetBuyerLocationsQuery } from '@/app/buyer/store/buyerLocationsAPI';
import {
  useCreateStripeSetupIntentMutation,
  useGetBuyerStripeCardsQuery,
} from '@/app/buyer/store/buyerStripeAPI';
import { useAppSelector } from '@/store/hooks';
import { showSuccess } from '@/lib/swal';
import { showToast } from '@/lib/toast';
import FavorImage, { pickFavorImage } from '@/components/FavorImage';

const AddPaymentMethodModal = dynamic(
  () => import('@/components/AddPaymentMethodModal'),
  { ssr: false },
);

const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const BRAND = '#A54AFF';
const PILL  = '9999px';

const FAVOR = {
  title:        'I will deep clean your home',
  image:        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&auto=format&q=75',
  seller:       'Alfonzo Schuessler',
  sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format&q=80',
  badge:        'Pro',
  basePrice:    200,
  platformFee:  8,
  requirements: [
    { id: 'type',     question: 'What type of cleaning do you need done?',              type: 'select' as const, options: ['Deep cleaning','Regular cleaning','Move-out cleaning','Post-construction cleaning'] },
    { id: 'location', question: 'What kind of location is this?',                       type: 'select' as const, options: ['Residential','Office','Commercial','Other'] },
    { id: 'area',     question: 'Mention approximate area in sq. ft that you want to cover.', type: 'input'  as const, placeholder: 'Type here' },
  ],
  addons: [
    { id: 'stain',    label: 'Deep stain removal for carpets, sofas, or mattresses',           price: 15 },
    { id: 'sanitize', label: 'Sanitization & disinfection service for kitchens and bathrooms', price: 30 },
  ],
};

const LOCS: BookingLocation[] = [
  { id: 'work', label: 'Work', address: '12 Street, Apt. 4, Lower lake, Downtown, TX', lat: 32.7767, lng: -96.797 },
  { id: 'home', label: 'Home', address: '45 Oak Avenue, Westside, TX', lat: 32.7791, lng: -96.8003 },
];

type BookingLocation = {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  isSelected?: boolean;
};

type MediaItem = {
  file: File;
  url: string;
};

type RequirementField = {
  id: string;
  question: string;
  type: 'select' | 'input';
  options?: string[];
  placeholder?: string;
};

type AddonField = {
  id: string;
  label: string;
  price: number;
};

const CONDITIONS = [
  'If you cancel the favor, you must provide a valid reason.',
  'If the seller cancels, the seller must also provide a valid reason.',
  'If the seller arrives at your location and you are unavailable, the seller will upload photo or video proof.',
  'If your absence is proved, the seller will receive full payment.',
  'The favor will be marked as Completed – Buyer Not Available.',
];

const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const YEARS  = [2025,2026,2027,2028,2029];
const HOURS  = ['1','2','3','4','5','6','7','8','9','10','11','12'];

function getCalDays(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay();
  const last  = new Date(year, month + 1, 0).getDate();
  const out: (number | null)[] = [];
  for (let i = 0; i < first; i++) out.push(null);
  for (let d = 1; d <= last; d++) out.push(d);
  return out;
}

function isPast(y: number, m: number, d: number) {
  const date = new Date(y, m, d); date.setHours(0,0,0,0);
  const now  = new Date();        now.setHours(0,0,0,0);
  return date < now;
}

function isToday(y: number, m: number, d: number) {
  const n = new Date();
  return y === n.getFullYear() && m === n.getMonth() && d === n.getDate();
}

function toCoordNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

function toFavorDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return '$0.00';
  return `$${value.toFixed(2)}`;
}

function toFavorTime(hour: string, period: 'AM' | 'PM'): string {
  let h = Number(hour);
  if (!Number.isFinite(h)) h = 8;
  if (period === 'AM') {
    if (h === 12) h = 0;
  } else if (h !== 12) {
    h += 12;
  }
  return `${String(h).padStart(2, '0')}:00`;
}

function normalizeQuestion(item: unknown, index: number): RequirementField {
  if (typeof item === 'string') {
    return { id: `q${index}`, question: item, type: 'input', placeholder: 'Type here' };
  }

  if (item && typeof item === 'object') {
    const q = item as Record<string, unknown>;
    const question = String(q.question ?? q.text ?? q.title ?? `Question ${index + 1}`);
    const options = Array.isArray(q.options) ? q.options.map(String).filter(Boolean) : undefined;
    const rawType = String(q.type ?? (options?.length ? 'select' : 'input')).toLowerCase();
    const type: RequirementField['type'] = rawType === 'select' || (options?.length ?? 0) > 0 ? 'select' : 'input';
    return {
      id: String(q.id ?? index),
      question,
      type,
      options,
      placeholder: String(q.placeholder ?? 'Type here'),
    };
  }

  return { id: `q${index}`, question: `Question ${index + 1}`, type: 'input', placeholder: 'Type here' };
}

function normalizeAddOn(item: BuyerFavorAddOn, index: number): AddonField {
  return {
    id: String(item.id ?? index),
    label: item.label || item.name || item.title || item.description || `Add-on ${index + 1}`,
    price: Number(item.price) || 0,
  };
}

function CardIcon({ brand }: { brand: string }) {
  const key = brand.toLowerCase();
  if (key === 'visa') {
    return (
      <div style={{ width: 38, height: 26, borderRadius: 5, background: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 11, color: '#fff', letterSpacing: '0.03em' }}>VISA</span>
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
        <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 8, color: '#fff', letterSpacing: '0.02em' }}>AMEX</span>
      </div>
    );
  }
  return (
    <div style={{ width: 38, height: 26, borderRadius: 5, background: '#344054', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 8, color: '#fff' }}>{brand.slice(0, 4).toUpperCase()}</span>
    </div>
  );
}

function FavorMiniCard({
  title,
  image,
  seller,
  sellerAvatar,
  badge,
  price,
}: {
  title: string;
  image: string | null;
  seller: string;
  sellerAvatar: string;
  badge: string;
  price: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 16, marginBottom: 24 }}>
      <FavorImage src={image} alt={title} style={{ width: 80, height: 60, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <img src={sellerAvatar} alt={seller} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #DFBAFF', flexShrink: 0 }} />
          <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: '#344054', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller}</span>
          <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 10, fontWeight: 700, background: badge === 'Pro' ? '#A54AFF' : '#344054', color: '#fff', borderRadius: PILL, padding: '1px 7px', flexShrink: 0 }}>{badge}</span>
        </div>
        <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 13, color: BRAND }}>starts from {formatUsd(price)}</p>
      </div>
    </div>
  );
}

function BriefcaseIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="#667085" strokeWidth="1.8"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="#667085" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function HomeIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#667085" strokeWidth="1.8"/><polyline points="9 22 9 12 15 12 15 22" stroke="#667085" strokeWidth="1.8"/></svg>;
}
function LocIconComponent({ id, label }: { id: string; label?: string }) {
  const key = `${id} ${label ?? ''}`.toLowerCase();
  const isWork = key.includes('work') || key.includes('office') || key.includes('business');
  return isWork ? <BriefcaseIcon /> : <HomeIcon />;
}

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#ECFDF3' : active ? BRAND : '#F2F4F7', border: done ? '2px solid #079455' : active ? 'none' : '2px solid #EAECF0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {done
        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#079455" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        : <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, fontWeight: 700, color: active ? '#fff' : '#98A2B3' }}>{n}</span>
      }
    </div>
  );
}

const selStyle: React.CSSProperties = {
  fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#101828',
  background: '#F9FAFB', border: '1.5px solid #EAECF0', borderRadius: PILL,
  padding: '9px 32px 9px 14px', outline: 'none',
  appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
  boxSizing: 'border-box', width: '100%',
};

export default function BookingPage() {
  const router  = useRouter();
  const params = useParams<{ favorId: string }>();
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<MediaItem[]>([]);
  const favorId = Number(params.favorId);
  const skipFavor = !Number.isFinite(favorId) || favorId <= 0;

  const today = new Date();
  const [step,         setStep]         = useState(0);
  const [calYear,      setCalYear]      = useState(today.getFullYear());
  const [calMonth,     setCalMonth]     = useState(today.getMonth());
  const [selDay,       setSelDay]       = useState<number | null>(null);
  const [hour,         setHour]         = useState('8');
  const [period,       setPeriod]       = useState<'AM'|'PM'>('AM');
  const [locId,        setLocId]        = useState('work');
  const [showLocModal, setShowLocModal] = useState(false);
  const [note,         setNote]         = useState('');
  const [media,        setMedia]        = useState<MediaItem[]>([]);
  const [cardId,       setCardId]       = useState('');
  const [answers,      setAnswers]      = useState<Record<string, string>>({});
  const [selAddons,    setSelAddons]    = useState<Set<string>>(new Set());
  const [authOpen,     setAuthOpen]     = useState(false);
  const [isPlacing,    setIsPlacing]    = useState(false);
  const [setupSession, setSetupSession] = useState<{ clientSecret: string; publishableKey?: string } | null>(null);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [createSetupIntent, { isLoading: isCreatingIntent }] = useCreateStripeSetupIntentMutation();
  const [createBooking] = useCreateBuyerBookingMutation();
  const [confirmPayment] = useConfirmBuyerBookingPaymentMutation();
  const { data: favorResponse } = useGetBuyerFavorByIdQuery(favorId, { skip: skipFavor });
  const { data: locationsResponse } = useGetBuyerLocationsQuery(undefined, { skip: !token });
  const {
    data: cardsResponse,
    isLoading: isLoadingCards,
    isError: isCardsError,
    refetch: refetchCards,
  } = useGetBuyerStripeCardsQuery(undefined, { skip: !token });

  const cards = cardsResponse?.data?.cards ?? [];
  const holderName = user?.fullName || 'Cardholder';
  const favor = favorResponse?.data?.favor;

  const bookingLocations = useMemo((): BookingLocation[] => {
    const fromApi: BookingLocation[] = [];
    for (const item of locationsResponse?.data?.locations ?? []) {
      const lat = toCoordNumber(item.lat);
      const lng = toCoordNumber(item.lng);
      if (lat === null || lng === null) continue;
      const detail = item.locationDetail?.trim();
      fromApi.push({
        id: String(item.id),
        label: item.label?.trim() || 'Location',
        address: detail ? `${item.location}, ${detail}` : item.location,
        lat,
        lng,
        isSelected: Boolean(item.isSelected),
      });
    }

    return fromApi.length ? fromApi : LOCS;
  }, [locationsResponse]);

  const requirementItems = useMemo<RequirementField[]>(() => {
    const fromApi = (favor?.questions ?? []).map(normalizeQuestion).filter((item) => item.question.trim());
    return fromApi.length ? fromApi : FAVOR.requirements;
  }, [favor]);

  const addonItems = useMemo<AddonField[]>(() => {
    const fromApi = (favor?.addOns ?? []).map(normalizeAddOn);
    return fromApi.length ? fromApi : FAVOR.addons;
  }, [favor]);

  const favorCard = {
    title: favor?.title || FAVOR.title,
    image: pickFavorImage(favor?.images, favor?.favorImage),
    seller: favor?.seller?.fullName || favor?.user?.fullName || FAVOR.seller,
    sellerAvatar: favor?.seller?.profileImage || favor?.user?.profileImage || FAVOR.sellerAvatar,
    badge: FAVOR.badge,
    price: Number(favor?.budget) || FAVOR.basePrice,
  };

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

  useEffect(() => {
    if (!bookingLocations.length) return;
    setLocId((current) => {
      if (bookingLocations.some((item) => item.id === current)) return current;
      return (bookingLocations.find((item) => item.isSelected) ?? bookingLocations[0]).id;
    });
  }, [bookingLocations]);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(() => {
    return () => {
      mediaRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const toggleAddon = (id: string) =>
    setSelAddons(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const days = getCalDays(calYear, calMonth);
  const loc  = bookingLocations.find(l => l.id === locId) ?? bookingLocations[0] ?? LOCS[0];
  const addonsTotal = addonItems.filter(a => selAddons.has(a.id)).reduce((s, a) => s + a.price, 0);
  const total = favorCard.price + addonsTotal + FAVOR.platformFee;
  const dateStr = selDay ? `${MONTHS_SHORT[calMonth]} ${selDay}, ${calYear}` : '—';
  const timeStr = `${hour}:00 ${period}`;

  const prevMo = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMo = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const addMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setMedia((prev) => [
      ...prev,
      ...files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
    e.target.value = '';
  };
  const removeMedia = (i: number) => {
    setMedia((prev) => {
      const next = [...prev];
      const [removed] = next.splice(i, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

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

  const handlePlaceBooking = async () => {
    if (!isAuthenticated || !token) {
      setAuthOpen(true);
      return;
    }
    if (isPlacing) return;
    if (skipFavor) {
      showToast('Invalid favor. Please go back and try again.', 'error');
      return;
    }
    if (!selDay) {
      showToast('Please select a booking date.', 'error');
      return;
    }
    if (!loc?.address || loc.lat == null || loc.lng == null) {
      showToast('Please select a valid location.', 'error');
      return;
    }
    if (!cardId) {
      showToast('Please select a payment method.', 'error');
      return;
    }

    const questionAnswers = requirementItems.map((req) => ({
      question: req.question,
      answer: (answers[req.id] || '').trim(),
    }));
    const selectedAddOnIndices = addonItems
      .map((addon, index) => (selAddons.has(addon.id) ? index : -1))
      .filter((index) => index >= 0);
    const details = note.trim()
      || questionAnswers.filter((item) => item.answer).map((item) => `${item.question}: ${item.answer}`).join('; ')
      || 'Booking request';

    setIsPlacing(true);
    try {
      const created = await createBooking({
        favorId,
        favorDate: toFavorDate(calYear, calMonth, selDay),
        favorTime: toFavorTime(hour, period),
        details,
        lat: loc.lat,
        lng: loc.lng,
        address: loc.address,
        selectedAddOnIndices,
        images: media.filter((item) => item.file.type.startsWith('image/')).map((item) => item.file),
        videos: media.filter((item) => item.file.type.startsWith('video/')).map((item) => item.file),
        questionAnswers,
      }).unwrap();

      const bookingId = extractBookingId(created);
      if (!bookingId) {
        showToast('Booking created, but payment could not be confirmed. Check Bookings for status.', 'error');
        return;
      }

      await confirmPayment({
        booking_id: bookingId,
        payment_method_id: cardId,
      }).unwrap();

      setStep(3);
    } catch {
      // axios interceptor already toasts API errors
    } finally {
      setIsPlacing(false);
    }
  };

  const canPlaceBooking = Boolean(cardId) && !isLoadingCards && !isPlacing;

  /* ── Step 0: Disclaimer ── */
  if (step === 0) return (
    <>
      <Navbar />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '36px 32px', maxWidth: 480, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 22, color: '#101828', marginBottom: 10, lineHeight: 1.3 }}>Before You Confirm Your Booking</h2>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#475467', lineHeight: 1.7, marginBottom: 18 }}>Please review and accept these conditions to continue.</p>
          <ul style={{ paddingLeft: 20, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CONDITIONS.map((c, i) => (
              <li key={i} style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#344054', lineHeight: 1.6 }}>{c}</li>
            ))}
          </ul>
          <button onClick={() => setStep(1)}
            style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(165,74,255,0.3)', marginBottom: 10, transition: 'opacity 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
            Accept and Continue
          </button>
          <button onClick={() => router.back()}
            style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: '#667085', background: '#fff', border: '1.5px solid #EAECF0', borderRadius: PILL, padding: 12, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );

  /* ── Step 1: Requirements + Timeline ── */
  if (step === 1) return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F9FAFB', paddingTop: 96 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            <StepDot n={1} active done={false} />
            <div style={{ height: 2, width: 48, background: '#EAECF0', borderRadius: 1 }} />
            <StepDot n={2} active={false} done={false} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'flex-start' }}>

            {/* ── Left: Requirements ── */}
            <div>
              <FavorMiniCard {...favorCard} />

              {/* Describe requirements */}
              <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: '24px', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 16, color: '#101828', marginBottom: 20 }}>Describe your requirements</h3>

                {/* Per-question fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
                  {requirementItems.map(req => (
                    <div key={req.id}>
                      <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: '#101828', marginBottom: 8, lineHeight: 1.45 }}>{req.question}</p>
                      {req.type === 'select' ? (
                        <div style={{ position: 'relative' }}>
                          <select
                            value={answers[req.id] || ''}
                            onChange={e => setAnswers(prev => ({ ...prev, [req.id]: e.target.value }))}
                            style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontSize: 14, color: answers[req.id] ? '#101828' : '#98A2B3', background: '#fff', border: '1.5px solid #D0D5DD', borderRadius: PILL, padding: '12px 40px 12px 16px', outline: 'none', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                            onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = BRAND; }}
                            onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD'; }}>
                            <option value="" disabled>Select one</option>
                            {(req.options ?? []).map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                          <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      ) : (
                        <input
                          value={answers[req.id] || ''}
                          onChange={e => setAnswers(prev => ({ ...prev, [req.id]: e.target.value }))}
                          placeholder={req.placeholder}
                          style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#101828', background: '#fff', border: '1.5px solid #D0D5DD', borderRadius: PILL, padding: '12px 16px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                          onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = BRAND; }}
                          onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD'; }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Add-ons */}
                <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: '#101828', marginBottom: 12 }}>Select Add-ons (optional)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {addonItems.map(addon => {
                    const checked = selAddons.has(addon.id);
                    return (
                      <div key={addon.id} onClick={() => toggleAddon(addon.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: `1.5px solid ${checked ? BRAND : '#EAECF0'}`, borderRadius: 12, cursor: 'pointer', background: checked ? '#F9F5FF' : '#fff', transition: 'all 0.15s' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: checked ? '#17B26A' : '#fff', border: `1.5px solid ${checked ? '#17B26A' : '#D0D5DD'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                          {checked && <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#344054', flex: 1, lineHeight: 1.45 }}>{addon.label}</span>
                        <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: BRAND, flexShrink: 0 }}>{formatUsd(addon.price)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Additional notes */}
                <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: '#101828', marginBottom: 8 }}>Add any additional information you want to share with the seller.</p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Type here"
                  style={{ width: '100%', minHeight: 100, border: '1.5px solid #D0D5DD', borderRadius: 14, padding: '12px 14px', fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#101828', resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6, transition: 'border-color 0.15s' }}
                  onFocus={e => { e.currentTarget.style.borderColor = BRAND; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#D0D5DD'; }}
                />
              </div>

              {/* Attach media */}
              <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: '24px' }}>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: '#101828', marginBottom: 6 }}>Attach photos/videos</p>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#667085', marginBottom: 14, lineHeight: 1.6 }}>Add photos/videos to help the seller know more about the service requirements.</p>
                <button onClick={() => fileRef.current?.click()}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: BRAND, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round"/></svg>
                  Upload
                </button>
                <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={addMedia} />
                {media.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
                    {media.map((item, i) => (
                      <div key={`${item.file.name}-${i}`} style={{ position: 'relative', width: 80, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                        {item.file.type.startsWith('video/') ? (
                          <video src={item.url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        <button type="button" onClick={() => removeMedia(i)}
                          style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Timeline ── */}
            <div>
              <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: '24px', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 16, color: '#101828', marginBottom: 18 }}>Add timeline</h3>

                <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 12 }}>Select booking date</p>

                {/* Month / Year nav */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <button onClick={prevMo} style={{ width: 30, height: 30, borderRadius: '50%', background: '#F9FAFB', border: '1.5px solid #EAECF0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ position: 'relative' }}>
                      <select value={calMonth} onChange={e => setCalMonth(+e.target.value)} style={{ ...selStyle, padding: '7px 28px 7px 12px', fontWeight: 600, fontSize: 13 }}>
                        {MONTHS_FULL.map((m, i) => <option key={i} value={i}>{MONTHS_SHORT[i]}</option>)}
                      </select>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <select value={calYear} onChange={e => setCalYear(+e.target.value)} style={{ ...selStyle, padding: '7px 28px 7px 12px', fontWeight: 600, fontSize: 13 }}>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>
                  </div>
                  <button onClick={nextMo} style={{ width: 30, height: 30, borderRadius: '50%', background: '#F9FAFB', border: '1.5px solid #EAECF0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>

                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontFamily: 'Poppins,sans-serif', fontSize: 11, fontWeight: 600, color: '#98A2B3', padding: '4px 0' }}>{d}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                  {days.map((d, i) => {
                    if (!d) return <div key={`e${i}`} style={{ aspectRatio: '1' }} />;
                    const past     = isPast(calYear, calMonth, d);
                    const todayDay = isToday(calYear, calMonth, d);
                    const selected = selDay === d;
                    return (
                      <button key={i} onClick={() => !past && setSelDay(d)}
                        style={{ aspectRatio: '1', borderRadius: '50%', border: todayDay && !selected ? `2px solid ${BRAND}` : 'none', background: selected ? BRAND : 'transparent', color: selected ? '#fff' : past ? '#D0D5DD' : '#344054', fontFamily: 'Poppins,sans-serif', fontSize: 12, fontWeight: selected ? 700 : 400, cursor: past ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => { if (!past && !selected) (e.currentTarget as HTMLElement).style.background = '#F4EBFF'; }}
                        onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time */}
              <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: '20px 24px', marginBottom: 20 }}>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 12 }}>Add start time</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <select value={hour} onChange={e => setHour(e.target.value)} style={selStyle}>
                      {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                    </select>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                  <div style={{ position: 'relative', width: 90 }}>
                    <select value={period} onChange={e => setPeriod(e.target.value as 'AM'|'PM')} style={selStyle}>
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: '20px 24px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054' }}>Confirm your location</p>
                  <button onClick={() => setShowLocModal(true)} style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: BRAND, background: 'none', border: 'none', cursor: 'pointer' }}>Change</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#F9FAFB', borderRadius: 12 }}>
                  <div style={{ flexShrink: 0, marginTop: 1 }}><LocIconComponent id={loc.id} label={loc.label} /></div>
                  <div>
                    <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#101828', marginBottom: 2 }}>{loc.label}</p>
                    <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: '#667085', lineHeight: 1.5 }}>{loc.address}</p>
                  </div>
                </div>
              </div>

              <button onClick={() => setStep(2)} disabled={!selDay}
                style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', background: selDay ? GRAD : '#E4E7EC', border: 'none', borderRadius: PILL, padding: 14, cursor: selDay ? 'pointer' : 'not-allowed', boxShadow: selDay ? '0 4px 16px rgba(165,74,255,0.3)' : 'none', transition: 'all 0.2s' }}>
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Location modal */}
      {showLocModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
          onClick={() => setShowLocModal(false)}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '28px 24px', maxWidth: 400, width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 17, color: '#101828', marginBottom: 16 }}>Select location</h3>
            {bookingLocations.map(l => (
              <div key={l.id} onClick={() => { setLocId(l.id); setShowLocModal(false); }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 14, background: locId === l.id ? '#F9F5FF' : '#F9FAFB', border: `1.5px solid ${locId === l.id ? BRAND : '#EAECF0'}`, borderRadius: 12, cursor: 'pointer', marginBottom: 10, transition: 'all 0.15s' }}>
                <div style={{ flexShrink: 0, marginTop: 1 }}><LocIconComponent id={l.id} label={l.label} /></div>
                <div>
                  <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#101828', marginBottom: 2 }}>{l.label}</p>
                  <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: '#667085' }}>{l.address}</p>
                </div>
                {locId === l.id && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 'auto', flexShrink: 0 }}><path d="M20 6L9 17l-5-5" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            ))}
          </div>
        </div>
      )}
      <Footer />
    </>
  );

  /* ── Step 2: Payment ── */
  if (step === 2) return (
    <>
      <Navbar />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Log in to continue with this booking."
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
      <main style={{ minHeight: '100vh', background: '#F9FAFB', paddingTop: 96 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            <StepDot n={1} active={false} done />
            <div style={{ height: 2, width: 48, background: BRAND, borderRadius: 1 }} />
            <StepDot n={2} active done={false} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'flex-start' }}>

            {/* ── Left: Payment methods ── */}
            <div>
              <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: '24px' }}>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 16, color: '#101828', marginBottom: 8 }}>Confirm payment method</h3>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#667085', lineHeight: 1.7, marginBottom: 20 }}>
                  Please select a payment method to pay for this favor. This amount will remain in your escrow and will be transferred to service provider once the favor is completed.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {!token ? (
                    <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#667085', margin: 0 }}>
                      Log in to view your saved cards.
                    </p>
                  ) : isLoadingCards ? (
                    [0, 1].map((i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#F9FAFB', border: '1.5px solid #EAECF0', borderRadius: 12 }}>
                        <div style={{ width: 38, height: 26, borderRadius: 5, background: '#EAECF0', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ width: 120, height: 12, borderRadius: 4, background: '#EAECF0', marginBottom: 8 }} />
                          <div style={{ width: 90, height: 10, borderRadius: 4, background: '#EAECF0' }} />
                        </div>
                      </div>
                    ))
                  ) : isCardsError ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#667085', margin: 0 }}>
                        Could not load your payment methods.
                      </p>
                      <button
                        type="button"
                        onClick={() => { void refetchCards(); }}
                        style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: BRAND, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        Try again
                      </button>
                    </div>
                  ) : cards.length === 0 ? (
                    <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#667085', margin: 0 }}>
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
                          onClick={() => setCardId(card.id)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setCardId(card.id); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: selected ? '#F9F5FF' : '#F9FAFB', border: `1.5px solid ${selected ? BRAND : '#EAECF0'}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s' }}
                        >
                          <CardIcon brand={card.brand} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#101828', marginBottom: 2 }}>
                              {holderName}
                            </p>
                            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: '#667085', letterSpacing: '0.05em' }}>
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
                  disabled={isCreatingIntent}
                  onClick={() => { void handleAddPaymentMethod(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: BRAND, background: 'none', border: 'none', cursor: isCreatingIntent ? 'not-allowed' : 'pointer', padding: '4px 0', opacity: isCreatingIntent ? 0.6 : 1 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={BRAND} strokeWidth="2" strokeLinecap="round"/></svg>
                  {isCreatingIntent ? 'Starting…' : 'Add payment method'}
                </button>
              </div>
            </div>

            {/* ── Right: Summary ── */}
            <div style={{ position: 'sticky', top: 108 }}>
              <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: '24px' }}>
                <FavorMiniCard {...favorCard} />

                {/* Date/time/location summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 18, borderBottom: '1px solid #EAECF0', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><rect x="3" y="4" width="18" height="18" rx="2" stroke="#98A2B3" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#98A2B3" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#344054' }}>{dateStr} – {timeStr}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flexShrink: 0, marginTop: 1 }}><LocIconComponent id={loc.id} label={loc.label} /></div>
                    <div>
                      <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 2 }}>{loc.label}</p>
                      <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: '#667085' }}>{loc.address}</p>
                    </div>
                  </div>
                </div>

                {/* Fee breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  {[
                    { label: 'Service fee',  amount: favorCard.price },
                    { label: 'Add-ons',      amount: addonsTotal },
                    { label: 'Platform fee', amount: FAVOR.platformFee },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#667085' }}>{row.label}</span>
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 600, color: '#344054' }}>{formatUsd(row.amount)}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: '#EAECF0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: '#101828' }}>Subtotal</span>
                    <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 17, color: BRAND }}>{formatUsd(total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canPlaceBooking}
                  onClick={() => { void handlePlaceBooking(); }}
                  style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', background: canPlaceBooking ? GRAD : '#E4E7EC', border: 'none', borderRadius: PILL, padding: 14, cursor: canPlaceBooking ? 'pointer' : 'not-allowed', boxShadow: canPlaceBooking ? '0 4px 16px rgba(165,74,255,0.3)' : 'none', marginBottom: 10, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => { if (canPlaceBooking) (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
                  {isPlacing ? 'Placing request…' : 'Place Booking Request'}
                </button>
                <button onClick={() => { if (!isPlacing) setStep(1); }}
                  disabled={isPlacing}
                  style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, color: '#667085', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0' }}>
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );

  /* ── Step 3: Success ── */
  return (
    <>
      <Navbar />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '40px 32px', maxWidth: 460, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#ECFDF3,#D1FAE5)', border: '2px solid #A9EFC5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#079455" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 22, color: '#101828', marginBottom: 10 }}>Booking Request Sent!</h2>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#475467', lineHeight: 1.75, marginBottom: 28 }}>
            Your booking request has been sent to <strong>{favorCard.seller}</strong>. You will be notified once the seller responds. Check the status in the <strong>Bookings</strong> tab under Requests.
          </p>
          <button onClick={() => router.push('/bookings')}
            style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(165,74,255,0.3)', marginBottom: 10, transition: 'opacity 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
            Go to Bookings
          </button>
          <button onClick={() => router.push('/explore/search')}
            style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: '#667085', background: '#fff', border: '1.5px solid #EAECF0', borderRadius: PILL, padding: 12, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
            Continue Exploring
          </button>
        </div>
      </div>
    </>
  );
}
