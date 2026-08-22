'use client';
import Link from 'next/link';
import SellerListingCard, { SellerCardSkeleton } from '@/components/SellerListingCard';
import { useGetBuyerSellersQuery } from '@/app/buyer/store/buyerSellersAPI';

const MAX_SELLERS = 6;

export default function TopSellersSection() {
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
          <Link href="/explore/sellers" data-animate="fade" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#A54AFF', padding: '10px 20px', borderRadius: '9999px', border: '1.5px solid #A54AFF', background: '#ffffff', transition: 'all 0.2s ease', whiteSpace: 'nowrap', textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8F0FF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}>
            View All Sellers
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#A54AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
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
            {sellers.map((seller, i) => (
              <SellerListingCard
                key={seller.sellerId ?? seller.id ?? `${seller.name}-${i}`}
                seller={seller}
                delay={(i % 4) + 1}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
