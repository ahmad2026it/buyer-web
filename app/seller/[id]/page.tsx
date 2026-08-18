'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';

/* ─── mock data ─────────────────────────────────────── */
const SELLER = {
  id: '1',
  isTeam: false,
  name: 'Alfonzo Schuessler',
  badge: 'Pro' as const,
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&auto=format&q=80',
  cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=300&fit=crop&auto=format&q=60',
  rating: 4.8,
  reviewCount: 6890,
  distance: 8,
  completedJobs: 1200,
  location: '12 High Street Downtown, TX',
  responseTime: 'within a day',
  about: `I've been delivering professional home cleaning services for over 5 years across the Dallas–Fort Worth area. I take pride in every job — from single-room cleans to full home overhauls — using eco-friendly, pet-safe products.\n\nAll my work is fully insured and I carry my own professional-grade equipment. Flexible scheduling, including evenings and weekends. Repeat customers get a 10% loyalty discount.`,
  specialty: 'Home Cleaning Expert',
  memberSince: 'March 2021',
  languages: ['English', 'Spanish'],
  favors: [
    { id: '1', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format&q=75',  title: 'I will deep clean your home',             category: 'Cleaning',   rating: 4.8, reviews: 8890, price: 200 },
    { id: '2', image: 'https://images.unsplash.com/photo-1621905251189-08b1489462be?w=600&h=400&fit=crop&auto=format&q=75', title: 'I will fix your electric supply issue',   category: 'Electrical', rating: 4.8, reviews: 5593, price: 135 },
    { id: '3', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop&auto=format&q=75', title: 'I will landscape your garden beautifully', category: 'Gardening',  rating: 4.9, reviews: 1140, price: 120 },
    { id: '4', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop&auto=format&q=75', title: 'I will fix all your plumbing issues',     category: 'Plumbing',   rating: 4.7, reviews: 892,  price: 150 },
  ],
  reviewItems: [
    { id: 1, author: 'Shannon Ireland', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&auto=format&q=80', rating: 5, date: '12 Dec, 2024', favor: 'I will deep clean your home',             text: 'My place looked fresh and spotless after the service. Best cleaner in the decade!' },
    { id: 2, author: 'Mary Katherine',  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&auto=format&q=80', rating: 5, date: '8 Dec, 2024',  favor: 'I will deep clean your home',             text: 'Quick, professional, and left my place spotless — highly recommended!' },
    { id: 3, author: 'James Wilson',    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&auto=format&q=80', rating: 4, date: '2 Dec, 2024',  favor: 'I will fix your electric supply issue',  text: 'Great service, very thorough and on time. Will book again for sure.' },
    { id: 4, author: 'Sarah Mitchell',  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&auto=format&q=80', rating: 5, date: '28 Nov, 2024', favor: 'I will landscape your garden beautifully', text: 'Absolutely phenomenal work. My garden has never looked this beautiful.' },
  ],
};

const TEAM_SELLER = {
  ...SELLER,
  id: 'team-1',
  isTeam: true,
  name: 'The Bright Services',
  badge: 'Team' as const,
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&auto=format&q=80',
  cover: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&h=300&fit=crop&auto=format&q=60',
  specialty: 'Commercial & Residential Cleaning Team',
  members: [
    { id: '1', name: 'James Doe',       avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format&q=80', jobs: 120, rating: 4.8, reviews: 90 },
    { id: '2', name: 'Melissa Anthony', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&auto=format&q=80', jobs: 40,  rating: 4.8, reviews: 20 },
    { id: '3', name: 'Carlos Rivera',   avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&h=80&fit=crop&auto=format&q=80', jobs: 87,  rating: 4.7, reviews: 61 },
    { id: '4', name: 'Laura Kim',       avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&auto=format&q=80', jobs: 65,  rating: 4.9, reviews: 44 },
  ],
};

const EXPLORE_PROVIDERS = [
  { id: '2', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&auto=format&q=75', name: 'Kyle Stanford',  badge: 'Pro',  rating: 4.9, reviews: '3,201', completedJobs: 210 },
  { id: '3', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&auto=format&q=75', name: 'Maria Santos',  badge: 'Team', rating: 4.7, reviews: '1,876', completedJobs: 156 },
  { id: '4', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&auto=format&q=75', name: 'Sophie Lee',    badge: 'Pro',  rating: 4.9, reviews: '2,107', completedJobs: 431 },
  { id: '5', image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=500&fit=crop&auto=format&q=75', name: 'Liam Jones',    badge: 'Team', rating: 4.6, reviews: '893',   completedJobs: 247 },
];

/* ─── helpers ───────────────────────────────────────── */
const GRAD = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill={i <= n ? '#F79009' : '#EAECF0'} stroke="none" />
        </svg>
      ))}
    </span>
  );
}

function BadgePill({ b }: { b: string }) {
  return (
    <span style={{ background: b === 'Pro' ? '#A54AFF' : '#344054', borderRadius: '9999px', padding: '4px 12px', fontFamily: 'Poppins,sans-serif', fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.03em' }}>{b}</span>
  );
}

function Divider() {
  return <div style={{ height: '1px', background: '#EAECF0', margin: '28px 0' }} />;
}

/* ─── page ───────────────────────────────────────────── */
export default function SellerProfilePage() {
  const router = useRouter();
  const [likedFavors, setLikedFavors] = useState<Set<string>>(new Set());
  const toggleFavorLike = (_id: string) => setAuthOpen(true);
  const [msgOpen,    setMsgOpen]    = useState(false);
  const [authOpen,   setAuthOpen]   = useState(false);
  const [msgText,    setMsgText]    = useState('');
  const [showMore,   setShowMore]   = useState(false);
  const [showRev,    setShowRev]    = useState(false);
  const [liked,      setLiked]      = useState(false);
  const [dotsOpen,   setDotsOpen]   = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const sellerId = params?.id as string;
  const TEAM_IDS = new Set(['1', '3', '6', '8']);
  const seller = TEAM_IDS.has(sellerId) ? TEAM_SELLER : SELLER;

  const favors  = showMore ? seller.favors      : seller.favors.slice(0, 3);
  const reviews = showRev  ? seller.reviewItems : seller.reviewItems.slice(0, 2);

  // close dots dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dotsRef.current && !dotsRef.current.contains(e.target as Node)) {
        setDotsOpen(false);
      }
    };
    if (dotsOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dotsOpen]);

  return (
    <>
      <Navbar />
      {authOpen && <AuthGateModal onClose={() => setAuthOpen(false)} />}
      <main style={{ minHeight: '100vh', background: '#FAFAFA' }}>

        {/* ── Cover photo hero ── */}
        <div style={{ position: 'relative', height: '340px', background: seller.badge === 'Pro' ? '#ECFFD4' : '#E3C7FF', overflow: 'hidden', marginTop: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(13,1,32,0.3) 100%)' }} />
          <button onClick={() => router.back()}
            style={{ position: 'absolute', top: '100px', left: '32px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(242,244,247,0.92)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, color: '#344054', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>
        </div>

        {/* ── Profile card strip ── */}
        <div style={{ maxWidth: '1376px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: '24px', padding: '28px 32px', marginTop: '-60px', position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', gap: '24px', boxShadow: '0 4px 32px rgba(16,24,40,0.08)', flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={seller.avatar} alt={seller.name}
                style={{ width: '100px', height: '100px', borderRadius: '9999px', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 16px rgba(165,74,255,0.2)' }} />
              <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '18px', height: '18px', background: '#22C55E', borderRadius: '9999px', border: '2.5px solid #fff' }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '26px', color: '#101828', letterSpacing: '-0.01em' }}>{seller.name}</h1>
                <BadgePill b={seller.badge} />
              </div>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#667085', marginBottom: '10px' }}>{seller.specialty}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Stars n={Math.round(seller.rating)} size={15} />
                  <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '14px', color: '#101828' }}>{seller.rating}</span>
                  <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085' }}>({seller.reviewCount.toLocaleString()} reviews)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#98A2B3" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="#98A2B3" strokeWidth="2"/></svg>
                  <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#475467' }}>{seller.distance} miles away</span>
                </div>
              </div>
            </div>

            {/* Heart + three-dots actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {/* Heart */}
              <button
                onClick={() => setAuthOpen(true)}
                aria-label="Save seller"
                style={{ width: '44px', height: '44px', borderRadius: '9999px', background: liked ? '#FFF1F3' : '#F9FAFB', border: `1.5px solid ${liked ? '#F43F5E' : '#EAECF0'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    stroke={liked ? '#F43F5E' : '#98A2B3'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    fill={liked ? '#F43F5E' : 'none'} style={{ transition: 'all 0.15s' }} />
                </svg>
              </button>

              {/* Three dots */}
              <div ref={dotsRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDotsOpen(o => !o)}
                  aria-label="More options"
                  style={{ width: '44px', height: '44px', borderRadius: '9999px', background: '#F9FAFB', border: '1.5px solid #EAECF0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EAECF0'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="5" r="1.5" fill="#667085"/>
                    <circle cx="12" cy="12" r="1.5" fill="#667085"/>
                    <circle cx="12" cy="19" r="1.5" fill="#667085"/>
                  </svg>
                </button>

                {dotsOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #EAECF0', borderRadius: '12px', boxShadow: '0 8px 24px rgba(16,24,40,0.12)', zIndex: 100, minWidth: '172px', padding: '6px' }}>
                    <button
                      onClick={() => { setDotsOpen(false); navigator.clipboard?.writeText(window.location.href).catch(() => {}); }}
                      style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 500, color: '#344054', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="#667085" strokeWidth="2"/><circle cx="6" cy="12" r="3" stroke="#667085" strokeWidth="2"/><circle cx="18" cy="19" r="3" stroke="#667085" strokeWidth="2"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="#667085" strokeWidth="2"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="#667085" strokeWidth="2"/></svg>
                      Share profile
                    </button>
                    <div style={{ height: '1px', background: '#EAECF0', margin: '4px 6px' }} />
                    <button
                      onClick={() => { setDotsOpen(false); alert('Report submitted'); }}
                      style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 500, color: '#B42318', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF3F2'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="#B42318" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="4" y1="22" x2="4" y2="15" stroke="#B42318" strokeWidth="2" strokeLinecap="round"/></svg>
                      Report seller
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Two-col body ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'flex-start', padding: '36px 0 80px' }}>

            {/* ── LEFT ── */}
            <div>
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
                {[
                  { label: 'Favors completed', value: seller.completedJobs.toLocaleString(), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="#A54AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="#A54AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                  { label: 'Location',          value: seller.location,                      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#A54AFF" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="#A54AFF" strokeWidth="2"/></svg> },
                  { label: 'Typical response',  value: `Responds ${seller.responseTime}`,   icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#A54AFF" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#A54AFF" strokeWidth="2" strokeLinecap="round"/></svg> },
                ].map(s => (
                  <div key={s.label} style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: '18px', padding: '20px' }}>
                    <div style={{ marginBottom: '10px' }}>{s.icon}</div>
                    <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '15px', color: '#101828', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</p>
                    <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#667085' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <Divider />

              {/* About */}
              <div>
                <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '20px', color: '#101828', marginBottom: '14px' }}>About</h2>
                {seller.about.split('\n\n').map((p, i) => (
                  <p key={i} style={{ fontFamily: 'Poppins,sans-serif', fontSize: '15px', color: '#475467', lineHeight: '1.75', marginBottom: '12px' }}>{p}</p>
                ))}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                  {/* Member since chip */}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins,sans-serif', fontSize: '12px', fontWeight: 500, color: '#344054', background: '#F2F4F7', borderRadius: '9999px', padding: '5px 12px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#667085" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#667085" strokeWidth="2" strokeLinecap="round"/></svg>
                    Member since {seller.memberSince}
                  </span>
                  {/* Language chips */}
                  {seller.languages.map(l => (
                    <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins,sans-serif', fontSize: '12px', fontWeight: 500, color: '#344054', background: '#F2F4F7', borderRadius: '9999px', padding: '5px 12px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#667085" strokeWidth="2"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#667085" strokeWidth="2"/></svg>
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              <Divider />

              {/* Team members (only for team sellers) */}
              {seller.isTeam && 'members' in seller && (
                <>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '20px', color: '#101828' }}>
                        Team members <span style={{ fontSize: '14px', fontWeight: 500, color: '#667085' }}>({(seller as typeof TEAM_SELLER).members.length} members)</span>
                      </h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px' }}>
                      {(seller as typeof TEAM_SELLER).members.map(m => (
                        <div key={m.id}
                          style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: '1.5px solid #EAECF0', borderRadius: '16px', padding: '16px' }}>
                          <img src={m.avatar} alt={m.name} style={{ width: '52px', height: '52px', borderRadius: '9999px', objectFit: 'cover', border: '2px solid #DFBAFF', flexShrink: 0 }} />
                          <div>
                            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px', color: '#101828', marginBottom: '3px' }}>{m.name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Stars n={Math.round(m.rating)} size={12} />
                              <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '11px', color: '#98A2B3' }}>{m.reviews} reviews</span>
                            </div>
                            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '11px', color: '#667085', marginTop: '2px' }}>{m.jobs} favors completed</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Divider />
                </>
              )}

              {/* Favors — 3-column card grid */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '20px', color: '#101828' }}>
                    Favors <span style={{ fontSize: '14px', fontWeight: 500, color: '#667085' }}>({seller.favors.length} available)</span>
                  </h2>
                  {seller.favors.length > 3 && (
                    <button onClick={() => setShowMore(s => !s)}
                      style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px', color: '#A54AFF', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                      {showMore ? 'Show less' : 'See all'}
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
                  {favors.map(f => {
                    const favLiked = likedFavors.has(f.id);
                    const isPro = seller.badge === 'Pro';
                    return (
                      <div key={f.id} onClick={() => router.push(`/favor/${f.id}`)}
                        style={{ background: '#fff', borderRadius: '20px', border: '1.5px solid #EAECF0', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(165,74,255,0.3)'; el.style.boxShadow = '0 8px 24px rgba(165,74,255,0.1)'; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#EAECF0'; el.style.boxShadow = 'none'; }}>

                        {/* Image zone */}
                        <div style={{ position: 'relative', padding: '10px 10px 0', flexShrink: 0 }}>
                          <div style={{ height: '200px', borderRadius: '14px', overflow: 'hidden' }}>
                            <img src={f.image} alt={f.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }} />
                          </div>
                          {/* Heart button */}
                          <button
                            onClick={e => { e.stopPropagation(); toggleFavorLike(f.id); }}
                            aria-label={favLiked ? 'Remove from favorites' : 'Add to favorites'}
                            style={{ position: 'absolute', top: '20px', right: '20px', width: '34px', height: '34px', borderRadius: '50%', background: favLiked ? 'rgba(244,63,94,0.88)' : 'rgba(16,24,40,0.42)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'background 0.15s' }}
                            onMouseEnter={e => { if (!favLiked) (e.currentTarget as HTMLElement).style.background = 'rgba(16,24,40,0.65)'; }}
                            onMouseLeave={e => { if (!favLiked) (e.currentTarget as HTMLElement).style.background = 'rgba(16,24,40,0.42)'; }}
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                fill={favLiked ? '#ffffff' : 'none'} style={{ transition: 'fill 0.15s' }} />
                            </svg>
                          </button>
                        </div>

                        {/* Card body — same hierarchy as homepage */}
                        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
                          {/* 1. Title */}
                          <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '17px', color: '#101828', lineHeight: '1.4', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title}</h3>
                          {/* 2. Price + Category badge */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '20px', color: '#8E40FF' }}>${f.price}</span>
                            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', fontWeight: 500, color: '#6941C6', background: '#F9F5FF', border: '1px solid #E9D7FE', borderRadius: '9999px', padding: '3px 10px' }}>{f.category}</span>
                          </div>
                          {/* 3. Seller + rating */}
                          <div style={{ paddingTop: '10px', borderTop: '1px solid #EAECF0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1, minWidth: 0 }}>
                              <img src={seller.avatar} alt={seller.name}
                                onClick={e => { e.stopPropagation(); router.push(`/seller/${seller.id}`); }}
                                style={{ width: '30px', height: '30px', borderRadius: '9999px', objectFit: 'cover', objectPosition: 'top', flexShrink: 0, border: '2px solid #DFBAFF', cursor: 'pointer' }} />
                              <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '13px', color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{seller.name}</span>
                              <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '11px', fontWeight: 700, background: isPro ? '#A54AFF' : '#344054', color: '#ffffff', borderRadius: '9999px', padding: '2px 8px', flexShrink: 0, letterSpacing: '0.02em' }}>{seller.badge}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '4px' }}>
                              <svg viewBox="0 0 24 24" width="13" height="13"><polygon fill="#F79009" stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                              <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, color: '#101828' }}>{f.rating}</span>
                              <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#D0D5DD' }}>·</span>
                              <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#667085' }}>{f.reviews.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Divider />

              {/* Reviews */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '20px', color: '#101828', marginBottom: '4px' }}>Reviews</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Stars n={Math.round(seller.rating)} size={16} />
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '15px', color: '#101828' }}>{seller.rating}</span>
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085' }}>({seller.reviewCount.toLocaleString()} reviews)</span>
                    </div>
                  </div>
                  <button onClick={() => setShowRev(s => !s)}
                    style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px', color: '#A54AFF', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                    {showRev ? 'Show less' : 'See all'}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: '16px', padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <img src={r.avatar} alt={r.author} style={{ width: '44px', height: '44px', borderRadius: '9999px', objectFit: 'cover', border: '2px solid #DFBAFF', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px', color: '#101828' }}>{r.author}</p>
                            <Stars n={r.rating} size={13} />
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#98A2B3' }}>{r.date}</p>
                            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#A54AFF', fontWeight: 500 }}>{r.favor}</p>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#475467', lineHeight: '1.65' }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT sticky sidebar ── */}
            <div style={{ position: 'sticky', top: '108px', alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Contact card */}
              <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(16,24,40,0.06)' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #EAECF0' }}>
                  <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '17px', color: '#101828', marginBottom: '4px' }}>Get in touch</p>
                  <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085' }}>Responds {seller.responseTime}</p>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <button onClick={() => setAuthOpen(true)}
                    style={{ width: '100%', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', background: GRAD, border: 'none', borderRadius: '9999px', padding: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(165,74,255,0.25)', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
                    Send a message
                  </button>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: '20px', padding: '20px 22px' }}>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '15px', color: '#101828', marginBottom: '14px' }}>Quick stats</p>
                {[
                  { label: 'Favors completed', value: seller.completedJobs.toLocaleString() },
                  { label: 'On-time delivery',  value: '98%' },
                  { label: 'Order completion',  value: '97%' },
                  { label: 'Repeat clients',    value: '76%' },
                ].map((s, i, arr) => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #F2F4F7' : 'none' }}>
                    <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#475467' }}>{s.label}</span>
                    <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '14px', color: '#101828' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Explore best providers — full width, standard seller card ── */}
        <div style={{ background: '#F8F0FF', borderTop: '1px solid #EAECF0', padding: '64px 0' }}>
          <div style={{ maxWidth: '1376px', margin: '0 auto', padding: '0 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', fontWeight: 600, color: '#A54AFF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Top rated</p>
                <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '24px', color: '#101828' }}>Explore best favor providers</h2>
              </div>
              <button onClick={() => router.push('/explore/search?type=sellers')}
                style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px', color: '#A54AFF', background: '#fff', border: '1.5px solid #A54AFF', borderRadius: '9999px', padding: '10px 24px', cursor: 'pointer' }}>
                See all
              </button>
            </div>

            {/* Standard seller cards (matching TopSellersSection) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
              {EXPLORE_PROVIDERS.map(p => (
                <div key={p.id} onClick={() => router.push(`/seller/${p.id}`)}
                  style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #EAECF0', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s', overflow: 'hidden' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(165,74,255,0.3)'; el.style.boxShadow = '0 8px 24px rgba(165,74,255,0.1)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#EAECF0'; el.style.boxShadow = 'none'; }}>

                  {/* Portrait photo with badge */}
                  <div style={{ position: 'relative', padding: '10px 10px 0' }}>
                    <div style={{ height: '220px', borderRadius: '14px', overflow: 'hidden', background: '#F8F0FF' }}>
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                    </div>
                    <div style={{ position: 'absolute', top: '20px', left: '20px', background: p.badge === 'Pro' ? '#A54AFF' : '#344054', borderRadius: '9999px', padding: '4px 12px', fontFamily: 'Poppins,sans-serif', fontSize: '11px', fontWeight: 700, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.16)' }}>
                      {p.badge}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '14px 16px 18px' }}>
                    <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '16px', color: '#101828', marginBottom: '6px' }}>{p.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                      <svg viewBox="0 0 24 24" width="14" height="14"><polygon fill="#F79009" stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '13px', color: '#101828' }}>{p.rating}</span>
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#D0D5DD' }}>|</span>
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#667085' }}>{p.reviews} reviews</span>
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#D0D5DD' }}>/</span>
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#667085' }}>{p.completedJobs} jobs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Message modal */}
      {msgOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setMsgOpen(false); }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setMsgOpen(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '480px', zIndex: 1, boxShadow: '0 24px 48px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <img src={seller.avatar} alt={seller.name} style={{ width: '48px', height: '48px', borderRadius: '9999px', objectFit: 'cover', border: '2px solid #DFBAFF' }} />
              <div>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '16px', color: '#101828' }}>Message {seller.name}</p>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#667085' }}>Usually responds {seller.responseTime}</p>
              </div>
            </div>
            <textarea value={msgText} onChange={e => setMsgText(e.target.value)}
              placeholder={`Hi ${seller.name}! I'm interested in your services...`}
              style={{ width: '100%', height: '130px', border: '1.5px solid #D0D5DD', borderRadius: '12px', padding: '12px 14px', fontFamily: 'Poppins,sans-serif', fontSize: '14px', resize: 'none', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#A54AFF'; }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD'; }} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => setMsgOpen(false)} style={{ flex: 1, fontFamily: 'Poppins,sans-serif', fontSize: '14px', fontWeight: 600, color: '#344054', background: '#F9FAFB', border: '1.5px solid #D0D5DD', borderRadius: '9999px', padding: '12px', cursor: 'pointer' }}>Cancel</button>
              <button style={{ flex: 2, fontFamily: 'Poppins,sans-serif', fontSize: '14px', fontWeight: 700, color: '#fff', background: GRAD, border: 'none', borderRadius: '9999px', padding: '12px', cursor: 'pointer' }}>Send Message</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
