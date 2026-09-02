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
          gap: '10px',
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
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="#fff"
            aria-hidden="true"
            style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}
          >
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zm3.378-3.066c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" />
          </svg>
        ) : (
          <svg
            width="20"
            height="22"
            viewBox="0 0 256 283"
            aria-hidden="true"
            style={{ display: 'block', flexShrink: 0 }}
          >
            <path
              fill="#EA4335"
              d="M119.55 134.92 1.06 259.06c2.7 9.56 9.66 17.33 18.86 21.06 9.2 3.73 19.61 3 28.2-1.99l133.33-75.93-62.9-67.28z"
            />
            <path
              fill="#FBBC04"
              d="M239.37 113.81 181.71 80.79l-64.9 56.95 65.16 64.28 57.22-32.67c10.33-5.41 16.81-16.11 16.81-27.77s-6.48-22.36-16.81-27.77z"
            />
            <path
              fill="#4285F4"
              d="M1.06 23.49C.34 26.13 0 28.87 0 31.61v219.33c.01 2.74.36 5.47 1.06 8.12L123.61 138.1 1.06 23.49z"
            />
            <path
              fill="#34A853"
              d="m120.44 141.27 61.27-60.48L48.56 4.5C43.55 1.57 37.86.02 32.05 0 17.64-.03 4.98 9.53 1.06 23.4l119.38 117.87z"
            />
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
