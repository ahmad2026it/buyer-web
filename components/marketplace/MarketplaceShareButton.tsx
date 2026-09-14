'use client';

import { useEffect, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { shareMarketplaceListing, type ShareableMarketplaceListing } from '@/lib/marketplace/share';
import { CheckIcon, ShareIcon } from './MarketplaceIcons';
import { cx, mpCardEdit, mpOutlineBtn, mpShareIconBtn } from './ui';

type ShareVariant = 'icon' | 'button' | 'chip';

export default function MarketplaceShareButton({
  listing,
  variant = 'button',
  className,
}: {
  listing: ShareableMarketplaceListing;
  variant?: ShareVariant;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const stopCardNav = (event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const onShare = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const result = await shareMarketplaceListing(listing);
    if (result === 'copied') setCopied(true);
  };

  const label = copied ? 'Link copied' : 'Share listing';

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className={cx(mpShareIconBtn, copied && 'border-[#A7F3D0] bg-[#ECFDF3] text-[#059669]', className)}
        aria-label={label}
        title={label}
        onClick={(event) => {
          void onShare(event);
        }}
        onKeyDown={stopCardNav}
      >
        {copied ? <CheckIcon size={14} /> : <ShareIcon size={14} />}
      </button>
    );
  }

  if (variant === 'chip') {
    return (
      <button
        type="button"
        className={cx(mpCardEdit, className)}
        aria-label={label}
        onClick={(event) => {
          void onShare(event);
        }}
        onKeyDown={stopCardNav}
      >
        {copied ? 'Copied' : 'Share'}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cx(mpOutlineBtn, 'gap-1.5', className)}
      aria-label={label}
      onClick={(event) => {
        void onShare(event);
      }}
      onKeyDown={stopCardNav}
    >
      {copied ? <CheckIcon size={15} color="currentColor" /> : <ShareIcon size={15} />}
      {copied ? 'Copied' : 'Share'}
    </button>
  );
}
