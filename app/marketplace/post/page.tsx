'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import MarketplaceListingForm from '@/components/marketplace/MarketplaceListingForm';
import { mpPage } from '@/components/marketplace/ui';
import { useAppSelector } from '@/store/hooks';

export default function MarketplacePostPage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!token) setAuthOpen(true);
  }, [token]);

  return (
    <>
      <Navbar solid />
      {authOpen && (
        <AuthGateModal
          onClose={() => {
            setAuthOpen(false);
            if (!token) router.push('/marketplace');
          }}
          message="Log in to post an ad on Marketplace."
        />
      )}
      <main className={mpPage}>
        {token ? <MarketplaceListingForm mode="create" /> : null}
      </main>
      <Footer />
    </>
  );
}
