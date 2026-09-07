'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import MarketplaceListingCard from '@/components/marketplace/MarketplaceListingCard';
import {
  MarketplaceCategoryChips,
  MarketplaceFilterSheet,
  MarketplaceSidebar,
} from '@/components/marketplace/MarketplaceFilters';
import { PlusIcon, SearchIcon, SlidersIcon } from '@/components/marketplace/MarketplaceIcons';
import {
  DEFAULT_MARKETPLACE_FILTERS,
  MOCK_MARKETPLACE_LISTINGS,
  filterMarketplaceListings,
} from '@/lib/marketplace/data';
import type { MarketplaceFilters, MarketplaceListing } from '@/lib/marketplace/types';
import { useAppSelector } from '@/store/hooks';

const FONT = 'Poppins, sans-serif';
const BRAND = '#A54AFF';

export default function MarketplacePage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const [filters, setFilters] = useState<MarketplaceFilters>(DEFAULT_MARKETPLACE_FILTERS);
  const [searchDraft, setSearchDraft] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    return new Set(MOCK_MARKETPLACE_LISTINGS.filter((item) => item.isFavorite).map((item) => item.id));
  });

  const listings = useMemo(
    () => filterMarketplaceListings(MOCK_MARKETPLACE_LISTINGS, filters),
    [filters],
  );

  const resetFilters = () => {
    setFilters(DEFAULT_MARKETPLACE_FILTERS);
    setSearchDraft('');
  };

  const goPostAd = () => {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    router.push('/marketplace/post');
  };

  const toggleLike = (listing: MarketplaceListing) => {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(listing.id)) next.delete(listing.id);
      else next.add(listing.id);
      return next;
    });
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
        onChange={setFilters}
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

            <button type="button" className="marketplace-post-btn" onClick={goPostAd}>
              <PlusIcon size={15} />
              Post Ad
            </button>
          </div>

          <div className="marketplace-search-row">
            <label className="marketplace-search">
              <SearchIcon size={18} color="#98A2B3" />
              <input
                type="search"
                value={searchDraft}
                placeholder="Search electronics, cars, phones..."
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchDraft(value);
                  setFilters((current) => ({ ...current, query: value }));
                }}
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
              onChange={(categoryId) => setFilters((current) => ({ ...current, categoryId }))}
            />
          </div>
        </div>

        <div className="marketplace-body">
          <MarketplaceSidebar filters={filters} onChange={setFilters} onReset={resetFilters} />

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
                Recent Listings <span>({listings.length})</span>
              </h2>
            </div>

            {listings.length === 0 ? (
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
              <div className="marketplace-grid">
                {listings.map((listing) => (
                  <MarketplaceListingCard
                    key={listing.id}
                    listing={listing}
                    liked={savedIds.has(listing.id)}
                    onToggleLike={toggleLike}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
