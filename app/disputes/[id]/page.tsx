'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import DisputeSupportChat from '@/components/DisputeSupportChat';
import { useGetBuyerBookingReportsQuery } from '@/app/buyer/store/buyerBookingsAPI';
import {
  formatBuyerReportDate,
  formatBuyerReportReason,
  formatBuyerReportStatusLabel,
  getBuyerReportDueDate,
  isClosedBuyerReportStatus,
  type BuyerBookingReport,
} from '@/app/buyer/store/buyerBookingsTypes';
import { useAppSelector } from '@/store/hooks';
import FavorImage from '@/components/FavorImage';

const BRAND = '#A54AFF';
const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const PILL  = '9999px';
const FONT  = 'Poppins, sans-serif';
const PAGE_SIZE = 50;

function formatCategory(type?: string | null): string {
  if (!type) return 'Service';
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/[_-]/g, ' ');
}

function formatPrice(value?: string | number | null): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '$0.00';
  return `$${n.toFixed(2)}`;
}

function findReport(
  id: string | undefined,
  ...groups: Array<BuyerBookingReport[] | undefined>
): BuyerBookingReport | undefined {
  if (!id) return undefined;
  for (const group of groups) {
    const match = group?.find((item) => String(item.id) === id || String(item.ticketNo) === id);
    if (match) return match;
  }
  return undefined;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontFamily: FONT, fontSize: '13px', fontWeight: 600, color: '#344054', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 80px' }}>
      <div style={{ background: '#ffffff', borderRadius: 20, border: '1.5px solid #EAECF0', overflow: 'hidden' }}>
        <div style={{ padding: 24, borderBottom: '1px solid #F2F4F7', display: 'flex', gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: 12, background: '#F2F4F7' }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '60%', height: 16, borderRadius: 4, background: '#F2F4F7', marginBottom: 10 }} />
            <div style={{ width: '30%', height: 13, borderRadius: 4, background: '#F2F4F7' }} />
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ width: 90, height: 12, borderRadius: 4, background: '#F2F4F7', marginBottom: 10 }} />
          <div style={{ width: '40%', height: 15, borderRadius: 4, background: '#F2F4F7', marginBottom: 24 }} />
          <div style={{ width: 70, height: 12, borderRadius: 4, background: '#F2F4F7', marginBottom: 10 }} />
          <div style={{ width: '80%', height: 15, borderRadius: 4, background: '#F2F4F7' }} />
        </div>
      </div>
    </div>
  );
}

function DisputeDetailPageInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authOpen, setAuthOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const token = useAppSelector((state) => state.auth.token);
  const skip = !token;

  useEffect(() => {
    const chatParam = searchParams.get('chat');
    if (chatParam && chatParam !== '0' && chatParam !== 'false') {
      setChatOpen(true);
    }
  }, [searchParams]);

  const openQuery = useGetBuyerBookingReportsQuery(
    { page: 1, limit: PAGE_SIZE, status: 'open' },
    { skip },
  );
  const closedQuery = useGetBuyerBookingReportsQuery(
    { page: 1, limit: PAGE_SIZE, status: 'closed' },
    { skip },
  );

  const dispute = useMemo(
    () => findReport(id, openQuery.data?.data?.reports, closedQuery.data?.data?.reports),
    [closedQuery.data, id, openQuery.data],
  );

  const isLoading = openQuery.isLoading || closedQuery.isLoading;
  const isError = openQuery.isError && closedQuery.isError;
  const isClosed = dispute ? isClosedBuyerReportStatus(dispute.status) : false;
  const statusLabel = dispute ? formatBuyerReportStatusLabel(dispute.status) : 'Pending';
  const evidence = [...(dispute?.images ?? []), ...(dispute?.videos ?? [])];

  return (
    <>
      <Navbar />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Log in to view this dispute ticket."
        />
      )}
      <main className="app-page" style={{ minHeight: '100dvh', background: '#FAFAFA' }}>

        <div className="app-page-band" style={{ background: '#ffffff', borderBottom: '1px solid #EAECF0', paddingTop: '104px', paddingBottom: '28px' }}>
          <div className="app-page-inner" style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
            <button
              onClick={() => router.push('/disputes')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: '13px', fontWeight: 500, color: '#667085', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 16, transition: 'color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = BRAND; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#667085'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Dispute Center
            </button>

            <div className="app-page-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h1 className="app-page-title" style={{ fontFamily: FONT, fontWeight: 800, fontSize: '26px', color: '#101828', lineHeight: '1.2', marginBottom: 4 }}>
                  {dispute ? `Ticket #${dispute.ticketNo}` : isLoading ? 'Loading ticket' : 'Ticket'}
                </h1>
                {dispute && (
                  <p style={{ fontFamily: FONT, fontSize: '14px', color: '#667085' }}>
                    Created {formatBuyerReportDate(dispute.createdAt)} &nbsp;·&nbsp; Due {getBuyerReportDueDate(dispute.createdAt)}
                  </p>
                )}
              </div>
              {dispute && (
                <span style={{
                  fontFamily: FONT, fontSize: '13px', fontWeight: 600,
                  color: isClosed ? '#667085' : '#DC6803',
                  background: isClosed ? '#F2F4F7' : '#FFFAEB',
                  border: `1px solid ${isClosed ? '#EAECF0' : '#FEDF89'}`,
                  borderRadius: PILL, padding: '6px 16px',
                }}>
                  {statusLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {skip ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>Log in to view this dispute</h3>
            <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', maxWidth: 320, lineHeight: 1.65, marginBottom: 20 }}>
              Sign in to see the ticket details and submitted evidence.
            </p>
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '11px 22px', cursor: 'pointer' }}
            >
              Log in
            </button>
          </div>
        ) : isLoading ? (
          <DetailSkeleton />
        ) : isError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>Could not load this dispute</h3>
            <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', maxWidth: 320, lineHeight: 1.65, marginBottom: 16 }}>
              Please try again in a moment.
            </p>
            <button
              type="button"
              onClick={() => { void openQuery.refetch(); void closedQuery.refetch(); }}
              style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: BRAND, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        ) : !dispute ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: FONT, color: '#667085', marginBottom: 16 }}>Dispute not found.</p>
            <button
              type="button"
              onClick={() => router.push('/disputes')}
              style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: BRAND, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Back to Dispute Center
            </button>
          </div>
        ) : (
          <div className="app-page-body" style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 80px' }}>

            {!isClosed ? (
              <div style={{
                background: '#FFFAEB', border: '1px solid #FEDF89', borderRadius: 12,
                padding: '14px 18px', marginBottom: 24,
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#DC6803" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke="#DC6803" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="#DC6803" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p style={{ fontFamily: FONT, fontSize: '14px', color: '#B54708', lineHeight: '1.6' }}>
                  Your dispute is in review by our team and will be resolved within <strong>72 hours</strong>.
                </p>
              </div>
            ) : (
              <div style={{
                background: '#EFF8FF', border: '1px solid #B2DDFF', borderRadius: 12,
                padding: '14px 18px', marginBottom: 24,
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" stroke="#1570EF" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="#1570EF" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="#1570EF" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p style={{ fontFamily: FONT, fontSize: '14px', color: '#1849A9', lineHeight: '1.6' }}>
                  This ticket is being closed. If you have any issue, contact our Support team. A new ticket will be created for any further objection.
                </p>
              </div>
            )}

            <div style={{ background: '#ffffff', borderRadius: 20, border: '1.5px solid #EAECF0', overflow: 'hidden' }}>

              <div style={{ padding: '24px', borderBottom: '1px solid #F2F4F7' }}>
                <p style={{ fontFamily: FONT, fontSize: '11px', fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                  Disputed Favor
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <FavorImage
                    src={dispute.disputedFavor?.coverImage}
                    alt={dispute.disputedFavor?.title || 'Reported favor'}
                    style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', flexShrink: 0, border: '1px solid #EAECF0' }}
                  />
                  <div>
                    <p style={{ fontFamily: FONT, fontSize: '15px', fontWeight: 600, color: '#101828', marginBottom: 4 }}>
                      {dispute.disputedFavor?.title || 'Reported favor'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: FONT, fontSize: '13px', color: '#667085' }}>{formatCategory(dispute.disputedFavor?.type)}</span>
                      <span style={{ color: '#D0D5DD' }}>·</span>
                      <span style={{ fontFamily: FONT, fontSize: '15px', fontWeight: 700, color: BRAND }}>
                        {formatPrice(dispute.disputedFavor?.budget ?? dispute.booking?.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px', borderBottom: '1px solid #F2F4F7', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Section title="Report Type">
                  <p style={{ fontFamily: FONT, fontSize: '15px', color: '#101828' }}>
                    {formatBuyerReportReason(dispute.reasonCode, dispute.otherReason)}
                  </p>
                </Section>
                <Section title="Reason">
                  <p style={{ fontFamily: FONT, fontSize: '15px', color: '#344054', lineHeight: '1.7' }}>
                    {dispute.message || 'No additional details were provided.'}
                  </p>
                </Section>
              </div>

              <div style={{ padding: '24px' }}>
                <Section title="Photos / Videos">
                  {evidence.length === 0 ? (
                    <p style={{ fontFamily: FONT, fontSize: '14px', color: '#667085', marginTop: 4 }}>
                      No photos or videos were attached.
                    </p>
                  ) : (
                    <div className="app-cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                      {dispute.images.map((src, i) => (
                        <div key={`image-${i}`} style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3' }}>
                          <img
                            src={src}
                            alt={`Evidence ${i + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                      ))}
                      {dispute.videos.map((src, i) => (
                        <div key={`video-${i}`} style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3', background: '#101828' }}>
                          <video
                            src={src}
                            controls
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              </div>
            </div>

            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <p style={{ fontFamily: FONT, fontSize: '14px', color: '#667085' }}>
                Have any issue?{' '}
                <button
                  type="button"
                  onClick={() => setChatOpen(true)}
                  style={{ fontFamily: FONT, fontSize: '14px', fontWeight: 600, color: BRAND, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
                >
                  Contact Support
                </button>
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
      {dispute && (
        <DisputeSupportChat
          open={chatOpen}
          disputeId={dispute.id}
          ticketNo={dispute.ticketNo}
          onClose={() => setChatOpen(false)}
        />
      )}
    </>
  );
}

export default function DisputeDetailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAFAFA' }} />}>
      <DisputeDetailPageInner />
    </Suspense>
  );
}
