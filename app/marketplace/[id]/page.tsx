'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import FavorImage from '@/components/FavorImage';
import PersonAvatar from '@/components/PersonAvatar';
import MarketplaceListingCard, {
  MarketplaceCardSkeleton,
} from '@/components/marketplace/MarketplaceListingCard';
import {
  HeartFilledIcon,
  HeartOutlineIcon,
  PinIcon,
} from '@/components/marketplace/MarketplaceIcons';
import { useMarketplaceCategories } from '@/app/buyer/store/marketplaceCategoriesAPI';
import {
  useGetMarketplaceListingQuery,
  useGetMarketplaceListingsQuery,
} from '@/app/buyer/store/marketplaceListingsAPI';
import {
  BUYER_LISTING_CONVERSATIONS_LIST_PARAMS,
  conversationIdFromResponse,
  useGetBuyerConversationsQuery,
  useStartBuyerConversationMutation,
} from '@/app/buyer/store/buyerConversationsAPI';
import { marketplaceCategoryLabel } from '@/lib/marketplace/categories';
import { formatMarketplaceCondition, isOwnMarketplaceListing } from '@/lib/marketplace/listings';
import { formatMarketplacePrice } from '@/lib/marketplace/data';
import type { MarketplaceListing } from '@/lib/marketplace/types';
import { useSaveMarketplaceListing } from '@/lib/marketplace/useSaveMarketplaceListing';
import { useAppSelector } from '@/store/hooks';
import { showToast } from '@/lib/toast';

const FONT = 'Poppins, sans-serif';
const BRAND = '#A54AFF';
const DEFAULT_CHAT_MESSAGE = 'Is this still available?';

