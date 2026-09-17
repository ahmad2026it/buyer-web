import { formatMarketplacePrice } from '@/lib/marketplace/data';
import { showToast } from '@/lib/toast';
import type { MarketplaceListing } from '@/lib/marketplace/types';

export type ShareableMarketplaceListing = Pick<
  MarketplaceListing,
  'id' | 'title' | 'price' | 'currency'
> & {
  shareUrl?: string | null;
};

export function marketplaceListingPath(id: string): string {
  return `/marketplace/${id}`;
}

export function marketplaceListingUrl(id: string): string {
  const path = marketplaceListingPath(id);
  if (typeof window === 'undefined') return path;
  return new URL(path, window.location.origin).href;
}

export async function shareMarketplaceListing(
  listing: ShareableMarketplaceListing,
): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  const shareUrl = listing.shareUrl?.trim();
  const url = shareUrl || marketplaceListingUrl(listing.id);
  const title = listing.title.trim() || 'WhoCan listing';
  const price = formatMarketplacePrice(listing.price, listing.currency);
  const text = `Check out this listing on WhoCan: ${title} — ${price}`;

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled';
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard', 'success');
    return 'copied';
  } catch {
    showToast("Couldn't copy the link. Please copy it from the address bar.", 'error');
    return 'failed';
  }
}
