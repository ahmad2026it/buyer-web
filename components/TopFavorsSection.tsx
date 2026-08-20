'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGateModal from '@/components/AuthGateModal';
import FavorImage, { pickFavorImage } from '@/components/FavorImage';
import {
  useGetBuyerFavorsQuery,
  useMarkBuyerFavoriteMutation,
  useUnmarkBuyerFavoriteMutation,
} from '@/app/buyer/store/buyerFavorsAPI';
import type { BuyerFavor } from '@/app/buyer/store/buyerFavorsTypes';
import { useAppSelector } from '@/store/hooks';

const BRAND = '#8E40FF';
const MAX_FAVORS = 6;
const PLACEHOLDER_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=72&h=72&fit=crop&auto=format&q=80';

function displayCategory(type: string): string {
  if (!type) return 'Favor';
  return type.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function formatPrice(value: string | number): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '$0';
  return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
}

function sellerBadge(favor: BuyerFavor): string {
  const favorType = favor.favorType?.toLowerCase() ?? '';
  if (favorType.includes('team')) return 'Team';
  return favor.seller ? 'Pro' : '';
}

function FavorCardSkeleton() {
  return (
    <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #EAECF0', overflow: 'hidden' }}>
      <div style={{ padding: '10px 10px 0' }}>
        <div style={{ height: '200px', borderRadius: '14px', background: '#F2F4F7' }} />
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ width: '78%', height: 16, borderRadius: 4, background: '#F2F4F7', marginBottom: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ width: 56, height: 18, borderRadius: 4, background: '#F2F4F7' }} />
          <div style={{ width: 72, height: 22, borderRadius: 9999, background: '#F2F4F7' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #EAECF0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#F2F4F7' }} />
            <div style={{ width: 88, height: 12, borderRadius: 4, background: '#F2F4F7' }} />
          </div>
          <div style={{ width: 52, height: 12, borderRadius: 4, background: '#F2F4F7' }} />
        </div>
      </div>
    </div>
  );
}

