'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BRAND = '#A54AFF';

/* ── Shared typography styles ─────────────────────────────────────────────── */
const FONT = 'Poppins, sans-serif';
const h2S: React.CSSProperties = { fontFamily: FONT, fontWeight: 700, fontSize: '22px', color: '#101828', lineHeight: '1.35', marginTop: '44px', marginBottom: '14px' };
const pS:  React.CSSProperties = { fontFamily: FONT, fontSize: '15px', color: '#344054', lineHeight: '1.85', marginBottom: '20px' };
const liS: React.CSSProperties = { fontFamily: FONT, fontSize: '15px', color: '#344054', lineHeight: '1.8', marginBottom: '8px', paddingLeft: '8px' };
const bqS: React.CSSProperties = { borderLeft: `4px solid ${BRAND}`, paddingLeft: '20px', margin: '28px 0', fontFamily: FONT, fontSize: '16px', fontStyle: 'italic', color: '#5B21B6', lineHeight: '1.75' };
const imgS: React.CSSProperties = { width: '100%', height: '280px', objectFit: 'cover', borderRadius: '16px', margin: '32px 0', display: 'block' };

function ArticleImage({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} style={imgS} />;
}

/* ── Article content by slug ─────────────────────────────────────────────── */
type ArticleMeta = {
  title: string;
  category: string;
  bannerImg: string;
  bannerAlt: string;
  date: string;
  readTime: string;
};

const META: Record<string, ArticleMeta> = {
  'deep-home-cleaning': {
    title: 'Deep Home Cleaning: A Complete Guide for Homeowners',
    category: 'Home Cleaning',
    bannerImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=580&fit=crop&auto=format',
    bannerAlt: 'Professional deep home cleaning',
    date: 'July 26, 2025',
    readTime: '6 min read',
  },
  'how-it-works': {
    title: 'How WhoCan Connects You with the Right Handyman',
    category: 'Platform',
    bannerImg: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&h=580&fit=crop&auto=format',
    bannerAlt: 'Handyman consulting a homeowner',
    date: 'July 20, 2025',
    readTime: '5 min read',
  },
  'trusted-local-providers': {
    title: 'Trusted Local Providers: How WhoCan Verifies Every Professional',
    category: 'Trust & Safety',
    bannerImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&h=580&fit=crop&auto=format&q=80',
    bannerAlt: 'Trusted local service provider',
    date: 'July 15, 2025',
    readTime: '7 min read',
  },
};

function Content1() {
  return (
    <>
      <p style={pS}>
        A clean home is more than just aesthetics — it's about health, comfort, and peace of mind. While regular tidying keeps day-to-day messes at bay, a deep clean is what truly refreshes your living space from top to bottom. Whether you're preparing for a big event, moving into a new home, or simply overdue for a thorough refresh, this guide covers everything you need to know.
      </p>

      <h2 style={h2S}>What Is Deep Cleaning (vs. Regular Cleaning)?</h2>
      <p style={pS}>
        Regular cleaning — vacuuming, wiping counters, mopping floors — maintains surface-level cleanliness. Deep cleaning goes several steps further. It targets the areas that accumulate grime over months: behind appliances, inside ovens, baseboards, grout lines, ceiling fans, and upholstery.
      </p>
      <p style={pS}>
        Think of it like the difference between brushing your teeth every day and getting a professional dental cleaning twice a year. Both matter — they serve different purposes.
      </p>

      <h2 style={h2S}>What's Included in a Professional Deep Clean?</h2>
      <ArticleImage
        src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&h=400&fit=crop&auto=format"
        alt="Professional cleaning a kitchen thoroughly"
      />
      <p style={pS}>A professional deep cleaning session through WhoCan typically covers:</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
        {['Kitchen: cleaning inside oven and refrigerator, degreasing stovetop, scrubbing sink and faucets', 'Bathrooms: descaling tiles and grout, disinfecting toilet inside and out, cleaning exhaust fans', 'Living areas: dusting ceiling fans and light fixtures, cleaning skirting boards, wiping window frames', 'Bedrooms: cleaning under beds and behind furniture, sanitising wardrobes, vacuuming mattresses', 'Floors: detailed scrubbing of floor edges and corners, cleaning under furniture'].map(item => (
          <li key={item} style={liS}>{item}</li>
        ))}
      </ul>

      <h2 style={h2S}>How to Prepare for a Deep Cleaning Service</h2>
      <p style={pS}>
        Getting the most out of your booking starts before the cleaner arrives. Here's how to set them up for success:
      </p>
      <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
        {['Declutter first — put away personal items, clothes, and dishes so the cleaner can focus on cleaning, not organising', 'Make a priority list of areas you want extra attention on and share it when booking', 'Ensure access to all rooms and storage areas to be cleaned', 'Secure pets in a safe space if you have them'].map(item => (
          <li key={item} style={liS}>{item}</li>
        ))}
      </ul>

      <blockquote style={bqS}>
        "After a deep clean with WhoCan, my apartment felt like a completely different space. It took less than three hours and I could finally breathe easily in my own home."
        <br /><span style={{ fontStyle: 'normal', fontSize: '13px', color: '#7C3AED', marginTop: '8px', display: 'block' }}>— Verified WhoCan customer</span>
      </blockquote>

      <h2 style={h2S}>How Often Should You Deep Clean?</h2>
      <p style={pS}>
        Most home care experts recommend a thorough deep clean every 3 to 6 months, depending on the size of your home, number of occupants, and whether you have pets or young children. Allergy sufferers or those with respiratory conditions may benefit from more frequent deep cleans.
      </p>
      <p style={pS}>
        Signs it's time for a deep clean: persistent musty odours, visible buildup in kitchen and bathroom grout, allergy symptoms worsening indoors, or simply having skipped a proper clean for over six months.
      </p>

      <h2 style={h2S}>Why Choose a Professional Over DIY?</h2>
      <ArticleImage
        src="https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=900&h=400&fit=crop&auto=format"
        alt="Professional cleaner with equipment"
      />
      <p style={pS}>
        DIY deep cleaning is possible — but it's time-consuming, physically demanding, and often less thorough without commercial-grade equipment and cleaning products. A professional from WhoCan brings the tools, expertise, and efficiency that make a real difference.
      </p>
      <p style={pS}>
        Beyond the practical benefits, booking through WhoCan gives you a verified, reviewed, and rated professional — not a random hire. Every provider on our platform has passed background checks and has a track record of satisfied customers you can see before booking.
      </p>
    </>
  );
}

