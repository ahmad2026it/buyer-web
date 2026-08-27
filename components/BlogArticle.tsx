'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FavorImage from '@/components/FavorImage';
import BlogListingCard, { BlogCardSkeleton } from '@/components/BlogListingCard';
import {
  useGetPublicBlogBySlugQuery,
  useGetPublicBlogsQuery,
} from '@/app/buyer/store/buyerBlogsAPI';
import {
  formatBlogDate,
  getBlogAuthorInitials,
  getBlogAuthorName,
  sanitizeBlogHtml,
} from '@/lib/publicBlogs';

const BRAND = '#A54AFF';
const FONT = 'Poppins, sans-serif';
const GRAD = 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)';

function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled or share unavailable */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        void handleShare();
      }}
      title="Share this article"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: FONT,
        fontSize: '13px',
        fontWeight: 600,
        color: copied ? '#059669' : '#667085',
        background: copied ? '#ECFDF3' : '#F9FAFB',
        border: `1.5px solid ${copied ? '#A7F3D0' : '#EAECF0'}`,
        borderRadius: '9999px',
        padding: '8px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {copied ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16 6 12 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}

function BlogArticleSkeleton() {
  return (
    <main style={{ background: '#FAFAFA', minHeight: '100vh' }}>
      <div style={{ height: 420, background: '#F2F4F7' }} />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 0', marginBottom: 36, borderBottom: '1px solid #EAECF0' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F2F4F7' }} />
            <div>
              <div style={{ width: 120, height: 12, borderRadius: 4, background: '#F2F4F7', marginBottom: 8 }} />
              <div style={{ width: 160, height: 10, borderRadius: 4, background: '#F2F4F7' }} />
            </div>
          </div>
        </div>
        <div style={{ width: '100%', height: 14, borderRadius: 6, background: '#F2F4F7', marginBottom: 10 }} />
        <div style={{ width: '96%', height: 14, borderRadius: 6, background: '#F2F4F7', marginBottom: 10 }} />
        <div style={{ width: '88%', height: 14, borderRadius: 6, background: '#F2F4F7', marginBottom: 28 }} />
        <div style={{ width: '40%', height: 22, borderRadius: 6, background: '#F2F4F7', marginBottom: 16 }} />
        <div style={{ width: '100%', height: 14, borderRadius: 6, background: '#F2F4F7', marginBottom: 10 }} />
        <div style={{ width: '92%', height: 14, borderRadius: 6, background: '#F2F4F7' }} />
      </div>
    </main>
  );
}

export default function BlogArticle({ slug }: { slug: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGetPublicBlogBySlugQuery(slug);
  const blog = data?.data;
  const html = blog?.content ? sanitizeBlogHtml(blog.content) : '';

  const { data: relatedResponse } = useGetPublicBlogsQuery(
    { page: 1, limit: 4 },
    { skip: !blog?.id },
  );
  const related = (relatedResponse?.data?.blogs ?? [])
    .filter((item) => item.id !== blog?.id)
    .slice(0, 3);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <BlogArticleSkeleton />
        <Footer />
      </>
    );
  }

  if (isError || !blog?.slug) {
    return (
      <>
        <Navbar />
        <main
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 28, color: '#101828' }}>
            Article not found
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 15, color: '#667085', maxWidth: 420 }}>
            This post may be unpublished or the link is incorrect.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              style={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 14,
                color: BRAND,
                background: '#F4EBFF',
                border: 'none',
                borderRadius: 9999,
                padding: '12px 22px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => router.push('/blog')}
              style={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 14,
                color: '#fff',
                background: BRAND,
                border: 'none',
                borderRadius: 9999,
                padding: '12px 28px',
                cursor: 'pointer',
              }}
            >
              Back to Blog
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const date = formatBlogDate(blog.published_at || blog.created_at);
  const author = getBlogAuthorName(blog);

  return (
    <>
      <Navbar />
      <main style={{ background: '#FAFAFA', minHeight: '100vh' }}>
        <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
          {blog.cover_image_url ? (
            <FavorImage
              src={blog.cover_image_url}
              alt={blog.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: GRAD,
              }}
            />
          )}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '0 24px 44px',
              maxWidth: 860,
              margin: '0 auto',
            }}
          >
            {blog.is_featured ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: BRAND,
                  borderRadius: 9999,
                  padding: '4px 14px',
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                  }}
                >
                  Featured
                </span>
              </div>
            ) : null}
            <h1
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 32,
                color: '#ffffff',
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 12px rgba(0,0,0,0.3)',
              }}
            >
              {blog.title}
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              padding: '24px 0',
              borderBottom: '1px solid #EAECF0',
              marginBottom: 36,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: GRAD,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#fff',
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {getBlogAuthorInitials(blog)}
              </div>
              <div>
                <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#101828', lineHeight: 1.2 }}>
                  {author}
                </p>
                {date ? (
                  <p style={{ fontFamily: FONT, fontSize: 12, color: '#667085' }}>{date}</p>
                ) : null}
              </div>
            </div>
            <ShareButton title={blog.title} />
          </div>

          {html ? (
            <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p style={{ fontFamily: FONT, fontSize: 15, color: '#667085' }}>
              {blog.excerpt || 'This article has no content yet.'}
            </p>
          )}

          <div
            style={{
              marginTop: 56,
              borderRadius: 20,
              background: GRAD,
              padding: '40px 36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 24,
            }}
          >
            <div>
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 8 }}>
                Ready to book a service?
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6 }}>
                Find verified providers near you and get the job done right, the first time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/explore/search')}
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 15,
                color: BRAND,
                background: '#fff',
                border: 'none',
                borderRadius: 9999,
                padding: '14px 32px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
            >
              Browse Services
            </button>
          </div>

          {related.length > 0 ? (
            <section style={{ marginTop: 56 }}>
              <h2
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 22,
                  color: '#101828',
                  marginBottom: 20,
                }}
              >
                More articles
              </h2>
              <div className="listing-grid">
                {related.map((item) => (
                  <BlogListingCard key={item.id} blog={item} />
                ))}
              </div>
            </section>
          ) : null}

          <button
            type="button"
            onClick={() => router.push('/blog')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 40,
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 600,
              color: '#667085',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All articles
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
