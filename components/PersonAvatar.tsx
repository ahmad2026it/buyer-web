'use client';

import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react';
import { isUsableImageUrl } from '@/components/FavorImage';

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

type PersonAvatarProps = {
  src?: string | null;
  name: string;
  size: number;
  border?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

export default function PersonAvatar({
  src,
  name,
  size,
  border = '2px solid #DFBAFF',
  onClick,
}: PersonAvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = isUsableImageUrl(src) && !failed;
  const shared: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    border,
    cursor: onClick ? 'pointer' : undefined,
  };

  if (showImage) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        onClick={onClick}
        style={{
          ...shared,
          objectFit: 'cover',
          objectPosition: 'top',
          display: 'block',
        }}
      />
    );
  }

  return (
    <div
      aria-label={name}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={{
        ...shared,
        background: 'linear-gradient(135deg,#F3E8FF 0%,#E9D7FE 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins,sans-serif',
        fontWeight: 700,
        fontSize: Math.max(10, Math.round(size * 0.32)),
        color: '#7F56D9',
      }}
    >
      {initialsFromName(name)}
    </div>
  );
}
