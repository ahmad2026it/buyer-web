'use client';
import { useState } from 'react';

const BRAND = '#A54AFF';
const FONT = 'Poppins, sans-serif';
const GRAD = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';

export default function ListingSearchBar({
  value,
  placeholder,
  onChange,
  onSubmit,
  onClear,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          background: '#F9FAFB',
          border: `1.5px solid ${focused ? BRAND : '#EAECF0'}`,
          borderRadius: '9999px',
          padding: '10px 16px',
          gap: '8px',
          transition: 'border-color 0.15s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="#98A2B3" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontFamily: FONT,
            fontSize: '14px',
            color: '#101828',
            background: 'transparent',
          }}
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={onClear}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#98A2B3', lineHeight: 0, padding: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>
      <button
        type="submit"
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: '14px',
          color: '#ffffff',
          background: GRAD,
          border: 'none',
          borderRadius: '9999px',
          padding: '11px 24px',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
      >
        Search
      </button>
    </form>
  );
}
