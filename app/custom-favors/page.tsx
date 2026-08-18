'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BRAND = '#A54AFF';
const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const PILL  = '9999px';
const FONT  = 'Poppins, sans-serif';

interface CustomFavor {
  id: string;
  title: string;
  category: string;
  budget: number;
  dueDate: string;
  requests: number;
  hires: number;
  sellersRequired: number;
  status: 'Active' | 'Completed' | 'Expired' | 'Cancelled';
  image: string;
}

const ACTIVE_FAVORS: CustomFavor[] = [
  {
    id: '1',
    title: 'I need a car wash at my doorsteps',
    category: 'Cleaning',
    budget: 200,
    dueDate: 'Jan 2, 2025',
    requests: 2,
    hires: 1,
    sellersRequired: 2,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=160&h=160&fit=crop&auto=format&q=75',
  },
  {
    id: '2',
    title: 'I need a deep clean of my kitchen',
    category: 'Cleaning',
    budget: 200,
    dueDate: 'Jan 2, 2025',
    requests: 0,
    hires: 0,
    sellersRequired: 1,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1527515637462-cff94ebb8b4c?w=160&h=160&fit=crop&auto=format&q=75',
  },
  {
    id: '3',
    title: 'Need someone to assemble IKEA furniture',
    category: 'Assembly',
    budget: 120,
    dueDate: 'Jan 10, 2025',
    requests: 5,
    hires: 3,
    sellersRequired: 3,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=160&h=160&fit=crop&auto=format&q=75',
  },
];

const HISTORY_FAVORS: CustomFavor[] = [
  {
    id: '4',
    title: 'Fix the leaking pipe in my kitchen',
    category: 'Plumbing',
    budget: 350,
    dueDate: 'Dec 5, 2024',
    requests: 3,
    hires: 1,
    sellersRequired: 1,
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=160&h=160&fit=crop&auto=format&q=75',
  },
  {
    id: '5',
    title: 'Paint the living room walls',
    category: 'Painting',
    budget: 500,
    dueDate: 'Nov 20, 2024',
    requests: 1,
    hires: 0,
    sellersRequired: 2,
    status: 'Expired',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=160&h=160&fit=crop&auto=format&q=75',
  },
];

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Completed: { bg: '#ECFDF3', color: '#079455', border: '#A9EFC5' },
  Expired:   { bg: '#F2F4F7', color: '#667085', border: '#EAECF0' },
  Cancelled: { bg: '#FEF3F2', color: '#D92D20', border: '#FECDCA' },
};

