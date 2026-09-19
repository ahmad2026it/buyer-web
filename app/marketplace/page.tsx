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
import {
  cx,
  mpBanner,
  mpBannerCopy,
  mpBannerCta,
  mpBannerOrb,
  mpBannerTag,
  mpBannerText,
  mpBannerTitle,
  mpBody,
  mpChipsWrap,
  mpEmpty,
  mpEmptyText,
  mpEmptyTitle,
  mpFilterBtn,
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
  mpMoreBtn,
  mpPage,
  mpPostBtn,
  mpSearch,
  mpSearchInput,
  mpSearchRow,
  mpSectionCount,
  mpSectionHead,
  mpSectionTitle,
  mpSoftBtn,
} from '@/components/marketplace/ui';

function listingsQueryFromFilters(
  filters: MarketplaceFilters,
  page: number,
): GetMarketplaceListingsParams {
  const params: GetMarketplaceListingsParams = {
    page,
    limit: MARKETPLACE_LISTINGS_LIST_PARAMS.limit,
    sort: filters.sort,
    exclude_mine: true,
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

      <main className={mpPage}>
        <div className={mpHero}>
          <div className={mpHeroInner}>
            <div className={mpHeroLead}>
              <Link href="/" className={mpIconBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <div className={mpHeroCopy}>
                <h1 className={mpHeroTitle}>Marketplace</h1>
                <p className={mpHeroSubtitle}>Buy &amp; sell items near you</p>
              </div>
            </div>

            <div className={mpHeroActions}>
              {token ? (
                <Link href="/chat?tab=listing" className={mpGhostBtn}>
                  Chats
                </Link>
              ) : null}
              {token ? (
                <Link href="/marketplace/saved" className={mpGhostBtn}>
                  Saved
                </Link>
              ) : null}
              {token ? (
                <Link href="/marketplace/mine" className={mpGhostBtn}>
                  My ads
                </Link>
              ) : null}
              <button type="button" className={mpPostBtn} onClick={goPostAd}>
                <PlusIcon size={15} />
                Post Ad
              </button>
            </div>
          </div>

          <div className={mpSearchRow}>
            <label className={mpSearch}>
              <SearchIcon size={18} color="#98A2B3" />
              <input
                className={mpSearchInput}
                type="search"
                value={searchDraft}
                placeholder="Search electronics, cars, phones..."
                onChange={(event) => setSearchDraft(event.target.value)}
              />
            </label>
            <button
              type="button"
              className={mpFilterBtn}
              aria-label="Open filters"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersIcon size={18} color="#344054" />
            </button>
          </div>

          <div className={mpChipsWrap}>
            <MarketplaceCategoryChips
              value={filters.categoryId}
              onChange={(categoryId) => updateFilters({ ...filters, categoryId })}
            />
          </div>
        </div>

        <div className={mpBody}>
          <MarketplaceSidebar filters={filters} onChange={updateFilters} onReset={resetFilters} />

          <div>
            <section className={mpBanner} aria-label="Sell on WhoCan">
              <div className={mpBannerCopy}>
                <span className={mpBannerTag}>FREE LISTING</span>
                <h2 className={mpBannerTitle}>Sell anything in seconds!</h2>
                <p className={mpBannerText}>Reach thousands of verified buyers in your area.</p>
              </div>
              <button type="button" className={mpBannerCta} onClick={goPostAd}>
                Sell Now
              </button>
              <div className={cx(mpBannerOrb, 'right-20 -top-[70px] size-[180px]')} />
              <div className={cx(mpBannerOrb, '-right-5 -bottom-10 size-[120px]')} />
            </section>

            <div className={mpSectionHead}>
              <h2 className={mpSectionTitle}>
                Recent Listings {token && total > 0 ? <span className={mpSectionCount}>({total})</span> : null}
              </h2>
            </div>

            {!token ? (
              <div className={mpEmpty}>
                <h3 className={mpEmptyTitle}>Log in to browse listings</h3>
                <p className={mpEmptyText}>Sign in to see items for sale near you.</p>
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
                <h3 className={mpEmptyTitle}>Could not load listings</h3>
                <p className={mpEmptyText}>There was a problem fetching marketplace ads. Please try again.</p>
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
                <h3 className={mpEmptyTitle}>No listing found</h3>
                <p className={mpEmptyText}>Try another category, search, or reset your filters.</p>
                <button type="button" className={mpSoftBtn} onClick={resetFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className={mpGrid}>
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
