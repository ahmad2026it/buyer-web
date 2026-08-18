import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertColor = 'brand' | 'gray' | 'error' | 'warning' | 'success';
export type AlertVariant = 'inline' | 'toast' | 'banner';

export interface AlertProps {
  title?: string;
  message: string;
  color?: AlertColor;
  variant?: AlertVariant;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
}

// ─── Color Map ────────────────────────────────────────────────────────────────

const colorMap: Record<AlertColor, { bg: string; border: string; icon: string; title: string; text: string }> = {
  brand:   { bg: '#F4EBFF', border: '#D6BBFB', icon: '#7F56D9', title: '#42307D', text: '#6941C6' },
  gray:    { bg: '#F9FAFB', border: '#EAECF0', icon: '#667085', title: '#101828', text: '#344054' },
  error:   { bg: '#FEF3F2', border: '#FECDCA', icon: '#D92D20', title: '#7A271A', text: '#B42318' },
  warning: { bg: '#FFFAEB', border: '#FEDF89', icon: '#DC6803', title: '#7A2E0E', text: '#B54708' },
  success: { bg: '#ECFDF3', border: '#A9EFC5', icon: '#079455', title: '#054F31', text: '#067647' },
};

// ─── Default Icons ────────────────────────────────────────────────────────────

const defaultIcons: Record<AlertColor, React.ReactNode> = {
  brand: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 4a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0v-3a1 1 0 0 1 1-1z" fill="currentColor" />
    </svg>
  ),
  gray: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 4a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0v-3a1 1 0 0 1 1-1z" fill="currentColor" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 4a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0V7a1 1 0 0 1 1-1zm0 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M11.732 3.077a2 2 0 0 0-3.464 0L1.34 15a2 2 0 0 0 1.732 3h13.856a2 2 0 0 0 1.732-3L11.732 3.077zM10 7a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0V8a1 1 0 0 1 1-1zm0 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor" />
    </svg>
  ),
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm3.707 6.293a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 11.586l3.293-3.293a1 1 0 0 1 1.414 0z" fill="currentColor" />
    </svg>
  ),
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Alert: React.FC<AlertProps> = ({
  title,
  message,
  color = 'brand',
  variant = 'inline',
  icon,
  actions,
  onClose,
  style,
}) => {
  const c = colorMap[color];
  const displayIcon = icon || defaultIcons[color];

  const containerStyle: React.CSSProperties = variant === 'banner'
    ? { backgroundColor: c.bg, borderBottom: `1px solid ${c.border}`, padding: '12px 24px' }
    : variant === 'toast'
    ? {
        backgroundColor: '#FFFFFF',
        border: '1px solid #EAECF0',
        borderRadius: '12px',
        boxShadow: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
        padding: '16px',
      }
    : {
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '12px',
        padding: '16px',
      };

  return (
    <div role="alert" style={{ ...containerStyle, display: 'flex', gap: '12px', alignItems: 'flex-start', fontFamily: 'Inter, system-ui, sans-serif', ...style }}>
      {/* Icon */}
      <span style={{ color: variant === 'toast' ? c.icon : c.icon, flexShrink: 0, marginTop: '2px' }}>
        {displayIcon}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 600, color: variant === 'toast' ? '#101828' : c.title, marginBottom: message ? '4px' : '0' }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: '14px', lineHeight: '20px', color: variant === 'toast' ? '#475467' : c.text }}>
          {message}
        </div>
        {actions && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {actions}
          </div>
        )}
      </div>

      {/* Close */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          style={{
            flexShrink: 0, width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', background: 'none', cursor: 'pointer',
            color: variant === 'toast' ? '#667085' : c.text,
            borderRadius: '8px',
            margin: '-8px -8px 0 0',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ─── Toast Stack ──────────────────────────────────────────────────────────────

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  color?: AlertColor;
  icon?: React.ReactNode;
}

export interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const positionMap: Record<NonNullable<ToastStackProps['position']>, React.CSSProperties> = {
  'top-right':     { top: '24px', right: '24px' },
  'top-left':      { top: '24px', left: '24px' },
  'bottom-right':  { bottom: '24px', right: '24px' },
  'bottom-left':   { bottom: '24px', left: '24px' },
  'top-center':    { top: '24px', left: '50%', transform: 'translateX(-50%)' },
  'bottom-center': { bottom: '24px', left: '50%', transform: 'translateX(-50%)' },
};

export const ToastStack: React.FC<ToastStackProps> = ({ toasts, onDismiss, position = 'top-right' }) => (
  <div style={{
    position: 'fixed',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '400px',
    maxWidth: 'calc(100vw - 48px)',
    ...positionMap[position],
  }}>
    {toasts.map(t => (
      <Alert
        key={t.id}
        title={t.title}
        message={t.message}
        color={t.color}
        icon={t.icon}
        variant="toast"
        onClose={() => onDismiss(t.id)}
      />
    ))}
  </div>
);
