import React from 'react';

// Tags are interactive badges used for categorization, filtering, and labeling.
// Unlike Badge (informational only), Tags can be selected/toggled/removed.

export type TagSize = 'sm' | 'md' | 'lg';
export type TagColor = 'gray' | 'brand' | 'blue' | 'success' | 'warning' | 'error';

export interface TagProps {
  label: string;
  size?: TagSize;
  color?: TagColor;
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  leadingIcon?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const sizeTokens: Record<TagSize, { paddingX: string; paddingY: string; fontSize: string; lineHeight: string; gap: string; radius: string }> = {
  sm: { paddingX: '8px',  paddingY: '2px',  fontSize: '12px', lineHeight: '18px', gap: '4px', radius: '6px' },
  md: { paddingX: '10px', paddingY: '4px',  fontSize: '14px', lineHeight: '20px', gap: '6px', radius: '6px' },
  lg: { paddingX: '12px', paddingY: '6px',  fontSize: '14px', lineHeight: '20px', gap: '6px', radius: '8px' },
};

const colorTokens: Record<TagColor, {
  default: { bg: string; text: string; border: string };
  selected: { bg: string; text: string; border: string };
}> = {
  gray: {
    default:  { bg: '#FFFFFF',   text: '#344054', border: '#D0D5DD' },
    selected: { bg: '#F2F4F7',   text: '#101828', border: '#D0D5DD' },
  },
  brand: {
    default:  { bg: '#FFFFFF',   text: '#6941C6', border: '#D6BBFB' },
    selected: { bg: '#F4EBFF',   text: '#53389E', border: '#B692F6' },
  },
  blue: {
    default:  { bg: '#FFFFFF',   text: '#175CD3', border: '#B2DDFF' },
    selected: { bg: '#EFF8FF',   text: '#1849A9', border: '#84CAFF' },
  },
  success: {
    default:  { bg: '#FFFFFF',   text: '#067647', border: '#ABEFC6' },
    selected: { bg: '#ECFDF3',   text: '#085D3A', border: '#75E0A7' },
  },
  warning: {
    default:  { bg: '#FFFFFF',   text: '#B54708', border: '#FEDF89' },
    selected: { bg: '#FFFAEB',   text: '#93370D', border: '#FEC84B' },
  },
  error: {
    default:  { bg: '#FFFFFF',   text: '#B42318', border: '#FECDCA' },
    selected: { bg: '#FEF3F2',   text: '#912018', border: '#FDA29B' },
  },
};

export const Tag: React.FC<TagProps> = ({
  label,
  size = 'md',
  color = 'gray',
  selected = false,
  onSelect,
  onRemove,
  leadingIcon,
  disabled = false,
  style,
  className,
}) => {
  const [hovered, setHovered] = React.useState(false);
  const sz = sizeTokens[size];
  const ct = colorTokens[color][selected ? 'selected' : 'default'];
  const isInteractive = Boolean(onSelect) && !disabled;

  const tagStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: sz.gap,
    paddingLeft: sz.paddingX,
    paddingRight: onRemove ? '6px' : sz.paddingX,
    paddingTop: sz.paddingY,
    paddingBottom: sz.paddingY,
    borderRadius: sz.radius,
    border: `1px solid ${ct.border}`,
    backgroundColor: hovered && isInteractive ? (selected ? ct.bg : '#F9FAFB') : ct.bg,
    color: ct.text,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: sz.fontSize,
    lineHeight: sz.lineHeight,
    fontWeight: 500,
    cursor: isInteractive ? 'pointer' : disabled ? 'not-allowed' : 'default',
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
    transition: 'background-color 0.15s, border-color 0.15s',
    ...style,
  };

  return (
    <span
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      style={tagStyle}
      className={className}
      onClick={isInteractive ? onSelect : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && isInteractive) onSelect?.(); }}
      aria-pressed={isInteractive ? selected : undefined}
    >
      {leadingIcon && (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '14px', height: '14px' }}>
          {leadingIcon}
        </span>
      )}
      {label}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          disabled={disabled}
          aria-label="Remove tag"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '14px', height: '14px',
            background: 'none', border: 'none', padding: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: ct.text, opacity: 0.5, borderRadius: '50%',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M7.5 2.5l-5 5M2.5 2.5l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
};

// ─── Tag Group ────────────────────────────────────────────────────────────────

export interface TagGroupProps {
  tags: TagProps[];
  wrap?: boolean;
  gap?: string;
  style?: React.CSSProperties;
}

export const TagGroup: React.FC<TagGroupProps> = ({ tags, wrap = true, gap = '8px', style }) => (
  <div style={{ display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', gap, ...style }}>
    {tags.map((tag, i) => <Tag key={tag.label + i} {...tag} />)}
  </div>
);
