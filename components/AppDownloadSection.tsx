'use client';

import { SearchIcon, ShieldCheckIcon, SmartphoneIcon, CheckIcon, SparklesIcon } from './Icons';

const PHONE_IMAGE =
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=340&h=560&fit=crop&auto=format&q=75';

const FEATURES = [
  {
    icon: SearchIcon,
    iconColor: '#1570EF',
    iconBg: '#EFF6FF',
    title: 'Find Trusted Services Locally, Instantly',
    desc: 'Search from hundreds of verified service providers in your neighbourhood.',
  },
  {
    icon: ShieldCheckIcon,
    iconColor: '#079455',
    iconBg: '#ECFDF5',
    title: 'Secure, Fast, & Hassle-Free Transactions',
    desc: 'Pay with confidence using our escrow-protected payment system.',
  },
  {
    icon: SmartphoneIcon,
    iconColor: '#A54AFF',
    iconBg: '#F8F0FF',
    title: 'User-Friendly App for Quick Bookings',
    desc: 'Book a service in under 60 seconds with our streamlined mobile app.',
  },
];

function CheckBadge() {
  return (
    <div
      style={{
        width: '24px',
        height: '24px',
        borderRadius: '9999px',
        background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <CheckIcon size={12} color="#ffffff" />
    </div>
  );
}

export default function AppDownloadSection() {
  return (
    <section
      id="app"
      style={{
        padding: '96px 0',
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background:
            'radial-gradient(circle, rgba(165, 74, 255, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div
            data-animate="scale"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#F8F0FF',
              border: '1px solid #DFBAFF',
              borderRadius: '9999px',
              padding: '4px 12px',
              marginBottom: '16px',
            }}
          >
            <SparklesIcon size={14} color="#A54AFF" />
            <span
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                color: '#A54AFF',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Featured
            </span>
          </div>

          <h2
            data-animate
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              fontSize: '40px',
              lineHeight: '1.2',
              color: '#101828',
              letterSpacing: '-0.02em',
              maxWidth: '560px',
              margin: '0 auto 16px',
            }}
          >
            Download the Mobile App for{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Best Experience
            </span>
          </h2>
          <p
            data-animate
            data-delay="1"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#475467',
              maxWidth: '500px',
              margin: '0 auto',
            }}
          >
            Join a growing community of neighbors willing to help each other —
            hire instantly or earn on your schedule.
          </p>
        </div>

        {/* Main content: left features + center phone + right empty or reversed */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '48px',
            alignItems: 'center',
          }}
        >
          {/* Left: Features */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {FEATURES.map((feature, i) => (
                <div
                  key={feature.title}
                  data-animate="slide-left"
                  data-delay={String(i + 1)}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start',
                    padding: '20px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1.5px solid #EAECF0',
                    boxShadow: '0 2px 8px rgba(16, 24, 40, 0.04)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(165, 74, 255, 0.3)';
                    el.style.boxShadow =
                      '0 4px 16px rgba(165, 74, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = '#EAECF0';
                    el.style.boxShadow = '0 2px 8px rgba(16, 24, 40, 0.04)';
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: feature.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <feature.icon size={22} color={feature.iconColor} />
                  </div>
                  <div>
                    <h4
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                        fontSize: '15px',
                        color: '#101828',
                        marginBottom: '4px',
                      }}
                    >
                      {feature.title}
                    </h4>
                    <p
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '13px',
                        color: '#667085',
                        lineHeight: '1.6',
                      }}
                    >
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Phone mockup */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '32px',
            }}
          >
            <div
              data-animate="scale"
              style={{ position: 'relative' }}
            >
              {/* Glow behind phone */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-20px',
                  background:
                    'radial-gradient(circle, rgba(165, 74, 255, 0.15) 0%, transparent 70%)',
                  borderRadius: '50%',
                  filter: 'blur(20px)',
                }}
              />
              <img
                src={PHONE_IMAGE}
                alt="WhoCan mobile app"
                className="animate-float"
                style={{
                  width: '240px',
                  height: 'auto',
                  objectFit: 'contain',
                  position: 'relative',
                  filter: 'drop-shadow(0 24px 40px rgba(165, 74, 255, 0.2))',
                }}
              />
            </div>

            {/* CTA text */}
            <div
              data-animate="fade"
              data-delay="2"
              style={{ textAlign: 'center' }}
            >
              <p
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#101828',
                  marginBottom: '16px',
                }}
              >
                Get WhoCan on your phone now!
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                {/* App Store badge */}
                <a href="#" style={{ textDecoration: 'none', transition: 'transform 0.2s ease', display: 'inline-flex' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#000', borderRadius: '10px', padding: '9px 16px', height: '44px', boxSizing: 'border-box' }}>
                    <svg width="18" height="22" viewBox="0 0 814 1000" fill="#fff"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.4 8 719.2 8 653.2c0-114.1 75.8-174.4 151.4-174.4 79.4 0 129.2 52.7 173.4 52.7 42.8 0 98.7-54.9 182.1-54.9 26.4 0 108.7 2.3 166.6 90.8zm-89.2-305.3c34.8-41.3 60.1-98.8 60.1-155.5 0-8.7-.6-17.4-1.9-25.4C693.4 3.3 631.3 38 591 80.5c-36.1 39.6-71.3 99.8-71.3 159.3 0 9.6 1.3 19.2 2.6 22.2 3.9.6 10.3 1.3 16.6 1.3 52.3 0 109.7-33.8 149.9-67.2z"/></svg>
                    <div>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '9px', color: 'rgba(255,255,255,0.8)', lineHeight: 1, marginBottom: '2px' }}>Download on the</div>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>App Store</div>
                    </div>
                  </div>
                </a>
                {/* Google Play badge */}
                <a href="#" style={{ textDecoration: 'none', transition: 'transform 0.2s ease', display: 'inline-flex' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#000', borderRadius: '10px', padding: '9px 16px', height: '44px', boxSizing: 'border-box' }}>
                    <svg width="18" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 1.5L14.25 12 3 22.5" stroke="#34A853" strokeWidth="1.5" strokeLinecap="round" /><path d="M3 1.5l18 10.5L14.25 12" stroke="#FBBC04" strokeWidth="1.5" strokeLinecap="round" /><path d="M3 22.5l18-10.5L14.25 12" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" /><path d="M3 1.5L14.25 12 3 22.5" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    <div>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '9px', color: 'rgba(255,255,255,0.8)', lineHeight: 1, marginBottom: '2px' }}>Get it on</div>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>Google Play</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Right: benefits list */}
          <div data-animate="slide-right" data-delay="1">
            <h3
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: '22px',
                color: '#101828',
                marginBottom: '24px',
                lineHeight: '1.3',
              }}
            >
              Everything you need, in one app
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'Browse 500+ verified service providers',
                'Real-time booking confirmation',
                'In-app messaging with your provider',
                'Secure escrow payments',
                'Ratings and reviews system',
                'Track your booking live',
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <CheckBadge />
                  <span
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      color: '#344054',
                      fontWeight: 500,
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
