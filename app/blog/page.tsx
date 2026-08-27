'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ListingSearchBar from '@/components/ListingSearchBar';
import BlogListingCard, { BlogCardSkeleton } from '@/components/BlogListingCard';
import { useGetPublicBlogsQuery } from '@/app/buyer/store/buyerBlogsAPI';

const BRAND = '#A54AFF';
const FONT = 'Poppins, sans-serif';
const PAGE_SIZE = 10;

export default function BlogIndexPage() {
  const [page, setPage] = useState(1);
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

  const { data, isLoading, isFetching, isError, refetch } = useGetPublicBlogsQuery({
    page,
    limit: PAGE_SIZE,
    search: appliedSearch || undefined,
  });

  const blogs = data?.data?.blogs ?? [];
  const pagination = data?.data?.pagination;
  const total = pagination?.total ?? blogs.length;
  const hasMore = pagination ? blogs.length < pagination.total : false;
  const showListLoading = (isLoading || isFetching) && blogs.length === 0;
  const searching = Boolean(appliedSearch);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100dvh', background: '#FAFAFA' }}>
        <div className="listing-page-hero">
          <div className="listing-page-inner">
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
                marginBottom: '12px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = BRAND;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#667085';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to home
            </Link>

            <div className="listing-page-head">
              <div>
                <p
                  style={{
                    fontFamily: FONT,
                    fontWeight: 600,
                    fontSize: '13px',
                    color: BRAND,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Guides & stories
                </p>
                <h1 className="listing-page-title">WhoCan Blog</h1>
                <p style={{ fontFamily: FONT, fontSize: '15px', color: '#667085' }}>
                  Tips, how-tos, and stories to help you book trusted help with confidence.
                </p>
              </div>

              {total > 0 ? (
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
                    {total} {total === 1 ? 'article' : 'articles'}
                  </span>
                </div>
              ) : null}
            </div>

            <ListingSearchBar
              value={query}
              placeholder="Search articles..."
              onChange={setQuery}
              onSubmit={() => setAppliedSearch(query.trim())}
              onClear={() => {
                setQuery('');
                setAppliedSearch('');
              }}
            />
          </div>
        </div>

        <div className="listing-page-body">
          {showListLoading ? (
            <div className="listing-grid">
              {Array.from({ length: 6 }, (_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>
                Could not load articles
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', marginBottom: 20 }}>
                There was a problem fetching the blog. Please try again.
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
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '11px 22px',
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
            </div>
          ) : blogs.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>
                {searching ? 'No matching articles' : 'No articles yet'}
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085' }}>
                {searching
                  ? `Nothing matched “${appliedSearch}”. Try a different search.`
                  : 'Check back soon — new stories will appear here.'}
              </p>
            </div>
          ) : (
            <>
              <div className="listing-grid">
                {blogs.map((blog) => (
                  <BlogListingCard key={blog.id} blog={blog} />
                ))}
              </div>

              {hasMore ? (
                <div style={{ marginTop: '36px', textAlign: 'center' }}>
                  <button
                    type="button"
                    disabled={isFetching}
                    onClick={() => setPage((current) => current + 1)}
                    style={{
                      fontFamily: FONT,
                      fontWeight: 600,
                      fontSize: '14px',
                      color: BRAND,
                      background: '#ffffff',
                      border: `1.5px solid ${BRAND}`,
                      borderRadius: '9999px',
                      padding: '12px 36px',
                      cursor: isFetching ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isFetching) (e.currentTarget as HTMLElement).style.background = '#F8F0FF';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#ffffff';
                    }}
                  >
                    {isFetching ? 'Loading…' : 'Show more'}
                    {!isFetching ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12l7 7 7-7" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </button>
                  <p style={{ fontFamily: FONT, fontSize: '12px', color: '#98A2B3', marginTop: '8px' }}>
                    Showing {blogs.length} of {total}
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
