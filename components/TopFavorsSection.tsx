'use client';
import { useState } from 'react';
import Link from 'next/link';
import AuthGateModal from '@/components/AuthGateModal';
import FavorListingCard, { FavorCardSkeleton } from '@/components/FavorListingCard';
import {
  useGetBuyerFavorsQuery,
  useMarkBuyerFavoriteMutation,
  useUnmarkBuyerFavoriteMutation,
} from '@/app/buyer/store/buyerFavorsAPI';
import type { BuyerFavor } from '@/app/buyer/store/buyerFavorsTypes';
import { useAppSelector } from '@/store/hooks';

const MAX_FAVORS = 6;

export default function TopFavorsSection() {
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
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px' }} className="rs-section-head">
          <div>
            <p data-animate="fade" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#A54AFF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Most Requested</p>
            <h2 data-animate style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '36px', lineHeight: '1.2', color: '#101828', letterSpacing: '-0.01em' }}>
              Top Favors on{' '}
              <span style={{ background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>WhoCan</span>
            </h2>
            <p data-animate data-delay="1" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#475467', marginTop: '8px' }}>People are requesting these favors the most</p>
          </div>
          <Link href="/explore/favors" data-animate="fade" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#A54AFF', padding: '10px 20px', borderRadius: '9999px', border: '1.5px solid #A54AFF', transition: 'all 0.2s ease', whiteSpace: 'nowrap', textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8F0FF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            View All Favors
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#A54AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="rs-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
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
          <div className="rs-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
            {favors.map((favor, i) => (
              <FavorListingCard
                key={favor.id}
                favor={favor}
                liked={Boolean(favor.isFavorite)}
                pending={pendingIds.has(favor.id)}
                delay={(i % 3) + 1}
                onToggleLike={(item) => { void toggleLike(item); }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