function Content2() {
  return (
    <>
      <p style={pS}>
        Finding a reliable handyman used to mean asking neighbours for recommendations or taking a chance on whoever had a flyer on the noticeboard. WhoCan changes that entirely — connecting you with skilled local service providers through a transparent, review-driven platform built around your needs.
      </p>

      <h2 style={h2S}>Browse by Category or Service Type</h2>
      <p style={pS}>
        Start by browsing the WhoCan app or website by category — from cleaning and plumbing to carpentry and electrical work. Each category lists available providers in your area along with their ratings, completed jobs, and starting rates.
      </p>
      <ArticleImage
        src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&h=400&fit=crop&auto=format"
        alt="A skilled handyman at work"
      />

      <h2 style={h2S}>View Real Reviews from Real Customers</h2>
      <p style={pS}>
        Every review on WhoCan is tied to a verified booking — which means you're reading genuine feedback, not anonymous posts. You can see how many jobs a provider has completed, their average rating, and specific comments left by customers in similar situations to yours.
      </p>
      <blockquote style={bqS}>
        "I found my regular handyman through WhoCan six months ago. He's done five jobs for me since — everything from fixing my kitchen sink to assembling my office furniture. Knowing I can trust him without worrying is worth everything."
        <br /><span style={{ fontStyle: 'normal', fontSize: '13px', color: '#7C3AED', marginTop: '8px', display: 'block' }}>— Sadia M., Lahore</span>
      </blockquote>

      <h2 style={h2S}>Describe Your Job and Get Matched</h2>
      <p style={pS}>
        Not sure which provider to choose? Describe your job — the type of service, your location, and your preferred date — and WhoCan surfaces providers best suited to your needs. Our matching considers category expertise, location proximity, availability, and historical performance.
      </p>

      <h2 style={h2S}>Book, Track, and Pay — All in One Place</h2>
      <ArticleImage
        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=400&fit=crop&auto=format"
        alt="Mobile app showing booking interface"
      />
      <p style={pS}>
        Once you've chosen a provider, booking takes under two minutes. You'll receive confirmation, can track the provider's arrival, and communicate directly through the app. Payment is handled securely through the platform — released to the provider only when you confirm the job is done to your satisfaction.
      </p>
      <p style={pS}>
        No cash on hand. No awkward negotiations. No chasing invoices. Just a job done well.
      </p>

      <h2 style={h2S}>Leave a Review and Help the Community</h2>
      <p style={pS}>
        After each job, you're invited to leave a rating and review. Your feedback helps other customers make informed choices and helps great providers build their reputation on the platform. It takes 60 seconds and makes a real difference.
      </p>
    </>
  );
}

