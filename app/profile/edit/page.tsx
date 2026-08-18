'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useUpdateBuyerProfileMutation } from '@/app/auth/store/authAPI';
import { setUser } from '@/app/auth/store/authSlice';
import { showToast } from '@/lib/toast';
import type { AuthUser, UpdateBuyerProfileResponse } from '@/app/auth/store/authTypes';

const BRAND = '#A54AFF';
const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const PILL  = '9999px';
const BORDER = '#D0D5DD';
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const COUNTRIES = [
  { code: '+92',  name: 'Pakistan (+92)' },
  { code: '+1',   name: 'United States (+1)' },
  { code: '+44',  name: 'United Kingdom (+44)' },
  { code: '+971', name: 'UAE (+971)' },
  { code: '+966', name: 'Saudi Arabia (+966)' },
  { code: '+20',  name: 'Egypt (+20)' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Prefer not to say' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: 'Poppins,sans-serif',
  fontSize: '15px',
  color: '#101828',
  background: '#fff',
  border: `1px solid ${BORDER}`,
  borderRadius: PILL,
  padding: '11px 16px',
  outline: 'none',
  boxSizing: 'border-box',
  boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'Poppins,sans-serif',
  fontSize: '13px',
  fontWeight: 600,
  color: '#344054',
  marginBottom: '6px',
  display: 'block',
};

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return '';
}

function normalizeGender(value: string | null | undefined): string {
  const gender = (value ?? '').trim().toLowerCase();
  if (gender === 'male' || gender === 'female' || gender === 'other') return gender;
  if (gender === 'non-binary' || gender === 'prefer not to say') return 'other';
  return '';
}

function parsePhoneNumber(phoneNumber: string | null | undefined): {
  countryCode: string;
  national: string;
} {
  const raw = (phoneNumber ?? '').replace(/\s+/g, '');
  if (!raw) return { countryCode: '+92', national: '' };

  const withPlus = raw.startsWith('+') ? raw : `+${raw}`;
  const match = [...COUNTRIES]
    .sort((a, b) => b.code.length - a.code.length)
    .find((country) => withPlus.startsWith(country.code));

  if (match) {
    return { countryCode: match.code, national: withPlus.slice(match.code.length) };
  }

  return { countryCode: '+92', national: raw.replace(/^\+/, '') };
}

