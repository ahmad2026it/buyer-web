'use client';

import type { MouseEvent } from 'react';
import { APP_STORE_LINKS } from '@/lib/appStores';

export type StoreKind = 'apple' | 'google';

export interface StoreBadgeProps {
  store: StoreKind;
  href: string;
  label: string;
  onDark?: boolean;
  fullWidth?: boolean;
}

function liftBadge(e: MouseEvent<HTMLAnchorElement>) {
  e.currentTarget.style.transform = 'translateY(-2px)';
}

function resetBadge(e: MouseEvent<HTMLAnchorElement>) {
  e.currentTarget.style.transform = 'translateY(0)';
}

export default function StoreBadge({
  store,
  href,
  label,
  onDark = false,
  fullWidth = false,
}: StoreBadgeProps) {
  const isApple = store === 'apple';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        textDecoration: 'none',
        transition: 'transform 0.2s ease',
        display: fullWidth ? 'flex' : 'inline-flex',
        width: fullWidth ? '100%' : undefined,
      }}
      onMouseEnter={liftBadge}
      onMouseLeave={resetBadge}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#000',
          borderRadius: '10px',
          padding: '9px 16px',
          height: '44px',
          boxSizing: 'border-box',
          border: onDark ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
          width: fullWidth ? '100%' : undefined,
        }}
      >
        {isApple ? (
          <svg width="18" height="22" viewBox="0 0 814 1000" fill="#fff" aria-hidden="true">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.4 8 719.2 8 653.2c0-114.1 75.8-174.4 151.4-174.4 79.4 0 129.2 52.7 173.4 52.7 42.8 0 98.7-54.9 182.1-54.9 26.4 0 108.7 2.3 166.6 90.8zm-89.2-305.3c34.8-41.3 60.1-98.8 60.1-155.5 0-8.7-.6-17.4-1.9-25.4C693.4 3.3 631.3 38 591 80.5c-36.1 39.6-71.3 99.8-71.3 159.3 0 9.6 1.3 19.2 2.6 22.2 3.9.6 10.3 1.3 16.6 1.3 52.3 0 109.7-33.8 149.9-67.2z" />
          </svg>
        ) : (
          <svg width="18" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 1.5L14.25 12 3 22.5" stroke="#34A853" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 1.5l18 10.5L14.25 12" stroke="#FBBC04" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 22.5l18-10.5L14.25 12" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 1.5L14.25 12 3 22.5" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
        <div>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '9px',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1,
              marginBottom: '2px',
            }}
          >
            {isApple ? 'Download on the' : 'Get it on'}
          </div>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '15px',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.1,
            }}
          >
            {isApple ? 'App Store' : 'Google Play'}
          </div>
        </div>
      </div>
    </a>
  );
}

export function SellerStoreLinks({
  stacked = false,
  onDark = false,
  justify = 'flex-start',
  className,
}: {
  stacked?: boolean;
  onDark?: boolean;
  justify?: 'flex-start' | 'center';
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: stacked ? 'column' : 'row',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: justify,
        alignItems: stacked ? 'stretch' : 'center',
      }}
    >
      <StoreBadge
        store="apple"
        href={APP_STORE_LINKS.seller.apple}
        label="Download the WhoCan seller app on the App Store"
        onDark={onDark}
        fullWidth={stacked}
      />
      <StoreBadge
        store="google"
        href={APP_STORE_LINKS.seller.play}
        label="Get the WhoCan seller app on Google Play"
        onDark={onDark}
        fullWidth={stacked}
      />
    </div>
  );
}
