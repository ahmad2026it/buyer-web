'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FiltersModal from './FiltersModal';

const CATEGORIES = ['Cleaning', 'Electrical', 'Plumbing', 'Carpentry', 'Painting', 'Gardening', 'Assembly'];

const FLOATING_FAVORS = [
  { image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&auto=format&q=75', title: 'Deep Home Cleaning',  price: '$253.00', rating: '4.9' },
  { image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=300&h=200&fit=crop&auto=format&q=75', title: 'Electrical Repairs', price: '$180.00', rating: '4.8' },
  { image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop&auto=format&q=75', title: 'Garden Landscaping', price: '$120.00', rating: '4.7' },
];

const FLOATING_SELLERS = [
  { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format&q=80', name: 'John Doe',    role: 'Cleaning Expert', rating: '4.9', jobs: 387 },
  { image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format&q=80', name: 'Chris Gale',  role: 'Electrician',     rating: '4.8', jobs: 259 },
  { image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format&q=80', name: 'Olivia Rhye', role: 'Plumber',          rating: '4.9', jobs: 198 },
];

export default function ExploreHero() {
  const [query, setQuery]           = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams({ q: query, type: 'favors' });
    router.push(`/explore/search?${params.toString()}`);
  };

  const handleCategoryClick = (cat: string) => {
    const params = new URLSearchParams({ q: cat, type: 'favors', category: cat });
    router.push(`/explore/search?${params.toString()}`);
  };

  return (
    <section style={{ position: 'relative', minHeight: '620px', background: 'linear-gradient(160deg, #FAF5FF 0%, #F3E8FF 40%, #EDE9FE 100%)', overflow: 'hidden', paddingTop: '120px', paddingBottom: '80px', display: 'flex', alignItems: 'center' }}>
      {filtersOpen && <FiltersModal onClose={() => setFiltersOpen(false)} />}
      {/* Dot grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(165,74,255,0.12) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      {/* Floating favor cards — LEFT */}
      <div className="explore-float" style={{ position: 'absolute', left: '-20px', top: '100px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 1 }}>
        {FLOATING_FAVORS.map((f, i) => (
          <div key={f.title} style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #EAECF0', boxShadow: '0 8px 32px rgba(165,74,255,0.1)', overflow: 'hidden', width: '220px', transform: `rotate(${i % 2 === 0 ? '-3deg' : '2deg'}) translateX(${i * 8}px)`, opacity: 0.9 }}>
            <img src={f.image} alt={f.title} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
            <div style={{ padding: '10px 12px 12px' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '12px', color: '#101828', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.title}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#A54AFF', fontWeight: 700 }}>{f.price}</span>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#667085' }}>★ {f.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating seller cards — RIGHT */}
      <div className="explore-float" style={{ position: 'absolute', right: '-10px', top: '80px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 1 }}>
        {FLOATING_SELLERS.map((s, i) => (
          <div key={s.name} style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #EAECF0', boxShadow: '0 8px 32px rgba(165,74,255,0.1)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', width: '200px', transform: `rotate(${i % 2 === 0 ? '2.5deg' : '-2deg'}) translateX(${-i * 6}px)`, opacity: 0.9 }}>
            <img src={s.image} alt={s.name} style={{ width: '40px', height: '40px', borderRadius: '9999px', objectFit: 'cover', objectPosition: 'top', flexShrink: 0 }} />
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '12px', color: '#101828', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#667085' }}>{s.role}</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#F79009' }}>★ {s.rating} · {s.jobs} jobs</p>
            </div>
          </div>
        ))}
      </div>

      {/* Center content */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '978px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#A54AFF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>Explore WhoCan</p>
        <h1 className="rs-display" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '52px', lineHeight: '1.15', color: '#101828', letterSpacing: '-0.02em', marginBottom: '16px' }}>
          Find the perfect{' '}
          <span style={{ background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            handyman
          </span>
          <br />for every job
        </h1>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#475467', marginBottom: '40px', lineHeight: '1.6' }}>
          Browse thousands of verified service providers and favors — ready to hire today.
        </p>

        {/* Search bar */}
        <div className="rs-hero-search" style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '9999px', boxShadow: '0 4px 32px rgba(165,74,255,0.15)', border: '1.5px solid #EAECF0', padding: '8px 8px 8px 20px', gap: '8px', maxWidth: '700px', margin: '0 auto 28px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" stroke="#A54AFF" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="#A54AFF" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="What service are you looking for?"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#101828', background: 'transparent' }}
          />
          <button
            onClick={handleSearch}
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#ffffff', background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)', border: 'none', borderRadius: '9999px', padding: '12px 28px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.2s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            Search
          </button>
          <button
            onClick={() => setFiltersOpen(true)}
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: '14px', color: '#344054', background: '#ffffff', border: '1.5px solid #D0D5DD', borderRadius: '9999px', padding: '12px 20px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s ease' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#A54AFF'; el.style.color = '#A54AFF'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#D0D5DD'; el.style.color = '#344054'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M8 12h8M12 18h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            More filters
          </button>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: '13px', color: '#344054', background: '#ffffff', border: '1.5px solid #EAECF0', borderRadius: '9999px', padding: '8px 18px', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#F4EBFF'; el.style.borderColor = '#A54AFF'; el.style.color = '#A54AFF'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#ffffff'; el.style.borderColor = '#EAECF0'; el.style.color = '#344054'; }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
