'use client';

import Link from 'next/link';
import { WrenchIcon } from './Icons';
import BlogListingCard, { BlogCardSkeleton } from '@/components/BlogListingCard';
import { useGetPublicBlogsQuery } from '@/app/buyer/store/buyerBlogsAPI';

const FONT = 'Poppins, sans-serif';
const MAX_BLOGS = 3;

export default function WhyChooseUsSection() {
  const { data, isLoading } = useGetPublicBlogsQuery({ page: 1, limit: MAX_BLOGS });
  const blogs = (data?.data?.blogs ?? []).slice(0, MAX_BLOGS);
  const showCards = isLoading || blogs.length > 0;

  return (
    <section className="rs-section" style={{ padding: '96px 0', background: '#ffffff' }}>
      <div className="container">
        <div
          className="rs-split"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '48px',
            alignItems: 'end',
            marginBottom: '48px',
          }}
        >
          <div>
            <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: '13px', color: '#7C3AED', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 8px' }}>
              From our blog
            </p>
            <h2 className="rs-h2" style={{ fontFamily: FONT, fontWeight: 700, fontSize: '44px', lineHeight: '1.15', color: '#101828', letterSpacing: '-0.02em', margin: 0 }}>
              Find local{' '}
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 100%)',
                  verticalAlign: 'middle',
                  marginRight: '4px',
                  flexShrink: 0,
                }}
              >
                <WrenchIcon size={20} color="#ffffff" />
              </span>{' '}
              handymen near you
            </h2>
          </div>

          <div>
            <p style={{ fontFamily: FONT, fontSize: '16px', color: '#475467', lineHeight: '1.7', margin: showCards ? '0 0 20px' : 0 }}>
              Our platform connects you with verified, background-checked local
              service providers — so you can book with confidence, every time.
              Quality guaranteed or your money back.
            </p>
            {showCards && (
              <Link
                href="/blog"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#7C3AED',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  border: '1.5px solid #7C3AED',
                  background: '#ffffff',
                  textDecoration: 'none',
                }}
              >
                See all articles
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {showCards && (
          <div
            className="rs-grid-3"
            style={{ display: 'grid', gridTemplateColumns: `repeat(${isLoading ? MAX_BLOGS : blogs.length}, minmax(0, 1fr))`, gap: '20px' }}
          >
            {isLoading
              ? Array.from({ length: MAX_BLOGS }, (_, i) => <BlogCardSkeleton key={i} />)
              : blogs.map((blog) => <BlogListingCard key={blog.id} blog={blog} />)}
          </div>
        )}
      </div>
    </section>
  );
}