export default function TopFavorsSection() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const { data, isLoading, isError, refetch } = useGetBuyerFavorsQuery({});
  const [markFavorite] = useMarkBuyerFavoriteMutation();
  const [unmarkFavorite] = useUnmarkBuyerFavoriteMutation();

  const favors = (data?.data?.favors ?? []).slice(0, MAX_FAVORS);

  const toggleLike = async (favor: BuyerFavor) => {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    if (pendingIds.has(favor.id)) return;

    setPendingIds((prev) => new Set(prev).add(favor.id));
    try {
      if (favor.isFavorite) {
        await unmarkFavorite(favor.id).unwrap();
      } else {
        await markFavorite(favor.id).unwrap();
      }
    } catch {
      // axios interceptor already toasts API errors
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(favor.id);
        return next;
      });
    }
  };

  return (
    <section id="favors" style={{ padding: '96px 0', background: '#ffffff' }}>
      {authOpen && <AuthGateModal onClose={() => setAuthOpen(false)} />}
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px' }}>
          <div>
            <p data-animate="fade" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#A54AFF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Most Requested</p>
            <h2 data-animate style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '36px', lineHeight: '1.2', color: '#101828', letterSpacing: '-0.01em' }}>
              Top Favors on{' '}
              <span style={{ background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>WhoCan</span>
            </h2>
            <p data-animate data-delay="1" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#475467', marginTop: '8px' }}>People are requesting these favors the most</p>
          </div>
          <a href="/explore" data-animate="fade" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#A54AFF', padding: '10px 20px', borderRadius: '9999px', border: '1.5px solid #A54AFF', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8F0FF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            View All Favors
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#A54AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
            {Array.from({ length: MAX_FAVORS }, (_, i) => <FavorCardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: '#101828', margin: '0 0 8px' }}>Could not load favors</h3>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#667085', margin: '0 0 16px' }}>Please try again in a moment.</p>
            <button
              type="button"
              onClick={() => { void refetch(); }}
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, color: '#A54AFF', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        ) : favors.length === 0 ? (
          <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: '#101828', margin: '0 0 8px' }}>No favors yet</h3>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#667085', margin: 0 }}>Check back soon — new favors will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
            {favors.map((favor, i) => {
              const liked = Boolean(favor.isFavorite);
              const badge = sellerBadge(favor);
              const isPro = badge === 'Pro';
              const sellerName = favor.seller?.fullName || 'Seller';
              const sellerAvatar = favor.seller?.profileImage || PLACEHOLDER_AVATAR;
              const sellerId = favor.seller?.id;
              const rating = favor.averageRating != null ? Number(favor.averageRating).toFixed(1) : '—';
              const reviews = Number(favor.reviewCount ?? favor.totalReviews ?? 0).toLocaleString();

              return (
                <div
                  key={favor.id}
                  data-animate
                  data-delay={String((i % 3) + 1)}
                  onClick={() => router.push(`/favor/${favor.id}`)}
                  style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #EAECF0', cursor: 'pointer', transition: 'border-color 0.2s ease, box-shadow 0.2s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(165,74,255,0.3)'; el.style.boxShadow = '0 8px 24px rgba(165,74,255,0.1)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#EAECF0'; el.style.boxShadow = 'none'; }}
                >
                  <div style={{ position: 'relative', padding: '10px 10px 0', flexShrink: 0 }}>
                    <div style={{ height: '200px', borderRadius: '14px', overflow: 'hidden' }}>
                      <FavorImage
                        src={pickFavorImage(favor.images, favor.favorImage)}
                        alt={favor.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      />
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); void toggleLike(favor); }}
                      aria-label={liked ? 'Remove from favorites' : 'Save to favorites'}
                      style={{
                        position: 'absolute', top: '20px', right: '20px',
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: liked ? 'rgba(244,63,94,0.88)' : 'rgba(16,24,40,0.42)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => { if (!liked) (e.currentTarget as HTMLElement).style.background = 'rgba(16,24,40,0.65)'; }}
                      onMouseLeave={e => { if (!liked) (e.currentTarget as HTMLElement).style.background = 'rgba(16,24,40,0.42)'; }}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                          stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          fill={liked ? '#ffffff' : 'none'}
                          style={{ transition: 'fill 0.15s ease' }}
                        />
                      </svg>
                    </button>
                  </div>

                  <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '17px', color: '#101828', lineHeight: '1.4', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {favor.title}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: BRAND }}>
                        {formatPrice(favor.budget)}
                      </span>
                      <span style={{
                        fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 500,
                        color: '#6941C6', background: '#F9F5FF',
                        border: '1px solid #E9D7FE', borderRadius: '9999px',
                        padding: '3px 10px', letterSpacing: '0.01em',
                      }}>
                        {displayCategory(favor.type)}
                      </span>
                    </div>

                    <div style={{ paddingTop: '10px', borderTop: '1px solid #EAECF0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1, minWidth: 0 }}>
                        <img
                          src={sellerAvatar}
                          alt={sellerName}
                          onClick={e => {
                            e.stopPropagation();
                            if (sellerId) router.push(`/seller/${sellerId}`);
                          }}
                          style={{ width: '30px', height: '30px', borderRadius: '9999px', objectFit: 'cover', objectPosition: 'top', flexShrink: 0, border: '2px solid #DFBAFF', cursor: sellerId ? 'pointer' : 'default' }}
                        />
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                          {sellerName}
                        </span>
                        {badge ? (
                          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, background: isPro ? '#A54AFF' : '#344054', color: '#ffffff', borderRadius: '9999px', padding: '2px 8px', flexShrink: 0, letterSpacing: '0.02em' }}>
                            {badge}
                          </span>
                        ) : null}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '4px' }}>
                        <svg viewBox="0 0 24 24" width="13" height="13"><polygon fill="#F79009" stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#101828' }}>{rating}</span>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#D0D5DD' }}>·</span>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#667085' }}>{reviews}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
