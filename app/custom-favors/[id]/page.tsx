'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BRAND = '#A54AFF';
const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const PILL  = '9999px';
const FONT  = 'Poppins, sans-serif';

/* ── Mock data ── */
interface FavorData {
  id: string;
  title: string;
  category: string;
  budget: number;
  dueDate: string;
  location: string;
  time: string;
  description: string;
  image: string;
  photos: string[];
  requests: number;
}

const FAVORS: Record<string, FavorData> = {
  '1': {
    id: '1',
    title: 'I need a car wash at my doorsteps',
    category: 'Cleaning',
    budget: 200,
    dueDate: 'Jan 2, 2025',
    location: '12 Street, Apt. 4, Lower lake, Downtown, TX',
    time: '9:00 AM',
    description: 'Looking for a professional car wash service that can come to my home address. The car is a mid-size SUV. Please bring your own supplies including water if needed. Exterior wash, interior vacuum, and window cleaning required.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=360&fit=crop&auto=format&q=80',
    photos: [
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=200&h=160&fit=crop&auto=format&q=75',
      'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=200&h=160&fit=crop&auto=format&q=75',
    ],
    requests: 2,
  },
  '2': {
    id: '2',
    title: 'I need a deep clean of my kitchen',
    category: 'Cleaning',
    budget: 200,
    dueDate: 'Jan 2, 2025',
    location: '45 Oak Avenue, Westside, TX',
    time: '10:00 AM',
    description: 'Need a thorough deep clean of a medium-sized kitchen. Includes oven, fridge exterior, countertops, cabinets, sink, and floors. Please bring your own cleaning supplies.',
    image: 'https://images.unsplash.com/photo-1527515637462-cff94ebb8b4c?w=600&h=360&fit=crop&auto=format&q=80',
    photos: [],
    requests: 0,
  },
  '3': {
    id: '3',
    title: 'Need someone to assemble IKEA furniture',
    category: 'Assembly',
    budget: 120,
    dueDate: 'Jan 10, 2025',
    location: '12 Street, Apt. 4, Lower lake, Downtown, TX',
    time: '11:00 AM',
    description: 'Have 3 flat-pack IKEA pieces that need assembly: a KALLAX shelf, a MALM dresser, and a BILLY bookcase. All parts and instructions included.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=360&fit=crop&auto=format&q=80',
    photos: [],
    requests: 5,
  },
};

interface RequestItem {
  id: string;
  name: string;
  avatar: string;
  badge: 'Pro' | 'Team';
  distance: string;
  shortText: string;
  fullText: string;
  price: number;
}

const MOCK_REQUESTS: RequestItem[] = [
  {
    id: 'r1',
    name: 'Alfonzo Schuessler',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&auto=format&q=80',
    badge: 'Pro',
    distance: '8 miles away',
    shortText: 'Professional deep cleaning of the selected area using standard cleaning supplies.\n\nDusting and wiping of all accessible surfaces, furniture, and fixtures....',
    fullText: 'Professional deep cleaning of the selected area using standard cleaning supplies.\n\nDusting and wiping of all accessible surfaces, furniture, and fixtures. I bring all equipment and eco-friendly products. I have 6 years of experience and 300+ satisfied customers. Available on your requested date and happy to arrive early if needed.',
    price: 185,
  },
  {
    id: 'r2',
    name: 'The Bright Services',
    avatar: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=100&h=100&fit=crop&auto=format&q=80',
    badge: 'Team',
    distance: '8 miles away',
    shortText: 'Professional deep cleaning of the selected area using standard cleaning supplies.\n\nDusting and wiping of all accessible surfaces, furniture, and fixtures.',
    fullText: 'Professional deep cleaning of the selected area using standard cleaning supplies.\n\nDusting and wiping of all accessible surfaces, furniture, and fixtures. Our team of 2 will complete the job in under 2 hours. We are fully insured and background-checked. We supply all cleaning materials and guarantee satisfaction or re-clean for free.',
    price: 195,
  },
  {
    id: 'r3',
    name: 'Maria Santos',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&auto=format&q=80',
    badge: 'Pro',
    distance: '5 miles away',
    shortText: 'I specialize in home and vehicle cleaning services with 4 years experience.\n\nAll supplies included, flexible schedule...',
    fullText: 'I specialize in home and vehicle cleaning services with 4 years experience. All supplies included, flexible schedule. I can accommodate same-day requests if needed. My rates are competitive and I pride myself on attention to detail. Previous clients include several local businesses and residential properties.',
    price: 175,
  },
];

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
          <img src={req.avatar} alt={req.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }} />
          <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#22C55E', border: '1.5px solid #fff' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#101828' }}>{req.name}</span>
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#fff', background: req.badge === 'Pro' ? '#A54AFF' : '#344054', borderRadius: PILL, padding: '2px 8px' }}>{req.badge}</span>
          </div>
          <p style={{ fontFamily: FONT, fontSize: 12, color: '#DC6803', fontWeight: 500, marginTop: 2 }}>{req.distance}</p>
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
function RequestModal({ req, onClose, onHire }: { req: RequestItem; onClose: () => void; onHire: (r: RequestItem) => void }) {
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
              <img src={req.avatar} alt={req.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 1px 6px rgba(0,0,0,0.14)' }} />
              <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: '#101828' }}>{req.name}</span>
                <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#fff', background: req.badge === 'Pro' ? '#A54AFF' : '#344054', borderRadius: PILL, padding: '2px 8px' }}>{req.badge}</span>
              </div>
              <p style={{ fontFamily: FONT, fontSize: 13, color: '#DC6803', fontWeight: 500, marginTop: 3 }}>{req.distance}</p>
            </div>
          </div>

          {/* View profile link */}
          <a href={`/seller/s1`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontWeight: 700, fontSize: 15, color: BRAND, textDecoration: 'none', marginBottom: 18 }}>
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
            <span style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: BRAND }}>${req.price}</span>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
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

