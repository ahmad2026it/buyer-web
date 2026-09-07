import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Marketplace — WhoCan',
  description: 'Buy and sell items near you on the WhoCan marketplace.',
};

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return children;
}
