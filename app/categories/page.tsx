'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  useGetBuyerCategoriesQuery,
  useGetBuyerSubCategoriesQuery,
} from '@/app/buyer/store/buyerCategoriesAPI';
import type { BuyerCategory, BuyerSubCategory } from '@/app/buyer/store/buyerCategoriesTypes';

const BRAND = '#A54AFF';

const PALETTES = [
  { bg: '#F0FFF8', border: '#C3F0D8', pill: '#D1FAE5', pillText: '#065F46' },
  { bg: '#FFF0F5', border: '#FECDD3', pill: '#FCE7F3', pillText: '#9D174D' },
  { bg: '#FFFBEB', border: '#FDE68A', pill: '#FEF3C7', pillText: '#78350F' },
  { bg: '#F5F0FF', border: '#DDD6FE', pill: '#EDE9FE', pillText: '#4C1D95' },
];
const PALETTE_ORDER = [0, 2, 3, 1, 3, 0, 2, 1, 1, 3, 0, 2];

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CategoryCard({ category, palette, onCategoryClick, onSubClick }: {
  category: BuyerCategory;
  palette: typeof PALETTES[0];
  onCategoryClick: () => void;
  onSubClick: (sub: BuyerSubCategory) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [hoveredSub, setHoveredSub] = useState<number | null>(null);
  const { data, isLoading } = useGetBuyerSubCategoriesQuery(category.id);
  const subs = data?.data?.subCategories ?? [];
  const color = category.colorCode || BRAND;

  return (
    <div
      style={{
        background: palette.bg,
        border: `1.5px solid ${palette.border}`,
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'box-shadow 0.2s, transform 0.2s',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', overflow: 'hidden' }}>
          {category.icon ? (
            <img
              src={category.icon}
              alt=""
              style={{ width: 20, height: 20, objectFit: 'contain' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : null}
        </div>
        <button
          onClick={onCategoryClick}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, gap: '8px' }}
        >
          <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '20px', color: '#101828', lineHeight: '1.2', textAlign: 'left' }}>{category.name}</span>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: palette.pill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: palette.pillText, transition: 'background 0.15s' }}>
            <ArrowIcon />
          </div>
        </button>
      </div>

      <div style={{ height: '1px', background: palette.border }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '10px', fontWeight: 600, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Sub Categories</p>
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div key={i} style={{ height: 32, borderRadius: 8, background: 'rgba(16,24,40,0.04)', marginBottom: 2 }} />
          ))
        ) : subs.length === 0 ? (
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#98A2B3', padding: '7px 8px' }}>No sub-categories</p>
        ) : (
          subs.slice(0, 3).map((s) => (
            <button
              key={s.id}
              onClick={() => onSubClick(s)}
              onMouseEnter={() => setHoveredSub(s.id)}
              onMouseLeave={() => setHoveredSub(null)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: hoveredSub === s.id ? palette.pill : 'transparent',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                padding: '7px 8px', transition: 'background 0.12s',
              }}
            >
              <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: hoveredSub === s.id ? 600 : 500, color: hoveredSub === s.id ? '#101828' : '#344054', transition: 'color 0.12s, font-weight 0.12s' }}>{s.name}</span>
              <span style={{ color: '#98A2B3', opacity: hoveredSub === s.id ? 1 : 0, transition: 'opacity 0.12s' }}>
                <ArrowIcon />
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { data, isLoading, isError } = useGetBuyerCategoriesQuery({ search: '' });
  const categories = data?.data?.categories ?? [];

  const q = search.trim().toLowerCase();
  const filtered = categories.filter((c) => !q || c.name.toLowerCase().includes(q));

  const goToSearch = (category: string, subcategory?: string) => {
    const params = new URLSearchParams({ category });
    if (subcategory) params.set('q', subcategory);
    router.push(`/explore/search?${params.toString()}`);
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#FAFAFA' }}>

        <div style={{ background: '#ffffff', borderBottom: '1px solid #EAECF0', paddingTop: '104px', paddingBottom: '40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
              <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085', padding: 0 }}>Home</button>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#D0D5DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#101828', fontWeight: 500 }}>All Categories</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '12px', color: BRAND, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>Browse Everything</p>
                <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '34px', color: '#101828', lineHeight: '1.15', marginBottom: '10px' }}>All Categories</h1>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '15px', color: '#667085' }}>
                  {isLoading ? 'Loading categories...' : `${categories.length} categories`}
                </p>
              </div>

              <div style={{ position: 'relative', width: '320px', flexShrink: 0 }}>
                <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#98A2B3" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"/></svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search categories..."
                  style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#101828', background: '#F9FAFB', border: `1.5px solid ${searchFocused ? BRAND : '#EAECF0'}`, borderRadius: '9999px', padding: '11px 20px 11px 42px', outline: 'none', boxShadow: searchFocused ? '0 0 0 4px rgba(165,74,255,0.12)' : 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 80px' }}>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ height: 260, borderRadius: 20, background: '#fff', border: '1.5px solid #EAECF0' }} />
              ))}
            </div>
          ) : isError ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '18px', color: '#101828', marginBottom: '8px' }}>Unable to load categories</h3>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#667085' }}>Please try again in a moment.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#F4EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke={BRAND} strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke={BRAND} strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '18px', color: '#101828', marginBottom: '8px' }}>No categories found</h3>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#667085' }}>Try a different search term.</p>
            </div>
          ) : (
            <>
              {search && (
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085', marginBottom: '24px' }}>
                  Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<strong style={{ color: '#101828' }}>{search}</strong>"
                </p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {filtered.map((cat, i) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    palette={PALETTES[PALETTE_ORDER[i] ?? i % 4]}
                    onCategoryClick={() => goToSearch(cat.name)}
                    onSubClick={(sub) => goToSearch(cat.name, sub.name)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
