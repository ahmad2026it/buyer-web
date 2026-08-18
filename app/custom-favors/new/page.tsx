'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BRAND = '#A54AFF';
const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const PILL  = '9999px';
const FONT  = 'Poppins, sans-serif';

const SERVICE_TYPES = ['Cleaning','Plumbing','Electrician','Carpentry','Painting','Assembly','Gardening','Moving','Laundry','Tutoring','Pet Care','Others'];
const MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const YEARS  = [2025,2026,2027,2028,2029];
const HOURS  = ['1','2','3','4','5','6','7','8','9','10','11','12'];

const LOCS = [
  { id: 'work', label: 'Work', address: '12 Street, Apt. 4, Lower lake, Downtown, TX' },
  { id: 'home', label: 'Home', address: '45 Oak Avenue, Westside, TX' },
];

const REC_SELLERS = [
  { id: 's1', name: 'The Bright Services', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&auto=format&q=80', badge: 'Pro',  rating: '4.8', reviews: '8,89', distance: '8 miles away' },
  { id: 's2', name: 'Kyle Stanford',       avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format&q=80', badge: 'Pro',  rating: '4.8', reviews: '8,89', distance: '8 miles away' },
  { id: 's3', name: 'Bright Team Co.',     avatar: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=80&h=80&fit=crop&auto=format&q=80', badge: 'Team', rating: '4.9', reviews: '5,21', distance: '12 miles away' },
  { id: 's4', name: 'Maria Santos',        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format&q=80', badge: 'Pro',  rating: '4.7', reviews: '3,10', distance: '5 miles away' },
];

function getCalDays(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay();
  const last  = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= last; d++) cells.push(d);
  return cells;
}

function isPast(y: number, m: number, d: number) {
  const date = new Date(y, m, d); date.setHours(0,0,0,0);
  const now  = new Date();        now.setHours(0,0,0,0);
  return date < now;
}

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#ECFDF3' : active ? BRAND : '#F2F4F7', border: done ? '2px solid #079455' : active ? 'none' : '2px solid #EAECF0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {done
        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#079455" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        : <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: active ? '#fff' : '#98A2B3' }}>{n}</span>
      }
    </div>
  );
}

function StepLabel({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: done ? '#079455' : active ? BRAND : '#98A2B3' }}>
      {label}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: '#101828', marginBottom: 8, lineHeight: 1.45 }}>{children}</p>;
}

function PillInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', fontFamily: FONT, fontSize: 14, color: '#101828', background: '#fff', border: '1.5px solid #D0D5DD', borderRadius: PILL, padding: '12px 16px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
      onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = BRAND; }}
      onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD'; }}
    />
  );
}

const selSt: React.CSSProperties = {
  fontFamily: FONT, fontSize: 14, color: '#101828',
  background: '#fff', border: '1.5px solid #D0D5DD', borderRadius: PILL,
  padding: '12px 40px 12px 16px', outline: 'none',
  appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
  boxSizing: 'border-box', width: '100%', transition: 'border-color 0.15s',
};

function SectionCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #EAECF0', borderRadius: 20, padding: 24, ...style }}>
      {children}
    </div>
  );
}

