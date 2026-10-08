import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TopSellersSection from '@/components/TopSellersSection';
import TopFavorsSection from '@/components/TopFavorsSection';
import ExploreHero from '@/components/ExploreHero';
import ExploreCategoriesSection from '@/components/ExploreCategoriesSection';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Explore Local Services and Providers',
  description:
    'Browse local service providers and favors on WhoCan: cleaning, beauty, landscaping, repairs and more in Maryland.',
  path: '/explore',
});

export default function ExplorePage() {
  return (
    <>
      <Navbar />
      <main>
        <ExploreHero />
        <ExploreCategoriesSection />
        <TopSellersSection />
        <TopFavorsSection />
      </main>
      <Footer />
    </>
  );
}
