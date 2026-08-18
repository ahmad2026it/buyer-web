import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BadgeSize = 'sm' | 'md' | 'lg';

export type BadgeColor =
  | 'gray'
  | 'brand'
  | 'blue'
  | 'blue-light'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'error'
  | 'warning'
  | 'success';

export type BadgeStyle = 'filled' | 'outline' | 'pill-filled' | 'pill-outline';

export interface BadgeProps {
  size?: BadgeSize;
  color?: BadgeColor;
  badgeStyle?: BadgeStyle;
  label: string;
  dot?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onRemove?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

// ─── Color Palette ────────────────────────────────────────────────────────────

interface BadgeColorTokens {
  bg: string;
  text: string;
  dot: string;
  border: string;
  outlineBg: string;
  outlineText: string;
  outlineBorder: string;
}

const colorTokens: Record<BadgeColor, BadgeColorTokens> = {
  gray: {
    bg: '#F2F4F7', text: '#344054', dot: '#667085', border: '#D0D5DD',
    outlineBg: '#FFFFFF', outlineText: '#344054', outlineBorder: '#D0D5DD',
  },
  brand: {
    bg: '#F4EBFF', text: '#6941C6', dot: '#7F56D9', border: '#D6BBFB',
    outlineBg: '#FFFFFF', outlineText: '#6941C6', outlineBorder: '#D6BBFB',
  },
  blue: {
    bg: '#EFF8FF', text: '#175CD3', dot: '#2E90FA', border: '#B2DDFF',
    outlineBg: '#FFFFFF', outlineText: '#175CD3', outlineBorder: '#B2DDFF',
  },
  'blue-light': {
    bg: '#F0F9FF', text: '#026AA2', dot: '#0BA5EC', border: '#B9E6FE',
    outlineBg: '#FFFFFF', outlineText: '#026AA2', outlineBorder: '#B9E6FE',
  },
  indigo: {
    bg: '#EEF4FF', text: '#3538CD', dot: '#6172F3', border: '#C7D7FD',
    outlineBg: '#FFFFFF', outlineText: '#3538CD', outlineBorder: '#C7D7FD',
  },
  violet: {
    bg: '#F5F3FF', text: '#6D28D9', dot: '#8B5CF6', border: '#DDD6FE',
    outlineBg: '#FFFFFF', outlineText: '#6D28D9', outlineBorder: '#DDD6FE',
  },
  purple: {
    bg: '#F4EBFF', text: '#6941C6', dot: '#7F56D9', border: '#D6BBFB',
    outlineBg: '#FFFFFF', outlineText: '#6941C6', outlineBorder: '#D6BBFB',
  },
  fuchsia: {
    bg: '#FDF4FF', text: '#9F1AB1', dot: '#D444F1', border: '#F6D0FE',
    outlineBg: '#FFFFFF', outlineText: '#9F1AB1', outlineBorder: '#F6D0FE',
  },
  pink: {
    bg: '#FDF2FA', text: '#C11574', dot: '#EE46BC', border: '#FCCEEE',
    outlineBg: '#FFFFFF', outlineText: '#C11574', outlineBorder: '#FCCEEE',
  },
  rose: {
    bg: '#FFF1F3', text: '#C01048', dot: '#F63D68', border: '#FECDD6',
    outlineBg: '#FFFFFF', outlineText: '#C01048', outlineBorder: '#FECDD6',
  },
  orange: {
    bg: '#FEF6EE', text: '#B93815', dot: '#EF6820', border: '#F9DBAF',
    outlineBg: '#FFFFFF', outlineText: '#B93815', outlineBorder: '#F9DBAF',
  },
  yellow: {
    bg: '#FEFBE8', text: '#A15C07', dot: '#EAAA08', border: '#FEEE95',
    outlineBg: '#FFFFFF', outlineText: '#A15C07', outlineBorder: '#FEEE95',
  },
  green: {
    bg: '#EDFCF2', text: '#087443', dot: '#16B364', border: '#AAF0C4',
    outlineBg: '#FFFFFF', outlineText: '#087443', outlineBorder: '#AAF0C4',
  },
  teal: {
    bg: '#F0FDF9', text: '#107569', dot: '#15B79E', border: '#99F6E0',
    outlineBg: '#FFFFFF', outlineText: '#107569', outlineBorder: '#99F6E0',
  },
  cyan: {
    bg: '#ECFDFF', text: '#0E7090', dot: '#06AED4', border: '#A5F0FC',
    outlineBg: '#FFFFFF', outlineText: '#0E7090', outlineBorder: '#A5F0FC',
  },
  error: {
    bg: '#FEF3F2', text: '#B42318', dot: '#F04438', border: '#FECDCA',
    outlineBg: '#FFFFFF', outlineText: '#B42318', outlineBorder: '#FECDCA',
  },
  warning: {
    bg: '#FFFAEB', text: '#B54708', dot: '#F79009', border: '#FEDF89',
    outlineBg: '#FFFFFF', outlineText: '#B54708', outlineBorder: '#FEDF89',
  },
  success: {
    bg: '#ECFDF3', text: '#067647', dot: '#17B26A', border: '#ABEFC6',
    outlineBg: '#FFFFFF', outlineText: '#067647', outlineBorder: '#ABEFC6',
  },
};

// ─── Size Tokens ──────────────────────────────────────────────────────────────

const sizeTokens: Record<BadgeSize, {
  paddingX: string;
  paddingY: string;
  fontSize: string;
  lineHeight: string;
  gap: string;
  dotSize: string;
  iconSize: string;
}> = {
  sm: {
    paddingX: '6px', paddingY: '2px',
    fontSize: '12px', lineHeight: '18px',
    gap: '4px', dotSize: '6px', iconSize: '12px',
  },
  md: {
    paddingX: '8px', paddingY: '2px',
    fontSize: '12px', lineHeight: '18px',
    gap: '4px', dotSize: '6px', iconSize: '12px',
  },
  lg: {
    paddingX: '10px', paddingY: '4px',
    fontSize: '14px', lineHeight: '20px',
    gap: '6px', dotSize: '8px', iconSize: '14px',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Badge: React.FC<BadgeProps> = ({
  size = 'md',
  color = 'gray',
  badgeStyle = 'filled',
  label,
  dot = false,
  leadingIcon,
  trailingIcon,
  onRemove,
  style,
  className,
}) => {
  const sz = sizeTokens[size];
  const ct = colorTokens[color];
  const isPill = badgeStyle === 'pill-filled' || badgeStyle === 'pill-outline';
  const isOutline = badgeStyle === 'outline' || badgeStyle === 'pill-outline';

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: sz.gap,
    paddingLeft: sz.paddingX,
    paddingRight: onRemove ? '4px' : sz.paddingX,
    paddingTop: sz.paddingY,
    paddingBottom: sz.paddingY,
    borderRadius: isPill ? '9999px' : '6px',
    border: `1px solid ${isOutline ? ct.outlineBorder : ct.border}`,
    backgroundColor: isOutline ? ct.outlineBg : ct.bg,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: sz.fontSize,
    lineHeight: sz.lineHeight,
    fontWeight: 500,
    color: isOutline ? ct.outlineText : ct.text,
    whiteSpace: 'nowrap',
    ...style,
  };

  const dotStyle: React.CSSProperties = {
    width: sz.dotSize,
    height: sz.dotSize,
    borderRadius: '50%',
    backgroundColor: ct.dot,
    flexShrink: 0,
  };

  const iconStyle: React.CSSProperties = {
    width: sz.iconSize,
    height: sz.iconSize,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: isOutline ? ct.outlineText : ct.text,
  };

  const removeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    cursor: 'pointer',
    color: isOutline ? ct.outlineText : ct.text,
    opacity: 0.5,
    background: 'none',
    border: 'none',
    padding: 0,
    marginLeft: '2px',
  };

  return (
    <span style={containerStyle} className={className}>
      {dot && <span style={dotStyle} />}
      {leadingIcon && <span style={iconStyle}>{leadingIcon}</span>}
      <span>{label}</span>
      {trailingIcon && <span style={iconStyle}>{trailingIcon}</span>}
      {onRemove && (
        <button onClick={onRemove} style={removeStyle} aria-label="Remove">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M7.5 2.5l-5 5M2.5 2.5l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
};

// ─── Notification Badge (inline count) ───────────────────────────────────────

export interface NotificationBadgeProps {
  count: number;
  max?: number;
  color?: 'brand' | 'error' | 'gray';
  style?: React.CSSProperties;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  color = 'error',
  style,
}) => {
  const label = count > max ? `${max}+` : String(count);

  const colorMap = {
    brand: { bg: '#7F56D9', text: '#FFFFFF' },
    error: { bg: '#D92D20', text: '#FFFFFF' },
    gray: { bg: '#344054', text: '#FFFFFF' },
  };

  const { bg, text } = colorMap[color];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: label.length > 1 ? '20px' : '18px',
        height: '18px',
        padding: label.length > 1 ? '0 5px' : '0',
        borderRadius: '9999px',
        backgroundColor: bg,
        color: text,
        fontSize: '11px',
        lineHeight: '16px',
        fontWeight: 500,
        fontFamily: 'Inter, system-ui, sans-serif',
        ...style,
      }}
    >
      {label}
    </span>
  );
};