export default function NewCustomFavorPage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const [step,        setStep]        = useState(1);
  const [serviceType,      setServiceType]      = useState('');
  const [customType,       setCustomType]       = useState('');
  const [title,            setTitle]            = useState('');
  const [description,      setDescription]      = useState('');
  const [budget,           setBudget]           = useState('');
  const [sellersRequired,  setSellersRequired]  = useState('1');
  const [media,       setMedia]       = useState<string[]>([]);
  const [calYear,     setCalYear]     = useState(today.getFullYear());
  const [calMonth,    setCalMonth]    = useState(today.getMonth());
  const [selDay,      setSelDay]      = useState<number | null>(null);
  const [hour,        setHour]        = useState('8');
  const [period,      setPeriod]      = useState<'AM'|'PM'>('AM');
  const [locId,       setLocId]       = useState('work');
  const [inviteInput, setInviteInput] = useState('');
  const [invitedList, setInvitedList] = useState<Array<{ id: string; name: string; email: string; avatar?: string }>>([]);
  const [invitedSellers, setInvitedSellers] = useState<Set<string>>(new Set());
  const [done,        setDone]        = useState(false);

  const days  = getCalDays(calYear, calMonth);
  const loc   = LOCS.find(l => l.id === locId)!;
  const dateStr = selDay ? `${MONTHS_SHORT[calMonth]} ${selDay}, ${calYear}` : '—';

  const prevMo = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1);
  };
  const nextMo = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1);
  };

  const addMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMedia(prev => [...prev, URL.createObjectURL(file)]);
    e.target.value = '';
  };

  const handleInviteByInput = () => {
    const val = inviteInput.trim();
    if (!val) return;
    const alreadyInvited = invitedList.some(i => i.email === val || i.name === val);
    if (alreadyInvited) return;
    setInvitedList(prev => [...prev, {
      id: `manual-${Date.now()}`,
      name: val.includes('@') ? '' : val,
      email: val.includes('@') ? val : `${val}@example.com`,
    }]);
    setInviteInput('');
  };

  const toggleSellerInvite = (id: string) => {
    setInvitedSellers(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  /* ── Success state ── */
  if (done) return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 20px 48px rgba(16,24,40,0.1)', margin: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ECFDF3', border: '2px solid #A9EFC5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#079455" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, color: '#101828', marginBottom: 10 }}>Favor Posted!</h2>
          <p style={{ fontFamily: FONT, fontSize: 15, color: '#667085', lineHeight: 1.7, marginBottom: 32 }}>
            Your custom favor has been created. Sellers will start sending requests soon.
          </p>
          <button
            onClick={() => router.push('/custom-favors')}
            style={{ width: '100%', fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(165,74,255,0.3)', marginBottom: 12, transition: 'opacity 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            View My Favors
          </button>
          <button
            onClick={() => { setDone(false); setStep(1); setTitle(''); setDescription(''); setBudget(''); setMedia([]); setSelDay(null); setInvitedList([]); setInvitedSellers(new Set()); setServiceType(''); setCustomType(''); }}
            style={{ width: '100%', fontFamily: FONT, fontWeight: 600, fontSize: 14, color: '#667085', background: '#fff', border: '1.5px solid #EAECF0', borderRadius: PILL, padding: 13, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
          >
            Create another favor
          </button>
        </div>
      </main>
      <Footer />
    </>
  );

  /* ── Step progress indicator ── */
  const Progress = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <StepDot n={1} active={step === 1} done={step > 1} />
        <StepLabel label="Describe" active={step === 1} done={step > 1} />
      </div>
      <div style={{ height: 2, flex: 1, background: step > 1 ? '#A9EFC5' : '#EAECF0', borderRadius: 1, margin: '0 8px', marginBottom: 18 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <StepDot n={2} active={step === 2} done={step > 2} />
        <StepLabel label="Schedule" active={step === 2} done={step > 2} />
      </div>
      <div style={{ height: 2, flex: 1, background: step > 2 ? '#A9EFC5' : '#EAECF0', borderRadius: 1, margin: '0 8px', marginBottom: 18 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <StepDot n={3} active={step === 3} done={false} />
        <StepLabel label="Invite Sellers" active={step === 3} done={false} />
      </div>
    </div>
  );

  /* ── Step 1: Describe Task ── */
  if (step === 1) return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F9FAFB', paddingTop: 96 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
          <Progress />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'flex-start' }}>

            {/* Left: task details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SectionCard>
                <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 17, color: '#101828', marginBottom: 22 }}>Describe your task</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Service type select */}
                  <div>
                    <FieldLabel>What type of service do you need?</FieldLabel>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={serviceType}
                        onChange={e => setServiceType(e.target.value)}
                        style={{ ...selSt, color: serviceType ? '#101828' : '#98A2B3' }}
                        onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = BRAND; }}
                        onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD'; }}
                      >
                        <option value="" disabled>Select a category</option>
                        {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>

                  {/* Custom type (if Others) */}
                  {serviceType === 'Others' && (
                    <div>
                      <FieldLabel>Mention your service type below</FieldLabel>
                      <PillInput value={customType} onChange={setCustomType} placeholder="Type here" />
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <FieldLabel>Write a clear title of your task</FieldLabel>
                    <PillInput value={title} onChange={setTitle} placeholder="Eg. I need car wash service at my door" />
                  </div>

                  {/* Description */}
                  <div>
                    <FieldLabel>Add description of your task</FieldLabel>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe your task scope and size, any constraints, additional notes for favor providers etc."
                      style={{ width: '100%', minHeight: 130, border: '1.5px solid #D0D5DD', borderRadius: 14, padding: '12px 14px', fontFamily: FONT, fontSize: 14, color: '#101828', resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6, transition: 'border-color 0.15s' }}
                      onFocus={e => { e.currentTarget.style.borderColor = BRAND; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#D0D5DD'; }}
                    />
                  </div>

                  {/* Budget + Sellers required row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <FieldLabel>Add your budget</FieldLabel>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: FONT, fontSize: 14, color: '#667085', pointerEvents: 'none' }}>$</span>
                        <input
                          type="number"
                          value={budget}
                          onChange={e => setBudget(e.target.value)}
                          placeholder="0"
                          min="0"
                          style={{ width: '100%', fontFamily: FONT, fontSize: 14, color: '#101828', background: '#fff', border: '1.5px solid #D0D5DD', borderRadius: PILL, padding: '12px 16px 12px 30px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                          onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = BRAND; }}
                          onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD'; }}
                        />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Sellers required</FieldLabel>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={sellersRequired}
                          onChange={e => setSellersRequired(e.target.value)}
                          style={{ ...selSt, color: '#101828' }}
                          onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = BRAND; }}
                          onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD'; }}
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} seller{n > 1 ? 's' : ''}</option>)}
                        </select>
                        <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Photos / videos */}
              <SectionCard>
                <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: '#101828', marginBottom: 4 }}>
                  Add photos/videos of place/objects to help seller know more about the service requirements.
                </p>
                <p style={{ fontFamily: FONT, fontSize: 13, color: '#98A2B3', marginBottom: 16, lineHeight: 1.5 }}>
                  Optional but recommended.
                </p>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', fontFamily: FONT, fontWeight: 600, fontSize: 14, color: BRAND, background: 'transparent', border: `1.5px solid ${BRAND}`, borderRadius: PILL, padding: '12px', cursor: 'pointer', marginBottom: 14, transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9F5FF'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round"/></svg>
                  Upload
                </button>
                <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={addMedia} />
                {media.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {media.map((src, i) => (
                      <div key={i} style={{ position: 'relative', width: 88, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          onClick={() => setMedia(prev => prev.filter((_, idx) => idx !== i))}
                          style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* Next button */}
              <button
                onClick={() => setStep(2)}
                disabled={!title || !serviceType || !budget}
                style={{ width: '100%', fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#fff', background: (!title || !serviceType || !budget) ? '#D0D5DD' : GRAD, border: 'none', borderRadius: PILL, padding: 14, cursor: (!title || !serviceType || !budget) ? 'not-allowed' : 'pointer', boxShadow: (!title || !serviceType || !budget) ? 'none' : '0 4px 14px rgba(165,74,255,0.28)', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { if (title && serviceType && budget) (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                Next: Schedule
              </button>
            </div>

            {/* Right: summary preview */}
            <div style={{ position: 'sticky', top: 104 }}>
              <SectionCard style={{ marginBottom: 16 }}>
                <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#101828', marginBottom: 16 }}>Your favor preview</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Service', value: serviceType === 'Others' ? (customType || '—') : (serviceType || '—') },
                    { label: 'Title', value: title || '—' },
                    { label: 'Budget', value: budget ? `$${budget}` : '—' },
                    { label: 'Sellers needed', value: `${sellersRequired}` },
                    { label: 'Photos', value: media.length > 0 ? `${media.length} attached` : 'None' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ fontFamily: FONT, fontSize: 13, color: '#667085' }}>{row.label}</span>
                      <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#101828', textAlign: 'right', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <div style={{ background: '#F4EBFF', border: '1px solid rgba(165,74,255,0.2)', borderRadius: 14, padding: '16px 18px' }}>
                <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: BRAND, marginBottom: 6 }}>How it works</p>
                {['Post your task with a budget', 'Sellers apply with their offers', 'You review and pick the best fit', 'Favor is confirmed and scheduled'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: i < 3 ? 8 : 0 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#fff' }}>{i + 1}</span>
                    </div>
                    <span style={{ fontFamily: FONT, fontSize: 13, color: '#344054', lineHeight: 1.5 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );

  /* ── Step 2: Date / Time / Location ── */
  if (step === 2) return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F9FAFB', paddingTop: 96 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
          <Progress />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'flex-start' }}>

            {/* Left: location */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SectionCard>
                <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 17, color: '#101828', marginBottom: 20 }}>Select location</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {LOCS.map(l => (
                    <div
                      key={l.id}
                      onClick={() => setLocId(l.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: `1.5px solid ${locId === l.id ? BRAND : '#EAECF0'}`, borderRadius: 14, cursor: 'pointer', background: locId === l.id ? '#F9F5FF' : '#fff', transition: 'all 0.15s' }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: locId === l.id ? '#EDE9FF' : '#F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={locId === l.id ? BRAND : '#667085'} strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke={locId === l.id ? BRAND : '#667085'} strokeWidth="2"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#101828', marginBottom: 2 }}>{l.label}</p>
                        <p style={{ fontFamily: FONT, fontSize: 12, color: '#667085', lineHeight: 1.4 }}>{l.address}</p>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${locId === l.id ? BRAND : '#D0D5DD'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {locId === l.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: BRAND }} />}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Selected summary */}
              <SectionCard>
                <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#101828', marginBottom: 14 }}>Booking summary</h3>
                {[
                  { label: 'Service', value: serviceType === 'Others' ? (customType || '—') : (serviceType || '—') },
                  { label: 'Date', value: dateStr },
                  { label: 'Time', value: `${hour}:00 ${period}` },
                  { label: 'Location', value: loc.label },
                  { label: 'Budget', value: budget ? `$${budget}` : '—' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #F2F4F7' }}>
                    <span style={{ fontFamily: FONT, fontSize: 13, color: '#667085' }}>{row.label}</span>
                    <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#101828', textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
              </SectionCard>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, fontFamily: FONT, fontWeight: 600, fontSize: 14, color: '#344054', background: '#fff', border: '1.5px solid #D0D5DD', borderRadius: PILL, padding: 13, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
                  Back
                </button>
                <button onClick={() => setStep(3)} disabled={!selDay} style={{ flex: 2, fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#fff', background: !selDay ? '#D0D5DD' : GRAD, border: 'none', borderRadius: PILL, padding: 13, cursor: !selDay ? 'not-allowed' : 'pointer', boxShadow: !selDay ? 'none' : '0 4px 14px rgba(165,74,255,0.28)', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => { if (selDay) (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
                  Next: Invite Sellers
                </button>
              </div>
            </div>

            {/* Right: calendar + time */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SectionCard>
                <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#101828', marginBottom: 16 }}>Select due date</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <button onClick={prevMo} style={{ width: 30, height: 30, borderRadius: '50%', background: '#F9FAFB', border: '1.5px solid #EAECF0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ value: calMonth, opts: MONTHS_FULL.map((m, i) => ({ v: i, l: MONTHS_SHORT[i] })), set: setCalMonth },
                      { value: calYear,  opts: YEARS.map(y => ({ v: y, l: String(y) })), set: setCalYear }].map((sel, si) => (
                      <div key={si} style={{ position: 'relative' }}>
                        <select value={sel.value} onChange={e => sel.set(+e.target.value)}
                          style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#101828', background: '#F9FAFB', border: '1.5px solid #EAECF0', borderRadius: PILL, padding: '6px 26px 6px 12px', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                          {sel.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round"/></svg>
                      </div>
                    ))}
                  </div>
                  <button onClick={nextMo} style={{ width: 30, height: 30, borderRadius: '50%', background: '#F9FAFB', border: '1.5px solid #EAECF0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontFamily: FONT, fontSize: 11, fontWeight: 600, color: '#98A2B3', padding: '4px 0' }}>{d}</div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                  {days.map((d, i) => {
                    if (!d) return <div key={`e${i}`} style={{ aspectRatio: '1' }} />;
                    const past = isPast(calYear, calMonth, d);
                    const sel  = selDay === d;
                    return (
                      <button key={i} onClick={() => !past && setSelDay(d)}
                        style={{ aspectRatio: '1', borderRadius: '50%', border: 'none', background: sel ? BRAND : 'transparent', color: sel ? '#fff' : past ? '#D0D5DD' : '#344054', fontFamily: FONT, fontSize: 12, fontWeight: sel ? 700 : 400, cursor: past ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => { if (!past && !sel) (e.currentTarget as HTMLElement).style.background = '#F4EBFF'; }}
                        onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >{d}</button>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard>
                <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 12 }}>Add preferred time</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <select value={hour} onChange={e => setHour(e.target.value)} style={{ fontFamily: FONT, fontSize: 13, color: '#101828', background: '#F9FAFB', border: '1.5px solid #EAECF0', borderRadius: PILL, padding: '9px 32px 9px 14px', outline: 'none', appearance: 'none', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>
                      {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                    </select>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                  <div style={{ position: 'relative', width: 80 }}>
                    <select value={period} onChange={e => setPeriod(e.target.value as 'AM'|'PM')} style={{ fontFamily: FONT, fontSize: 13, color: '#101828', background: '#F9FAFB', border: '1.5px solid #EAECF0', borderRadius: PILL, padding: '9px 28px 9px 14px', outline: 'none', appearance: 'none', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );

  /* ── Step 3: Invite Sellers ── */
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F9FAFB', paddingTop: 96 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
          <Progress />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'flex-start' }}>

            {/* Left: search + invited */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SectionCard>
                <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 17, color: '#101828', marginBottom: 6 }}>Invite a seller <span style={{ fontFamily: FONT, fontWeight: 400, fontSize: 14, color: '#98A2B3' }}>(optional)</span></h3>
                <p style={{ fontFamily: FONT, fontSize: 13, color: '#667085', marginBottom: 16, lineHeight: 1.5 }}>
                  Invite seller(s) to apply for this favor. Use comma to separate the users.
                </p>

                {/* Search row */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      value={inviteInput}
                      onChange={e => setInviteInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleInviteByInput(); }}
                      placeholder="Type Email or User ID here"
                      style={{ width: '100%', fontFamily: FONT, fontSize: 14, color: '#101828', background: '#fff', border: '1.5px solid #D0D5DD', borderRadius: PILL, padding: '11px 40px 11px 16px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                      onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = BRAND; }}
                      onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD'; }}
                    />
                    {inviteInput && (
                      <button onClick={() => setInviteInput('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#98A2B3' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Matched result (mock: show if typed something) */}
                {inviteInput.length > 2 && (
                  <div style={{ border: '1.5px solid #EAECF0', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff' }}>
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format&q=80" alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#101828', marginBottom: 2 }}>James Doe</p>
                        <p style={{ fontFamily: FONT, fontSize: 12, color: '#667085' }}>{inviteInput}</p>
                      </div>
                      <button
                        onClick={() => {
                          setInvitedList(prev => {
                            if (prev.some(p => p.email === inviteInput)) return prev;
                            return [...prev, { id: 'james-doe', name: 'James Doe', email: inviteInput, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format&q=80' }];
                          });
                          setInviteInput('');
                        }}
                        style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: BRAND, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', flexShrink: 0 }}
                      >
                        Invite
                      </button>
                    </div>
                  </div>
                )}

                {/* Invited members list */}
                {invitedList.length > 0 && (
                  <div>
                    <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: '#344054', marginBottom: 10 }}>Invited members</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {invitedList.map(member => (
                        <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F9FAFB', borderRadius: 12 }}>
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EAECF0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="#98A2B3" strokeWidth="2"/></svg>
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {member.name && <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: '#101828', marginBottom: 2 }}>{member.name}</p>}
                            <p style={{ fontFamily: FONT, fontSize: 12, color: '#667085', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</p>
                          </div>
                          <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#079455', flexShrink: 0 }}>Invite sent</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* Footer buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, fontFamily: FONT, fontWeight: 600, fontSize: 14, color: '#344054', background: '#fff', border: '1.5px solid #D0D5DD', borderRadius: PILL, padding: 13, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
                  Back
                </button>
                <button
                  onClick={() => setDone(true)}
                  style={{ flex: 2, fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#fff', background: GRAD, border: 'none', borderRadius: PILL, padding: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(165,74,255,0.28)', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                >
                  Create Favor
                </button>
              </div>
            </div>

            {/* Right: recommended sellers */}
            <div>
              <SectionCard>
                <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#101828', marginBottom: 16 }}>Recommended sellers</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {REC_SELLERS.map(seller => {
                    const isInvited = invitedSellers.has(seller.id);
                    return (
                      <div key={seller.id} style={{ background: '#F9FAFB', borderRadius: 16, padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: `1.5px solid ${isInvited ? BRAND : '#EAECF0'}`, transition: 'border-color 0.15s' }}>
                        <div style={{ position: 'relative' }}>
                          <img src={seller.avatar} alt={seller.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                          <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />
                          <span style={{ position: 'absolute', top: -4, right: -6, fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#fff', background: seller.badge === 'Pro' ? '#A54AFF' : '#344054', borderRadius: PILL, padding: '2px 6px' }}>
                            {seller.badge}
                          </span>
                        </div>
                        <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: '#101828', textAlign: 'center', lineHeight: 1.3 }}>{seller.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg viewBox="0 0 24 24" width="12" height="12"><polygon fill="#F79009" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: '#344054' }}>{seller.rating}</span>
                          <span style={{ fontFamily: FONT, fontSize: 11, color: '#D0D5DD' }}>|</span>
                          <span style={{ fontFamily: FONT, fontSize: 11, color: '#667085' }}>{seller.reviews} reviews</span>
                        </div>
                        <p style={{ fontFamily: FONT, fontSize: 11, color: '#DC6803', fontWeight: 500 }}>{seller.distance}</p>
                        <button
                          onClick={() => toggleSellerInvite(seller.id)}
                          style={{ width: '100%', fontFamily: FONT, fontWeight: 700, fontSize: 13, color: isInvited ? '#079455' : BRAND, background: isInvited ? '#ECFDF3' : 'transparent', border: `1.5px solid ${isInvited ? '#A9EFC5' : BRAND}`, borderRadius: PILL, padding: '8px 0', cursor: 'pointer', transition: 'all 0.15s' }}
                        >
                          {isInvited ? 'Invite sent' : 'Invite'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
