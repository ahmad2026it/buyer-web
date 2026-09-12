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
import {
  cx,
  mpCardLoc,
  mpCardMeta,
  mpCondition,
  mpDetail,
  mpDetailActions,
  mpDetailBack,
  mpDetailDesc,
  mpDetailFact,
  mpDetailFactLabel,
  mpDetailFacts,
  mpDetailFactValue,
  mpDetailGrid,
  mpDetailH,
  mpDetailPanel,
  mpDetailTitle,
  mpFeatured,
  mpGalleryMain,
  mpGrid,
  mpHeartInline,
  mpNeg,
  mpOutlineBtn,
  mpPage,
  mpPostBtn,
  mpPriceLg,
  mpPriceRow,
  mpSellerCard,
  mpSellerMeta,
  mpSellerName,
  mpThumb,
  mpThumbActive,
  mpThumbs,
} from '@/components/marketplace/ui';

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
        <main className={mpPage}>
          <div className={mpDetail}>
            <div className={mpDetailGrid}>
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
        <main className={cx(mpPage, 'px-6 pt-[140px] pb-20 text-center')}>
          <h1 className="mb-2 text-[28px] font-extrabold text-ink">Listing not found</h1>
          <p className="mb-5 text-[15px] text-ink-muted">
            This ad may have been removed or the link is incorrect.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link href="/marketplace" className={mpPostBtn}>
              Back to Marketplace
            </Link>
            {isError ? (
              <button
                type="button"
                className={mpOutlineBtn}
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
      <main className={mpPage}>
        <div className={mpDetail}>
          <button
            type="button"
            className={mpDetailBack}
            onClick={() => router.push(isOwner ? '/marketplace/mine' : '/marketplace')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to listings
          </button>

          <div className={mpDetailGrid}>
            <div>
              <div>
                <div className={mpGalleryMain}>
                  <FavorImage
                    src={image}
                    alt={listing.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span className={mpCondition}>{conditionLabel}</span>
                  {listing.featured ? <span className={mpFeatured}>FEATURED</span> : null}
                </div>
                {listing.images.length > 1 ? (
                  <div className={mpThumbs}>
                    {listing.images.map((src, index) => (
                      <button
                        key={`${src}-${index}`}
                        type="button"
                        className={cx(mpThumb, index === activeImage && mpThumbActive)}
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

            <div className={mpDetailPanel}>
              <div className={cx(mpPriceRow, 'mb-2')}>
                <p className={mpPriceLg}>
                  {formatMarketplacePrice(listing.price, listing.currency)}
                </p>
                {listing.negotiable ? <span className={mpNeg}>Negotiable</span> : null}
                {isOwner ? null : (
                  <button
                    type="button"
                    className={mpHeartInline}
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

              <h1 className={mpDetailTitle}>{listing.title}</h1>
              <p className={cx(mpCardMeta, 'mb-5')}>
                <span className={mpCardLoc}>
                  <PinIcon size={13} />
                  {listing.location}
                </span>
                <span>{listing.postedLabel}</span>
              </p>

              <div className={mpDetailFacts}>
                <div className={mpDetailFact}>
                  <span className={mpDetailFactLabel}>Category</span>
                  <strong className={mpDetailFactValue}>{categoryLabel}</strong>
                </div>
                <div className={mpDetailFact}>
                  <span className={mpDetailFactLabel}>Condition</span>
                  <strong className={mpDetailFactValue}>{conditionLabel}</strong>
                </div>
                <div className={mpDetailFact}>
                  <span className={mpDetailFactLabel}>Photos</span>
                  <strong className={mpDetailFactValue}>{listing.imageCount}</strong>
                </div>
              </div>

              <h2 className={mpDetailH}>Description</h2>
              <p className={mpDetailDesc}>{listing.description}</p>

              <div className={mpSellerCard}>
                <PersonAvatar src={listing.seller.avatar} name={listing.seller.name} size={48} />
                <div className="min-w-0 flex-1">
                  <p className={mpSellerName}>{listing.seller.name}</p>
                  {listing.seller.memberSince ? (
                    <p className={mpSellerMeta}>Member since {listing.seller.memberSince}</p>
                  ) : null}
                </div>
              </div>

              <div className={mpDetailActions}>
                {isOwner ? (
                  <Link
                    href={`/marketplace/${listing.id}/edit`}
                    className={cx(mpPostBtn, 'flex-1')}
                  >
                    Edit listing
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      className={cx(mpPostBtn, 'flex-1')}
                      disabled={isStartingChat}
                      onClick={() => {
                        void startChat();
                      }}
                    >
                      {isStartingChat ? 'Starting chat…' : 'Chat with seller'}
                    </button>
                    <button type="button" className={mpOutlineBtn} onClick={() => requireAuth('Calling the seller will connect with the listing API.')}>
                      Call
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {related.length > 0 ? (
            <section className="mt-10">
              <h2 className={cx(mpDetailH, 'mb-4')}>Similar listings</h2>
              <div className={mpGrid}>
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
