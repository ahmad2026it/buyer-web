import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

// ─── Default Empty Icon ───────────────────────────────────────────────────────

const DefaultIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="8" fill="#F2F4F7" />
    <path d="M13 27l4-4 4 4 4-5 4 5M13 13h14v14H13V13z" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actions,
  size = 'md',
  style,
}) => {
  const sizes = {
    sm: { gap: '12px', iconSize: '40px', titleSize: '14px', titleLine: '20px', descSize: '14px', descLine: '20px' },
    md: { gap: '16px', iconSize: '56px', titleSize: '16px', titleLine: '24px', descSize: '14px', descLine: '20px' },
    lg: { gap: '20px', iconSize: '64px', titleSize: '18px', titleLine: '28px', descSize: '16px', descLine: '24px' },
  };
  const sz = sizes[size];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: sz.gap,
      padding: size === 'lg' ? '48px 24px' : size === 'md' ? '32px 24px' : '24px',
      fontFamily: 'Inter, system-ui, sans-serif',
      ...style,
    }}>
      <div style={{ width: sz.iconSize, height: sz.iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon || <DefaultIcon />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '360px' }}>
        <h3 style={{ margin: 0, fontSize: sz.titleSize, lineHeight: sz.titleLine, fontWeight: 600, color: '#101828' }}>
          {title}
        </h3>
        {description && (
          <p style={{ margin: 0, fontSize: sz.descSize, lineHeight: sz.descLine, color: '#475467' }}>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
};