function Content3() {
  return (
    <>
      <p style={pS}>
        Bringing a stranger into your home to do repair or maintenance work requires trust. At WhoCan, we take that responsibility seriously. Our provider verification process is one of the most thorough in the local services industry — because your safety and satisfaction aren't optional extras, they're the product.
      </p>

      <h2 style={h2S}>Step 1: Identity and Background Verification</h2>
      <p style={pS}>
        Every service provider on WhoCan submits a government-issued identity document before their profile goes live. Our team verifies the identity and runs a background check to screen for any history of fraud, theft, or violent offences.
      </p>
      <p style={pS}>
        Providers with flags in their background history are not approved for the platform. This is a hard filter — no exceptions.
      </p>

      <h2 style={h2S}>Step 2: Skills Assessment and Portfolio Review</h2>
      <ArticleImage
        src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=400&fit=crop&auto=format"
        alt="Professional reviewing work portfolio"
      />
      <p style={pS}>
        For skilled trades — electrical work, plumbing, carpentry, and HVAC — providers are required to submit relevant certifications or licensing where applicable. For general handyman services, we review their work portfolio and, in many cases, conduct a skills interview.
      </p>
      <p style={pS}>
        This ensures that the person arriving at your door has the knowledge to do the job properly — not just the confidence to say they can.
      </p>

      <blockquote style={bqS}>
        "I've had providers from two other platforms let me down badly. With WhoCan, the quality has been consistently high because they actually screen the people they send."
        <br /><span style={{ fontStyle: 'normal', fontSize: '13px', color: '#7C3AED', marginTop: '8px', display: 'block' }}>— Ahsan K., Islamabad</span>
      </blockquote>

      <h2 style={h2S}>Step 3: Ongoing Performance Monitoring</h2>
      <p style={pS}>
        Verification doesn't end when a provider joins the platform. Every completed job generates a customer rating. Providers who fall below a 4.0 rating threshold receive a performance warning and a support review. Those who remain consistently below standard are removed from the platform.
      </p>
      <p style={pS}>
        Our customer support team also reviews any dispute or complaint filed against a provider, with a target resolution time of 24 hours.
      </p>

      <h2 style={h2S}>What Happens If You're Not Satisfied?</h2>
      <ArticleImage
        src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&h=400&fit=crop&auto=format"
        alt="Customer support team"
      />
      <p style={pS}>
        WhoCan's payment system holds funds in escrow until you confirm the job is complete. If the work doesn't meet your expectations:
      </p>
      <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
        {['Flag the issue through the app before confirming payment release', 'Our support team reviews the case within 24 hours', 'You may be eligible for a partial or full refund depending on the circumstances', 'The provider is given the opportunity to return and rectify the issue at no extra cost'].map(item => (
          <li key={item} style={liS}>{item}</li>
        ))}
      </ul>
      <p style={pS}>
        We hold every booking to a high standard — because when you choose WhoCan, you deserve the job done right the first time.
      </p>
    </>
  );
}

const CONTENT_MAP: Record<string, React.ReactNode> = {
  'deep-home-cleaning': <Content1 />,
  'how-it-works': <Content2 />,
  'trusted-local-providers': <Content3 />,
};

/* ── Share Button ─────────────────────────────────────────────────────────── */
function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title, url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      onClick={handleShare}
      title="Share this article"
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontFamily: FONT, fontSize: '13px', fontWeight: 600,
        color: copied ? '#059669' : '#667085',
        background: copied ? '#ECFDF3' : '#F9FAFB',
        border: `1.5px solid ${copied ? '#A7F3D0' : '#EAECF0'}`,
        borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {copied ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="16 6 12 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Share
        </>
      )}
    </button>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function ArticlePage() {
  const params  = useParams<{ slug: string }>();
  const router  = useRouter();
  const slug    = params.slug ?? '';
  const meta    = META[slug];
  const content = CONTENT_MAP[slug];

  useEffect(() => {
    if (!meta && slug) {
      router.replace(`/blog/${slug}`);
    }
  }, [meta, router, slug]);

  if (!meta) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: '28px', color: '#101828' }}>Opening article…</h1>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ background: '#FAFAFA', minHeight: '100vh' }}>

        {/* ── Banner ──────────────────────────────────────────────────────── */}
        <div style={{ position: 'relative', height: '500px', overflow: 'hidden', marginTop: '0' }}>
          <img src={meta.bannerImg} alt={meta.bannerAlt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 44px', maxWidth: '860px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: BRAND, borderRadius: '9999px', padding: '4px 14px', marginBottom: '16px' }}>
              <span style={{ fontFamily: FONT, fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{meta.category}</span>
            </div>
            <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '32px', color: '#ffffff', lineHeight: '1.25', letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              {meta.title}
            </h1>
          </div>
        </div>

        {/* ── Article body ────────────────────────────────────────────────── */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px 80px' }}>

          {/* Meta bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '24px 0', borderBottom: '1px solid #EAECF0', marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: '14px', color: '#101828', lineHeight: '1.2' }}>WhoCan Team</p>
                <p style={{ fontFamily: FONT, fontSize: '12px', color: '#667085' }}>{meta.date} · {meta.readTime}</p>
              </div>
            </div>
            <ShareButton title={meta.title} />
          </div>

          {/* Article content */}
          {content}

          {/* CTA */}
          <div style={{ marginTop: '56px', borderRadius: '20px', background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)', padding: '40px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: '22px', color: '#fff', marginBottom: '8px' }}>Ready to book a service?</h3>
              <p style={{ fontFamily: FONT, fontSize: '14px', color: 'rgba(255,255,255,0.82)', lineHeight: '1.6' }}>Find verified providers near you and get the job done right, the first time.</p>
            </div>
            <button
              onClick={() => router.push('/explore/search')}
              style={{ fontFamily: FONT, fontWeight: 700, fontSize: '15px', color: BRAND, background: '#fff', border: 'none', borderRadius: '9999px', padding: '14px 32px', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
            >
              Browse Services
            </button>
          </div>

          {/* Back link */}
          <button
            onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '40px', fontFamily: FONT, fontSize: '13px', fontWeight: 600, color: '#667085', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
