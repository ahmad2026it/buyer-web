'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import FavorImage from '@/components/FavorImage';
import PersonAvatar from '@/components/PersonAvatar';
import MarketplaceListingCard from '@/components/marketplace/MarketplaceListingCard';
import {
  HeartFilledIcon,
  HeartOutlineIcon,
  PinIcon,
} from '@/components/marketplace/MarketplaceIcons';
import {
  MARKETPLACE_CATEGORIES,
  MOCK_MARKETPLACE_LISTINGS,
  formatMarketplacePrice,
  getMarketplaceListing,
} from '@/lib/marketplace/data';
import type { MarketplaceListing } from '@/lib/marketplace/types';
import { useAppSelector } from '@/store/hooks';
import { showToast } from '@/lib/toast';

const FONT = 'Poppins, sans-serif';
const BRAND = '#A54AFF';
const GRAD = 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)';

export default function MarketplaceListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const listing = listingId ? getMarketplaceListing(listingId) : undefined;
  const [activeImage, setActiveImage] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    return new Set(MOCK_MARKETPLACE_LISTINGS.filter((item) => item.isFavorite).map((item) => item.id));
  });

  const related = useMemo(() => {
    if (!listing) return [];
    return MOCK_MARKETPLACE_LISTINGS.filter(
      (item) => item.id !== listing.id && item.categoryId === listing.categoryId,
    ).slice(0, 4);
  }, [listing]);

  const toggleLike = (item: MarketplaceListing) => {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  };

  const requireAuth = (message: string) => {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    showToast(message, 'info', 'Coming next');
  };

  if (!listing) {
    return (
      <>
        <Navbar solid />
        <main className="marketplace-page" style={{ padding: '140px 24px 80px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 28, color: '#101828', marginBottom: 8 }}>
            Listing not found
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 15, color: '#667085', marginBottom: 20 }}>
            This ad may have been removed or the link is incorrect.
          </p>
          <Link href="/marketplace" className="marketplace-post-btn" style={{ display: 'inline-flex' }}>
            Back to Marketplace
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const liked = savedIds.has(listing.id);
  const image = listing.images[activeImage] ?? listing.images[0];
  const categoryLabel = MARKETPLACE_CATEGORIES.find((category) => category.id === listing.categoryId)?.label ?? listing.categoryId;

  return (
    <>
      <Navbar solid />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Log in to save ads or contact the seller."
        />
      )}
      <main className="marketplace-page">
        <div className="marketplace-detail">
          <button type="button" className="marketplace-detail-back" onClick={() => router.push('/marketplace')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to listings
          </button>

          <div className="marketplace-detail-grid">
            <div>
              <div className="marketplace-gallery">
                <div className="marketplace-gallery-main">
                  <FavorImage
                    src={image}
                    alt={listing.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span className="marketplace-condition">{listing.condition}</span>
                  {listing.featured ? <span className="marketplace-featured">FEATURED</span> : null}
                </div>
                {listing.images.length > 1 ? (
                  <div className="marketplace-thumbs">
                    {listing.images.map((src, index) => (
                      <button
                        key={src}
                        type="button"
                        className={`marketplace-thumb${index === activeImage ? ' is-active' : ''}`}
                        onClick={() => setActiveImage(index)}
                        aria-label={`Photo ${index + 1}`}
                      >
                        <FavorImage src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="marketplace-detail-panel">
              <div className="marketplace-price-row" style={{ marginBottom: 8 }}>
                <p className="marketplace-price" style={{ fontSize: 28 }}>
                  {formatMarketplacePrice(listing.price, listing.currency)}
                </p>
                {listing.negotiable ? <span className="marketplace-neg">Negotiable</span> : null}
                <button
                  type="button"
                  className="marketplace-heart"
                  style={{ position: 'relative', top: 'auto', right: 'auto', marginLeft: 'auto' }}
                  aria-label={liked ? 'Remove from saved ads' : 'Save this ad'}
                  onClick={() => toggleLike(listing)}
                >
                  {liked ? <HeartFilledIcon size={16} /> : <HeartOutlineIcon size={16} />}
                </button>
              </div>

              <h1 className="marketplace-detail-title">{listing.title}</h1>
              <p className="marketplace-card-meta" style={{ marginBottom: 20 }}>
                <span className="marketplace-card-loc">
                  <PinIcon size={13} />
                  {listing.location}
                </span>
                <span>{listing.postedLabel}</span>
              </p>

              <div className="marketplace-detail-facts">
                <div>
                  <span>Category</span>
                  <strong>{categoryLabel}</strong>
                </div>
                <div>
                  <span>Condition</span>
                  <strong>{listing.condition}</strong>
                </div>
                <div>
                  <span>Photos</span>
                  <strong>{listing.imageCount}</strong>
                </div>
              </div>

              <h2 className="marketplace-detail-h">Description</h2>
              <p className="marketplace-detail-desc">{listing.description}</p>

              <div className="marketplace-seller-card">
                <PersonAvatar src={listing.seller.avatar} name={listing.seller.name} size={48} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="marketplace-seller-name">{listing.seller.name}</p>
                  <p className="marketplace-seller-meta">Member since {listing.seller.memberSince}</p>
                </div>
              </div>

              <div className="marketplace-detail-actions">
                <button type="button" className="marketplace-post-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => requireAuth('Chat will connect when listing APIs are live.')}>
                  Chat with seller
                </button>
                <button type="button" className="marketplace-outline-btn" onClick={() => requireAuth('Calling the seller will connect with the listing API.')}>
                  Call
                </button>
              </div>
            </div>
          </div>

          {related.length > 0 ? (
            <section style={{ marginTop: 40 }}>
              <h2 className="marketplace-detail-h" style={{ marginBottom: 16 }}>Similar listings</h2>
              <div className="marketplace-grid">
                {related.map((item) => (
                  <MarketplaceListingCard
                    key={item.id}
                    listing={item}
                    liked={savedIds.has(item.id)}
                    onToggleLike={toggleLike}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
