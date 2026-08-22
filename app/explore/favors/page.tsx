'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import FavorListingCard, { FavorCardSkeleton } from '@/components/FavorListingCard';
import ListingSearchBar from '@/components/ListingSearchBar';
import {
  useGetBuyerFavorsQuery,
  useMarkBuyerFavoriteMutation,
  useUnmarkBuyerFavoriteMutation,
} from '@/app/buyer/store/buyerFavorsAPI';
import type { BuyerFavor } from '@/app/buyer/store/buyerFavorsTypes';
import { useAppSelector } from '@/store/hooks';

const BRAND = '#A54AFF';
const FONT = 'Poppins, sans-serif';
const PAGE_SIZE = 12;

export default function AllFavorsPage() {
  const token = useAppSelector((state) => state.auth.token);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(query.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [appliedSearch]);

  const { data, isLoading, isFetching, isError, refetch } = useGetBuyerFavorsQuery({
    page,
    limit: PAGE_SIZE,
    search: appliedSearch || undefined,
  });
  const [markFavorite] = useMarkBuyerFavoriteMutation();
  const [unmarkFavorite] = useUnmarkBuyerFavoriteMutation();

  const favors = data?.data?.favors ?? [];
  const pagination = data?.data?.pagination;
  const total = pagination?.total ?? favors.length;
  const hasMore = pagination ? favors.length < pagination.total : false;
  const showListLoading = (isLoading || isFetching) && favors.length === 0;
  const searching = Boolean(appliedSearch);

  const applySearch = () => setAppliedSearch(query.trim());
  const clearSearch = () => {
    setQuery('');
    setAppliedSearch('');
  };

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
    <>
      <Navbar />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Log in to save this favor to your favorites."
        />
      )}
      <main style={{ minHeight: '100vh', background: '#FAFAFA' }}>
        <div
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #EAECF0',
            paddingTop: '104px',
            paddingBottom: '32px',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: FONT,
                fontSize: '13px',
                fontWeight: 500,
                color: '#667085',
                textDecoration: 'none',
                marginBottom: '16px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = BRAND; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#667085'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to home
            </Link>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: '13px', color: BRAND, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Most Requested
                </p>
                <h1
                  style={{
                    fontFamily: FONT,
                    fontWeight: 800,
                    fontSize: '30px',
                    color: '#101828',
                    lineHeight: '1.2',
                    marginBottom: '6px',
                  }}
                >
                  All Favors
                </h1>
                <p style={{ fontFamily: FONT, fontSize: '15px', color: '#667085' }}>
                  Browse every favor available on WhoCan.
                </p>
              </div>

              {total > 0 && (
                <div
                  style={{
                    background: '#F4EBFF',
                    border: '1.5px solid rgba(165,74,255,0.2)',
                    borderRadius: '9999px',
                    padding: '8px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: '14px', color: BRAND }}>
                    {total} {total === 1 ? 'favor' : 'favors'}
                  </span>
                </div>
              )}
            </div>

            <ListingSearchBar
              value={query}
              placeholder="Search favors..."
              onChange={setQuery}
              onSubmit={applySearch}
              onClear={clearSearch}
            />
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px' }}>
          {showListLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '24px' }}>
              {Array.from({ length: 6 }, (_, i) => <FavorCardSkeleton key={i} />)}
            </div>
          ) : isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>
                Could not load favors
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', marginBottom: 20 }}>
                There was a problem fetching favors. Please try again.
              </p>
              <button
                type="button"
                onClick={() => { void refetch(); }}
                style={{
                  fontFamily: FONT, fontWeight: 700, fontSize: 14, color: BRAND,
                  background: '#F4EBFF', border: 'none', borderRadius: '9999px',
                  padding: '11px 22px', cursor: 'pointer',
                }}
              >
                Try again
              </button>
            </div>
          ) : favors.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>
                {searching ? 'No matching favors' : 'No favors yet'}
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085' }}>
                {searching
                  ? `Nothing matched “${appliedSearch}”. Try a different search.`
                  : 'Check back soon — new favors will appear here.'}
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '24px' }}>
                {favors.map((favor) => (
                  <FavorListingCard
                    key={favor.id}
                    favor={favor}
                    liked={Boolean(favor.isFavorite)}
                    pending={pendingIds.has(favor.id)}
                    onToggleLike={(item) => { void toggleLike(item); }}
                  />
                ))}
              </div>

              {hasMore && (
                <div style={{ marginTop: '36px', textAlign: 'center' }}>
                  <button
                    type="button"
                    disabled={isFetching}
                    onClick={() => setPage((current) => current + 1)}
                    style={{
                      fontFamily: FONT, fontWeight: 600, fontSize: '14px', color: BRAND,
                      background: '#ffffff', border: `1.5px solid ${BRAND}`, borderRadius: '9999px',
                      padding: '12px 36px', cursor: isFetching ? 'not-allowed' : 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                    }}
                    onMouseEnter={(e) => { if (!isFetching) (e.currentTarget as HTMLElement).style.background = '#F8F0FF'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}
                  >
                    {isFetching ? 'Loading…' : 'Show more'}
                    {!isFetching && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12l7 7 7-7" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <p style={{ fontFamily: FONT, fontSize: '12px', color: '#98A2B3', marginTop: '8px' }}>
                    Showing {favors.length} of {total}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
