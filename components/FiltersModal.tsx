'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useGetBuyerCategoriesQuery, useGetBuyerSubCategoriesQuery } from '@/app/buyer/store/buyerCategoriesAPI';
import type { BuyerSubCategory } from '@/app/buyer/store/buyerCategoriesTypes';
import {
  DEFAULT_FAVOR_FILTERS,
  type AppliedFavorFilters,
  type FavorBudgetOption,
  type FavorRatingOption,
  type FavorSortOption,
} from '@/app/buyer/store/buyerFavorsTypes';


const BRAND = '#A54AFF';
const BORDER = '#D0D5DD';
const GRAD = 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)';

const lbl: React.CSSProperties = {
  fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
  color: '#344054', display: 'block', marginBottom: '8px',
};

// Custom pill dropdown — full brand-color hover control (native <select> can't be styled)
function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{ marginBottom: '18px' }} ref={ref}>
      <label style={lbl}>{label}</label>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%', textAlign: 'left', fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#344054',
            background: '#ffffff', border: `1px solid ${open ? BRAND : BORDER}`, borderRadius: '9999px',
            padding: '11px 40px 11px 20px', cursor: 'pointer', boxSizing: 'border-box',
            boxShadow: open ? `0 0 0 4px rgba(165,74,255,0.12)` : 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s', outline: 'none',
          }}
        >
          {value}
        </button>
        <svg style={{ position: 'absolute', right: '16px', top: '50%', transform: `translateY(-50%) rotate(${open ? '180deg' : '0deg'})`, pointerEvents: 'none', transition: 'transform 0.15s' }}
          width="16" height="16" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: '12px',
            boxShadow: '0 4px 8px -2px rgba(16,24,40,.1), 0 2px 4px -2px rgba(16,24,40,.06)',
            zIndex: 20, overflow: 'hidden',
          }}>
            {options.map(o => (
              <button key={o}
                onClick={() => { onChange(o); setOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 16px',
                  fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                  color: o === value ? BRAND : '#344054',
                  background: o === value ? '#F4EBFF' : 'transparent',
                  fontWeight: o === value ? 600 : 400,
                  border: 'none', cursor: 'pointer', display: 'block',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (o !== value) (e.currentTarget as HTMLElement).style.background = '#F4EBFF'; }}
                onMouseLeave={e => { if (o !== value) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >{o}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Dual-handle range slider
function DistanceRangeSlider({ low, high, onChange }: {
  low: number; high: number; onChange: (l: number, h: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const latest = useRef({ low, high, onChange });
  latest.current = { low, high, onChange };

  const MIN = 1, MAX = 50;
  const toPct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;
  const fromPct = (p: number) => Math.round(MIN + (p / 100) * (MAX - MIN));

  const startDrag = (which: 'low' | 'high') => (e: React.PointerEvent) => {
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    const move = (ev: PointerEvent) => {
      const { low: l, high: h, onChange: cb } = latest.current;
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100));
      const val = fromPct(pct);
      if (which === 'low') cb(Math.min(val, h - 1), h);
      else cb(l, Math.max(val, l + 1));
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const lowPct = toPct(low);
  const highPct = toPct(high);

  return (
    <div>
      <div style={{ position: 'relative', height: '36px', display: 'flex', alignItems: 'center', marginTop: '28px' }} ref={trackRef}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: '4px', background: '#EAECF0', borderRadius: '9999px' }}>
          <div style={{ position: 'absolute', left: `${lowPct}%`, right: `${100 - highPct}%`, height: '100%', background: BRAND, borderRadius: '9999px' }} />
        </div>

        {/* Low handle */}
        <div
          onPointerDown={startDrag('low')}
          style={{
            position: 'absolute', left: `${lowPct}%`, transform: 'translateX(-50%)',
            width: '20px', height: '20px', borderRadius: '50%',
            background: '#ffffff', border: `2.5px solid ${BRAND}`,
            cursor: 'grab', touchAction: 'none', userSelect: 'none',
            zIndex: highPct - lowPct < 6 ? 3 : 2,
            boxShadow: '0 1px 4px rgba(165,74,255,0.25)',
          }}
        />

        {/* High handle with tooltip */}
        <div style={{ position: 'absolute', left: `${highPct}%`, transform: 'translateX(-50%)', zIndex: 3 }}>
          <div style={{
            position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
            background: BRAND, color: '#ffffff', fontFamily: 'Poppins, sans-serif',
            fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
            whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>
            {high} mi
            <span style={{
              position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
              borderTop: `5px solid ${BRAND}`,
            }} />
          </div>
          <div
            onPointerDown={startDrag('high')}
            style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: '#ffffff', border: `2.5px solid ${BRAND}`,
              cursor: 'grab', touchAction: 'none', userSelect: 'none',
              boxShadow: '0 1px 4px rgba(165,74,255,0.25)',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#98A2B3' }}>1 mi</span>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#98A2B3' }}>50 mi</span>
      </div>
    </div>
  );
}

interface Props {
  onClose: () => void;
  onApply?: (filters: AppliedFavorFilters) => void;
  initial?: AppliedFavorFilters;
}

function SubCategoryCollector({
  categoryId,
  onChange,
}: {
  categoryId: number;
  onChange: (categoryId: number, subs: BuyerSubCategory[]) => void;
}) {
  const { data } = useGetBuyerSubCategoriesQuery(categoryId);
  useEffect(() => {
    onChange(categoryId, data?.data?.subCategories ?? []);
  }, [categoryId, data, onChange]);
  return null;
}

export default function FiltersModal({ onClose, onApply, initial }: Props) {
  const { data: categoriesData } = useGetBuyerCategoriesQuery({ search: '' });
  const categories = categoriesData?.data?.categories ?? [];

  const [onlineOnly, setOnlineOnly] = useState(initial?.onlineOnly ?? false);
  const [cats, setCats]             = useState<string[]>(initial?.categoryNames ?? []);
  const [catOpen, setCatOpen]       = useState(false);
  const [subCats, setSubCats]       = useState<number[]>(initial?.subCategoryIds ?? []);
  const [subOpen, setSubOpen]       = useState(false);
  const [sort, setSort]             = useState<FavorSortOption>(initial?.sort ?? 'Recommended');
  const [sellerType, setSellerType] = useState(initial?.sellerType ?? 'Any');
  const [rating, setRating]         = useState<FavorRatingOption>(initial?.rating ?? 'Any rating');
  const [budget, setBudget]         = useState<FavorBudgetOption>(initial?.budget ?? 'Any');
  const [distLow, setDistLow]       = useState(initial?.distLow ?? 1);
  const [distHigh, setDistHigh]     = useState(initial?.distHigh ?? 50);
  const [subMap, setSubMap]         = useState<Record<number, BuyerSubCategory[]>>({});

  const selectedCategoryIds = categories.filter(c => cats.includes(c.name)).map(c => c.id);
  const subPool = selectedCategoryIds.flatMap(id => subMap[id] ?? []);

  const handleSubs = useCallback((categoryId: number, subs: BuyerSubCategory[]) => {
    setSubMap(prev => (prev[categoryId] === subs ? prev : { ...prev, [categoryId]: subs }));
  }, []);

  const currentFilters = (): AppliedFavorFilters => ({
    onlineOnly,
    categoryNames: cats,
    subCategoryIds: subCats,
    sort,
    sellerType,
    rating,
    budget,
    distLow,
    distHigh,
  });

  const addCat    = (c: string) => { if (!cats.includes(c)) { setCats(p => [...p, c]); setSubCats([]); } setCatOpen(false); };
  const removeCat = (c: string) => { setCats(p => p.filter(x => x !== c)); setSubCats([]); };
  const addSub    = (id: number) => { if (!subCats.includes(id)) setSubCats(p => [...p, id]); setSubOpen(false); };
  const removeSub = (id: number) => setSubCats(p => p.filter(c => c !== id));
  const reset = () => {
    setOnlineOnly(DEFAULT_FAVOR_FILTERS.onlineOnly);
    setCats([]);
    setSubCats([]);
    setSort(DEFAULT_FAVOR_FILTERS.sort);
    setSellerType(DEFAULT_FAVOR_FILTERS.sellerType);
    setRating(DEFAULT_FAVOR_FILTERS.rating);
    setBudget(DEFAULT_FAVOR_FILTERS.budget);
    setDistLow(DEFAULT_FAVOR_FILTERS.distLow);
    setDistHigh(DEFAULT_FAVOR_FILTERS.distHigh);
    onApply?.(DEFAULT_FAVOR_FILTERS);
    onClose();
  };


  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.52)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      {/* Modal shell — flex column so header + footer stay fixed, content scrolls */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '460px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 24px -4px rgba(16,24,40,0.08), 0 8px 8px -4px rgba(16,24,40,0.03)',
        overflow: 'hidden',
      }}>

        {/* ── HEADER (non-scrolling) ── */}
        <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#101828' }}>More Filters</h2>
            <button
              onClick={onClose}
              style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F2F4F7', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#667085" strokeWidth="2.5" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div style={{ height: '1px', background: '#EAECF0', marginLeft: '-24px', marginRight: '-24px' }} />
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px' }}>
          {selectedCategoryIds.map(id => (
            <SubCategoryCollector key={id} categoryId={id} onChange={handleSubs} />
          ))}

          {/* Online sellers toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
            <div>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#101828', display: 'block', lineHeight: '1.4' }}>Online sellers only</span>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#667085' }}>See who's available right now</span>
            </div>
            <button
              onClick={() => setOnlineOnly(o => !o)}
              role="switch" aria-checked={onlineOnly}
              style={{ width: '52px', height: '28px', borderRadius: '9999px', background: onlineOnly ? BRAND : '#D0D5DD', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0, padding: 0 }}
            >
              <span style={{ display: 'block', position: 'absolute', top: '3px', left: onlineOnly ? '27px' : '3px', width: '22px', height: '22px', borderRadius: '50%', background: '#ffffff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </button>
          </div>

          {/* Category — multi-select */}
          <div style={{ marginBottom: '18px' }}>
            <label style={lbl}>Select Category</label>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setCatOpen(o => !o)}
                style={{
                  width: '100%', textAlign: 'left', fontFamily: 'Poppins, sans-serif', fontSize: '14px',
                  color: '#98A2B3', background: '#ffffff', border: `1px solid ${catOpen ? BRAND : BORDER}`,
                  borderRadius: '9999px', padding: '11px 40px 11px 20px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', boxSizing: 'border-box',
                  boxShadow: catOpen ? '0 0 0 4px rgba(165,74,255,0.12)' : 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              >
                <span>{cats.length === 0 ? 'All categories' : 'Select more...'}</span>
                <svg width="16" height="16" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, position: 'absolute', right: '16px', transform: `rotate(${catOpen ? '180deg' : '0deg'})`, transition: 'transform 0.15s' }}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {catOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                  background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: '12px',
                  boxShadow: '0 4px 8px -2px rgba(16,24,40,.1), 0 2px 4px -2px rgba(16,24,40,.06)',
                  zIndex: 20, maxHeight: '200px', overflowY: 'auto',
                }}>
                  {categories.filter(c => !cats.includes(c.name)).length === 0 ? (
                    <p style={{ padding: '12px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#98A2B3', fontStyle: 'italic' }}>{categories.length === 0 ? 'Loading categories...' : 'All categories selected'}</p>
                  ) : categories.filter(c => !cats.includes(c.name)).map(c => (
                    <button key={c.id} onClick={() => addCat(c.name)}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#344054', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F4EBFF'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >{c.name}</button>
                  ))}
                </div>
              )}
            </div>
            {cats.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {cats.map(c => (
                  <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F4EBFF', border: `1.5px solid ${BRAND}`, borderRadius: '9999px', padding: '4px 8px 4px 12px', fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 500, color: BRAND }}>
                    {c}
                    <button onClick={() => removeCat(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', lineHeight: 0, display: 'flex', alignItems: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" /></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sub-Category — pool driven by selected cats */}
          <div style={{ marginBottom: '18px' }}>
            <label style={lbl}>Select Sub-Category</label>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setSubOpen(o => !o)}
                style={{
                  width: '100%', textAlign: 'left', fontFamily: 'Poppins, sans-serif', fontSize: '14px',
                  color: '#98A2B3', background: '#ffffff', border: `1px solid ${subOpen ? BRAND : BORDER}`,
                  borderRadius: '9999px', padding: '11px 40px 11px 20px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', boxSizing: 'border-box',
                  boxShadow: subOpen ? '0 0 0 4px rgba(165,74,255,0.12)' : 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              >
                <span>{selectedCategoryIds.length === 0 ? 'Select a category first' : 'Select one or multiple'}</span>
                <svg width="16" height="16" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, position: 'absolute', right: '16px', transform: `rotate(${subOpen ? '180deg' : '0deg'})`, transition: 'transform 0.15s' }}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {subOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                  background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: '12px',
                  boxShadow: '0 4px 8px -2px rgba(16,24,40,.1), 0 2px 4px -2px rgba(16,24,40,.06)',
                  zIndex: 10, maxHeight: '180px', overflowY: 'auto',
                }}>
                  {selectedCategoryIds.length === 0 ? (
                    <p style={{ padding: '10px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#98A2B3' }}>Select a category to see sub-categories</p>
                  ) : subPool.filter(s => !subCats.includes(s.id)).length === 0 ? (
                    <p style={{ padding: '10px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#98A2B3' }}>All sub-categories added</p>
                  ) : subPool.filter(s => !subCats.includes(s.id)).map(s => (
                    <button key={s.id} onClick={() => addSub(s.id)}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#344054', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F4EBFF'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >{s.name}</button>
                  ))}
                </div>
              )}
            </div>
            {subCats.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {subCats.map(id => {
                  const sub = subPool.find(s => s.id === id);
                  return (
                  <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F4EBFF', border: `1.5px solid ${BRAND}`, borderRadius: '9999px', padding: '4px 8px 4px 12px', fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 500, color: BRAND }}>
                    {sub?.name ?? `Sub-category ${id}`}
                    <button onClick={() => removeSub(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', lineHeight: 0, display: 'flex', alignItems: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" /></svg>
                    </button>
                  </span>
                  );
                })}
              </div>
            )}
          </div>

          <SelectField label="Sort by relevancy" value={sort} onChange={v => setSort(v as FavorSortOption)}
            options={['Recommended', 'Price: Low to High', 'Price: High to Low', 'Highest Rated', 'Most Reviews']} />

          <SelectField label="Seller type" value={sellerType} onChange={setSellerType}
            options={['Any', 'Pro', 'Team']} />

          <SelectField label="Filter by rating" value={rating} onChange={v => setRating(v as FavorRatingOption)}
            options={['Any rating', 'Upto 4 stars', '4 stars & above', '4.5 stars & above', '5 stars only']} />

          <SelectField label="Budget" value={budget} onChange={v => setBudget(v as FavorBudgetOption)}
            options={['Any', 'Under $50', '$50 – $150', '$150 – $500', '$500+']} />

          {/* Distance — dual-handle range slider */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ ...lbl, marginBottom: 0 }}>Distance</label>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: '#667085' }}>
                {distLow} – {distHigh} mi
              </span>
            </div>
            <DistanceRangeSlider
              low={distLow}
              high={distHigh}
              onChange={(l, h) => { setDistLow(l); setDistHigh(h); }}
            />
          </div>
        </div>

        {/* ── STICKY FOOTER (non-scrolling) ── */}
        <div style={{ flexShrink: 0, background: '#ffffff', borderTop: '1px solid #EAECF0', padding: '16px 24px 24px', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => reset()}
            style={{
              flex: 1, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px',
              color: '#344054', background: '#ffffff', border: `1px solid ${BORDER}`,
              borderRadius: '9999px', padding: '12px 16px', cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(16,24,40,0.05)', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}
          >
            Reset
          </button>
          <button
            onClick={() => { onApply?.(currentFilters()); onClose(); }}
            style={{
              flex: 1, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px',
              color: '#ffffff', background: GRAD, border: 'none',
              borderRadius: '9999px', padding: '12px 16px', cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(16,24,40,0.05)', transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}


