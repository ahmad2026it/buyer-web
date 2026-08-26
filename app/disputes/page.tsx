'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import { useGetBuyerBookingReportsQuery } from '@/app/buyer/store/buyerBookingsAPI';
import {
  formatBuyerReportDate,
  formatBuyerReportStatusLabel,
  getBuyerReportDueDate,
  isClosedBuyerReportStatus,
  type BuyerBookingReport,
} from '@/app/buyer/store/buyerBookingsTypes';
import { useAppSelector } from '@/store/hooks';
import FavorImage, { pickFavorImage } from '@/components/FavorImage';

const BRAND = '#A54AFF';
const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const PILL  = '9999px';
const FONT  = 'Poppins, sans-serif';
const PAGE_SIZE = 20;

type DisputeStatus = 'Pending' | 'Closed';

interface Dispute {
  id: number;
  ticketNo: string;
  status: DisputeStatus;
  createdAt: string;
  reportDue: string;
  favorImage: string | null;
  favorTitle: string;
  favorCategory: string;
  favorPrice: string;
}

function formatCategory(type?: string | null): string {
  if (!type) return 'Service';
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/[_-]/g, ' ');
}

function formatPrice(value?: string | number | null): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '$0.00';
  return `$${n.toFixed(2)}`;
}

function toDisputeCard(report: BuyerBookingReport): Dispute {
  return {
    id: report.id,
    ticketNo: String(report.ticketNo ?? report.id),
    status: formatBuyerReportStatusLabel(report.status),
    createdAt: formatBuyerReportDate(report.createdAt),
    reportDue: getBuyerReportDueDate(report.createdAt),
    favorImage: pickFavorImage(report.disputedFavor?.coverImage),
    favorTitle: report.disputedFavor?.title || 'Reported favor',
    favorCategory: formatCategory(report.disputedFavor?.type),
    favorPrice: formatPrice(report.disputedFavor?.budget ?? report.booking?.totalPrice),
  };
}