/* ── Payment modal ── */
function PaymentModal({ req, favor, onClose, onConfirm }: { req: RequestItem; favor: FavorData; onClose: () => void; onConfirm: () => void }) {
  const serviceFee = Math.round(req.price * 0.05);
  const total      = req.price + serviceFee;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(16,24,40,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 500, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(16,24,40,0.18)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F2F4F7' }}>
          <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 20, color: '#101828' }}>Confirm & Pay</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: '#F2F4F7', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#344054" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Seller summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 16px', background: '#F9FAFB', borderRadius: 14, border: '1px solid #EAECF0' }}>
            <img src={req.avatar} alt={req.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#101828' }}>{req.name}</span>
                <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#fff', background: req.badge === 'Pro' ? '#A54AFF' : '#344054', borderRadius: PILL, padding: '2px 8px' }}>{req.badge}</span>
              </div>
              <p style={{ fontFamily: FONT, fontSize: 12, color: '#DC6803', fontWeight: 500, marginTop: 2 }}>{req.distance}</p>
            </div>
          </div>

          {/* Favor summary */}
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

            {/* Price breakdown */}
            <div style={{ padding: '14px 16px' }}>
              <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Price summary</p>
              {[
                { label: "Seller's offer",   value: `$${req.price}` },
                { label: 'Service fee (5%)', value: `$${serviceFee}` },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontFamily: FONT, fontSize: 13, color: '#667085' }}>{r.label}</span>
                  <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#344054' }}>{r.value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: '#EAECF0', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#101828' }}>Total</span>
                <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: BRAND }}>${total}</span>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div style={{ border: '1.5px solid #EAECF0', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
            <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Payment method</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 24, background: 'linear-gradient(135deg,#1A1F71,#0066B3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: FONT, fontSize: 8, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>VISA</span>
              </div>
              <span style={{ fontFamily: FONT, fontSize: 14, color: '#101828', fontWeight: 500 }}>•••• •••• •••• 4242</span>
              <span style={{ fontFamily: FONT, fontSize: 13, color: '#667085', marginLeft: 'auto' }}>Change</span>
            </div>
          </div>

          {/* Confirm button */}
          <button
            onClick={onConfirm}
            style={{ width: '100%', fontFamily: FONT, fontWeight: 700, fontSize: 16, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: 16, cursor: 'pointer', boxShadow: '0 4px 16px rgba(165,74,255,0.3)', transition: 'opacity 0.15s', marginBottom: 10 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            Confirm &amp; Pay ${total}
          </button>
          <p style={{ fontFamily: FONT, fontSize: 12, color: '#98A2B3', textAlign: 'center', lineHeight: 1.5 }}>
            By confirming you agree to our Terms of Service. Payment is held in escrow until the favor is completed.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Success overlay ── */
function SuccessModal({ sellerName, onClose }: { sellerName: string; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(16,24,40,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(16,24,40,0.18)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ECFDF3', border: '2px solid #A9EFC5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#079455" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: '#101828', marginBottom: 10 }}>Booking Confirmed!</h2>
        <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', lineHeight: 1.7, marginBottom: 28 }}>
          <strong style={{ color: '#344054' }}>{sellerName}</strong> has been hired for your custom favor. You will receive a confirmation shortly.
        </p>
        <button
          onClick={onClose}
          style={{ width: '100%', fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(165,74,255,0.28)' }}
        >
          Go to My Favors
        </button>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function CustomFavorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id     = Array.isArray(params.id) ? params.id[0] : (params.id ?? '1');
  const favor  = FAVORS[id] ?? FAVORS['1'];

  const requests = MOCK_REQUESTS.slice(0, Math.min(favor.requests, MOCK_REQUESTS.length));

  const [viewReq,   setViewReq]   = useState<RequestItem | null>(null);
  const [hireReq,   setHireReq]   = useState<RequestItem | null>(null);
  const [success,   setSuccess]   = useState(false);
  const [dotsOpen,  setDotsOpen]  = useState(false);
  const [closed,    setClosed]    = useState(false);
  const [closeConf, setCloseConf] = useState(false);

  const handleHire = (req: RequestItem) => {
    setViewReq(null);
    setHireReq(req);
  };

  const handleConfirmPay = () => {
    setHireReq(null);
    setSuccess(true);
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F9FAFB', paddingTop: 96 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>

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
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28, alignItems: 'flex-start' }}>

            {/* ── Left: favor info ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Hero image */}
              {favor.image && (
                <div style={{ borderRadius: 20, overflow: 'hidden', border: '1.5px solid #EAECF0', height: 260 }}>
                  <img src={favor.image} alt={favor.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              {/* Title + budget */}
              <SectionCard>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: '#101828', lineHeight: 1.3, flex: 1, minWidth: 0 }}>{favor.title}</h1>
                  <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 26, color: BRAND, flexShrink: 0 }}>${favor.budget}</span>
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
                  <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: BRAND }}>${favor.budget}</span>
                </div>
              </SectionCard>

              {/* Description */}
              <SectionCard title="Description">
                <p style={{ fontFamily: FONT, fontSize: 14, color: '#344054', lineHeight: 1.75 }}>{favor.description}</p>
              </SectionCard>

              {/* Photos */}
              {favor.photos.length > 0 && (
                <SectionCard title="Attached photos">
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {favor.photos.map((src, i) => (
                      <div key={i} style={{ width: 160, height: 120, borderRadius: 12, overflow: 'hidden', border: '1px solid #EAECF0', flexShrink: 0 }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* ── Right: sticky requests panel ── */}
            <div style={{ position: 'sticky', top: 104 }}>
              <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, overflow: 'hidden' }}>
                {/* Panel header */}
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F2F4F7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: '#101828' }}>
                      Requests
                      {requests.length > 0 && (
                        <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, borderRadius: PILL, background: '#D92D20', color: '#fff', fontFamily: FONT, fontSize: 12, fontWeight: 700, padding: '0 6px' }}>
                          {requests.length}
                        </span>
                      )}
                    </h3>
                  </div>
                  {/* Invite seller button */}
                  <button
                    onClick={() => router.push(`/custom-favors/new`)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: FONT, fontWeight: 700, fontSize: 14, color: BRAND, background: 'transparent', border: `1.5px solid ${BRAND}`, borderRadius: PILL, padding: '10px', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9F5FF'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M16 11c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zM3 21c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 8v6M23 11h-6" stroke={BRAND} strokeWidth="2" strokeLinecap="round"/></svg>
                    Invite Seller
                  </button>
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
        </div>
      </main>
      <Footer />

      {/* Request detail modal */}
      {viewReq && (
        <RequestModal
          req={viewReq}
          onClose={() => setViewReq(null)}
          onHire={handleHire}
        />
      )}

      {/* Payment modal */}
      {hireReq && (
        <PaymentModal
          req={hireReq}
          favor={favor}
          onClose={() => setHireReq(null)}
          onConfirm={handleConfirmPay}
        />
      )}

      {/* Success */}
      {success && (
        <SuccessModal
          sellerName={hireReq?.name ?? ''}
          onClose={() => { setSuccess(false); router.push('/custom-favors'); }}
        />
      )}
    </>
  );
}
