'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import MarketplaceListingCard, {
  MarketplaceCardSkeleton,
} from '@/components/marketplace/MarketplaceListingCard';
import {
  MarketplaceCategoryChips,
  MarketplaceFilterSheet,
  MarketplaceSidebar,
} from '@/components/marketplace/MarketplaceFilters';
import { PlusIcon, SearchIcon, SlidersIcon } from '@/components/marketplace/MarketplaceIcons';
import { DEFAULT_MARKETPLACE_FILTERS } from '@/lib/marketplace/data';
import { ALL_MARKETPLACE_CATEGORY_ID } from '@/lib/marketplace/types';
import type { MarketplaceFilters, MarketplaceListing } from '@/lib/marketplace/types';
import {
  MARKETPLACE_LISTINGS_LIST_PARAMS,
  useGetMarketplaceListingsQuery,
} from '@/app/buyer/store/marketplaceListingsAPI';
import type { GetMarketplaceListingsParams } from '@/app/buyer/store/marketplaceListingsTypes';
import { useSaveMarketplaceListing } from '@/lib/marketplace/useSaveMarketplaceListing';
import { useAppSelector } from '@/store/hooks';

const FONT = 'Poppins, sans-serif';
const BRAND = '#A54AFF';

function listingsQueryFromFilters(
  filters: MarketplaceFilters,
  page: number,
): GetMarketplaceListingsParams {
  const params: GetMarketplaceListingsParams = {
    page,
    limit: MARKETPLACE_LISTINGS_LIST_PARAMS.limit,
    sort: filters.sort,
    exclude_mine: false,
  };

  const search = filters.query.trim();
  if (search) params.search = search;
  if (filters.categoryId && filters.categoryId !== ALL_MARKETPLACE_CATEGORY_ID) {
    params.category_id = filters.categoryId;
  }
  if (filters.condition !== 'all') params.condition = filters.condition;
  if (filters.minPrice.trim()) params.min_price = filters.minPrice.trim();
  if (filters.maxPrice.trim()) params.max_price = filters.maxPrice.trim();

  return params;
}

export default function MarketplacePage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const [filters, setFilters] = useState<MarketplaceFilters>(DEFAULT_MARKETPLACE_FILTERS);
  const [searchDraft, setSearchDraft] = useState('');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { toggleSave, pendingIds } = useSaveMarketplaceListing();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((current) =>
        current.query === searchDraft ? current : { ...current, query: searchDraft },
      );
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  const queryArgs = useMemo(
    () => listingsQueryFromFilters(filters, page),
    [filters, page],
  );

  const { data, isLoading, isFetching, isError, refetch } = useGetMarketplaceListingsQuery(
    queryArgs,
    { skip: !token, refetchOnMountOrArgChange: true },
  );

  const listings = useMemo(() => {
    const items = data?.data.listings ?? [];
    return items.filter((listing) => {
      if (filters.featuredOnly && !listing.featured) return false;
      if (filters.negotiableOnly && !listing.negotiable) return false;
      return true;
    });
  }, [data, filters.featuredOnly, filters.negotiableOnly]);

  const pagination = data?.data.pagination;
  const total = pagination?.total ?? listings.length;
  const hasMore = pagination ? (data?.data.listings.length ?? 0) < pagination.total : false;
  const showListLoading = Boolean(token) && (isLoading || isFetching) && listings.length === 0;

  const updateFilters = (next: MarketplaceFilters) => {
    setFilters(next);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_MARKETPLACE_FILTERS);
    setSearchDraft('');
    setPage(1);
  };

  const goPostAd = () => {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    router.push('/marketplace/post');
  };

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
          message="Log in to post an ad or save listings."
        />
      )}
      <MarketplaceFilterSheet
        open={filterOpen}
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        onClose={() => setFilterOpen(false)}
      />

      <main className="marketplace-page">
        <div className="marketplace-hero">
          <div className="marketplace-hero-inner">
            <Link href="/" className="marketplace-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <div className="marketplace-hero-copy">
              <h1>Marketplace</h1>
              <p>Buy &amp; sell items near you</p>
            </div>

            <div className="marketplace-hero-actions">
              {token ? (
                <Link href="/chat?tab=listing" className="marketplace-ghost-btn">
                  Chats
                </Link>
              ) : null}
              {token ? (
                <Link href="/marketplace/saved" className="marketplace-ghost-btn">
                  Saved
                </Link>
              ) : null}
              {token ? (
                <Link href="/marketplace/mine" className="marketplace-ghost-btn">
                  My ads
                </Link>
              ) : null}
              <button type="button" className="marketplace-post-btn" onClick={goPostAd}>
                <PlusIcon size={15} />
                Post Ad
              </button>
            </div>
          </div>

          <div className="marketplace-search-row">
            <label className="marketplace-search">
              <SearchIcon size={18} color="#98A2B3" />
              <input
                type="search"
                value={searchDraft}
                placeholder="Search electronics, cars, phones..."
                onChange={(event) => setSearchDraft(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="marketplace-filter-btn"
              aria-label="Open filters"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersIcon size={18} color="#344054" />
            </button>
          </div>

          <div className="marketplace-chips-wrap">
            <MarketplaceCategoryChips
              value={filters.categoryId}
              onChange={(categoryId) => updateFilters({ ...filters, categoryId })}
            />
          </div>
        </div>

        <div className="marketplace-body">
          <MarketplaceSidebar filters={filters} onChange={updateFilters} onReset={resetFilters} />

          <div className="marketplace-main">
            <section className="marketplace-banner" aria-label="Sell on WhoCan">
              <div className="marketplace-banner-copy">
                <span className="marketplace-banner-tag">FREE LISTING</span>
                <h2>Sell anything in seconds!</h2>
                <p>Reach thousands of verified buyers in your area.</p>
              </div>
              <button type="button" className="marketplace-banner-cta" onClick={goPostAd}>
                Sell Now
              </button>
              <div className="marketplace-banner-orb marketplace-banner-orb-a" />
              <div className="marketplace-banner-orb marketplace-banner-orb-b" />
            </section>

            <div className="marketplace-section-head">
              <h2>
                Recent Listings {token && total > 0 ? <span>({total})</span> : null}
              </h2>
            </div>

            {!token ? (
              <div className="marketplace-empty">
                <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>
                  Log in to browse listings
                </h3>
                <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', marginBottom: 16 }}>
                  Sign in to see items for sale near you.
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
                  Could not load listings
                </h3>
                <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', marginBottom: 16 }}>
                  There was a problem fetching marketplace ads. Please try again.
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
                  No listings match
                </h3>
                <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', marginBottom: 16 }}>
                  Try another category, search, or reset your filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
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
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="marketplace-grid">
                  {listings.map((listing) => (
                    <MarketplaceListingCard
                      key={listing.id}
                      listing={listing}
                      liked={listing.isFavorite}
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
                      Showing {data?.data.listings.length ?? listings.length} of {total}
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
