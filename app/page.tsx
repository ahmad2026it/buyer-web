'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategoriesSection from '@/components/CategoriesSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import TopFavorsSection from '@/components/TopFavorsSection';
import TopSellersSection from '@/components/TopSellersSection';
import AppDownloadSection from '@/components/AppDownloadSection';
import BecomeSellerSection from '@/components/BecomeSellerSection';
import Footer from '@/components/Footer';
import { useGetBuyerBookingsQuery } from '@/app/buyer/store/buyerBookingsAPI';
import {
  formatBuyerBookingStatusLabel,
  isActiveListingBookingStatus,
  mapBuyerBookingUiStatus,
  mergeBuyerBookings,
  type BuyerBooking,
  type BuyerBookingUiStatus,
} from '@/app/buyer/store/buyerBookingsTypes';
import { useAppSelector } from '@/store/hooks';
import FavorImage, { pickFavorImage } from '@/components/FavorImage';

const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const BRAND = '#A54AFF';
const PILL  = '9999px';
const PLACEHOLDER_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=72&h=72&fit=crop&auto=format&q=80';
const HOME_BOOKINGS_LIMIT = 4;

type HomeBookingStatus = BuyerBookingUiStatus;

const STATUS_CFG: Record<HomeBookingStatus, { label: string; bg: string; color: string; border: string; dot: string }> = {
  InProgress:        { label: 'In Progress',         bg: '#FFF4ED', color: '#C4320A', border: '#F9DBAF', dot: '#C4320A' },
  Upcoming:          { label: 'Upcoming',            bg: '#ECFDF3', color: '#079455', border: '#A9EFC5', dot: '#079455' },
  Pending:           { label: 'Pending',             bg: '#FFFAEB', color: '#B54708', border: '#FEDF89', dot: '#B54708' },
  DeclinedBySeller:  { label: 'Declined by seller',  bg: '#FEF3F2', color: '#B42318', border: '#FECDCA', dot: '#B42318' },
  CancelledByBuyer:  { label: 'Cancelled by buyer',  bg: '#F2F4F7', color: '#667085', border: '#D0D5DD', dot: '#667085' },
  CancelledBySeller: { label: 'Cancelled by seller', bg: '#F2F4F7', color: '#667085', border: '#D0D5DD', dot: '#667085' },
  Cancelled:         { label: 'Cancelled',           bg: '#F2F4F7', color: '#667085', border: '#D0D5DD', dot: '#667085' },
  Complete:          { label: 'Complete',            bg: '#F9F5FF', color: '#6941C6', border: '#E9D7FE', dot: '#6941C6' },
  Completed:         { label: 'Completed',           bg: '#EEF4FF', color: '#3538CD', border: '#C7D7FE', dot: '#3538CD' },
};

function mapHomeStatus(item: BuyerBooking): HomeBookingStatus {
  return mapBuyerBookingUiStatus(item.status, {
    booking: item,
  });
}

function formatFavorDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFavorTime(value: string): string {
  const [hoursRaw, minutesRaw] = value.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatPrice(price: number): string {
  if (!Number.isFinite(price)) return '$0.00';
  return `$${price.toFixed(2)}`;
}

function toHomeBooking(item: BuyerBooking) {
  return {
    id: String(item.id),
    status: mapHomeStatus(item),
    title: item.favor?.title || 'Booking',
    image: pickFavorImage(item.images, item.favor?.images, item.favor?.favorImage),
    date: formatFavorDate(item.favorDate),
    time: formatFavorTime(item.favorTime),
    sellerName: item.seller?.fullName || 'Seller',
    sellerAvatar: item.seller?.profileImage || PLACEHOLDER_AVATAR,
    price: Number(item.totalPrice) || 0,
  };
}

function HomeBookingSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #EAECF0', overflow: 'hidden' }}>
      <div style={{ padding: '10px 10px 0' }}>
        <div style={{ height: 152, borderRadius: 14, background: '#F2F4F7' }} />
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ width: '78%', height: 14, borderRadius: 4, background: '#F2F4F7', marginBottom: 10 }} />
        <div style={{ width: '55%', height: 12, borderRadius: 4, background: '#F2F4F7', marginBottom: 16 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #EAECF0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#F2F4F7' }} />
            <div style={{ width: 88, height: 12, borderRadius: 4, background: '#F2F4F7' }} />
          </div>
          <div style={{ width: 42, height: 14, borderRadius: 4, background: '#F2F4F7' }} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [isLoggedIn, setLoggedIn]   = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [query, setQuery]           = useState('');
  const [typeDropOpen, setTypeDrop] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'favors' | 'sellers'>('all');

  const {
    data: upcomingResponse,
    isLoading: upcomingLoading,
    isError: upcomingError,
    refetch: refetchUpcoming,
  } = useGetBuyerBookingsQuery(
    { page: 1, limit: HOME_BOOKINGS_LIMIT, status: 'upcoming' },
    { skip: !token },
  );
  const {
    data: inProgressResponse,
    isLoading: inProgressLoading,
    isError: inProgressError,
    refetch: refetchInProgress,
  } = useGetBuyerBookingsQuery(
    { page: 1, limit: HOME_BOOKINGS_LIMIT, status: 'in-progress' },
    { skip: !token },
  );
  const {
    data: completeResponse,
    isLoading: completeLoading,
    isError: completeError,
    refetch: refetchComplete,
  } = useGetBuyerBookingsQuery(
    { page: 1, limit: HOME_BOOKINGS_LIMIT, status: 'completed' },
    { skip: !token },
  );

  const bookingsLoading = upcomingLoading || inProgressLoading || completeLoading;
  const bookingsError = upcomingError && inProgressError && completeError;
  const refetchBookings = () => {
    void refetchUpcoming();
    void refetchInProgress();
    void refetchComplete();
  };

  const homeBookings = useMemo(() => {
    const items = mergeBuyerBookings(
      inProgressResponse?.data?.bookings,
      completeResponse?.data?.bookings,
      upcomingResponse?.data?.bookings,
    ).filter((item) => isActiveListingBookingStatus(item.status));
    return items.map(toHomeBooking).slice(0, HOME_BOOKINGS_LIMIT);
  }, [completeResponse, inProgressResponse, upcomingResponse]);

  const firstName = user?.fullName?.trim().split(/\s+/)[0] || 'there';

  useEffect(() => {
    setLoggedIn(localStorage.getItem('whoCan_loggedIn') === 'true');
    setMounted(true);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams({ type: searchType });
    if (query.trim()) params.set('q', query.trim());
    router.push(`/explore/search?${params.toString()}`);
  };

  /* greeting */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (!mounted) return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh' }} />
      <Footer />
    </>
  );

  return (
    <>
      <style>{`
        .scroll-row::-webkit-scrollbar { display: none; }
        .scroll-row { scrollbar-width: none; -ms-overflow-style: none; }
        .bk-card:hover { border-color: rgba(165,74,255,0.3) !important; box-shadow: 0 8px 24px rgba(165,74,255,0.1) !important; }
      `}</style>
      <Navbar />
      <main style={{ background: '#F9FAFB', minHeight: '100vh' }}>

        {isLoggedIn ? (
          <>
            {/* ── Search bar strip ─────────────────────────────── */}
            <div style={{ background: '#fff', borderBottom: '1px solid #EAECF0', paddingTop: 88 }}>
              <div className="container" style={{ padding: '18px 0 20px' }}>

                {/* Greeting row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#98A2B3', margin: 0, marginBottom: 2 }}>
                      {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
                    </p>
                    <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 22, color: '#101828', margin: 0 }}>
                      {greeting}, {firstName}
                    </h1>
                  </div>
                  <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#667085', margin: 0 }}>
                    What are you looking for today?
                  </p>
                </div>

                {/* Search row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                  {/* Search input */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#F9FAFB', border: '1.5px solid #EAECF0', borderRadius: PILL, padding: '11px 16px', gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#98A2B3" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"/></svg>
                    <input
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                      placeholder="Search favors, services, sellers..."
                      style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'Poppins,sans-serif', fontSize: 14, color: '#101828', background: 'transparent' }}
                    />
                    {query && (
                      <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0, padding: 0, color: '#98A2B3' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"/></svg>
                      </button>
                    )}
                  </div>

                  {/* Type dropdown */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <button onClick={() => setTypeDrop(o => !o)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins,sans-serif', fontWeight: 500, fontSize: 14, color: '#344054', background: '#F9FAFB', border: '1.5px solid #EAECF0', borderRadius: PILL, padding: '11px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {searchType === 'all' ? (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="#667085" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="#667085" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="#667085" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="#667085" strokeWidth="2"/></svg> All</>
                      ) : searchType === 'favors' ? (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Favors</>
                      ) : (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="#667085" strokeWidth="2"/></svg> Sellers</>
                      )}
                      <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.2s', transform: typeDropOpen ? 'rotate(180deg)' : 'none' }}><path d="M3 4.5L6 7.5L9 4.5" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    {typeDropOpen && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setTypeDrop(false)}/>
                        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fff', border: '1px solid #EAECF0', borderRadius: 16, boxShadow: '0 8px 24px rgba(16,24,40,0.1)', zIndex: 100, overflow: 'hidden', minWidth: 140 }}>
                          {(['all', 'favors', 'sellers'] as const).map(t => (
                            <button key={t} onClick={() => { setSearchType(t); setTypeDrop(false); }}
                              style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', fontFamily: 'Poppins,sans-serif', fontSize: 14, color: searchType === t ? BRAND : '#344054', background: searchType === t ? '#F8F0FF' : 'transparent', border: 'none', cursor: 'pointer' }}>
                              {t === 'all'
                                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg>
                                : t === 'favors'
                                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>
                              }
                              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Search button */}
                  <button onClick={handleSearch}
                    style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: '11px 26px', cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.15s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
                    Search
                  </button>

                  {/* Filters button */}
                  <button onClick={() => router.push('/explore/search')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins,sans-serif', fontWeight: 500, fontSize: 14, color: '#344054', background: '#F9FAFB', border: '1.5px solid #D0D5DD', borderRadius: PILL, padding: '11px 16px', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = BRAND; el.style.color = BRAND; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#D0D5DD'; el.style.color = '#344054'; }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M8 12h8M12 18h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    Filters
                  </button>
                </div>
              </div>
            </div>

            {/* ── My Bookings ──────────────────────────────────── */}
            <section style={{ padding: '48px 0 0' }}>
              <div className="container">

                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 22, color: '#101828', margin: 0 }}>My Bookings</h2>
                    <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#667085', margin: '4px 0 0' }}>Your in-progress and upcoming favors</p>
                  </div>
                  <button onClick={() => router.push('/bookings')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: BRAND, background: 'none', border: `1.5px solid ${BRAND}`, borderRadius: PILL, padding: '9px 18px', cursor: 'pointer', transition: 'background 0.15s', flexShrink: 0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F4EBFF'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}>
                    See All
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke={BRAND} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, paddingBottom: 24 }}>
                  {bookingsLoading ? (
                    Array.from({ length: HOME_BOOKINGS_LIMIT }, (_, i) => <HomeBookingSkeleton key={i} />)
                  ) : bookingsError ? (
                    <div style={{ gridColumn: '1 / -1', background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}>
                      <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 16, color: '#101828', margin: '0 0 8px' }}>Could not load bookings</h3>
                      <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#667085', margin: '0 0 16px' }}>Please try again in a moment.</p>
                      <button
                        type="button"
                        onClick={() => { refetchBookings(); }}
                        style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: BRAND, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Try again
                      </button>
                    </div>
                  ) : homeBookings.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}>
                      <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 16, color: '#101828', margin: '0 0 8px' }}>No upcoming bookings</h3>
                      <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#667085', margin: 0 }}>Accepted bookings will appear here once a seller confirms your request.</p>
                    </div>
                  ) : homeBookings.map(bk => {
                    const cfg = STATUS_CFG[bk.status];
                    const isLive = bk.status === 'InProgress';
                    return (
                      <div key={bk.id}
                        className="bk-card"
                        onClick={() => router.push(`/bookings/${bk.id}`)}
                        style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #EAECF0', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s' }}>

                        {/* Image */}
                        <div style={{ position: 'relative', padding: '10px 10px 0' }}>
                          <div style={{ height: 152, borderRadius: 14, overflow: 'hidden' }}>
                            <FavorImage src={bk.image} alt={bk.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                          </div>

                          {/* Status badge */}
                          <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 5, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: PILL, padding: '4px 10px' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0, ...(isLive ? { animation: 'bkPulse 1.6s ease-out infinite' } : {}) }}/>
                            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 11, fontWeight: 700, color: cfg.color, whiteSpace: 'nowrap' }}>{formatBuyerBookingStatusLabel(bk.status)}</span>
                          </div>
                        </div>

                        {/* Card body */}
                        <div style={{ padding: '12px 14px 14px' }}>
                          <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: '#101828', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bk.title}</h3>

                          {/* Date + time */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#98A2B3" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"/></svg>
                            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: '#667085' }}>{bk.date} · {bk.time}</span>
                          </div>

                          {/* Seller + price */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #EAECF0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden', flex: 1, minWidth: 0 }}>
                              <img src={bk.sellerAvatar} alt={bk.sellerName} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '2px solid #DFBAFF', flexShrink: 0 }}/>
                              <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, fontWeight: 600, color: '#344054', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bk.sellerName}</span>
                            </div>
                            <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 15, color: BRAND, flexShrink: 0, marginLeft: 8 }}>{formatPrice(bk.price)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Divider before shared sections */}
            <div style={{ borderTop: '1px solid #EAECF0', marginTop: 24 }} />
          </>
        ) : (
          <HeroSection />
        )}

        {/* ── Shared sections (both logged-in and guest) ─────── */}
        <CategoriesSection />
        <WhyChooseUsSection />
        <TopFavorsSection />
        <TopSellersSection />
        <AppDownloadSection />
        <BecomeSellerSection />
      </main>
      <Footer />

      <style>{`
        @keyframes bkPulse {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </>
  );
}
