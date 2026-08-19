'use client';

import { CSSProperties, useEffect, useState } from 'react';

export function isUsableImageUrl(value?: string | null): value is string {
  if (typeof value !== 'string') return false;
  const url = value.trim();
  if (!url || url === 'null' || url === 'undefined') return false;
  return /^(https?:\/\/|\/|blob:|data:image\/)/i.test(url);
}

export function pickFavorImage(
  ...candidates: Array<string | null | undefined | Array<string | null | undefined>>
): string | null {
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        if (isUsableImageUrl(item)) return item.trim();
      }
    } else if (isUsableImageUrl(candidate)) {
      return candidate.trim();
    }
  }
  return null;
}

type FavorImageProps = {
  src?: string | null;
  alt?: string;
  style?: CSSProperties;
};

export default function FavorImage({ src, alt = '', style }: FavorImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!isUsableImageUrl(src) || failed) {
    return (
      <div
        role="img"
        aria-label={alt || 'No image available'}
        style={{
          width: '100%',
          height: '100%',
          background: '#F2F4F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="#D0D5DD" strokeWidth="1.6" />
          <circle cx="8.5" cy="10" r="1.5" fill="#D0D5DD" />
          <path d="M3 16.2l5-4.6 3.4 3.1 2.6-2.5L21 16.8" stroke="#D0D5DD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
      onError={() => setFailed(true)}
    />
  );
}
