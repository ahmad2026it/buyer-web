'use client';
import { useRouter } from 'next/navigation';
import { useGetBuyerCategoriesQuery, useGetBuyerSubCategoriesQuery } from '@/app/buyer/store/buyerCategoriesAPI';
import type { BuyerCategory } from '@/app/buyer/store/buyerCategoriesTypes';
import { ArrowRightIcon } from './Icons';

const S1 = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=220&h=220&fit=crop&auto=format';
const S2 = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=220&h=220&fit=crop&auto=format';
const S3 = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=220&h=220&fit=crop&auto=format';
const S4 = 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=220&h=220&fit=crop&auto=format';

const LIFESTYLE = [
  { src: S1, alt: 'Cleaning service' },
  { src: S2, alt: 'Electrical work' },
  { src: S3, alt: 'Gardening service' },
  { src: S4, alt: 'Plumbing service' },
];

type AvatarItem = { type: 'avatar'; src: string; alt: string };
type PillItem = {
  type: 'pill';
  category: BuyerCategory;
  iconBg: string;
};
type RowItem = AvatarItem | PillItem;

const SIZE = 110;
const GAP = 16;

function withAlpha(hex: string, alpha: number): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return `rgba(165, 74, 255, ${alpha})`;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return `rgba(165, 74, 255, ${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatSubCount(count: number): string {
  return count === 1 ? '1 sub-category' : `${count} sub-categories`;
}

function toPill(category: BuyerCategory): PillItem {
  return {
    type: 'pill',
    category,
    iconBg: withAlpha(category.colorCode || '#A54AFF', 0.14),
  };
}

function interleave(pills: PillItem[], avatarOffset: number): RowItem[] {
  const items: RowItem[] = [];
  pills.forEach((pill, i) => {
    items.push(pill);
    const photo = LIFESTYLE[(avatarOffset + i) % LIFESTYLE.length];
    items.push({ type: 'avatar', src: photo.src, alt: photo.alt });
  });
  return items;
}

function AvatarEl({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ width: SIZE, height: SIZE, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '3px solid rgba(165,74,255,0.25)', boxShadow: '0 4px 16px rgba(165,74,255,0.2)' }}>
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
    </div>
  );
}

function PillEl({ category, iconBg, onClick }: { category: BuyerCategory; iconBg: string; onClick?: () => void }) {
  const { data } = useGetBuyerSubCategoriesQuery(category.id);
  const count = data?.data?.subCategories?.length;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      style={{ height: SIZE, minWidth: 240, borderRadius: 9999, background: '#ffffff', border: '2px solid rgba(165,74,255,0.2)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px 0 18px', flexShrink: 0, cursor: 'pointer', boxShadow: '0 4px 16px rgba(165,74,255,0.08)', transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(165,74,255,0.5)'; el.style.boxShadow = '0 8px 24px rgba(165,74,255,0.18)'; el.style.transform = 'scale(1.03)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(165,74,255,0.2)'; el.style.boxShadow = '0 4px 16px rgba(165,74,255,0.08)'; el.style.transform = 'scale(1)'; }}
    >
      <div style={{ width: 58, height: 58, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
        <img
          src={category.icon}
          alt=""
          style={{ width: 30, height: 30, objectFit: 'contain' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#101828', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{category.name}</p>
        {count != null && (
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: '#667085', marginTop: 3, whiteSpace: 'nowrap' }}>{formatSubCount(count)}</p>
        )}
      </div>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <ArrowRightIcon size={14} color="#ffffff" />
      </div>
    </div>
  );
}

function SkeletonPill() {
  return (
    <div style={{ height: SIZE, minWidth: 240, borderRadius: 9999, background: '#ffffff', border: '2px solid rgba(165,74,255,0.12)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px 0 18px', flexShrink: 0 }}>
      <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#F0E8FF', flexShrink: 0 }} />
      <div style={{ width: 96, height: 14, borderRadius: 8, background: '#EEE6F8' }} />
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E8DAFF', marginLeft: 'auto', flexShrink: 0 }} />
    </div>
  );
}

function renderItem(item: RowItem, key: string, onPillClick?: (label: string) => void) {
  if (item.type === 'avatar') return <AvatarEl key={key} src={item.src} alt={item.alt} />;
  return <PillEl key={key} category={item.category} iconBg={item.iconBg} onClick={() => onPillClick?.(item.category.name)} />;
}

export default function CategoriesSection() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetBuyerCategoriesQuery({ search: '' });
  const categories = data?.data?.categories ?? [];

  const goTo = (label: string) => router.push(`/explore/search?category=${encodeURIComponent(label)}`);

  const mid = Math.ceil(categories.length / 2);
  const row1 = interleave(categories.slice(0, mid).map(toPill), 0);
  const row2 = interleave(categories.slice(mid).map(toPill), 2);
  const doubled1 = row1.length ? [...row1, ...row1] : [];
  const doubled2 = row2.length ? [...row2, ...row2] : [];

  const pause  = (e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.animationPlayState = 'paused');
  const resume = (e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.animationPlayState = 'running');

  return (
    <section style={{ background: '#F8F0FF', padding: '56px 0', position: 'relative', borderRadius: '50px' }}>
      <style>{`
        @keyframes marqueeL {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeR {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(165,74,255,0.25), transparent)' }} />

      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }} className="rs-section-head">
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#A54AFF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Browse by Category</p>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '32px', color: '#101828', lineHeight: '1.2', letterSpacing: '-0.01em', margin: 0 }}>Explore Categories</h2>
          </div>
          <button
            onClick={() => router.push('/categories')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#ffffff', background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)', border: 'none', borderRadius: '9999px', padding: '11px 24px', cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            Explore All
            <ArrowRightIcon size={16} color="#ffffff" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ overflow: 'hidden', paddingTop: '10px', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', gap: GAP, width: 'max-content', paddingLeft: '24px' }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonPill key={i} />)}
          </div>
        </div>
      ) : isError || categories.length === 0 ? (
        <div className="container">
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: '#667085', margin: 0 }}>
            {isError ? 'Unable to load categories right now.' : 'No categories available yet.'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ overflow: 'hidden', paddingTop: '10px', paddingBottom: '10px', marginBottom: doubled2.length ? `${GAP}px` : 0 }}>
            <div
              style={{ display: 'flex', gap: GAP, width: 'max-content', paddingLeft: '24px', animation: 'marqueeL 28s linear infinite', willChange: 'transform' }}
              onMouseEnter={pause}
              onMouseLeave={resume}
            >
              {doubled1.map((item, i) => renderItem(item, `r1-${i}`, goTo))}
            </div>
          </div>

          {doubled2.length > 0 && (
            <div style={{ overflow: 'hidden', paddingTop: '10px', paddingBottom: '10px' }}>
              <div
                style={{ display: 'flex', gap: GAP, width: 'max-content', paddingLeft: '24px', animation: 'marqueeR 34s linear infinite', willChange: 'transform' }}
                onMouseEnter={pause}
                onMouseLeave={resume}
              >
                {doubled2.map((item, i) => renderItem(item, `r2-${i}`, goTo))}
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(165,74,255,0.2), transparent)' }} />
    </section>
  );
}
