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
import {
  mpEmpty,
  mpEmptyText,
  mpEmptyTitle,
  mpGhostBtn,
  mpGrid,
  mpHero,
  mpHeroActions,
  mpHeroCopy,
  mpHeroInner,
  mpHeroLead,
  mpHeroSubtitle,
  mpHeroTitle,
  mpIconBtn,
  mpMineBody,
  mpMoreBtn,
  mpPage,
  mpPostBtn,
  mpSectionCount,
  mpSectionHead,
  mpSectionTitle,
  mpSoftBtn,
} from '@/components/marketplace/ui';

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

      <main className={mpPage}>
        <div className={mpHero}>
          <div className={mpHeroInner}>
            <div className={mpHeroLead}>
              <Link href="/marketplace" className={mpIconBtn} aria-label="Back to marketplace">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <div className={mpHeroCopy}>
                <h1 className={mpHeroTitle}>Saved ads</h1>
                <p className={mpHeroSubtitle}>Listings you have saved from Marketplace</p>
              </div>
            </div>

            <div className={mpHeroActions}>
              <Link href="/marketplace" className={mpGhostBtn}>
                Browse
              </Link>
              <Link href="/marketplace/mine" className={mpGhostBtn}>
                My ads
              </Link>
            </div>
          </div>
        </div>

        <div className={mpMineBody}>
          <div className={`${mpSectionHead} mt-2`}>
            <h2 className={mpSectionTitle}>
              Saved ads
              {token && total > 0 ? <span className={mpSectionCount}> ({total})</span> : null}
            </h2>
          </div>

          {!token ? (
            <div className={mpEmpty}>
              <h3 className={mpEmptyTitle}>Log in to see saved ads</h3>
              <p className={mpEmptyText}>Sign in to save listings and view them here.</p>
              <button type="button" className={mpSoftBtn} onClick={() => setAuthOpen(true)}>
                Log in
              </button>
            </div>
          ) : showListLoading ? (
            <div className={mpGrid}>
              {Array.from({ length: 8 }, (_, index) => (
                <MarketplaceCardSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            <div className={mpEmpty}>
              <h3 className={mpEmptyTitle}>Could not load saved ads</h3>
              <p className={mpEmptyText}>There was a problem fetching your saved listings. Please try again.</p>
              <button
                type="button"
                className={mpSoftBtn}
                onClick={() => {
                  void refetch();
                }}
              >
                Try again
              </button>
            </div>
          ) : listings.length === 0 ? (
            <div className={mpEmpty}>
              <h3 className={mpEmptyTitle}>No saved ads yet</h3>
              <p className={mpEmptyText}>Tap the heart on a listing to save it here.</p>
              <Link href="/marketplace" className={`${mpPostBtn} mx-auto`}>
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <>
              <div className={mpGrid}>
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
                <div className="mt-7 text-center">
                  <button
                    type="button"
                    className={mpMoreBtn}
                    disabled={isFetching}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    {isFetching ? 'Loading…' : 'Show more'}
                  </button>
                  <p className="mt-2 text-xs text-ink-subtle">
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
