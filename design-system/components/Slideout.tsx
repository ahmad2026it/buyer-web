import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SlideoutSide = 'right' | 'left';
export type SlideoutSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface SlideoutProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  side?: SlideoutSide;
  size?: SlideoutSize;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdrop?: boolean;
  showClose?: boolean;
}

// ─── Size Map ─────────────────────────────────────────────────────────────────

const sizeMap: Record<SlideoutSize, string> = {
  sm:   '360px',
  md:   '480px',
  lg:   '640px',
  xl:   '768px',
  full: '100vw',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Slideout: React.FC<SlideoutProps> = ({
  open,
  onClose,
  title,
  description,
  side = 'right',
  size = 'md',
  children,
  footer,
  closeOnBackdrop = true,
  showClose = true,
}) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, bottom: 0,
    [side]: 0,
    width: sizeMap[size],
    maxWidth: '100vw',
    backgroundColor: '#FFFFFF',
    boxShadow: side === 'right'
      ? '-20px 0px 60px -10px rgba(16, 24, 40, 0.15)'
      : '20px 0px 60px -10px rgba(16, 24, 40, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1001,
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
      {/* Backdrop */}
      <div
        onClick={closeOnBackdrop ? onClose : undefined}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(52, 64, 84, 0.7)', backdropFilter: 'blur(8px)' }}
      />

      {/* Panel */}
      <div role="dialog" aria-modal="true" aria-labelledby={title ? 'slideout-title' : undefined} style={panelStyle}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #EAECF0', flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
            {title && (
              <h2 id="slideout-title" style={{ margin: 0, fontSize: '18px', lineHeight: '28px', fontWeight: 600, color: '#101828' }}>
                {title}
              </h2>
            )}
            {description && (
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '20px', color: '#475467' }}>
                {description}
              </p>
            )}
          </div>
          {showClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                flexShrink: 0, width: '44px', height: '44px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', background: 'none', cursor: 'pointer',
                color: '#667085', borderRadius: '8px',
                margin: '-10px -10px 0 0',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{ borderTop: '1px solid #EAECF0', padding: '16px 24px', flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
