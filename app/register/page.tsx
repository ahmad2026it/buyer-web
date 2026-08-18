'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/* ── Figma assets (node 15822:33025 — Choose work mode) ── */
const IMG_WORKER_SINGLE = 'https://www.figma.com/api/mcp/asset/5686c27a-198c-4dbf-a26d-6913d74961a6.png';
const IMG_GRID_VERTICAL = 'https://www.figma.com/api/mcp/asset/23f703d7-2041-4fbe-829a-5c98be4b5c02.svg';
const IMG_GRID_HORIZONTAL = 'https://www.figma.com/api/mcp/asset/68bd8e29-243c-403c-9f71-a952078fc521.svg';

const BRAND = '#A54AFF';
const BRAND_GRAD = 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)';

/* ── Logo SVG ─────────────────────────────────────────── */
function WhoCanLogo({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.201)} viewBox="0 0 159 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.3728 2.47801C20.6978 0.134223 23.6737 -0.692738 26.0197 0.630946C28.3657 1.95464 29.1935 4.9277 27.8685 7.27149L15.5022 29.1471C14.1772 31.4909 11.2013 32.3179 8.8553 30.9942C6.50929 29.6705 5.68154 26.6974 7.00648 24.3536L19.3728 2.47801Z" fill="#9643E8"/>
      <path d="M1.26277 2.15119C3.04388 -0.22362 6.41297 -0.704966 8.7878 1.07612C11.1626 2.85723 11.644 6.22632 9.86287 8.60114L9.67537 8.85114C7.89426 11.226 4.52517 11.7073 2.15034 9.92622C-0.224467 8.14511 -0.705813 4.77601 1.07527 2.40119L1.26277 2.15119Z" fill="#9643E8"/>
      <path d="M10.625 3.62592C10.9375 4.81342 11.0625 6.18842 12.8125 6.50092C14.125 6.68842 15.5833 6.52175 16.1875 6.31342C17.6547 5.84183 18.785 4.82845 19.3208 4.04669L19.5625 3.62592C19.5053 3.75387 19.4241 3.89597 19.3208 4.04669L14.908 11.7282C14.7975 11.9949 14.65 12.2399 14.5 12.4384L14.908 11.7282C15.3193 10.7352 15.2167 9.44123 12.8125 9.12592C9.76248 8.72592 9.1875 9.56342 8.3125 10.1259L10.625 3.62592Z" fill="#9643E8"/>
      <path d="M34.8734 2.47769C36.1984 0.134178 39.174 -0.692603 41.5198 0.631014C43.8658 1.95472 44.6934 4.92787 43.3685 7.27164L31.0023 29.1466C29.6774 31.4903 26.7017 32.3177 24.3558 30.9943C22.0099 29.6707 21.1814 26.6974 22.5062 24.3537L34.8734 2.47769ZM28.722 23.8859C27.3108 22.8335 25.3087 23.1174 24.2503 24.5207L24.139 24.6681C23.0806 26.0713 23.3666 28.062 24.7777 29.1144C26.1888 30.1668 28.1909 29.8827 29.2493 28.4796L29.3607 28.3322C30.419 26.929 30.1331 24.9383 28.722 23.8859Z" fill="#9643E8"/>
      <path d="M60.1314 11.1925C61.5301 11.1925 62.7957 11.4848 63.928 12.0694C65.0604 12.6316 65.9485 13.5086 66.5924 14.7004C67.2585 15.8922 67.5915 17.4325 67.5915 19.3214V29.7778H61.2637V20.3671C61.2637 19.0628 60.9973 18.1184 60.4644 17.5337C59.9537 16.9266 59.2322 16.623 58.2996 16.623C57.6336 16.623 57.023 16.7804 56.4679 17.0952C55.9128 17.3876 55.4799 17.8485 55.169 18.4782C54.8582 19.1078 54.7028 19.9286 54.7028 20.9405V29.7778H48.375V4.75H54.7028V16.6905L53.2374 15.1726C53.9257 13.8459 54.8693 12.8565 56.0683 12.2044C57.2672 11.5298 58.6216 11.1925 60.1314 11.1925Z" fill="#212121"/>
      <path d="M80.8507 30.0814C78.8747 30.0814 77.1206 29.6766 75.5887 28.8671C74.0567 28.0575 72.8466 26.9444 71.9585 25.5278C71.0926 24.0886 70.6596 22.4471 70.6596 20.6032C70.6596 18.7593 71.0926 17.129 71.9585 15.7123C72.8466 14.2956 74.0567 13.1938 75.5887 12.4067C77.1206 11.5972 78.8747 11.1925 80.8507 11.1925C82.8268 11.1925 84.5808 11.5972 86.1128 12.4067C87.667 13.1938 88.877 14.2956 89.7429 15.7123C90.6088 17.129 91.0418 18.7593 91.0418 20.6032C91.0418 22.4471 90.6088 24.0886 89.7429 25.5278C88.877 26.9444 87.667 28.0575 86.1128 28.8671C84.5808 29.6766 82.8268 30.0814 80.8507 30.0814ZM80.8507 24.9881C81.5834 24.9881 82.2273 24.8194 82.7823 24.4821C83.3596 24.1448 83.8148 23.6501 84.1478 22.998C84.4809 22.3234 84.6474 21.5251 84.6474 20.6032C84.6474 19.6812 84.4809 18.9054 84.1478 18.2758C83.8148 17.6237 83.3596 17.129 82.7823 16.7917C82.2273 16.4544 81.5834 16.2857 80.8507 16.2857C80.1402 16.2857 79.4963 16.4544 78.9191 16.7917C78.364 17.129 77.9088 17.6237 77.5536 18.2758C77.2206 18.9054 77.054 19.6812 77.054 20.6032C77.054 21.5251 77.2206 22.3234 77.5536 22.998C77.9088 23.6501 78.364 24.1448 78.9191 24.4821C79.4963 24.8194 80.1402 24.9881 80.8507 24.9881Z" fill="#212121"/>
      <path d="M105.896 30.25C104.053 30.25 102.344 29.9577 100.767 29.373C99.2129 28.7659 97.8585 27.9114 96.704 26.8095C95.5717 25.7077 94.6836 24.4147 94.0397 22.9306C93.3958 21.4239 93.0739 19.7712 93.0739 17.9722C93.0739 16.1733 93.3958 14.5317 94.0397 13.0476C94.6836 11.541 95.5717 10.2368 96.704 9.13492C97.8585 8.03307 99.2129 7.18982 100.767 6.60516C102.344 5.99802 104.053 5.69444 105.896 5.69444C108.05 5.69444 109.97 6.07672 111.658 6.84127C113.367 7.60582 114.788 8.70767 115.92 10.1468L111.724 13.9921C110.969 13.0926 110.137 12.4067 109.226 11.9345C108.338 11.4623 107.339 11.2262 106.229 11.2262C105.274 11.2262 104.397 11.3836 103.598 11.6984C102.799 12.0132 102.11 12.4742 101.533 13.0813C100.978 13.666 100.534 14.3743 100.201 15.2063C99.8901 16.0384 99.7347 16.9603 99.7347 17.9722C99.7347 18.9841 99.8901 19.9061 100.201 20.7381C100.534 21.5701 100.978 22.2897 101.533 22.8968C102.11 23.4815 102.799 23.9312 103.598 24.246C104.397 24.5608 105.274 24.7183 106.229 24.7183C107.339 24.7183 108.338 24.4821 109.226 24.0099C110.137 23.5377 110.969 22.8519 111.724 21.9524L115.92 25.7976C114.788 27.2143 113.367 28.3161 111.658 29.1032C109.97 29.8677 108.05 30.25 105.896 30.25Z" fill="#212121"/>
      <path d="M129.52 29.7778V26.371L129.087 25.5278V19.254C129.087 18.2421 128.776 17.4663 128.154 16.9266C127.555 16.3644 126.589 16.0833 125.257 16.0833C124.391 16.0833 123.514 16.2295 122.626 16.5218C121.737 16.7917 120.983 17.1739 120.361 17.6687L118.229 13.3175C119.251 12.6429 120.472 12.1257 121.893 11.7659C123.336 11.3836 124.768 11.1925 126.189 11.1925C129.12 11.1925 131.385 11.8783 132.983 13.25C134.604 14.5992 135.414 16.7242 135.414 19.625V29.7778H129.52ZM124.191 30.0814C122.748 30.0814 121.527 29.834 120.527 29.3393C119.528 28.8446 118.762 28.17 118.229 27.3155C117.719 26.461 117.463 25.5053 117.463 24.4484C117.463 23.3241 117.741 22.3571 118.296 21.5476C118.873 20.7156 119.75 20.086 120.927 19.6587C122.104 19.209 123.625 18.9841 125.49 18.9841H129.753V22.3234H126.356C125.334 22.3234 124.613 22.4921 124.191 22.8294C123.791 23.1667 123.591 23.6164 123.591 24.1786C123.591 24.7407 123.802 25.1905 124.224 25.5278C124.646 25.8651 125.223 26.0337 125.956 26.0337C126.644 26.0337 127.266 25.8651 127.821 25.5278C128.398 25.168 128.82 24.6283 129.087 23.9087L129.952 26.2698C129.619 27.5291 128.964 28.4848 127.988 29.1369C127.033 29.7665 125.767 30.0814 124.191 30.0814Z" fill="#212121"/>
      <path d="M151.165 11.1925C152.564 11.1925 153.829 11.4848 154.962 12.0694C156.094 12.6316 156.982 13.5086 157.626 14.7004C158.292 15.8922 158.625 17.4325 158.625 19.3214V29.7778H152.297V20.3671C152.297 19.0628 152.031 18.1184 151.498 17.5337C150.987 16.9266 150.266 16.623 149.333 16.623C148.667 16.623 148.056 16.7804 147.501 17.0952C146.946 17.3876 146.513 17.8485 146.203 18.4782C145.892 19.1078 145.736 19.9286 145.736 20.9405V29.7778H139.409V11.496H145.437V16.6905L144.271 15.1726C144.959 13.8459 145.903 12.8565 147.102 12.2044C148.301 11.5298 149.655 11.1925 151.165 11.1925Z" fill="#212121"/>
    </svg>
  );
}

