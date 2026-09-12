'use client';

import { useRouter } from 'next/navigation';
import FavorImage from '@/components/FavorImage';
import {
  useDeleteMarketplaceListingMutation,
  useUpdateMarketplaceListingStatusMutation,
} from '@/app/buyer/store/marketplaceListingsAPI';
import {
  formatMarketplaceCondition,
  formatMarketplaceListingStatus,
  formatMarketplaceViewCount,
} from '@/lib/marketplace/listings';
import { formatMarketplacePrice } from '@/lib/marketplace/data';
import type { MarketplaceListing } from '@/lib/marketplace/types';
import { confirmAction, confirmDelete } from '@/lib/swal';
import { showToast } from '@/lib/toast';
import {
  CameraIcon,
  EyeIcon,
  HeartFilledIcon,
  HeartOutlineIcon,
  PinIcon,
} from './MarketplaceIcons';
import {
  cx,
  mpCard,
  mpCardActions,
  mpCardBody,
  mpCardCategory,
  mpCardEdit,
  mpCardEditDanger,
  mpCardLoc,
  mpCardMedia,
  mpCardMeta,
  mpCardTitle,
  mpCardViews,
  mpCondition,
  mpFeatured,
  mpHeartOnMedia,
  mpNeg,
  mpPhotoCount,
  mpPrice,
  mpPriceRow,
  mpSkelBar,
  mpStatus,
  mpStatusTone,
} from './ui';

function listingStatusKey(status: string): string {
  return status.trim().toLowerCase() || 'active';
}

function MineListingActions({ listing }: { listing: MarketplaceListing }) {
  const router = useRouter();
  const statusKey = listingStatusKey(listing.status);
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateMarketplaceListingStatusMutation();
  const [deleteListing, { isLoading: isDeleting }] = useDeleteMarketplaceListingMutation();
  const actionsBusy = isUpdatingStatus || isDeleting;

  const setStatus = async (status: 'active' | 'sold') => {
    const confirmed = await confirmAction({
      title: status === 'sold' ? 'Mark as sold?' : 'Make this ad active?',
      text:
        status === 'sold'
          ? 'Buyers will see this listing as sold.'
          : 'This listing will show again in the marketplace.',
      variant: status === 'sold' ? 'warning' : 'info',
      confirmText: status === 'sold' ? 'Mark sold' : 'Mark active',
    });
    if (!confirmed) return;

    try {
      const result = await updateStatus({ id: listing.id, status }).unwrap();
      showToast(
        result.message || (status === 'sold' ? 'Ad marked as sold.' : 'Ad is active again.'),
        'success',
      );
    } catch {
      // axios interceptor already toasts API errors
    }
  };

  const removeListing = async () => {
    const confirmed = await confirmDelete(listing.title, {
      title: 'Delete this ad?',
      entity: 'this ad',
    });
    if (!confirmed) return;

    try {
      const result = await deleteListing(listing.id).unwrap();
      showToast(result.message || 'Ad deleted.', 'success');
    } catch {
      // axios interceptor already toasts API errors
    }
  };

  return (
    <div
      className={mpCardActions}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className={mpCardEdit}
        disabled={actionsBusy}
        onClick={() => router.push(`/marketplace/${listing.id}/edit`)}
      >
        Edit
      </button>
      {statusKey !== 'active' ? (
        <button
          type="button"
          className={mpCardEdit}
          disabled={actionsBusy}
          onClick={() => {
            void setStatus('active');
          }}
        >
          Active
        </button>
      ) : null}
      {statusKey !== 'sold' ? (
        <button
          type="button"
          className={mpCardEdit}
          disabled={actionsBusy}
          onClick={() => {
            void setStatus('sold');
          }}
        >
          Mark as sold
        </button>
      ) : null}
      <button
        type="button"
        className={cx(mpCardEdit, mpCardEditDanger)}
        disabled={actionsBusy}
        onClick={() => {
          void removeListing();
        }}
      >
        {isDeleting ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  );
}

export default function MarketplaceListingCard({
  listing,
  liked = false,
  onToggleLike,
  savePending = false,
  variant = 'browse',
}: {
  listing: MarketplaceListing;
  liked?: boolean;
  onToggleLike?: (listing: MarketplaceListing) => void;
  savePending?: boolean;
  variant?: 'browse' | 'mine';
}) {
  const router = useRouter();
  const isMine = variant === 'mine';
  const statusKey = listingStatusKey(listing.status);
  const href = isMine ? `/marketplace/${listing.id}/edit` : `/marketplace/${listing.id}`;

  return (
    <article
      className={mpCard}
      onClick={() => router.push(href)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          router.push(href);
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={listing.title}
    >
      <div className={mpCardMedia}>
        <FavorImage
          src={listing.images[0]}
          alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        <span className={mpCondition}>{formatMarketplaceCondition(listing.condition)}</span>

        {isMine ? (
          <span className={cx(mpStatus, mpStatusTone(statusKey))}>
            {formatMarketplaceListingStatus(listing.status)}
          </span>
        ) : onToggleLike ? (
          <button
            type="button"
            className={mpHeartOnMedia}
            aria-label={liked ? 'Remove from saved ads' : 'Save this ad'}
            disabled={savePending}
            onClick={(event) => {
              event.stopPropagation();
              if (!savePending) onToggleLike(listing);
            }}
          >
            {liked ? <HeartFilledIcon size={15} /> : <HeartOutlineIcon size={15} />}
          </button>
        ) : null}

        {listing.featured ? <span className={mpFeatured}>FEATURED</span> : null}

        <span className={mpPhotoCount}>
          <CameraIcon size={11} />
          {listing.imageCount}
        </span>
      </div>

      <div className={mpCardBody}>
        <div className={mpPriceRow}>
          <p className={mpPrice}>{formatMarketplacePrice(listing.price, listing.currency)}</p>
          {listing.negotiable ? <span className={mpNeg}>Neg.</span> : null}
        </div>
        <h3 className={mpCardTitle}>{listing.title}</h3>
        {listing.categoryName ? (
          <p className={mpCardCategory}>{listing.categoryName}</p>
        ) : null}
        <p className={mpCardMeta}>
          <span className={mpCardLoc}>
            <PinIcon size={11} />
            {listing.location}
          </span>
          <span>{listing.postedLabel}</span>
        </p>
        {isMine ? (
          <p className={mpCardViews}>
            <EyeIcon size={12} />
            {formatMarketplaceViewCount(listing.viewCount)}
          </p>
        ) : null}
        {isMine ? <MineListingActions listing={listing} /> : null}
      </div>
    </article>
  );
}

export function MarketplaceCardSkeleton() {
  return (
    <div className={mpCard} aria-hidden="true">
      <div className={mpCardMedia} />
      <div className={mpCardBody}>
        <div className={cx(mpSkelBar, 'mb-2.5 h-4 w-[55%]')} />
        <div className={cx(mpSkelBar, 'mb-1.5 h-3 w-[90%]')} />
        <div className={cx(mpSkelBar, 'mb-3 h-3 w-[70%]')} />
        <div className={cx(mpSkelBar, 'h-2.5 w-4/5')} />
      </div>
    </div>
  );
}
