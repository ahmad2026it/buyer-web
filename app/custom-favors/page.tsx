'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import FavorImage, { pickFavorImage } from '@/components/FavorImage';
import {
  BUYER_CUSTOM_FAVORS_LIST_PARAMS,
  useDeleteBuyerCustomFavorMutation,
  useGetBuyerCustomFavorsQuery,
} from '@/app/buyer/store/buyerCustomFavorsAPI';
import {
  formatCustomFavorBudget,
  formatCustomFavorCategory,
  formatCustomFavorDueDate,
  getCustomFavorHires,
  getCustomFavorRequestCount,
  getCustomFavorSellersRequired,
  resolveCustomFavorStatus,
  type BuyerCustomFavor,
  type BuyerCustomFavorOfferStatus,
  type CustomFavorListStatus,
} from '@/app/buyer/store/buyerCustomFavorsTypes';
import { useAppSelector } from '@/store/hooks';
import { confirmDelete } from '@/lib/swal';
import { showToast } from '@/lib/toast';

const BRAND = '#A54AFF';
const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const PILL  = '9999px';
const FONT  = 'Poppins, sans-serif';

type CustomFavorCard = {
  id: number;
  title: string;
  category: string;
  budget: string;
  dueDate: string;
  requests: number;
  hires: number;
  sellersRequired: number;
  status: CustomFavorListStatus;
  image: string | null;
};

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Completed: { bg: '#ECFDF3', color: '#079455', border: '#A9EFC5' },
  Expired:   { bg: '#F2F4F7', color: '#667085', border: '#EAECF0' },
  Cancelled: { bg: '#FEF3F2', color: '#D92D20', border: '#FECDCA' },
};

function toCustomFavorCard(favor: BuyerCustomFavor): CustomFavorCard {
  return {
    id: favor.id,
    title: favor.title,
    category: formatCustomFavorCategory(favor.type),
    budget: formatCustomFavorBudget(favor.budget),
    dueDate: formatCustomFavorDueDate(favor.dateTime),
    requests: getCustomFavorRequestCount(favor),
    hires: getCustomFavorHires(favor),
    sellersRequired: getCustomFavorSellersRequired(favor),
    status: resolveCustomFavorStatus(favor),
    image: pickFavorImage(favor.images),
  };
}

function FavorActionsMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1.5px solid #EAECF0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill="#667085"/><circle cx="12" cy="12" r="1.5" fill="#667085"/><circle cx="12" cy="19" r="1.5" fill="#667085"/></svg>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: 36, right: 0, background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 12, padding: 6, minWidth: 160, boxShadow: '0 8px 24px rgba(16,24,40,0.12)', zIndex: 10 }}>
            <button
              onClick={() => { setOpen(false); onEdit(); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#344054', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 8 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
            >
              Edit
            </button>
            <button
              onClick={() => { setOpen(false); onDelete(); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#D92D20', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 8 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF3F2'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ActiveFavorCard({
  favor,
  onEdit,
  onDelete,
}: {
  favor: CustomFavorCard;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 16px 14px' }}>
        <div style={{ width: 80, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid #EAECF0' }}>
          <FavorImage src={favor.image} alt={favor.title} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: '#101828', marginBottom: 4, lineHeight: 1.35 }}>
            {favor.title}
          </p>
          <p style={{ fontFamily: FONT, fontSize: 13, color: '#667085', marginBottom: 8 }}>
            Category: <span style={{ color: '#344054', fontWeight: 500 }}>{favor.category}</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: BRAND }}>{favor.budget}</span>
            <span style={{ fontFamily: FONT, fontSize: 13, color: '#667085' }}>
              Favor due: <span style={{ color: '#DC6803', fontWeight: 600 }}>{favor.dueDate}</span>
            </span>
          </div>
        </div>
        <FavorActionsMenu onEdit={onEdit} onDelete={onDelete} />
      </div>

      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 6, background: '#F2F4F7', borderRadius: PILL, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min((favor.hires / favor.sellersRequired) * 100, 100)}%`, background: isFull ? '#079455' : BRAND, borderRadius: PILL, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: isFull ? '#079455' : '#667085', flexShrink: 0 }}>
          {isFull ? 'Seats full' : `${favor.hires}/${favor.sellersRequired} hired`}
        </span>
      </div>

      <div style={{ height: 1, background: '#F2F4F7' }} />

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

function HistoryFavorCard({ favor }: { favor: CustomFavorCard }) {
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
        <div style={{ width: 80, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid #EAECF0' }}>
          <FavorImage src={favor.image} alt={favor.title} />
        </div>
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
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 20, color: '#98A2B3' }}>{favor.budget}</span>
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

function FavorCardSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #EAECF0', overflow: 'hidden', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 80, height: 72, borderRadius: 10, background: '#F2F4F7', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: '70%', height: 16, borderRadius: 4, background: '#F2F4F7', marginBottom: 10 }} />
          <div style={{ width: '40%', height: 12, borderRadius: 4, background: '#F2F4F7', marginBottom: 12 }} />
          <div style={{ width: 64, height: 18, borderRadius: 4, background: '#F2F4F7' }} />
        </div>
      </div>
    </div>
  );
}

export default function CustomFavorsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<BuyerCustomFavorOfferStatus>('active');
  const [pages, setPages] = useState<Record<BuyerCustomFavorOfferStatus, number>>({
    active: 1,
    history: 1,
  });
  const [authOpen, setAuthOpen] = useState(false);
  const token = useAppSelector((state) => state.auth.token);
  const skip = !token;
  const page = pages[tab];
  const [deleteCustomFavor] = useDeleteBuyerCustomFavorMutation();

  const activeQuery = useGetBuyerCustomFavorsQuery(
    { status: 'active', page: tab === 'active' ? page : 1, limit: BUYER_CUSTOM_FAVORS_LIST_PARAMS.limit },
    { skip },
  );
  const historyQuery = useGetBuyerCustomFavorsQuery(
    { status: 'history', page: tab === 'history' ? page : 1, limit: BUYER_CUSTOM_FAVORS_LIST_PARAMS.limit },
    { skip },
  );

  const currentQuery = tab === 'active' ? activeQuery : historyQuery;
  const { data, isLoading, isFetching, isError, refetch } = currentQuery;

  const favors = useMemo(
    () => (data?.data?.offers ?? []).map(toCustomFavorCard),
    [data],
  );
  const activeCount = activeQuery.data?.data?.pagination?.total ?? 0;
  const pagination = data?.data?.pagination;
  const hasMore = pagination ? favors.length < pagination.total : false;
  const isActive = tab === 'active';

  const openCreate = () => {
    if (skip) {
      setAuthOpen(true);
      return;
    }
    router.push('/custom-favors/new');
  };

  const switchTab = (next: BuyerCustomFavorOfferStatus) => {
    setTab(next);
  };

  const loadMore = () => {
    setPages((current) => ({ ...current, [tab]: current[tab] + 1 }));
  };

  const handleDeleteFavor = async (favor: CustomFavorCard) => {
    const confirmed = await confirmDelete(favor.title, {
      title: 'Delete custom favor?',
      entity: 'this custom favor',
    });
    if (!confirmed) return;
    try {
      const response = await deleteCustomFavor(favor.id).unwrap();
      showToast(response.message || 'Custom favor deleted.', 'success');
    } catch {
      // axios interceptor already toasts API errors
    }
  };

  return (
    <>
      <Navbar />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Sign in to view and manage your custom favors."
        />
      )}
      <main style={{ minHeight: '100vh', background: '#FAFAFA' }}>
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
                onClick={openCreate}
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

            <div style={{ display: 'flex', gap: 4, marginTop: 24, borderBottom: '2px solid #EAECF0', paddingBottom: 0 }}>
              {(['active', 'history'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
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
                  {t === 'active' && activeCount > 0 && (
                    <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, borderRadius: PILL, background: tab === 'active' ? BRAND : '#EAECF0', color: tab === 'active' ? '#fff' : '#667085', fontSize: 11, fontWeight: 700, padding: '0 6px' }}>
                      {activeCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 24px 80px' }}>
          {skip ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <p style={{ fontFamily: FONT, fontSize: 15, color: '#667085', marginBottom: 20 }}>
                Sign in to see your custom favors.
              </p>
              <button
                onClick={() => setAuthOpen(true)}
                style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '12px 24px', cursor: 'pointer' }}
              >
                Sign in
              </button>
            </div>
          ) : isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[0, 1, 2].map((key) => <FavorCardSkeleton key={key} />)}
            </div>
          ) : isError ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <p style={{ fontFamily: FONT, fontSize: 15, color: '#667085', marginBottom: 20 }}>
                Couldn’t load your custom favors. Please try again.
              </p>
              <button
                onClick={() => { void refetch(); }}
                style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '12px 24px', cursor: 'pointer' }}
              >
                Retry
              </button>
            </div>
          ) : favors.length === 0 ? (
            isActive ? (
              <EmptyState onCreate={openCreate} />
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <p style={{ fontFamily: FONT, fontSize: 15, color: '#98A2B3' }}>No history yet.</p>
              </div>
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {favors.map((favor) =>
                isActive
                  ? (
                    <ActiveFavorCard
                      key={favor.id}
                      favor={favor}
                      onEdit={() => router.push(`/custom-favors/new?id=${favor.id}`)}
                      onDelete={() => { void handleDeleteFavor(favor); }}
                    />
                  )
                  : <HistoryFavorCard key={favor.id} favor={favor} />,
              )}
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={isFetching}
                  style={{
                    marginTop: 8, fontFamily: FONT, fontWeight: 700, fontSize: 14,
                    color: BRAND, background: '#fff', border: `1.5px solid ${BRAND}`,
                    borderRadius: PILL, padding: '12px 20px', cursor: isFetching ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isFetching ? 'Loading…' : 'Load more'}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
