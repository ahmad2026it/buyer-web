'use client';
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import FavorImage, { isUsableImageUrl } from '@/components/FavorImage';
import { useGetBuyerSellerByIdQuery } from '@/app/buyer/store/buyerSellersAPI';
import type {
  BuyerBestProvider,
  BuyerRecommendedFavor,
  BuyerSellerDetail,
  BuyerSellerFavor,
} from '@/app/buyer/store/buyerSellersTypes';

const GRAD = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  const filled = Math.round(Number.isFinite(n) ? n : 0);
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill={i <= filled ? '#F79009' : '#EAECF0'} stroke="none" />
        </svg>
      ))}
    </span>
  );
}

function BadgePill({ b }: { b: string }) {
  if (!b) return null;
  return (
    <span style={{ background: b === 'Pro' ? '#A54AFF' : '#344054', borderRadius: '9999px', padding: '4px 12px', fontFamily: 'Poppins,sans-serif', fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.03em' }}>{b}</span>
  );
}

function Divider() {
  return <div style={{ height: '1px', background: '#EAECF0', margin: '28px 0' }} />;
}

function sellerBadge(isPro?: boolean, isTeam?: boolean): string {
  if (isPro) return 'Pro';
  if (isTeam) return 'Team';
  return '';
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts.slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

function formatMoney(value: string | number | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0.00';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatRating(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return Number(value).toFixed(1);
}

function formatDistance(distanceAway?: string | null, distanceMiles?: number | null): string | null {
  if (distanceAway && distanceAway.trim()) return distanceAway.trim();
  const miles = Number(distanceMiles);
  if (!Number.isFinite(miles) || miles <= 0) return null;
  const label = Number.isInteger(miles) ? String(miles) : miles.toFixed(1);
  return `${label} miles away`;
}

function ProfileAvatar({
  src,
  name,
  size,
  online,
  border = '4px solid #fff',
  shadow,
}: {
  src?: string | null;
  name: string;
  size: number;
  online?: boolean;
  border?: string;
  shadow?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = isUsableImageUrl(src) && !failed;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setFailed(true)}
          style={{ width: size, height: size, borderRadius: '9999px', objectFit: 'cover', objectPosition: 'top', border, boxShadow: shadow }}
        />
      ) : (
        <div
          aria-label={name}
          style={{
            width: size,
            height: size,
            borderRadius: '9999px',
            background: 'linear-gradient(135deg,#F3E8FF 0%,#E9D7FE 100%)',
            border,
            boxShadow: shadow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Poppins,sans-serif',
            fontWeight: 700,
            fontSize: Math.max(12, Math.round(size * 0.32)),
            color: '#7F56D9',
          }}
        >
          {initialsFromName(name)}
        </div>
      )}
      {online ? (
        <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: Math.max(10, Math.round(size * 0.18)), height: Math.max(10, Math.round(size * 0.18)), background: '#22C55E', borderRadius: '9999px', border: '2.5px solid #fff' }} />
      ) : null}
    </div>
  );
}

