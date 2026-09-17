'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import MarketplaceListingForm from '@/components/marketplace/MarketplaceListingForm';
import { MarketplaceCardSkeleton } from '@/components/marketplace/MarketplaceListingCard';
import {
  mpOutlineBtn,
  mpPage,
  mpPost,
  mpPostBtn,
} from '@/components/marketplace/ui';
import { useGetMarketplaceListingQuery } from '@/app/buyer/store/marketplaceListingsAPI';
import { useAppSelector } from '@/store/hooks';

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
    refetchOnMountOrArgChange: true,
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
      <main className={mpPage}>
        {!token ? null : isLoading ? (
          <div className={mpPost}>
            <MarketplaceCardSkeleton />
          </div>
        ) : isError || !listing ? (
          <div className={`${mpPost} pt-12 text-center`}>
            <h1 className="mb-2 text-[28px] font-extrabold text-ink">
              Listing not found
            </h1>
            <p className="mb-5 text-[15px] text-ink-muted">
              This ad may have been removed, or you may not have access to edit it.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              <Link href="/marketplace/mine" className={mpPostBtn}>
                Back to my listings
              </Link>
              {isError ? (
                <button type="button" className={mpOutlineBtn} onClick={() => void refetch()}>
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
