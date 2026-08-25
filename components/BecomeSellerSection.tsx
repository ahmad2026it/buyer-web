'use client';

import { DollarSignIcon, CalendarIcon, ZapIcon, GlobeIcon } from './Icons';
import { SellerStoreLinks } from './StoreBadge';

const BENEFITS = [
  { icon: DollarSignIcon, label: 'Minimal commission fees' },
  { icon: CalendarIcon,   label: 'Flexible schedule' },
  { icon: ZapIcon,        label: 'Instant payouts' },
  { icon: GlobeIcon,      label: '750+ active buyers' },
];

export default function BecomeSellerSection() {
  return (
    <section
      style={{
        padding: '96px 0',
        background: '#0D0120',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '50px 50px 0 0',
      }}
    >
      {/* Background gradient blobs */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '500px',
          height: '500px',
          background:
            'radial-gradient(circle, rgba(165, 74, 255, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-120px',
          left: '-80px',
          width: '400px',
          height: '400px',
          background:
            'radial-gradient(circle, rgba(132, 48, 224, 0.25) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative top border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background:
            'linear-gradient(90deg, transparent, #A54AFF 30%, #BF75FF 50%, #A54AFF 70%, transparent)',
          opacity: 0.8,
        }}
      />

      <div className="container" style={{ position: 'relative' }}>
        <div
          className="rs-split"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}
        >
          {/* Left: Copy */}
          <div>
            {/* Badge */}
            <div
              data-animate="fade"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(165, 74, 255, 0.15)',
                border: '1px solid rgba(165, 74, 255, 0.3)',
                borderRadius: '9999px',
                padding: '5px 14px',
                marginBottom: '24px',
              }}
            >
              <DollarSignIcon size={14} color="#CA90FF" />
              <span
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#CA90FF',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Join as Seller
              </span>
            </div>

            <h2
              data-animate
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 800,
                fontSize: '44px',
                lineHeight: '1.15',
                color: '#ffffff',
                letterSpacing: '-0.02em',
                marginBottom: '20px',
              }}
            >
              Turn your skills{' '}
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                into earnings
              </span>
            </h2>

            <p
              data-animate
              data-delay="1"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px',
                lineHeight: '1.7',
                color: 'rgba(255,255,255,0.65)',
                marginBottom: '36px',
                maxWidth: '440px',
              }}
            >
              Join thousands of skilled service providers on WhoCan. Set your
              own rates, manage your schedule, and grow your business — on your
              own terms.
            </p>

            {/* CTAs */}
            <div
              data-animate
              data-delay="2"
              className="rs-cta-row"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px', marginBottom: '40px' }}
            >
              <SellerStoreLinks onDark />
              <a
                href="/sellers"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  fontSize: '15px',
                  color: 'rgba(255,255,255,0.8)',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  padding: '14px 28px',
                  borderRadius: '9999px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.12)';
                  el.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.07)';
                  el.style.color = 'rgba(255,255,255,0.8)';
                }}
              >
                Learn More
              </a>
            </div>

            {/* Benefits pills */}
            <div
              data-animate
              data-delay="3"
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              {BENEFITS.map((b) => (
                <div
                  key={b.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(165, 74, 255, 0.12)',
                    border: '1px solid rgba(165, 74, 255, 0.25)',
                    borderRadius: '9999px',
                    padding: '7px 14px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.8)',
                  }}
                >
                  <b.icon size={15} color="rgba(255,255,255,0.7)" />
                  {b.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual cards */}
          <div
            data-animate="slide-right"
            style={{ position: 'relative' }}
          >
            {/* Stacked cards layout */}
            <div style={{ position: 'relative', height: '380px' }}>
              {/* Back card */}
              <div
                style={{
                  position: 'absolute',
                  top: '30px',
                  left: '30px',
                  right: '-10px',
                  bottom: '-10px',
                  background:
                    'linear-gradient(135deg, rgba(165, 74, 255, 0.2) 0%, rgba(132, 48, 224, 0.1) 100%)',
                  borderRadius: '24px',
                  border: '1px solid rgba(165, 74, 255, 0.2)',
                }}
              />
              {/* Main card */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: '20px',
                  bottom: '20px',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  border: '1.5px solid rgba(165, 74, 255, 0.3)',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '6px',
                    }}
                  >
                    This month
                  </p>
                  <p
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 800,
                      fontSize: '42px',
                      lineHeight: '1',
                      background:
                        'linear-gradient(135deg, #BF75FF 0%, #A54AFF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    $2,840
                  </p>
                  <p
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.5)',
                      marginTop: '4px',
                    }}
                  >
                    Earned by top sellers last month
                  </p>
                </div>

                {/* Mini bar chart */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '80px' }}>
                  {[40, 60, 35, 75, 90, 55, 100].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${h}%`,
                        background:
                          i === 6
                            ? 'linear-gradient(180deg, #BF75FF 0%, #8430E0 100%)'
                            : 'rgba(165, 74, 255, 0.25)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                <p
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.35)',
                    textAlign: 'center',
                    marginTop: '-12px',
                  }}
                >
                  Weekly earnings trend
                </p>

                {/* Stats row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    paddingTop: '4px',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {[
                    { label: 'Jobs completed', value: '24' },
                    { label: 'Avg. rating', value: '4.9 ★' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 700,
                          fontSize: '20px',
                          color: '#ffffff',
                        }}
                      >
                        {stat.value}
                      </p>
                      <p
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '11px',
                          color: 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
