'use client';

import { useEffect } from 'react';
import { MARKETPLACE_CATEGORIES } from '@/lib/marketplace/data';
import type { MarketplaceCategoryId, MarketplaceFilters } from '@/lib/marketplace/types';
import { MARKETPLACE_CONDITIONS } from '@/lib/marketplace/types';
import { CATEGORY_ICONS } from './MarketplaceIcons';

const FONT = 'Poppins, sans-serif';
const BRAND = '#A54AFF';
const GRAD = 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)';

const SORT_OPTIONS: { value: MarketplaceFilters['sort']; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

export function MarketplaceCategoryChips({
  value,
  onChange,
}: {
  value: MarketplaceCategoryId;
  onChange: (id: MarketplaceCategoryId) => void;
}) {
  return (
    <div className="marketplace-chips" role="tablist" aria-label="Marketplace categories">
      {MARKETPLACE_CATEGORIES.map((category) => {
        const active = category.id === value;
        const Icon = CATEGORY_ICONS[category.id];
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`marketplace-chip${active ? ' is-active' : ''}`}
            onClick={() => onChange(category.id)}
          >
            <Icon size={15} color={active ? '#ffffff' : '#667085'} />
            {category.label}
          </button>
        );
      })}
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
    <div className="marketplace-filter-fields">
      <label className="marketplace-field">
        <span>Sort by</span>
        <select
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

      <label className="marketplace-field">
        <span>Condition</span>
        <select
          value={filters.condition}
          onChange={(event) => set('condition', event.target.value as MarketplaceFilters['condition'])}
        >
          <option value="all">Any condition</option>
          {MARKETPLACE_CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
      </label>

      <div className="marketplace-price-fields">
        <label className="marketplace-field">
          <span>Min price</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="0"
            value={filters.minPrice}
            onChange={(event) => set('minPrice', event.target.value)}
          />
        </label>
        <label className="marketplace-field">
          <span>Max price</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Any"
            value={filters.maxPrice}
            onChange={(event) => set('maxPrice', event.target.value)}
          />
        </label>
      </div>

      <label className="marketplace-check">
        <input
          type="checkbox"
          checked={filters.featuredOnly}
          onChange={(event) => set('featuredOnly', event.target.checked)}
        />
        Featured ads only
      </label>
      <label className="marketplace-check">
        <input
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
  return (
    <aside className="marketplace-sidebar">
      <div className="marketplace-sidebar-card">
        <p className="marketplace-sidebar-title">Categories</p>
        <div className="marketplace-sidebar-cats">
          {MARKETPLACE_CATEGORIES.map((category) => {
            const active = category.id === filters.categoryId;
            const Icon = CATEGORY_ICONS[category.id];
            return (
              <button
                key={category.id}
                type="button"
                className={`marketplace-side-cat${active ? ' is-active' : ''}`}
                onClick={() => onChange({ ...filters, categoryId: category.id })}
              >
                <span className="marketplace-side-cat-icon">
                  <Icon size={16} color={active ? '#ffffff' : BRAND} />
                </span>
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="marketplace-sidebar-card">
        <div className="marketplace-sidebar-head">
          <p className="marketplace-sidebar-title">Filters</p>
          <button type="button" className="marketplace-reset" onClick={onReset}>
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
    <div className="marketplace-sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="marketplace-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="marketplace-filters-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="marketplace-sheet-bar" />
        <div className="marketplace-sidebar-head">
          <p id="marketplace-filters-title" className="marketplace-sidebar-title" style={{ margin: 0 }}>
            Filters
          </p>
          <button type="button" className="marketplace-reset" onClick={onReset}>
            Reset
          </button>
        </div>
        <MarketplaceFilterFields filters={filters} onChange={onChange} />
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 8,
            width: '100%',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 14,
            color: '#ffffff',
            background: GRAD,
            border: 'none',
            borderRadius: 14,
            padding: '13px 16px',
            cursor: 'pointer',
          }}
        >
          Show results
        </button>
      </div>
    </div>
  );
}
