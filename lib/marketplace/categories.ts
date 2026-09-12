import { ALL_MARKETPLACE_CATEGORY_ID } from './types';
import type {
  GetMarketplaceCategoriesResponse,
  MarketplaceApiCategory,
  MarketplaceCategoriesPagination,
} from '@/app/buyer/store/marketplaceCategoriesTypes';
import type { MarketplaceCategory } from './types';

export { ALL_MARKETPLACE_CATEGORY_ID };

export const ALL_MARKETPLACE_CATEGORY: MarketplaceCategory = {
  id: ALL_MARKETPLACE_CATEGORY_ID,
  label: 'All',
  slug: ALL_MARKETPLACE_CATEGORY_ID,
};

export function marketplaceCategorySlug(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asString = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
};

const isInactive = (record: Record<string, unknown>): boolean => {
  const active = record.isActive ?? record.is_active ?? record.isEnabled ?? record.is_enabled;
  if (active === false || active === 0 || active === 'false') return true;
  const status = asString(record.status)?.toLowerCase();
  return status === 'inactive' || status === 'disabled' || status === 'archived';
};

export function normalizeMarketplaceCategory(value: unknown): MarketplaceApiCategory | null {
  const record = asRecord(value);
  if (!record || isInactive(record)) return null;

  const id = asString(record.id ?? record.categoryId ?? record.category_id);
  const label = asString(record.name ?? record.title ?? record.label);
  if (!id || !label) return null;

  const slug = asString(record.slug) ?? marketplaceCategorySlug(label);
  const nestedIcon = asRecord(record.icon);
  const icon =
    asString(record.icon_url) ??
    asString(record.iconUrl) ??
    asString(typeof record.icon === 'string' ? record.icon : null) ??
    asString(nestedIcon?.url) ??
    asString(record.image) ??
    asString(record.imageUrl);

  return {
    id,
    label,
    slug,
    icon,
    colorCode: asString(record.colorCode ?? record.color_code ?? record.color),
  };
}

function extractCategoryList(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;

  const payload = asRecord(response);
  const data = payload?.data;
  if (Array.isArray(data)) return data;

  const nested = asRecord(data);
  if (!nested) return [];

  const list =
    nested.categories ??
    nested.items ??
    nested.rows ??
    nested.marketplaceCategories ??
    nested.marketplace_categories;

  return Array.isArray(list) ? list : [];
}

function normalizePagination(
  value: unknown,
  fallback: { total: number; page: number; limit: number },
): MarketplaceCategoriesPagination {
  const record = asRecord(value);
  const page = Number(record?.page) || fallback.page;
  const limit = Number(record?.limit) || fallback.limit;
  const total = Number(record?.total) || fallback.total;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) ||
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  return { page, limit, total, totalPages };
}

export function transformMarketplaceCategoriesResponse(
  response: unknown,
  fallback: { page: number; limit: number },
): GetMarketplaceCategoriesResponse {
  const payload = asRecord(response);
  const nested = asRecord(payload?.data);
  const categories = extractCategoryList(response)
    .map(normalizeMarketplaceCategory)
    .filter((item): item is MarketplaceApiCategory => item != null);

  return {
    success: typeof payload?.success === 'boolean' ? payload.success : true,
    status: Number(payload?.status) || 200,
    message: asString(payload?.message) ?? '',
    data: {
      categories,
      pagination: normalizePagination(nested?.pagination, {
        total: categories.length,
        page: fallback.page,
        limit: fallback.limit,
      }),
    },
  };
}

export function toMarketplaceCategory(item: MarketplaceApiCategory): MarketplaceCategory {
  return {
    id: item.id,
    label: item.label,
    slug: item.slug,
    icon: item.icon,
    colorCode: item.colorCode,
  };
}

export function withAllMarketplaceCategory(categories: MarketplaceCategory[]): MarketplaceCategory[] {
  const withoutAll = categories.filter((category) => category.id !== ALL_MARKETPLACE_CATEGORY_ID);
  return [ALL_MARKETPLACE_CATEGORY, ...withoutAll];
}

export function listingMatchesCategory(
  listingCategoryId: string,
  selectedId: string,
  categories: MarketplaceCategory[],
): boolean {
  if (selectedId === ALL_MARKETPLACE_CATEGORY_ID) return true;
  if (listingCategoryId === selectedId) return true;

  const selected = categories.find((category) => category.id === selectedId);
  if (!selected) return false;

  const slug = selected.slug || marketplaceCategorySlug(selected.label);
  return listingCategoryId === slug || listingCategoryId === selected.id;
}

export function marketplaceCategoryLabel(
  categoryId: string,
  categories: MarketplaceCategory[],
): string {
  const match = categories.find(
    (category) =>
      category.id === categoryId ||
      category.slug === categoryId ||
      marketplaceCategorySlug(category.label) === categoryId,
  );
  return match?.label ?? categoryId;
}
