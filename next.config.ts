import type { NextConfig } from 'next';

const apiOrigin =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_ORIGIN ||
  'https://stage.whocan-app.com';

const nextConfig: NextConfig = {
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
