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

const FONT = 'Poppins, sans-serif';
const BRAND = '#A54AFF';

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

      <main className="marketplace-page">
        <div className="marketplace-hero">
          <div className="marketplace-hero-inner">
            <Link href="/marketplace" className="marketplace-back" aria-label="Back to marketplace">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <div className="marketplace-hero-copy">
              <h1>My listings</h1>
              <p>Ads you have posted on Marketplace</p>
            </div>

            <div className="marketplace-hero-actions">
              <Link href="/chat?tab=listing" className="marketplace-ghost-btn">
                Chats
              </Link>
              <Link href="/marketplace/saved" className="marketplace-ghost-btn">
                Saved
              </Link>
              <Link href="/marketplace" className="marketplace-ghost-btn">
                Browse
              </Link>
              <button type="button" className="marketplace-post-btn" onClick={goPostAd}>
                <PlusIcon size={15} />
                Post Ad
              </button>
            </div>
          </div>
        </div>

        <div className="marketplace-mine-body">
          <div className="marketplace-chips" role="tablist" aria-label="Listing status">
            {STATUS_FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={status === value}
                className={`marketplace-chip${status === value ? ' is-active' : ''}`}
                onClick={() => changeStatus(value)}
              >
                {value === 'all' ? 'All' : formatMarketplaceListingStatus(value)}
              </button>
            ))}
          </div>

          <div className="marketplace-section-head" style={{ marginTop: 22 }}>
            <h2>
              {status === 'all' ? 'Your ads' : `${formatMarketplaceListingStatus(status)} ads`}
              {token && total > 0 ? <span> ({total})</span> : null}
            </h2>
          </div>

          {!token ? (
            <div className="marketplace-empty">
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>
                Log in to see your ads
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', marginBottom: 16 }}>
                Sign in to manage listings you have posted.
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
                Could not load your ads
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', marginBottom: 16 }}>
                There was a problem fetching your listings. Please try again.
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
                No ads yet
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', marginBottom: 16 }}>
                {status === 'active'
                  ? 'You have not posted an active ad. Publish one to see it here.'
                  : `You have no ${status === 'all' ? '' : `${formatMarketplaceListingStatus(status).toLowerCase()} `}ads.`}
              </p>
              <button type="button" className="marketplace-post-btn" onClick={goPostAd} style={{ margin: '0 auto' }}>
                <PlusIcon size={15} />
                Post Ad
              </button>
            </div>
          ) : (
            <>
              <div className="marketplace-grid">
                {listings.map((listing) => (
                  <MarketplaceListingCard key={listing.id} listing={listing} variant="mine" />
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