// ─── Alert Badge (text label with icon) ──────────────────────────────────────

export type AlertBadgeType = 'neutral' | 'brand' | 'error' | 'warning' | 'success';

export interface AlertBadgeProps {
  type?: AlertBadgeType;
  message: string;
  action?: string;
  onAction?: () => void;
}

const alertBadgeColors: Record<AlertBadgeType, { bg: string; text: string; border: string; iconColor: string }> = {
  neutral: { bg: '#F9FAFB', text: '#344054', border: '#EAECF0', iconColor: '#667085' },
  brand: { bg: '#F9F5FF', text: '#6941C6', border: '#E9D7FE', iconColor: '#7F56D9' },
  error: { bg: '#FEF3F2', text: '#B42318', border: '#FECDCA', iconColor: '#F04438' },
  warning: { bg: '#FFFAEB', text: '#B54708', border: '#FEDF89', iconColor: '#F79009' },
  success: { bg: '#ECFDF3', text: '#067647', border: '#ABEFC6', iconColor: '#17B26A' },
};

export const AlertBadge: React.FC<AlertBadgeProps> = ({
  type = 'neutral',
  message,
  action,
  onAction,
}) => {
  const c = alertBadgeColors[type];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 10px 4px 8px',
        borderRadius: '9999px',
        border: `1px solid ${c.border}`,
        backgroundColor: c.bg,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        lineHeight: '20px',
        color: c.text,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: c.iconColor, flexShrink: 0 }}>
        <path d="M8 5.33v2.67M8 10.67h.007M14.667 8A6.667 6.667 0 1 1 1.333 8a6.667 6.667 0 0 1 13.334 0Z"
          stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{message}</span>
      {action && onAction && (
        <button
          onClick={onAction}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: c.text,
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'inherit',
            textDecoration: 'underline',
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
};