export default function MarketplaceListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const userId = useAppSelector((state) => state.auth.user?.id);
  const { categories } = useMarketplaceCategories();
  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [activeImage, setActiveImage] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const { toggleSave, pendingIds } = useSaveMarketplaceListing();
  const [startListingChat, { isLoading: isStartingChat }] =
    useStartBuyerConversationMutation();
  const { data: listingChats } = useGetBuyerConversationsQuery(
    BUYER_LISTING_CONVERSATIONS_LIST_PARAMS,
    { skip: !token },
  );

  useEffect(() => {
    setActiveImage(0);
  }, [listingId]);

  const { data, isLoading, isError, refetch } = useGetMarketplaceListingQuery(listingId ?? '', {
    skip: !token || !listingId,
  });
  const listing = data?.data ?? null;

  const relatedQuery = useGetMarketplaceListingsQuery(
    {
      page: 1,
      limit: 5,
      sort: 'newest',
      category_id: listing?.categoryId || undefined,
    },
    { skip: !token || !listing?.categoryId },
  );
  const related = useMemo(() => {
    if (!listing) return [];
    return (relatedQuery.data?.data.listings ?? [])
      .filter((item) => item.id !== listing.id)
      .slice(0, 4);
  }, [listing, relatedQuery.data]);

  const toggleLike = async (item: MarketplaceListing) => {
    const result = await toggleSave(item);
    if (result.needsAuth) setAuthOpen(true);
  };

  const requireAuth = (message: string) => {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    showToast(message, 'info', 'Coming next');
  };

  const existingConversationId = useMemo(() => {
    if (!listing) return null;
    const listingKey = String(listing.id);
    const match = (listingChats?.data.conversations ?? []).find((conv) => {
      const ids = [conv.listingId, conv.marketplaceListingId, conv.listing?.id, conv.marketplaceListing?.id];
      return ids.some((id) => id != null && String(id) === listingKey);
    });
    return match?.id ?? null;
  }, [listing, listingChats]);

  const openListingChat = (conversationId?: number | null) => {
    if (!listing) return;
    if (conversationId) {
      router.push(`/chat?tab=listing&id=${conversationId}&listingId=${listing.id}`);
      return;
    }
    router.push(`/chat?tab=listing&listingId=${listing.id}`);
  };

  const startChat = async () => {
    if (!listing || isStartingChat) return;
    if (!token) {
      setAuthOpen(true);
      return;
    }
    if (existingConversationId) {
      openListingChat(existingConversationId);
      return;
    }

    const listingNumericId = Number(listing.id);
    if (!Number.isFinite(listingNumericId) || listingNumericId <= 0) {
      showToast('Could not start this chat. Please try again.', 'error');
      return;
    }

    try {
      const result = await startListingChat({
        type: 'listing',
        id: listingNumericId,
        message: DEFAULT_CHAT_MESSAGE,
      }).unwrap();
      openListingChat(conversationIdFromResponse(result));
    } catch {
      // axios interceptor already toasts API errors
    }
  };

  if (!token) {
    return (
      <>
        <Navbar solid />
        <AuthGateModal
          onClose={() => router.push('/marketplace')}
          message="Log in to view this marketplace listing."
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navbar solid />
        <main className="marketplace-page">
          <div className="marketplace-detail">
            <div className="marketplace-detail-grid">
              <MarketplaceCardSkeleton />
              <MarketplaceCardSkeleton />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (isError || !listing) {
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
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/marketplace" className="marketplace-post-btn" style={{ display: 'inline-flex' }}>
              Back to Marketplace
            </Link>
            {isError ? (
              <button
                type="button"
                className="marketplace-outline-btn"
                onClick={() => {
                  void refetch();
                }}
              >
                Try again
              </button>
            ) : null}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const liked = listing.isFavorite;
  const image = listing.images[activeImage] ?? listing.images[0];
  const categoryLabel = marketplaceCategoryLabel(listing.categoryId, categories);
  const conditionLabel = formatMarketplaceCondition(listing.condition);
  const isOwner = isOwnMarketplaceListing(listing, userId);

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
          <button
            type="button"
            className="marketplace-detail-back"
            onClick={() => router.push(isOwner ? '/marketplace/mine' : '/marketplace')}
          >
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
                  <span className="marketplace-condition">{conditionLabel}</span>
                  {listing.featured ? <span className="marketplace-featured">FEATURED</span> : null}
                </div>
                {listing.images.length > 1 ? (
                  <div className="marketplace-thumbs">
                    {listing.images.map((src, index) => (
                      <button
                        key={`${src}-${index}`}
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
                {isOwner ? null : (
                  <button
                    type="button"
                    className="marketplace-heart"
                    style={{ position: 'relative', top: 'auto', right: 'auto', marginLeft: 'auto' }}
                    aria-label={liked ? 'Remove from saved ads' : 'Save this ad'}
                    disabled={pendingIds.has(listing.id)}
                    onClick={() => {
                      void toggleLike(listing);
                    }}
                  >
                    {liked ? <HeartFilledIcon size={16} /> : <HeartOutlineIcon size={16} />}
                  </button>
                )}
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
                  <strong>{conditionLabel}</strong>
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
                  {listing.seller.memberSince ? (
                    <p className="marketplace-seller-meta">Member since {listing.seller.memberSince}</p>
                  ) : null}
                </div>
              </div>

              <div className="marketplace-detail-actions">
                {isOwner ? (
                  <Link
                    href={`/marketplace/${listing.id}/edit`}
                    className="marketplace-post-btn"
                    style={{ flex: 1, justifyContent: 'center', display: 'inline-flex' }}
                  >
                    Edit listing
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      className="marketplace-post-btn"
                      style={{ flex: 1, justifyContent: 'center' }}
                      disabled={isStartingChat}
                      onClick={() => {
                        void startChat();
                      }}
                    >
                      {isStartingChat ? 'Starting chat…' : 'Chat with seller'}
                    </button>
                    <button type="button" className="marketplace-outline-btn" onClick={() => requireAuth('Calling the seller will connect with the listing API.')}>
                      Call
                    </button>
                  </>
                )}
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
                    liked={item.isFavorite}
                    savePending={pendingIds.has(item.id)}
                    onToggleLike={(relatedListing) => {
                      void toggleLike(relatedListing);
                    }}
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
