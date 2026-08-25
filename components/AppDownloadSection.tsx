'use client';

import { APP_STORE_LINKS } from '@/lib/appStores';
import StoreBadge from './StoreBadge';
import {
  SearchIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  CheckIcon,
  SparklesIcon,
  WrenchIcon,
} from './Icons';

const PHONE_IMAGE = '/image.png';

const APP_PITCH =
  'Struggling to find reliable professionals for your everyday tasks, or looking to grow your service business? WhoCan connects you with trusted local experts for everything from home cleaning and moving to repairs and tutoring. Whether you need a job done quickly or want to reach more customers in your area, our platform makes it fast, safe, and hassle-free. Download WhoCan today and get things done wherever you are!';

interface AppDownload {
  audience: string;
  description: string;
  icon: typeof SearchIcon;
  iconColor: string;
  iconBg: string;
  appleHref: string;
  playHref: string;
}

const APP_DOWNLOADS: AppDownload[] = [
  {
    audience: 'Buyers',
    description: 'Hire trusted local experts for everyday tasks.',
    icon: SearchIcon,
    iconColor: '#1570EF',
    iconBg: '#EFF6FF',
    appleHref: APP_STORE_LINKS.buyer.apple,
    playHref: APP_STORE_LINKS.buyer.play,
  },
  {
    audience: 'Sellers',
    description: 'Grow your service business and reach more customers.',
    icon: WrenchIcon,
    iconColor: '#A54AFF',
    iconBg: '#F8F0FF',
    appleHref: APP_STORE_LINKS.seller.apple,
    playHref: APP_STORE_LINKS.seller.play,
  },
];

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
              maxWidth: '720px',
              margin: '0 auto',
            }}
          >
            {APP_PITCH}
          </p>
        </div>

        {/* Main content: left features + center phone + right empty or reversed */}
        <div
          className="rs-app-grid"
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
                alt="WhoCan mobile app dashboard"
                className="animate-float"
                style={{
                  width: '260px',
                  height: 'auto',
                  objectFit: 'contain',
                  position: 'relative',
                  borderRadius: '28px',
                  filter: 'drop-shadow(0 24px 40px rgba(165, 74, 255, 0.2))',
                }}
              />
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

        <div
          data-animate="fade"
          data-delay="2"
          style={{ marginTop: '56px', textAlign: 'center' }}
        >
          <p
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: '18px',
              color: '#101828',
              marginBottom: '24px',
            }}
          >
            Get WhoCan on your phone now!
          </p>
          <div className="rs-app-downloads">
            {APP_DOWNLOADS.map((app) => (
              <div
                key={app.audience}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '24px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #EAECF0',
                  boxShadow: '0 2px 8px rgba(16, 24, 40, 0.04)',
                  textAlign: 'left',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'rgba(165, 74, 255, 0.3)';
                  el.style.boxShadow = '0 4px 16px rgba(165, 74, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = '#EAECF0';
                  el.style.boxShadow = '0 2px 8px rgba(16, 24, 40, 0.04)';
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: app.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <app.icon size={22} color={app.iconColor} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 700,
                        fontSize: '18px',
                        color: '#101828',
                        marginBottom: '4px',
                        lineHeight: 1.3,
                      }}
                    >
                      For {app.audience}
                    </h3>
                    <p
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        color: '#667085',
                        lineHeight: 1.6,
                      }}
                    >
                      {app.description}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <StoreBadge
                    store="apple"
                    href={app.appleHref}
                    label={`Download WhoCan for ${app.audience} on the App Store`}
                  />
                  <StoreBadge
                    store="google"
                    href={app.playHref}
                    label={`Get WhoCan for ${app.audience} on Google Play`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