function SellerFavorCard({
  favor,
  seller,
  liked,
  onToggleLike,
}: {
  favor: BuyerSellerFavor;
  seller: BuyerSellerDetail;
  liked: boolean;
  onToggleLike: () => void;
}) {
  const router = useRouter();
  const badge = sellerBadge(seller.isPro, seller.isTeam);
  const rating = formatRating(favor.averageRating);

  return (
    <div
      onClick={() => router.push(`/favor/${favor.favorId}`)}
      style={{ background: '#fff', borderRadius: '20px', border: '1.5px solid #EAECF0', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(165,74,255,0.3)'; el.style.boxShadow = '0 8px 24px rgba(165,74,255,0.1)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#EAECF0'; el.style.boxShadow = 'none'; }}
    >
      <div style={{ position: 'relative', padding: '10px 10px 0', flexShrink: 0 }}>
        <div style={{ height: '200px', borderRadius: '14px', overflow: 'hidden', background: '#F2F4F7' }}>
          <FavorImage src={favor.favorImageUrl} alt={favor.title} />
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggleLike(); }}
          aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
          style={{ position: 'absolute', top: '20px', right: '20px', width: '34px', height: '34px', borderRadius: '50%', background: liked ? 'rgba(244,63,94,0.88)' : 'rgba(16,24,40,0.42)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'background 0.15s' }}
          onMouseEnter={e => { if (!liked) (e.currentTarget as HTMLElement).style.background = 'rgba(16,24,40,0.65)'; }}
          onMouseLeave={e => { if (!liked) (e.currentTarget as HTMLElement).style.background = 'rgba(16,24,40,0.42)'; }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              fill={liked ? '#ffffff' : 'none'} style={{ transition: 'fill 0.15s' }} />
          </svg>
        </button>
      </div>

      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
        <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '17px', color: '#101828', lineHeight: '1.4', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{favor.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '20px', color: '#8E40FF' }}>${formatMoney(favor.startingPrice)}</span>
        </div>
        <div style={{ paddingTop: '10px', borderTop: '1px solid #EAECF0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1, minWidth: 0 }}>
            <div
              onClick={e => { e.stopPropagation(); router.push(`/seller/${seller.sellerId}`); }}
              style={{ cursor: 'pointer', flexShrink: 0 }}
            >
              <ProfileAvatar src={seller.profileImageUrl} name={seller.name} size={30} border="2px solid #DFBAFF" />
            </div>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '13px', color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{seller.name}</span>
            {badge ? (
              <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '11px', fontWeight: 700, background: badge === 'Pro' ? '#A54AFF' : '#344054', color: '#ffffff', borderRadius: '9999px', padding: '2px 8px', flexShrink: 0, letterSpacing: '0.02em' }}>{badge}</span>
            ) : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '4px' }}>
            <svg viewBox="0 0 24 24" width="13" height="13"><polygon fill="#F79009" stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, color: '#101828' }}>{rating}</span>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#D0D5DD' }}>·</span>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#667085' }}>{(favor.totalReviews ?? 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendedFavorCard({
  favor,
  liked,
  onToggleLike,
}: {
  favor: BuyerRecommendedFavor;
  liked: boolean;
  onToggleLike: () => void;
}) {
  const router = useRouter();
  const seller = favor.sellerInfo;
  const badge = sellerBadge(false, seller?.isTeam);
  const rating = formatRating(favor.averageRating);
  const distance = formatDistance(favor.distanceAway, favor.distanceMiles);

  return (
    <div
      onClick={() => router.push(`/favor/${favor.favorId}`)}
      style={{ background: '#fff', borderRadius: '20px', border: '1.5px solid #EAECF0', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(165,74,255,0.3)'; el.style.boxShadow = '0 8px 24px rgba(165,74,255,0.1)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#EAECF0'; el.style.boxShadow = 'none'; }}
    >
      <div style={{ position: 'relative', padding: '10px 10px 0', flexShrink: 0 }}>
        <div style={{ height: '200px', borderRadius: '14px', overflow: 'hidden', background: '#F2F4F7' }}>
          <FavorImage src={favor.favorImageUrl} alt={favor.title} />
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggleLike(); }}
          aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
          style={{ position: 'absolute', top: '20px', right: '20px', width: '34px', height: '34px', borderRadius: '50%', background: liked ? 'rgba(244,63,94,0.88)' : 'rgba(16,24,40,0.42)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              fill={liked ? '#ffffff' : 'none'} />
          </svg>
        </button>
      </div>
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
        <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '17px', color: '#101828', lineHeight: '1.4', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{favor.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '20px', color: '#8E40FF' }}>${formatMoney(favor.startingPrice)}</span>
          {distance ? (
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#667085' }}>{distance}</span>
          ) : null}
        </div>
        <div style={{ paddingTop: '10px', borderTop: '1px solid #EAECF0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div
            onClick={e => {
              e.stopPropagation();
              if (seller?.sellerId) router.push(`/seller/${seller.sellerId}`);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1, minWidth: 0, cursor: seller?.sellerId ? 'pointer' : 'default' }}
          >
            <ProfileAvatar src={seller?.profileImageUrl} name={seller?.name || 'Seller'} size={30} border="2px solid #DFBAFF" />
            <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '13px', color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.name || 'Seller'}</span>
            {badge ? (
              <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '11px', fontWeight: 700, background: '#344054', color: '#ffffff', borderRadius: '9999px', padding: '2px 8px', flexShrink: 0 }}>{badge}</span>
            ) : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="13" height="13"><polygon fill="#F79009" stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, color: '#101828' }}>{rating}</span>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#D0D5DD' }}>·</span>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#667085' }}>{(favor.totalReviews ?? 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProviderCard({ provider }: { provider: BuyerBestProvider }) {
  const router = useRouter();
  const badge = sellerBadge(provider.isPro, provider.isTeam);
  const rating = formatRating(provider.averageRating);
  const distance = formatDistance(provider.distanceAway, provider.distanceMiles);

  return (
    <div
      onClick={() => router.push(`/seller/${provider.providerId}`)}
      style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #EAECF0', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s', overflow: 'hidden' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(165,74,255,0.3)'; el.style.boxShadow = '0 8px 24px rgba(165,74,255,0.1)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#EAECF0'; el.style.boxShadow = 'none'; }}
    >
      <div style={{ position: 'relative', padding: '10px 10px 0' }}>
        <div style={{ height: '220px', borderRadius: '14px', overflow: 'hidden', background: '#F8F0FF' }}>
          {isUsableImageUrl(provider.profileImageUrl) ? (
            <img src={provider.profileImageUrl} alt={provider.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '36px', color: '#7F56D9' }}>
              {initialsFromName(provider.name)}
            </div>
          )}
        </div>
        {badge ? (
          <div style={{ position: 'absolute', top: '20px', left: '20px', background: badge === 'Pro' ? '#A54AFF' : '#344054', borderRadius: '9999px', padding: '4px 12px', fontFamily: 'Poppins,sans-serif', fontSize: '11px', fontWeight: 700, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.16)' }}>
            {badge}
          </div>
        ) : null}
        {provider.isOnline ? (
          <div style={{ position: 'absolute', bottom: '18px', right: '20px', width: '14px', height: '14px', background: '#22C55E', borderRadius: '9999px', border: '2px solid #fff' }} />
        ) : null}
      </div>
      <div style={{ padding: '14px 16px 18px' }}>
        <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '16px', color: '#101828', marginBottom: '6px' }}>{provider.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          <svg viewBox="0 0 24 24" width="14" height="14"><polygon fill="#F79009" stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '13px', color: '#101828' }}>{rating}</span>
          <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#D0D5DD' }}>|</span>
          <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#667085' }}>{(provider.totalReviews ?? 0).toLocaleString()} reviews</span>
          {distance ? (
            <>
              <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#D0D5DD' }}>/</span>
              <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#667085' }}>{distance}</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SellerProfileSkeleton() {
  return (
    <>
      <div style={{ height: '340px', background: '#F2F4F7' }} />
      <div style={{ maxWidth: '1376px', margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: '24px', padding: '28px 32px', marginTop: '-60px', position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '9999px', background: '#F2F4F7' }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '220px', height: '28px', borderRadius: '8px', background: '#F2F4F7', marginBottom: '10px' }} />
            <div style={{ width: '160px', height: '16px', borderRadius: '8px', background: '#EAECF0' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', padding: '36px 0 0' }}>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '28px' }}>
              {[1, 2, 3].map(i => <div key={i} style={{ height: '110px', borderRadius: '18px', background: '#fff', border: '1.5px solid #EAECF0' }} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
              {[1, 2, 3].map(i => <div key={i} style={{ height: '320px', borderRadius: '20px', background: '#fff', border: '1.5px solid #EAECF0' }} />)}
            </div>
          </div>
          <div style={{ height: '240px', borderRadius: '24px', background: '#fff', border: '1.5px solid #EAECF0' }} />
        </div>
      </div>
    </>
  );
}

export default function SellerProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const sellerId = Number(params?.id);
  const skip = !Number.isFinite(sellerId) || sellerId <= 0;

  const { data, isLoading, isError } = useGetBuyerSellerByIdQuery(sellerId, { skip });
  const seller = data?.data?.seller;
  const sellerFavors = data?.data?.sellerFavors ?? [];
  const bestProviders = data?.data?.bestProviders ?? [];
  const recommendedFavors = data?.data?.recommendedFavors ?? [];

  const [likedFavors, setLikedFavors] = useState<Set<string>>(new Set());
  const [authOpen, setAuthOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [liked, setLiked] = useState(false);
  const [dotsOpen, setDotsOpen] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowMore(false);
    setDotsOpen(false);
  }, [sellerId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dotsRef.current && !dotsRef.current.contains(e.target as Node)) {
        setDotsOpen(false);
      }
    };
    if (dotsOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dotsOpen]);

  const toggleFavorLike = (_id: string) => setAuthOpen(true);

  const showLoading = !skip && isLoading;
  const showError = skip || (!isLoading && (isError || !seller));
  const visibleFavors = showMore ? sellerFavors : sellerFavors.slice(0, 3);
  const badge = seller ? sellerBadge(seller.isPro, seller.isTeam) : '';
  const ratingValue = seller?.averageRating != null ? Number(seller.averageRating) : 0;
  const ratingLabel = formatRating(seller?.averageRating);
  const distance = seller ? formatDistance(seller.distanceAway, seller.distanceMiles) : null;
  const responseTime = seller?.responseTime?.trim() || '';
  const location = seller?.location?.trim() || '';
  const completed = seller?.favorsCompleted ?? 0;

  const statCards = seller ? [
    {
      label: 'Favors completed',
      value: completed.toLocaleString(),
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="#A54AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="#A54AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
    location ? {
      label: 'Location',
      value: location,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#A54AFF" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="#A54AFF" strokeWidth="2"/></svg>,
    } : null,
    responseTime ? {
      label: 'Typical response',
      value: responseTime,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#A54AFF" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#A54AFF" strokeWidth="2" strokeLinecap="round"/></svg>,
    } : null,
  ].filter(Boolean) as { label: string; value: string; icon: ReactNode }[] : [];

  return (
    <>
      <Navbar />
      {authOpen && <AuthGateModal onClose={() => setAuthOpen(false)} />}
      <main style={{ minHeight: '100vh', background: '#FAFAFA' }}>
        {showLoading ? (
          <SellerProfileSkeleton />
        ) : showError ? (
          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '160px 32px', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '24px', color: '#101828', marginBottom: '8px' }}>Unable to load this seller</h1>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#667085', marginBottom: '24px' }}>This profile may have been removed, or there was a problem fetching the details.</p>
            <button
              onClick={() => router.push('/explore')}
              style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px', color: '#fff', background: GRAD, border: 'none', borderRadius: '9999px', padding: '12px 24px', cursor: 'pointer' }}>
              Back to Explore
            </button>
          </div>
        ) : seller ? (
          <>
            <div style={{ position: 'relative', height: '340px', background: badge === 'Pro' ? '#ECFFD4' : '#E3C7FF', overflow: 'hidden', marginTop: 0 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(13,1,32,0.3) 100%)' }} />
              <button onClick={() => router.back()}
                style={{ position: 'absolute', top: '100px', left: '32px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(242,244,247,0.92)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, color: '#344054', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back
              </button>
            </div>

            <div style={{ maxWidth: '1376px', margin: '0 auto', padding: '0 32px' }}>
              <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: '24px', padding: '28px 32px', marginTop: '-60px', position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', gap: '24px', boxShadow: '0 4px 32px rgba(16,24,40,0.08)', flexWrap: 'wrap' }}>
                <ProfileAvatar
                  src={seller.profileImageUrl}
                  name={seller.name}
                  size={100}
                  online={seller.isOnline}
                  shadow="0 4px 16px rgba(165,74,255,0.2)"
                />

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '26px', color: '#101828', letterSpacing: '-0.01em' }}>{seller.name}</h1>
                    <BadgePill b={badge} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Stars n={ratingValue} size={15} />
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '14px', color: '#101828' }}>{ratingLabel}</span>
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085' }}>({(seller.totalReviews ?? 0).toLocaleString()} reviews)</span>
                    </div>
                    {distance ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#98A2B3" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="#98A2B3" strokeWidth="2"/></svg>
                        <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#475467' }}>{distance}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => setAuthOpen(true)}
                    aria-label="Save seller"
                    style={{ width: '44px', height: '44px', borderRadius: '9999px', background: liked ? '#FFF1F3' : '#F9FAFB', border: `1.5px solid ${liked ? '#F43F5E' : '#EAECF0'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        stroke={liked ? '#F43F5E' : '#98A2B3'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        fill={liked ? '#F43F5E' : 'none'} style={{ transition: 'all 0.15s' }} />
                    </svg>
                  </button>

                  <div ref={dotsRef} style={{ position: 'relative' }}>
                    <button
                      onClick={() => setDotsOpen(o => !o)}
                      aria-label="More options"
                      style={{ width: '44px', height: '44px', borderRadius: '9999px', background: '#F9FAFB', border: '1.5px solid #EAECF0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EAECF0'; }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="5" r="1.5" fill="#667085"/>
                        <circle cx="12" cy="12" r="1.5" fill="#667085"/>
                        <circle cx="12" cy="19" r="1.5" fill="#667085"/>
                      </svg>
                    </button>

                    {dotsOpen && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #EAECF0', borderRadius: '12px', boxShadow: '0 8px 24px rgba(16,24,40,0.12)', zIndex: 100, minWidth: '172px', padding: '6px' }}>
                        <button
                          onClick={() => { setDotsOpen(false); navigator.clipboard?.writeText(window.location.href).catch(() => {}); }}
                          style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 500, color: '#344054', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="#667085" strokeWidth="2"/><circle cx="6" cy="12" r="3" stroke="#667085" strokeWidth="2"/><circle cx="18" cy="19" r="3" stroke="#667085" strokeWidth="2"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="#667085" strokeWidth="2"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="#667085" strokeWidth="2"/></svg>
                          Share profile
                        </button>
                        <div style={{ height: '1px', background: '#EAECF0', margin: '4px 6px' }} />
                        <button
                          onClick={() => { setDotsOpen(false); setAuthOpen(true); }}
                          style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 500, color: '#B42318', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF3F2'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="#B42318" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="4" y1="22" x2="4" y2="15" stroke="#B42318" strokeWidth="2" strokeLinecap="round"/></svg>
                          Report seller
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'flex-start', padding: '36px 0 80px' }}>
                <div>
                  {statCards.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(statCards.length, 3)},1fr)`, gap: '16px' }}>
                      {statCards.map(s => (
                        <div key={s.label} style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: '18px', padding: '20px' }}>
                          <div style={{ marginBottom: '10px' }}>{s.icon}</div>
                          <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '15px', color: '#101828', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</p>
                          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#667085' }}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <Divider />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '20px', color: '#101828' }}>
                        Favors <span style={{ fontSize: '14px', fontWeight: 500, color: '#667085' }}>({sellerFavors.length} available)</span>
                      </h2>
                      {sellerFavors.length > 3 && (
                        <button onClick={() => setShowMore(s => !s)}
                          style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px', color: '#A54AFF', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                          {showMore ? 'Show less' : 'See all'}
                        </button>
                      )}
                    </div>
                    {sellerFavors.length === 0 ? (
                      <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#667085' }}>This seller has no favors yet.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
                        {visibleFavors.map(favor => (
                          <SellerFavorCard
                            key={favor.favorId}
                            favor={favor}
                            seller={seller}
                            liked={likedFavors.has(String(favor.favorId))}
                            onToggleLike={() => toggleFavorLike(String(favor.favorId))}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ position: 'sticky', top: '108px', alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: '20px', padding: '20px 22px' }}>
                    <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '15px', color: '#101828', marginBottom: '14px' }}>Quick stats</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#475467' }}>Favors completed</span>
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '14px', color: '#101828' }}>{completed.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {bestProviders.length > 0 && (
              <div style={{ background: '#F8F0FF', borderTop: '1px solid #EAECF0', padding: '64px 0' }}>
                <div style={{ maxWidth: '1376px', margin: '0 auto', padding: '0 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div>
                      <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', fontWeight: 600, color: '#A54AFF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Top rated</p>
                      <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '24px', color: '#101828' }}>Explore best favor providers</h2>
                    </div>
                    <button onClick={() => router.push('/explore/search?type=sellers')}
                      style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px', color: '#A54AFF', background: '#fff', border: '1.5px solid #A54AFF', borderRadius: '9999px', padding: '10px 24px', cursor: 'pointer' }}>
                      See all
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
                    {bestProviders.map(provider => (
                      <ProviderCard key={provider.providerId} provider={provider} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {recommendedFavors.length > 0 && (
              <div style={{ background: '#fff', borderTop: '1px solid #EAECF0', padding: '64px 0' }}>
                <div style={{ maxWidth: '1376px', margin: '0 auto', padding: '0 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div>
                      <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', fontWeight: 600, color: '#A54AFF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>You may also like</p>
                      <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '24px', color: '#101828' }}>Recommended favors</h2>
                    </div>
                    <button onClick={() => router.push('/explore')}
                      style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px', color: '#A54AFF', background: '#fff', border: '1.5px solid #A54AFF', borderRadius: '9999px', padding: '10px 24px', cursor: 'pointer' }}>
                      See all
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
                    {recommendedFavors.map(favor => (
                      <RecommendedFavorCard
                        key={favor.favorId}
                        favor={favor}
                        liked={likedFavors.has(`rec-${favor.favorId}`)}
                        onToggleLike={() => toggleFavorLike(`rec-${favor.favorId}`)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>

      <Footer />
    </>
  );
}
