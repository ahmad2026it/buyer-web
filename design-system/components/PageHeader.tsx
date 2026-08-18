import React from 'react';

// ─── Page Header ──────────────────────────────────────────────────────────────

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  divider?: boolean;
  style?: React.CSSProperties;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumb,
  badge,
  actions,
  tabs,
  divider = true,
  style,
}) => {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderBottom: divider ? '1px solid #EAECF0' : 'none',
      fontFamily: 'Inter, system-ui, sans-serif',
      ...style,
    }}>
      <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {breadcrumb && <div>{breadcrumb}</div>}

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '30px', lineHeight: '38px', fontWeight: 600, color: '#101828' }}>
                {title}
              </h1>
              {badge}
            </div>
            {description && (
              <p style={{ margin: 0, fontSize: '16px', lineHeight: '24px', color: '#475467' }}>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              {actions}
            </div>
          )}
        </div>

        {tabs && <div style={{ marginTop: '4px' }}>{tabs}</div>}
      </div>
      {!tabs && divider && <div style={{ height: '24px' }} />}
    </div>
  );
};

// ─── Card Header ──────────────────────────────────────────────────────────────

export interface CardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  divider?: boolean;
  style?: React.CSSProperties;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  icon,
  badge,
  actions,
  divider = true,
  style,
}) => {
  return (
    <div style={{
      padding: '20px 24px',
      borderBottom: divider ? '1px solid #EAECF0' : 'none',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '16px',
      fontFamily: 'Inter, system-ui, sans-serif',
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', minWidth: 0 }}>
        {icon && (
          <div style={{
            width: '48px', height: '48px',
            borderRadius: '10px',
            border: '1px solid #EAECF0',
            boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, backgroundColor: '#FFFFFF',
          }}>
            {icon}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', lineHeight: '28px', fontWeight: 600, color: '#101828' }}>
              {title}
            </h3>
            {badge}
          </div>
          {description && (
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '20px', color: '#475467' }}>
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────

export interface SectionHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center';
  style?: React.CSSProperties;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  size = 'md',
  align = 'left',
  style,
}) => {
  const sizes = {
    sm: { title: '20px', titleLine: '30px', desc: '14px', descLine: '20px', gap: '4px' },
    md: { title: '24px', titleLine: '32px', desc: '16px', descLine: '24px', gap: '8px' },
    lg: { title: '30px', titleLine: '38px', desc: '18px', descLine: '28px', gap: '12px' },
  };
  const sz = sizes[size];

  return (
    <div style={{
      display: 'flex',
      flexDirection: align === 'center' ? 'column' : 'row',
      alignItems: align === 'center' ? 'center' : 'flex-start',
      justifyContent: 'space-between',
      gap: '16px',
      fontFamily: 'Inter, system-ui, sans-serif',
      textAlign: align,
      ...style,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: sz.gap }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
          <h2 style={{ margin: 0, fontSize: sz.title, lineHeight: sz.titleLine, fontWeight: 600, color: '#101828' }}>
            {title}
          </h2>
          {badge}
        </div>
        {description && (
          <p style={{ margin: 0, fontSize: sz.desc, lineHeight: sz.descLine, color: '#475467' }}>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
};

// ─── Section Footer ───────────────────────────────────────────────────────────

export interface SectionFooterProps {
  children?: React.ReactNode;
  align?: 'left' | 'right' | 'between';
  divider?: boolean;
  style?: React.CSSProperties;
}

export const SectionFooter: React.FC<SectionFooterProps> = ({
  children,
  align = 'right',
  divider = true,
  style,
}) => {
  const justifyMap = { left: 'flex-start', right: 'flex-end', between: 'space-between' };

  return (
    <div style={{
      padding: '16px 24px',
      borderTop: divider ? '1px solid #EAECF0' : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: justifyMap[align],
      gap: '12px',
      fontFamily: 'Inter, system-ui, sans-serif',
      ...style,
    }}>
      {children}
    </div>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────

export interface CardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  padding?: string;
  shadow?: 'none' | 'xs' | 'sm' | 'md';
  style?: React.CSSProperties;
}

const shadowMap = {
  none: 'none',
  xs: '0px 1px 2px rgba(16, 24, 40, 0.05)',
  sm: '0px 1px 3px rgba(16, 24, 40, 0.10), 0px 1px 2px rgba(16, 24, 40, 0.06)',
  md: '0px 4px 8px -2px rgba(16, 24, 40, 0.10), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
};

export const Card: React.FC<CardProps> = ({
  header,
  footer,
  children,
  padding = '24px',
  shadow = 'sm',
  style,
}) => (
  <div style={{
    backgroundColor: '#FFFFFF',
    border: '1px solid #EAECF0',
    borderRadius: '12px',
    boxShadow: shadowMap[shadow],
    overflow: 'hidden',
    fontFamily: 'Inter, system-ui, sans-serif',
    ...style,
  }}>
    {header}
    {children && <div style={{ padding }}>{children}</div>}
    {footer}
  </div>
);
