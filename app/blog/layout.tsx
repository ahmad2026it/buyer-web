import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — WhoCan',
  description:
    'Guides, how-tos, and stories from WhoCan to help you find trusted local handymen and book with confidence.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
