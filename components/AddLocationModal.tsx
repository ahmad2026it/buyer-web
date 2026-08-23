'use client';

import { useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useCreateBuyerLocationMutation } from '@/app/buyer/store/buyerLocationsAPI';
import type { BuyerLocation } from '@/app/buyer/store/buyerLocationsTypes';
import type { PickedLocation } from '@/components/locationTypes';

const LocationMapPicker = dynamic(() => import('@/components/LocationMapPicker'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        borderRadius: '16px',
        height: 190,
        marginBottom: '16px',
        background: '#F2F4F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085', margin: 0 }}>
        Loading map...
      </p>
    </div>
  ),
});

const BRAND = '#A54AFF';
const GRAD = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const PILL = '9999px';

type LocType = 'home' | 'office' | 'business';

const LOC_TYPE_LABELS: Record<LocType, string> = {
  home: 'Home',
  office: 'Office',
  business: 'Business',
};

const LOC_LABELS: { key: LocType; label: string; icon: ReactNode }[] = [
  { key: 'home', label: 'Home', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: 'office', label: 'Work', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="12" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="10" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  { key: 'business', label: 'Partner', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
];

const getMutationErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const message = (error as { error?: string }).error;
    if (message) return message;
  }
  return fallback;
};

export default function AddLocationModal({
  onClose,
  onAdded,
  isFirstLocation,
}: {
  onClose: () => void;
  onAdded: (location: BuyerLocation) => void;
  isFirstLocation: boolean;
}) {
  const [picked, setPicked] = useState<PickedLocation | null>(null);
  const [name, setName] = useState('');
  const [locType, setLocType] = useState<LocType>('home');
  const [formError, setFormError] = useState('');
  const [createLocation, { isLoading }] = useCreateBuyerLocationMutation();

  const handleAdd = async () => {
    if (!picked) {
      setFormError('Select a location on the map or from search.');
      return;
    }

    setFormError('');
    try {
      const response = await createLocation({
        location: picked.address,
        lat: picked.lat,
        lng: picked.lng,
        locationDetail: picked.detail || undefined,
        label: name.trim() || LOC_TYPE_LABELS[locType],
        isSelected: isFirstLocation,
      }).unwrap();

      if (!response.success || !response.data?.location) {
        setFormError(response.message || 'Failed to add location.');
        return;
      }

      onAdded(response.data.location);
      onClose();
    } catch (error) {
      setFormError(getMutationErrorMessage(error, 'Failed to add location. Please try again.'));
    }
  };

  const canSubmit = Boolean(picked) && !isLoading;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
      role="presentation"
      style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.52)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div
        role="dialog"
        aria-labelledby="add-location-title"
        style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 48px rgba(16,24,40,0.18)', display: 'flex', flexDirection: 'column', maxHeight: '92vh', overflow: 'hidden' }}
      >
        <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F4EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={BRAND} strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke={BRAND} strokeWidth="2"/></svg>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              disabled={isLoading}
              style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F2F4F7', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#667085" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
          </div>
          <h2 id="add-location-title" style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '19px', color: '#101828', marginBottom: '3px' }}>Add Location</h2>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085', marginBottom: '18px' }}>Add a new location.</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
          <LocationMapPicker brandColor={BRAND} value={picked} onChange={setPicked} />

          {picked ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '13px 16px', border: `1.5px solid ${BRAND}`, borderRadius: '14px', background: 'rgba(165,74,255,0.03)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <svg style={{ marginTop: '2px', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={BRAND} strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke={BRAND} strokeWidth="2"/></svg>
                <div>
                  <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, color: '#101828' }}>{picked.address}</p>
                  {picked.detail ? (
                    <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#667085', marginTop: '2px' }}>{picked.detail}</p>
                  ) : null}
                  <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '11px', color: '#98A2B3', marginTop: '4px' }}>
                    {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
                  </p>
                </div>
              </div>
              <button type="button" aria-label="Clear selected location" onClick={() => setPicked(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 0, flexShrink: 0, marginLeft: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#667085" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
              <svg width="70" height="70" viewBox="0 0 100 100" fill="none" style={{ marginBottom: '10px' }}>
                <circle cx="50" cy="50" r="42" fill="#F4EBFF"/>
                <path d="M62 36c0 10-13 20-13 20s-13-10-13-20a13 13 0 0 1 26 0z" fill={BRAND} opacity="0.85"/>
                <circle cx="62" cy="36" r="5" fill="white"/>
              </svg>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#98A2B3', lineHeight: '1.6' }}>Search an address or locate pin<br/>on map of your location</p>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, color: '#101828', display: 'block', marginBottom: '8px' }}>Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Home, Office..."
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 20px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#101828', border: '1.5px solid #EAECF0', borderRadius: PILL, outline: 'none', background: '#F9FAFB', transition: 'border-color 0.15s,box-shadow 0.15s' }}
              onFocus={e => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(165,74,255,0.12)'; e.currentTarget.style.background = '#fff'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#EAECF0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#F9FAFB'; }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, color: '#101828', display: 'block', marginBottom: '14px' }}>Add a label</label>
            <div style={{ display: 'flex', gap: '20px' }}>
              {LOC_LABELS.map(l => {
                const active = locType === l.key;
                return (
                  <button
                    key={l.key}
                    type="button"
                    onClick={() => setLocType(l.key)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                  >
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: active ? GRAD : '#F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', color: active ? '#ffffff' : '#667085', border: active ? 'none' : '1.5px solid #EAECF0' }}>
                      {l.icon}
                    </div>
                    <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', fontWeight: active ? 700 : 500, color: active ? BRAND : '#667085' }}>{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {formError ? (
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#D92D20', marginBottom: '12px' }}>{formError}</p>
          ) : null}
        </div>

        <div style={{ flexShrink: 0, padding: '16px 24px 24px', display: 'flex', gap: '12px', borderTop: '1px solid #EAECF0' }}>
          <button type="button" onClick={onClose} disabled={isLoading} style={{ flex: 1, fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px', color: '#344054', background: '#fff', border: '1.5px solid #D0D5DD', borderRadius: PILL, padding: '13px', cursor: isLoading ? 'not-allowed' : 'pointer' }}>Cancel</button>
          <button type="button" onClick={() => void handleAdd()} disabled={!canSubmit} style={{ flex: 1, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '14px', color: '#ffffff', background: canSubmit ? GRAD : '#D0D5DD', border: 'none', borderRadius: PILL, padding: '13px', cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'background 0.2s', boxShadow: canSubmit ? '0 4px 14px rgba(165,74,255,0.3)' : 'none' }}>
            {isLoading ? 'Adding...' : 'Add Location'}
          </button>
        </div>
      </div>
    </div>
  );
}
