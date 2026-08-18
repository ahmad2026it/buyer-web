import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  verified?: boolean;
  squared?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

// ─── Size Tokens ──────────────────────────────────────────────────────────────

const sizeTokens: Record<AvatarSize, {
  size: string;
  fontSize: string;
  lineHeight: string;
  statusSize: string;
  statusOffset: string;
  badgeSize: string;
}> = {
  xs:  { size: '24px', fontSize: '10px', lineHeight: '14px', statusSize: '6px',  statusOffset: '0px',  badgeSize: '10px' },
  sm:  { size: '32px', fontSize: '12px', lineHeight: '18px', statusSize: '8px',  statusOffset: '0px',  badgeSize: '14px' },
  md:  { size: '40px', fontSize: '14px', lineHeight: '20px', statusSize: '10px', statusOffset: '1px',  badgeSize: '16px' },
  lg:  { size: '48px', fontSize: '16px', lineHeight: '24px', statusSize: '12px', statusOffset: '1px',  badgeSize: '18px' },
  xl:  { size: '56px', fontSize: '18px', lineHeight: '28px', statusSize: '14px', statusOffset: '2px',  badgeSize: '22px' },
  '2xl':{ size:'64px', fontSize: '18px', lineHeight: '28px', statusSize: '16px', statusOffset: '3px',  badgeSize: '24px' },
};

const statusColors: Record<AvatarStatus, { bg: string; border: string }> = {
  online:  { bg: '#17B26A', border: '#FFFFFF' },
  offline: { bg: '#98A2B3', border: '#FFFFFF' },
  away:    { bg: '#F79009', border: '#FFFFFF' },
  busy:    { bg: '#F04438', border: '#FFFFFF' },
};

// ─── Avatar Component ─────────────────────────────────────────────────────────

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  initials,
  size = 'md',
  status,
  verified = false,
  squared = false,
  style,
  className,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const sz = sizeTokens[size];
  const borderRadius = squared ? '8px' : '50%';

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
    width: sz.size,
    height: sz.size,
    ...style,
  };

  const avatarStyle: React.CSSProperties = {
    width: sz.size,
    height: sz.size,
    borderRadius,
    backgroundColor: '#F4EBFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: sz.fontSize,
    lineHeight: sz.lineHeight,
    fontWeight: 600,
    color: '#6941C6',
    userSelect: 'none',
  };

  const showInitials = (!src || imgError) && initials;
  const showPlaceholder = !src || imgError;

  return (
    <div style={containerStyle} className={className}>
      <div style={avatarStyle}>
        {src && !imgError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : showInitials ? (
          initials!.slice(0, 2).toUpperCase()
        ) : (
          <svg viewBox="0 0 40 40" fill="none" style={{ width: '60%', height: '60%' }}>
            <path d="M20 20a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM6.168 34.667A14 14 0 0 1 20 24a14 14 0 0 1 13.832 10.667" stroke="#9E77ED" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {status && (
        <span style={{
          position: 'absolute',
          bottom: sz.statusOffset,
          right: sz.statusOffset,
          width: sz.statusSize,
          height: sz.statusSize,
          borderRadius: '50%',
          backgroundColor: statusColors[status].bg,
          border: `1.5px solid ${statusColors[status].border}`,
          boxSizing: 'border-box',
        }} />
      )}

      {verified && (
        <span style={{
          position: 'absolute',
          bottom: sz.statusOffset,
          right: sz.statusOffset,
          width: sz.badgeSize,
          height: sz.badgeSize,
          borderRadius: '50%',
          backgroundColor: '#1570EF',
          border: '1.5px solid #FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg viewBox="0 0 10 10" fill="none" style={{ width: '60%', height: '60%' }}>
            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </div>
  );
};

// ─── Avatar Group ─────────────────────────────────────────────────────────────

export interface AvatarGroupProps {
  avatars: AvatarProps[];
  size?: AvatarSize;
  max?: number;
  style?: React.CSSProperties;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  size = 'md',
  max = 5,
  style,
}) => {
  const sz = sizeTokens[size];
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const overlap = parseInt(sz.size) * 0.25;

  return (
    <div style={{ display: 'inline-flex', ...style }}>
      {visible.map((av, i) => (
        <div
          key={i}
          style={{
            marginLeft: i === 0 ? 0 : `-${overlap}px`,
            borderRadius: '50%',
            border: '2px solid #FFFFFF',
            boxSizing: 'content-box',
            zIndex: visible.length - i,
            position: 'relative',
          }}
        >
          <Avatar {...av} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div style={{
          marginLeft: `-${overlap}px`,
          width: sz.size,
          height: sz.size,
          borderRadius: '50%',
          backgroundColor: '#F2F4F7',
          border: '2px solid #FFFFFF',
          boxSizing: 'content-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: sz.fontSize,
          fontWeight: 600,
          color: '#344054',
          position: 'relative',
          zIndex: 0,
        }}>
          +{overflow}
        </div>
      )}
    </div>
  );
};
