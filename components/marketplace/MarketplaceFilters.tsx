'use client';

import { useEffect } from 'react';
import { useMarketplaceCategories } from '@/app/buyer/store/marketplaceCategoriesAPI';
import type { MarketplaceCategory, MarketplaceCategoryId, MarketplaceFilters } from '@/lib/marketplace/types';
import { MARKETPLACE_LISTING_CONDITIONS } from '@/lib/marketplace/types';
import { MarketplaceCategoryIcon } from './MarketplaceIcons';
import {
  cx,
  mpCheck,
  mpCheckInput,
  mpChip,
  mpChipActive,
  mpChips,
  mpChipSkel,
  mpControl,
  mpField,
  mpFilterFields,
  mpPostBtn,
  mpPriceFields,
  mpReset,
  mpSheet,
  mpSheetBackdrop,
  mpSheetBar,
  mpSideCat,
  mpSideCatActive,
  mpSideCatIcon,
  mpSideCatIconActive,
  mpSideCats,
  mpSideCatSkel,
  mpSidebar,
  mpSidebarCard,
  mpSidebarHead,
  mpSidebarTitle,
} from './ui';

const SORT_OPTIONS: { value: MarketplaceFilters['sort']; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

function CategorySkeletons({ count, variant }: { count: number; variant: 'chip' | 'side' }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={variant === 'chip' ? mpChipSkel : mpSideCatSkel}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

function CategoryButton({
  category,
  active,
  variant,
  onClick,
}: {
  category: MarketplaceCategory;
  active: boolean;
  variant: 'chip' | 'side';
  onClick: () => void;
}) {
  const iconColor = variant === 'chip'
    ? (active ? '#ffffff' : '#667085')
    : (active ? '#ffffff' : '#A54AFF');

  if (variant === 'chip') {
    return (
      <button
        type="button"
        role="tab"
        aria-selected={active}
        className={cx(mpChip, active && mpChipActive)}
        onClick={onClick}
      >
        <MarketplaceCategoryIcon category={category} size={15} color={iconColor} />
        {category.label}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cx(mpSideCat, active && mpSideCatActive)}
      onClick={onClick}
    >
      <span className={cx(mpSideCatIcon, active && mpSideCatIconActive)}>
        <MarketplaceCategoryIcon category={category} size={16} color={iconColor} />
      </span>
      {category.label}
    </button>
  );
}

export function MarketplaceCategoryChips({
  value,
  onChange,
}: {
  value: MarketplaceCategoryId;
  onChange: (id: MarketplaceCategoryId) => void;
}) {
  const { categories, isLoading } = useMarketplaceCategories();

  return (
    <div className={mpChips} role="tablist" aria-label="Marketplace categories">
      {isLoading && categories.length === 0 ? (
        <CategorySkeletons count={6} variant="chip" />
      ) : (
        categories.map((category) => (
          <CategoryButton
            key={category.id}
            category={category}
            active={category.id === value}
            variant="chip"
            onClick={() => onChange(category.id)}
          />
        ))
      )}
    </div>
  );
}

export function MarketplaceFilterFields({
  filters,
  onChange,
}: {
  filters: MarketplaceFilters;
  onChange: (next: MarketplaceFilters) => void;
}) {
  const set = <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className={mpFilterFields}>
      <label className={mpField}>
        <span>Sort by</span>
        <select
          className={mpControl}
          value={filters.sort}
          onChange={(event) => set('sort', event.target.value as MarketplaceFilters['sort'])}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={mpField}>
        <span>Condition</span>
        <select
          className={mpControl}
          value={filters.condition}
          onChange={(event) => set('condition', event.target.value as MarketplaceFilters['condition'])}
        >
          <option value="all">Any condition</option>
          {MARKETPLACE_LISTING_CONDITIONS.map((condition) => (
            <option key={condition.value} value={condition.value}>
              {condition.label}
            </option>
          ))}
        </select>
      </label>

      <div className={mpPriceFields}>
        <label className={mpField}>
          <span>Min price ($)</span>
          <input
            className={mpControl}
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="0"
            value={filters.minPrice}
            onChange={(event) => set('minPrice', event.target.value)}
          />
        </label>
        <label className={mpField}>
          <span>Max price ($)</span>
          <input
            className={mpControl}
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="Any"
            value={filters.maxPrice}
            onChange={(event) => set('maxPrice', event.target.value)}
          />
        </label>
      </div>

      <label className={mpCheck}>
        <input
          className={mpCheckInput}
          type="checkbox"
          checked={filters.featuredOnly}
          onChange={(event) => set('featuredOnly', event.target.checked)}
        />
        Featured ads only
      </label>
      <label className={mpCheck}>
        <input
          className={mpCheckInput}
          type="checkbox"
          checked={filters.negotiableOnly}
          onChange={(event) => set('negotiableOnly', event.target.checked)}
        />
        Negotiable price
      </label>
    </div>
  );
}

export function MarketplaceSidebar({
  filters,
  onChange,
  onReset,
}: {
  filters: MarketplaceFilters;
  onChange: (next: MarketplaceFilters) => void;
  onReset: () => void;
}) {
  const { categories, isLoading } = useMarketplaceCategories();

  return (
    <aside className={mpSidebar}>
      <div className={mpSidebarCard}>
        <p className={mpSidebarTitle}>Categories</p>
        <div className={mpSideCats}>
          {isLoading && categories.length === 0 ? (
            <CategorySkeletons count={7} variant="side" />
          ) : (
            categories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                active={category.id === filters.categoryId}
                variant="side"
                onClick={() => onChange({ ...filters, categoryId: category.id })}
              />
            ))
          )}
        </div>
      </div>

      <div className={mpSidebarCard}>
        <div className={mpSidebarHead}>
          <p className={cx(mpSidebarTitle, 'mb-0')}>Filters</p>
          <button type="button" className={mpReset} onClick={onReset}>
            Reset
          </button>
        </div>
        <MarketplaceFilterFields filters={filters} onChange={onChange} />
      </div>
    </aside>
  );
}

export function MarketplaceFilterSheet({
  open,
  filters,
  onChange,
  onReset,
  onClose,
}: {
  open: boolean;
  filters: MarketplaceFilters;
  onChange: (next: MarketplaceFilters) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={mpSheetBackdrop} onClick={onClose} role="presentation">
      <div
        className={mpSheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="marketplace-filters-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={mpSheetBar} />
        <div className={mpSidebarHead}>
          <p id="marketplace-filters-title" className={cx(mpSidebarTitle, 'mb-0')}>
            Filters
          </p>
          <button type="button" className={mpReset} onClick={onReset}>
            Reset
          </button>
        </div>
        <MarketplaceFilterFields filters={filters} onChange={onChange} />
        <button type="button" className={cx(mpPostBtn, 'mt-2 w-full')} onClick={onClose}>
          Show results
        </button>
      </div>
    </div>
  );
}