function buildPhoneNumber(countryCode: string, national: string): string {
  const digits = national.replace(/[^\d]/g, '');
  return `${countryCode}${digits.replace(/^0+/, '')}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function extractUpdatedUser(payload: unknown): AuthUser | null {
  const root = asRecord(payload);
  if (!root) return null;

  const nestedData = asRecord(root.data);
  const nestedUser = nestedData ? asRecord(nestedData.user) : null;
  if (nestedUser && typeof nestedUser.id !== 'undefined') {
    return nestedUser as AuthUser;
  }

  const directUser = asRecord(root.user);
  if (directUser && typeof directUser.id !== 'undefined') {
    return directUser as AuthUser;
  }

  if (typeof root.id !== 'undefined' && typeof root.email === 'string') {
    return root as AuthUser;
  }

  return null;
}

function recoverSuccessResponse(error: unknown): UpdateBuyerProfileResponse | null {
  const err = asRecord(error);
  if (!err) return null;

  if (typeof err.data === 'string') {
    try {
      return JSON.parse(err.data) as UpdateBuyerProfileResponse;
    } catch {
      return null;
    }
  }

  const data = asRecord(err.data);
  if (data && (data.success === true || asRecord(data.data)?.user || asRecord(data.user))) {
    return data as UpdateBuyerProfileResponse;
  }

  return null;
}

export default function EditProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [updateBuyerProfile, { isLoading }] = useUpdateBuyerProfileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialPhone = parsePhoneNumber(user?.phoneNumber);

  const [avatar, setAvatar] = useState<string | null>(user?.profileImage ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [dob, setDob] = useState(toDateInputValue(user?.dateOfBirth));
  const [gender, setGender] = useState(normalizeGender(user?.gender));
  const [phone, setPhone] = useState(initialPhone.national);
  const [countryCode, setCountryCode] = useState(initialPhone.countryCode);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;

    const parsedPhone = parsePhoneNumber(user.phoneNumber);
    setFullName(user.fullName ?? '');
    setDob(toDateInputValue(user.dateOfBirth));
    setGender(normalizeGender(user.gender));
    setCountryCode(parsedPhone.countryCode);
    setPhone(parsedPhone.national);
    setAvatar(user.profileImage);
    setAvatarFile(null);
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatar?.startsWith('blob:')) URL.revokeObjectURL(avatar);
    };
  }, [avatar]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_BYTES) {
      showToast('Please choose a JPG, PNG or GIF under 5 MB.', 'warning');
      e.target.value = '';
      return;
    }

    if (avatar?.startsWith('blob:')) URL.revokeObjectURL(avatar);
    setAvatarFile(file);
    setAvatar(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    if (avatar?.startsWith('blob:')) URL.revokeObjectURL(avatar);
    setAvatar(null);
    setAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!user) return;

    if (!fullName.trim() || !dob || !gender || !phone.trim()) {
      showToast('Please fill in your name, date of birth, gender, and phone number.', 'warning');
      return;
    }

    try {
      const payload = {
        fullName: fullName.trim(),
        dateOfBirth: dob,
        gender,
        phoneNumber: buildPhoneNumber(countryCode, phone),
        profileImage: avatarFile ?? undefined,
      };

      const mutationResult = await updateBuyerProfile(payload);
      const apiResponse =
        mutationResult.data ?? recoverSuccessResponse(mutationResult.error);
      const updatedUser = extractUpdatedUser(apiResponse);

      if (!updatedUser) {
        if (!mutationResult.error) {
          showToast('Unable to update profile. Please try again.', 'error');
        }
        return;
      }

      dispatch(setUser({ ...updatedUser }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // API errors are shown by the axios interceptor toast
    }
  };

  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = BRAND;
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(165,74,255,0.12)';
  };
  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = BORDER;
    e.currentTarget.style.boxShadow = '0 1px 2px rgba(16,24,40,0.05)';
  };

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F9FAFB' }}>

        {/* Header band */}
        <div style={{ background: '#fff', borderBottom: '1px solid #EAECF0', paddingTop: '104px', paddingBottom: '32px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 500, color: '#667085', textDecoration: 'none', marginBottom: '16px', transition: 'color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = BRAND; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#667085'; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back
            </a>
            <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '28px', color: '#101828' }}>Edit Profile</h1>
          </div>
        </div>

        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>
          <div style={{ background: '#fff', border: '1px solid #EAECF0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(16,24,40,0.05)' }}>

            {/* ── Photo section ── */}
            <div style={{ padding: '28px 32px', borderBottom: '1px solid #F2F4F7', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {avatar
                  ? <img src={avatar} alt="Profile" style={{ width: '96px', height: '96px', borderRadius: PILL, objectFit: 'cover', border: '3px solid #F4EBFF', boxShadow: '0 4px 16px rgba(165,74,255,0.18)', display: 'block' }} />
                  : <div style={{ width: '96px', height: '96px', borderRadius: PILL, background: '#F4EBFF', border: '3px solid #E9D7FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="#C084FC" strokeWidth="2"/></svg>
                    </div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '15px', color: '#101828', marginBottom: '4px' }}>Profile photo</p>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085', marginBottom: '14px' }}>JPG, PNG or GIF. Max 5 MB.</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <label style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '13px', color: BRAND, background: '#F4EBFF', border: '1px solid rgba(165,74,255,0.25)', borderRadius: PILL, padding: '8px 18px', cursor: 'pointer', transition: 'background 0.15s', display: 'inline-block' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EDD9FF'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F4EBFF'; }}>
                    Upload photo
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif" style={{ display: 'none' }} onChange={handleAvatarChange} />
                  </label>
                  {avatar && (
                    <button type="button" onClick={handleRemovePhoto}
                      style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '13px', color: '#667085', background: '#fff', border: '1px solid #D0D5DD', borderRadius: PILL, padding: '8px 18px', cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#D92D20'; el.style.color = '#D92D20'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#D0D5DD'; el.style.color = '#667085'; }}>
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Form fields ── */}
            <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

              {/* Full name */}
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  style={inputStyle}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </div>

              {/* Date of birth */}
              <div>
                <label style={labelStyle}>Date of birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  style={{ ...inputStyle, colorScheme: 'light' }}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </div>

              {/* Gender */}
              <div>
                <label style={labelStyle}>Gender</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: '40px', cursor: 'pointer', color: gender ? '#101828' : '#98A2B3' }}
                    onFocus={focusInput}
                    onBlur={blurInput}>
                    <option value="">Select one</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>

              {/* Phone number */}
              <div>
                <label style={labelStyle}>Phone number</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <select
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                      style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#101828', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: PILL, padding: '11px 36px 11px 16px', outline: 'none', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(16,24,40,0.05)', transition: 'border-color 0.15s', width: '120px', boxSizing: 'border-box' }}
                      onFocus={e => { e.currentTarget.style.borderColor = BRAND; }}
                      onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}>
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="300 1234567"
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={focusInput}
                    onBlur={blurInput}
                  />
                </div>
              </div>
            </div>

            {/* ── Footer actions ── */}
            <div style={{ padding: '20px 32px', borderTop: '1px solid #F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => router.back()}
                style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px', color: '#344054', background: '#fff', border: '1px solid #D0D5DD', borderRadius: PILL, padding: '11px 22px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(16,24,40,0.05)', transition: 'background 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
                Cancel
              </button>
              <button type="button" onClick={() => { void handleSave(); }} disabled={isLoading || saved}
                style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', background: saved ? '#079455' : GRAD, border: 'none', borderRadius: PILL, padding: '11px 24px', cursor: isLoading ? 'wait' : 'pointer', opacity: isLoading ? 0.8 : 1, boxShadow: saved ? '0 4px 12px rgba(7,148,85,0.25)' : '0 4px 12px rgba(165,74,255,0.25)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = isLoading ? '0.8' : '0.9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = isLoading ? '0.8' : '1'; }}>
                {saved ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Saved!
                  </>
                ) : isLoading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
