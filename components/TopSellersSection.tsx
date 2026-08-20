'use client';
import { useRouter } from 'next/navigation';
import FavorImage, { isUsableImageUrl } from '@/components/FavorImage';
import { useGetBuyerSellersQuery } from '@/app/buyer/store/buyerSellersAPI';
import type { BuyerSeller } from '@/app/buyer/store/buyerSellersTypes';

const MAX_SELLERS = 6;

function sellerBadge(isPro?: boolean, isTeam?: boolean): string {
  if (isPro) return 'Pro';
  if (isTeam) return 'Team';
  return '';
}

function sellerId(seller: BuyerSeller): number | null {
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

function SellerCardSkeleton() {
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

export default function TopSellersSection() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGetBuyerSellersQuery();
  const sellers = (data?.data?.sellers ?? []).slice(0, MAX_SELLERS);

  return (
    <section style={{ padding: '96px 0', background: '#F8F0FF', position: 'relative', overflow: 'hidden', borderRadius: '50px' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(rgba(165,74,255,0.08) 1px,transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px' }}>
          <div>
            <p data-animate="fade" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#A54AFF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Our Providers</p>
            <h2 data-animate style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '36px', lineHeight: '1.2', color: '#101828', letterSpacing: '-0.01em' }}>
              Top Sellers on{' '}
              <span style={{ background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>WhoCan</span>
            </h2>
            <p data-animate data-delay="1" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#475467', marginTop: '8px' }}>Hire the top talent from our amazing pool of sellers.</p>
          </div>
          <a href="/explore" data-animate="fade" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#A54AFF', padding: '10px 20px', borderRadius: '9999px', border: '1.5px solid #A54AFF', background: '#ffffff', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8F0FF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}>
            View All Sellers
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#A54AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
            {Array.from({ length: MAX_SELLERS }, (_, i) => <SellerCardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div style={{ background: '#ffffff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: '#101828', margin: '0 0 8px' }}>Could not load sellers</h3>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#667085', margin: '0 0 16px' }}>Please try again in a moment.</p>
            <button
              type="button"
              onClick={() => { void refetch(); }}
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, color: '#A54AFF', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        ) : sellers.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: '#101828', margin: '0 0 8px' }}>No sellers yet</h3>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#667085', margin: 0 }}>Check back soon — top providers will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
            {sellers.map((seller, i) => {
              const id = sellerId(seller);
              const name = sellerName(seller);
              const badge = sellerBadge(seller.isPro, seller.isTeam);
              const rating = formatRating(seller.averageRating);
              const reviews = Number(seller.totalReviews ?? seller.reviewCount ?? 0).toLocaleString();
              const jobs = Number(seller.favorsCompleted ?? 0).toLocaleString();

              return (
                <div
                  key={id ?? `${name}-${i}`}
                  data-animate
                  data-delay={String((i % 4) + 1)}
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
            })}
          </div>
        )}
      </div>
    </section>
  );
}