/* ── Shared input style ───────────────────────────────── */
const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '14px',
  color: '#101828',
  background: '#ffffff',
  border: '1.5px solid #EAECF0',
  borderRadius: '9999px',
  padding: '10px 16px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'Poppins, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  color: '#344054',
  display: 'block',
  marginBottom: '6px',
};

const COUNTRY_CODES = [
  { flag: '🇺🇸', code: '+1', country: 'US' },
  { flag: '🇵🇰', code: '+92', country: 'PK' },
  { flag: '🇬🇧', code: '+44', country: 'GB' },
  { flag: '🇦🇪', code: '+971', country: 'AE' },
  { flag: '🇸🇦', code: '+966', country: 'SA' },
];

/* ─────────────────────────────────────────────────────── */

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'signup' | 'workmode'>('signup');
  const [workMode, setWorkMode] = useState<'pro' | 'team' | null>(null);

  /* form state */
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    dob: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('workmode');
  };

  const handleContinue = () => {
    if (!workMode) return;
    router.push('/');
  };

  const focusStyle = (field: string): React.CSSProperties =>
    focusedField === field
      ? { borderColor: '#A54AFF', boxShadow: '0 0 0 4px #F4EBFF' }
      : {};

  /* ── Step 1: Sign Up ─────────────────────────────────── */
  if (step === 'signup') {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: '#ffffff',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        {/* ── Left panel: illustration ── */}
        <div
          style={{
            width: '50%',
            background: '#F8F5FF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative grid */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none', overflow: 'hidden' }}>
            <img src={IMG_GRID_VERTICAL} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <img src={IMG_GRID_HORIZONTAL} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Purple glow */}
          <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '360px', height: '360px', background: 'radial-gradient(circle, rgba(150,67,232,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Illustration */}
          <div
            style={{
              width: '340px',
              height: '340px',
              background: '#F9F5FF',
              borderRadius: '24px',
              overflow: 'hidden',
              position: 'relative',
              marginBottom: '36px',
              boxShadow: '0 8px 40px rgba(150,67,232,0.12)',
            }}
          >
            <img
              src={IMG_WORKER_SINGLE}
              alt="Service professional"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            />
          </div>

          {/* Logo */}
          <WhoCanLogo size={160} />

          {/* Tagline */}
          <p
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '15px',
              color: '#667085',
              marginTop: '12px',
              textAlign: 'center',
              maxWidth: '280px',
              lineHeight: '1.6',
            }}
          >
            Your trusted marketplace for home services
          </p>
        </div>

        {/* ── Right panel: form ── */}
        <div
          style={{
            width: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px',
            overflowY: 'auto',
          }}
        >
          <div style={{ width: '100%', maxWidth: '420px' }}>

            <h1
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: '30px',
                color: '#101828',
                textAlign: 'center',
                marginBottom: '8px',
              }}
            >
              Sign Up
            </h1>
            <p
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px',
                color: '#667085',
                textAlign: 'center',
                marginBottom: '32px',
              }}
            >
              Let's Create Your Account
            </p>

            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Full Name */}
              <div>
                <label style={LABEL_STYLE}>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={form.fullName}
                  onChange={set('fullName')}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{ ...INPUT_STYLE, ...focusStyle('fullName') }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={LABEL_STYLE}>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={set('email')}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{ ...INPUT_STYLE, ...focusStyle('email') }}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={LABEL_STYLE}>Phone number</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={form.countryCode}
                    onChange={set('countryCode')}
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      color: '#101828',
                      background: '#ffffff',
                      border: '1.5px solid #EAECF0',
                      borderRadius: '9999px',
                      padding: '10px 14px',
                      outline: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      minWidth: '88px',
                    }}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="Type here"
                    value={form.phone}
                    onChange={set('phone')}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...INPUT_STYLE, ...focusStyle('phone') }}
                  />
                </div>
              </div>

              {/* DOB + Gender */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={LABEL_STYLE}>Date of birth</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="date"
                      value={form.dob}
                      onChange={set('dob')}
                      onFocus={() => setFocusedField('dob')}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        ...INPUT_STYLE,
                        ...focusStyle('dob'),
                        paddingRight: '40px',
                        colorScheme: 'light',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={LABEL_STYLE}>Gender</label>
                  <select
                    value={form.gender}
                    onChange={set('gender')}
                    style={{
                      ...INPUT_STYLE,
                      cursor: 'pointer',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%23667085' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 14px center',
                    }}
                  >
                    <option value="" disabled>Select one</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={LABEL_STYLE}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set('password')}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={{ ...INPUT_STYLE, ...focusStyle('password'), paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                      color: '#667085', display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPass ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={LABEL_STYLE}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={{ ...INPUT_STYLE, ...focusStyle('confirmPassword'), paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(p => !p)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                      color: '#667085', display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showConfirm ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  color: '#ffffff',
                  background: BRAND_GRAD,
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease, transform 0.15s ease',
                  marginTop: '8px',
                  boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.92'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                Sign Up
              </button>

              {/* Login link */}
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#667085', textAlign: 'center', marginTop: '4px' }}>
                Already have an account?{' '}
                <a href="/login" style={{ color: '#A54AFF', fontWeight: 600, textDecoration: 'none' }}>
                  Login
                </a>
              </p>

            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 2: Choose work mode ────────────────────────── */
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        position: 'relative',
        fontFamily: 'Poppins, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Grid background */}
      <div style={{ position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)', width: '768px', height: '768px', opacity: 0.4, pointerEvents: 'none', overflow: 'hidden' }}>
        <img src={IMG_GRID_VERTICAL} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <img src={IMG_GRID_HORIZONTAL} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      </div>

      {/* Back button */}
      <button
        onClick={() => setStep('signup')}
        style={{
          position: 'absolute',
          top: '40px',
          left: '48px',
          width: '44px',
          height: '44px',
          background: '#ffffff',
          border: '1px solid #EAECF0',
          borderRadius: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#9643E8'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EAECF0'; }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Logo */}
      <div style={{ marginBottom: '8px', position: 'relative', zIndex: 1 }}>
        <WhoCanLogo size={200} />
      </div>

      {/* Title */}
      <p
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '20px',
          fontWeight: 400,
          color: '#344054',
          textAlign: 'center',
          marginBottom: '32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        Select how you want to work
      </p>

      {/* Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          width: '100%',
          maxWidth: '860px',
          marginBottom: '28px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Pro card */}
        <div
          onClick={() => setWorkMode('pro')}
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: workMode === 'pro' ? '2px solid #A54AFF' : '1.5px solid #EAECF0',
            boxShadow: workMode === 'pro'
              ? '0 8px 24px rgba(165,74,255,0.15)'
              : '0 1px 3px rgba(16,24,40,0.1), 0 1px 2px rgba(16,24,40,0.06)',
            padding: '24px',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center',
          }}
          onMouseEnter={e => { if (workMode !== 'pro') (e.currentTarget as HTMLElement).style.borderColor = 'rgba(165,74,255,0.3)'; }}
          onMouseLeave={e => { if (workMode !== 'pro') (e.currentTarget as HTMLElement).style.borderColor = '#EAECF0'; }}
        >
          <div
            style={{
              width: '100%',
              height: '220px',
              background: '#FEF5E6',
              borderRadius: '14px',
              overflow: 'hidden',
            }}
          >
            <img
              src={IMG_WORKER_SINGLE}
              alt="Individual seller"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '18px', color: '#101828', marginBottom: '6px' }}>Pro</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#475467', margin: 0 }}>I will work as an individual seller</p>
          </div>
        </div>

        {/* Team card */}
        <div
          onClick={() => setWorkMode('team')}
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: workMode === 'team' ? '2px solid #A54AFF' : '1.5px solid #EAECF0',
            boxShadow: workMode === 'team'
              ? '0 8px 24px rgba(165,74,255,0.15)'
              : '0 4px 8px rgba(11,4,15,0.05)',
            padding: '24px',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center',
          }}
          onMouseEnter={e => { if (workMode !== 'team') (e.currentTarget as HTMLElement).style.borderColor = 'rgba(165,74,255,0.3)'; }}
          onMouseLeave={e => { if (workMode !== 'team') (e.currentTarget as HTMLElement).style.borderColor = '#EAECF0'; }}
        >
          <div
            style={{
              width: '100%',
              height: '220px',
              background: '#F8F5FF',
              borderRadius: '14px',
              overflow: 'hidden',
            }}
          >
            <img
              src={IMG_WORKER_SINGLE}
              alt="Team of sellers"
              style={{ width: '160%', height: '100%', objectFit: 'cover', objectPosition: '-50px top', transform: 'scale(1.1)' }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '18px', color: '#101828', marginBottom: '6px' }}>Team</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#475467', margin: 0 }}>Create your own team.</p>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!workMode}
        style={{
          width: '100%',
          maxWidth: '860px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          fontSize: '18px',
          color: '#ffffff',
          background: workMode ? BRAND_GRAD : '#D0D5DD',
          border: workMode ? '1px solid #C386FF' : 'none',
          borderRadius: '9999px',
          padding: '18px',
          cursor: workMode ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s ease, opacity 0.15s ease',
          boxShadow: workMode ? '0 1px 2px rgba(16,24,40,0.05)' : 'none',
          position: 'relative',
          zIndex: 1,
        }}
        onMouseEnter={e => { if (workMode) (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
      >
        Continue
      </button>
    </div>
  );
}
