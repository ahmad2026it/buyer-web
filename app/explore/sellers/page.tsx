'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ListingSearchBar from '@/components/ListingSearchBar';
import SellerListingCard, { SellerCardSkeleton, sellerId } from '@/components/SellerListingCard';
import {
  BUYER_SELLERS_LIST_PARAMS,
  useGetBuyerSellersQuery,
} from '@/app/buyer/store/buyerSellersAPI';

const BRAND = '#A54AFF';
const FONT = 'Poppins, sans-serif';

function sellerMatchesQuery(
  seller: { name?: string; fullName?: string },
  query: string,
): boolean {
  if (!query) return true;
  const haystack = `${seller.name ?? ''} ${seller.fullName ?? ''}`.toLowerCase();
  return haystack.includes(query);
}

export default function AllSellersPage() {
  const [page, setPage] = useState<number>(BUYER_SELLERS_LIST_PARAMS.page);
  const [query, setQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(query.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [appliedSearch]);

  const { data, isLoading, isFetching, isError, refetch } = useGetBuyerSellersQuery({
    page,
    limit: BUYER_SELLERS_LIST_PARAMS.limit,
    search: appliedSearch || undefined,
  });

  const sellers = data?.data?.sellers ?? [];
  const pagination = data?.data?.pagination;
  const searchKey = appliedSearch.trim().toLowerCase();
  const visibleSellers = useMemo(
    () => (searchKey ? sellers.filter((seller) => sellerMatchesQuery(seller, searchKey)) : sellers),
    [sellers, searchKey],
  );
  const total = pagination?.total ?? visibleSellers.length;
  const hasMore = pagination ? sellers.length < pagination.total : false;
  const showListLoading = (isLoading || isFetching) && sellers.length === 0;
  const searching = Boolean(appliedSearch);

  const applySearch = () => setAppliedSearch(query.trim());
  const clearSearch = () => {
    setQuery('');
    setAppliedSearch('');
  };

  return (
    <>
      <Navbar />
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
                  Our Providers
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
                  All Sellers
                </h1>
                <p style={{ fontFamily: FONT, fontSize: '15px', color: '#667085' }}>
                  Hire the top talent from our pool of sellers.
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
                    {searching ? visibleSellers.length : total} {(searching ? visibleSellers.length : total) === 1 ? 'seller' : 'sellers'}
                  </span>
                </div>
              )}
            </div>

            <ListingSearchBar
              value={query}
              placeholder="Search sellers..."
              onChange={setQuery}
              onSubmit={applySearch}
              onClear={clearSearch}
            />
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px' }}>
          {showListLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '20px' }}>
              {Array.from({ length: 8 }, (_, i) => <SellerCardSkeleton key={i} />)}
            </div>
          ) : isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>
                Could not load sellers
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', marginBottom: 20 }}>
                There was a problem fetching sellers. Please try again.
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
          ) : visibleSellers.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>
                {searching ? 'No matching sellers' : 'No sellers yet'}
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085' }}>
                {searching
                  ? `Nothing matched “${appliedSearch}”. Try a different search.`
                  : 'Check back soon — top providers will appear here.'}
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '20px' }}>
                {visibleSellers.map((seller, i) => (
                  <SellerListingCard
                    key={sellerId(seller) ?? `${seller.name}-${i}`}
                    seller={seller}
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
                    Showing {visibleSellers.length} of {pagination?.total ?? visibleSellers.length}
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
