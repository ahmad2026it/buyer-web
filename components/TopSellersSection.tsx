'use client';
import { useRouter } from 'next/navigation';

const SELLERS = [
  { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&auto=format&q=75', name: 'John Doe',    badge: 'Team', rating: '4.8', reviews: '8,890', completedJobs: 387 },
  { image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&auto=format&q=75', name: 'Chris Gale',  badge: 'Pro',  rating: '4.9', reviews: '5,214', completedJobs: 259 },
  { image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&auto=format&q=75', name: 'Olivia Rhye', badge: 'Team', rating: '4.9', reviews: '721',   completedJobs: 198 },
  { image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&auto=format&q=75', name: 'Sam Smith',   badge: 'Pro',  rating: '4.7', reviews: '612',   completedJobs: 174 },
  { image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&auto=format&q=75', name: 'Emma Brown',  badge: 'Pro',  rating: '4.8', reviews: '1,043', completedJobs: 312 },
  { image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=500&fit=crop&auto=format&q=75', name: 'Liam Jones',  badge: 'Team', rating: '4.6', reviews: '893',   completedJobs: 247 },
  { image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&auto=format&q=75', name: 'Sophie Lee',  badge: 'Pro',  rating: '4.9', reviews: '2,107', completedJobs: 431 },
  { image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&auto=format&q=75',   name: 'Ava Davis',   badge: 'Team', rating: '4.7', reviews: '754',   completedJobs: 189 },
];

export default function TopSellersSection() {
  const router = useRouter();
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
          {SELLERS.map((seller, i) => (
            <div key={`${seller.name}-${i}`} data-animate data-delay={String((i % 4) + 1)} onClick={() => router.push(`/seller/${i + 1}`)} style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #EAECF0', cursor: 'pointer', transition: 'border-color 0.2s ease, box-shadow 0.2s ease', overflow: 'hidden' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(165,74,255,0.3)'; el.style.boxShadow = '0 8px 24px rgba(165,74,255,0.1)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#EAECF0'; el.style.boxShadow = 'none'; }}>

              {/* Photo with badge overlay */}
              <div style={{ position: 'relative', padding: '10px 10px 0' }}>
                <div style={{ height: '220px', borderRadius: '14px', overflow: 'hidden', background: '#F8F0FF' }}>
                  <img src={seller.image} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                </div>
                <div style={{ position: 'absolute', top: '20px', right: '20px', background: seller.badge === 'Pro' ? '#A54AFF' : '#344054', borderRadius: '9999px', padding: '4px 12px', fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.03em' }}>
                  {seller.badge}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '14px 16px 18px' }}>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#101828', marginBottom: '6px' }}>{seller.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                  <svg viewBox="0 0 24 24" width="14" height="14"><polygon fill="#F79009" stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#101828' }}>{seller.rating}</span>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#D0D5DD' }}>|</span>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#667085' }}>{seller.reviews} reviews</span>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#D0D5DD' }}>/</span>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#667085' }}>{seller.completedJobs} jobs</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
