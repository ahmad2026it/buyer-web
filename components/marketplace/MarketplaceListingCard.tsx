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
      className="marketplace-card-actions"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="marketplace-card-edit"
        disabled={actionsBusy}
        onClick={() => router.push(`/marketplace/${listing.id}/edit`)}
      >
        Edit
      </button>
      {statusKey !== 'active' ? (
        <button
          type="button"
          className="marketplace-card-edit"
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
          className="marketplace-card-edit"
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
        className="marketplace-card-edit is-danger"
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
      className="marketplace-card"
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
      <div className="marketplace-card-media">
        <FavorImage
          src={listing.images[0]}
          alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        <span className="marketplace-condition">{formatMarketplaceCondition(listing.condition)}</span>

        {isMine ? (
          <span className={`marketplace-status is-${statusKey}`}>
            {formatMarketplaceListingStatus(listing.status)}
          </span>
        ) : onToggleLike ? (
          <button
            type="button"
            className="marketplace-heart"
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

        {listing.featured ? <span className="marketplace-featured">FEATURED</span> : null}

        <span className="marketplace-photo-count">
          <CameraIcon size={11} />
          {listing.imageCount}
        </span>
      </div>

      <div className="marketplace-card-body">
        <div className="marketplace-price-row">
          <p className="marketplace-price">{formatMarketplacePrice(listing.price, listing.currency)}</p>
          {listing.negotiable ? <span className="marketplace-neg">Neg.</span> : null}
        </div>
        <h3 className="marketplace-card-title">{listing.title}</h3>
        {listing.categoryName ? (
          <p className="marketplace-card-category">{listing.categoryName}</p>
        ) : null}
        <p className="marketplace-card-meta">
          <span className="marketplace-card-loc">
            <PinIcon size={11} />
            {listing.location}
          </span>
          <span>{listing.postedLabel}</span>
        </p>
        {isMine ? (
          <p className="marketplace-card-views">
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
    <div className="marketplace-card marketplace-card-skel" aria-hidden="true">
      <div className="marketplace-card-media" style={{ background: '#F2F4F7' }} />
      <div className="marketplace-card-body">
        <div style={{ width: '55%', height: 16, borderRadius: 4, background: '#F2F4F7', marginBottom: 10 }} />
        <div style={{ width: '90%', height: 12, borderRadius: 4, background: '#F2F4F7', marginBottom: 6 }} />
        <div style={{ width: '70%', height: 12, borderRadius: 4, background: '#F2F4F7', marginBottom: 12 }} />
        <div style={{ width: '80%', height: 10, borderRadius: 4, background: '#F2F4F7' }} />
      </div>
    </div>
  );
}
