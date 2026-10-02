import path from 'path';
import type { NextConfig } from 'next';

const apiOrigin =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_ORIGIN ||
  'https://stage.whocan-app.com';

const nextConfig: NextConfig = {
  // Trailing slashes are normalized in middleware so legacy URLs can 301
  // straight to their canonical path instead of a 308-then-301 chain.
  skipTrailingSlashRedirect: true,
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === 'edge') {
      config.resolve = config.resolve ?? {};
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        '@/lib/indexnowSync': path.resolve(process.cwd(), 'lib/indexnowSync.stub.ts'),
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.figma.com',
        pathname: '/api/mcp/asset/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      {
        source: '/hero-md.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/hero.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/phone.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/hero-icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/firebase-messaging-sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: `${apiOrigin.replace(/\/$/, '')}/:path*`,
      },
    ];
  },
};

export default nextConfig;
