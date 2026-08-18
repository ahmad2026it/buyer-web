import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TopSellersSection from '@/components/TopSellersSection';
import TopFavorsSection from '@/components/TopFavorsSection';
import ExploreHero from '@/components/ExploreHero';
import ExploreCategoriesSection from '@/components/ExploreCategoriesSection';

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
