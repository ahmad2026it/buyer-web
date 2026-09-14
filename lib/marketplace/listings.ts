import type { MarketplaceListing } from './types';
import { MARKETPLACE_LISTING_CONDITIONS } from './types';

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asString = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
};

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const asBoolean = (value: unknown): boolean =>
  value === true || value === 1 || value === '1' || value === 'true';

export function formatMarketplacePostedAt(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatMarketplaceCondition(condition: string): string {
  const match = MARKETPLACE_LISTING_CONDITIONS.find((item) => item.value === condition);
  if (match) return match.label;
  return condition
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatMarketplaceListingStatus(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'active') return 'Active';
  if (normalized === 'sold') return 'Sold';
  if (normalized === 'inactive') return 'Inactive';
  if (normalized === 'deleted') return 'Deleted';
  if (normalized === 'expired') return 'Expired';
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function marketplaceListingMessagingUnavailableReason(
  status: string | null | undefined,
): string {
  const key = (status ?? '').trim().toLowerCase();
  if (key === 'deleted') return 'This listing has been deleted.';
  if (key === 'sold') return 'This listing has been marked as sold.';
  if (key === 'inactive') return 'This listing is no longer active.';
  if (key === 'expired') return 'This listing has expired.';
  if (key) {
    return `This listing is ${formatMarketplaceListingStatus(key).toLowerCase()}. Messaging is unavailable.`;
  }
  return 'Messaging is unavailable for this listing.';
}

export function formatMarketplaceViewCount(count: number): string {
  if (count === 1) return '1 view';
  return `${count} views`;
}

export function isOwnMarketplaceListing(
  listing: MarketplaceListing,
  userId?: number | string | null,
): boolean {
  if (userId == null || userId === '') return false;
  const id = String(userId);
  return listing.ownerId === id || listing.seller.id === id;
}

function asImages(value: unknown): string[] {
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === 'string' && item.trim()) return item.trim();
      const record = asRecord(item);
      return asString(
        record?.url ??
          record?.image_url ??
          record?.imageUrl ??
          record?.src ??
          record?.path,
      );
    })
    .filter((item): item is string => Boolean(item));
}

function asSeller(value: unknown): MarketplaceListing['seller'] {
  const record = asRecord(value);
  const nestedUser = asRecord(record?.user);
  const source = nestedUser ?? record;
  const memberSinceRaw = asString(source?.memberSince ?? source?.member_since);
  const created = asString(source?.createdAt ?? source?.created_at);
  let memberSince = '';
  if (memberSinceRaw) {
    const parsed = new Date(memberSinceRaw);
    memberSince = Number.isNaN(parsed.getTime())
      ? memberSinceRaw
      : parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } else if (created) {
    memberSince = new Date(created).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  return {
    id: asString(source?.id) ?? '',
    name:
      asString(source?.fullName ?? source?.full_name ?? source?.name ?? source?.username) ??
      'Seller',
    avatar:
      asString(
        source?.profileImage ??
          source?.profile_image ??
          source?.profileImageUrl ??
          source?.avatar,
      ) ?? '',
    memberSince,
    phoneNumber:
      asString(source?.phoneNumber ?? source?.phone_number ?? source?.phone) ?? '',
  };
}

export function marketplaceSellerTelHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const href = trimmed.replace(/[^\d+]/g, '');
  const digits = href.replace(/\D/g, '');
  if (digits.length < 7) return null;
  return `tel:${href}`;
}

export function normalizeMarketplaceListing(value: unknown): MarketplaceListing | null {
  const record = asRecord(value);
  if (!record) return null;

  const id = asString(record.id);
  const title = asString(record.title);
  if (!id || !title) return null;

  const category = asRecord(record.category);
  const images = asImages(
    record.images ?? record.image_urls ?? record.photos ?? record.media,
  );
  const thumbnail = asString(
    record.thumbnail ?? record.thumbnail_url ?? record.thumbnailUrl ?? record.cover_image,
  );
  if (thumbnail && !images.includes(thumbnail)) {
    images.unshift(thumbnail);
  }
  const postedAt =
    asString(record.created_at ?? record.createdAt ?? record.postedAt ?? record.updated_at) ??
    new Date().toISOString();
  const location =
    asString(
      record.locationLabel ??
        record.location_label ??
        record.location ??
        record.city_state,
    ) ?? [asString(record.city), asString(record.state)].filter(Boolean).join(', ');

  const seller = asSeller(
    record.created_by ??
      record.createdBy ??
      record.seller ??
      record.user ??
      record.buyer ??
      record.owner,
  );

  return {
    id,
    title,
    price: asNumber(record.price) ?? 0,
    currency: 'USD',
    negotiable: asBoolean(record.negotiable ?? record.is_negotiable ?? record.isNegotiable),
    condition: asString(record.condition) ?? 'used_good',
    status: asString(record.status) ?? 'active',
    featured: asBoolean(record.featured ?? record.is_featured ?? record.isFeatured),
    categoryId: asString(record.categoryId ?? record.category_id ?? category?.id) ?? '',
    categoryName: asString(category?.name ?? record.categoryName ?? record.category_name) ?? '',
    location: location || 'Location not set',
    postedAt,
    postedLabel: formatMarketplacePostedAt(postedAt),
    imageCount: asNumber(record.imageCount ?? record.image_count) ?? images.length,
    viewCount: asNumber(record.viewCount ?? record.view_count) ?? 0,
    images,
    description: asString(record.description) ?? '',
    seller,
    isFavorite: asBoolean(
      record.isFavorite ?? record.is_favorite ?? record.is_saved ?? record.favorited,
    ),
    lat: asNumber(record.lat ?? record.latitude),
    lng: asNumber(record.lng ?? record.longitude),
    city: asString(record.city) ?? '',
    state: asString(record.state) ?? '',
    zipCode: asString(record.zipCode ?? record.zip_code) ?? '',
    ownerId:
      asString(
        record.buyerId ??
          record.buyer_id ??
          record.userId ??
          record.user_id ??
          record.ownerId ??
          record.owner_id ??
          seller.id,
      ) ?? '',
  };
}

export function extractMarketplaceListingList(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;

  const payload = asRecord(response);
  const data = payload?.data;
  if (Array.isArray(data)) return data;

  const nested = asRecord(data);
  if (!nested) return [];

  const list =
    nested.listings ??
    nested.saved ??
    nested.savedListings ??
    nested.saved_listings ??
    nested.items ??
    nested.rows ??
    nested.marketplaceListings ??
    nested.marketplace_listings;

  return Array.isArray(list) ? list : [];
}

export function unwrapMarketplaceListing(response: unknown): MarketplaceListing | null {
  const payload = asRecord(response);
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) {
    return normalizeMarketplaceListing(data[0]);
  }

  const nested = asRecord(data);
  return normalizeMarketplaceListing(nested?.listing ?? nested?.item ?? data);
}
