'use client';

type FavoriteButtonVariant = 'overlay' | 'surface';

type FavoriteButtonProps = {
  liked: boolean;
  pending?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: number;
  variant?: FavoriteButtonVariant;
  style?: React.CSSProperties;
  title?: string;
};

function FavoriteSpinner({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block', animation: 'spinSlow 0.7s linear infinite' }}
    >
      <circle
        cx="10"
        cy="10"
        r="7.2"
        stroke={color}
        strokeOpacity="0.22"
        strokeWidth="2.4"
      />
      <path
        d="M10 2.8a7.2 7.2 0 0 1 6.24 3.84"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FavoriteButton({
  liked,
  pending = false,
  onClick,
  size = 34,
  variant = 'overlay',
  style,
  title,
}: FavoriteButtonProps) {
  const overlay = variant === 'overlay';
  const iconSize = Math.round(size * 0.44);
  const spinnerSize = Math.round(size * 0.52);
  const spinnerColor = overlay ? '#ffffff' : '#F43F5E';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
      aria-label={
        pending
          ? 'Saving favorite'
          : liked
            ? 'Remove from favorites'
            : 'Save to favorites'
      }
      title={title}
      style={{
        position: overlay ? 'absolute' : 'relative',
        top: overlay ? '20px' : undefined,
        right: overlay ? '20px' : undefined,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: overlay
          ? liked
            ? 'rgba(244,63,94,0.88)'
            : 'rgba(16,24,40,0.42)'
          : liked
            ? '#FFF1F3'
            : '#F9FAFB',
        border: overlay ? 'none' : `1.5px solid ${liked ? '#F43F5E' : '#EAECF0'}`,
        cursor: pending ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        backdropFilter: overlay ? 'blur(4px)' : undefined,
        boxShadow: pending
          ? overlay
            ? '0 0 0 3px rgba(255,255,255,0.38)'
            : '0 0 0 3px rgba(244,63,94,0.16)'
          : undefined,
        transition: 'background 0.15s ease, box-shadow 0.15s ease',
        ...style,
      }}
      onMouseEnter={(event) => {
        if (pending) return;
        const el = event.currentTarget;
        if (overlay) {
          el.style.background = liked ? 'rgba(244,63,94,1)' : 'rgba(16,24,40,0.65)';
          return;
        }
        el.style.background = liked ? '#FFE4E8' : '#F2F4F7';
      }}
      onMouseLeave={(event) => {
        const el = event.currentTarget;
        if (overlay) {
          el.style.background = liked ? 'rgba(244,63,94,0.88)' : 'rgba(16,24,40,0.42)';
          return;
        }
        el.style.background = liked ? '#FFF1F3' : '#F9FAFB';
      }}
    >
      {pending ? (
        <FavoriteSpinner size={spinnerSize} color={spinnerColor} />
      ) : (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} aria-hidden="true">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            stroke={overlay ? '#ffffff' : liked ? '#F43F5E' : '#98A2B3'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={liked ? (overlay ? '#ffffff' : '#F43F5E') : 'none'}
            style={{ transition: 'fill 0.15s ease, stroke 0.15s ease' }}
          />
        </svg>
      )}
    </button>
  );
}
