import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InlineCTAVariant = 'banner' | 'card' | 'strip';
export type InlineCTAColor = 'brand' | 'gray' | 'dark';

export interface InlineCTAProps {
  title: string;
  description?: string;
  primaryAction?: { label: string; onClick?: () => void; href?: string };
  secondaryAction?: { label: string; onClick?: () => void; href?: string };
  icon?: React.ReactNode;
  image?: string;
  variant?: InlineCTAVariant;
  color?: InlineCTAColor;
  onClose?: () => void;
  style?: React.CSSProperties;
}

// ─── Color Themes ─────────────────────────────────────────────────────────────

const themes = {
  brand: { bg: '#F4EBFF', border: '#D6BBFB', title: '#42307D', desc: '#6941C6', primary: { bg: '#7F56D9', color: '#FFFFFF', border: '#7F56D9' }, secondary: { bg: 'transparent', color: '#6941C6', border: '#D6BBFB' } },
  gray:  { bg: '#F9FAFB', border: '#EAECF0', title: '#101828', desc: '#475467', primary: { bg: '#101828', color: '#FFFFFF', border: '#101828' }, secondary: { bg: 'transparent', color: '#344054', border: '#D0D5DD' } },
  dark:  { bg: '#101828', border: '#1D2939', title: '#FFFFFF', desc: '#98A2B3', primary: { bg: '#7F56D9', color: '#FFFFFF', border: '#7F56D9' }, secondary: { bg: 'transparent', color: '#CECFD2', border: '#344054' } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const InlineCTA: React.FC<InlineCTAProps> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  icon,
  image,
  variant = 'card',
  color = 'brand',
  onClose,
  style,
}) => {
  const t = themes[color];

  const btnStyle = (type: 'primary' | 'secondary'): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    height: '40px', padding: '0 16px',
    borderRadius: '8px',
    border: `1px solid ${t[type].border}`,
    backgroundColor: t[type].bg,
    color: t[type].color,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px', lineHeight: '20px', fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
  });

  const stripStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
    padding: '12px 24px',
    backgroundColor: t.bg,
    borderTop: `1px solid ${t.border}`,
    borderBottom: `1px solid ${t.border}`,
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const cardStyle: React.CSSProperties = {
    display: 'flex', gap: '24px', alignItems: 'center',
    padding: '24px',
    backgroundColor: t.bg,
    border: `1px solid ${t.border}`,
    borderRadius: '16px',
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const bannerStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
    padding: '16px 24px',
    backgroundColor: t.bg,
    border: `1px solid ${t.border}`,
    borderRadius: '12px',
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const Content = () => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 600, color: t.title }}>{title}</div>
      {description && <p style={{ margin: '4px 0 0', fontSize: '14px', lineHeight: '20px', color: t.desc }}>{description}</p>}
    </div>
  );

  const Actions = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
      {secondaryAction && (
        secondaryAction.href ? (
          <a href={secondaryAction.href} style={btnStyle('secondary')}>{secondaryAction.label}</a>
        ) : (
          <button onClick={secondaryAction.onClick} style={btnStyle('secondary')}>{secondaryAction.label}</button>
        )
      )}
      {primaryAction && (
        primaryAction.href ? (
          <a href={primaryAction.href} style={btnStyle('primary')}>{primaryAction.label}</a>
        ) : (
          <button onClick={primaryAction.onClick} style={btnStyle('primary')}>{primaryAction.label}</button>
        )
      )}
    </div>
  );

  const CloseBtn = () => onClose ? (
    <button
      onClick={onClose}
      style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer', color: t.desc, borderRadius: '8px', flexShrink: 0 }}
      aria-label="Dismiss"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" />
      </svg>
    </button>
  ) : null;

  if (variant === 'strip') {
    return (
      <div style={{ ...stripStyle, ...style }}>
        {icon && <span style={{ color: t.desc, flexShrink: 0 }}>{icon}</span>}
        <Content />
        <Actions />
        <CloseBtn />
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div style={{ ...bannerStyle, ...style }}>
        {icon && <span style={{ color: t.desc, flexShrink: 0 }}>{icon}</span>}
        <Content />
        <Actions />
        <CloseBtn />
      </div>
    );
  }

  // card
  return (
    <div style={{ ...cardStyle, ...style }}>
      {icon && (
        <div style={{ width: '48px', height: '48px', borderRadius: '10px', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
      )}
      {image && (
        <img src={image} alt="" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
      )}
      <Content />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
        <Actions />
        {onClose && <CloseBtn />}
      </div>
    </div>
  );
};
