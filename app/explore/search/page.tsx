'use client';
import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FiltersModal from '@/components/FiltersModal';
import AuthGateModal from '@/components/AuthGateModal';
import { type FavorCard } from '@/utils/favorites';
import { useGetBuyerCategoriesQuery } from '@/app/buyer/store/buyerCategoriesAPI';
import {
  useGetBuyerFavorsQuery,
  useMarkBuyerFavoriteMutation,
  useUnmarkBuyerFavoriteMutation,
} from '@/app/buyer/store/buyerFavorsAPI';
import { useAppSelector } from '@/store/hooks';
import type { BuyerCategory } from '@/app/buyer/store/buyerCategoriesTypes';
import type { BuyerFavor } from '@/app/buyer/store/buyerFavorsTypes';
import FavorImage, { pickFavorImage } from '@/components/FavorImage';
import FavoriteButton from '@/components/FavoriteButton';
import PersonAvatar from '@/components/PersonAvatar';
import {
  BUYER_SELLERS_LIST_PARAMS,
  useSellersListQuery,
} from '@/app/buyer/store/buyerSellersAPI';
import {
  getSellerIsTeam,
  getSellerJobsCompleted,
  getSellerLocationLabel,
  getSellerReviewCount,
  type BuyerSeller,
} from '@/app/buyer/store/buyerSellersTypes';
import {
  DEFAULT_FAVOR_FILTERS,
  isFavorFiltersActive,
  toBuyerFavorsParams,
  type AppliedFavorFilters,
} from '@/app/buyer/store/buyerFavorsTypes';

type SellerCard = {
  id: number;
  image: string | null;
  name: string;
  badge: string;
  rating: string;
  ratingValue: number;
  reviews: string;
  jobs: number | null;
  location: string;
  isOnline: boolean;
};

const COLS_FAVORS = 3;
const ROWS_PER_PAGE = 5;
const PAGE_FAVORS = COLS_FAVORS * ROWS_PER_PAGE;
const PAGE_SELLERS = 4 * ROWS_PER_PAGE;

const GRAD = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const BADGE = (b: string) => ({
  position: 'absolute' as const, top: '20px', left: '20px',
  background: b === 'Pro' ? '#A54AFF' : '#344054',
  borderRadius: '9999px', padding: '4px 12px',
  fontFamily: 'Poppins,sans-serif', fontSize: '11px', fontWeight: 700,
  color: '#fff', letterSpacing: '0.03em',
  boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
});