function mergeReports(
  ...groups: Array<BuyerBookingReport[] | undefined>
): BuyerBookingReport[] {
  const seen = new Set<number>();
  const merged: BuyerBookingReport[] = [];

  groups.forEach((group) => {
    group?.forEach((item) => {
      if (seen.has(item.id)) return;
      seen.add(item.id);
      merged.push(item);
    });
  });

  return merged.sort((a, b) => {
    const closedDiff = Number(isClosedBuyerReportStatus(a.status)) - Number(isClosedBuyerReportStatus(b.status));
    if (closedDiff !== 0) return closedDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function StatusBadge({ status }: { status: DisputeStatus }) {
  const isPending = status === 'Pending';
  return (
    <span style={{
      fontFamily: FONT, fontSize: '12px', fontWeight: 600,
      color: isPending ? '#DC6803' : '#667085',
      background: isPending ? '#FFFAEB' : '#F2F4F7',
      border: `1px solid ${isPending ? '#FEDF89' : '#EAECF0'}`,
      borderRadius: PILL, padding: '3px 10px', letterSpacing: '0.01em',
    }}>
      {status}
    </span>
  );
}

function DisputeCard({ dispute }: { dispute: Dispute }) {
  const router = useRouter();
  const isClosed = dispute.status === 'Closed';

  return (
    <div
      onClick={() => router.push(`/disputes/${dispute.id}`)}
      style={{
        background: '#ffffff', borderRadius: '20px', border: '1.5px solid #EAECF0',
        overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'rgba(165,74,255,0.3)';
        el.style.boxShadow = '0 8px 24px rgba(165,74,255,0.1)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = '#EAECF0';
        el.style.boxShadow = 'none';
      }}
    >
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: FONT, fontSize: '13px', fontWeight: 600, color: '#101828' }}>
            Ticket no. {dispute.ticketNo}
          </span>
          <StatusBadge status={dispute.status} />
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#98A2B3', flexShrink: 0 }}>
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div style={{ padding: '14px 20px', borderBottom: '1px solid #F2F4F7', display: 'flex', gap: 32 }}>
        <div>
          <p style={{ fontFamily: FONT, fontSize: '11px', color: '#98A2B3', fontWeight: 500, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</p>
          <p style={{ fontFamily: FONT, fontSize: '13px', fontWeight: 600, color: '#344054' }}>{dispute.createdAt}</p>
        </div>
        <div>
          <p style={{ fontFamily: FONT, fontSize: '11px', color: '#98A2B3', fontWeight: 500, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Report Due</p>
          <p style={{ fontFamily: FONT, fontSize: '13px', fontWeight: 600, color: '#344054' }}>{dispute.reportDue}</p>
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <FavorImage
          src={dispute.favorImage}
          alt={dispute.favorTitle}
          style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0, border: '1px solid #EAECF0' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: FONT, fontSize: '14px', fontWeight: 600, color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
            {dispute.favorTitle}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: FONT, fontSize: '12px', color: '#667085' }}>{dispute.favorCategory}</span>
            <span style={{ color: '#D0D5DD', fontSize: 10 }}>•</span>
            <span style={{ fontFamily: FONT, fontSize: '13px', fontWeight: 700, color: BRAND }}>{dispute.favorPrice}</span>
          </div>
        </div>

        {isClosed && (
          <button
            onClick={e => { e.stopPropagation(); router.push(`/disputes/${dispute.id}`); }}
            style={{
              fontFamily: FONT, fontSize: '13px', fontWeight: 600, color: '#344054',
              background: 'transparent', border: '1.5px solid #D0D5DD',
              borderRadius: PILL, padding: '8px 16px', cursor: 'pointer', flexShrink: 0,
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = BRAND;
              el.style.color = BRAND;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = '#D0D5DD';
              el.style.color = '#344054';
            }}
          >
            See report
          </button>
        )}
      </div>
    </div>
  );
}

function DisputeCardSkeleton() {
  return (
    <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #EAECF0', overflow: 'hidden' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F2F4F7', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 110, height: 14, borderRadius: 4, background: '#F2F4F7' }} />
        <div style={{ width: 64, height: 22, borderRadius: PILL, background: '#F2F4F7' }} />
      </div>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #F2F4F7', display: 'flex', gap: 32 }}>
        <div>
          <div style={{ width: 56, height: 10, borderRadius: 4, background: '#F2F4F7', marginBottom: 8 }} />
          <div style={{ width: 88, height: 13, borderRadius: 4, background: '#F2F4F7' }} />
        </div>
        <div>
          <div style={{ width: 72, height: 10, borderRadius: 4, background: '#F2F4F7', marginBottom: 8 }} />
          <div style={{ width: 88, height: 13, borderRadius: 4, background: '#F2F4F7' }} />
        </div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: '#F2F4F7', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: '70%', height: 14, borderRadius: 4, background: '#F2F4F7', marginBottom: 8 }} />
          <div style={{ width: '40%', height: 12, borderRadius: 4, background: '#F2F4F7' }} />
        </div>
      </div>
    </div>
  );
}

export default function DisputeCenterPage() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const token = useAppSelector((state) => state.auth.token);
  const skip = !token;

  const openQuery = useGetBuyerBookingReportsQuery(
    { page: 1, limit: PAGE_SIZE, status: 'open' },
    { skip },
  );
  const closedQuery = useGetBuyerBookingReportsQuery(
    { page: 1, limit: PAGE_SIZE, status: 'closed' },
    { skip },
  );

  const reports = useMemo(
    () => mergeReports(openQuery.data?.data?.reports, closedQuery.data?.data?.reports),
    [closedQuery.data, openQuery.data],
  );
  const disputes = useMemo(() => reports.map(toDisputeCard), [reports]);

  const isLoading = openQuery.isLoading || closedQuery.isLoading;
  const isError = openQuery.isError && closedQuery.isError;

  return (
    <>
      <Navbar />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Log in to view and manage your dispute tickets."
        />
      )}
      <main className="app-page" style={{ minHeight: '100dvh', background: '#FAFAFA' }}>

        <div className="app-page-band" style={{ background: '#ffffff', borderBottom: '1px solid #EAECF0', paddingTop: '104px', paddingBottom: '32px' }}>
          <div className="app-page-inner" style={{ maxWidth: '780px', margin: '0 auto', padding: '0 24px' }}>
            <button
              onClick={() => router.back()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: '13px', fontWeight: 500, color: '#667085', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 16, transition: 'color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = BRAND; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#667085'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>

            <h1 className="app-page-title" style={{ fontFamily: FONT, fontWeight: 800, fontSize: '30px', color: '#101828', lineHeight: '1.2', marginBottom: 6 }}>
              Dispute Center
            </h1>
            <p style={{ fontFamily: FONT, fontSize: '15px', color: '#667085' }}>
              View and manage your active dispute tickets.
            </p>
          </div>
        </div>

        <div className="app-page-body" style={{ maxWidth: '780px', margin: '0 auto', padding: '40px 24px 80px' }}>
          {skip ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', textAlign: 'center' }}>
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>Log in to view disputes</h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', maxWidth: 320, lineHeight: 1.65, marginBottom: 20 }}>
                Sign in to see your open and closed dispute tickets.
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <DisputeCardSkeleton />
              <DisputeCardSkeleton />
            </div>
          ) : isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', textAlign: 'center' }}>
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>Could not load disputes</h3>
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
          ) : disputes.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F4EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke={BRAND} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke={BRAND} strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#101828', marginBottom: 8 }}>No dispute tickets</h3>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', maxWidth: 320, lineHeight: 1.65 }}>
                Reports you file on bookings will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {disputes.map(d => <DisputeCard key={d.id} dispute={d} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
