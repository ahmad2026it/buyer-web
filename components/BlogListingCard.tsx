'use client';

import { useRouter } from 'next/navigation';
import FavorImage from '@/components/FavorImage';
import type { PublicBlog } from '@/app/buyer/store/buyerBlogsTypes';
import {
  blogHref,
  formatBlogDate,
  getBlogAuthorInitials,
  getBlogAuthorName,
} from '@/lib/publicBlogs';

const FONT = 'Poppins, sans-serif';
const AMBER = '#FEC84B';

export function BlogCardSkeleton() {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid #EAECF0',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      <div style={{ padding: '10px 10px 0' }}>
        <div
          className="listing-card-media"
          style={{ height: '200px', borderRadius: '14px', background: '#F2F4F7' }}
        />
      </div>
      <div style={{ padding: '18px 18px 20px' }}>
        <div style={{ width: '72%', height: 18, borderRadius: 4, background: '#F2F4F7', marginBottom: 12 }} />
        <div style={{ width: '100%', height: 12, borderRadius: 4, background: '#F2F4F7', marginBottom: 8 }} />
        <div style={{ width: '88%', height: 12, borderRadius: 4, background: '#F2F4F7', marginBottom: 18 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F2F4F7' }} />
            <div style={{ width: 96, height: 12, borderRadius: 4, background: '#F2F4F7' }} />
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F2F4F7' }} />
        </div>
      </div>
    </div>
  );
}

export default function BlogListingCard({ blog }: { blog: PublicBlog }) {
  const router = useRouter();
  const href = blogHref(blog.slug);
  const author = getBlogAuthorName(blog);
  const date = formatBlogDate(blog.published_at || blog.created_at);

  return (
    <article
      data-animate
      onClick={() => router.push(href)}
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid #EAECF0',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        width: '100%',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.25s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = 'rgba(165,74,255,0.3)';
        el.style.boxShadow = '0 8px 24px rgba(165,74,255,0.1)';
        el.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = '#EAECF0';
        el.style.boxShadow = 'none';
        el.style.transform = 'none';
      }}
    >
      <div style={{ padding: '10px 10px 0', flexShrink: 0 }}>
        <div
          className="listing-card-media"
          style={{ height: '200px', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}
        >
          <FavorImage src={blog.cover_image_url} alt={blog.title} />
          {blog.is_featured ? (
            <span
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                fontFamily: FONT,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#1D2939',
                background: AMBER,
                borderRadius: 9999,
                padding: '4px 10px',
              }}
            >
              Featured
            </span>
          ) : null}
        </div>
      </div>

      <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 18,
            color: '#101828',
            lineHeight: 1.3,
            marginBottom: 8,
          }}
        >
          {blog.title}
        </h3>
        {blog.excerpt ? (
          <p
            style={{
              fontFamily: FONT,
              fontSize: 14,
              color: '#475467',
              lineHeight: 1.65,
              marginBottom: 18,
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {blog.excerpt}
          </p>
        ) : (
          <div style={{ flex: 1, marginBottom: 18 }} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)',
                color: '#fff',
                fontFamily: FONT,
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {getBlogAuthorInitials(blog)}
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#344054',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {author}
              </p>
              {date ? (
                <p style={{ fontFamily: FONT, fontSize: 11, color: '#98A2B3' }}>{date}</p>
              ) : null}
            </div>
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: AMBER,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-hidden
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 17L17 7M17 7H9M17 7v8"
                stroke="#1D2939"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
}