function ActiveFavorCard({ favor }: { favor: CustomFavor }) {
  const router = useRouter();
  const hasRequests = favor.requests > 0;
  const isFull = favor.hires >= favor.sellersRequired;

  return (
    <div
      onClick={() => router.push(`/custom-favors/${favor.id}`)}
      style={{
        background: '#fff', borderRadius: 16, border: '1.5px solid #EAECF0',
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
        cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = BRAND; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(165,74,255,0.1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EAECF0'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(16,24,40,0.04)'; }}
    >
      {/* Info row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 16px 14px' }}>
        <img
          src={favor.image} alt={favor.title}
          style={{ width: 80, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid #EAECF0' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: '#101828', marginBottom: 4, lineHeight: 1.35 }}>
            {favor.title}
          </p>
          <p style={{ fontFamily: FONT, fontSize: 13, color: '#667085', marginBottom: 8 }}>
            Category: <span style={{ color: '#344054', fontWeight: 500 }}>{favor.category}</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: BRAND }}>${favor.budget}</span>
            <span style={{ fontFamily: FONT, fontSize: 13, color: '#667085' }}>
              Favor due: <span style={{ color: '#DC6803', fontWeight: 600 }}>{favor.dueDate}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Hires progress */}
      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 6, background: '#F2F4F7', borderRadius: PILL, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min((favor.hires / favor.sellersRequired) * 100, 100)}%`, background: isFull ? '#079455' : BRAND, borderRadius: PILL, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: isFull ? '#079455' : '#667085', flexShrink: 0 }}>
          {isFull ? 'Seats full' : `${favor.hires}/${favor.sellersRequired} hired`}
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#F2F4F7' }} />

      {/* CTA button */}
      <div style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => router.push(`/custom-favors/${favor.id}`)}
          style={{
            width: '100%', fontFamily: FONT, fontWeight: 700, fontSize: 15,
            color: hasRequests ? '#6941C6' : '#667085',
            background: hasRequests ? 'rgba(165,74,255,0.12)' : 'transparent',
            border: hasRequests ? 'none' : '1.5px solid #D0D5DD',
            borderRadius: PILL, padding: '13px 20px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        >
          {hasRequests ? (
            <>
              See requests
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 22, height: 22, borderRadius: PILL, padding: '0 6px',
                background: '#D92D20', color: '#fff',
                fontFamily: FONT, fontWeight: 700, fontSize: 12,
              }}>
                {favor.requests}
              </span>
            </>
          ) : (
            '0 requests'
          )}
        </button>
      </div>
    </div>
  );
}

function HistoryFavorCard({ favor }: { favor: CustomFavor }) {
  const router = useRouter();
  const s = STATUS_COLORS[favor.status] || STATUS_COLORS.Expired;

  return (
    <div
      onClick={() => router.push(`/custom-favors/${favor.id}`)}
      style={{
        background: '#fff', borderRadius: 16, border: '1.5px solid #EAECF0',
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
        cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(16,24,40,0.08)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EAECF0'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(16,24,40,0.04)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px' }}>
        <img
          src={favor.image} alt={favor.title}
          style={{ width: 80, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid #EAECF0' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: '#101828', lineHeight: 1.35, margin: 0, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {favor.title}
            </p>
            <span style={{
              fontFamily: FONT, fontSize: 12, fontWeight: 600,
              color: s.color, background: s.bg, border: `1px solid ${s.border}`,
              borderRadius: PILL, padding: '2px 10px', flexShrink: 0,
            }}>
              {favor.status}
            </span>
          </div>
          <p style={{ fontFamily: FONT, fontSize: 13, color: '#667085', marginBottom: 8 }}>
            Category: <span style={{ color: '#344054', fontWeight: 500 }}>{favor.category}</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 20, color: '#98A2B3' }}>${favor.budget}</span>
            <span style={{ fontFamily: FONT, fontSize: 13, color: '#667085' }}>
              Due: <span style={{ fontWeight: 500 }}>{favor.dueDate}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F4EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, color: '#101828', marginBottom: 10 }}>No custom favors yet</h3>
      <p style={{ fontFamily: FONT, fontSize: 15, color: '#667085', marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
        Post a task and let sellers come to you with their offers.
      </p>
      <button
        onClick={onCreate}
        style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '13px 32px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(165,74,255,0.3)', transition: 'opacity 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
      >
        Create your first favor
      </button>
    </div>
  );
}

export default function CustomFavorsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'active' | 'history'>('active');

  const isActive = tab === 'active';

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#FAFAFA' }}>

        {/* Header band */}
        <div style={{ background: '#fff', borderBottom: '1px solid #EAECF0', paddingTop: 104, paddingBottom: 28 }}>
          <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 28, color: '#101828', lineHeight: 1.2, marginBottom: 6 }}>
                  My Custom Favors
                </h1>
                <p style={{ fontFamily: FONT, fontSize: 15, color: '#667085' }}>
                  Post tasks and let sellers apply — you pick who does the job.
                </p>
              </div>
              <button
                onClick={() => router.push('/custom-favors/new')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '12px 22px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(165,74,255,0.28)', transition: 'opacity 0.15s', whiteSpace: 'nowrap', flexShrink: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Create New Favor
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginTop: 24, borderBottom: '2px solid #EAECF0', paddingBottom: 0 }}>
              {(['active', 'history'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    fontFamily: FONT, fontWeight: 600, fontSize: 14,
                    color: tab === t ? BRAND : '#667085',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '10px 20px',
                    borderBottom: `2px solid ${tab === t ? BRAND : 'transparent'}`,
                    marginBottom: -2,
                    textTransform: 'capitalize',
                    transition: 'color 0.15s',
                  }}
                >
                  {t === 'active' ? 'Active' : 'History'}
                  {t === 'active' && ACTIVE_FAVORS.length > 0 && (
                    <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, borderRadius: PILL, background: tab === 'active' ? BRAND : '#EAECF0', color: tab === 'active' ? '#fff' : '#667085', fontSize: 11, fontWeight: 700, padding: '0 6px' }}>
                      {ACTIVE_FAVORS.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 24px 80px' }}>
          {isActive ? (
            ACTIVE_FAVORS.length === 0 ? (
              <EmptyState onCreate={() => router.push('/custom-favors/new')} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {ACTIVE_FAVORS.map(f => <ActiveFavorCard key={f.id} favor={f} />)}
              </div>
            )
          ) : (
            HISTORY_FAVORS.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <p style={{ fontFamily: FONT, fontSize: 15, color: '#98A2B3' }}>No history yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {HISTORY_FAVORS.map(f => <HistoryFavorCard key={f.id} favor={f} />)}
              </div>
            )
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
