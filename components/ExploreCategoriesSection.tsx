'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetBuyerCategoriesQuery, useGetBuyerSubCategoriesQuery } from '@/app/buyer/store/buyerCategoriesAPI';
import type { BuyerCategory } from '@/app/buyer/store/buyerCategoriesTypes';
import { ArrowRightIcon } from './Icons';
import FiltersModal from './FiltersModal';

const PILL_H = 80;

function withAlpha(hex: string, alpha: number): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return `rgba(165, 74, 255, ${alpha})`;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return `rgba(165, 74, 255, ${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatSubCount(count: number): string {
  return count === 1 ? '1 sub-category' : `${count} sub-categories`;
}

function CategoryPill({ category, onClick }: { category: BuyerCategory; onClick: () => void }) {
  const { data } = useGetBuyerSubCategoriesQuery(category.id);
  const count = data?.data?.subCategories?.length;
  const color = category.colorCode || '#A54AFF';

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        height: PILL_H, minWidth: '250px', borderRadius: '9999px',
        background: '#ffffff',
        border: '1.5px solid rgba(165,74,255,0.18)',
        padding: '0 20px 0 16px', cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(165,74,255,0.07)',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease', flexShrink: 0,
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(165,74,255,0.45)'; el.style.boxShadow = '0 8px 24px rgba(165,74,255,0.16)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(165,74,255,0.18)'; el.style.boxShadow = '0 4px 16px rgba(165,74,255,0.07)'; }}
    >
      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: withAlpha(color, 0.14), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
        <img
          src={category.icon}
          alt=""
          style={{ width: 26, height: 26, objectFit: 'contain' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#101828', lineHeight: '1.2', whiteSpace: 'nowrap' }}>{category.name}</p>
        {count != null && (
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#667085', marginTop: '3px', whiteSpace: 'nowrap' }}>{formatSubCount(count)}</p>
        )}
      </div>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <ArrowRightIcon size={15} color="#ffffff" />
      </div>
    </button>
  );
}

export default function ExploreCategoriesSection() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const router = useRouter();
  const { data, isLoading, isError } = useGetBuyerCategoriesQuery({ search: '' });
  const categories = data?.data?.categories ?? [];
  const doubled = categories.length ? [...categories, ...categories] : [];

  const pause  = (e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.animationPlayState = 'paused');
  const resume = (e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.animationPlayState = 'running');

  return (
    <section style={{ padding: '80px 0', background: '#ffffff' }}>
      <style>{`
        @keyframes exploreMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      {filtersOpen && <FiltersModal onClose={() => setFiltersOpen(false)} />}

      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#A54AFF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Browse by Category</p>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '32px', color: '#101828', lineHeight: '1.2', letterSpacing: '-0.01em' }}>Explore Categories</h2>
          </div>
          <button
            onClick={() => router.push('/categories')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#ffffff', background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)', border: 'none', borderRadius: '9999px', padding: '11px 24px', cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            Explore All
            <ArrowRightIcon size={16} color="#ffffff" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ overflow: 'hidden', paddingTop: '10px', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '12px', width: 'max-content', paddingLeft: '24px', alignItems: 'center' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  height: PILL_H, minWidth: '250px', borderRadius: '9999px',
                  background: '#ffffff', border: '1.5px solid rgba(165,74,255,0.12)',
                  padding: '0 20px 0 16px', flexShrink: 0,
                }}
              >
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#F0E8FF', flexShrink: 0 }} />
                <div style={{ width: 90, height: 14, borderRadius: 8, background: '#EEE6F8' }} />
              </div>
            ))}
          </div>
        </div>
      ) : isError || categories.length === 0 ? (
        <div className="container">
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: '#667085', margin: 0 }}>
            {isError ? 'Unable to load categories right now.' : 'No categories available yet.'}
          </p>
        </div>
      ) : (
        <div style={{ overflow: 'hidden', paddingTop: '10px', paddingBottom: '14px' }}>
          <div
            style={{ display: 'flex', gap: '12px', width: 'max-content', paddingLeft: '24px', alignItems: 'center', animation: 'exploreMarquee 30s linear infinite', willChange: 'transform' }}
            onMouseEnter={pause}
            onMouseLeave={resume}
          >
            {doubled.map((cat, i) => (
              <CategoryPill
                key={`${cat.id}-${i}`}
                category={cat}
                onClick={() => router.push(`/explore/search?category=${encodeURIComponent(cat.name)}`)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