function displayCategory(type: string, categories: BuyerCategory[]): string {
  const match = categories.find(c => c.name.toLowerCase() === type.toLowerCase());
  if (match) return match.name;
  return type.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function toFavorCard(favor: BuyerFavor, categories: BuyerCategory[]): FavorCard {
  return {
    id: String(favor.id),
    image: pickFavorImage(favor.images, favor.favorImage),
    title: favor.title,
    price: Number(favor.budget) || 0,
    badge: favor.seller?.isOnline ? 'Online' : '',
    rating: favor.averageRating != null ? Number(favor.averageRating).toFixed(1) : '—',
    reviews: String(favor.reviewCount ?? 0),
    category: displayCategory(favor.type, categories),
    sellerAvatar: pickFavorImage(favor.seller?.profileImageUrl, favor.seller?.profileImage),
    seller: favor.seller?.fullName || 'Seller',
    isFavorite: Boolean(favor.isFavorite),
  };
}

function toSellerCard(seller: BuyerSeller): SellerCard | null {
  const id = Number(seller.sellerId ?? seller.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  const ratingValue = Number(seller.averageRating);
  return {
    id,
    image: pickFavorImage(seller.profileImageUrl, seller.profileImage),
    name: seller.name?.trim() || seller.fullName?.trim() || 'Seller',
    badge: seller.isPro ? 'Pro' : getSellerIsTeam(seller) ? 'Team' : '',
    rating: Number.isFinite(ratingValue) ? ratingValue.toFixed(1) : '—',
    ratingValue: Number.isFinite(ratingValue) ? ratingValue : 0,
    reviews: getSellerReviewCount(seller).toLocaleString(),
    jobs: getSellerJobsCompleted(seller),
    location: getSellerLocationLabel(seller),
    isOnline: Boolean(seller.isOnline),
  };
}

function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return '$0.00';
  return `$${value.toFixed(2)}`;
}

function extraFiltersActive(filters: AppliedFavorFilters): boolean {
  return isFavorFiltersActive({ ...filters, categoryNames: [] });
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryFromUrl = searchParams.get('category') || '';

  const [searchType, setSearchType] = useState<'all' | 'favors' | 'sellers'>(
    (searchParams.get('type') as 'all' | 'favors' | 'sellers') || 'all'
  );
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [appliedSearch, setAppliedSearch] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl || 'All');
  const [sortBy, setSortBy] = useState<'relevance' | 'price'>('relevance');
  const [typeDropOpen, setTypeDrop] = useState(false);
  const [filtersOpen, setFilters] = useState(false);
  const [searchFocused, setSearchFocus] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFavorFilters>(() => ({
    ...DEFAULT_FAVOR_FILTERS,
    categoryNames: categoryFromUrl ? [categoryFromUrl] : [],
  }));
  const [authOpen, setAuthOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [visibleCount, setVisible] = useState(PAGE_SELLERS);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const loaderRef = useRef<HTMLDivElement>(null);
  const token = useAppSelector((state) => state.auth.token);

  const { data: categoriesData } = useGetBuyerCategoriesQuery({ search: '' });
  const categories = categoriesData?.data?.categories ?? [];
  const categoryPills = ['All', ...categories.map(c => c.name)];

  const favorsParams = useMemo(
    () => toBuyerFavorsParams({
      filters: appliedFilters,
      search: appliedSearch,
      category: activeCategory,
      pageSort: sortBy,
      page,
      limit: PAGE_FAVORS,
    }),
    [appliedFilters, appliedSearch, activeCategory, sortBy, page],
  );

  const skipFavors = searchType === 'sellers';
  const {
    data: favorsData,
    isLoading: favorsLoading,
    isFetching: favorsFetching,
    isError: favorsError,
  } = useGetBuyerFavorsQuery(favorsParams, { skip: skipFavors });
  const [markFavorite] = useMarkBuyerFavoriteMutation();
  const [unmarkFavorite] = useUnmarkBuyerFavoriteMutation();

  const skipSellers = searchType !== 'sellers';
  const {
    data: sellersData,
    isLoading: sellersLoading,
    isError: sellersError,
  } = useSellersListQuery(BUYER_SELLERS_LIST_PARAMS, { skip: skipSellers });

  const apiFavors = favorsData?.data?.favors ?? [];
  const pagination = favorsData?.data?.pagination;
  const favorCards = apiFavors.map(f => toFavorCard(f, categories));
  const filtersActive = extraFiltersActive(appliedFilters);

  useEffect(() => {
    setPage(1);
    setVisible(PAGE_SELLERS);
  }, [searchType, activeCategory, sortBy, appliedSearch, appliedFilters]);

  const favorsHasMore = !skipFavors && (pagination ? apiFavors.length < pagination.total : false);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      if (searchType === 'sellers') {
        setVisible(p => p + 4 * ROWS_PER_PAGE);
        return;
      }
      if (favorsHasMore && !favorsFetching) setPage(p => p + 1);
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  });

  const syncUrl = (next: { q?: string; category?: string; type?: typeof searchType }) => {
    const params = new URLSearchParams();
    params.set('type', next.type ?? searchType);
    const q = next.q ?? appliedSearch;
    const category = next.category ?? activeCategory;
    if (q.trim()) params.set('q', q.trim());
    if (category && category !== 'All') params.set('category', category);
    router.replace(`/explore/search?${params.toString()}`, { scroll: false });
  };

  const toggleCat = (cat: string) => {
    setActiveCategory(cat);
    setAppliedFilters(prev => ({
      ...prev,
      categoryNames: cat === 'All' ? [] : [cat],
      subCategoryIds: [],
    }));
    setPage(1);
    syncUrl({ category: cat });
  };

  const handleSearch = () => {
    setAppliedSearch(query);
    setPage(1);
    syncUrl({ q: query });
  };

  const handleApplyFilters = (filters: AppliedFavorFilters) => {
    setAppliedFilters(filters);
    const nextCategory = filters.categoryNames.length === 1 ? filters.categoryNames[0] : (filters.categoryNames.length === 0 ? 'All' : activeCategory);
    if (filters.categoryNames.length <= 1) setActiveCategory(nextCategory);
    setPage(1);
    setFilters(false);
    syncUrl({ category: nextCategory });
  };

  const sellerCards = useMemo(
    () => (sellersData?.data?.sellers ?? []).map(toSellerCard).filter((s): s is SellerCard => s != null),
    [sellersData],
  );
  const q = appliedSearch.trim().toLowerCase();
  const filteredSellers = q
    ? sellerCards.filter(s => s.name.toLowerCase().includes(q))
    : sellerCards;
  const sortedSellers = [...filteredSellers].sort((a, b) =>
    sortBy === 'price' ? (a.jobs ?? 0) - (b.jobs ?? 0) : b.ratingValue - a.ratingValue,
  );

  const visibleItems = searchType === 'sellers' ? sortedSellers.slice(0, visibleCount) : favorCards;
  const colCount = searchType === 'sellers' ? 4 : COLS_FAVORS;
  const hasMore = searchType === 'sellers' ? visibleCount < sortedSellers.length : favorsHasMore;
  const totalCount = searchType === 'sellers' ? sortedSellers.length : (pagination?.total ?? favorCards.length);

  const toggleLike = async (id: string) => {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    const favor = apiFavors.find((item) => String(item.id) === id);
    if (!favor || pendingIds.has(favor.id)) return;

    setPendingIds((prev) => new Set(prev).add(favor.id));
    try {
      if (favor.isFavorite) {
        await unmarkFavorite(favor.id).unwrap();
      } else {
        await markFavorite(favor.id).unwrap();
      }
    } catch {
      // axios interceptor already toasts API errors
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(favor.id);
        return next;
      });
    }
  };

  const catList = activeCategory !== 'All' ? [activeCategory] : [];
  const searchPlaceholder = searchType === 'sellers'
    ? 'Search sellers...'
    : catList.length > 0
      ? `Search ${catList.map(c => c.toLowerCase()).join(', ')} favors...`
      : `Search favors, services...`;

  const R = '9999px';

  return (
    <>
      <Navbar />
      {filtersOpen && (
        <FiltersModal
          onClose={() => setFilters(false)}
          initial={appliedFilters}
          onApply={handleApplyFilters}
        />
      )}
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Log in to save this favor to your favorites."
        />
      )}

      <main style={{ minHeight: '100vh', background: '#FAFAFA', paddingTop: '88px' }}>

        {/* Search bar row */}
        <div style={{ background: '#ffffff', borderBottom: '1px solid #EAECF0', padding: '20px 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#101828', marginRight: '8px', flexShrink: 0 }}>Explore</h1>

            {/* Search input */}
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#F9FAFB', border: `1.5px solid ${searchFocused ? '#A54AFF' : '#EAECF0'}`, borderRadius: R, padding: '10px 16px', gap: '8px', transition: 'border-color 0.15s' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#98A2B3" strokeWidth="2" /><path d="M21 21l-4.35-4.35" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" /></svg>
                <input type="text" placeholder={searchPlaceholder} value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setTimeout(() => setSearchFocus(false), 160)}
                  style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#101828', background: 'transparent' }} />
                {query && (
                  <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#98A2B3', lineHeight: 0, padding: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" /></svg>
                  </button>
                )}
              </div>
              {/* Recent searches dropdown */}
              {searchFocused && searchType !== 'sellers' && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#fff', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.14)', zIndex: 200, paddingTop: '14px', paddingBottom: '6px', border: '1px solid #EAECF0' }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '12px', color: '#A54AFF', padding: '0 16px 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Recent searches
                  </p>
                  {['Deep Home Cleaning', 'Electrical Repairs', 'Plumbing Fix', 'Garden Landscaping', 'Furniture Assembly'].map(s => (
                    <button
                      key={s}
                      onMouseDown={() => { setQuery(s); setSearchFocus(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#101828', padding: '10px 16px', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Type dropdown */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setTypeDrop(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: '14px', color: '#344054', background: '#F9FAFB', border: '1.5px solid #EAECF0', borderRadius: R, padding: '10px 14px', cursor: 'pointer' }}>
                {searchType === 'all'
                  ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="#667085" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="#667085" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="#667085" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="#667085" strokeWidth="2"/></svg> All</>
                  : searchType === 'favors'
                    ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> Favors</>
                    : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="7" r="4" stroke="#667085" strokeWidth="2" /></svg> Sellers</>
                }
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.2s', transform: typeDropOpen ? 'rotate(180deg)' : 'none' }}><path d="M3 4.5L6 7.5L9 4.5" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              {typeDropOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#ffffff', border: '1px solid #EAECF0', borderRadius: '16px', boxShadow: '0 8px 24px rgba(16,24,40,0.1)', zIndex: 100, overflow: 'hidden', minWidth: '130px' }}>
                  {(['all', 'favors', 'sellers'] as const).map(t => (
                    <button key={t} onClick={() => { setSearchType(t); setTypeDrop(false); syncUrl({ type: t }); }} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: searchType === t ? '#A54AFF' : '#344054', background: searchType === t ? '#F8F0FF' : 'transparent', border: 'none', cursor: 'pointer' }}>
                      {t === 'all'
                        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg>
                        : t === 'favors'
                          ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          : <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" /></svg>
                      }{' '}{t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search button */}
            <button onClick={handleSearch}
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#ffffff', background: GRAD, border: 'none', borderRadius: R, padding: '11px 24px', cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
              Search
            </button>

            {/* Filters button — purple dot when active */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setFilters(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: '14px', color: filtersActive ? '#A54AFF' : '#344054', background: filtersActive ? '#F4EBFF' : '#F9FAFB', border: `1.5px solid ${filtersActive ? '#A54AFF' : '#D0D5DD'}`, borderRadius: R, padding: '10px 16px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#A54AFF'; el.style.color = '#A54AFF'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = filtersActive ? '#A54AFF' : '#D0D5DD'; el.style.color = filtersActive ? '#A54AFF' : '#344054'; }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M8 12h8M12 18h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                More filters
              </button>
              {/* Active dot */}
              {filtersActive && (
                <span style={{ position: 'absolute', top: '-3px', right: '-3px', width: '10px', height: '10px', borderRadius: '50%', background: '#A54AFF', border: '2px solid #FAFAFA' }} />
              )}
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div style={{ background: '#ffffff', borderBottom: '1px solid #EAECF0', padding: '12px 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {categoryPills.map(cat => {
              const on = activeCategory === cat;
              return (
                <button key={cat} onClick={() => toggleCat(cat)}
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', whiteSpace: 'nowrap', padding: '7px 16px', borderRadius: R, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0, ...(on ? { background: '#F4EBFF', borderColor: '#A54AFF', color: '#A54AFF', fontWeight: 600 } : { background: 'transparent', borderColor: '#EAECF0', color: '#344054', fontWeight: 500 }) }}>
                  {cat}
                </button>
              );
            })}
            <button onClick={() => setFilters(true)}
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#A54AFF', background: 'transparent', border: 'none', cursor: 'pointer', padding: '7px 4px', whiteSpace: 'nowrap', textDecoration: 'underline', textUnderlineOffset: '3px', flexShrink: 0 }}>
              More
            </button>
          </div>
        </div>

        <div className="container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>

          {/* Results header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#667085' }}>
              <span style={{ fontWeight: 600, color: '#101828' }}>{(searchType === 'sellers' ? sellersLoading : favorsLoading) ? '…' : totalCount}</span> {searchType === 'sellers' ? 'sellers' : 'favors'} found
            </p>
            <div style={{ display: 'flex', gap: '4px', background: '#F2F4F7', borderRadius: R, padding: '4px' }}>
              {(['relevance', 'price'] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 500, padding: '7px 16px', borderRadius: R, border: 'none', cursor: 'pointer', transition: 'all 0.2s', ...(sortBy === s ? { background: '#ffffff', color: '#A54AFF', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } : { background: 'transparent', color: '#667085' }) }}>
                  By {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {searchType === 'sellers' && sellersLoading ? (
            <div className="rs-grid-4" style={{ display: 'grid', gridTemplateColumns: `repeat(4, 1fr)`, gap: '24px' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ height: 360, borderRadius: 20, background: '#fff', border: '1.5px solid #EAECF0' }} />
              ))}
            </div>
          ) : searchType === 'sellers' && sellersError ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 600, color: '#344054', marginBottom: '8px' }}>Unable to load sellers</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#667085' }}>Please try again in a moment.</p>
            </div>
          ) : searchType !== 'sellers' && favorsLoading ? (
            <div className="rs-grid-3" style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS_FAVORS}, 1fr)`, gap: '24px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 360, borderRadius: 20, background: '#fff', border: '1.5px solid #EAECF0' }} />
              ))}
            </div>
          ) : searchType !== 'sellers' && favorsError ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 600, color: '#344054', marginBottom: '8px' }}>Unable to load favors</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#667085' }}>Please try again in a moment.</p>
            </div>
          ) : visibleItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 600, color: '#344054', marginBottom: '8px' }}>No results found</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#667085' }}>Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <>
              <div className={colCount >= 4 ? 'rs-grid-4' : 'rs-grid-3'} style={{ display: 'grid', gridTemplateColumns: `repeat(${colCount}, 1fr)`, gap: '24px' }}>
                {searchType !== 'sellers'
                  ? (visibleItems as FavorCard[]).map(favor => {
                      const liked = Boolean(favor.isFavorite);
                      const pending = pendingIds.has(Number(favor.id));
                      return (
                        <div key={favor.id}
                          onClick={() => router.push(`/favor/${favor.id}`)}
                          style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #EAECF0', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(165,74,255,0.3)'; el.style.boxShadow = '0 8px 24px rgba(165,74,255,0.1)'; }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#EAECF0'; el.style.boxShadow = 'none'; }}>

                          {/* Image zone */}
                          <div style={{ position: 'relative', padding: '10px 10px 0', flexShrink: 0 }}>
                            <div style={{ height: '200px', borderRadius: '14px', overflow: 'hidden' }}>
                              <FavorImage src={favor.image} alt={favor.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <FavoriteButton
                              liked={liked}
                              pending={pending}
                              onClick={(event) => {
                                event.stopPropagation();
                                void toggleLike(favor.id);
                              }}
                            />
                          </div>

                          {/* Card body — new hierarchy */}
                          <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>

                            {/* 1. Title — primary */}
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '17px', color: '#101828', lineHeight: '1.4', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{favor.title}</h3>

                            {/* 2. Price + Category badge */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#8E40FF' }}>{formatPrice(favor.price)}</span>
                              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 500, color: '#6941C6', background: '#F9F5FF', border: '1px solid #E9D7FE', borderRadius: '9999px', padding: '3px 10px' }}>{favor.category}</span>
                            </div>

                            {/* 3. Provider + rating */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #EAECF0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1, minWidth: 0 }}>
                                <PersonAvatar src={favor.sellerAvatar} name={favor.seller} size={30} />
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{favor.seller}</span>
                                {favor.badge ? (
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, background: favor.badge === 'Online' ? '#12B76A' : favor.badge === 'Pro' ? '#A54AFF' : '#344054', color: '#ffffff', borderRadius: '9999px', padding: '2px 8px', flexShrink: 0, letterSpacing: '0.02em' }}>{favor.badge}</span>
                                ) : null}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                <svg viewBox="0 0 24 24" width="13" height="13"><polygon fill="#F79009" stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#101828' }}>{favor.rating}</span>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#D0D5DD' }}>·</span>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#667085' }}>{favor.reviews}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : (visibleItems as SellerCard[]).map(seller => (
                      <div key={seller.id}
                        onClick={() => router.push(`/seller/${seller.id}`)}
                        style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #EAECF0', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s', overflow: 'hidden' }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(165,74,255,0.3)'; el.style.boxShadow = '0 8px 24px rgba(165,74,255,0.1)'; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#EAECF0'; el.style.boxShadow = 'none'; }}>

                        <div style={{ position: 'relative', padding: '10px 10px 0' }}>
                          <div style={{ height: '220px', borderRadius: '14px', overflow: 'hidden', background: '#F8F0FF' }}>
                            <FavorImage src={seller.image} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                          </div>
                          {seller.isOnline ? (
                            <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#12B76A', borderRadius: '9999px', padding: '4px 10px', fontFamily: 'Poppins,sans-serif', fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.03em' }}>
                              Online
                            </div>
                          ) : null}
                          {seller.badge ? <div style={BADGE(seller.badge)}>{seller.badge}</div> : null}
                        </div>

                        <div style={{ padding: '14px 16px 18px' }}>
                          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#101828', marginBottom: '6px' }}>{seller.name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                            <svg viewBox="0 0 24 24" width="14" height="14"><polygon fill="#F79009" stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#101828' }}>{seller.rating}</span>
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#D0D5DD' }}>|</span>
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#667085' }}>{seller.reviews} reviews</span>
                            {seller.jobs != null ? (
                              <>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#D0D5DD' }}>/</span>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#667085' }}>{seller.jobs.toLocaleString()} jobs</span>
                              </>
                            ) : null}
                          </div>
                          {seller.location ? (
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#667085', margin: '8px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {seller.location}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))
                }
              </div>

              {hasMore && (
                <div ref={loaderRef} style={{ marginTop: '36px', textAlign: 'center' }}>
                  <button
                    disabled={searchType !== 'sellers' && favorsFetching}
                    onClick={() => searchType === 'sellers' ? setVisible(p => p + 4 * ROWS_PER_PAGE) : setPage(p => p + 1)}
                    style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#A54AFF', background: '#ffffff', border: '1.5px solid #A54AFF', borderRadius: R, padding: '12px 36px', cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8F0FF'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}>
                    Show More
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="#A54AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#98A2B3', marginTop: '8px' }}>
                    Showing {visibleItems.length} of {totalCount}
                  </p>
                </div>
              )}

              {!hasMore && totalCount > 0 && (
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#98A2B3', textAlign: 'center', marginTop: '36px' }}>
                  All {totalCount} results shown
                </p>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAFAFA' }} />}>
      <SearchContent />
    </Suspense>
  );
}
