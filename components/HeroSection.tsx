'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SparklesIcon, WrenchIcon, SettingsIcon, ZapIcon, LeafIcon, DropletsIcon, PaintbrushIcon } from './Icons';

const CATEGORIES = [
  { icon: SparklesIcon, label: 'Cleaning' },
  { icon: WrenchIcon,   label: 'Repairing' },
  { icon: SettingsIcon, label: 'Assembly' },
  { icon: ZapIcon,      label: 'Electrical' },
];

const HERO_IMAGE = '/hero.png';

const POPULAR_SEARCHES = [
  'Clean house interior',
  'Assemble Furniture',
  'Install electric switches',
  'Plumbing fixtures',
  'Garden landscaping',
];

export default function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const placeholder = selectedCat
    ? `Search ${selectedCat.toLowerCase()} services...`
    : 'Try cleaning, gardening, or plumbing...';

  const handleSearch = () => {
    const params = new URLSearchParams({ type: 'favors' });
    if (query.trim()) params.set('q', query.trim());
    if (selectedCat) params.set('category', selectedCat);
    if (!query.trim() && selectedCat) params.set('q', selectedCat);
    router.push(`/explore/search?${params.toString()}`);
  };

  const toggleCat = (label: string) =>
    setSelectedCat(prev => (prev === label ? null : label));

  return (
    <section
      className="rs-hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#0D0120',
        paddingTop: '100px',
        paddingBottom: '60px',
        borderRadius: '0 0 50px 50px',
      }}
    >
      {/* Background blob decoration */}
      <div
        className="animate-blob"
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '700px',
          height: '700px',
          background:
            'radial-gradient(ellipse at center, rgba(165, 74, 255, 0.35) 0%, rgba(132, 48, 224, 0.2) 40%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '-8%',
          width: '400px',
          height: '400px',
          background:
            'radial-gradient(ellipse at center, rgba(165, 74, 255, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Small decorative dots */}
      {[
        { top: '20%', left: '8%' },
        { top: '65%', left: '6%' },
        { top: '30%', right: '5%', left: 'auto' },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'rgba(165, 74, 255, 0.6)',
            boxShadow: '0 0 12px rgba(165, 74, 255, 0.8)',
            ...pos,
            zIndex: 0,
          }}
        />
      ))}

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          className="rs-split"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
          }}
        >
          {/* Left — Copy */}
          <div>
            {/* Badge — jumps to app download section */}
            <a
              href="#app"
              className="hero-text-1"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(165, 74, 255, 0.15)',
                border: '1px solid rgba(165, 74, 255, 0.3)',
                borderRadius: '9999px',
                padding: '6px 14px 6px 8px',
                marginBottom: '24px',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(165, 74, 255, 0.55)';
                el.style.background = 'rgba(165, 74, 255, 0.22)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(165, 74, 255, 0.3)';
                el.style.background = 'rgba(165, 74, 255, 0.15)';
              }}
            >
              <span
                style={{
                  background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)',
                  borderRadius: '9999px',
                  padding: '3px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#ffffff',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Experience More!
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.8)',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Download the App Today
              </span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5"
                  stroke="rgba(165, 74, 255, 0.9)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            {/* H1 */}
            <h1
              className="hero-text-2 rs-display"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 800,
                fontSize: '56px',
                lineHeight: '1.1',
                letterSpacing: '-0.02em',
                color: '#ffffff',
                marginBottom: '20px',
              }}
            >
              Find{' '}
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                handymen
              </span>{' '}
              at your doorstep!
            </h1>

            {/* Subtitle */}
            <p
              className="hero-text-3"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                fontSize: '17px',
                lineHeight: '1.7',
                color: 'rgba(255,255,255,0.65)',
                marginBottom: '36px',
                maxWidth: '460px',
              }}
            >
              From cleaning to grass cutting, easily connect with trusted service
              providers for all your home needs.
            </p>

            {/* Search bar */}
            <div className="hero-text-4" style={{ position: 'relative', maxWidth: '500px', marginBottom: '24px' }}>
              <div
                className="rs-hero-search"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.06)',
                  border: searchFocused ? '1px solid rgba(165,74,255,0.55)' : '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '9999px',
                  padding: '6px 6px 6px 20px',
                  gap: '12px',
                  backdropFilter: 'blur(12px)',
                  transition: 'border-color 0.2s',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  style={{ flexShrink: 0, opacity: 0.5 }}
                >
                  <circle cx="8" cy="8" r="5.5" stroke="white" strokeWidth="1.5" />
                  <path d="M12.5 12.5L16 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 160)}
                  placeholder={placeholder}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                />
                <button
                  onClick={handleSearch}
                  style={{
                    background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)',
                    color: '#ffffff',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    padding: '10px 24px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    border: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 12px rgba(165, 74, 255, 0.4)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                >
                  Search
                </button>
              </div>

              {/* Popular searches dropdown */}
              {searchFocused && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', left: 0, right: 0,
                  background: '#ffffff', borderRadius: '16px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.18)', zIndex: 200,
                  paddingTop: '16px', paddingBottom: '8px', overflow: 'hidden',
                }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '13px', color: '#A54AFF', padding: '0 20px 10px', letterSpacing: '0.01em' }}>
                    Popular searches
                  </p>
                  {POPULAR_SEARCHES.map(s => (
                    <button
                      key={s}
                      onMouseDown={() => { setQuery(s); setSearchFocused(false); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#101828', padding: '11px 20px', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick category filters — selectable */}
            <div
              className="hero-text-4"
              style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}
            >
              {CATEGORIES.map((cat) => {
                const active = selectedCat === cat.label;
                return (
                  <button
                    key={cat.label}
                    onClick={() => toggleCat(cat.label)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: active ? 'rgba(165,74,255,0.3)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${active ? 'rgba(165,74,255,0.7)' : 'rgba(255,255,255,0.12)'}`,
                      borderRadius: '9999px',
                      padding: '7px 14px',
                      fontSize: '13px',
                      fontWeight: active ? 600 : 500,
                      color: active ? '#ffffff' : 'rgba(255,255,255,0.8)',
                      fontFamily: 'Poppins, sans-serif',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      backdropFilter: 'blur(8px)',
                      boxShadow: active ? '0 0 0 1px rgba(165,74,255,0.5)' : 'none',
                    }}
                  >
                    <cat.icon size={15} color={active ? '#ffffff' : 'rgba(255,255,255,0.85)'} />
                    {cat.label}
                  </button>
                );
              })}
              {/* More → All categories */}
              <button
                onClick={() => router.push('/categories')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '7px 4px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(165,74,255,0.9)',
                  fontFamily: 'Poppins, sans-serif',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#BF75FF'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(165,74,255,0.9)'; }}
              >
                More
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Stats strip */}
            <div
              className="rs-stats"
              style={{
                display: 'flex',
                gap: '28px',
                marginTop: '36px',
                paddingTop: '28px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {[
                { value: '1,000+', label: 'App Downloads' },
                { value: '751+', label: 'Active Users' },
                { value: '4.8★', label: 'Avg. Rating' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 700,
                      fontSize: '22px',
                      color: '#ffffff',
                      lineHeight: '1',
                      marginBottom: '4px',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Hero image */}
          <div
            className="rs-hero-visual"
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            {/* Glow circle behind image */}
            <div
              style={{
                position: 'absolute',
                inset: '10%',
                background:
                  'radial-gradient(circle, rgba(165, 74, 255, 0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
              }}
            />
            <img
              src={HERO_IMAGE}
              alt="Professional handymen ready to help"
              className="animate-float hero-image"
              style={{
                width: '100%',
                maxWidth: '540px',
                height: 'auto',
                objectFit: 'contain',
                position: 'relative',
                zIndex: 1,
                filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.35))',
                borderRadius: '24px',
              }}
            />

            {/* Floating service icon badges */}
            <style>{`
              @keyframes heroIconFloat {
                0%, 100% { transform: translateY(0px); }
                50%       { transform: translateY(-10px); }
              }
            `}</style>

            {([
              { label: 'Cleaning',   Icon: SparklesIcon,   iconColor: '#C084FC', iconBg: 'rgba(165,74,255,0.18)',  pos: { top: '8%',    left:  '0%'  }, dur: '3.6s', delay: '0s'   },
              { label: 'Electrical', Icon: ZapIcon,         iconColor: '#FCD34D', iconBg: 'rgba(252,211,77,0.15)', pos: { top: '16%',   right: '0%'  }, dur: '4.3s', delay: '0.7s' },
              { label: 'Repair',     Icon: WrenchIcon,      iconColor: '#A78BFA', iconBg: 'rgba(124,58,237,0.18)', pos: { top: '44%',   left:  '0%'  }, dur: '3.9s', delay: '1.5s' },
              { label: 'Plumbing',   Icon: DropletsIcon,    iconColor: '#38BDF8', iconBg: 'rgba(14,165,233,0.15)', pos: { top: '50%',   right: '0%'  }, dur: '4.6s', delay: '0.3s' },
              { label: 'Gardening',  Icon: LeafIcon,        iconColor: '#4ADE80', iconBg: 'rgba(22,163,74,0.15)',  pos: { bottom: '20%', left: '3%'  }, dur: '3.7s', delay: '1.1s' },
              { label: 'Painting',   Icon: PaintbrushIcon,  iconColor: '#FB7185', iconBg: 'rgba(225,29,72,0.15)',  pos: { bottom: '14%', right: '3%' }, dur: '4.1s', delay: '1.9s' },
            ] as const).map(({ label, Icon, iconColor, iconBg, pos, dur, delay }) => (
              <div
                key={label}
                className="rs-desktop-only"
                style={{
                  position: 'absolute',
                  ...pos,
                  zIndex: 3,
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1.5px solid rgba(255,255,255,0.13)',
                  borderRadius: '14px',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
                  padding: '8px 14px 8px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  animation: `heroIconFloat ${dur} ease-in-out ${delay} infinite`,
                  pointerEvents: 'none',
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={iconColor} />
                </div>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
