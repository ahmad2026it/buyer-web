import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  iconVariant?: 'brand' | 'error' | 'warning' | 'success' | 'gray';
  children?: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdrop?: boolean;
  showClose?: boolean;
}

// ─── Size Map ─────────────────────────────────────────────────────────────────

const sizeMap: Record<ModalSize, string> = {
  xs:   '400px',
  sm:   '480px',
  md:   '560px',
  lg:   '640px',
  xl:   '768px',
  '2xl':'900px',
  full: 'calc(100vw - 48px)',
};

// ─── Icon Colors ──────────────────────────────────────────────────────────────

const iconVariants = {
  brand:   { bg: '#F4EBFF', border: '#E9D7FE', color: '#7F56D9' },
  error:   { bg: '#FEF3F2', border: '#FECDCA', color: '#D92D20' },
  warning: { bg: '#FFFAEB', border: '#FEDF89', color: '#DC6803' },
  success: { bg: '#ECFDF3', border: '#A9EFC5', color: '#079455' },
  gray:    { bg: '#F9FAFB', border: '#EAECF0', color: '#344054' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  size = 'md',
  title,
  description,
  icon,
  iconVariant = 'brand',
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

  const iv = iconVariants[iconVariant];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={closeOnBackdrop ? onClose : undefined}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(52, 64, 84, 0.7)', backdropFilter: 'blur(8px)' }}
      />

      {/* Panel */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: sizeMap[size],
        maxHeight: 'calc(100vh - 48px)',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        {(title || showClose || icon) && (
          <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {icon && (
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '10px',
                    backgroundColor: iv.bg, border: `1px solid ${iv.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <span style={{ color: iv.color }}>{icon}</span>
                  </div>
                )}
                {title && (
                  <h2 id="modal-title" style={{ margin: 0, fontSize: '18px', lineHeight: '28px', fontWeight: 600, color: '#101828' }}>
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
          </div>
        )}

        {/* Body */}
        {children && (
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            {children}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div style={{ padding: '0 24px 24px', borderTop: children ? '1px solid #EAECF0' : 'none', paddingTop: children ? '16px' : '24px' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
