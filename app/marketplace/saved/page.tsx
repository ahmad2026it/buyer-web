'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import MarketplaceListingCard, {
  MarketplaceCardSkeleton,
} from '@/components/marketplace/MarketplaceListingCard';
import {
  MARKETPLACE_SAVED_LISTINGS_PARAMS,
  useGetSavedMarketplaceListingsQuery,
} from '@/app/buyer/store/marketplaceListingsAPI';
import type { MarketplaceListing } from '@/lib/marketplace/types';
import { useSaveMarketplaceListing } from '@/lib/marketplace/useSaveMarketplaceListing';
import { useAppSelector } from '@/store/hooks';

const FONT = 'Poppins, sans-serif';
const BRAND = '#A54AFF';

export default function SavedMarketplaceListingsPage() {
  const token = useAppSelector((state) => state.auth.token);
  const [page, setPage] = useState(1);
  const [authOpen, setAuthOpen] = useState(false);
  const { toggleSave, pendingIds } = useSaveMarketplaceListing();

  const queryArgs = useMemo(
    () => ({
      page,
      limit: MARKETPLACE_SAVED_LISTINGS_PARAMS.limit,
    }),
    [page],
  );

  const { data, isLoading, isFetching, isError, refetch } = useGetSavedMarketplaceListingsQuery(
    queryArgs,
    { skip: !token, refetchOnMountOrArgChange: true },
  );

  const listings = data?.data.listings ?? [];
  const pagination = data?.data.pagination;
  const total = pagination?.total ?? listings.length;
  const hasMore = pagination ? listings.length < pagination.total : false;
  const showListLoading = Boolean(token) && (isLoading || isFetching) && listings.length === 0;

  const toggleLike = async (listing: MarketplaceListing) => {
    const result = await toggleSave(listing);
    if (result.needsAuth) setAuthOpen(true);
  };

  return (
    <>
      <Navbar solid />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Log in to see ads you have saved."
        />
      )}

      <main className="marketplace-page">
        <div className="marketplace-hero">
          <div className="marketplace-hero-inner">
            <Link href="/marketplace" className="marketplace-back" aria-label="Back to marketplace">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <div className="marketplace-hero-copy">
              <h1>Saved ads</h1>
              <p>Listings you have saved from Marketplace</p>
            </div>

            <div className="marketplace-hero-actions">
              <Link href="/marketplace" className="marketplace-ghost-btn">
                Browse
              </Link>
              <Link href="/marketplace/mine" className="marketplace-ghost-btn">
                My ads
              </Link>
            </div>
          </div>
        </div>

        <div className="marketplace-mine-body">
          <div className="marketplace-section-head" style={{ marginTop: 8 }}>
            <h2>
              Saved ads
              {token && total > 0 ? <span> ({total})</span> : null}
            </h2>
          </div>

          {!token ? (
            <div className="marketplace-empty">
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>
                Log in to see saved ads
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', marginBottom: 16 }}>
                Sign in to save listings and view them here.
              </p>
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 14,
                  color: BRAND,
                  background: '#F4EBFF',
                  borderRadius: 9999,
                  padding: '10px 20px',
                }}
              >
                Log in
              </button>
            </div>
          ) : showListLoading ? (
            <div className="marketplace-grid">
              {Array.from({ length: 8 }, (_, index) => (
                <MarketplaceCardSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            <div className="marketplace-empty">
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>
                Could not load saved ads
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', marginBottom: 16 }}>
                There was a problem fetching your saved listings. Please try again.
              </p>
              <button
                type="button"
                onClick={() => {
                  void refetch();
                }}
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 14,
                  color: BRAND,
                  background: '#F4EBFF',
                  borderRadius: 9999,
                  padding: '10px 20px',
                }}
              >
                Try again
              </button>
            </div>
          ) : listings.length === 0 ? (
            <div className="marketplace-empty">
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>
                No saved ads yet
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', marginBottom: 16 }}>
                Tap the heart on a listing to save it here.
              </p>
              <Link href="/marketplace" className="marketplace-post-btn" style={{ margin: '0 auto' }}>
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <>
              <div className="marketplace-grid">
                {listings.map((listing) => (
                  <MarketplaceListingCard
                    key={listing.id}
                    listing={listing}
                    liked
                    savePending={pendingIds.has(listing.id)}
                    onToggleLike={(item) => {
                      void toggleLike(item);
                    }}
                  />
                ))}
              </div>
              {hasMore ? (
                <div style={{ marginTop: 28, textAlign: 'center' }}>
                  <button
                    type="button"
                    disabled={isFetching}
                    onClick={() => setPage((current) => current + 1)}
                    style={{
                      fontFamily: FONT,
                      fontWeight: 600,
                      fontSize: 14,
                      color: BRAND,
                      background: '#ffffff',
                      border: `1.5px solid ${BRAND}`,
                      borderRadius: 9999,
                      padding: '12px 36px',
                      cursor: isFetching ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isFetching ? 'Loading…' : 'Show more'}
                  </button>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: '#98A2B3', marginTop: 8 }}>
                    Showing {listings.length} of {total}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
