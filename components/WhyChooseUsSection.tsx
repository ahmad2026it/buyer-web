'use client';

import { useRouter } from 'next/navigation';
import { WrenchIcon, ShieldCheckIcon, ArrowRightIcon, ArrowUpRightIcon } from './Icons';

const SERVICE_IMAGE =
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&h=300&fit=crop&auto=format'; // deep home cleaning
const SELLER_AVATAR =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&h=60&fit=crop&auto=format'; // professional provider portrait

// Amber matches the navbar "Get App" CTA — #FEC84B
const AMBER = '#FEC84B';

function LearnMoreRow({ light = false, href }: { light?: boolean; href?: string }) {
  const router = useRouter();
  return (
    <div
      onClick={() => href && router.push(href)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: href ? 'pointer' : 'default' }}
    >
      <span
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          color: light ? '#5B21B6' : '#344054',
        }}
      >
        Learn More
      </span>
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: light ? 'rgba(124,58,237,0.18)' : AMBER,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ArrowUpRightIcon size={16} color={light ? '#5B21B6' : '#1D2939'} />
      </div>
    </div>
  );
}

export default function WhyChooseUsSection() {
  const router = useRouter();
  return (
    <section style={{ padding: '96px 0', background: '#ffffff' }}>
      <div className="container">

        {/* ── SECTION HEADING ───────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '48px',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div data-animate>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '44px', lineHeight: '1.15', color: '#101828', letterSpacing: '-0.02em' }}>
              Find trusted{' '}
              <span
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

          <p data-animate data-delay="1" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#475467', lineHeight: '1.7' }}>
            Our platform connects you with verified, background-checked local
            service providers — so you can book with confidence, every time.
            Quality guaranteed or your money back.
          </p>
        </div>

        {/* ── CARD GRID ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 0.62fr',
            gap: '16px',
            alignItems: 'stretch',
          }}
        >

          {/* ── LEFT CARD ── */}
          <div
            data-animate
            data-delay="1"
            onClick={() => router.push('/articles/deep-home-cleaning')}
            style={{
              background: '#F7F7F7',
              borderRadius: '20px',
              border: '1.5px solid #EAECF0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'box-shadow 0.25s ease, transform 0.25s ease',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 8px 32px rgba(165,74,255,0.14)'; el.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; el.style.transform = 'none'; }}
          >
            <div style={{ overflow: 'hidden', flexShrink: 0 }}>
              <img
                src={SERVICE_IMAGE}
                alt="Deep Home Cleaning"
                style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
              />
            </div>
            <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#101828', marginBottom: '10px', lineHeight: '1.3' }}>
                Deep Home Cleaning
              </h3>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#475467', lineHeight: '1.65', flex: 1, marginBottom: '20px' }}>
                Professional cleaning service for your entire home, available
                when you need it most. Trusted by hundreds of happy customers.
              </p>
              <LearnMoreRow href="/articles/deep-home-cleaning" />
            </div>
          </div>

          {/* ── CENTER CARD: edge-to-edge squiggle ── */}
          <div
            data-animate
            data-delay="2"
            onClick={() => router.push('/articles/how-it-works')}
            style={{
              background: '#EDE9FE',
              borderRadius: '20px',
              border: '1.5px solid #DDD6FE',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'box-shadow 0.25s ease, transform 0.25s ease',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 8px 32px rgba(124,58,237,0.18)'; el.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; el.style.transform = 'none'; }}
          >
            {/* Author pill — padded */}
            <div style={{ padding: '22px 24px 0' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  borderRadius: '9999px',
                  padding: '6px 14px 6px 6px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
                <img
                  src={SELLER_AVATAR}
                  alt="Alfonzo Schuessler"
                  style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', flexShrink: 0 }}
                />
                <div>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', fontWeight: 500, color: '#98A2B3', letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: '1.2' }}>
                    Provider
                  </p>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: '#101828', lineHeight: '1.2' }}>
                    Alfonzo Schuessler
                  </p>
                </div>
              </div>
            </div>

            {/* Squiggle — full width, no horizontal padding */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '14px 0' }}>
              <svg
                viewBox="0 0 340 155"
                fill="none"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                aria-hidden="true"
              >
                <path
                  d="M -10 138 C 40 138, 55 17, 120 17 C 185 17, 195 142, 250 142 C 305 142, 320 72, 360 62"
                  stroke={AMBER}
                  strokeWidth="22"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>

            {/* Bottom text — padded */}
            <div style={{ padding: '0 24px 24px' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#1E1B4B', marginBottom: '8px', lineHeight: '1.3' }}>
                How WhoCan Connects You with the Right Handyman
              </h3>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#4C1D95', lineHeight: '1.6', marginBottom: '20px', opacity: 0.72 }}>
                Trusted by hundreds of homeowners across the city
              </p>
              <LearnMoreRow light href="/articles/how-it-works" />
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Top right: image + text card */}
            <div
              data-animate
              data-delay="3"
              onClick={() => router.push('/articles/trusted-local-providers')}
              style={{
                background: '#F7F7F7',
                borderRadius: '20px',
                border: '1.5px solid #EAECF0',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'box-shadow 0.25s ease, transform 0.25s ease',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 8px 32px rgba(165,74,255,0.14)'; el.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; el.style.transform = 'none'; }}
            >
              <div style={{ overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=200&fit=crop&auto=format&q=80"
                  alt="Trusted Local Providers"
                  style={{ width: '100%', height: '130px', objectFit: 'cover', objectPosition: 'center center', display: 'block', transition: 'transform 0.4s ease' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                />
              </div>
              <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#101828', marginBottom: '8px', lineHeight: '1.3' }}>
                  Trusted Local Providers
                </h3>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#475467', lineHeight: '1.65', flex: 1, marginBottom: '16px' }}>
                  All handymen are background-checked, reviewed, and rated by
                  real customers in your area.
                </p>
                <LearnMoreRow href="/articles/trusted-local-providers" />
              </div>
            </div>

            {/* Bottom right: icon + double arrow */}
            <div
              data-animate
              data-delay="4"
              style={{
                background: '#F7F7F7',
                borderRadius: '20px',
                border: '1.5px solid #EAECF0',
                padding: '24px',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: AMBER,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheckIcon size={22} color="#1D2939" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ArrowRightIcon size={24} color="#A54AFF" />
                  <ArrowRightIcon size={24} color="#A54AFF" style={{ marginLeft: '-10px' }} />
                </div>
              </div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#475467', lineHeight: '1.6' }}>
                Secure payments, released only when your job is done.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
