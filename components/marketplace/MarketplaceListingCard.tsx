'use client';

import { useRouter } from 'next/navigation';
import FavorImage from '@/components/FavorImage';
import { formatMarketplacePrice } from '@/lib/marketplace/data';
import type { MarketplaceListing } from '@/lib/marketplace/types';
import { CameraIcon, HeartFilledIcon, HeartOutlineIcon, PinIcon } from './MarketplaceIcons';

export default function MarketplaceListingCard({
  listing,
  liked,
  onToggleLike,
}: {
  listing: MarketplaceListing;
  liked: boolean;
  onToggleLike: (listing: MarketplaceListing) => void;
}) {
  const router = useRouter();

  return (
    <article
      className="marketplace-card"
      onClick={() => router.push(`/marketplace/${listing.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          router.push(`/marketplace/${listing.id}`);
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

        <span className="marketplace-condition">{listing.condition}</span>

        <button
          type="button"
          className="marketplace-heart"
          aria-label={liked ? 'Remove from saved ads' : 'Save this ad'}
          onClick={(event) => {
            event.stopPropagation();
            onToggleLike(listing);
          }}
        >
          {liked ? <HeartFilledIcon size={15} /> : <HeartOutlineIcon size={15} />}
        </button>

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
        <p className="marketplace-card-meta">
          <span className="marketplace-card-loc">
            <PinIcon size={11} />
            {listing.location}
          </span>
          <span>{listing.postedLabel}</span>
        </p>
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

