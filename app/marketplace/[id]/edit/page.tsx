'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import MarketplaceListingForm from '@/components/marketplace/MarketplaceListingForm';
import { MarketplaceCardSkeleton } from '@/components/marketplace/MarketplaceListingCard';
import { useGetMarketplaceListingQuery } from '@/app/buyer/store/marketplaceListingsAPI';
import { useAppSelector } from '@/store/hooks';

const FONT = 'Poppins, sans-serif';

export default function MarketplaceEditListingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!token) setAuthOpen(true);
  }, [token]);

  const { data, isLoading, isError, refetch } = useGetMarketplaceListingQuery(listingId ?? '', {
    skip: !token || !listingId,
  });
  const listing = data?.data ?? null;

  return (
    <>
      <Navbar solid />
      {authOpen && (
        <AuthGateModal
          onClose={() => {
            setAuthOpen(false);
            if (!token) router.push('/marketplace/mine');
          }}
          message="Log in to edit this listing."
        />
      )}
      <main className="marketplace-page">
        {!token ? null : isLoading ? (
          <div className="marketplace-post">
            <MarketplaceCardSkeleton />
          </div>
        ) : isError || !listing ? (
          <div className="marketplace-post" style={{ textAlign: 'center', paddingTop: 48 }}>
            <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 28, color: '#101828', marginBottom: 8 }}>
              Listing not found
            </h1>
            <p style={{ fontFamily: FONT, fontSize: 15, color: '#667085', marginBottom: 20 }}>
              This ad may have been removed, or you may not have access to edit it.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/marketplace/mine" className="marketplace-post-btn" style={{ display: 'inline-flex' }}>
                Back to my listings
              </Link>
              {isError ? (
                <button type="button" className="marketplace-outline-btn" onClick={() => void refetch()}>
                  Try again
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <MarketplaceListingForm mode="edit" listing={listing} />
        )}
      </main>
      <Footer />
    </>
  );
}
