'use client';
import { useRouter } from 'next/navigation';
import FavorImage, { isUsableImageUrl } from '@/components/FavorImage';
import type { BuyerSeller } from '@/app/buyer/store/buyerSellersTypes';

function sellerBadge(isPro?: boolean, isTeam?: boolean): string {
  if (isPro) return 'Pro';
  if (isTeam) return 'Team';
  return '';
}

export function sellerId(seller: BuyerSeller): number | null {
  const id = Number(seller.sellerId ?? seller.id);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function sellerName(seller: BuyerSeller): string {
  return seller.name?.trim() || seller.fullName?.trim() || 'Seller';
}

function sellerImage(seller: BuyerSeller): string | null {
  const src = seller.profileImageUrl || seller.profileImage;
  return isUsableImageUrl(src) ? src : null;
}

function formatRating(value?: number | null): string {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return Number(value).toFixed(1);
}

export function SellerCardSkeleton() {
  return (
    <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #EAECF0', overflow: 'hidden' }}>
      <div style={{ padding: '10px 10px 0' }}>
        <div style={{ height: '220px', borderRadius: '14px', background: '#F2F4F7' }} />
      </div>
      <div style={{ padding: '14px 16px 18px' }}>
        <div style={{ width: '58%', height: 16, borderRadius: 4, background: '#F2F4F7', marginBottom: 10 }} />
        <div style={{ width: '78%', height: 12, borderRadius: 4, background: '#F2F4F7' }} />
      </div>
    </div>
  );
}

export default function SellerListingCard({
  seller,
  delay,
}: {
  seller: BuyerSeller;
  delay?: number;
}) {
  const router = useRouter();
  const id = sellerId(seller);
  const name = sellerName(seller);
  const badge = sellerBadge(seller.isPro, seller.isTeam);
  const rating = formatRating(seller.averageRating);
  const reviews = Number(seller.totalReviews ?? seller.reviewCount ?? 0).toLocaleString();
  const jobs = Number(seller.favorsCompleted ?? 0).toLocaleString();

  return (
    <div
      data-animate
      data-delay={delay != null ? String(delay) : undefined}
      onClick={() => { if (id) router.push(`/seller/${id}`); }}
      style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #EAECF0', cursor: id ? 'pointer' : 'default', transition: 'border-color 0.2s ease, box-shadow 0.2s ease', overflow: 'hidden' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(165,74,255,0.3)'; el.style.boxShadow = '0 8px 24px rgba(165,74,255,0.1)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#EAECF0'; el.style.boxShadow = 'none'; }}
    >
      <div style={{ position: 'relative', padding: '10px 10px 0' }}>
        <div style={{ height: '220px', borderRadius: '14px', overflow: 'hidden', background: '#F8F0FF' }}>
          <FavorImage src={sellerImage(seller)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        </div>
        {badge ? (
          <div style={{ position: 'absolute', top: '20px', right: '20px', background: badge === 'Pro' ? '#A54AFF' : '#344054', borderRadius: '9999px', padding: '4px 12px', fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.03em' }}>
            {badge}
          </div>
        ) : null}
      </div>

      <div style={{ padding: '14px 16px 18px' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#101828', marginBottom: '6px' }}>{name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          <svg viewBox="0 0 24 24" width="14" height="14"><polygon fill="#F79009" stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#101828' }}>{rating}</span>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#D0D5DD' }}>|</span>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#667085' }}>{reviews} reviews</span>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#D0D5DD' }}>/</span>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#667085' }}>{jobs} jobs</span>
        </div>
      </div>
    </div>
  );
}
