'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import MarketplaceListingCard, {
  MarketplaceCardSkeleton,
} from '@/components/marketplace/MarketplaceListingCard';
import { PlusIcon } from '@/components/marketplace/MarketplaceIcons';
import {
  MARKETPLACE_MY_LISTINGS_PARAMS,
  useGetMyMarketplaceListingsQuery,
} from '@/app/buyer/store/marketplaceListingsAPI';
import { MARKETPLACE_MY_LISTING_STATUSES } from '@/lib/marketplace/types';
import type { MarketplaceMyListingStatus } from '@/lib/marketplace/types';
import { formatMarketplaceListingStatus } from '@/lib/marketplace/listings';
import { useAppSelector } from '@/store/hooks';
import {
  cx,
  mpChip,
  mpChipActive,
  mpChips,
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

const STATUS_FILTERS: Array<MarketplaceMyListingStatus | 'all'> = [
  'all',
  ...MARKETPLACE_MY_LISTING_STATUSES,
];

export default function MyMarketplaceListingsPage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const [status, setStatus] = useState<MarketplaceMyListingStatus | 'all'>('active');
  const [page, setPage] = useState(1);
  const [authOpen, setAuthOpen] = useState(false);

  const queryArgs = useMemo(
    () => ({
      page,
      limit: MARKETPLACE_MY_LISTINGS_PARAMS.limit,
      status,
    }),
    [page, status],
  );

  const { data, isLoading, isFetching, isError, refetch } = useGetMyMarketplaceListingsQuery(
    queryArgs,
    { skip: !token, refetchOnMountOrArgChange: true },
  );

  const listings = data?.data.listings ?? [];
  const pagination = data?.data.pagination;
  const total = pagination?.total ?? listings.length;
  const hasMore = pagination ? listings.length < pagination.total : false;
  const showListLoading = Boolean(token) && (isLoading || isFetching) && listings.length === 0;

  const goPostAd = () => {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    router.push('/marketplace/post');
  };

  const changeStatus = (next: MarketplaceMyListingStatus | 'all') => {
    setStatus(next);
    setPage(1);
  };

  return (
    <>
      <Navbar solid />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Log in to see ads you have posted."
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
                <h1 className={mpHeroTitle}>My listings</h1>
                <p className={mpHeroSubtitle}>Ads you have posted on Marketplace</p>
              </div>
            </div>

            <div className={mpHeroActions}>
              <Link href="/chat?tab=listing" className={mpGhostBtn}>
                Chats
              </Link>
              <Link href="/marketplace/saved" className={mpGhostBtn}>
                Saved
              </Link>
              <Link href="/marketplace" className={mpGhostBtn}>
                Browse
              </Link>
              <button type="button" className={mpPostBtn} onClick={goPostAd}>
                <PlusIcon size={15} />
                Post Ad
              </button>
            </div>
          </div>
        </div>

        <div className={mpMineBody}>
          <div className={mpChips} role="tablist" aria-label="Listing status">
            {STATUS_FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={status === value}
                className={cx(mpChip, status === value && mpChipActive)}
                onClick={() => changeStatus(value)}
              >
                {value === 'all' ? 'All' : formatMarketplaceListingStatus(value)}
              </button>
            ))}
          </div>

          <div className={cx(mpSectionHead, 'mt-[22px]')}>
            <h2 className={mpSectionTitle}>
              {status === 'all' ? 'Your ads' : `${formatMarketplaceListingStatus(status)} ads`}
              {token && total > 0 ? <span className={mpSectionCount}> ({total})</span> : null}
            </h2>
          </div>

          {!token ? (
            <div className={mpEmpty}>
              <h3 className={mpEmptyTitle}>Log in to see your ads</h3>
              <p className={mpEmptyText}>Sign in to manage listings you have posted.</p>
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
              <h3 className={mpEmptyTitle}>Could not load your ads</h3>
              <p className={mpEmptyText}>There was a problem fetching your listings. Please try again.</p>
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
              <h3 className={mpEmptyTitle}>No ads yet</h3>
              <p className={mpEmptyText}>
                {status === 'active'
                  ? 'You have not posted an active ad. Publish one to see it here.'
                  : `You have no ${status === 'all' ? '' : `${formatMarketplaceListingStatus(status).toLowerCase()} `}ads.`}
              </p>
              <button type="button" className={cx(mpPostBtn, 'mx-auto')} onClick={goPostAd}>
                <PlusIcon size={15} />
                Post Ad
              </button>
            </div>
          ) : (
            <>
              <div className={mpGrid}>
                {listings.map((listing) => (
                  <MarketplaceListingCard key={listing.id} listing={listing} variant="mine" />
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
